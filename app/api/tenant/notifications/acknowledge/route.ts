/**
 * Acknowledge Notification API
 *
 * Marks a usage notification as acknowledged.
 * Story: billing-3-3-tenant-notification-history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  acknowledgeNotification,
  NotificationType,
} from '@/lib/services/notification-service'

interface AcknowledgeRequest {
  notificationType: NotificationType
  billingPeriod: string
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: AcknowledgeRequest = await request.json()
    const { notificationType, billingPeriod } = body

    if (!notificationType || !billingPeriod) {
      return NextResponse.json(
        { success: false, error: 'Missing notificationType or billingPeriod' },
        { status: 400 }
      )
    }

    // Acknowledge notification
    const result = await acknowledgeNotification(
      tenant.id,
      notificationType,
      billingPeriod
    )

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to acknowledge notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[AcknowledgeNotification] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to acknowledge notification' },
      { status: 500 }
    )
  }
}
