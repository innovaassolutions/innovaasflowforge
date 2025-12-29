-- Migration: Create Education Access Codes Table
-- Purpose: One-time access codes for pseudonymous participant authentication
-- Date: 2025-12-29
-- ADR Reference: ADR-002 (Pseudonymous Token Architecture)

-- ============================================================================
-- EDUCATION ACCESS CODES TABLE
-- School-generated one-time codes distributed to participants
-- ============================================================================

CREATE TABLE education_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Campaign and school context
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

    -- Code properties
    code VARCHAR(20) NOT NULL UNIQUE,
    code_type VARCHAR(20) NOT NULL, -- 'student', 'teacher', 'parent', 'leadership'

    -- Cohort metadata (for aggregation, NOT identification)
    cohort_metadata JSONB DEFAULT '{}'::jsonb,
    -- Example: { "year_band": "10", "division": "secondary" }
    -- Example: { "division": "secondary", "role_category": "classroom_teacher" }

    -- Lifecycle management
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- 'active': Ready for use
    -- 'used': Redeemed (one-time)
    -- 'expired': Past expiration date
    -- 'revoked': Manually invalidated

    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,

    -- Audit trail (but NOT identity - school maintains code→person mapping)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID, -- School admin who generated the code

    -- Batch tracking (for bulk generation)
    batch_id UUID, -- Groups codes generated together
    batch_name TEXT -- e.g., "Year 10 Students - Batch 1"
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookup for code validation (active codes only)
CREATE INDEX idx_access_codes_code_active
    ON education_access_codes(code)
    WHERE status = 'active';

-- Campaign-level queries
CREATE INDEX idx_access_codes_campaign
    ON education_access_codes(campaign_id);

-- School-level queries
CREATE INDEX idx_access_codes_school
    ON education_access_codes(school_id);

-- Code type filtering
CREATE INDEX idx_access_codes_type
    ON education_access_codes(code_type);

-- Batch management
CREATE INDEX idx_access_codes_batch
    ON education_access_codes(batch_id);

-- Status filtering
CREATE INDEX idx_access_codes_status
    ON education_access_codes(status);

-- Expiration queries (for cleanup jobs)
CREATE INDEX idx_access_codes_expires
    ON education_access_codes(expires_at)
    WHERE status = 'active';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE education_access_codes ENABLE ROW LEVEL SECURITY;

-- Users can view access codes for schools in their organization
CREATE POLICY "Users can view access codes in their organization"
    ON education_access_codes FOR SELECT
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Users can create access codes for schools in their organization
CREATE POLICY "Users can create access codes in their organization"
    ON education_access_codes FOR INSERT
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Users can update access codes in their organization (e.g., revoke)
CREATE POLICY "Users can update access codes in their organization"
    ON education_access_codes FOR UPDATE
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Public policy for code validation (anonymous access during redemption)
-- This allows the redemption endpoint to validate codes without authentication
CREATE POLICY "Anyone can validate active codes"
    ON education_access_codes FOR SELECT
    USING (status = 'active' AND expires_at > NOW());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate a unique access code with configurable format
CREATE OR REPLACE FUNCTION generate_access_code(
    prefix TEXT,
    code_type_short TEXT,
    cohort_short TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    random_part TEXT;
    full_code TEXT;
BEGIN
    -- Generate 5 random alphanumeric characters
    random_part := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));

    -- Build code: PREFIX-TYPE-COHORT-RANDOM or PREFIX-TYPE-RANDOM
    IF cohort_short IS NOT NULL THEN
        full_code := prefix || '-' || code_type_short || '-' || cohort_short || '-' || random_part;
    ELSE
        full_code := prefix || '-' || code_type_short || '-' || random_part;
    END IF;

    RETURN full_code;
END;
$$ LANGUAGE plpgsql;

-- Validate and redeem an access code (called during token generation)
CREATE OR REPLACE FUNCTION redeem_access_code(
    input_code TEXT,
    input_campaign_id UUID
)
RETURNS TABLE (
    access_code_id UUID,
    school_id UUID,
    code_type VARCHAR(20),
    cohort_metadata JSONB
) AS $$
DECLARE
    code_record RECORD;
BEGIN
    -- Find and lock the code
    SELECT * INTO code_record
    FROM education_access_codes
    WHERE code = input_code
      AND campaign_id = input_campaign_id
      AND status = 'active'
      AND expires_at > NOW()
    FOR UPDATE;

    -- Check if code was found
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired access code';
    END IF;

    -- Mark as used (one-time use)
    UPDATE education_access_codes
    SET status = 'used',
        used_at = NOW()
    WHERE id = code_record.id;

    -- Return code details for token generation
    RETURN QUERY
    SELECT
        code_record.id,
        code_record.school_id,
        code_record.code_type,
        code_record.cohort_metadata;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE education_access_codes IS 'One-time access codes for pseudonymous participant authentication';
COMMENT ON COLUMN education_access_codes.code IS 'Unique code distributed to participant (e.g., PILOT-STU-Y10-A7X9K)';
COMMENT ON COLUMN education_access_codes.code_type IS 'Participant type: student, teacher, parent, leadership';
COMMENT ON COLUMN education_access_codes.cohort_metadata IS 'Aggregation metadata (year_band, division) - NOT identity data';
COMMENT ON COLUMN education_access_codes.status IS 'Lifecycle: active, used, expired, revoked';
COMMENT ON COLUMN education_access_codes.batch_id IS 'Groups codes generated in bulk for tracking';
COMMENT ON FUNCTION generate_access_code IS 'Generates formatted access codes with prefix-type-cohort-random pattern';
COMMENT ON FUNCTION redeem_access_code IS 'Validates and marks code as used, returns details for token generation';
