# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2026-01-07-custom-domain-whitelabel/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## Overview

The `tenant_profiles` table already has a `custom_domain` column. This migration adds:
1. `domain_verified` - Boolean flag for verification status
2. `cloudflare_hostname_id` - Reference to Cloudflare custom hostname
3. `domain_verification_started_at` - Timestamp for verification timeout handling

## Migration: Add Custom Domain Fields

```sql
-- Migration: Add Custom Domain Verification Fields
-- Purpose: Support Cloudflare for SaaS custom domain verification
-- Date: 2026-01-07

-- ============================================================================
-- ADD NEW COLUMNS TO tenant_profiles
-- ============================================================================

-- Domain verification status
ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;

-- Cloudflare custom hostname ID (for API operations)
ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS cloudflare_hostname_id TEXT;

-- When verification was initiated (for timeout handling)
ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS domain_verification_started_at TIMESTAMPTZ;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for verified domains (used in middleware lookup)
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_verified_domain
ON tenant_profiles(custom_domain)
WHERE custom_domain IS NOT NULL AND domain_verified = TRUE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN tenant_profiles.domain_verified IS 'Whether the custom domain DNS has been verified via Cloudflare';
COMMENT ON COLUMN tenant_profiles.cloudflare_hostname_id IS 'Cloudflare custom hostname ID for API operations';
COMMENT ON COLUMN tenant_profiles.domain_verification_started_at IS 'When domain verification was initiated, for timeout handling';
```

## Updated Table Schema

After migration, `tenant_profiles` will have:

| Column | Type | Description |
|--------|------|-------------|
| `custom_domain` | TEXT UNIQUE | The custom subdomain (e.g., `assessment.leadingwithmeaning.com`) |
| `domain_verified` | BOOLEAN | Whether DNS verification passed |
| `cloudflare_hostname_id` | TEXT | Cloudflare API reference ID |
| `domain_verification_started_at` | TIMESTAMPTZ | When verification was initiated |

## Domain Lookup Query

Used by middleware for tenant lookup by custom domain:

```sql
-- Fast lookup for verified custom domains
SELECT id, slug, tenant_type, brand_config, display_name
FROM tenant_profiles
WHERE custom_domain = $1
  AND domain_verified = TRUE
  AND is_active = TRUE;
```

## Domain Configuration Query

Used by branding settings to get domain status:

```sql
-- Get domain configuration status
SELECT
  custom_domain,
  domain_verified,
  cloudflare_hostname_id,
  domain_verification_started_at,
  CASE
    WHEN custom_domain IS NULL THEN 'not_configured'
    WHEN domain_verified = TRUE THEN 'verified'
    WHEN domain_verification_started_at IS NOT NULL
      AND domain_verification_started_at > NOW() - INTERVAL '24 hours' THEN 'pending'
    ELSE 'failed'
  END as domain_status
FROM tenant_profiles
WHERE id = $1;
```

## Data Integrity Rules

1. **Uniqueness**: `custom_domain` is already UNIQUE - no two tenants can claim the same domain
2. **Format Validation**: Application layer validates subdomain format before insert
3. **Cleanup**: If tenant deletes domain, also delete from Cloudflare via API
4. **Timeout**: Verification started >24 hours ago without success = failed status
