/**
 * Campaign Reports Type Definitions
 *
 * TypeScript types for the client assessment report generation system.
 *
 * Story: 1.1 - Database & API Foundation
 * Epic: 1 - Client Assessment Report Generation System
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Report content tier levels
 *
 * - basic: Scores and high-level summary only
 * - informative: Scores + themes + stakeholder quotes
 * - premium: Full analysis + architecture recommendations
 */
export type ReportTier = 'basic' | 'informative' | 'premium';

/**
 * Report status for lifecycle tracking
 */
export type ReportStatus = 'active' | 'inactive' | 'archived';

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

/**
 * Supporting document uploaded by consultant
 */
export interface SupportingDocument {
  name: string;
  url: string;
  uploaded_at: string;
  file_type: string;
  file_size?: number;
}

/**
 * Synthesis data snapshot structure
 *
 * This is stored as JSONB in the database and represents
 * the complete assessment synthesis at report generation time.
 */
export interface SynthesisSnapshot {
  technology?: {
    score: number;
    insights?: string[];
    themes?: string[];
    quotes?: string[];
    recommendations?: string[];
  };
  process?: {
    score: number;
    insights?: string[];
    themes?: string[];
    quotes?: string[];
    recommendations?: string[];
  };
  organization?: {
    score: number;
    insights?: string[];
    themes?: string[];
    quotes?: string[];
    recommendations?: string[];
  };
  overall_score?: number;
  executive_summary?: string;
  key_findings?: string[];
  next_steps?: string[];
  architecture_recommendations?: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimated_effort?: string;
  }[];
}

/**
 * Campaign information (nested in report responses)
 */
export interface CampaignInfo {
  id: string;
  name: string;
  description?: string | null;
  company_name?: string | null;
  company_industry?: string | null;
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

/**
 * Campaign Report (database record)
 *
 * Matches campaign_reports table schema
 */
export interface CampaignReport {
  id: string;
  campaign_id: string;
  access_token: string;
  is_active: boolean;
  report_tier: ReportTier;
  synthesis_snapshot: SynthesisSnapshot;
  consultant_observations?: string | null;
  supporting_documents?: SupportingDocument[];
  created_by: string;
  created_at: string;
  updated_at: string;
  regenerated_at?: string | null;
  regeneration_count: number;
  access_count: number;
  last_accessed_at?: string | null;
}

/**
 * Campaign Report with campaign details (for queries with joins)
 */
export interface CampaignReportWithCampaign extends CampaignReport {
  campaigns: CampaignInfo;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * POST /api/campaigns/[id]/generate-report - Request body
 *
 * Currently no body required - all data comes from database.
 * Reserved for future optional parameters like:
 * - consultant_observations
 * - report_tier override
 */
export interface ReportGenerationRequest {
  consultant_observations?: string;
  report_tier_override?: ReportTier;
}

/**
 * POST /api/campaigns/[id]/generate-report - Success response
 */
export interface ReportGenerationResponse {
  success: true;
  report: {
    id: string;
    campaign_id: string;
    campaign_name: string;
    access_token: string;
    url: string;
    is_regeneration: boolean;
    regeneration_count: number;
  };
}

/**
 * POST /api/campaigns/[id]/generate-report - Error response
 */
export interface ReportGenerationError {
  error: string;
  details?: string;
}

/**
 * GET /api/reports/[token] - Success response
 */
export interface ReportAccessResponse {
  success: true;
  report: {
    id: string;
    campaign: CampaignInfo;
    tier: ReportTier;
    synthesis: SynthesisSnapshot;
    consultant_observations?: string | null;
    supporting_documents: SupportingDocument[];
    generated_at: string;
    regenerated_at?: string | null;
    regeneration_count: number;
  };
}

/**
 * GET /api/reports/[token] - Error response
 */
export interface ReportAccessError {
  error: string;
  details?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Report metadata for dashboard display
 */
export interface ReportMetadata {
  id: string;
  campaign_id: string;
  campaign_name: string;
  company_name?: string;
  tier: ReportTier;
  access_token: string;
  access_count: number;
  last_accessed_at?: string | null;
  created_at: string;
  regenerated_at?: string | null;
  regeneration_count: number;
  is_active: boolean;
}

/**
 * Report generation options for internal use
 */
export interface ReportGenerationOptions {
  campaign_id: string;
  user_id: string;
  report_tier?: ReportTier;
  synthesis_data: SynthesisSnapshot;
  consultant_observations?: string;
  force_regenerate?: boolean;
}

/**
 * Report deactivation options
 */
export interface ReportDeactivationOptions {
  report_id: string;
  reason?: string;
  deactivated_by: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if value is a valid ReportTier
 */
export function isValidReportTier(value: unknown): value is ReportTier {
  return (
    typeof value === 'string' &&
    ['basic', 'informative', 'premium'].includes(value)
  );
}

/**
 * Type guard to check if object is a SupportingDocument
 */
export function isSupportingDocument(
  value: unknown
): value is SupportingDocument {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'url' in value &&
    'uploaded_at' in value &&
    'file_type' in value &&
    typeof (value as SupportingDocument).name === 'string' &&
    typeof (value as SupportingDocument).url === 'string' &&
    typeof (value as SupportingDocument).uploaded_at === 'string' &&
    typeof (value as SupportingDocument).file_type === 'string'
  );
}

/**
 * Type guard to check if object is a valid SynthesisSnapshot
 */
export function isSynthesisSnapshot(
  value: unknown
): value is SynthesisSnapshot {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const snapshot = value as SynthesisSnapshot;

  // At least one pillar should be present
  return (
    snapshot.technology !== undefined ||
    snapshot.process !== undefined ||
    snapshot.organization !== undefined ||
    snapshot.overall_score !== undefined
  );
}
