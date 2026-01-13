-- Migration: Create Subscription Tiers Table
-- Purpose: Define subscription tiers with usage limits for tenant billing
-- Date: 2026-01-13
-- Story: billing-2-1-create-subscription-tiers-table
--
-- This migration:
-- 1. Creates subscription_tiers table (AC1)
-- 2. Adds CHECK constraint to prevent unlimited tiers (AC2)
-- 3. Seeds starter, pro, enterprise tiers (AC3)
-- 4. Enforces unique tier names (AC4)
-- 5. Configures RLS policies

-- ============================================================================
-- STEP 1: Create subscription_tiers table
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  monthly_token_limit BIGINT,
  monthly_session_limit INTEGER,
  price_cents_monthly INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure at least one limit is set (no unlimited tiers)
  CONSTRAINT at_least_one_limit CHECK (
    monthly_token_limit IS NOT NULL OR monthly_session_limit IS NOT NULL
  )
);

-- ============================================================================
-- STEP 2: Seed tier data
-- ============================================================================
-- Starter: 500K tokens/month, $29/month
-- Pro: 2M tokens/month, $99/month
-- Enterprise: 10M tokens/month, $499/month

INSERT INTO subscription_tiers (name, display_name, monthly_token_limit, price_cents_monthly)
VALUES
  ('starter', 'Starter', 500000, 2900),
  ('pro', 'Pro', 2000000, 9900),
  ('enterprise', 'Enterprise', 10000000, 49900)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 3: Enable RLS and create policies
-- ============================================================================

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage tiers
CREATE POLICY "Platform admins can manage subscription tiers"
  ON subscription_tiers FOR ALL
  USING (auth.jwt() ->> 'user_type' = 'admin');

-- All authenticated users can read tiers (needed for UI display)
CREATE POLICY "Authenticated users can read subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 4: Add comments
-- ============================================================================

COMMENT ON TABLE subscription_tiers IS 'Defines subscription tiers with usage limits and pricing';
COMMENT ON COLUMN subscription_tiers.name IS 'Unique tier identifier (starter, pro, enterprise)';
COMMENT ON COLUMN subscription_tiers.monthly_token_limit IS 'Maximum tokens per month (NULL if session-limited)';
COMMENT ON COLUMN subscription_tiers.monthly_session_limit IS 'Maximum sessions per month (NULL if token-limited)';
COMMENT ON COLUMN subscription_tiers.price_cents_monthly IS 'Monthly subscription price in cents';
COMMENT ON CONSTRAINT at_least_one_limit ON subscription_tiers IS 'Prevents unlimited tiers - at least one limit must be set';
