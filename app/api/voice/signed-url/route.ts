import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getVoiceConfigForSession } from '@/lib/services/voice-availability'

/**
 * POST /api/voice/signed-url
 * Get a signed URL for connecting to ElevenLabs Conversational AI
 *
 * This endpoint:
 * 1. Validates the session token
 * 2. Checks voice availability for the session
 * 3. Requests a signed URL from ElevenLabs
 * 4. Returns the URL with dynamic variables for session context
 *
 * Body:
 * - sessionToken: string (required) - The session token
 * - moduleId: string (optional) - The module being interviewed
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionToken, moduleId } = await request.json()

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Check voice availability and get config
    const voiceAvailability = await getVoiceConfigForSession(sessionToken)

    if (!voiceAvailability.available) {
      return NextResponse.json(
        { error: voiceAvailability.reason || 'Voice not available' },
        { status: 403 }
      )
    }

    const config = voiceAvailability.config!

    // Get session details for dynamic variables
    const { data: sessionData, error: sessionError } = await supabaseAdmin
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

    // Type assertion for session data (columns may not be in generated types)
    const session = sessionData as {
      id: string
      participant_token_id: string | null
      education_session_context: Record<string, unknown> | null
    } | null

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get stakeholder name if available (for education sessions)
    let stakeholderName: string | undefined

    if (session.participant_token_id) {
      const { data: participantTokenData } = await supabaseAdmin
        .from('education_participant_tokens')
        .select('participant_type, cohort_metadata')
        .eq('id', session.participant_token_id)
        .single()

      const participantToken = participantTokenData as {
        participant_type: string
        cohort_metadata: Record<string, string> | null
      } | null

      if (participantToken) {
        // Use participant type as a friendly identifier
        stakeholderName = participantToken.participant_type
      }
    }

    // Use vertical-specific agent ID, or fall back to default
    const agentId =
      config.elevenlabsAgentId || process.env.ELEVENLABS_AGENT_ID

    if (!agentId) {
      console.error('No ElevenLabs agent ID configured')
      return NextResponse.json(
        { error: 'Voice agent not configured' },
        { status: 500 }
      )
    }

    // Request signed URL from ElevenLabs
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY

    if (!elevenlabsApiKey) {
      console.error('ELEVENLABS_API_KEY not configured')
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 500 }
      )
    }

    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenlabsApiKey,
        },
      }
    )

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text()
      console.error('ElevenLabs signed URL error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get voice session URL' },
        { status: 500 }
      )
    }

    const { signed_url } = await elevenlabsResponse.json()

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
    console.error('Voice signed URL error:', error)
    return NextResponse.json(
      { error: 'Failed to get voice session URL' },
      { status: 500 }
    )
  }
}
