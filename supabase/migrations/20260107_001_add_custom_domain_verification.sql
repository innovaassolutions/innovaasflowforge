-- Migration: Add Custom Domain Verification Fields
-- Purpose: Support Cloudflare for SaaS custom domain verification
-- Date: 2026-01-07
-- Spec: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/

-- ============================================================================
-- ADD NEW COLUMNS TO tenant_profiles
-- ============================================================================
-- Note: custom_domain column already exists from initial table creation

-- Domain verification status (set to true when Cloudflare confirms DNS is valid)
ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;

-- Cloudflare custom hostname ID (for API operations: status checks, deletion)
ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS cloudflare_hostname_id TEXT;

-- When verification was initiated (for timeout handling - fail after 24 hours)
ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS domain_verification_started_at TIMESTAMPTZ;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for fast lookup of verified custom domains (used in middleware)
-- Only indexes rows where custom_domain is set AND verified
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_verified_custom_domain
ON tenant_profiles(custom_domain)
WHERE custom_domain IS NOT NULL AND domain_verified = TRUE AND is_active = TRUE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN tenant_profiles.domain_verified IS 'Whether the custom domain DNS has been verified via Cloudflare for SaaS';
COMMENT ON COLUMN tenant_profiles.cloudflare_hostname_id IS 'Cloudflare custom hostname ID for API operations (status check, deletion)';
COMMENT ON COLUMN tenant_profiles.domain_verification_started_at IS 'When domain verification was initiated, used for 24-hour timeout handling';
