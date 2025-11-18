-- Migration: Fix Campaign Delete Policy
-- Purpose: Remove old organization-based delete policy that references removed organization_id column
-- Date: 2025-11-18

-- ============================================================================
-- DROP OLD POLICIES
-- ============================================================================
-- These policies reference organization_id which was removed in migration 20251118004

DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns from their organization" ON campaigns;
DROP POLICY IF EXISTS "Organization admins can delete campaigns" ON campaigns;

-- ============================================================================
-- VERIFY CURRENT POLICY
-- ============================================================================
-- The current policy "Users can manage campaigns for their companies" (from 20251118004)
-- handles ALL operations (SELECT, INSERT, UPDATE, DELETE) for campaigns
-- Policy logic:
--   - Users can manage campaigns they created (created_by = auth.uid())
--   - OR campaigns for companies they belong to (via user_profiles.company_profile_id)

-- No additional policies needed - the existing "FOR ALL" policy covers DELETE operations
