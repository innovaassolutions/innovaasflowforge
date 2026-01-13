/**
 * Admin Billing Export API
 *
 * Exports usage data as CSV or JSON.
 * Admin-only endpoint.
 * Story: billing-4-4-implement-export-functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface UsageEvent {
  created_at: string | null
  tenant_id: string | null
  model_used: string | null
  input_tokens: number | null
  output_tokens: number | null
  tokens_used: number | null
  cost_cents: number | null
  event_type: string | null
}

interface TenantProfile {
  id: string
  display_name: string | null
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
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    let query = supabaseAdmin
      .from('usage_events')
      .select('created_at, tenant_id, model_used, input_tokens, output_tokens, tokens_used, cost_cents, event_type')
      .order('created_at', { ascending: false })

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching usage events:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const usageEvents = events as UsageEvent[] | null

    // Get tenant names
    const tenantIds = [...new Set(usageEvents?.map((e) => e.tenant_id).filter(Boolean) || [])]
    const { data: tenantsData } = await supabaseAdmin
      .from('tenant_profiles')
      .select('id, display_name')
      .in('id', tenantIds)

    const tenants = tenantsData as TenantProfile[] | null
    const tenantMap = new Map(tenants?.map((t) => [t.id, t.display_name || 'Unknown']) || [])

    // Format date for filename
    const dateStr = new Date().toISOString().split('T')[0]

    if (format === 'json') {
      // JSON export
      const jsonData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          dateRange: {
            start: startDate || 'all',
            end: endDate || 'all',
          },
          totalRecords: usageEvents?.length || 0,
        },
        data: usageEvents?.map((e) => ({
          date: e.created_at?.split('T')[0] || '',
          time: e.created_at?.split('T')[1]?.split('.')[0] || '',
          tenantId: e.tenant_id || '',
          tenantName: e.tenant_id ? tenantMap.get(e.tenant_id) || 'Unknown' : 'Platform',
          modelUsed: e.model_used || '',
          eventType: e.event_type || '',
          inputTokens: e.input_tokens || 0,
          outputTokens: e.output_tokens || 0,
          totalTokens: e.tokens_used || 0,
          costCents: e.cost_cents || 0,
          costDollars: ((e.cost_cents || 0) / 100).toFixed(4),
        })) || [],
      }

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="billing-export-${dateStr}.json"`,
        },
      })
    } else {
      // CSV export
      const csvRows: string[] = []

      // Header row
      csvRows.push(
        'date,time,tenant_id,tenant_name,model_used,event_type,input_tokens,output_tokens,total_tokens,cost_cents,cost_dollars'
      )

      // Data rows
      usageEvents?.forEach((e) => {
        const date = e.created_at?.split('T')[0] || ''
        const time = e.created_at?.split('T')[1]?.split('.')[0] || ''
        const tenantId = e.tenant_id || ''
        const tenantName = e.tenant_id ? tenantMap.get(e.tenant_id) || 'Unknown' : 'Platform'
        const modelUsed = e.model_used || ''
        const eventType = e.event_type || ''
        const inputTokens = e.input_tokens || 0
        const outputTokens = e.output_tokens || 0
        const totalTokens = e.tokens_used || 0
        const costCents = e.cost_cents || 0
        const costDollars = ((e.cost_cents || 0) / 100).toFixed(4)

        // Escape values that might contain commas
        const escapeCsv = (val: string) =>
          val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val

        csvRows.push(
          [
            date,
            time,
            tenantId,
            escapeCsv(tenantName),
            escapeCsv(modelUsed),
            eventType,
            inputTokens,
            outputTokens,
            totalTokens,
            costCents,
            costDollars,
          ].join(',')
        )
      })

      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="billing-export-${dateStr}.csv"`,
        },
      })
    }
  } catch (error) {
    console.error('Admin billing export error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
