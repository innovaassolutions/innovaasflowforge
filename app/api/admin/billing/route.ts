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
  revenue_override_cents: number | null
}

interface SubscriptionTier {
  id: string
  price_cents_monthly: number
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

    // Get tenant details with revenue override
    const tenantIds = Object.keys(byTenantMap)
    const { data: tenantsData } = await supabaseAdmin
      .from('tenant_profiles')
      .select('id, display_name, tenant_type, subscription_tier, revenue_override_cents')
      .in('id', tenantIds)

    const tenants = tenantsData as TenantProfile[] | null
    const tenantMap = new Map(tenants?.map((t) => [t.id, t]) || [])

    // Fetch subscription tier prices for margin calculation
    const { data: tiersData } = await supabaseAdmin
      .from('subscription_tiers')
      .select('id, price_cents_monthly')

    const tiers = tiersData as SubscriptionTier[] | null
    const tierPriceMap = new Map(tiers?.map((t) => [t.id, t.price_cents_monthly]) || [])

    const byTenant = Object.entries(byTenantMap).map(([id, data]) => {
      const tenant = tenantMap.get(id)
      const tierName = tenant?.subscription_tier || 'starter'

      // Calculate revenue: use override if set, otherwise use tier price
      const tierPrice = tierPriceMap.get(tierName) || 0
      const revenueCents = tenant?.revenue_override_cents ?? tierPrice

      // Calculate margin
      const marginCents = revenueCents - data.total_cost_cents
      const marginPercentage = revenueCents > 0
        ? Math.round((marginCents / revenueCents) * 100)
        : 0

      return {
        tenant_id: id,
        tenant_name: tenant?.display_name || 'Unknown',
        tenant_type: tenant?.tenant_type || 'unknown',
        subscription_tier: tierName,
        revenue_cents: revenueCents,
        margin_cents: marginCents,
        margin_percentage: marginPercentage,
        has_revenue_override: tenant?.revenue_override_cents !== null,
        is_negative_margin: marginCents < 0,
        is_low_margin: marginPercentage > 0 && marginPercentage < 20,
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

    // Aggregate by day for trend chart (with provider breakdown)
    const getProviderForTrend = (model: string | null): string => {
      if (!model) return 'other'
      const m = model.toLowerCase()
      if (m.includes('claude') || m.includes('anthropic')) return 'anthropic'
      if (m.includes('gpt') || m.includes('openai') || m.includes('o1') || m.includes('o3')) return 'openai'
      if (m.includes('gemini') || m.includes('google') || m.includes('palm')) return 'google'
      return 'other'
    }

    const byDayMap: Record<string, {
      total_cost_cents: number
      anthropic: number
      openai: number
      google: number
      other: number
    }> = {}

    events?.forEach((e) => {
      const day = e.created_at?.substring(0, 10) || 'unknown' // YYYY-MM-DD
      if (!byDayMap[day]) {
        byDayMap[day] = { total_cost_cents: 0, anthropic: 0, openai: 0, google: 0, other: 0 }
      }
      const cost = e.cost_cents || 0
      byDayMap[day].total_cost_cents += cost
      const provider = getProviderForTrend(e.model_used)
      byDayMap[day][provider as 'anthropic' | 'openai' | 'google' | 'other'] += cost
    })

    const dailyTrend = Object.entries(byDayMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

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

    // Convert to array format for byModel (sorted by cost descending)
    const byModel = Object.entries(byModelMap)
      .map(([model, data]) => ({
        model,
        ...data,
      }))
      .sort((a, b) => b.total_cost_cents - a.total_cost_cents)

    // Aggregate by provider (derive from model name)
    const getProvider = (model: string | null): string => {
      if (!model) return 'Unknown'
      const m = model.toLowerCase()
      if (m.includes('claude') || m.includes('anthropic')) return 'Anthropic'
      if (m.includes('gpt') || m.includes('openai') || m.includes('o1') || m.includes('o3')) return 'OpenAI'
      if (m.includes('gemini') || m.includes('google') || m.includes('palm')) return 'Google'
      if (m.includes('llama') || m.includes('meta')) return 'Meta'
      if (m.includes('mistral')) return 'Mistral'
      return 'Other'
    }

    const byProviderMap: Record<string, { total_tokens: number; total_cost_cents: number; event_count: number }> = {}
    events?.forEach((e) => {
      const provider = getProvider(e.model_used)
      if (!byProviderMap[provider]) {
        byProviderMap[provider] = { total_tokens: 0, total_cost_cents: 0, event_count: 0 }
      }
      byProviderMap[provider].total_tokens += e.tokens_used || 0
      byProviderMap[provider].total_cost_cents += e.cost_cents || 0
      byProviderMap[provider].event_count++
    })

    const totalProviderCost = Object.values(byProviderMap).reduce((sum, p) => sum + p.total_cost_cents, 0)
    const byProvider = Object.entries(byProviderMap)
      .map(([provider, data]) => ({
        provider,
        ...data,
        percentage: totalProviderCost > 0 ? Math.round((data.total_cost_cents / totalProviderCost) * 100) : 0,
      }))
      .sort((a, b) => b.total_cost_cents - a.total_cost_cents)

    // Calculate totals
    const totalTokens = events?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0
    const totalCost = events?.reduce((sum, e) => sum + (e.cost_cents || 0), 0) || 0
    const uniqueTenants = Object.keys(byTenantMap).length

    // Calculate total revenue and margin across all tenants
    const totalRevenue = byTenant.reduce((sum, t) => sum + t.revenue_cents, 0)
    const totalMargin = byTenant.reduce((sum, t) => sum + t.margin_cents, 0)
    const overallMarginPercentage = totalRevenue > 0
      ? Math.round((totalMargin / totalRevenue) * 100)
      : 0
    const tenantsWithNegativeMargin = byTenant.filter(t => t.is_negative_margin).length
    const tenantsWithLowMargin = byTenant.filter(t => t.is_low_margin).length

    return NextResponse.json({
      summary: {
        totalEvents: events?.length || 0,
        totalTokens,
        totalCostCents: totalCost,
        totalCostDollars: (totalCost / 100).toFixed(2),
        uniqueTenants,
        totalRevenueCents: totalRevenue,
        totalRevenueDollars: (totalRevenue / 100).toFixed(2),
        totalMarginCents: totalMargin,
        totalMarginDollars: (totalMargin / 100).toFixed(2),
        overallMarginPercentage,
        tenantsWithNegativeMargin,
        tenantsWithLowMargin,
      },
      byType,
      byTenant,
      byMonth,
      byModel,
      byProvider,
      dailyTrend,
    })
  } catch (error) {
    console.error('Admin billing error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
