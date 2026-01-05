-- Migration: Add RLS policies for coaching_sessions table
-- Purpose: Allow tenant owners (coaches) to read their coaching sessions
-- Date: 2026-01-06

-- ============================================================================
-- STEP 1: ENSURE RLS IS ENABLED
-- ============================================================================
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: DROP EXISTING POLICIES (if any)
-- ============================================================================
DROP POLICY IF EXISTS "Tenant owners can access their coaching sessions" ON coaching_sessions;
DROP POLICY IF EXISTS "Public can access sessions with valid token" ON coaching_sessions;

-- ============================================================================
-- STEP 3: CREATE RLS POLICIES
-- ============================================================================

-- Policy: Tenant owners (coaches) can manage their coaching sessions
CREATE POLICY "Tenant owners can access their coaching sessions"
  ON coaching_sessions
  FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone with a valid access token can view the session (for reports)
CREATE POLICY "Public can access sessions with valid token"
  ON coaching_sessions
  FOR SELECT
  USING (access_token IS NOT NULL);

-- ============================================================================
-- STEP 4: ADD TABLE COMMENTS
-- ============================================================================
COMMENT ON TABLE coaching_sessions IS 'Coaching sessions for leadership archetype assessments. Stores client info, survey responses, and archetype results.';
