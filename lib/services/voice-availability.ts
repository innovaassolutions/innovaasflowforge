/**
 * Voice Availability Service
 *
 * Checks whether voice mode is available for a given session by validating
 * all three levels of the voice configuration hierarchy:
 * 1. System level (vertical voice config)
 * 2. Organization level (voice settings and quotas)
 * 3. User level (voice preferences)
 *
 * Reference: docs/research-technical-2025-12-31.md (Appendix B.4)
 */

import { createClient } from '@/lib/supabase/server'
import type {
  VoiceAvailability,
  VerticalVoiceConfig,
  VerticalVoiceConfigRow,
  OrganizationVoiceSettingsRow,
  UserVoicePreferencesRow,
  toVerticalVoiceConfig,
} from '@/lib/types/voice'

// ============================================================================
// TYPES
// ============================================================================

interface CheckVoiceAvailabilityParams {
  userId: string
  organizationId: string
  verticalKey: string
}

interface GetVoiceConfigForSessionResult {
  available: boolean
  reason?: string
  config?: VerticalVoiceConfig
  organizationId?: string
  verticalKey?: string
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Check if voice is available for a user in an organization for a specific vertical.
 * Validates all three levels: system, organization, and user.
 */
export async function checkVoiceAvailability({
  userId,
  organizationId,
  verticalKey,
}: CheckVoiceAvailabilityParams): Promise<VoiceAvailability> {
  const supabase = await createClient()

  // 1. Check system-level: Is voice deployed for this vertical?
  const { data: verticalConfig, error: verticalError } = await supabase
    .from('vertical_voice_config')
    .select('*')
    .eq('vertical_key', verticalKey)
    .eq('voice_enabled', true)
    .single()

  if (verticalError || !verticalConfig) {
    return {
      available: false,
      reason: 'Voice is not available for this interview type',
    }
  }

  // 2. Check organization-level: Is voice enabled + included in plan?
  const { data: orgSettings, error: orgError } = await supabase
    .from('organization_voice_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (orgError || !orgSettings) {
    return {
      available: false,
      reason: 'Voice settings not configured for your organization',
    }
  }

  const typedOrgSettings = orgSettings as OrganizationVoiceSettingsRow

  if (!typedOrgSettings.voice_included_in_plan) {
    return {
      available: false,
      reason: 'Voice feature requires a premium subscription',
    }
  }

  if (!typedOrgSettings.voice_enabled) {
    return {
      available: false,
      reason: 'Voice has been disabled for your organization',
    }
  }

  if (!typedOrgSettings.allowed_verticals.includes(verticalKey)) {
    return {
      available: false,
      reason: `Voice is not enabled for ${verticalConfig.display_name}`,
    }
  }

  // Check usage quota
  if (
    typedOrgSettings.monthly_voice_minutes_used >=
    typedOrgSettings.monthly_voice_minutes_limit
  ) {
    return {
      available: false,
      reason: 'Monthly voice minutes quota exceeded',
    }
  }

  // 3. Check user-level: Does user want voice?
  const { data: userPrefs, error: userError } = await supabase
    .from('user_voice_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  // If no preferences exist, assume voice is enabled (default)
  if (!userError && userPrefs) {
    const typedUserPrefs = userPrefs as UserVoicePreferencesRow
    if (!typedUserPrefs.voice_enabled) {
      return {
        available: false,
        reason: 'Voice mode is disabled in your preferences',
      }
    }
  }

  // All checks passed!
  const typedVerticalConfig = verticalConfig as VerticalVoiceConfigRow
  return {
    available: true,
    config: {
      id: typedVerticalConfig.id,
      verticalKey: typedVerticalConfig.vertical_key,
      displayName: typedVerticalConfig.display_name,
      voiceEnabled: typedVerticalConfig.voice_enabled,
      elevenlabsAgentId: typedVerticalConfig.elevenlabs_agent_id,
      voiceModel: typedVerticalConfig.voice_model,
      llmEndpointPath: typedVerticalConfig.llm_endpoint_path,
      systemPromptTemplate: typedVerticalConfig.system_prompt_template,
      createdAt: typedVerticalConfig.created_at,
      updatedAt: typedVerticalConfig.updated_at,
    },
  }
}

/**
 * Get voice configuration for a session by session token.
 * Looks up the session, determines the vertical, and checks availability.
 */
export async function getVoiceConfigForSession(
  sessionToken: string,
  userId?: string
): Promise<GetVoiceConfigForSessionResult> {
  const supabase = await createClient()

  // Get session details including campaign info
  const { data: session, error: sessionError } = await supabase
    .from('agent_sessions')
    .select(
      `
      id,
      participant_token_id,
      education_session_context
    `
    )
    .eq('session_token', sessionToken)
    .single()

  if (sessionError || !session) {
    return { available: false, reason: 'Session not found' }
  }

  // For education sessions, get the campaign via participant token
  if (session.participant_token_id) {
    const { data: participantTokenData, error: ptError } = await supabase
      .from('education_participant_tokens')
      .select(
        `
        id,
        school_id,
        schools!inner(
          id,
          organization_id
        )
      `
      )
      .eq('id', session.participant_token_id)
      .single()

    // Type assertion for joined data
    const participantToken = participantTokenData as {
      id: string
      school_id: string
      schools: { id: string; organization_id: string }
    } | null

    if (ptError || !participantToken) {
      return { available: false, reason: 'Unable to determine organization' }
    }

    // Education sessions use 'education' vertical
    const verticalKey = 'education'
    const organizationId = participantToken.schools.organization_id

    // If userId not provided, we skip user-level check
    if (!userId) {
      // Check system and org levels only
      const result = await checkVoiceAvailabilityWithoutUser(organizationId, verticalKey)
      return {
        ...result,
        organizationId,
        verticalKey,
      }
    }

    const result = await checkVoiceAvailability({
      userId,
      organizationId,
      verticalKey,
    })

    return {
      ...result,
      organizationId,
      verticalKey,
    }
  }

  // For non-education sessions, determine vertical from campaign type
  // This would need to be extended based on how other verticals store their sessions
  return {
    available: false,
    reason: 'Unable to determine session type',
  }
}

/**
 * Check voice availability without user-level check.
 * Used for anonymous sessions (stakeholder interviews via token).
 */
async function checkVoiceAvailabilityWithoutUser(
  organizationId: string,
  verticalKey: string
): Promise<VoiceAvailability> {
  const supabase = await createClient()

  // 1. Check system-level
  const { data: verticalConfig, error: verticalError } = await supabase
    .from('vertical_voice_config')
    .select('*')
    .eq('vertical_key', verticalKey)
    .eq('voice_enabled', true)
    .single()

  if (verticalError || !verticalConfig) {
    return {
      available: false,
      reason: 'Voice is not available for this interview type',
    }
  }

  // 2. Check organization-level
  const { data: orgSettings, error: orgError } = await supabase
    .from('organization_voice_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (orgError || !orgSettings) {
    return {
      available: false,
      reason: 'Voice settings not configured for this organization',
    }
  }

  const typedOrgSettings = orgSettings as OrganizationVoiceSettingsRow

  if (!typedOrgSettings.voice_included_in_plan) {
    return {
      available: false,
      reason: 'Voice feature requires a premium subscription',
    }
  }

  if (!typedOrgSettings.voice_enabled) {
    return {
      available: false,
      reason: 'Voice has been disabled for this organization',
    }
  }

  if (!typedOrgSettings.allowed_verticals.includes(verticalKey)) {
    return {
      available: false,
      reason: `Voice is not enabled for this interview type`,
    }
  }

  if (
    typedOrgSettings.monthly_voice_minutes_used >=
    typedOrgSettings.monthly_voice_minutes_limit
  ) {
    return {
      available: false,
      reason: 'Monthly voice minutes quota exceeded',
    }
  }

  // All checks passed!
  const typedVerticalConfig = verticalConfig as VerticalVoiceConfigRow
  return {
    available: true,
    config: {
      id: typedVerticalConfig.id,
      verticalKey: typedVerticalConfig.vertical_key,
      displayName: typedVerticalConfig.display_name,
      voiceEnabled: typedVerticalConfig.voice_enabled,
      elevenlabsAgentId: typedVerticalConfig.elevenlabs_agent_id,
      voiceModel: typedVerticalConfig.voice_model,
      llmEndpointPath: typedVerticalConfig.llm_endpoint_path,
      systemPromptTemplate: typedVerticalConfig.system_prompt_template,
      createdAt: typedVerticalConfig.created_at,
      updatedAt: typedVerticalConfig.updated_at,
    },
  }
}

/**
 * Get the vertical key for a campaign type.
 * Maps campaign types to vertical keys for voice configuration.
 */
export function getVerticalKeyFromCampaignType(campaignType: string): string {
  // Education verticals
  if (['education_pilot', 'education_annual'].includes(campaignType)) {
    return 'education'
  }

  // Assessment/Industry verticals
  if (['industry_4.0', 'digital_transformation', 'custom'].includes(campaignType)) {
    return 'assessment'
  }

  // Default to assessment for unknown types
  return 'assessment'
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Track voice usage for a session.
 * Updates both session-level and organization-level usage counters.
 */
export async function trackVoiceUsage(
  sessionToken: string,
  durationSeconds: number
): Promise<void> {
  const supabase = await createClient()
  const durationMinutes = durationSeconds / 60

  // Get session and organization
  const { data: session } = await supabase
    .from('agent_sessions')
    .select(
      `
      id,
      voice_minutes_used,
      participant_token_id
    `
    )
    .eq('session_token', sessionToken)
    .single()

  if (!session) return

  // Update session usage
  await supabase
    .from('agent_sessions')
    .update({
      voice_minutes_used: (session.voice_minutes_used || 0) + durationMinutes,
    })
    .eq('id', session.id)

  // Get organization from participant token
  if (session.participant_token_id) {
    const { data: participantTokenData } = await supabase
      .from('education_participant_tokens')
      .select(
        `
        schools!inner(organization_id)
      `
      )
      .eq('id', session.participant_token_id)
      .single()

    // Type assertion for joined data
    const participantToken = participantTokenData as {
      schools: { organization_id: string }
    } | null

    if (participantToken) {
      const organizationId = participantToken.schools.organization_id

      // Update organization monthly usage using raw SQL for atomic increment
      await (supabase.rpc as Function)('track_voice_usage', {
        input_session_token: sessionToken,
        input_duration_seconds: durationSeconds,
      })
    }
  }
}

/**
 * Reset monthly voice usage for all organizations.
 * Should be called by a cron job at the start of each month.
 */
export async function resetMonthlyVoiceUsage(): Promise<number> {
  const supabase = await createClient()

  const { data } = await (supabase.rpc as Function)('reset_monthly_voice_usage')

  return data || 0
}
