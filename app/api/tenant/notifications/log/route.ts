/**
 * Notification Log API
 *
 * Fetches notification delivery log entries for the authenticated tenant.
 * Supports pagination via limit/offset query params.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get tenant for user
    const { data: tenant } = await (supabase
      .from('tenant_profiles') as any)
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const { data: logs, error: logsError } = await (supabase
      .from('notification_log') as any)
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (logsError) {
      console.error('[NotificationLog] Query error:', logsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
      pagination: { limit, offset },
    })
  } catch (error) {
    console.error('[NotificationLog] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
