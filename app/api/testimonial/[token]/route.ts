import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/testimonial/[token]
 * Access testimonial session by access token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: accessToken } = await params

    console.log('🔍 Testimonial session lookup - Token:', accessToken.substring(0, 10) + '...')

    // Find campaign assignment by access token
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('campaign_assignments')
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
      console.error('Session lookup error:', sessionError)
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 404 }
      )
    }

    // Verify this is a testimonial session
    if (session.metadata?.type !== 'testimonial') {
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      )
    }

    // Update session status to in_progress if it's invited
    if (session.status === 'invited') {
      const { error: updateError } = await (supabaseAdmin
        .from('campaign_assignments') as any)
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
      // Create new agent session for testimonial
      const { data: newAgentSession, error: agentCreateError } = (await supabaseAdmin
        .from('agent_sessions')
        .insert({
          stakeholder_session_id: session.id,
          agent_type: 'interview_agent',
          session_context: {
            phase: 'greeting',
            questions_asked: 0,
            responses: {},
            is_complete: false
          },
          conversation_history: []
        } as any)
        .select()
        .single()) as any

      if (agentCreateError) {
        console.error('Agent session creation error:', agentCreateError)
        return NextResponse.json(
          { error: 'Failed to initialize testimonial session', details: agentCreateError.message },
          { status: 500 }
        )
      }

      agentSession = newAgentSession
    }

    // Return session with agent data
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
    console.error('Testimonial session access error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
