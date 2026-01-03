import { NextRequest, NextResponse } from 'next/server'

/**
 * TEST ENDPOINT - Minimal voice session for debugging
 *
 * This bypasses all custom logic and returns a conversation token
 * for a test agent to isolate connection issues.
 */

// NEW: Custom LLM agent with 30-second turn timeout (created 2026-01-03)
// Previous minimal test agent: agent_7301ke121bcbea0ayecs8xapafpv
const TEST_AGENT_ID = 'agent_2301ke131vzmeymam8fyhqgw2wb4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  console.log('[voice/test-session] POST request received')

  try {
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY

    if (!elevenlabsApiKey) {
      console.error('[voice/test-session] ELEVENLABS_API_KEY not set')
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Get conversation token directly from ElevenLabs
    console.log('[voice/test-session] Requesting token for agent:', TEST_AGENT_ID)

    const tokenResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${TEST_AGENT_ID}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenlabsApiKey,
        },
      }
    )

    console.log('[voice/test-session] Token response status:', tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[voice/test-session] ElevenLabs error:', errorText)
      return NextResponse.json(
        { error: `Voice service error: ${tokenResponse.status}` },
        { status: 500, headers: corsHeaders }
      )
    }

    const tokenData = await tokenResponse.json()

    console.log('[voice/test-session] Got conversation token:', tokenData.token ? 'YES' : 'NO')

    // Return minimal response - no dynamic variables, no overrides
    return NextResponse.json({
      conversationToken: tokenData.token,
      agentId: TEST_AGENT_ID,
      // No firstMessage - use agent's default
      // No dynamicVariables - none configured on this agent
    }, { headers: corsHeaders })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[voice/test-session] Error:', errorMessage, error)
    return NextResponse.json(
      { error: `Failed to get test session: ${errorMessage}` },
      { status: 500, headers: corsHeaders }
    )
  }
}
