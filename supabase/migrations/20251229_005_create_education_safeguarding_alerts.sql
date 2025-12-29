-- Migration: Create Education Safeguarding Alerts Table
-- Purpose: Break-glass protocol event tracking for duty of care
-- Date: 2025-12-29
-- ADR Reference: ADR-002 (Pseudonymous Token Architecture)

-- ============================================================================
-- EDUCATION SAFEGUARDING ALERTS TABLE
-- Tracks break-glass events while preserving pseudonymity
-- FlowForge stores token only; school unmasks via their escrow
-- ============================================================================

CREATE TABLE education_safeguarding_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Context
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

    -- Participant reference (PSEUDONYMOUS - token only)
    participant_token VARCHAR(50) NOT NULL,
    participant_type VARCHAR(20) NOT NULL, -- 'student', 'teacher', 'parent', 'leadership'

    -- Cohort context (for understanding without identity)
    cohort_metadata JSONB DEFAULT '{}'::jsonb,

    -- Trigger details
    trigger_type VARCHAR(50) NOT NULL,
    -- 'self_harm': Indicators of self-harm ideation
    -- 'harm_to_others': Indicators of harm to others
    -- 'abuse_disclosure': Disclosure of abuse
    -- 'immediate_danger': Explicit statement of immediate danger
    -- 'explicit_request': Participant requests contact

    trigger_content TEXT NOT NULL, -- The concerning response (verbatim)
    trigger_context TEXT, -- Surrounding conversation context

    -- AI analysis
    trigger_confidence DECIMAL(3,2), -- 0.00-1.00 confidence score
    ai_analysis JSONB DEFAULT '{}'::jsonb, -- Detailed AI reasoning

    -- Alert lifecycle
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Notification tracking
    alert_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- 'pending': Detected, not yet sent
    -- 'sent': Alert dispatched to school
    -- 'delivered': Delivery confirmed (for SMS/WhatsApp)
    -- 'acknowledged': School confirmed receipt
    -- 'actioned': School confirmed action taken
    -- 'resolved': Case closed
    -- 'false_positive': Reviewed and determined non-threatening

    alert_sent_at TIMESTAMPTZ,
    alert_channel VARCHAR(50), -- 'portal', 'sms', 'whatsapp', 'email', 'webhook'
    alert_recipient_role VARCHAR(100), -- 'Safeguarding Lead', 'Deputy Head'

    -- Notification attempts tracking
    notification_attempts INTEGER DEFAULT 0,
    last_notification_attempt_at TIMESTAMPTZ,
    notification_error TEXT,

    -- School acknowledgment
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by_role VARCHAR(100), -- Role only, NOT name (preserves anonymity)
    acknowledgment_notes TEXT,

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by_role VARCHAR(100),
    resolution_type VARCHAR(50),
    -- 'intervention_initiated': School began intervention
    -- 'welfare_check': School conducted welfare check
    -- 'external_referral': Referred to external services
    -- 'false_positive': Determined non-threatening after review
    -- 'escalated': Escalated to higher authority
    -- 'no_action_required': Reviewed, no action needed

    resolution_notes TEXT,

    -- Audit trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ============================================================================
    -- CRITICAL: NO IDENTITY DATA
    -- FlowForge stores participant_token only
    -- School uses their escrow (token→identity mapping) to unmask
    -- FlowForge NEVER learns the unmasked identity
    -- ============================================================================

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Campaign-level queries
CREATE INDEX idx_safeguarding_alerts_campaign
    ON education_safeguarding_alerts(campaign_id);

-- School-level queries
CREATE INDEX idx_safeguarding_alerts_school
    ON education_safeguarding_alerts(school_id);

-- Token lookups
CREATE INDEX idx_safeguarding_alerts_token
    ON education_safeguarding_alerts(participant_token);

-- Status filtering (critical for dashboard)
CREATE INDEX idx_safeguarding_alerts_status
    ON education_safeguarding_alerts(alert_status);

-- Unacknowledged alerts (for urgent attention)
CREATE INDEX idx_safeguarding_alerts_unacknowledged
    ON education_safeguarding_alerts(school_id, detected_at)
    WHERE acknowledged_at IS NULL AND alert_status NOT IN ('false_positive', 'resolved');

-- Trigger type analysis
CREATE INDEX idx_safeguarding_alerts_trigger_type
    ON education_safeguarding_alerts(trigger_type);

-- Time-based queries
CREATE INDEX idx_safeguarding_alerts_detected
    ON education_safeguarding_alerts(detected_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE education_safeguarding_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view alerts for schools in their organization
CREATE POLICY "Users can view alerts in their organization"
    ON education_safeguarding_alerts FOR SELECT
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- Alerts are created via API (service role) during AI analysis
-- No direct INSERT policy for authenticated users

-- Users can update alerts (acknowledge, resolve)
CREATE POLICY "Users can update alerts in their organization"
    ON education_safeguarding_alerts FOR UPDATE
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create a new safeguarding alert
CREATE OR REPLACE FUNCTION create_safeguarding_alert(
    input_campaign_id UUID,
    input_school_id UUID,
    input_participant_token VARCHAR(50),
    input_participant_type VARCHAR(20),
    input_cohort_metadata JSONB,
    input_trigger_type VARCHAR(50),
    input_trigger_content TEXT,
    input_trigger_context TEXT,
    input_confidence DECIMAL(3,2),
    input_ai_analysis JSONB
)
RETURNS UUID AS $$
DECLARE
    new_alert_id UUID;
BEGIN
    INSERT INTO education_safeguarding_alerts (
        campaign_id,
        school_id,
        participant_token,
        participant_type,
        cohort_metadata,
        trigger_type,
        trigger_content,
        trigger_context,
        trigger_confidence,
        ai_analysis
    ) VALUES (
        input_campaign_id,
        input_school_id,
        input_participant_token,
        input_participant_type,
        input_cohort_metadata,
        input_trigger_type,
        input_trigger_content,
        input_trigger_context,
        input_confidence,
        input_ai_analysis
    )
    RETURNING id INTO new_alert_id;

    RETURN new_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Mark alert as sent
CREATE OR REPLACE FUNCTION mark_alert_sent(
    input_alert_id UUID,
    input_channel VARCHAR(50),
    input_recipient_role VARCHAR(100)
)
RETURNS VOID AS $$
BEGIN
    UPDATE education_safeguarding_alerts
    SET
        alert_status = 'sent',
        alert_sent_at = NOW(),
        alert_channel = input_channel,
        alert_recipient_role = input_recipient_role,
        notification_attempts = notification_attempts + 1,
        last_notification_attempt_at = NOW(),
        updated_at = NOW()
    WHERE id = input_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Acknowledge alert
CREATE OR REPLACE FUNCTION acknowledge_alert(
    input_alert_id UUID,
    input_acknowledged_by_role VARCHAR(100),
    input_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE education_safeguarding_alerts
    SET
        alert_status = 'acknowledged',
        acknowledged_at = NOW(),
        acknowledged_by_role = input_acknowledged_by_role,
        acknowledgment_notes = input_notes,
        updated_at = NOW()
    WHERE id = input_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Resolve alert
CREATE OR REPLACE FUNCTION resolve_alert(
    input_alert_id UUID,
    input_resolved_by_role VARCHAR(100),
    input_resolution_type VARCHAR(50),
    input_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE education_safeguarding_alerts
    SET
        alert_status = 'resolved',
        resolved_at = NOW(),
        resolved_by_role = input_resolved_by_role,
        resolution_type = input_resolution_type,
        resolution_notes = input_notes,
        updated_at = NOW()
    WHERE id = input_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Get pending alerts for a school (for dashboard)
CREATE OR REPLACE FUNCTION get_pending_alerts(
    input_school_id UUID
)
RETURNS TABLE (
    alert_id UUID,
    participant_token VARCHAR(50),
    participant_type VARCHAR(20),
    trigger_type VARCHAR(50),
    trigger_confidence DECIMAL(3,2),
    detected_at TIMESTAMPTZ,
    alert_status VARCHAR(30)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        ea.participant_token,
        ea.participant_type,
        ea.trigger_type,
        ea.trigger_confidence,
        ea.detected_at,
        ea.alert_status
    FROM education_safeguarding_alerts ea
    WHERE ea.school_id = input_school_id
      AND ea.alert_status NOT IN ('resolved', 'false_positive')
    ORDER BY ea.detected_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_safeguarding_alerts_updated_at
    BEFORE UPDATE ON education_safeguarding_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE education_safeguarding_alerts IS 'Break-glass events for safeguarding - stores token only, not identity';
COMMENT ON COLUMN education_safeguarding_alerts.participant_token IS 'Pseudonymous token - school uses escrow to unmask';
COMMENT ON COLUMN education_safeguarding_alerts.trigger_type IS 'Category: self_harm, harm_to_others, abuse_disclosure, immediate_danger, explicit_request';
COMMENT ON COLUMN education_safeguarding_alerts.trigger_content IS 'Verbatim concerning content that triggered alert';
COMMENT ON COLUMN education_safeguarding_alerts.trigger_confidence IS 'AI confidence score 0.00-1.00';
COMMENT ON COLUMN education_safeguarding_alerts.alert_status IS 'Lifecycle: pending, sent, delivered, acknowledged, actioned, resolved, false_positive';
COMMENT ON COLUMN education_safeguarding_alerts.resolution_type IS 'How alert was resolved: intervention_initiated, welfare_check, external_referral, false_positive, escalated, no_action_required';
