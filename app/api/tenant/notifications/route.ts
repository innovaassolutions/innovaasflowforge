/**
 * Tenant Notifications API
 *
 * Lists usage notifications for the authenticated tenant.
 * Story: billing-3-3-tenant-notification-history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantNotificationHistory } from '@/lib/services/notification-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
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
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get notification history
    const notifications = await getTenantNotificationHistory(tenant.id)

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error('[TenantNotifications] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
