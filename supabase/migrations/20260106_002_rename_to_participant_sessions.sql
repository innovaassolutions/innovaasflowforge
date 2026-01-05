-- Migration: Rename campaign_assignments to participant_sessions
-- Purpose: Align terminology with coaching module ("participants" vs enterprise "stakeholders")
-- Date: 2026-01-06
-- Story: 3-1-database-foundation (Coaching Module)
--
-- Note: The table was originally called stakeholder_sessions, then renamed to
-- campaign_assignments. Now renaming to participant_sessions for consistency
-- with coaching terminology while maintaining all existing functionality.

-- ============================================================================
-- STEP 1: RENAME TABLE
-- ============================================================================
ALTER TABLE campaign_assignments RENAME TO participant_sessions;

-- ============================================================================
-- STEP 2: ADD NEW COLUMNS FOR COACHING
-- ============================================================================

-- Client status for lead pipeline tracking
ALTER TABLE participant_sessions
ADD COLUMN IF NOT EXISTS client_status TEXT
CHECK (client_status IS NULL OR client_status IN (
  'registered',   -- Signed up, not started
  'started',      -- Began assessment
  'completed',    -- Finished assessment
  'contacted',    -- Coach reached out
  'converted',    -- Became paying client
  'archived'      -- Not a fit
));

-- Tenant reference for multi-tenant coaching
ALTER TABLE participant_sessions
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenant_profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 3: RENAME INDEXES
-- ============================================================================
ALTER INDEX IF EXISTS campaign_assignments_pkey RENAME TO participant_sessions_pkey;
ALTER INDEX IF EXISTS idx_campaign_assignments_campaign RENAME TO idx_participant_sessions_campaign;
ALTER INDEX IF EXISTS idx_campaign_assignments_stakeholder_profile RENAME TO idx_participant_sessions_profile;

-- New indexes for coaching columns
CREATE INDEX IF NOT EXISTS idx_participant_sessions_tenant_id
  ON participant_sessions(tenant_id)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_participant_sessions_client_status
  ON participant_sessions(client_status)
  WHERE client_status IS NOT NULL;

-- Composite index for tenant + status queries (lead pipeline)
CREATE INDEX IF NOT EXISTS idx_participant_sessions_tenant_status
  ON participant_sessions(tenant_id, client_status)
  WHERE tenant_id IS NOT NULL;

-- ============================================================================
-- STEP 4: RENAME CONSTRAINTS
-- ============================================================================
-- Handle constraint renames carefully (they may or may not exist depending on prior migrations)
DO $$
BEGIN
  -- Rename campaign FK constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stakeholder_sessions_campaign_id_fkey') THEN
    ALTER TABLE participant_sessions RENAME CONSTRAINT stakeholder_sessions_campaign_id_fkey TO participant_sessions_campaign_id_fkey;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campaign_assignments_stakeholder_profile_id_fkey') THEN
    ALTER TABLE participant_sessions RENAME CONSTRAINT campaign_assignments_stakeholder_profile_id_fkey TO participant_sessions_profile_id_fkey;
  END IF;
END $$;

-- ============================================================================
-- STEP 5: UPDATE RLS POLICIES
-- ============================================================================
-- Drop old policies
DROP POLICY IF EXISTS "Facilitators can manage campaign assignments" ON participant_sessions;
DROP POLICY IF EXISTS "Stakeholders can access sessions with valid token" ON participant_sessions;

-- Recreate with new names
CREATE POLICY "Facilitators can manage participant sessions"
  ON participant_sessions
  FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Participants can access sessions with valid token"
  ON participant_sessions
  FOR SELECT
  USING (access_token IS NOT NULL);

-- New policy: Tenant owners can access their participants
CREATE POLICY "Tenant owners can access their participant sessions"
  ON participant_sessions
  FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 6: CREATE BACKWARD COMPATIBILITY VIEWS
-- ============================================================================
-- These views allow existing code to work during transition
CREATE OR REPLACE VIEW campaign_assignments AS
SELECT * FROM participant_sessions;

CREATE OR REPLACE VIEW stakeholder_sessions AS
SELECT * FROM participant_sessions;

COMMENT ON VIEW campaign_assignments IS 'DEPRECATED: Use participant_sessions table directly. This view exists for backward compatibility.';
COMMENT ON VIEW stakeholder_sessions IS 'DEPRECATED: Use participant_sessions table directly. This view exists for backward compatibility.';

-- ============================================================================
-- STEP 7: UPDATE TABLE COMMENTS
-- ============================================================================
COMMENT ON TABLE participant_sessions IS 'Assessment sessions for both enterprise stakeholders and coaching participants. Tracks access tokens, interview data, transcripts, and lead pipeline status.';
COMMENT ON COLUMN participant_sessions.client_status IS 'Lead pipeline status for coaching: registered, started, completed, contacted, converted, archived';
COMMENT ON COLUMN participant_sessions.tenant_id IS 'Reference to tenant_profiles for multi-tenant coaching';
