-- Migration: Rename stakeholder_sessions to campaign_assignments
-- Purpose: Clarify that this table links stakeholder profiles to campaigns + tracks sessions
-- Date: 2025-11-18

-- ============================================================================
-- RENAME TABLE
-- ============================================================================
-- stakeholder_sessions → campaign_assignments
-- This table serves dual purpose:
-- 1. Join table: Links stakeholder_profiles to campaigns
-- 2. Session tracking: Stores access tokens, interview data, transcripts

ALTER TABLE stakeholder_sessions RENAME TO campaign_assignments;

-- ============================================================================
-- ADD STAKEHOLDER PROFILE REFERENCE
-- ============================================================================
-- Link to reusable stakeholder profiles
ALTER TABLE campaign_assignments
  ADD COLUMN IF NOT EXISTS stakeholder_profile_id UUID REFERENCES stakeholder_profiles(id) ON DELETE CASCADE;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_campaign_assignments_stakeholder_profile ON campaign_assignments(stakeholder_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaign_assignments_campaign ON campaign_assignments(campaign_id);

-- ============================================================================
-- UPDATE RLS POLICIES
-- ============================================================================
-- Remove old policies on stakeholder_sessions (table renamed)
DROP POLICY IF EXISTS "Users can create stakeholder sessions" ON campaign_assignments;
DROP POLICY IF EXISTS "Users can view stakeholder sessions" ON campaign_assignments;
DROP POLICY IF EXISTS "Users can update stakeholder sessions" ON campaign_assignments;
DROP POLICY IF EXISTS "Users can delete stakeholder sessions" ON campaign_assignments;
DROP POLICY IF EXISTS "Users can manage stakeholder sessions for their campaigns" ON campaign_assignments;
DROP POLICY IF EXISTS "Public can access sessions with valid token" ON campaign_assignments;

-- New policies
-- Policy 1: Facilitators can manage assignments for campaigns they created
CREATE POLICY "Facilitators can manage campaign assignments"
  ON campaign_assignments
  FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

-- Policy 2: Stakeholders can access their sessions via access_token (public access)
CREATE POLICY "Stakeholders can access sessions with valid token"
  ON campaign_assignments
  FOR SELECT
  USING (access_token IS NOT NULL);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE campaign_assignments IS 'Join table + session tracking: stakeholder profiles assigned to campaigns with unique access tokens';
COMMENT ON COLUMN campaign_assignments.stakeholder_profile_id IS 'Reusable stakeholder profile - same profile can be assigned to multiple campaigns';
COMMENT ON COLUMN campaign_assignments.access_token IS 'Unique access token for this stakeholder to access this specific campaign interview';
COMMENT ON COLUMN campaign_assignments.campaign_id IS 'Which campaign this assignment is for';

-- Note: Existing columns are preserved:
-- - stakeholder_name, stakeholder_email, stakeholder_role (deprecated, but kept for backward compatibility)
-- - Eventually these will be replaced by data from stakeholder_profile_id
