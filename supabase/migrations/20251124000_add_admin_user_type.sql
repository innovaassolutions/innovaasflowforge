-- Migration: Add Admin User Type
-- Purpose: Add 'admin' user type for platform administrators with full access
-- Date: 2025-11-24

-- ============================================================================
-- UPDATE USER TYPE CONSTRAINT
-- ============================================================================
-- Drop existing constraint
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;

-- Add new constraint with 'admin' option
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_user_type_check
  CHECK (user_type IN ('consultant', 'company', 'admin'));

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON CONSTRAINT user_profiles_user_type_check ON user_profiles IS
  'Valid user types: admin (platform access), consultant (multi-client), company (single org)';
