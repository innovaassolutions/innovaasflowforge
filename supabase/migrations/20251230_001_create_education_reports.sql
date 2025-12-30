-- Migration: Create Education Synthesis Reports System
-- Purpose: Enable education synthesis storage and secure token-based report access
-- Epic: 2 - Education Synthesis Reports
-- Story: 2.1 - Database & API Foundation
-- Date: 2025-12-30

-- ============================================================================
-- CREATE EDUCATION_SYNTHESIS TABLE
-- ============================================================================
-- Stores synthesis results generated from education interview campaigns
CREATE TABLE education_synthesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign & School References
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Module Identification
  module TEXT NOT NULL,

  -- Synthesis Content (full JSON from education-synthesis-agent)
  content JSONB NOT NULL,

  -- Generation Metadata
  model_used TEXT NOT NULL,
  source_token_ids UUID[] NOT NULL, -- Participant tokens used in synthesis

  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CREATE EDUCATION_REPORTS TABLE
-- ============================================================================
-- Stores report access tokens and tracking for shareable education reports
CREATE TABLE education_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Synthesis Reference
  synthesis_id UUID NOT NULL REFERENCES education_synthesis(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Access Control
  access_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Safeguarding
  has_safeguarding_signals BOOLEAN NOT NULL DEFAULT false,
  safeguarding_notified_at TIMESTAMPTZ,

  -- Generation Tracking
  generated_by UUID REFERENCES auth.users(id),

  -- Access Tracking
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
-- Performance optimization for common query patterns

-- education_synthesis indexes
CREATE INDEX idx_education_synthesis_campaign ON education_synthesis(campaign_id);
CREATE INDEX idx_education_synthesis_school ON education_synthesis(school_id);
CREATE INDEX idx_education_synthesis_module ON education_synthesis(module);
CREATE INDEX idx_education_synthesis_campaign_module ON education_synthesis(campaign_id, module);

-- education_reports indexes
CREATE UNIQUE INDEX idx_education_reports_token ON education_reports(access_token);
CREATE INDEX idx_education_reports_synthesis ON education_reports(synthesis_id);
CREATE INDEX idx_education_reports_school ON education_reports(school_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE education_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - EDUCATION_SYNTHESIS
-- ============================================================================

-- Policy 1: Organization members can view synthesis for their schools
CREATE POLICY "Organization members can view education synthesis"
  ON education_synthesis
  FOR SELECT
  USING (
    -- User has access to the school's organization
    school_id IN (
      SELECT s.id FROM schools s
      INNER JOIN user_profiles up ON up.company_profile_id = s.organization_id
      WHERE up.id = auth.uid()
    )
    OR
    -- Or user is an admin
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.user_type = 'admin'
    )
  );

-- Policy 2: Service role can insert synthesis (API route uses service role)
-- Note: INSERT operations from API routes use service role which bypasses RLS
-- This SELECT policy allows reading back inserted data

-- ============================================================================
-- RLS POLICIES - EDUCATION_REPORTS
-- ============================================================================

-- Policy 1: Organization members can manage reports for their schools
CREATE POLICY "Organization members can manage education reports"
  ON education_reports
  FOR ALL
  USING (
    -- User created this report
    generated_by = auth.uid()
    OR
    -- User has access to the school's organization
    school_id IN (
      SELECT s.id FROM schools s
      INNER JOIN user_profiles up ON up.company_profile_id = s.organization_id
      WHERE up.id = auth.uid()
    )
    OR
    -- Or user is an admin
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.user_type = 'admin'
    )
  );

-- Policy 2: Public token access for active reports (read-only)
CREATE POLICY "Public token access for active education reports"
  ON education_reports
  FOR SELECT
  USING (
    -- Report is active AND has a valid access token
    is_active = true
    AND access_token IS NOT NULL
  );

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTIONS
-- ============================================================================
-- Auto-update updated_at timestamp on row modification

CREATE OR REPLACE FUNCTION update_education_synthesis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_education_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_education_synthesis_updated_at
  BEFORE UPDATE ON education_synthesis
  FOR EACH ROW
  EXECUTE FUNCTION update_education_synthesis_updated_at();

CREATE TRIGGER set_education_reports_updated_at
  BEFORE UPDATE ON education_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_education_reports_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE education_synthesis IS 'Generated synthesis results from education interview campaigns using Four Lenses framework';
COMMENT ON COLUMN education_synthesis.content IS 'Full EducationSynthesisResult JSON: executive_summary, four_lenses, triangulation, recommendations';
COMMENT ON COLUMN education_synthesis.source_token_ids IS 'Array of education_participant_tokens.id used as input for synthesis';
COMMENT ON COLUMN education_synthesis.module IS 'Education module: student_wellbeing, teaching_learning, parent_confidence, etc.';

COMMENT ON TABLE education_reports IS 'Token-based access control for shareable education synthesis reports';
COMMENT ON COLUMN education_reports.access_token IS '256-bit cryptographic token (base64url, 43 chars) for public access';
COMMENT ON COLUMN education_reports.has_safeguarding_signals IS 'Whether synthesis identified safeguarding concerns requiring notification';
COMMENT ON COLUMN education_reports.safeguarding_notified_at IS 'Timestamp when safeguarding lead was notified via email';
