-- Migration: Add Education Campaign Fields
-- Purpose: Extend campaigns table for education-specific configuration
-- Date: 2025-12-29
-- ADR Reference: ADR-001 (Schools as Separate Entity)

-- ============================================================================
-- EXTEND CAMPAIGNS TABLE
-- Add school reference and education-specific configuration
-- ============================================================================

-- Add school_id reference (nullable for non-education campaigns)
ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

-- Add education-specific configuration (nullable for non-education campaigns)
ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS education_config JSONB;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_school ON campaigns(school_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_education_config ON campaigns USING GIN(education_config);

-- ============================================================================
-- EDUCATION CONFIG SCHEMA (documented via comment)
-- ============================================================================

/*
education_config JSONB schema:

{
    "pilot_type": "14_day_pilot" | "annual",

    "modules": [
        "student_wellbeing",
        "teaching_learning",
        "parent_confidence"
    ],

    "cohorts": {
        "students": {
            "year_bands": ["10", "11", "12"],
            "divisions": ["secondary"],
            "target_sample_size": 50
        },
        "teachers": {
            "divisions": ["secondary"],
            "role_categories": ["classroom_teacher", "department_head"],
            "target_sample_size": 20
        },
        "parents": {
            "year_bands": ["10", "11", "12"],
            "target_sample_size": 30
        },
        "leadership": {
            "roles": ["head_of_school", "deputy_head", "division_head"],
            "target_sample_size": 5
        }
    },

    "anonymity": {
        "access_code_prefix": "PILOT",
        "escrow_model": "school_held" | "two_key",
        "minimum_cohort_size": 5
    },

    "pilot_schedule": {
        "alignment_start": "2025-01-06",
        "collection_start": "2025-01-08",
        "collection_end": "2025-01-17",
        "synthesis_start": "2025-01-18",
        "readout_date": "2025-01-20"
    },

    "safeguarding": {
        "break_glass_enabled": true,
        "alert_channels": ["portal", "sms"],
        "escalation_timeout_hours": 4
    }
}
*/

-- ============================================================================
-- VALIDATION FUNCTION
-- Ensures education campaigns have required configuration
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_education_campaign()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate education campaign types
    IF NEW.campaign_type IN ('education_pilot', 'education_annual') THEN
        -- Must have school_id
        IF NEW.school_id IS NULL THEN
            RAISE EXCEPTION 'Education campaigns must have a school_id';
        END IF;

        -- Must have education_config
        IF NEW.education_config IS NULL THEN
            RAISE EXCEPTION 'Education campaigns must have education_config';
        END IF;

        -- Validate required config fields
        IF NOT (NEW.education_config ? 'modules') THEN
            RAISE EXCEPTION 'education_config must include modules array';
        END IF;

        IF NOT (NEW.education_config ? 'cohorts') THEN
            RAISE EXCEPTION 'education_config must include cohorts configuration';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
DROP TRIGGER IF EXISTS validate_education_campaign_trigger ON campaigns;
CREATE TRIGGER validate_education_campaign_trigger
    BEFORE INSERT OR UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION validate_education_campaign();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN campaigns.school_id IS 'Reference to school for education campaigns (null for industry campaigns)';
COMMENT ON COLUMN campaigns.education_config IS 'Education-specific configuration including modules, cohorts, and anonymity settings';
