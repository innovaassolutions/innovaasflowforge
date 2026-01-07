-- Migration: Add Enhanced Results Column to coaching_sessions
-- Purpose: Store personalized insights from reflection integration
-- Date: 2026-01-07
-- Spec: Reflection Integration Enhancement

-- ============================================================================
-- STEP 1: ADD ENHANCED RESULTS COLUMN
-- ============================================================================

-- Enhanced results: stores AI-synthesized personalized insights from reflection
-- Format: {
--   enhancedAt: string (ISO timestamp),
--   personalizedDefaultNarrative: string,
--   personalizedAuthenticNarrative: string,
--   personalizedTensionInsights: string | null,
--   reflectionThemes: string[],
--   personalizedGuidance: string,
--   meaningfulQuotes: [{ quote: string, context: string }]
-- }
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS enhanced_results JSONB DEFAULT NULL;

-- ============================================================================
-- STEP 2: CREATE INDEX
-- ============================================================================

-- Index for querying sessions with enhanced results
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_enhanced
  ON coaching_sessions ((enhanced_results IS NOT NULL))
  WHERE enhanced_results IS NOT NULL;

-- Composite index for tenant + enhanced status queries
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_tenant_enhanced
  ON coaching_sessions(tenant_id, (enhanced_results IS NOT NULL))
  WHERE tenant_id IS NOT NULL;

-- ============================================================================
-- STEP 3: ADD COLUMN COMMENT
-- ============================================================================

COMMENT ON COLUMN coaching_sessions.enhanced_results IS 'JSONB object with AI-synthesized personalized insights from reflection conversation';
