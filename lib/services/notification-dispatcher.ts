/**
 * Notification Dispatcher
 *
 * Central orchestrator that dispatches notifications to all enabled channels
 * based on tenant preferences. Logs every delivery attempt.
 */

import { createClient } from '@supabase/supabase-js'
import {
  emailAdapter,
  slackAdapter,
  telegramAdapter,
  whatsappAdapter,
} from './notification-channels'
import type {
  NotificationPayload,
  ChannelResult,
  ChannelAdapter,
  NotificationPreferences,
} from './notification-channels'
import { DEFAULT_NOTIFICATION_PREFERENCES } from './notification-channels'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

const adapters: Record<string, ChannelAdapter> = {
  email: emailAdapter,
  slack: slackAdapter,
  telegram: telegramAdapter,
  whatsapp: whatsappAdapter,
}

function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function dispatchNotification(
  tenantId: string,
  recipientEmail: string,
  payload: NotificationPayload,
  options?: {
    brandConfig?: Record<string, unknown>
    emailConfig?: Record<string, unknown>
    senderName?: string
    supabase?: SupabaseClient
  }
): Promise<ChannelResult[]> {
  const client = options?.supabase || getServiceClient()

  // Fetch tenant notification preferences
  const { data: tenant } = await (client
    .from('tenant_profiles') as any)
    .select('notification_preferences')
    .eq('id', tenantId)
    .single()

  const prefs: NotificationPreferences = tenant?.notification_preferences
    ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...tenant.notification_preferences }
    : DEFAULT_NOTIFICATION_PREFERENCES

  // Check if this event type should fire
  const isSessionEvent = payload.eventType === 'session_completed'
  const isUsageEvent = payload.eventType.startsWith('usage_warning')
  if (isSessionEvent && !prefs.notify_on_session_complete) {
    return []
  }
  if (isUsageEvent && !prefs.notify_on_usage_warning) {
    return []
  }

  // Build list of channels to dispatch to
  const channelEntries = Object.entries(prefs.channels) as [string, Record<string, unknown>][]
  const enabledChannels = channelEntries.filter(([, config]) => config.enabled)

  // Dispatch to all enabled channels in parallel
  const promises = enabledChannels.map(async ([channelName, config]) => {
    const adapter = adapters[channelName]
    if (!adapter) {
      return {
        channel: channelName,
        status: 'failed' as const,
        error: `No adapter for channel: ${channelName}`,
        estimatedCostUsd: 0,
        recipient: 'unknown',
      }
    }

    try {
      const result = await adapter.send(payload, config as Record<string, unknown>, {
        recipientEmail,
        senderName: options?.senderName,
        brandConfig: options?.brandConfig,
        emailConfig: options?.emailConfig,
      })
      return result
    } catch (err) {
      return {
        channel: channelName,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : 'Unknown error',
        estimatedCostUsd: 0,
        recipient: 'unknown',
      }
    }
  })

  const results = await Promise.allSettled(promises)
  const channelResults: ChannelResult[] = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          channel: 'unknown',
          status: 'failed' as const,
          error: r.reason?.message || 'Promise rejected',
          estimatedCostUsd: 0,
          recipient: 'unknown',
        }
  )

  // Log all results to notification_log
  await logResults(client, tenantId, payload, channelResults)

  return channelResults
}

/**
 * Send email-only notification (fallback for campaigns without tenant_id).
 * Still logs to notification_log if a tenantId can be resolved.
 */
export async function dispatchEmailOnly(
  recipientEmail: string,
  payload: NotificationPayload,
  options?: {
    brandConfig?: Record<string, unknown>
    emailConfig?: Record<string, unknown>
    senderName?: string
    supabase?: SupabaseClient
  }
): Promise<ChannelResult> {
  const result = await emailAdapter.send(payload, {}, {
    recipientEmail,
    senderName: options?.senderName,
    brandConfig: options?.brandConfig,
    emailConfig: options?.emailConfig,
  })

  // Best-effort log (no tenant_id available)
  if (payload.tenantId) {
    const client = options?.supabase || getServiceClient()
    await logResults(client, payload.tenantId, payload, [result])
  }

  return result
}

async function logResults(
  client: SupabaseClient,
  tenantId: string,
  payload: NotificationPayload,
  results: ChannelResult[]
): Promise<void> {
  const rows = results.map((r) => ({
    tenant_id: tenantId,
    event_type: payload.eventType,
    channel: r.channel,
    status: r.status,
    error_message: r.error || null,
    estimated_cost_usd: r.estimatedCostUsd,
    recipient: r.recipient,
    metadata: payload.metadata || {},
  }))

  try {
    await (client.from('notification_log') as any).insert(rows)
  } catch (err) {
    console.error('[NotificationDispatcher] Failed to log notification results:', err)
  }
}
