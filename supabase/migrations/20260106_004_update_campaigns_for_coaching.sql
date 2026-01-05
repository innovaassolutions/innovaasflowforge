-- Migration: Update Campaigns for Coaching Module
-- Purpose: Add tenant_id, assessment_type, and results_disclosure for coaching
-- Date: 2026-01-06
-- Story: 3-1-database-foundation (Coaching Module)

-- ============================================================================
-- ADD NEW COLUMNS TO CAMPAIGNS
-- ============================================================================

-- Tenant reference for multi-tenant coaching
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenant_profiles(id) ON DELETE SET NULL;

-- Assessment type to distinguish campaign types
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'industry4'
CHECK (assessment_type IN (
  'industry4',      -- Original Industry 4.0 assessment
  'archetype',      -- Leadership Archetypes (coaching)
  'education',      -- Education wellbeing module
  'custom'          -- Future custom assessments
));

-- Results disclosure configuration for coaching
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS results_disclosure TEXT DEFAULT 'full'
CHECK (results_disclosure IN (
  'full',    -- Show complete results to participant
  'teaser',  -- Show archetype names only + CTA to contact coach
  'none'     -- Thank you only, coach will follow up
));

-- ============================================================================
-- INDEXES FOR NEW COLUMNS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id
  ON campaigns(tenant_id)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_assessment_type
  ON campaigns(assessment_type);

-- Composite index for tenant + type queries
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_type
  ON campaigns(tenant_id, assessment_type)
  WHERE tenant_id IS NOT NULL;

-- ============================================================================
-- RLS POLICY UPDATES
-- ============================================================================

-- Tenant owners can access campaigns linked to their tenant
CREATE POLICY "Tenant owners can access their campaigns"
  ON campaigns
  FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN campaigns.tenant_id IS 'Reference to tenant_profiles for multi-tenant coaching/education';
COMMENT ON COLUMN campaigns.assessment_type IS 'Type of assessment: industry4, archetype, education, custom';
COMMENT ON COLUMN campaigns.results_disclosure IS 'How results are shown to participants: full, teaser, none';
