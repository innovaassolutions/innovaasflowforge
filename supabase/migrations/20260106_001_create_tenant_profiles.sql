-- Migration: Create Tenant Profiles Table
-- Purpose: Multi-tenant configuration for coaches, consultants, and schools
-- Date: 2026-01-06
-- Story: 3-1-database-foundation (Coaching Module)

-- ============================================================================
-- TENANT PROFILES TABLE
-- ============================================================================
-- Unified table for all tenant types (coach, consultant, school)
-- Stores branding configuration, email settings, and subscription info

CREATE TABLE IF NOT EXISTS tenant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (links to authenticated user)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tenant Identity
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'leadingwithmeaning')
  display_name TEXT NOT NULL, -- Human-readable name (e.g., 'Leading with Meaning')
  tenant_type TEXT NOT NULL CHECK (tenant_type IN ('coach', 'consultant', 'school')),

  -- Branding Configuration (JSONB for flexibility)
  -- Structure: { logo: {url, alt, width?}, colors: {...}, fonts: {...}, tagline?, welcomeMessage?, completionMessage?, showPoweredBy }
  brand_config JSONB NOT NULL DEFAULT '{
    "logo": null,
    "colors": {
      "primary": "#F25C05",
      "primaryHover": "#DC5204",
      "secondary": "#1D9BA3",
      "background": "#FFFEFB",
      "backgroundSubtle": "#FAF8F3",
      "text": "#171614",
      "textMuted": "#71706B",
      "border": "#E6E2D6"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "showPoweredBy": true
  }'::jsonb,

  -- Email Configuration
  -- Structure: { replyTo?, senderName?, emailFooter? }
  email_config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Enabled Features
  enabled_assessments TEXT[] DEFAULT ARRAY['archetype']::TEXT[],

  -- Subscription & Billing
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Custom Domain (optional)
  custom_domain TEXT UNIQUE, -- e.g., 'assessment.leadingwithmeaning.com'

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_tenant_profiles_user_id ON tenant_profiles(user_id);
CREATE INDEX idx_tenant_profiles_slug ON tenant_profiles(slug);
CREATE INDEX idx_tenant_profiles_custom_domain ON tenant_profiles(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_tenant_profiles_tenant_type ON tenant_profiles(tenant_type);
CREATE INDEX idx_tenant_profiles_is_active ON tenant_profiles(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own tenant profiles
CREATE POLICY "Users can manage their own tenant profiles"
  ON tenant_profiles
  FOR ALL
  USING (user_id = auth.uid());

-- Public can read tenant profiles by slug (for branding on public pages)
CREATE POLICY "Public can read active tenant profiles by slug"
  ON tenant_profiles
  FOR SELECT
  USING (is_active = TRUE);

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE TRIGGER tenant_profiles_updated_at
  BEFORE UPDATE ON tenant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE tenant_profiles IS 'Multi-tenant configuration for coaches, consultants, and schools';
COMMENT ON COLUMN tenant_profiles.slug IS 'URL-friendly identifier used in paths like /coach/[slug]/';
COMMENT ON COLUMN tenant_profiles.brand_config IS 'JSONB branding configuration: logo, colors, fonts, messaging';
COMMENT ON COLUMN tenant_profiles.email_config IS 'JSONB email configuration: replyTo, senderName, footer';
COMMENT ON COLUMN tenant_profiles.enabled_assessments IS 'Array of enabled assessment types (archetype, industry4, etc.)';
COMMENT ON COLUMN tenant_profiles.custom_domain IS 'Custom domain for white-label experience (optional)';
