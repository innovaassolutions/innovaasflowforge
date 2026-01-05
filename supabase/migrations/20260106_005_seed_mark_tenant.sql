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
      "url": "https://leadingwithmeaning.com/logo.png",
      "alt": "Leading with Meaning",
      "width": 180
    },
    "colors": {
      "primary": "#2C5530",
      "primaryHover": "#234428",
      "secondary": "#C4A35A",
      "background": "#FDFCF9",
      "backgroundSubtle": "#F7F5F0",
      "text": "#1A1A1A",
      "textMuted": "#666666",
      "border": "#E5E2D9"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Lato"
    },
    "tagline": "Discover Your Leadership Archetype",
    "welcomeMessage": "Welcome to your Leadership Archetype Assessment. This conversation will help you discover your authentic leadership style and how it shows up under pressure.",
    "completionMessage": "Thank you for completing your Leadership Archetype Assessment. Your results reveal important insights about your leadership approach.",
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
