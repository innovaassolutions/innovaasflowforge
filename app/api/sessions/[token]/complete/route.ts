import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * POST /api/sessions/[token]/complete
 * Manually complete an interview session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: accessToken } = await params
    const { agentSessionId } = await request.json()

    if (!agentSessionId) {
      return NextResponse.json(
        { error: 'Missing required field: agentSessionId' },
        { status: 400 }
      )
    }

    // Verify access token and get session details
    const { data: stakeholderSession, error: sessionError } = await supabaseAdmin
      .from('campaign_assignments')
      .select('*')
      .eq('access_token', accessToken)
      .single() as any

    if (sessionError || !stakeholderSession) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }

    // Check if already completed
    if (stakeholderSession.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Interview already completed'
      })
    }

    // Get agent session
    const { data: agentSession, error: agentError } = await supabaseAdmin
      .from('agent_sessions')
      .select('session_context')
      .eq('id', agentSessionId)
      .eq('stakeholder_session_id', stakeholderSession.id)
      .single() as any

    if (agentError || !agentSession) {
      return NextResponse.json(
        { error: 'Invalid agent session' },
        { status: 404 }
      )
    }

    // Update agent session context to mark as complete
    const updatedContext = {
      ...agentSession.session_context,
      phase: 'completed',
      is_complete: true,
      manually_completed: true,
      completed_at: new Date().toISOString()
    }

    const { error: contextError } = await (supabaseAdmin
      .from('agent_sessions') as any)
      .update({
        session_context: updatedContext
      })
      .eq('id', agentSessionId)

    if (contextError) {
      console.error('Failed to update agent session:', contextError)
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    // Update stakeholder session status
    const { error: statusError } = await (supabaseAdmin
      .from('campaign_assignments') as any)
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', stakeholderSession.id)

    if (statusError) {
      console.error('Failed to update stakeholder session:', statusError)
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      )
    }

    console.log(`✅ Interview manually completed for ${stakeholderSession.stakeholder_name}`)

    return NextResponse.json({
      success: true,
      message: 'Interview completed successfully'
    })

  } catch (error) {
    console.error('Complete session error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
