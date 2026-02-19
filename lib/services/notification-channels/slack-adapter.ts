/**
 * Slack Channel Adapter
 *
 * Sends notifications via Slack Incoming Webhooks (Block Kit format).
 * No npm dependencies - uses native fetch().
 */

import type { ChannelAdapter, NotificationPayload, ChannelResult } from './types'

export const slackAdapter: ChannelAdapter = {
  channelName: 'slack',

  async send(
    payload: NotificationPayload,
    config: Record<string, unknown>
  ): Promise<ChannelResult> {
    const webhookUrl = config.webhook_url as string | undefined
    if (!webhookUrl) {
      return {
        channel: 'slack',
        status: 'failed',
        error: 'No webhook URL configured',
        estimatedCostUsd: 0,
        recipient: 'unknown',
      }
    }

    const channelName = (config.channel_name as string) || 'notifications'

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Session Completed',
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Participant:*\n${payload.participantName}` },
          { type: 'mrkdwn', text: `*Assessment:*\n${payload.assessmentType}` },
        ],
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Completed:*\n${payload.completedAt}` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View in Dashboard' },
            url: payload.dashboardUrl,
            style: 'primary',
          },
        ],
      },
    ]

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      })

      if (!response.ok) {
        const text = await response.text()
        return {
          channel: 'slack',
          status: 'failed',
          error: `Slack webhook returned ${response.status}: ${text}`,
          estimatedCostUsd: 0,
          recipient: `#${channelName}`,
        }
      }

      return {
        channel: 'slack',
        status: 'sent',
        estimatedCostUsd: 0,
        recipient: `#${channelName}`,
      }
    } catch (err) {
      return {
        channel: 'slack',
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        estimatedCostUsd: 0,
        recipient: `#${channelName}`,
      }
    }
  },
}
