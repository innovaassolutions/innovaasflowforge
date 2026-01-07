-- Migration: Add Reflection Tracking Columns to coaching_sessions
-- Purpose: Support post-results reflection flow with email/PDF delivery
-- Date: 2026-01-06
-- Story: 1.1 Results Page Foundation (Post-Results Reflection Epic)

-- ============================================================================
-- STEP 1: ADD REFLECTION TRACKING COLUMNS
-- ============================================================================

-- Reflection status: tracks participant's choice and progress
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS reflection_status TEXT DEFAULT 'none'
CHECK (reflection_status IN (
  'none',        -- Initial state, hasn't seen results yet
  'pending',     -- Viewed results, hasn't made a choice
  'accepted',    -- Chose to "go deeper" - in reflection conversation
  'completed',   -- Completed reflection conversation
  'declined'     -- Chose "no thanks" - exited gracefully
));

-- Reflection messages: stores AI reflection conversation (JSONB array)
-- Format: [{ role: 'user'|'assistant', content: string, timestamp: string }]
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS reflection_messages JSONB DEFAULT '[]'::jsonb;

-- Email delivery tracking
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- PDF generation tracking
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;

-- ============================================================================
-- STEP 2: CREATE INDEXES
-- ============================================================================

-- Index for filtering by reflection status (tenant pipeline views)
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_reflection_status
  ON coaching_sessions(reflection_status)
  WHERE reflection_status IS NOT NULL AND reflection_status != 'none';

-- Composite index for tenant + reflection status queries
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_tenant_reflection
  ON coaching_sessions(tenant_id, reflection_status)
  WHERE tenant_id IS NOT NULL;

-- Index for finding sessions needing email delivery
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_email_pending
  ON coaching_sessions(completed_at)
  WHERE completed_at IS NOT NULL AND email_sent_at IS NULL;

-- ============================================================================
-- STEP 3: ADD COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN coaching_sessions.reflection_status IS 'Reflection flow status: none, pending, accepted, completed, declined';
COMMENT ON COLUMN coaching_sessions.reflection_messages IS 'JSONB array of reflection conversation messages with AI';
COMMENT ON COLUMN coaching_sessions.email_sent_at IS 'Timestamp when results email was sent to participant';
COMMENT ON COLUMN coaching_sessions.pdf_generated_at IS 'Timestamp when PDF was generated for participant';
