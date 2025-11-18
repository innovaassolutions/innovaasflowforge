-- Migration: Create Stakeholder Profiles Table
-- Purpose: Reusable stakeholder profiles belonging to companies
-- Date: 2025-11-18

-- ============================================================================
-- STAKEHOLDER PROFILES TABLE
-- ============================================================================
-- Stakeholder profiles are reusable - same stakeholder can be assigned to multiple campaigns
-- Each stakeholder belongs to a company (company_profile_id)
-- Facilitators can create profiles ahead of time or during campaign creation

CREATE TABLE IF NOT EXISTS stakeholder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company Association
  company_profile_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,

  -- Stakeholder Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role_type TEXT CHECK (role_type IN (
    'managing_director',
    'it_operations',
    'production_manager',
    'purchasing_manager',
    'planning_scheduler',
    'engineering_maintenance'
  )),
  title TEXT,
  department TEXT,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id), -- Facilitator who created this profile
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints: Each email unique within a company
  UNIQUE(company_profile_id, email)
);

-- Indexes
CREATE INDEX idx_stakeholder_profiles_company ON stakeholder_profiles(company_profile_id);
CREATE INDEX idx_stakeholder_profiles_email ON stakeholder_profiles(email);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE stakeholder_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage stakeholder profiles for companies they control
CREATE POLICY "Users can manage stakeholder profiles for their companies"
  ON stakeholder_profiles
  FOR ALL
  USING (
    company_profile_id IN (
      SELECT id FROM company_profiles WHERE created_by = auth.uid()
      UNION
      SELECT company_profile_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_stakeholder_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stakeholder_profile_updated_at
  BEFORE UPDATE ON stakeholder_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_stakeholder_profile_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE stakeholder_profiles IS 'Reusable stakeholder profiles - can be assigned to multiple campaigns';
COMMENT ON COLUMN stakeholder_profiles.company_profile_id IS 'Company this stakeholder belongs to';
COMMENT ON COLUMN stakeholder_profiles.email IS 'Unique per company - same person can exist in multiple companies';
COMMENT ON CONSTRAINT stakeholder_profiles_company_profile_id_email_key ON stakeholder_profiles IS 'Ensures email uniqueness within each company';
