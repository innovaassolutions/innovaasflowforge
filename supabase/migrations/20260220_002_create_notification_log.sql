-- Migration: Create notification_log table for delivery audit trail

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  estimated_cost_usd NUMERIC(10,6) DEFAULT 0,
  recipient TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for tenant lookups
CREATE INDEX IF NOT EXISTS idx_notification_log_tenant_id ON notification_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON notification_log(created_at DESC);

-- RLS policies
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own logs
CREATE POLICY "Tenants can view own notification logs"
  ON notification_log FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can view all logs
CREATE POLICY "Admins can view all notification logs"
  ON notification_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Service role inserts (no INSERT policy needed since service role bypasses RLS)

COMMENT ON TABLE notification_log IS 'Audit trail for all notification deliveries across channels';
