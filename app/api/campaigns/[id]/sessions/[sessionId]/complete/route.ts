import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { notifyCampaignOwner } from '@/lib/services/completion-notification'

/**
 * POST /api/campaigns/[id]/sessions/[sessionId]/complete
 * Facilitator override - manually mark a session as complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: campaignId, sessionId } = await params

    // Verify session belongs to this campaign
    const { data: stakeholderSession, error: sessionError } = await supabaseAdmin
      .from('campaign_assignments')
      .select('*')
      .eq('id', sessionId)
      .eq('campaign_id', campaignId)
      .single() as any

    if (sessionError || !stakeholderSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if already completed
    if (stakeholderSession.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Session already completed'
      })
    }

    // Get agent session
    const { data: agentSession, error: agentError } = await supabaseAdmin
      .from('agent_sessions')
      .select('session_context')
      .eq('stakeholder_session_id', sessionId)
      .single() as any

    if (agentError || !agentSession) {
      return NextResponse.json(
        { error: 'Agent session not found' },
        { status: 404 }
      )
    }

    // Update agent session context
    const updatedContext = {
      ...agentSession.session_context,
      phase: 'completed',
      is_complete: true,
      facilitator_override: true,
      completed_at: new Date().toISOString()
    }

    const { error: contextError } = await (supabaseAdmin
      .from('agent_sessions') as any)
      .update({
        session_context: updatedContext
      })
      .eq('stakeholder_session_id', sessionId)

    if (contextError) {
      console.error('Failed to update agent session:', contextError)
      return NextResponse.json(
        { error: 'Failed to update agent session' },
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
      .eq('id', sessionId)

    if (statusError) {
      console.error('Failed to update stakeholder session:', statusError)
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      )
    }

    console.log(`✅ Session ${sessionId} manually completed by facilitator for ${stakeholderSession.stakeholder_name}`)

    // Notify facilitator/consultant
    try {
      await notifyCampaignOwner({
        campaignId,
        participantName: stakeholderSession.stakeholder_name,
        assessmentType: 'Industry Assessment',
        dashboardPath: `/dashboard/campaigns/${campaignId}`,
      })
    } catch (notifyErr) {
      console.error('Failed to send completion notification:', notifyErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Session marked as complete'
    })

  } catch (error) {
    console.error('Complete session error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
