/**
 * Admin Stats API
 *
 * Returns overview statistics for the admin dashboard.
 * Admin-only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface UserProfileRow {
  id: string
  last_seen_at: string | null
}

interface TenantRow {
  tenant_type: string | null
  is_active: boolean | null
}

interface SessionRow {
  client_status: string | null
}

interface CampaignRow {
  status: string | null
}

interface UsageRow {
  tokens_used: number | null
  cost_cents: number | null
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all stats in parallel
    const [
      usersResult,
      tenantsResult,
      coachingSessionsResult,
      campaignsResult,
      usageResult,
      loginsResult,
    ] = await Promise.all([
      // Total users
      supabaseAdmin.from('user_profiles').select('id, last_seen_at', { count: 'exact' }),
      // Tenants by type
      supabaseAdmin.from('tenant_profiles').select('tenant_type, is_active'),
      // Coaching sessions
      supabaseAdmin.from('coaching_sessions').select('client_status', { count: 'exact' }),
      // Campaigns
      supabaseAdmin.from('campaigns').select('status', { count: 'exact' }),
      // Usage events (tokens and cost)
      supabaseAdmin.from('usage_events').select('tokens_used, cost_cents'),
      // Recent logins (24h)
      supabaseAdmin
        .from('login_history')
        .select('id', { count: 'exact' })
        .gte('login_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ])

    // Type assertions for query results
    const users = usersResult.data as UserProfileRow[] | null
    const tenants = tenantsResult.data as TenantRow[] | null
    const sessions = coachingSessionsResult.data as SessionRow[] | null
    const campaigns = campaignsResult.data as CampaignRow[] | null
    const usage = usageResult.data as UsageRow[] | null

    // Calculate metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const activeUsers = users?.filter(
      (u) => u.last_seen_at && u.last_seen_at > thirtyDaysAgo
    ).length || 0

    const tenantCounts = {
      coaches: tenants?.filter((t) => t.tenant_type === 'coach').length || 0,
      consultants: tenants?.filter((t) => t.tenant_type === 'consultant').length || 0,
      schools: tenants?.filter((t) => t.tenant_type === 'school').length || 0,
      active: tenants?.filter((t) => t.is_active).length || 0,
    }

    const completedSessions =
      sessions?.filter((s) => s.client_status === 'completed').length || 0

    const completedCampaigns =
      campaigns?.filter((c) => c.status === 'completed').length || 0

    const totalTokens =
      usage?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0
    const totalCost =
      usage?.reduce((sum, e) => sum + (e.cost_cents || 0), 0) || 0

    return NextResponse.json({
      users: {
        total: usersResult.count || 0,
        active30d: activeUsers,
      },
      tenants: tenantCounts,
      sessions: {
        total: coachingSessionsResult.count || 0,
        completed: completedSessions,
      },
      campaigns: {
        total: campaignsResult.count || 0,
        completed: completedCampaigns,
      },
      usage: {
        totalTokens,
        totalCostCents: totalCost,
        totalCostDollars: (totalCost / 100).toFixed(2),
      },
      recentLogins24h: loginsResult.count || 0,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
