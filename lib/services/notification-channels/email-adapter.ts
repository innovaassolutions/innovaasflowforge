/**
 * Email Channel Adapter
 *
 * Wraps existing Resend email delivery for the notification dispatcher.
 */

import { resend, buildFromAddress } from '@/lib/resend'
import { SessionCompletedNotification } from '@/lib/email/templates/session-completed-notification'
import type { ChannelAdapter, NotificationPayload, ChannelResult } from './types'

export const emailAdapter: ChannelAdapter = {
  channelName: 'email',

  async send(
    payload: NotificationPayload,
    _config: Record<string, unknown>,
    options?: {
      recipientEmail?: string
      senderName?: string
      brandConfig?: Record<string, unknown>
      emailConfig?: Record<string, unknown>
    }
  ): Promise<ChannelResult> {
    const recipientEmail = options?.recipientEmail
    if (!recipientEmail) {
      return {
        channel: 'email',
        status: 'failed',
        error: 'No recipient email provided',
        estimatedCostUsd: 0,
        recipient: 'unknown',
      }
    }

    const senderName = (options?.senderName as string) || 'FlowForge'
    const brandConfig = (options?.brandConfig || {}) as {
      logo?: { url: string; alt?: string }
      colors?: { primary?: string; background?: string; text?: string; textMuted?: string }
      tagline?: string
    }
    const emailConfig = (options?.emailConfig || {}) as {
      senderName?: string
      emailFooter?: string
    }

    const fromAddress = buildFromAddress(senderName)

    const result = await resend.emails.send({
      from: fromAddress,
      to: recipientEmail,
      subject: `Session Completed: ${payload.participantName}`,
      react: SessionCompletedNotification({
        clientName: payload.participantName,
        assessmentType: payload.assessmentType,
        completedAt: payload.completedAt,
        dashboardUrl: payload.dashboardUrl,
        brandConfig: {
          logo: brandConfig.logo,
          colors: {
            primary: brandConfig.colors?.primary,
            background: brandConfig.colors?.background,
            text: brandConfig.colors?.text,
            textMuted: brandConfig.colors?.textMuted,
          },
          tagline: brandConfig.tagline,
        },
        emailConfig: {
          senderName: emailConfig.senderName,
          emailFooter: emailConfig.emailFooter,
        },
      }),
    })

    if (result.error) {
      return {
        channel: 'email',
        status: 'failed',
        error: String(result.error),
        estimatedCostUsd: 0,
        recipient: maskEmail(recipientEmail),
      }
    }

    return {
      channel: 'email',
      status: 'sent',
      estimatedCostUsd: 0.001,
      recipient: maskEmail(recipientEmail),
    }
  },
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  const masked = local.length > 2
    ? local[0] + '***' + local[local.length - 1]
    : '***'
  return `${masked}@${domain}`
}
