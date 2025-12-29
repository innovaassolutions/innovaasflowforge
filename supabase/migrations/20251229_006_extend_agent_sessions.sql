-- Migration: Extend Agent Sessions for Education Module
-- Purpose: Add participant token reference for pseudonymous education sessions
-- Date: 2025-12-29
-- ADR Reference: ADR-003 (Agent Session Linkage Strategy)

-- ============================================================================
-- EXTEND AGENT_SESSIONS TABLE
-- Add nullable participant_token_id for education campaigns
-- ============================================================================

-- Add participant token reference (nullable for non-education sessions)
ALTER TABLE agent_sessions
    ADD COLUMN IF NOT EXISTS participant_token_id UUID
    REFERENCES education_participant_tokens(id) ON DELETE SET NULL;

-- Add education-specific session metadata
ALTER TABLE agent_sessions
    ADD COLUMN IF NOT EXISTS education_session_context JSONB;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookups by participant token
CREATE INDEX IF NOT EXISTS idx_agent_sessions_participant_token
    ON agent_sessions(participant_token_id);

-- Education session context queries (GIN for JSONB)
CREATE INDEX IF NOT EXISTS idx_agent_sessions_education_context
    ON agent_sessions USING GIN(education_session_context)
    WHERE education_session_context IS NOT NULL;

-- ============================================================================
-- EDUCATION SESSION CONTEXT SCHEMA (documented via comment)
-- ============================================================================

/*
education_session_context JSONB schema:

{
    "module": "student_wellbeing" | "teaching_learning" | "parent_confidence" | ...,
    "participant_type": "student" | "teacher" | "parent" | "leadership",

    "cohort_metadata": {
        "year_band": "10",
        "division": "secondary",
        "role_category": "classroom_teacher"
    },

    "trust_framing": {
        "anonymity_confirmed": true,
        "rapport_phase_complete": true
    },

    "safeguarding": {
        "flags_detected": [],
        "alerts_generated": []
    },

    "progress": {
        "questions_asked": 12,
        "sections_completed": ["opening", "daily_experience", "academic_life"],
        "estimated_completion": 0.65
    }
}
*/

-- ============================================================================
-- VALIDATION FUNCTION
-- Ensures education sessions have required context
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_education_agent_session()
RETURNS TRIGGER AS $$
BEGIN
    -- If participant_token_id is set, this is an education session
    IF NEW.participant_token_id IS NOT NULL THEN
        -- Must have education_session_context
        IF NEW.education_session_context IS NULL THEN
            RAISE EXCEPTION 'Education agent sessions must have education_session_context';
        END IF;

        -- Validate required context fields
        IF NOT (NEW.education_session_context ? 'module') THEN
            RAISE EXCEPTION 'education_session_context must include module';
        END IF;

        IF NOT (NEW.education_session_context ? 'participant_type') THEN
            RAISE EXCEPTION 'education_session_context must include participant_type';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
DROP TRIGGER IF EXISTS validate_education_agent_session_trigger ON agent_sessions;
CREATE TRIGGER validate_education_agent_session_trigger
    BEFORE INSERT OR UPDATE ON agent_sessions
    FOR EACH ROW
    EXECUTE FUNCTION validate_education_agent_session();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create an education agent session
CREATE OR REPLACE FUNCTION create_education_agent_session(
    input_participant_token_id UUID,
    input_agent_type TEXT,
    input_module TEXT,
    input_participant_type TEXT,
    input_cohort_metadata JSONB,
    input_system_prompt TEXT
)
RETURNS UUID AS $$
DECLARE
    new_session_id UUID;
    education_context JSONB;
BEGIN
    -- Build education session context
    education_context := jsonb_build_object(
        'module', input_module,
        'participant_type', input_participant_type,
        'cohort_metadata', input_cohort_metadata,
        'trust_framing', jsonb_build_object(
            'anonymity_confirmed', false,
            'rapport_phase_complete', false
        ),
        'safeguarding', jsonb_build_object(
            'flags_detected', '[]'::jsonb,
            'alerts_generated', '[]'::jsonb
        ),
        'progress', jsonb_build_object(
            'questions_asked', 0,
            'sections_completed', '[]'::jsonb,
            'estimated_completion', 0.0
        )
    );

    -- Create the session
    INSERT INTO agent_sessions (
        stakeholder_session_id, -- NULL for education sessions
        participant_token_id,
        agent_type,
        system_prompt,
        education_session_context
    ) VALUES (
        NULL,
        input_participant_token_id,
        input_agent_type,
        input_system_prompt,
        education_context
    )
    RETURNING id INTO new_session_id;

    RETURN new_session_id;
END;
$$ LANGUAGE plpgsql;

-- Update education session progress
CREATE OR REPLACE FUNCTION update_education_session_progress(
    input_session_id UUID,
    input_questions_asked INTEGER,
    input_sections_completed JSONB,
    input_estimated_completion DECIMAL(3,2)
)
RETURNS VOID AS $$
BEGIN
    UPDATE agent_sessions
    SET
        education_session_context = jsonb_set(
            jsonb_set(
                jsonb_set(
                    education_session_context,
                    '{progress,questions_asked}',
                    to_jsonb(input_questions_asked)
                ),
                '{progress,sections_completed}',
                input_sections_completed
            ),
            '{progress,estimated_completion}',
            to_jsonb(input_estimated_completion)
        ),
        updated_at = NOW()
    WHERE id = input_session_id;
END;
$$ LANGUAGE plpgsql;

-- Record safeguarding flag in session
CREATE OR REPLACE FUNCTION record_safeguarding_flag(
    input_session_id UUID,
    input_flag JSONB
)
RETURNS VOID AS $$
BEGIN
    UPDATE agent_sessions
    SET
        education_session_context = jsonb_set(
            education_session_context,
            '{safeguarding,flags_detected}',
            (education_session_context->'safeguarding'->'flags_detected') || input_flag
        ),
        updated_at = NOW()
    WHERE id = input_session_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICY UPDATES
-- Extend existing policies to cover education sessions
-- ============================================================================

-- Policy for education sessions via participant token
CREATE POLICY "Token holders can access their education sessions"
    ON agent_sessions FOR SELECT
    USING (
        participant_token_id IS NOT NULL
        -- Token validation happens at application layer
    );

-- Policy for organization users to view education sessions
CREATE POLICY "Users can view education sessions in their organization"
    ON agent_sessions FOR SELECT
    USING (
        participant_token_id IN (
            SELECT ept.id
            FROM education_participant_tokens ept
            JOIN schools s ON ept.school_id = s.id
            WHERE s.organization_id = auth.current_user_organization_id()
        )
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN agent_sessions.participant_token_id IS 'Education participant token (null for industry sessions)';
COMMENT ON COLUMN agent_sessions.education_session_context IS 'Education-specific context: module, progress, safeguarding flags';
COMMENT ON FUNCTION create_education_agent_session IS 'Creates agent session for education interview with proper context';
COMMENT ON FUNCTION update_education_session_progress IS 'Updates interview progress tracking';
COMMENT ON FUNCTION record_safeguarding_flag IS 'Records safeguarding concern detected during interview';
