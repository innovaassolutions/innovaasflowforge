-- Migration: Add results_disclosure to tenant_profiles
-- Purpose: Allow coaches to set default results disclosure at tenant level
-- Date: 2026-01-13
-- Story: 3-5-results-custom-domain
--
-- Note: This provides tenant-level default disclosure. In future,
-- coaching_sessions can be linked to campaigns for per-campaign overrides.

-- ============================================================================
-- STEP 1: Add results_disclosure column to tenant_profiles
-- ============================================================================
ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS results_disclosure TEXT DEFAULT 'full'
CHECK (results_disclosure IN (
  'full',    -- Show complete archetype results to participant
  'teaser',  -- Show archetype names only + CTA to contact coach
  'none'     -- Thank you only, coach will follow up with results
));

-- ============================================================================
-- STEP 2: Update existing tenants to use 'full' as default
-- ============================================================================
UPDATE tenant_profiles
SET results_disclosure = 'full'
WHERE results_disclosure IS NULL;

-- ============================================================================
-- STEP 3: Add column comment
-- ============================================================================
COMMENT ON COLUMN tenant_profiles.results_disclosure IS 'Default results disclosure for coaching sessions: full (complete results), teaser (names only), none (thank you only)';
