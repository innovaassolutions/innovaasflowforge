/**
 * WhatsApp Channel Adapter
 *
 * Sends notifications via Twilio REST API (no SDK - uses native fetch).
 * Requires platform-level Twilio credentials in env vars.
 */

import type { ChannelAdapter, NotificationPayload, ChannelResult } from './types'

export const whatsappAdapter: ChannelAdapter = {
  channelName: 'whatsapp',

  async send(
    payload: NotificationPayload,
    config: Record<string, unknown>
  ): Promise<ChannelResult> {
    const phoneNumber = config.phone_number as string | undefined
    if (!phoneNumber) {
      return {
        channel: 'whatsapp',
        status: 'failed',
        error: 'No phone number configured',
        estimatedCostUsd: 0,
        recipient: 'unknown',
      }
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !fromNumber) {
      return {
        channel: 'whatsapp',
        status: 'failed',
        error: 'Twilio credentials not configured on platform',
        estimatedCostUsd: 0,
        recipient: maskPhone(phoneNumber),
      }
    }

    const message = [
      '*Session Completed*',
      '',
      `Participant: ${payload.participantName}`,
      `Assessment: ${payload.assessmentType}`,
      `Completed: ${payload.completedAt}`,
      '',
      `View results: ${payload.dashboardUrl}`,
    ].join('\n')

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

      const body = new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:${phoneNumber}`,
        Body: message,
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          channel: 'whatsapp',
          status: 'failed',
          error: data.message || `Twilio returned ${response.status}`,
          estimatedCostUsd: 0,
          recipient: maskPhone(phoneNumber),
        }
      }

      return {
        channel: 'whatsapp',
        status: 'sent',
        estimatedCostUsd: 0.05,
        recipient: maskPhone(phoneNumber),
      }
    } catch (err) {
      return {
        channel: 'whatsapp',
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        estimatedCostUsd: 0,
        recipient: maskPhone(phoneNumber),
      }
    }
  },
}

function maskPhone(phone: string): string {
  if (phone.length <= 6) return '***'
  return phone.slice(0, 3) + '***' + phone.slice(-4)
}
