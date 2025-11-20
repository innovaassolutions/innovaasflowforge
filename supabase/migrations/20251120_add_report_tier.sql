-- Migration: Add Report Tier to Campaigns
-- Purpose: Enable tiered AI model selection for different report quality levels
-- Date: 2025-11-20

-- ============================================================================
-- ADD REPORT TIER COLUMN
-- ============================================================================
-- Determines which AI model to use for synthesis and assessment
-- standard: Claude Sonnet 4.5 (balanced quality/cost)
-- premium: Claude Opus 4 (highest quality)
-- enterprise: Claude Opus 4 with extended features

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS report_tier TEXT NOT NULL DEFAULT 'standard'
    CHECK (report_tier IN ('standard', 'premium', 'enterprise'));

-- Index for filtering/reporting by tier
CREATE INDEX IF NOT EXISTS idx_campaigns_report_tier ON campaigns(report_tier);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN campaigns.report_tier IS 'AI model tier for report generation: standard (Sonnet 4.5), premium/enterprise (Opus 4)';
