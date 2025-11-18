-- Migration: Remove Organization-Based Functions and Triggers
-- Purpose: Clean up old organization auto-creation logic
-- Date: 2025-11-18

-- ============================================================================
-- REMOVE OLD SIGNUP TRIGGER
-- ============================================================================
-- The handle_new_user() trigger auto-created organizations on signup
-- This is no longer needed - users choose type and create company profiles manually

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ============================================================================
-- REMOVE ORGANIZATION HELPER FUNCTIONS
-- ============================================================================
-- These functions were used for RLS policies based on organization_id
-- No longer needed with campaign-level company profiles

DROP FUNCTION IF EXISTS current_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS user_has_permission(TEXT) CASCADE;

-- ============================================================================
-- OPTIONAL: SIMPLE USER PROFILE CREATION ON SIGNUP
-- ============================================================================
-- Create a basic user profile (without organization) when users sign up
-- This ensures user_profiles row exists for auth.uid() references

CREATE OR REPLACE FUNCTION handle_new_user_simple()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create basic user profile without organization
  -- user_type will be set during onboarding flow
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new auth users
CREATE TRIGGER on_auth_user_created_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_simple();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION handle_new_user_simple IS 'Creates basic user profile on signup - user_type set during onboarding';
