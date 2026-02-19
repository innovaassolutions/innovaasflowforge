-- Migration: Add 'coach' to user_type CHECK constraint
-- Purpose: Allow coach users to be created via signup trigger
-- Date: 2026-02-19
--
-- The original constraint (from 20251124000) only allowed:
--   'consultant', 'company', 'admin'
-- The handle_new_user() trigger (from 20260106_007) tries to insert
-- user_type = 'coach', which violates the constraint and causes
-- the entire trigger to fail silently — resulting in users with
-- no user_profiles or tenant_profiles.

-- Drop the restrictive constraint
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;

-- Add updated constraint including 'coach'
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_user_type_check
  CHECK (user_type IN ('consultant', 'company', 'admin', 'coach'));

COMMENT ON CONSTRAINT user_profiles_user_type_check ON user_profiles IS
  'Valid user types: admin (platform), consultant (multi-client), company (institution), coach (coaching)';
