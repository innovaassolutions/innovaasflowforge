/**
 * Type Definitions Export Barrel
 *
 * Central export point for all TypeScript type definitions.
 *
 * Story: 1.1 - Database & API Foundation
 */

// Database types (auto-generated from Supabase schema)
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './database';

// Campaign Reports types (application-specific)
export type {
  ReportTier,
  ReportStatus,
  SupportingDocument,
  SynthesisSnapshot,
  CampaignInfo,
  CampaignReport,
  CampaignReportWithCampaign,
  ReportGenerationRequest,
  ReportGenerationResponse,
  ReportGenerationError,
  ReportAccessResponse,
  ReportAccessError,
  ReportMetadata,
  ReportGenerationOptions,
  ReportDeactivationOptions,
} from './campaign-reports';

// Type guards (utility functions for runtime type checking)
export {
  isValidReportTier,
  isSupportingDocument,
  isSynthesisSnapshot,
} from './campaign-reports';
