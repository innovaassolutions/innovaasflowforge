-- Migration: Add notification_preferences to tenant_profiles
-- Enables multi-channel notification configuration per tenant

ALTER TABLE tenant_profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
    "channels": {
      "email": { "enabled": true },
      "slack": { "enabled": false, "webhook_url": null, "channel_name": null },
      "telegram": { "enabled": false, "bot_token": null, "chat_id": null },
      "whatsapp": { "enabled": false, "phone_number": null }
    },
    "notify_on_session_complete": true,
    "notify_on_usage_warning": true
  }'::jsonb;

COMMENT ON COLUMN tenant_profiles.notification_preferences IS 'Multi-channel notification configuration: email, Slack, Telegram, WhatsApp';
