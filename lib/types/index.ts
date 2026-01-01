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

// Voice system types (ElevenLabs integration)
export type {
  VerticalVoiceConfig,
  VerticalVoiceConfigRow,
  VerticalKey,
  OrganizationVoiceSettings,
  OrganizationVoiceSettingsRow,
  UserVoicePreferences,
  UserVoicePreferencesRow,
  SessionMode,
  VoiceAvailability,
  VoiceAvailabilityResponse,
  SignedUrlResponse,
  DynamicVariables,
  OpenAIChatMessage,
  OpenAIChatRequest,
  OpenAIChatChunk,
  OpenAIChatCompletion,
  VoiceConnectionStatus,
  VoiceAgentStatus,
  VoiceSessionState,
  CheckVoiceAvailabilityRequest,
  GetSignedUrlRequest,
  UpdateVoicePreferencesRequest,
  TrackVoiceUsageRequest,
} from './voice';

// Voice type guards and utilities
export {
  DEFAULT_USER_VOICE_PREFERENCES,
  INITIAL_VOICE_SESSION_STATE,
  isValidSessionMode,
  isValidVerticalKey,
  isVoiceAvailable,
  toVerticalVoiceConfig,
  toOrganizationVoiceSettings,
  toUserVoicePreferences,
} from './voice';
