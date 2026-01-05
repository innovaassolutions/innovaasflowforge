-- Migration: Seed Mark Nickerson's Tenant Profile
-- Purpose: Create the initial tenant profile for Leading with Meaning
-- Date: 2026-01-06
-- Story: 3-1-database-foundation (Coaching Module)
--
-- Note: This migration seeds Mark's profile.
-- Mark's user_id will need to be updated after he creates an account.
-- For now, we use a placeholder that will be updated via admin dashboard.

-- ============================================================================
-- SEED LEADING WITH MEANING TENANT PROFILE
-- ============================================================================

-- Insert Mark's tenant profile with full branding configuration
-- Note: user_id is set to NULL initially and will be linked when Mark creates an account
INSERT INTO tenant_profiles (
  slug,
  display_name,
  tenant_type,
  brand_config,
  email_config,
  enabled_assessments,
  subscription_tier,
  is_active,
  custom_domain,
  user_id
)
SELECT
  'leadingwithmeaning',
  'Leading with Meaning',
  'coach',
  '{
    "logo": {
      "url": "/flowforge/brand/lwm_logo.png",
      "alt": "Leading with Meaning",
      "width": 200
    },
    "colors": {
      "primary": "#1e3a5f",
      "primaryHover": "#153050",
      "secondary": "#c4776a",
      "background": "#f5f3ef",
      "backgroundSubtle": "#ebe8e3",
      "text": "#1e3a5f",
      "textMuted": "#5a6a7a",
      "border": "#e0dcd5"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "tagline": "Leadership Coaching",
    "welcomeMessage": "Lead with clarity. Manage with confidence. Do your best work without losing yourself.",
    "completionMessage": "Thank you for completing your Leadership Archetype Assessment. Your insights have been recorded and will help guide our coaching conversation.",
    "showPoweredBy": true
  }'::jsonb,
  '{
    "replyTo": "mark@leadingwithmeaning.com",
    "senderName": "Mark Nickerson - Leading with Meaning",
    "emailFooter": "Leading with Meaning | Executive Leadership Coaching"
  }'::jsonb,
  ARRAY['archetype']::TEXT[],
  'professional',
  true,
  'assessment.leadingwithmeaning.com',
  -- Link to admin user (Todd) temporarily - Mark will get his own account
  (SELECT id FROM auth.users WHERE email = 'todd@innovaas.com' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_profiles WHERE slug = 'leadingwithmeaning'
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE tenant_profiles IS 'Mark Nickerson (Leading with Meaning) profile seeded as first coaching tenant';
