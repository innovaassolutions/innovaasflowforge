-- Migration: Add Tier Assignment to Tenant Profiles
-- Purpose: Enable tier-based usage limits for tenants
-- Date: 2026-01-13
-- Story: billing-2-2-add-tier-assignment-tenant-profiles
--
-- This migration:
-- 1. Adds tier_id, usage_limit_override, billing_period_start columns (AC1)
-- 2. Sets default 'starter' tier for existing tenants (AC2)

-- ============================================================================
-- STEP 1: Add new columns to tenant_profiles
-- ============================================================================

ALTER TABLE tenant_profiles
  ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES subscription_tiers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS usage_limit_override BIGINT,
  ADD COLUMN IF NOT EXISTS billing_period_start DATE DEFAULT CURRENT_DATE;

-- ============================================================================
-- STEP 2: Set default tier for existing tenants
-- ============================================================================
-- All existing tenants without a tier get assigned to 'starter'

UPDATE tenant_profiles
SET tier_id = (SELECT id FROM subscription_tiers WHERE name = 'starter')
WHERE tier_id IS NULL;

-- ============================================================================
-- STEP 3: Add comments
-- ============================================================================

COMMENT ON COLUMN tenant_profiles.tier_id IS 'Foreign key to subscription_tiers - defines usage limits';
COMMENT ON COLUMN tenant_profiles.usage_limit_override IS 'Admin override for monthly token limit (NULL = use tier limit)';
COMMENT ON COLUMN tenant_profiles.billing_period_start IS 'Start date of current billing cycle for usage tracking';

-- ============================================================================
-- STEP 4: Create index for efficient tier lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tenant_profiles_tier_id ON tenant_profiles(tier_id);
