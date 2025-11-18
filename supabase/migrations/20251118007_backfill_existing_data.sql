-- Migration: Backfill Existing Data
-- Purpose: Migrate existing campaigns and stakeholders to new structure
-- Date: 2025-11-18

-- ============================================================================
-- STEP 1: CREATE COMPANY PROFILES FROM EXISTING CAMPAIGNS
-- ============================================================================
-- For each existing campaign, create a company_profile if it doesn't exist
-- Use campaign.company_name to create the profile

INSERT INTO company_profiles (
  company_name,
  industry,
  description,
  market_scope,
  created_by,
  created_at,
  updated_at
)
SELECT DISTINCT
  c.company_name,
  'Manufacturing' AS industry,  -- Default for Industry 4.0 assessments
  c.description,
  'national' AS market_scope,  -- Default assumption
  c.created_by,
  c.created_at,
  c.updated_at
FROM campaigns c
WHERE c.company_name IS NOT NULL
  AND NOT EXISTS (
    -- Don't create duplicates
    SELECT 1 FROM company_profiles cp
    WHERE cp.company_name = c.company_name
      AND cp.created_by = c.created_by
  );

-- ============================================================================
-- STEP 2: LINK CAMPAIGNS TO COMPANY PROFILES
-- ============================================================================
-- Update campaigns.company_profile_id based on company_name match

UPDATE campaigns c
SET company_profile_id = cp.id
FROM company_profiles cp
WHERE c.company_name = cp.company_name
  AND c.created_by = cp.created_by
  AND c.company_profile_id IS NULL;

-- ============================================================================
-- STEP 3: CREATE STAKEHOLDER PROFILES FROM CAMPAIGN ASSIGNMENTS
-- ============================================================================
-- For each unique stakeholder in campaign_assignments, create a reusable profile

INSERT INTO stakeholder_profiles (
  company_profile_id,
  full_name,
  email,
  role_type,
  title,
  created_by,
  created_at,
  updated_at
)
SELECT DISTINCT ON (c.company_profile_id, ca.stakeholder_email)
  c.company_profile_id,
  ca.stakeholder_name,
  ca.stakeholder_email,
  ca.stakeholder_role,
  ca.stakeholder_title,
  c.created_by,
  ca.created_at,
  ca.updated_at
FROM campaign_assignments ca
JOIN campaigns c ON ca.campaign_id = c.id
WHERE c.company_profile_id IS NOT NULL
  AND ca.stakeholder_email IS NOT NULL
  AND NOT EXISTS (
    -- Don't create duplicates
    SELECT 1 FROM stakeholder_profiles sp
    WHERE sp.company_profile_id = c.company_profile_id
      AND sp.email = ca.stakeholder_email
  );

-- ============================================================================
-- STEP 4: LINK CAMPAIGN ASSIGNMENTS TO STAKEHOLDER PROFILES
-- ============================================================================
-- Update campaign_assignments.stakeholder_profile_id

UPDATE campaign_assignments ca
SET stakeholder_profile_id = sp.id
FROM campaigns c, stakeholder_profiles sp
WHERE ca.campaign_id = c.id
  AND sp.company_profile_id = c.company_profile_id
  AND sp.email = ca.stakeholder_email
  AND ca.stakeholder_profile_id IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES (commented out, run manually if needed)
-- ============================================================================

-- Check campaigns without company profiles:
-- SELECT id, name, company_name FROM campaigns WHERE company_profile_id IS NULL;

-- Check campaign assignments without stakeholder profiles:
-- SELECT id, stakeholder_name, stakeholder_email FROM campaign_assignments WHERE stakeholder_profile_id IS NULL;

-- Count of company profiles, stakeholder profiles, and assignments:
-- SELECT
--   (SELECT COUNT(*) FROM company_profiles) as companies,
--   (SELECT COUNT(*) FROM stakeholder_profiles) as stakeholders,
--   (SELECT COUNT(*) FROM campaign_assignments) as assignments;
