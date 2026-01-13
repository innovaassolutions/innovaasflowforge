-- Migration: Create Model Pricing Table
-- Purpose: Store AI model pricing rates for cost calculation
-- Date: 2026-01-13
-- Story: billing-1-2-create-model-pricing-table
--
-- This migration:
-- 1. Creates model_pricing table with all columns (AC1)
-- 2. Adds unique constraint on (provider, model_id, effective_date) (AC2)
-- 3. Creates lookup index for efficient queries (AC6)
-- 4. Configures RLS for admin write / authenticated read (AC5)
-- 5. Seeds pricing data for Anthropic, OpenAI, Google models (AC3, AC4)

-- ============================================================================
-- STEP 1: Create model_pricing table
-- ============================================================================

CREATE TABLE IF NOT EXISTS model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider and model identification
  provider TEXT NOT NULL,                              -- 'anthropic', 'openai', 'google'
  model_id TEXT NOT NULL,                              -- 'claude-sonnet-4-20250514'
  display_name TEXT,                                   -- 'Claude Sonnet 4'

  -- Pricing rates (USD per 1M tokens)
  input_rate_per_million DECIMAL(10,4) NOT NULL,       -- Cost per 1M input tokens
  output_rate_per_million DECIMAL(10,4) NOT NULL,      -- Cost per 1M output tokens

  -- Effective dating for historical pricing
  effective_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique constraint: only one active pricing per model per effective date
  UNIQUE (provider, model_id, effective_date)
);

-- ============================================================================
-- STEP 2: Create lookup index for efficient pricing queries
-- ============================================================================
-- Optimizes: SELECT * FROM model_pricing WHERE model_id = ? AND is_active = true

CREATE INDEX IF NOT EXISTS idx_model_pricing_lookup
  ON model_pricing (model_id, is_active, effective_date DESC);

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE model_pricing ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage pricing (INSERT, UPDATE, DELETE)
CREATE POLICY "Platform admins can manage pricing"
  ON model_pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- All authenticated users can read pricing data
CREATE POLICY "All authenticated users can read pricing"
  ON model_pricing FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 4: Seed Anthropic model pricing (3 models)
-- ============================================================================

INSERT INTO model_pricing (provider, model_id, display_name, input_rate_per_million, output_rate_per_million)
VALUES
  ('anthropic', 'claude-sonnet-4-20250514', 'Claude Sonnet 4', 3.00, 15.00),
  ('anthropic', 'claude-opus-4-5-20251101', 'Claude Opus 4.5', 15.00, 75.00),
  ('anthropic', 'claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 0.80, 4.00)
ON CONFLICT (provider, model_id, effective_date) DO NOTHING;

-- ============================================================================
-- STEP 5: Seed OpenAI model pricing (3 models)
-- ============================================================================

INSERT INTO model_pricing (provider, model_id, display_name, input_rate_per_million, output_rate_per_million)
VALUES
  ('openai', 'gpt-4-turbo', 'GPT-4 Turbo', 10.00, 30.00),
  ('openai', 'gpt-4o', 'GPT-4o', 5.00, 15.00),
  ('openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 0.50, 1.50)
ON CONFLICT (provider, model_id, effective_date) DO NOTHING;

-- ============================================================================
-- STEP 6: Seed Google model pricing (2 models)
-- ============================================================================

INSERT INTO model_pricing (provider, model_id, display_name, input_rate_per_million, output_rate_per_million)
VALUES
  ('google', 'gemini-1.5-pro', 'Gemini 1.5 Pro', 7.00, 21.00),
  ('google', 'gemini-1.5-flash', 'Gemini 1.5 Flash', 0.35, 1.05)
ON CONFLICT (provider, model_id, effective_date) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE model_pricing IS 'AI model pricing rates for cost calculation. Supports multiple providers and historical pricing.';
COMMENT ON COLUMN model_pricing.provider IS 'AI provider: anthropic, openai, google';
COMMENT ON COLUMN model_pricing.model_id IS 'Provider-specific model identifier';
COMMENT ON COLUMN model_pricing.input_rate_per_million IS 'USD cost per 1 million input tokens';
COMMENT ON COLUMN model_pricing.output_rate_per_million IS 'USD cost per 1 million output tokens';
COMMENT ON COLUMN model_pricing.effective_date IS 'Date from which this pricing is effective';
COMMENT ON COLUMN model_pricing.is_active IS 'Whether this pricing is currently active';
