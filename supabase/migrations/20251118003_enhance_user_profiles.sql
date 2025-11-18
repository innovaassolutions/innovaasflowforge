-- Migration: Enhance User Profiles for User Types
-- Purpose: Add user_type and company_profile_id to support consultant vs company users
-- Date: 2025-11-18

-- ============================================================================
-- ADD USER TYPE AND COMPANY LINK
-- ============================================================================
-- user_type: 'consultant' (manages multiple clients) or 'company' (manages own org)
-- company_profile_id: For company users only - links to their organization

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('consultant', 'company')),
  ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES company_profiles(id) ON DELETE SET NULL;

-- Index for fast company lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_profile_id ON user_profiles(company_profile_id);

-- Make organization_id nullable (deprecated in favor of company_profile_id)
ALTER TABLE user_profiles
  ALTER COLUMN organization_id DROP NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN user_profiles.user_type IS 'Consultant (billed per campaign) or Company (campaign packages)';
COMMENT ON COLUMN user_profiles.company_profile_id IS 'For company users only - their organization. NULL for consultants who manage multiple clients.';
COMMENT ON COLUMN user_profiles.organization_id IS 'DEPRECATED - use company_profile_id instead';
