/**
 * Admin Billing API
 *
 * Returns usage metrics aggregated by event type, tenant, and time.
 * Admin-only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface UsageEvent {
  event_type: string | null
  tokens_used: number | null
  cost_cents: number | null
  tenant_id: string | null
  model_used: string | null
  created_at: string | null
}

interface TenantProfile {
  id: string
  display_name: string | null
  tenant_type: string | null
  subscription_tier: string | null
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const tenantId = searchParams.get('tenantId')

    // Build base query
    let query = supabaseAdmin
      .from('usage_events')
      .select('event_type, tokens_used, cost_cents, tenant_id, model_used, created_at')

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching usage events:', error)
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
    }

    const events = data as UsageEvent[] | null

    // Aggregate by event type
    const byEventType: Record<string, { count: number; tokens: number; cost: number }> = {}
    events?.forEach((e) => {
      const type = e.event_type || 'unknown'
      if (!byEventType[type]) {
        byEventType[type] = { count: 0, tokens: 0, cost: 0 }
      }
      byEventType[type].count++
      byEventType[type].tokens += e.tokens_used || 0
      byEventType[type].cost += e.cost_cents || 0
    })

    // Aggregate by tenant
    const byTenantMap: Record<string, { tokens: number; cost: number; events: number }> = {}
    events?.forEach((e) => {
      if (e.tenant_id) {
        if (!byTenantMap[e.tenant_id]) {
          byTenantMap[e.tenant_id] = { tokens: 0, cost: 0, events: 0 }
        }
        byTenantMap[e.tenant_id].tokens += e.tokens_used || 0
        byTenantMap[e.tenant_id].cost += e.cost_cents || 0
        byTenantMap[e.tenant_id].events++
      }
    })

    // Get tenant details
    const tenantIds = Object.keys(byTenantMap)
    const { data: tenantsData } = await supabaseAdmin
      .from('tenant_profiles')
      .select('id, display_name, tenant_type, subscription_tier')
      .in('id', tenantIds)

    const tenants = tenantsData as TenantProfile[] | null
    const tenantMap = new Map(tenants?.map((t) => [t.id, t]) || [])

    const byTenant = Object.entries(byTenantMap).map(([id, data]) => {
      const tenant = tenantMap.get(id)
      return {
        tenant_id: id,
        tenant_name: tenant?.display_name || 'Unknown',
        tenant_type: tenant?.tenant_type || 'unknown',
        subscription_tier: tenant?.subscription_tier || 'starter',
        ...data,
      }
    }).sort((a, b) => b.cost - a.cost) // Sort by cost descending

    // Aggregate by month
    const byMonth: Record<string, { tokens: number; cost: number; events: number }> = {}
    events?.forEach((e) => {
      const month = e.created_at?.substring(0, 7) || 'unknown' // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = { tokens: 0, cost: 0, events: 0 }
      }
      byMonth[month].tokens += e.tokens_used || 0
      byMonth[month].cost += e.cost_cents || 0
      byMonth[month].events++
    })

    const monthlyData = Object.entries(byMonth)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Aggregate by model
    const byModel: Record<string, { tokens: number; cost: number; count: number }> = {}
    events?.forEach((e) => {
      const model = e.model_used || 'unknown'
      if (!byModel[model]) {
        byModel[model] = { tokens: 0, cost: 0, count: 0 }
      }
      byModel[model].tokens += e.tokens_used || 0
      byModel[model].cost += e.cost_cents || 0
      byModel[model].count++
    })

    // Calculate totals
    const totalTokens = events?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0
    const totalCost = events?.reduce((sum, e) => sum + (e.cost_cents || 0), 0) || 0

    return NextResponse.json({
      summary: {
        totalEvents: events?.length || 0,
        totalTokens,
        totalCostCents: totalCost,
        totalCostDollars: (totalCost / 100).toFixed(2),
      },
      byEventType,
      byTenant,
      byMonth: monthlyData,
      byModel,
    })
  } catch (error) {
    console.error('Admin billing error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
