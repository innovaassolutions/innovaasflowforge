/**
 * Notification Channel Adapters - Barrel Export
 */

export { emailAdapter } from './email-adapter'
export { slackAdapter } from './slack-adapter'
export { telegramAdapter } from './telegram-adapter'
export { whatsappAdapter } from './whatsapp-adapter'

export type {
  NotificationPayload,
  ChannelResult,
  ChannelAdapter,
  NotificationPreferences,
} from './types'

export { DEFAULT_NOTIFICATION_PREFERENCES } from './types'
