-- Migration: Create Pricing Change Log Table
-- Purpose: Track all pricing changes for audit and alerting
-- Date: 2026-01-13
-- Story: billing-6-2-pricing-change-alerts
--
-- This migration:
-- 1. Creates pricing_change_log table
-- 2. Adds indexes for efficient querying
-- 3. Configures RLS for admin access

-- ============================================================================
-- STEP 1: Create pricing_change_log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Model identification
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  display_name TEXT,

  -- Rate changes (USD per 1M tokens)
  old_input_rate DECIMAL(10,4),
  old_output_rate DECIMAL(10,4),
  new_input_rate DECIMAL(10,4) NOT NULL,
  new_output_rate DECIMAL(10,4) NOT NULL,

  -- Change percentages
  input_change_percent DECIMAL(5,2),
  output_change_percent DECIMAL(5,2),

  -- Change type
  change_type TEXT NOT NULL DEFAULT 'update', -- 'update', 'new_model', 'manual'

  -- Timestamps and acknowledgment
  detected_at TIMESTAMPTZ DEFAULT now(),
  alerted_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES user_profiles(id),
  acknowledged_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- STEP 2: Create indexes
-- ============================================================================

-- Index for finding unacknowledged changes
CREATE INDEX IF NOT EXISTS idx_pricing_change_log_unacknowledged
  ON pricing_change_log (acknowledged_at)
  WHERE acknowledged_at IS NULL;

-- Index for querying by model
CREATE INDEX IF NOT EXISTS idx_pricing_change_log_model
  ON pricing_change_log (model_id, detected_at DESC);

-- Index for querying by provider
CREATE INDEX IF NOT EXISTS idx_pricing_change_log_provider
  ON pricing_change_log (provider, detected_at DESC);

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE pricing_change_log ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage all change logs
CREATE POLICY "Platform admins can manage change logs"
  ON pricing_change_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE pricing_change_log IS 'Audit log of all AI model pricing changes for alerting and review';
COMMENT ON COLUMN pricing_change_log.change_type IS 'Type of change: update (rate change), new_model (first time added), manual (admin update)';
COMMENT ON COLUMN pricing_change_log.acknowledged_by IS 'Admin who reviewed and acknowledged this change';
COMMENT ON COLUMN pricing_change_log.alerted_at IS 'When email/notification was sent about this change';
