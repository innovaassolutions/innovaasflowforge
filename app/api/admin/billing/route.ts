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
    const byEventTypeMap: Record<string, { event_count: number; total_tokens: number; total_cost_cents: number }> = {}
    events?.forEach((e) => {
      const type = e.event_type || 'unknown'
      if (!byEventTypeMap[type]) {
        byEventTypeMap[type] = { event_count: 0, total_tokens: 0, total_cost_cents: 0 }
      }
      byEventTypeMap[type].event_count++
      byEventTypeMap[type].total_tokens += e.tokens_used || 0
      byEventTypeMap[type].total_cost_cents += e.cost_cents || 0
    })

    // Convert to array format for byType
    const byType = Object.entries(byEventTypeMap).map(([event_type, data]) => ({
      event_type,
      ...data,
    }))

    // Aggregate by tenant
    const byTenantMap: Record<string, { total_tokens: number; total_cost_cents: number; event_count: number }> = {}
    events?.forEach((e) => {
      if (e.tenant_id) {
        if (!byTenantMap[e.tenant_id]) {
          byTenantMap[e.tenant_id] = { total_tokens: 0, total_cost_cents: 0, event_count: 0 }
        }
        byTenantMap[e.tenant_id].total_tokens += e.tokens_used || 0
        byTenantMap[e.tenant_id].total_cost_cents += e.cost_cents || 0
        byTenantMap[e.tenant_id].event_count++
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
    }).sort((a, b) => b.total_cost_cents - a.total_cost_cents) // Sort by cost descending

    // Aggregate by month
    const byMonthMap: Record<string, { total_tokens: number; total_cost_cents: number; event_count: number }> = {}
    events?.forEach((e) => {
      const month = e.created_at?.substring(0, 7) || 'unknown' // YYYY-MM
      if (!byMonthMap[month]) {
        byMonthMap[month] = { total_tokens: 0, total_cost_cents: 0, event_count: 0 }
      }
      byMonthMap[month].total_tokens += e.tokens_used || 0
      byMonthMap[month].total_cost_cents += e.cost_cents || 0
      byMonthMap[month].event_count++
    })

    const byMonth = Object.entries(byMonthMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Aggregate by model
    const byModelMap: Record<string, { total_tokens: number; total_cost_cents: number; event_count: number }> = {}
    events?.forEach((e) => {
      const model = e.model_used || 'unknown'
      if (!byModelMap[model]) {
        byModelMap[model] = { total_tokens: 0, total_cost_cents: 0, event_count: 0 }
      }
      byModelMap[model].total_tokens += e.tokens_used || 0
      byModelMap[model].total_cost_cents += e.cost_cents || 0
      byModelMap[model].event_count++
    })

    // Convert to array format for byModel
    const byModel = Object.entries(byModelMap).map(([model, data]) => ({
      model,
      ...data,
    }))

    // Calculate totals
    const totalTokens = events?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0
    const totalCost = events?.reduce((sum, e) => sum + (e.cost_cents || 0), 0) || 0
    const uniqueTenants = Object.keys(byTenantMap).length

    return NextResponse.json({
      summary: {
        totalEvents: events?.length || 0,
        totalTokens,
        totalCostCents: totalCost,
        totalCostDollars: (totalCost / 100).toFixed(2),
        uniqueTenants,
      },
      byType,
      byTenant,
      byMonth,
      byModel,
    })
  } catch (error) {
    console.error('Admin billing error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
