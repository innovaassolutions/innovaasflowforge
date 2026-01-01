-- Migration: Create Voice System Tables
-- Purpose: Enable multi-vertical and user-level voice activation for interviews
-- Date: 2026-01-01
-- ADR Reference: ElevenLabs Voice Integration Research (docs/research-technical-2025-12-31.md)

-- ============================================================================
-- VERTICAL VOICE CONFIGURATION TABLE
-- System-level configuration for which verticals support voice
-- ============================================================================

CREATE TABLE vertical_voice_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vertical identification
  vertical_key TEXT UNIQUE NOT NULL,  -- 'education', 'assessment', etc.
  display_name TEXT NOT NULL,

  -- Voice enablement
  voice_enabled BOOLEAN DEFAULT false,  -- Master switch for this vertical

  -- ElevenLabs configuration
  elevenlabs_agent_id TEXT,  -- Separate agent per vertical (optional)
  voice_model TEXT DEFAULT 'flash_v2.5',  -- TTS model preference
  llm_endpoint_path TEXT NOT NULL,  -- e.g., '/api/voice/education/llm'
  system_prompt_template TEXT,  -- Base system prompt for voice mode

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_vertical_voice_config_key ON vertical_voice_config(vertical_key);
CREATE INDEX idx_vertical_voice_config_enabled ON vertical_voice_config(voice_enabled) WHERE voice_enabled = true;

-- Insert initial verticals (disabled by default)
INSERT INTO vertical_voice_config (vertical_key, display_name, llm_endpoint_path) VALUES
  ('education', 'Education Assessment', '/api/voice/education/llm'),
  ('assessment', 'Digital Transformation Assessment', '/api/voice/assessment/llm');

-- ============================================================================
-- ORGANIZATION VOICE SETTINGS TABLE
-- Organization-level voice enablement and usage quotas
-- ============================================================================

CREATE TABLE organization_voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Voice enablement
  voice_enabled BOOLEAN DEFAULT false,  -- Org-level master switch
  voice_included_in_plan BOOLEAN DEFAULT false,  -- Subscription feature flag

  -- Per-vertical enablement
  allowed_verticals TEXT[] DEFAULT '{}',  -- Which verticals org can use voice for

  -- Usage quotas
  monthly_voice_minutes_limit INTEGER DEFAULT 100,
  monthly_voice_minutes_used NUMERIC(10,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One settings record per organization
  UNIQUE(organization_id)
);

-- Indexes
CREATE INDEX idx_org_voice_settings_org ON organization_voice_settings(organization_id);
CREATE INDEX idx_org_voice_settings_enabled ON organization_voice_settings(voice_enabled) WHERE voice_enabled = true;

-- ============================================================================
-- USER VOICE PREFERENCES TABLE
-- Individual user voice mode preferences
-- ============================================================================

CREATE TABLE user_voice_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Voice preferences
  voice_enabled BOOLEAN DEFAULT true,  -- User wants voice mode available
  default_mode TEXT DEFAULT 'text' CHECK (default_mode IN ('text', 'voice')),
  auto_start_voice BOOLEAN DEFAULT false,  -- Auto-start voice when available
  preferred_voice_id TEXT,  -- Future: user's preferred ElevenLabs voice

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One preferences record per user
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_voice_prefs_user ON user_voice_preferences(user_id);

-- ============================================================================
-- EXTEND AGENT_SESSIONS FOR VOICE TRACKING
-- Add session mode and voice usage tracking
-- ============================================================================

ALTER TABLE agent_sessions
  ADD COLUMN IF NOT EXISTS session_mode TEXT DEFAULT 'text'
    CHECK (session_mode IN ('text', 'voice', 'mixed'));

ALTER TABLE agent_sessions
  ADD COLUMN IF NOT EXISTS voice_minutes_used NUMERIC(10,2) DEFAULT 0;

-- Index for voice session queries
CREATE INDEX IF NOT EXISTS idx_agent_sessions_mode ON agent_sessions(session_mode);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_voice_usage ON agent_sessions(voice_minutes_used)
  WHERE voice_minutes_used > 0;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE vertical_voice_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_voice_preferences ENABLE ROW LEVEL SECURITY;

-- Vertical Voice Config: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view vertical voice config"
  ON vertical_voice_config FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify vertical config (admin operations)
CREATE POLICY "Service role can manage vertical voice config"
  ON vertical_voice_config FOR ALL
  TO service_role
  USING (true);

-- Organization Voice Settings: Org members can view, admins can manage
CREATE POLICY "Users can view their organization voice settings"
  ON organization_voice_settings FOR SELECT
  USING (
    organization_id = auth.current_user_organization_id()
  );

CREATE POLICY "Org admins can manage voice settings"
  ON organization_voice_settings FOR ALL
  USING (
    organization_id = auth.current_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = organization_voice_settings.organization_id
      AND user_profiles.role IN ('admin', 'owner')
    )
  );

-- User Voice Preferences: Users manage their own preferences
CREATE POLICY "Users can view their own voice preferences"
  ON user_voice_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own voice preferences"
  ON user_voice_preferences FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_vertical_voice_config_updated_at
  BEFORE UPDATE ON vertical_voice_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_voice_settings_updated_at
  BEFORE UPDATE ON organization_voice_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_voice_prefs_updated_at
  BEFORE UPDATE ON user_voice_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get vertical key from campaign type
CREATE OR REPLACE FUNCTION get_vertical_key_from_campaign_type(campaign_type_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Education verticals
  IF campaign_type_input IN ('education_pilot', 'education_annual') THEN
    RETURN 'education';
  END IF;

  -- Assessment/Industry verticals
  IF campaign_type_input IN ('industry_4.0', 'digital_transformation', 'custom') THEN
    RETURN 'assessment';
  END IF;

  -- Default to assessment for unknown types
  RETURN 'assessment';
END;
$$;

-- Check if voice is available for a session
CREATE OR REPLACE FUNCTION check_voice_availability(
  input_session_token TEXT,
  input_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  vertical_key TEXT;
  vertical_config RECORD;
  org_settings RECORD;
  user_prefs RECORD;
BEGIN
  -- Get session details
  SELECT
    ag.id,
    ag.education_session_context,
    c.campaign_type,
    c.organization_id
  INTO session_record
  FROM agent_sessions ag
  LEFT JOIN education_participant_tokens ept ON ag.participant_token_id = ept.id
  LEFT JOIN campaigns c ON ept.school_id IN (
    SELECT id FROM schools WHERE organization_id = c.organization_id
  )
  WHERE ag.session_token = input_session_token
  LIMIT 1;

  IF session_record IS NULL THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Session not found');
  END IF;

  -- Determine vertical key
  vertical_key := get_vertical_key_from_campaign_type(COALESCE(session_record.campaign_type, 'education'));

  -- Check vertical config
  SELECT * INTO vertical_config
  FROM vertical_voice_config
  WHERE vertical_voice_config.vertical_key = check_voice_availability.vertical_key
  AND voice_enabled = true;

  IF vertical_config IS NULL THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Voice is not available for this interview type');
  END IF;

  -- Check organization settings
  SELECT * INTO org_settings
  FROM organization_voice_settings
  WHERE organization_id = session_record.organization_id;

  IF org_settings IS NULL THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Voice settings not configured for organization');
  END IF;

  IF NOT org_settings.voice_included_in_plan THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Voice feature requires a premium subscription');
  END IF;

  IF NOT org_settings.voice_enabled THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Voice has been disabled for your organization');
  END IF;

  IF NOT (vertical_key = ANY(org_settings.allowed_verticals)) THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Voice is not enabled for ' || vertical_config.display_name);
  END IF;

  IF org_settings.monthly_voice_minutes_used >= org_settings.monthly_voice_minutes_limit THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Monthly voice minutes quota exceeded');
  END IF;

  -- Check user preferences (if user_id provided)
  IF input_user_id IS NOT NULL THEN
    SELECT * INTO user_prefs
    FROM user_voice_preferences
    WHERE user_id = input_user_id;

    IF user_prefs IS NOT NULL AND NOT user_prefs.voice_enabled THEN
      RETURN jsonb_build_object('available', false, 'reason', 'Voice mode is disabled in your preferences');
    END IF;
  END IF;

  -- All checks passed
  RETURN jsonb_build_object(
    'available', true,
    'config', jsonb_build_object(
      'verticalKey', vertical_config.vertical_key,
      'displayName', vertical_config.display_name,
      'elevenlabsAgentId', vertical_config.elevenlabs_agent_id,
      'voiceModel', vertical_config.voice_model,
      'llmEndpointPath', vertical_config.llm_endpoint_path
    )
  );
END;
$$;

-- Track voice usage for a session
CREATE OR REPLACE FUNCTION track_voice_usage(
  input_session_token TEXT,
  input_duration_seconds NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  duration_minutes NUMERIC;
BEGIN
  duration_minutes := input_duration_seconds / 60.0;

  -- Get session and org
  SELECT
    ag.id as session_id,
    ag.voice_minutes_used,
    c.organization_id
  INTO session_record
  FROM agent_sessions ag
  LEFT JOIN education_participant_tokens ept ON ag.participant_token_id = ept.id
  LEFT JOIN schools s ON ept.school_id = s.id
  LEFT JOIN campaigns c ON c.school_id = s.id
  WHERE ag.session_token = input_session_token
  LIMIT 1;

  IF session_record IS NULL THEN
    RETURN;
  END IF;

  -- Update session usage
  UPDATE agent_sessions
  SET voice_minutes_used = COALESCE(voice_minutes_used, 0) + duration_minutes
  WHERE id = session_record.session_id;

  -- Update organization monthly usage
  UPDATE organization_voice_settings
  SET monthly_voice_minutes_used = COALESCE(monthly_voice_minutes_used, 0) + duration_minutes
  WHERE organization_id = session_record.organization_id;
END;
$$;

-- Reset monthly voice usage (for cron job)
CREATE OR REPLACE FUNCTION reset_monthly_voice_usage()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE organization_voice_settings
  SET monthly_voice_minutes_used = 0
  WHERE monthly_voice_minutes_used > 0;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE vertical_voice_config IS 'System-level configuration for voice capability per vertical (education, assessment, etc.)';
COMMENT ON TABLE organization_voice_settings IS 'Organization-level voice enablement and usage quotas';
COMMENT ON TABLE user_voice_preferences IS 'Individual user voice mode preferences';

COMMENT ON COLUMN agent_sessions.session_mode IS 'Interview mode: text, voice, or mixed';
COMMENT ON COLUMN agent_sessions.voice_minutes_used IS 'Voice minutes consumed in this session';

COMMENT ON FUNCTION get_vertical_key_from_campaign_type IS 'Maps campaign_type to vertical_key for voice config lookup';
COMMENT ON FUNCTION check_voice_availability IS 'Checks all three levels (system, org, user) to determine if voice is available';
COMMENT ON FUNCTION track_voice_usage IS 'Records voice usage for billing and quota management';
COMMENT ON FUNCTION reset_monthly_voice_usage IS 'Resets monthly voice usage counters (call via cron)';
