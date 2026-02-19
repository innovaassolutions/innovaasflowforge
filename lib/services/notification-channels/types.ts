/**
 * Multi-Channel Notification System - Shared Types
 */

export interface NotificationPayload {
  eventType: 'session_completed' | 'usage_warning_75' | 'usage_warning_90' | 'usage_warning_100'
  tenantId: string
  participantName: string
  assessmentType: string
  dashboardUrl: string
  completedAt: string
  metadata?: Record<string, unknown>
}

export interface ChannelResult {
  channel: string
  status: 'sent' | 'failed' | 'skipped'
  error?: string
  estimatedCostUsd: number
  recipient: string
}

export interface ChannelAdapter {
  channelName: string
  send(
    payload: NotificationPayload,
    config: Record<string, unknown>,
    options?: {
      recipientEmail?: string
      senderName?: string
      brandConfig?: Record<string, unknown>
      emailConfig?: Record<string, unknown>
    }
  ): Promise<ChannelResult>
}

export interface NotificationPreferences {
  channels: {
    email: { enabled: boolean }
    slack: { enabled: boolean; webhook_url?: string | null; channel_name?: string | null }
    telegram: { enabled: boolean; bot_token?: string | null; chat_id?: string | null }
    whatsapp: { enabled: boolean; phone_number?: string | null }
  }
  notify_on_session_complete: boolean
  notify_on_usage_warning: boolean
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  channels: {
    email: { enabled: true },
    slack: { enabled: false, webhook_url: null, channel_name: null },
    telegram: { enabled: false, bot_token: null, chat_id: null },
    whatsapp: { enabled: false, phone_number: null },
  },
  notify_on_session_complete: true,
  notify_on_usage_warning: true,
}
