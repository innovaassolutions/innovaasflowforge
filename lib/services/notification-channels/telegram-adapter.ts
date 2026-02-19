/**
 * Telegram Channel Adapter
 *
 * Sends notifications via Telegram Bot API.
 * No npm dependencies - uses native fetch().
 */

import type { ChannelAdapter, NotificationPayload, ChannelResult } from './types'

export const telegramAdapter: ChannelAdapter = {
  channelName: 'telegram',

  async send(
    payload: NotificationPayload,
    config: Record<string, unknown>
  ): Promise<ChannelResult> {
    const botToken = config.bot_token as string | undefined
    const chatId = config.chat_id as string | undefined

    if (!botToken || !chatId) {
      return {
        channel: 'telegram',
        status: 'failed',
        error: !botToken ? 'No bot token configured' : 'No chat ID configured',
        estimatedCostUsd: 0,
        recipient: 'unknown',
      }
    }

    const message = [
      '<b>Session Completed</b>',
      '',
      `<b>Participant:</b> ${escapeHtml(payload.participantName)}`,
      `<b>Assessment:</b> ${escapeHtml(payload.assessmentType)}`,
      `<b>Completed:</b> ${escapeHtml(payload.completedAt)}`,
      '',
      `<a href="${payload.dashboardUrl}">View in Dashboard</a>`,
    ].join('\n')

    const maskedChatId = maskChatId(chatId)

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        return {
          channel: 'telegram',
          status: 'failed',
          error: data.description || 'Telegram API error',
          estimatedCostUsd: 0,
          recipient: maskedChatId,
        }
      }

      return {
        channel: 'telegram',
        status: 'sent',
        estimatedCostUsd: 0,
        recipient: maskedChatId,
      }
    } catch (err) {
      return {
        channel: 'telegram',
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        estimatedCostUsd: 0,
        recipient: maskedChatId,
      }
    }
  },
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function maskChatId(chatId: string): string {
  if (chatId.length <= 4) return '***'
  return chatId.slice(0, 2) + '***' + chatId.slice(-2)
}
