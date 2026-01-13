-- Migration: Seed Model Pricing Table
-- Purpose: Populate initial pricing data for cost calculations
-- Date: 2026-01-13
-- Story: billing-1-2-create-model-pricing-table
--
-- This migration seeds the model_pricing table with known pricing data
-- from major AI providers (Anthropic, OpenAI, Google, ElevenLabs)

-- ============================================================================
-- STEP 1: Clear existing pricing (if any) to avoid duplicates
-- ============================================================================

-- Set existing records as inactive before inserting new ones
UPDATE model_pricing SET is_active = false WHERE is_active = true;

-- ============================================================================
-- STEP 2: Insert Anthropic Models
-- Source: https://www.anthropic.com/pricing
-- ============================================================================

INSERT INTO model_pricing (provider, model_id, display_name, input_rate_per_million, output_rate_per_million, effective_date, is_active)
VALUES
  ('anthropic', 'claude-sonnet-4-20250514', 'Claude Sonnet 4', 3.00, 15.00, NOW(), true),
  ('anthropic', 'claude-opus-4-5-20251101', 'Claude Opus 4.5', 15.00, 75.00, NOW(), true),
  ('anthropic', 'claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 0.80, 4.00, NOW(), true);

-- ============================================================================
-- STEP 3: Insert OpenAI Models
-- Source: https://openai.com/pricing
-- ============================================================================

INSERT INTO model_pricing (provider, model_id, display_name, input_rate_per_million, output_rate_per_million, effective_date, is_active)
VALUES
  ('openai', 'gpt-4-turbo', 'GPT-4 Turbo', 10.00, 30.00, NOW(), true),
  ('openai', 'gpt-4o', 'GPT-4o', 5.00, 15.00, NOW(), true),
  ('openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 0.50, 1.50, NOW(), true);

-- ============================================================================
-- STEP 4: Insert Google Models
-- Source: https://cloud.google.com/vertex-ai/pricing
-- ============================================================================

INSERT INTO model_pricing (provider, model_id, display_name, input_rate_per_million, output_rate_per_million, effective_date, is_active)
VALUES
  ('google', 'gemini-1.5-pro', 'Gemini 1.5 Pro', 7.00, 21.00, NOW(), true),
  ('google', 'gemini-1.5-flash', 'Gemini 1.5 Flash', 0.35, 1.05, NOW(), true);

-- ============================================================================
-- STEP 5: Insert ElevenLabs Models (Voice AI)
-- Source: https://elevenlabs.io/pricing
-- Note: ElevenLabs charges per character, converted to per-million rate
-- Approximate: 1M characters ≈ 250K words ≈ ~1.5M tokens equivalent
-- ============================================================================

INSERT INTO model_pricing (provider, model_id, display_name, input_rate_per_million, output_rate_per_million, effective_date, is_active)
VALUES
  ('elevenlabs', 'eleven_turbo_v2', 'ElevenLabs Turbo v2', 0.00, 30.00, NOW(), true),
  ('elevenlabs', 'eleven_multilingual_v2', 'ElevenLabs Multilingual v2', 0.00, 30.00, NOW(), true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE model_pricing IS 'AI model pricing rates used for cost calculations. Rates are in USD per million tokens.';
