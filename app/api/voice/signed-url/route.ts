import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { getVoiceConfigForSession } from '@/lib/services/voice-availability'

/**
 * POST /api/voice/signed-url
 * Get a signed URL for connecting to ElevenLabs Conversational AI
 *
 * This endpoint:
 * 1. Validates the session/participant token
 * 2. Checks voice availability for the session
 * 3. Requests a signed URL from ElevenLabs
 * 4. Returns the URL with dynamic variables for session context
 *
 * Body:
 * - sessionToken: string (required) - The participant access token (ff_edu_xxx) or session token
 * - moduleId: string (optional) - The module being interviewed
 */
export async function POST(request: NextRequest) {
  console.log('[voice/signed-url] POST request received')

  try {
    const body = await request.json()
    const { sessionToken, moduleId } = body

    console.log('[voice/signed-url] Token:', sessionToken?.substring(0, 20) + '...')

    if (!sessionToken) {
      console.log('[voice/signed-url] No session token provided')
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Check voice availability and get config
    console.log('[voice/signed-url] Checking voice availability...')
    const voiceAvailability = await getVoiceConfigForSession(sessionToken)
    console.log('[voice/signed-url] Voice availability:', voiceAvailability.available, voiceAvailability.reason || '')

    if (!voiceAvailability.available) {
      return NextResponse.json(
        { error: voiceAvailability.reason || 'Voice not available' },
        { status: 403 }
      )
    }

    const config = voiceAvailability.config!

    // Get stakeholder context for dynamic variables
    let stakeholderName: string | undefined

    // For education participant tokens (ff_edu_xxx), get context directly from participant token
    if (sessionToken.startsWith('ff_edu_')) {
      const { data: participantTokenData } = await supabase
        .from('education_participant_tokens')
        .select('participant_type, cohort_metadata')
        .eq('token', sessionToken)
        .single()

      const participantToken = participantTokenData as {
        participant_type: string
        cohort_metadata: Record<string, string> | null
      } | null

      if (participantToken) {
        stakeholderName = participantToken.participant_type
      }
    } else {
      // For regular session tokens, try to get from agent_sessions
      const { data: sessionData } = await supabase
        .from('agent_sessions')
        .select(`
          id,
          participant_token_id,
          education_session_context
        `)
        .eq('session_token', sessionToken)
        .single()

      const session = sessionData as {
        id: string
        participant_token_id: string | null
        education_session_context: Record<string, unknown> | null
      } | null

      if (session?.participant_token_id) {
        const { data: participantTokenData } = await supabase
          .from('education_participant_tokens')
          .select('participant_type, cohort_metadata')
          .eq('id', session.participant_token_id)
          .single()

        const participantToken = participantTokenData as {
          participant_type: string
          cohort_metadata: Record<string, string> | null
        } | null

        if (participantToken) {
          stakeholderName = participantToken.participant_type
        }
      }
    }

    // Use vertical-specific agent ID, or fall back to default
    const agentId =
      config.elevenlabsAgentId || process.env.ELEVENLABS_AGENT_ID

    console.log('[voice/signed-url] Agent ID:', agentId ? agentId.substring(0, 10) + '...' : 'NOT SET')

    if (!agentId) {
      console.error('[voice/signed-url] No ElevenLabs agent ID configured')
      return NextResponse.json(
        { error: 'Voice agent not configured' },
        { status: 500 }
      )
    }

    // Request signed URL from ElevenLabs
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY

    console.log('[voice/signed-url] API Key:', elevenlabsApiKey ? 'SET (' + elevenlabsApiKey.length + ' chars)' : 'NOT SET')

    if (!elevenlabsApiKey) {
      console.error('[voice/signed-url] ELEVENLABS_API_KEY not configured')
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 500 }
      )
    }

    console.log('[voice/signed-url] Requesting signed URL from ElevenLabs...')
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenlabsApiKey,
        },
      }
    )

    console.log('[voice/signed-url] ElevenLabs response status:', elevenlabsResponse.status)

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text()
      console.error('[voice/signed-url] ElevenLabs error:', errorText)
      return NextResponse.json(
        { error: `Voice service error: ${elevenlabsResponse.status}` },
        { status: 500 }
      )
    }

    const elevenlabsData = await elevenlabsResponse.json()
    const { signed_url } = elevenlabsData

    console.log('[voice/signed-url] Got signed URL:', signed_url ? 'YES' : 'NO')

    // Return signed URL with dynamic variables
    return NextResponse.json({
      signedUrl: signed_url,
      dynamicVariables: {
        session_token: sessionToken,
        module_id: moduleId || 'default',
        stakeholder_name: stakeholderName,
        vertical_key: config.verticalKey,
      },
      config: {
        verticalKey: config.verticalKey,
        displayName: config.displayName,
        llmEndpointPath: config.llmEndpointPath,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[voice/signed-url] Error:', errorMessage, error)
    return NextResponse.json(
      { error: `Failed to get voice session URL: ${errorMessage}` },
      { status: 500 }
    )
  }
}
