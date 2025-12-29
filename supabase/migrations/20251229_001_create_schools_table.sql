-- Migration: Create Schools Table
-- Purpose: Core entity for FlowForge Education module
-- Date: 2025-12-29
-- ADR Reference: ADR-001 (Schools as Separate Entity)

-- ============================================================================
-- SCHOOLS TABLE
-- Individual schools linked to organizations (consulting firms, school groups)
-- ============================================================================

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- School identification
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- Short identifier (e.g., 'ACS-INTL', 'TCS-SG')

    -- School details
    country TEXT NOT NULL,
    city TEXT,
    region TEXT, -- State/province if applicable

    -- Educational context
    curriculum TEXT, -- 'IB', 'British', 'American', 'Bilingual', 'National', 'Other'
    school_type TEXT, -- 'international', 'independent', 'public', 'charter'
    student_count_range TEXT, -- '<500', '500-1500', '1500+'
    year_levels TEXT[], -- Array of year levels offered, e.g., ['K', '1-6', '7-12']
    divisions TEXT[], -- e.g., ['primary', 'secondary', 'sixth_form']

    -- Pricing tier (for pilot pricing determination)
    fee_tier TEXT, -- 'tier_a', 'tier_b', 'tier_c'

    -- Primary contact (school liaison)
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_role TEXT,
    primary_contact_phone TEXT,

    -- Safeguarding configuration (critical for break-glass protocol)
    safeguarding_lead_name TEXT,
    safeguarding_lead_email TEXT,
    safeguarding_lead_phone TEXT,
    safeguarding_protocol TEXT DEFAULT 'standard', -- 'standard', 'two_key'
    safeguarding_backup_contact TEXT, -- Secondary contact for alerts

    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'onboarding', 'churned'

    -- Branding (optional, for white-label reports)
    logo_url TEXT,
    brand_color TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata for extensibility
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_schools_organization ON schools(organization_id);
CREATE INDEX idx_schools_code ON schools(code);
CREATE INDEX idx_schools_country ON schools(country);
CREATE INDEX idx_schools_status ON schools(status);
CREATE INDEX idx_schools_curriculum ON schools(curriculum);
CREATE INDEX idx_schools_fee_tier ON schools(fee_tier);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Users can view schools in their organization
CREATE POLICY "Users can view schools in their organization"
    ON schools FOR SELECT
    USING (
        organization_id = auth.current_user_organization_id()
    );

-- Users with manage_schools permission can create schools
CREATE POLICY "Users can create schools in their organization"
    ON schools FOR INSERT
    WITH CHECK (
        organization_id = auth.current_user_organization_id()
    );

-- Users with manage_schools permission can update schools in their org
CREATE POLICY "Users can update schools in their organization"
    ON schools FOR UPDATE
    USING (
        organization_id = auth.current_user_organization_id()
    );

-- Admins can delete schools
CREATE POLICY "Admins can delete schools in their organization"
    ON schools FOR DELETE
    USING (
        organization_id = auth.current_user_organization_id()
        AND auth.user_has_permission('manage_schools')
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE schools IS 'Individual schools participating in FlowForge Education assessments';
COMMENT ON COLUMN schools.organization_id IS 'Parent organization (consulting firm or school group)';
COMMENT ON COLUMN schools.code IS 'Unique short identifier for the school';
COMMENT ON COLUMN schools.curriculum IS 'Primary curriculum type (IB, British, American, etc.)';
COMMENT ON COLUMN schools.fee_tier IS 'Pricing tier based on school size and fees';
COMMENT ON COLUMN schools.safeguarding_protocol IS 'Break-glass protocol type: standard or two_key';
COMMENT ON COLUMN schools.safeguarding_lead_email IS 'Primary contact for safeguarding alerts';
