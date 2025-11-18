-- Migration: Create Company Profiles Table
-- Purpose: Companies managed by consultants OR owned by company users
-- Date: 2025-11-18

-- ============================================================================
-- COMPANY PROFILES TABLE
-- ============================================================================
-- Consultants create MANY company profiles (for different clients)
-- Company users create ONE company profile (their own organization)

CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company Information
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  website TEXT,
  market_scope TEXT CHECK (market_scope IN ('local', 'regional', 'national', 'international')),

  -- Additional Context (for AI interview customization)
  employee_count_range TEXT,
  annual_revenue_range TEXT,
  headquarters_location TEXT,

  -- Ownership
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- For consultants: they create many company profiles
  -- For company users: they create ONE (linked via user_profiles.company_profile_id)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_company_profiles_created_by ON company_profiles(created_by);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage companies they created OR companies they're linked to
CREATE POLICY "Users can manage their company profiles"
  ON company_profiles
  FOR ALL
  USING (
    created_by = auth.uid()
    OR
    id IN (SELECT company_profile_id FROM user_profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_company_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_profile_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profile_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE company_profiles IS 'Companies managed by consultants (many) or owned by company users (one)';
COMMENT ON COLUMN company_profiles.created_by IS 'Facilitator who created this company profile';
COMMENT ON COLUMN company_profiles.market_scope IS 'Geographic market reach: local, regional, national, or international';
COMMENT ON COLUMN company_profiles.industry IS 'Primary industry sector for context in AI interviews';
