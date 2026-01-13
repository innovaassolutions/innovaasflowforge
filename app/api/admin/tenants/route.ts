/**
 * Admin Tenants API
 *
 * Returns tenant profiles with session/campaign counts by type.
 * Admin-only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface TenantRecord {
  id: string
  slug: string | null
  display_name: string | null
  tenant_type: string | null
  subscription_tier: string | null
  tier_id: string | null
  usage_limit_override: number | null
  billing_period_start: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  user_id: string | null
  custom_domain: string | null
  user_profiles: {
    email: string | null
    full_name: string | null
    last_seen_at: string | null
  } | null
  subscription_tiers: {
    id: string
    name: string
    display_name: string | null
    monthly_token_limit: number | null
  } | null
}

interface SessionRecord {
  tenant_id: string
  client_status: string | null
}

interface CampaignRecord {
  tenant_id: string
  status: string | null
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const tenantType = searchParams.get('type') // 'coach', 'consultant', 'school'
    const search = searchParams.get('search')

    // Fetch tenants (left join user_profiles and subscription_tiers)
    let query = supabaseAdmin
      .from('tenant_profiles')
      .select(`
        id, slug, display_name, tenant_type,
        subscription_tier, tier_id, usage_limit_override, billing_period_start,
        is_active, created_at, updated_at,
        user_id, custom_domain,
        user_profiles(email, full_name, last_seen_at),
        subscription_tiers(id, name, display_name, monthly_token_limit)
      `)
      .order('created_at', { ascending: false })

    if (tenantType) {
      query = query.eq('tenant_type', tenantType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tenants:', error)
      return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
    }

    const tenants = data as TenantRecord[] | null

    // Get session counts for each tenant
    const tenantIds = tenants?.map((t) => t.id) || []

    // Only query sessions/campaigns if we have tenants (empty .in() can fail)
    let sessions: SessionRecord[] | null = null
    let campaignData: CampaignRecord[] | null = null

    if (tenantIds.length > 0) {
      const [sessionResult, campaignResult] = await Promise.all([
        supabaseAdmin
          .from('coaching_sessions')
          .select('tenant_id, client_status')
          .in('tenant_id', tenantIds),
        supabaseAdmin
          .from('campaigns')
          .select('tenant_id, status')
          .in('tenant_id', tenantIds),
      ])
      sessions = sessionResult.data as SessionRecord[] | null
      campaignData = campaignResult.data as CampaignRecord[] | null
    }

    // Map session counts
    const sessionCounts = new Map<string, { total: number; completed: number }>()
    sessions?.forEach((s) => {
      if (!sessionCounts.has(s.tenant_id)) {
        sessionCounts.set(s.tenant_id, { total: 0, completed: 0 })
      }
      const counts = sessionCounts.get(s.tenant_id)!
      counts.total++
      if (s.client_status === 'completed') {
        counts.completed++
      }
    })

    // Map campaign counts
    const campaignCounts = new Map<string, { total: number; completed: number }>()
    campaignData?.forEach((c) => {
      if (!campaignCounts.has(c.tenant_id)) {
        campaignCounts.set(c.tenant_id, { total: 0, completed: 0 })
      }
      const counts = campaignCounts.get(c.tenant_id)!
      counts.total++
      if (c.status === 'completed') {
        counts.completed++
      }
    })

    // Enrich tenants with counts and tier info
    let enrichedTenants = tenants?.map((tenant) => {
      // Calculate effective usage limit (override takes precedence)
      const effectiveLimit = tenant.usage_limit_override
        ?? tenant.subscription_tiers?.monthly_token_limit
        ?? null

      return {
        id: tenant.id,
        slug: tenant.slug,
        display_name: tenant.display_name,
        tenant_type: tenant.tenant_type,
        subscription_tier: tenant.subscription_tier,
        is_active: tenant.is_active,
        custom_domain: tenant.custom_domain,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
        owner: {
          email: tenant.user_profiles?.email,
          name: tenant.user_profiles?.full_name,
          last_seen_at: tenant.user_profiles?.last_seen_at,
        },
        tier: tenant.subscription_tiers
          ? {
              id: tenant.subscription_tiers.id,
              name: tenant.subscription_tiers.name,
              displayName: tenant.subscription_tiers.display_name,
              monthlyTokenLimit: tenant.subscription_tiers.monthly_token_limit,
            }
          : null,
        usageLimitOverride: tenant.usage_limit_override,
        effectiveLimit,
        billingPeriodStart: tenant.billing_period_start,
        sessions: sessionCounts.get(tenant.id) || { total: 0, completed: 0 },
        campaigns: campaignCounts.get(tenant.id) || { total: 0, completed: 0 },
      }
    })

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase()
      enrichedTenants = enrichedTenants?.filter(
        (t) =>
          t.display_name?.toLowerCase().includes(searchLower) ||
          t.slug?.toLowerCase().includes(searchLower) ||
          t.owner?.email?.toLowerCase().includes(searchLower) ||
          t.owner?.name?.toLowerCase().includes(searchLower)
      )
    }

    // Group by type for summary
    const summary = {
      coaches: enrichedTenants?.filter((t) => t.tenant_type === 'coach').length || 0,
      consultants: enrichedTenants?.filter((t) => t.tenant_type === 'consultant').length || 0,
      schools: enrichedTenants?.filter((t) => t.tenant_type === 'school').length || 0,
      active: enrichedTenants?.filter((t) => t.is_active).length || 0,
      total: enrichedTenants?.length || 0,
    }

    return NextResponse.json({
      tenants: enrichedTenants,
      summary,
    })
  } catch (error) {
    console.error('Admin tenants error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
