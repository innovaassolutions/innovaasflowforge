-- Migration: Add Input/Output Token Columns to Usage Events
-- Purpose: Enable accurate cost calculation based on provider-specific input/output rates
-- Date: 2026-01-13
-- Story: billing-1-1-modify-usage-events-schema
--
-- This migration:
-- 1. Adds input_tokens and output_tokens columns (AC1)
-- 2. Backfills existing data conservatively (AC2)
-- 3. Adds CHECK constraint for non-negative values (AC3)
-- 4. Creates billing-optimized index (AC4)

-- ============================================================================
-- STEP 1: Add input_tokens and output_tokens columns
-- ============================================================================
-- Add new columns with defaults so existing INSERT statements don't break

ALTER TABLE usage_events
  ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0;

-- ============================================================================
-- STEP 2: Backfill existing data
-- ============================================================================
-- Conservative approach: assume all existing tokens were output tokens
-- This ensures cost calculations are accurate (output tokens typically cost more)
-- Note: Since columns have DEFAULT 0, we need to match on output_tokens = 0 with tokens_used > 0

UPDATE usage_events
SET
  input_tokens = 0,
  output_tokens = COALESCE(tokens_used, 0)
WHERE output_tokens = 0 AND tokens_used > 0;

-- ============================================================================
-- STEP 3: Add CHECK constraint for non-negative token values
-- ============================================================================
-- Prevents invalid data from being inserted

ALTER TABLE usage_events
  ADD CONSTRAINT positive_tokens
  CHECK (input_tokens >= 0 AND output_tokens >= 0);

-- ============================================================================
-- STEP 4: Create billing aggregation index
-- ============================================================================
-- Partial index for efficient billing queries (only rows with tenant_id)
-- Complements existing idx_usage_events_tenant_month index

CREATE INDEX IF NOT EXISTS idx_usage_events_billing
  ON usage_events (tenant_id, created_at DESC)
  WHERE tenant_id IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN usage_events.input_tokens IS 'Input tokens consumed (prompt tokens)';
COMMENT ON COLUMN usage_events.output_tokens IS 'Output tokens consumed (completion tokens)';
COMMENT ON INDEX idx_usage_events_billing IS 'Partial index for billing aggregation queries';

-- ============================================================================
-- VERIFICATION HELPER (can be removed after verification)
-- ============================================================================
-- Run this to verify migration success:
-- SELECT
--   COUNT(*) as total_rows,
--   COUNT(input_tokens) as rows_with_input_tokens,
--   COUNT(output_tokens) as rows_with_output_tokens,
--   SUM(CASE WHEN input_tokens = 0 AND output_tokens = tokens_used THEN 1 ELSE 0 END) as correctly_backfilled
-- FROM usage_events;
