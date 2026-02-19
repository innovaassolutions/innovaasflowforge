/**
 * Test Notification API
 *
 * Sends a test notification through the specified channel
 * to verify the tenant's configuration is working.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { emailAdapter, slackAdapter, telegramAdapter, whatsappAdapter } from '@/lib/services/notification-channels'
import type { NotificationPayload, ChannelAdapter } from '@/lib/services/notification-channels'

const adapters: Record<string, ChannelAdapter> = {
  email: emailAdapter,
  slack: slackAdapter,
  telegram: telegramAdapter,
  whatsapp: whatsappAdapter,
}

export async function POST(request: NextRequest) {
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

    // Verify tenant
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

    const body = await request.json()
    const { channel, config } = body

    if (!channel || !adapters[channel]) {
      return NextResponse.json(
        { success: false, error: 'Invalid channel' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const testPayload: NotificationPayload = {
      eventType: 'session_completed',
      tenantId: tenant.id,
      participantName: 'Test Participant',
      assessmentType: 'Test Assessment',
      dashboardUrl: `${baseUrl}/dashboard`,
      completedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      metadata: { test: true },
    }

    const adapter = adapters[channel]
    const result = await adapter.send(testPayload, config || {}, {
      recipientEmail: user.email || undefined,
      senderName: 'FlowForge',
    })

    if (result.status === 'failed') {
      return NextResponse.json({
        success: false,
        error: result.error || 'Test notification failed',
      })
    }

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('[TestNotification] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
