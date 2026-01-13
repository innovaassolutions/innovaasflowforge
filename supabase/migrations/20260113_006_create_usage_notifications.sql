-- Migration: Create usage_notifications table
-- Purpose: Track notifications sent to tenants for usage warnings
-- Date: 2026-01-13
-- Story: billing-3-1-create-notification-tracking-table
--
-- Prevents duplicate notifications by enforcing unique constraint
-- on (tenant_id, notification_type, billing_period)

-- ============================================================================
-- STEP 1: Create usage_notifications table
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('75_percent', '90_percent', '100_percent')),
  billing_period DATE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('in_app', 'email', 'both')),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate notifications in same billing period
  UNIQUE (tenant_id, notification_type, billing_period)
);

-- ============================================================================
-- STEP 2: Add indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_usage_notifications_tenant_id
  ON usage_notifications(tenant_id);

CREATE INDEX IF NOT EXISTS idx_usage_notifications_billing_period
  ON usage_notifications(billing_period);

CREATE INDEX IF NOT EXISTS idx_usage_notifications_unacknowledged
  ON usage_notifications(tenant_id, acknowledged_at)
  WHERE acknowledged_at IS NULL;

-- ============================================================================
-- STEP 3: Enable RLS
-- ============================================================================
ALTER TABLE usage_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

-- Tenants can view their own notifications
CREATE POLICY "Tenants can view own notifications"
  ON usage_notifications FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
  ));

-- Tenants can acknowledge their own notifications
CREATE POLICY "Tenants can acknowledge own notifications"
  ON usage_notifications FOR UPDATE
  USING (tenant_id IN (
    SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (tenant_id IN (
    SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
  ));

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON usage_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- STEP 5: Add table comment
-- ============================================================================
COMMENT ON TABLE usage_notifications IS 'Tracks usage warning notifications sent to tenants to prevent duplicate alerts';
COMMENT ON COLUMN usage_notifications.notification_type IS 'Type of warning: 75_percent, 90_percent, 100_percent';
COMMENT ON COLUMN usage_notifications.billing_period IS 'First day of the billing period this notification applies to';
COMMENT ON COLUMN usage_notifications.delivery_method IS 'How the notification was delivered: in_app, email, or both';
COMMENT ON COLUMN usage_notifications.acknowledged_at IS 'When the user acknowledged/dismissed the notification';
