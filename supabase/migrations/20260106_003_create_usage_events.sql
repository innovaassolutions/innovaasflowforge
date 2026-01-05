-- Migration: Create Usage Events Table
-- Purpose: Track usage for billing and analytics (LLM tokens, emails, etc.)
-- Date: 2026-01-06
-- Story: 3-1-database-foundation (Coaching Module)
--
-- Note: This creates the infrastructure for usage tracking.
-- Billing UI is out of scope for MVP; this enables future billing features.

-- ============================================================================
-- USAGE EVENTS TABLE
-- ============================================================================
-- Tracks all billable events across the platform

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- May be null for anonymous participant actions

  -- Event Classification
  event_type TEXT NOT NULL CHECK (event_type IN (
    'llm_request',      -- AI model invocation
    'email_sent',       -- Email via Resend
    'session_started',  -- Assessment session began
    'session_completed', -- Assessment session finished
    'report_generated', -- PDF/report generation
    'document_processed' -- Document analysis (future)
  )),

  -- Event Details (JSONB for flexibility)
  -- For llm_request: { model, input_tokens, output_tokens, prompt_type }
  -- For email_sent: { recipient, template, subject }
  -- For session: { session_id, assessment_type }
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Token tracking (for LLM usage)
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT, -- e.g., 'claude-sonnet-4-5', 'claude-opus-4-5'

  -- Cost tracking (for billing calculations)
  cost_cents INTEGER DEFAULT 0, -- Computed cost in cents (if applicable)

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_usage_events_tenant_id ON usage_events(tenant_id);
CREATE INDEX idx_usage_events_event_type ON usage_events(event_type);
CREATE INDEX idx_usage_events_created_at ON usage_events(created_at DESC);
CREATE INDEX idx_usage_events_user_id ON usage_events(user_id) WHERE user_id IS NOT NULL;

-- Composite index for tenant billing queries
CREATE INDEX idx_usage_events_tenant_month ON usage_events(tenant_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Tenant owners can view their usage events
CREATE POLICY "Tenant owners can view their usage events"
  ON usage_events
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

-- Only server (service role) can insert usage events
-- (Insert is handled by API routes with service role key)

-- ============================================================================
-- HELPER FUNCTION: Log Usage Event
-- ============================================================================
CREATE OR REPLACE FUNCTION log_usage_event(
  p_tenant_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_tokens_used INTEGER DEFAULT 0,
  p_model_used TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO usage_events (tenant_id, user_id, event_type, event_data, tokens_used, model_used)
  VALUES (p_tenant_id, p_user_id, p_event_type, p_event_data, p_tokens_used, p_model_used)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE usage_events IS 'Tracks billable events for usage-based billing and analytics';
COMMENT ON COLUMN usage_events.event_type IS 'Type of billable event: llm_request, email_sent, session_started, etc.';
COMMENT ON COLUMN usage_events.event_data IS 'JSONB details specific to the event type';
COMMENT ON COLUMN usage_events.tokens_used IS 'Total tokens consumed (for LLM events)';
COMMENT ON COLUMN usage_events.cost_cents IS 'Computed cost in cents for billing';
COMMENT ON FUNCTION log_usage_event IS 'Helper function to log usage events with security definer';
