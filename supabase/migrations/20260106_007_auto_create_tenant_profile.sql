-- Migration: Auto-create tenant_profile on signup
-- Purpose: When users sign up as coach/consultant/company, automatically create their tenant_profile
-- Date: 2026-01-06

-- =====================================================
-- UPDATE SIGNUP HANDLER TO CREATE TENANT PROFILES
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
  org_name TEXT;
  user_type_value TEXT;
  tenant_slug TEXT;
  display_name TEXT;
  tenant_type_value TEXT;
BEGIN
  -- Extract values from user metadata (from signup form)
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'organization_name',
    'My Organization'
  );

  -- Get user_type from metadata (coach, consultant, company, or admin)
  user_type_value := COALESCE(
    NEW.raw_user_meta_data->>'user_type',
    'consultant'  -- Default to consultant for backwards compatibility
  );

  -- Get display name (for tenant profile)
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Generate org slug from organization name
  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  org_slug := trim(both '-' from org_slug);

  -- Ensure unique org slug by appending random string if needed
  IF EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) THEN
    org_slug := org_slug || '-' || substr(md5(random()::text), 1, 8);
  END IF;

  -- Create new organization for this user
  INSERT INTO organizations (
    id,
    name,
    slug,
    plan,
    subscription_status
  ) VALUES (
    uuid_generate_v4(),
    org_name,
    org_slug,
    'free',
    'active'
  ) RETURNING id INTO new_org_id;

  -- Create user profile linked to the organization
  INSERT INTO user_profiles (
    id,
    organization_id,
    full_name,
    email,
    role,
    status,
    user_type
  ) VALUES (
    NEW.id,
    new_org_id,
    display_name,
    NEW.email,
    'owner',
    'active',
    user_type_value
  );

  -- Create tenant_profile for non-admin users
  IF user_type_value IN ('coach', 'consultant', 'company') THEN
    -- Map user_type to tenant_type
    tenant_type_value := CASE user_type_value
      WHEN 'coach' THEN 'coach'
      WHEN 'consultant' THEN 'consultant'
      WHEN 'company' THEN 'school'  -- 'company' user type maps to 'school' tenant type
    END;

    -- Generate tenant slug from display name
    tenant_slug := lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g'));
    tenant_slug := trim(both '-' from tenant_slug);

    -- Ensure slug is at least 3 characters
    IF length(tenant_slug) < 3 THEN
      tenant_slug := tenant_slug || '-' || substr(md5(random()::text), 1, 6);
    END IF;

    -- Ensure unique tenant slug
    IF EXISTS (SELECT 1 FROM tenant_profiles WHERE slug = tenant_slug) THEN
      tenant_slug := tenant_slug || '-' || substr(md5(random()::text), 1, 6);
    END IF;

    -- Create tenant profile with default branding
    INSERT INTO tenant_profiles (
      user_id,
      slug,
      display_name,
      tenant_type,
      brand_config,
      email_config,
      enabled_assessments,
      subscription_tier,
      is_active
    ) VALUES (
      NEW.id,
      tenant_slug,
      display_name,
      tenant_type_value,
      '{
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
      jsonb_build_object(
        'replyTo', NEW.email,
        'senderName', display_name
      ),
      CASE tenant_type_value
        WHEN 'coach' THEN ARRAY['archetype']::TEXT[]
        WHEN 'school' THEN ARRAY['education']::TEXT[]
        ELSE ARRAY['industry4']::TEXT[]
      END,
      'starter',
      true  -- Active immediately, but needs branding setup
    );
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates organization, user profile, and tenant profile when a new user signs up. '
  'Tenant profiles are created for coach, consultant, and company (school) user types with default branding.';
