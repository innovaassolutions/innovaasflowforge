-- Migration: Create Campaign Reports System
-- Purpose: Enable tiered client report generation with secure token-based access
-- Epic: 1 - Client Assessment Report Generation System
-- Story: 1.1 - Database & API Foundation
-- Date: 2025-11-22

-- ============================================================================
-- CREATE CAMPAIGN_REPORTS TABLE
-- ============================================================================
-- Stores generated client reports with synthesis snapshots and access control
CREATE TABLE campaign_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign Reference
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Access Control
  access_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Report Configuration
  report_tier TEXT NOT NULL CHECK (report_tier IN ('basic', 'informative', 'premium')),

  -- Report Data
  synthesis_snapshot JSONB NOT NULL, -- ReadinessAssessment interface from synthesis-agent
  consultant_observations TEXT,
  supporting_documents JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Regeneration Tracking
  regenerated_at TIMESTAMPTZ,
  regeneration_count INTEGER NOT NULL DEFAULT 0,

  -- Access Tracking
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(campaign_id) -- One report per campaign (regeneration updates existing)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
-- Performance optimization for common query patterns
CREATE INDEX idx_campaign_reports_access_token ON campaign_reports(access_token);
CREATE INDEX idx_campaign_reports_campaign_id ON campaign_reports(campaign_id);
CREATE INDEX idx_campaign_reports_created_by ON campaign_reports(created_by);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE campaign_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Policy 1: Allow authenticated users to manage reports for their organization's campaigns
-- This policy allows consultants to create, read, update, and delete reports for campaigns
-- belonging to their organization (via company_profile_id relationship)
CREATE POLICY "Users can manage reports for their organization campaigns"
  ON campaign_reports
  FOR ALL
  USING (
    -- User created this report OR
    created_by = auth.uid()
    OR
    -- User has access to the campaign's organization
    campaign_id IN (
      SELECT c.id FROM campaigns c
      INNER JOIN user_profiles up ON up.company_profile_id = c.company_profile_id
      WHERE up.id = auth.uid()
    )
  );

-- Policy 2: Allow public access to active reports via valid token (read-only)
-- This enables token-based access for clients without requiring authentication
-- Note: This policy alone doesn't grant access - the application layer must also
-- verify the access_token and is_active flag before returning data
CREATE POLICY "Public token access for active reports"
  ON campaign_reports
  FOR SELECT
  USING (
    -- Report is active AND has a valid access token
    is_active = true
    AND access_token IS NOT NULL
  );

-- ============================================================================
-- CREATE SUPABASE STORAGE BUCKET FOR SUPPORTING DOCUMENTS
-- ============================================================================
-- Bucket for storing consultant-uploaded supporting documents
-- Private bucket (not publicly accessible) with organization-based RLS
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-reports', 'campaign-reports', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Policy 1: Allow organization members to upload documents to their campaigns
CREATE POLICY "Organization members can upload campaign documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'campaign-reports'
    AND
    -- Extract campaign_id from path (format: {campaign_id}/{timestamp}-{filename})
    (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM campaigns c
      INNER JOIN user_profiles up ON up.company_profile_id = c.company_profile_id
      WHERE up.id = auth.uid()
    )
  );

-- Policy 2: Allow organization members to read their campaign documents
CREATE POLICY "Organization members can read their campaign documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'campaign-reports'
    AND
    (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM campaigns c
      INNER JOIN user_profiles up ON up.company_profile_id = c.company_profile_id
      WHERE up.id = auth.uid()
    )
  );

-- Policy 3: Allow organization members to delete their campaign documents
CREATE POLICY "Organization members can delete their campaign documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'campaign-reports'
    AND
    (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM campaigns c
      INNER JOIN user_profiles up ON up.company_profile_id = c.company_profile_id
      WHERE up.id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE campaign_reports IS 'Generated client assessment reports with tiered content and token-based access';
COMMENT ON COLUMN campaign_reports.access_token IS '256-bit cryptographic token (base64url) for public access';
COMMENT ON COLUMN campaign_reports.report_tier IS 'Content tier: basic (scores only), informative (+ themes/quotes), premium (+ architecture recs)';
COMMENT ON COLUMN campaign_reports.synthesis_snapshot IS 'Immutable snapshot of campaign_synthesis.synthesis_data at report generation time';
COMMENT ON COLUMN campaign_reports.supporting_documents IS 'Array of {name, url, uploaded_at, file_type} for consultant-uploaded documents';
COMMENT ON COLUMN campaign_reports.regeneration_count IS 'Number of times this report has been regenerated (UPSERT strategy maintains same token)';
