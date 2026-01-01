/**
 * Voice System Type Definitions
 *
 * Types for the ElevenLabs voice integration system,
 * covering vertical configuration, organization settings,
 * user preferences, and session management.
 *
 * Reference: docs/research-technical-2025-12-31.md (Appendix B)
 */

// ============================================================================
// VERTICAL VOICE CONFIGURATION
// System-level configuration for voice capability per vertical
// ============================================================================

export interface VerticalVoiceConfig {
  id: string
  verticalKey: VerticalKey
  displayName: string
  voiceEnabled: boolean
  elevenlabsAgentId: string | null
  voiceModel: string
  llmEndpointPath: string
  systemPromptTemplate: string | null
  createdAt: string
  updatedAt: string
}

export type VerticalKey = 'education' | 'assessment' | string

// Database row format (snake_case)
export interface VerticalVoiceConfigRow {
  id: string
  vertical_key: string
  display_name: string
  voice_enabled: boolean
  elevenlabs_agent_id: string | null
  voice_model: string
  llm_endpoint_path: string
  system_prompt_template: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// ORGANIZATION VOICE SETTINGS
// Organization-level voice enablement and quotas
// ============================================================================

export interface OrganizationVoiceSettings {
  id: string
  organizationId: string
  voiceEnabled: boolean
  voiceIncludedInPlan: boolean
  allowedVerticals: string[]
  monthlyVoiceMinutesLimit: number
  monthlyVoiceMinutesUsed: number
  createdAt: string
  updatedAt: string
}

// Database row format (snake_case)
export interface OrganizationVoiceSettingsRow {
  id: string
  organization_id: string
  voice_enabled: boolean
  voice_included_in_plan: boolean
  allowed_verticals: string[]
  monthly_voice_minutes_limit: number
  monthly_voice_minutes_used: number
  created_at: string
  updated_at: string
}

// ============================================================================
// USER VOICE PREFERENCES
// Individual user voice mode preferences
// ============================================================================

export interface UserVoicePreferences {
  id: string
  userId: string
  voiceEnabled: boolean
  defaultMode: SessionMode
  autoStartVoice: boolean
  preferredVoiceId: string | null
  createdAt: string
  updatedAt: string
}

// Database row format (snake_case)
export interface UserVoicePreferencesRow {
  id: string
  user_id: string
  voice_enabled: boolean
  default_mode: SessionMode
  auto_start_voice: boolean
  preferred_voice_id: string | null
  created_at: string
  updated_at: string
}

// Default preferences for new users
export const DEFAULT_USER_VOICE_PREFERENCES: Omit<UserVoicePreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  voiceEnabled: true,
  defaultMode: 'text',
  autoStartVoice: false,
  preferredVoiceId: null,
}

// ============================================================================
// SESSION MODE
// Interview session mode tracking
// ============================================================================

export type SessionMode = 'text' | 'voice' | 'mixed'

// ============================================================================
// VOICE AVAILABILITY
// Result of checking if voice is available for a session
// ============================================================================

export interface VoiceAvailability {
  available: boolean
  reason?: string
  config?: VerticalVoiceConfig
}

export interface VoiceAvailabilityResponse {
  available: boolean
  reason?: string
  config?: {
    verticalKey: string
    displayName: string
    elevenlabsAgentId: string | null
    voiceModel: string
    llmEndpointPath: string
  }
}

// ============================================================================
// ELEVENLABS INTEGRATION
// Types for ElevenLabs Conversational AI integration
// ============================================================================

// Signed URL response from ElevenLabs
export interface SignedUrlResponse {
  signedUrl: string
  dynamicVariables: DynamicVariables
  config: {
    verticalKey: string
    displayName: string
    llmEndpointPath: string
  }
}

// Dynamic variables passed to ElevenLabs agent
export interface DynamicVariables {
  session_token: string
  module_id?: string
  stakeholder_name?: string
  vertical_key: string
  [key: string]: string | undefined
}

// OpenAI-compatible chat message format (wire protocol for ElevenLabs)
export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// OpenAI-compatible chat completion request
export interface OpenAIChatRequest {
  messages: OpenAIChatMessage[]
  stream?: boolean
  model?: string
  user?: string
}

// OpenAI-compatible streaming chunk
export interface OpenAIChatChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: 'assistant'
      content?: string
    }
    logprobs: null
    finish_reason: string | null
  }>
}

// OpenAI-compatible non-streaming response
export interface OpenAIChatCompletion {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: 'stop'
  }>
}

// ============================================================================
// VOICE SESSION STATE
// Client-side state management for voice sessions
// ============================================================================

export type VoiceConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

export type VoiceAgentStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'

export interface VoiceSessionState {
  connectionStatus: VoiceConnectionStatus
  agentStatus: VoiceAgentStatus
  isMuted: boolean
  error: string | null
  conversationId: string | null
  durationSeconds: number
}

export const INITIAL_VOICE_SESSION_STATE: VoiceSessionState = {
  connectionStatus: 'disconnected',
  agentStatus: 'idle',
  isMuted: false,
  error: null,
  conversationId: null,
  durationSeconds: 0,
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Check voice availability request
export interface CheckVoiceAvailabilityRequest {
  vertical: string
  organizationId: string
}

// Get signed URL request
export interface GetSignedUrlRequest {
  sessionToken: string
  moduleId?: string
}

// Update user voice preferences request
export interface UpdateVoicePreferencesRequest {
  voiceEnabled?: boolean
  defaultMode?: SessionMode
  autoStartVoice?: boolean
  preferredVoiceId?: string | null
}

// Track voice usage request
export interface TrackVoiceUsageRequest {
  sessionToken: string
  durationSeconds: number
}

// ============================================================================
// TYPE GUARDS
// Runtime type checking utilities
// ============================================================================

export function isValidSessionMode(value: unknown): value is SessionMode {
  return value === 'text' || value === 'voice' || value === 'mixed'
}

export function isValidVerticalKey(value: unknown): value is VerticalKey {
  return typeof value === 'string' && value.length > 0
}

export function isVoiceAvailable(response: VoiceAvailabilityResponse): boolean {
  return response.available === true && response.config !== undefined
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Convert database row to camelCase
export function toVerticalVoiceConfig(row: VerticalVoiceConfigRow): VerticalVoiceConfig {
  return {
    id: row.id,
    verticalKey: row.vertical_key,
    displayName: row.display_name,
    voiceEnabled: row.voice_enabled,
    elevenlabsAgentId: row.elevenlabs_agent_id,
    voiceModel: row.voice_model,
    llmEndpointPath: row.llm_endpoint_path,
    systemPromptTemplate: row.system_prompt_template,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toOrganizationVoiceSettings(row: OrganizationVoiceSettingsRow): OrganizationVoiceSettings {
  return {
    id: row.id,
    organizationId: row.organization_id,
    voiceEnabled: row.voice_enabled,
    voiceIncludedInPlan: row.voice_included_in_plan,
    allowedVerticals: row.allowed_verticals,
    monthlyVoiceMinutesLimit: row.monthly_voice_minutes_limit,
    monthlyVoiceMinutesUsed: row.monthly_voice_minutes_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toUserVoicePreferences(row: UserVoicePreferencesRow): UserVoicePreferences {
  return {
    id: row.id,
    userId: row.user_id,
    voiceEnabled: row.voice_enabled,
    defaultMode: row.default_mode,
    autoStartVoice: row.auto_start_voice,
    preferredVoiceId: row.preferred_voice_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
