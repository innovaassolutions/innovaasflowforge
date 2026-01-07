# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2026-01-07-custom-assessment-framework/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## New Tables

### custom_assessments

Primary table storing assessment definitions owned by tenants.

```sql
CREATE TABLE custom_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Assessment Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,  -- URL-friendly identifier
  version TEXT NOT NULL DEFAULT '1.0',
  description TEXT,

  -- Assessment Definition (parsed from markdown)
  definition JSONB NOT NULL,
  -- Stores: dimensions, result_categories, interview_guidelines, metadata

  -- Original Source
  source_markdown TEXT,  -- Original uploaded markdown (for editing)
  source_type TEXT NOT NULL DEFAULT 'upload'
    CHECK (source_type IN ('upload', 'builder', 'imported')),

  -- Configuration
  assessment_type TEXT NOT NULL DEFAULT 'multi-dimensional'
    CHECK (assessment_type IN ('single-outcome', 'multi-dimensional', 'comparative')),
  interview_style_default INTEGER NOT NULL DEFAULT 3
    CHECK (interview_style_default BETWEEN 1 AND 5),
  interview_style_allow_override BOOLEAN NOT NULL DEFAULT true,
  result_disclosure TEXT NOT NULL DEFAULT 'full'
    CHECK (result_disclosure IN ('full', 'teaser', 'none')),

  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  is_template BOOLEAN NOT NULL DEFAULT false,  -- System templates

  -- Marketplace (Phase 2 - nullable for now)
  marketplace_status TEXT DEFAULT 'private'
    CHECK (marketplace_status IN ('private', 'pending_review', 'published', 'rejected')),
  marketplace_price_tier TEXT
    CHECK (marketplace_price_tier IS NULL OR marketplace_price_tier IN ('free', 'starter', 'professional', 'enterprise')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,  -- When first activated

  -- Constraints
  UNIQUE (tenant_id, slug)  -- Unique slug per tenant
);

COMMENT ON TABLE custom_assessments IS 'Custom assessment frameworks uploaded or built by tenants';
COMMENT ON COLUMN custom_assessments.definition IS 'Parsed JSON structure: {dimensions, resultCategories, interviewGuidelines, metadata}';
COMMENT ON COLUMN custom_assessments.interview_style_default IS 'Default interview style: 1=Highly Structured, 5=Fully Conversational';
```

### custom_assessment_results

Stores results from custom assessment sessions.

```sql
CREATE TABLE custom_assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  assessment_id UUID NOT NULL REFERENCES custom_assessments(id) ON DELETE RESTRICT,
  session_id UUID NOT NULL,  -- Can reference campaign_assignments OR coaching_sessions
  session_type TEXT NOT NULL CHECK (session_type IN ('campaign', 'coaching')),

  -- Results Data
  dimension_scores JSONB NOT NULL,  -- {"Strategic Thinking": 4.2, "EQ": 3.8, ...}
  overall_score NUMERIC(3,2),
  matched_category TEXT,  -- Name of matched result category
  matched_category_data JSONB,  -- Full category definition snapshot
  ai_insights JSONB,  -- AI-generated insights array

  -- Assessment Version Snapshot
  assessment_version TEXT NOT NULL,
  assessment_definition_snapshot JSONB NOT NULL,  -- Frozen definition at time of assessment

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Ensure we can look up by session
  UNIQUE (session_id, session_type)
);

COMMENT ON TABLE custom_assessment_results IS 'Results from completed custom assessment sessions';
COMMENT ON COLUMN custom_assessment_results.assessment_definition_snapshot IS 'Frozen copy of assessment definition at completion time for historical accuracy';
```

## Table Modifications

### campaigns

Add support for custom assessment type selection.

```sql
-- Add custom_assessment_id to campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS custom_assessment_id UUID REFERENCES custom_assessments(id) ON DELETE SET NULL;

-- Update assessment_type check to include 'custom'
ALTER TABLE campaigns
DROP CONSTRAINT IF EXISTS campaigns_assessment_type_check;

ALTER TABLE campaigns
ADD CONSTRAINT campaigns_assessment_type_check
CHECK (assessment_type IN ('industry4', 'archetype', 'education', 'custom'));

-- Add interview style override
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS interview_style_override INTEGER
CHECK (interview_style_override IS NULL OR interview_style_override BETWEEN 1 AND 5);

COMMENT ON COLUMN campaigns.custom_assessment_id IS 'Reference to custom assessment when assessment_type is custom';
COMMENT ON COLUMN campaigns.interview_style_override IS 'Override the assessment default interview style for this campaign';
```

### coaching_sessions

Add support for custom assessment selection.

```sql
-- Add custom_assessment_id to coaching_sessions
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS custom_assessment_id UUID REFERENCES custom_assessments(id) ON DELETE SET NULL;

-- Add assessment type (defaults to archetype for backward compatibility)
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'archetype'
CHECK (assessment_type IN ('archetype', 'custom'));

-- Add interview style override
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS interview_style_override INTEGER
CHECK (interview_style_override IS NULL OR interview_style_override BETWEEN 1 AND 5);

COMMENT ON COLUMN coaching_sessions.custom_assessment_id IS 'Reference to custom assessment when using custom type';
COMMENT ON COLUMN coaching_sessions.assessment_type IS 'Type of assessment: archetype (default) or custom';
```

### agent_sessions

Add reference to track which assessment definition was used.

```sql
ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS custom_assessment_id UUID REFERENCES custom_assessments(id) ON DELETE SET NULL;

COMMENT ON COLUMN agent_sessions.custom_assessment_id IS 'Custom assessment being used in this interview session';
```

## Indexes

```sql
-- Custom assessments indexes
CREATE INDEX IF NOT EXISTS idx_custom_assessments_tenant_id
  ON custom_assessments(tenant_id);

CREATE INDEX IF NOT EXISTS idx_custom_assessments_status
  ON custom_assessments(status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_custom_assessments_marketplace
  ON custom_assessments(marketplace_status)
  WHERE marketplace_status = 'published';

-- Custom assessment results indexes
CREATE INDEX IF NOT EXISTS idx_custom_assessment_results_assessment
  ON custom_assessment_results(assessment_id);

CREATE INDEX IF NOT EXISTS idx_custom_assessment_results_session
  ON custom_assessment_results(session_id, session_type);

-- Campaign custom assessment index
CREATE INDEX IF NOT EXISTS idx_campaigns_custom_assessment
  ON campaigns(custom_assessment_id)
  WHERE custom_assessment_id IS NOT NULL;

-- Coaching session custom assessment index
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_custom_assessment
  ON coaching_sessions(custom_assessment_id)
  WHERE custom_assessment_id IS NOT NULL;
```

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE custom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_assessment_results ENABLE ROW LEVEL SECURITY;

-- Custom Assessments Policies

-- Tenant owners can manage their own assessments
CREATE POLICY "Tenant owners can manage their assessments"
  ON custom_assessments
  FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

-- Published marketplace assessments are readable by all authenticated users
CREATE POLICY "Published assessments are publicly readable"
  ON custom_assessments
  FOR SELECT
  USING (
    marketplace_status = 'published'
    AND status = 'active'
  );

-- System templates are readable by all
CREATE POLICY "System templates are publicly readable"
  ON custom_assessments
  FOR SELECT
  USING (is_template = true AND status = 'active');

-- Custom Assessment Results Policies

-- Users can view results for sessions they own
CREATE POLICY "Users can view their assessment results"
  ON custom_assessment_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = (
        SELECT campaign_id FROM campaign_assignments
        WHERE id = custom_assessment_results.session_id
      )
      AND c.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM coaching_sessions cs
      JOIN tenant_profiles tp ON cs.tenant_id = tp.id
      WHERE cs.id = custom_assessment_results.session_id
      AND tp.user_id = auth.uid()
    )
  );

-- Service role can insert results (used by AI agents)
CREATE POLICY "Service role can manage results"
  ON custom_assessment_results
  FOR ALL
  USING (auth.role() = 'service_role');
```

## Migration File

```sql
-- Migration: Create Custom Assessment Framework Tables
-- Date: 2026-01-07
-- Spec: custom-assessment-framework

-- ============================================================================
-- STEP 1: CREATE NEW TABLES
-- ============================================================================

-- Custom assessments table
CREATE TABLE IF NOT EXISTS custom_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  description TEXT,
  definition JSONB NOT NULL,
  source_markdown TEXT,
  source_type TEXT NOT NULL DEFAULT 'upload'
    CHECK (source_type IN ('upload', 'builder', 'imported')),
  assessment_type TEXT NOT NULL DEFAULT 'multi-dimensional'
    CHECK (assessment_type IN ('single-outcome', 'multi-dimensional', 'comparative')),
  interview_style_default INTEGER NOT NULL DEFAULT 3
    CHECK (interview_style_default BETWEEN 1 AND 5),
  interview_style_allow_override BOOLEAN NOT NULL DEFAULT true,
  result_disclosure TEXT NOT NULL DEFAULT 'full'
    CHECK (result_disclosure IN ('full', 'teaser', 'none')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  is_template BOOLEAN NOT NULL DEFAULT false,
  marketplace_status TEXT DEFAULT 'private'
    CHECK (marketplace_status IN ('private', 'pending_review', 'published', 'rejected')),
  marketplace_price_tier TEXT
    CHECK (marketplace_price_tier IS NULL OR marketplace_price_tier IN ('free', 'starter', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE (tenant_id, slug)
);

-- Custom assessment results table
CREATE TABLE IF NOT EXISTS custom_assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES custom_assessments(id) ON DELETE RESTRICT,
  session_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('campaign', 'coaching')),
  dimension_scores JSONB NOT NULL,
  overall_score NUMERIC(3,2),
  matched_category TEXT,
  matched_category_data JSONB,
  ai_insights JSONB,
  assessment_version TEXT NOT NULL,
  assessment_definition_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (session_id, session_type)
);

-- ============================================================================
-- STEP 2: ALTER EXISTING TABLES
-- ============================================================================

-- Campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS custom_assessment_id UUID REFERENCES custom_assessments(id) ON DELETE SET NULL;

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS interview_style_override INTEGER
CHECK (interview_style_override IS NULL OR interview_style_override BETWEEN 1 AND 5);

-- Coaching sessions
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS custom_assessment_id UUID REFERENCES custom_assessments(id) ON DELETE SET NULL;

ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'archetype'
CHECK (assessment_type IN ('archetype', 'custom'));

ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS interview_style_override INTEGER
CHECK (interview_style_override IS NULL OR interview_style_override BETWEEN 1 AND 5);

-- Agent sessions
ALTER TABLE agent_sessions
ADD COLUMN IF NOT EXISTS custom_assessment_id UUID REFERENCES custom_assessments(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_custom_assessments_tenant_id ON custom_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_assessments_status ON custom_assessments(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_custom_assessments_marketplace ON custom_assessments(marketplace_status) WHERE marketplace_status = 'published';
CREATE INDEX IF NOT EXISTS idx_custom_assessment_results_assessment ON custom_assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_custom_assessment_results_session ON custom_assessment_results(session_id, session_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_custom_assessment ON campaigns(custom_assessment_id) WHERE custom_assessment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_custom_assessment ON coaching_sessions(custom_assessment_id) WHERE custom_assessment_id IS NOT NULL;

-- ============================================================================
-- STEP 4: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

ALTER TABLE custom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can manage their assessments"
  ON custom_assessments FOR ALL
  USING (tenant_id IN (SELECT id FROM tenant_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Published assessments are publicly readable"
  ON custom_assessments FOR SELECT
  USING (marketplace_status = 'published' AND status = 'active');

CREATE POLICY "System templates are publicly readable"
  ON custom_assessments FOR SELECT
  USING (is_template = true AND status = 'active');

CREATE POLICY "Service role can manage results"
  ON custom_assessment_results FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- STEP 5: ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE custom_assessments IS 'Custom assessment frameworks uploaded or built by tenants';
COMMENT ON TABLE custom_assessment_results IS 'Results from completed custom assessment sessions';
```

## Data Integrity Rules

1. **Assessment Definition Validation**
   - `definition` JSONB must contain: `dimensions` (array), `resultCategories` (array)
   - Each dimension must have: `name`, `weight`, `description`
   - Weights must sum to 1.0 (±0.01 tolerance)

2. **Slug Generation**
   - Auto-generated from `name` if not provided
   - Must be unique per tenant
   - Format: lowercase, hyphens, alphanumeric only

3. **Version Management**
   - Semantic versioning format: `major.minor`
   - Results store version snapshot for historical accuracy

4. **Cascading Deletes**
   - Deleting tenant cascades to assessments
   - Deleting assessment RESTRICTS if results exist
   - Deleting campaign/session sets assessment reference to NULL
