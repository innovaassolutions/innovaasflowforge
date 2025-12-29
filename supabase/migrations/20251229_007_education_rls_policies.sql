-- Migration: Education Module RLS Policies and Permissions
-- Purpose: Comprehensive security policies for education tables
-- Date: 2025-12-29
-- Consolidates and verifies all education-related RLS policies

-- ============================================================================
-- PERMISSION HELPER: Check if user can manage schools
-- ============================================================================

-- Add education-specific permissions to user_profiles permissions JSONB
-- Expected permissions:
-- - manage_schools: Create, update, delete schools
-- - manage_education_campaigns: Create education campaigns
-- - view_safeguarding_alerts: See safeguarding dashboard
-- - acknowledge_safeguarding_alerts: Acknowledge and resolve alerts
-- - generate_access_codes: Generate participant access codes
-- - view_education_analytics: See aggregated education analytics

-- Helper function to check education permissions
CREATE OR REPLACE FUNCTION auth.user_has_education_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    has_perm BOOLEAN;
BEGIN
    SELECT role INTO user_role
    FROM user_profiles
    WHERE id = auth.uid();

    -- Owners and admins have all education permissions
    IF user_role IN ('owner', 'admin') THEN
        RETURN TRUE;
    END IF;

    -- Check granular education permissions
    SELECT (permissions->'education'->permission_name)::boolean INTO has_perm
    FROM user_profiles
    WHERE id = auth.uid();

    RETURN COALESCE(has_perm, FALSE);
END;
$$;

-- ============================================================================
-- VERIFY SCHOOLS TABLE RLS
-- (Created in migration 001, verify here)
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for clean state
DROP POLICY IF EXISTS "Users can view schools in their organization" ON schools;
DROP POLICY IF EXISTS "Users can create schools in their organization" ON schools;
DROP POLICY IF EXISTS "Users can update schools in their organization" ON schools;
DROP POLICY IF EXISTS "Admins can delete schools in their organization" ON schools;

-- Recreate with verified logic
CREATE POLICY "Users can view schools in their organization"
    ON schools FOR SELECT
    USING (organization_id = auth.current_user_organization_id());

CREATE POLICY "Users can create schools in their organization"
    ON schools FOR INSERT
    WITH CHECK (
        organization_id = auth.current_user_organization_id()
        AND auth.user_has_education_permission('manage_schools')
    );

CREATE POLICY "Users can update schools in their organization"
    ON schools FOR UPDATE
    USING (
        organization_id = auth.current_user_organization_id()
        AND auth.user_has_education_permission('manage_schools')
    );

CREATE POLICY "Admins can delete schools in their organization"
    ON schools FOR DELETE
    USING (
        organization_id = auth.current_user_organization_id()
        AND auth.user_has_education_permission('manage_schools')
    );

-- ============================================================================
-- VERIFY EDUCATION_ACCESS_CODES RLS
-- ============================================================================

ALTER TABLE education_access_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view access codes in their organization" ON education_access_codes;
DROP POLICY IF EXISTS "Users can create access codes in their organization" ON education_access_codes;
DROP POLICY IF EXISTS "Users can update access codes in their organization" ON education_access_codes;
DROP POLICY IF EXISTS "Anyone can validate active codes" ON education_access_codes;

CREATE POLICY "Users can view access codes in their organization"
    ON education_access_codes FOR SELECT
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

CREATE POLICY "Users can create access codes in their organization"
    ON education_access_codes FOR INSERT
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
        AND auth.user_has_education_permission('generate_access_codes')
    );

CREATE POLICY "Users can update access codes in their organization"
    ON education_access_codes FOR UPDATE
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Public validation policy (for anonymous code redemption)
CREATE POLICY "Anyone can validate active codes"
    ON education_access_codes FOR SELECT
    USING (status = 'active' AND expires_at > NOW());

-- ============================================================================
-- VERIFY EDUCATION_PARTICIPANT_TOKENS RLS
-- ============================================================================

ALTER TABLE education_participant_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tokens in their organization" ON education_participant_tokens;
DROP POLICY IF EXISTS "Users can update tokens in their organization" ON education_participant_tokens;
DROP POLICY IF EXISTS "Token holders can view their own record" ON education_participant_tokens;

CREATE POLICY "Users can view tokens in their organization"
    ON education_participant_tokens FOR SELECT
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

CREATE POLICY "Users can update tokens in their organization"
    ON education_participant_tokens FOR UPDATE
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Public policy for token-based session access
-- Token validation happens at application layer for security
CREATE POLICY "Public can look up tokens for session access"
    ON education_participant_tokens FOR SELECT
    USING (true);

-- ============================================================================
-- VERIFY EDUCATION_SAFEGUARDING_ALERTS RLS
-- ============================================================================

ALTER TABLE education_safeguarding_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view alerts in their organization" ON education_safeguarding_alerts;
DROP POLICY IF EXISTS "Users can update alerts in their organization" ON education_safeguarding_alerts;

CREATE POLICY "Users can view alerts in their organization"
    ON education_safeguarding_alerts FOR SELECT
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
        AND auth.user_has_education_permission('view_safeguarding_alerts')
    );

CREATE POLICY "Users can update alerts in their organization"
    ON education_safeguarding_alerts FOR UPDATE
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
        AND auth.user_has_education_permission('acknowledge_safeguarding_alerts')
    );

-- ============================================================================
-- CAMPAIGN EDUCATION POLICIES
-- Extend campaign policies for education-specific access
-- ============================================================================

-- Policy for education campaign creation (requires school access)
CREATE POLICY "Users can create education campaigns for their schools"
    ON campaigns FOR INSERT
    WITH CHECK (
        -- For education campaigns, must have access to the school
        (campaign_type NOT IN ('education_pilot', 'education_annual'))
        OR
        (
            school_id IN (
                SELECT id FROM schools
                WHERE organization_id = auth.current_user_organization_id()
            )
            AND auth.user_has_education_permission('manage_education_campaigns')
        )
    );

-- ============================================================================
-- SYNTHESIS TABLE EXTENSION FOR EDUCATION
-- Add education-specific synthesis policies
-- ============================================================================

-- Add source_token_ids column if not exists (for education synthesis)
ALTER TABLE synthesis
    ADD COLUMN IF NOT EXISTS source_token_ids UUID[];

-- Index for token-based synthesis lookups
CREATE INDEX IF NOT EXISTS idx_synthesis_source_tokens
    ON synthesis USING GIN(source_token_ids)
    WHERE source_token_ids IS NOT NULL;

-- ============================================================================
-- SERVICE ROLE BYPASS
-- Service role (server-side API) bypasses RLS for:
-- - Token generation during code redemption
-- - Safeguarding alert creation during AI analysis
-- - Synthesis generation
-- This is automatic in Supabase for service_role key
-- ============================================================================

-- ============================================================================
-- GRANT STATEMENTS
-- Ensure proper role access
-- ============================================================================

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION auth.user_has_education_permission TO authenticated;

-- Grant usage on education helper functions
GRANT EXECUTE ON FUNCTION generate_access_code TO authenticated;
GRANT EXECUTE ON FUNCTION generate_participant_token TO authenticated;
GRANT EXECUTE ON FUNCTION create_participant_from_code TO authenticated;
GRANT EXECUTE ON FUNCTION update_participant_activity TO authenticated;
GRANT EXECUTE ON FUNCTION mark_module_started TO authenticated;
GRANT EXECUTE ON FUNCTION mark_module_completed TO authenticated;
GRANT EXECUTE ON FUNCTION create_safeguarding_alert TO authenticated;
GRANT EXECUTE ON FUNCTION mark_alert_sent TO authenticated;
GRANT EXECUTE ON FUNCTION acknowledge_alert TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_alert TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION create_education_agent_session TO authenticated;
GRANT EXECUTE ON FUNCTION update_education_session_progress TO authenticated;
GRANT EXECUTE ON FUNCTION record_safeguarding_flag TO authenticated;

-- Grant to anon for public code redemption
GRANT EXECUTE ON FUNCTION redeem_access_code TO anon;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION auth.user_has_education_permission IS 'Checks if user has specific education module permission';
