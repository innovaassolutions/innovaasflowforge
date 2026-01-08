/**
 * Admin Stats API
 *
 * Returns overview statistics for the admin dashboard.
 * Admin-only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

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

    // Calculate metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const activeUsers = usersResult.data?.filter(
      (u) => u.last_seen_at && u.last_seen_at > thirtyDaysAgo
    ).length || 0

    const tenantCounts = {
      coaches: tenantsResult.data?.filter((t) => t.tenant_type === 'coach').length || 0,
      consultants: tenantsResult.data?.filter((t) => t.tenant_type === 'consultant').length || 0,
      schools: tenantsResult.data?.filter((t) => t.tenant_type === 'school').length || 0,
      active: tenantsResult.data?.filter((t) => t.is_active).length || 0,
    }

    const completedSessions =
      coachingSessionsResult.data?.filter((s) => s.client_status === 'completed').length || 0

    const completedCampaigns =
      campaignsResult.data?.filter((c) => c.status === 'completed').length || 0

    const totalTokens =
      usageResult.data?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0
    const totalCost =
      usageResult.data?.reduce((sum, e) => sum + (e.cost_cents || 0), 0) || 0

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
