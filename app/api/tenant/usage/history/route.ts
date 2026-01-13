/**
 * Tenant Usage History API
 *
 * Returns historical usage data for the authenticated tenant.
 * Includes daily aggregates and recent events.
 *
 * Story: billing-5-2-tenant-usage-history-view
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface UsageEvent {
  id: string
  created_at: string
  event_type: string | null
  input_tokens: number | null
  output_tokens: number | null
  tokens_used: number | null
  model_used: string | null
  session_id: string | null
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tenant ID
    const { data: tenant } = await (supabase
      .from('tenant_profiles') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!tenant) {
      return NextResponse.json({ error: 'No tenant profile found' }, { status: 404 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Default to last 30 days if no dates provided
    const endDate = endDateParam || new Date().toISOString().split('T')[0]
    const startDate = startDateParam || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      return d.toISOString().split('T')[0]
    })()

    // Fetch usage events for the tenant
    const { data: events, error } = await (supabaseAdmin
      .from('usage_events') as any)
      .select('id, created_at, event_type, input_tokens, output_tokens, tokens_used, model_used, session_id')
      .eq('tenant_id', tenant.id)
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 500)) as { data: UsageEvent[] | null; error: any }

    if (error) {
      console.error('Error fetching usage events:', error)
      return NextResponse.json({ error: 'Failed to fetch usage history' }, { status: 500 })
    }

    // Aggregate daily usage
    const dailyMap: Record<string, number> = {}

    // Initialize all days in range with 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap[dateStr] = 0
    }

    // Sum tokens per day
    events?.forEach((e) => {
      const date = e.created_at?.split('T')[0]
      if (date && dailyMap[date] !== undefined) {
        // Use input + output tokens if available, fallback to tokens_used
        const tokens = (e.input_tokens || 0) + (e.output_tokens || 0) || e.tokens_used || 0
        dailyMap[date] += tokens
      }
    })

    // Convert to array sorted by date
    const dailyUsage = Object.entries(dailyMap)
      .map(([date, tokens]) => ({ date, tokens }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Format recent events for response
    const recentEvents = events?.map((e) => ({
      id: e.id,
      date: e.created_at,
      eventType: e.event_type || 'unknown',
      inputTokens: e.input_tokens || 0,
      outputTokens: e.output_tokens || 0,
      totalTokens: (e.input_tokens || 0) + (e.output_tokens || 0) || e.tokens_used || 0,
      modelUsed: e.model_used || null,
      sessionId: e.session_id || null,
    })) || []

    // Calculate summary stats
    const totalTokens = dailyUsage.reduce((sum, d) => sum + d.tokens, 0)
    const avgDaily = Math.round(totalTokens / dailyUsage.length)
    const peakDay = dailyUsage.reduce(
      (max, d) => (d.tokens > max.tokens ? d : max),
      { date: '', tokens: 0 }
    )

    return NextResponse.json({
      dateRange: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalTokens,
        avgDailyTokens: avgDaily,
        peakDay: peakDay.date,
        peakTokens: peakDay.tokens,
        totalEvents: events?.length || 0,
      },
      dailyUsage,
      recentEvents,
    })
  } catch (error) {
    console.error('Tenant usage history error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
