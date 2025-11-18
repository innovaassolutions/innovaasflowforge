-- Migration: Update Campaigns for Company Profiles
-- Purpose: Link campaigns to company_profiles instead of organizations
-- Date: 2025-11-18

-- ============================================================================
-- UPDATE CAMPAIGNS TABLE
-- ============================================================================
-- Add company_profile_id: Which company this campaign is for
-- Remove organization_id: No longer needed

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;

-- Drop old organization_id column if it exists
ALTER TABLE campaigns
  DROP COLUMN IF EXISTS organization_id;

-- Index for fast company → campaigns lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_company_profile ON campaigns(company_profile_id);

-- ============================================================================
-- UPDATE RLS POLICIES
-- ============================================================================
-- Remove old organization-based policies
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON campaigns;

-- New policy: Users can manage campaigns they created OR campaigns for their company
CREATE POLICY "Users can manage campaigns for their companies"
  ON campaigns
  FOR ALL
  USING (
    created_by = auth.uid()
    OR
    company_profile_id IN (
      SELECT company_profile_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN campaigns.company_profile_id IS 'Which company this campaign is for';
COMMENT ON COLUMN campaigns.created_by IS 'Facilitator (consultant or company user) who created this campaign';
