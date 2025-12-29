-- Migration: Create Education Participant Tokens Table
-- Purpose: Pseudonymous identifiers for education module participants
-- Date: 2025-12-29
-- ADR Reference: ADR-002 (Pseudonymous Token Architecture)

-- ============================================================================
-- EDUCATION PARTICIPANT TOKENS TABLE
-- Persistent pseudonymous tokens - NO IDENTITY DATA STORED
-- ============================================================================

CREATE TABLE education_participant_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The pseudonymous token (public identifier)
    -- Format: ff_edu_ + 32 hex characters
    -- Example: ff_edu_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
    token VARCHAR(50) NOT NULL UNIQUE,

    -- Campaign and school context
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

    -- Minimal metadata for aggregation (NOT identification)
    participant_type VARCHAR(20) NOT NULL, -- 'student', 'teacher', 'parent', 'leadership'

    cohort_metadata JSONB DEFAULT '{}'::jsonb,
    -- Example for student: { "year_band": "10", "division": "secondary" }
    -- Example for teacher: { "division": "secondary", "role_category": "classroom_teacher" }
    -- Example for parent: { "year_band": "10" }
    -- Example for leadership: { "role_category": "deputy_head" }

    -- Session tracking
    first_session_at TIMESTAMPTZ DEFAULT NOW(),
    last_session_at TIMESTAMPTZ,
    session_count INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,

    -- Completion tracking per module
    modules_started JSONB DEFAULT '[]'::jsonb, -- Array of module names started
    modules_completed JSONB DEFAULT '[]'::jsonb, -- Array of module names completed

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- 'active': Can participate
    -- 'completed': Finished all assigned modules
    -- 'inactive': No longer participating

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ============================================================================
    -- CRITICAL: NO IDENTITY FIELDS
    -- The following are NEVER stored:
    -- - name
    -- - email
    -- - student_id / employee_id
    -- - any PII
    --
    -- School maintains token→identity mapping externally (escrow)
    -- ============================================================================

    -- Metadata for extensibility
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast token lookup (primary access pattern)
CREATE INDEX idx_participant_tokens_token
    ON education_participant_tokens(token);

-- Campaign-level queries
CREATE INDEX idx_participant_tokens_campaign
    ON education_participant_tokens(campaign_id);

-- School-level queries
CREATE INDEX idx_participant_tokens_school
    ON education_participant_tokens(school_id);

-- Participant type filtering (for aggregation)
CREATE INDEX idx_participant_tokens_type
    ON education_participant_tokens(participant_type);

-- Status filtering
CREATE INDEX idx_participant_tokens_status
    ON education_participant_tokens(status);

-- Cohort metadata queries (GIN for JSONB)
CREATE INDEX idx_participant_tokens_cohort
    ON education_participant_tokens USING GIN(cohort_metadata);

-- Activity tracking
CREATE INDEX idx_participant_tokens_last_activity
    ON education_participant_tokens(last_session_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE education_participant_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view tokens for schools in their organization (for analytics)
CREATE POLICY "Users can view tokens in their organization"
    ON education_participant_tokens FOR SELECT
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Tokens are created via API (service role) during code redemption
-- No direct INSERT policy for authenticated users

-- Users can update token status (e.g., mark as completed)
CREATE POLICY "Users can update tokens in their organization"
    ON education_participant_tokens FOR UPDATE
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Public policy for token-based session access (anonymous)
-- Allows participants to access their sessions via token
CREATE POLICY "Token holders can view their own record"
    ON education_participant_tokens FOR SELECT
    USING (true); -- Token validation happens at application layer

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate a cryptographically secure participant token
CREATE OR REPLACE FUNCTION generate_participant_token()
RETURNS TEXT AS $$
DECLARE
    random_hex TEXT;
BEGIN
    -- Generate 32 random hex characters (128 bits of entropy)
    random_hex := encode(gen_random_bytes(16), 'hex');
    RETURN 'ff_edu_' || random_hex;
END;
$$ LANGUAGE plpgsql;

-- Create participant token from redeemed access code
CREATE OR REPLACE FUNCTION create_participant_from_code(
    input_access_code_id UUID,
    input_campaign_id UUID,
    input_school_id UUID,
    input_code_type VARCHAR(20),
    input_cohort_metadata JSONB
)
RETURNS TABLE (
    token TEXT,
    participant_id UUID
) AS $$
DECLARE
    new_token TEXT;
    new_id UUID;
BEGIN
    -- Generate unique token
    new_token := generate_participant_token();

    -- Ensure uniqueness (collision extremely unlikely but check anyway)
    WHILE EXISTS (SELECT 1 FROM education_participant_tokens WHERE token = new_token) LOOP
        new_token := generate_participant_token();
    END LOOP;

    -- Create participant record
    INSERT INTO education_participant_tokens (
        token,
        campaign_id,
        school_id,
        participant_type,
        cohort_metadata
    ) VALUES (
        new_token,
        input_campaign_id,
        input_school_id,
        input_code_type,
        input_cohort_metadata
    )
    RETURNING id INTO new_id;

    RETURN QUERY SELECT new_token, new_id;
END;
$$ LANGUAGE plpgsql;

-- Update session activity (called after each message)
CREATE OR REPLACE FUNCTION update_participant_activity(
    input_token TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE education_participant_tokens
    SET
        last_session_at = NOW(),
        session_count = session_count + 1,
        total_messages = total_messages + 1,
        updated_at = NOW()
    WHERE token = input_token;
END;
$$ LANGUAGE plpgsql;

-- Mark module as started
CREATE OR REPLACE FUNCTION mark_module_started(
    input_token TEXT,
    input_module TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE education_participant_tokens
    SET
        modules_started = modules_started || to_jsonb(input_module),
        updated_at = NOW()
    WHERE token = input_token
      AND NOT (modules_started ? input_module);
END;
$$ LANGUAGE plpgsql;

-- Mark module as completed
CREATE OR REPLACE FUNCTION mark_module_completed(
    input_token TEXT,
    input_module TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE education_participant_tokens
    SET
        modules_completed = modules_completed || to_jsonb(input_module),
        updated_at = NOW()
    WHERE token = input_token
      AND NOT (modules_completed ? input_module);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_participant_tokens_updated_at
    BEFORE UPDATE ON education_participant_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE education_participant_tokens IS 'Pseudonymous participant identifiers - NO IDENTITY DATA';
COMMENT ON COLUMN education_participant_tokens.token IS 'Unique pseudonymous token (ff_edu_ + 32 hex chars)';
COMMENT ON COLUMN education_participant_tokens.participant_type IS 'Type: student, teacher, parent, leadership';
COMMENT ON COLUMN education_participant_tokens.cohort_metadata IS 'Aggregation metadata only (year_band, division) - NOT identity';
COMMENT ON FUNCTION generate_participant_token IS 'Creates cryptographically secure ff_edu_ prefixed token';
COMMENT ON FUNCTION create_participant_from_code IS 'Creates token record from redeemed access code';
