import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/sessions/[token]
 * Access stakeholder session by access token
 * This is the endpoint called when a stakeholder clicks their invitation link
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: accessToken } = await params

    // Find stakeholder session by access token
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('stakeholder_sessions')
      .select(`
        *,
        campaigns (
          id,
          name,
          company_name,
          facilitator_name,
          description
        )
      `)
      .eq('access_token', accessToken)
      .single() as any

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 404 }
      )
    }

    // Check if session is completed
    if (session.status === 'completed') {
      return NextResponse.json({
        success: true,
        session,
        message: 'This interview has already been completed. Thank you for your participation.'
      })
    }

    // Update session status to in_progress if it's invited
    if (session.status === 'invited') {
      const { error: updateError } = await (supabaseAdmin
        .from('stakeholder_sessions') as any)
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', session.id)

      if (updateError) {
        console.error('Session status update error:', updateError)
      }
    }

    // Get or create agent session
    let agentSession
    const { data: existingAgentSession } = (await supabaseAdmin
      .from('agent_sessions')
      .select('*')
      .eq('stakeholder_session_id', session.id)
      .single()) as any

    if (existingAgentSession) {
      agentSession = existingAgentSession
    } else {
      // Create new agent session
      const { data: newAgentSession, error: agentCreateError } = (await supabaseAdmin
        .from('agent_sessions')
        .insert({
          stakeholder_session_id: session.id,
          agent_type: 'interview_agent',
          session_context: {
            phase: 'introduction',
            topics_covered: [],
            questions_asked: 0
          },
          conversation_history: []
        } as any)
        .select()
        .single()) as any

      if (agentCreateError) {
        console.error('Agent session creation error:', agentCreateError)
        return NextResponse.json(
          { error: 'Failed to initialize interview session', details: agentCreateError.message },
          { status: 500 }
        )
      }

      agentSession = newAgentSession
    }

    // Return session with agent data including conversation history for resume capability
    return NextResponse.json({
      success: true,
      session: {
        ...session,
        agentSessionId: agentSession.id
      },
      conversationHistory: agentSession.conversation_history || [],
      conversationState: agentSession.session_context || null,
      isResuming: (agentSession.conversation_history?.length || 0) > 0
    })

  } catch (error) {
    console.error('Session access error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
