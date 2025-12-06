-- Migration: Set todd.abraham@innovaas.co as Admin
-- Purpose: Grant platform admin access to resolve data visibility issue
-- Date: 2025-12-06

-- ============================================================================
-- SET ADMIN USER TYPE
-- ============================================================================
-- Update todd's user profile to admin type
-- This allows bypassing RLS policies to see all campaigns across all companies

UPDATE user_profiles
SET user_type = 'admin'
WHERE email = 'todd.abraham@innovaas.co';

-- ============================================================================
-- VERIFICATION QUERY (comment - for reference)
-- ============================================================================
-- Run this to verify:
-- SELECT id, email, user_type, company_profile_id FROM user_profiles WHERE email = 'todd.abraham@innovaas.co';

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE user_profiles IS 'User profiles with types: admin (platform-wide access), consultant (multi-client), company (single org)';
