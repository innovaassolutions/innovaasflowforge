import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { CustomerSuccessSessionState } from '@/lib/agents/customer-success-agent'

/**
 * Send testimonial completion webhook to callback URL
 */
async function sendCompletionWebhook(
  sessionId: string,
  sessionState: CustomerSuccessSessionState,
  session: any
): Promise<void> {
  const callbackUrl = session.metadata?.callback_url

  if (!callbackUrl) {
    console.log('⚠️ No callback URL configured for testimonial session')
    return
  }

  const payload = {
    session_id: sessionId,
    testimonial_text: sessionState.approved_testimonial || sessionState.draft_testimonial,
    rating: sessionState.rating,
    customer_name: session.stakeholder_name,
    customer_title: session.stakeholder_title,
    customer_company: session.metadata?.company_name,
    themes: sessionState.themes || [],
    completed_at: new Date().toISOString()
  }

  console.log('📤 Sending testimonial webhook to:', callbackUrl)

  try {
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FlowForge-Event': 'testimonial.completed'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('❌ Webhook failed:', response.status)
    } else {
      console.log('✅ Testimonial webhook sent successfully')
    }
  } catch (error) {
    console.error('❌ Webhook error:', error)
  }
}

/**
 * POST /api/testimonial/[token]/complete
 * Manually complete a testimonial session
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
        message: 'Testimonial already completed'
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

    const sessionState = agentSession.session_context as CustomerSuccessSessionState

    // Update agent session context to mark as complete
    const updatedContext: CustomerSuccessSessionState = {
      ...sessionState,
      phase: 'completed',
      is_complete: true,
      last_interaction: new Date().toISOString()
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
        completed_at: new Date().toISOString(),
        metadata: {
          ...stakeholderSession.metadata,
          testimonial: updatedContext.approved_testimonial || updatedContext.draft_testimonial,
          rating: updatedContext.rating,
          themes: updatedContext.themes
        }
      })
      .eq('id', stakeholderSession.id)

    if (statusError) {
      console.error('Failed to update stakeholder session:', statusError)
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      )
    }

    console.log(`✅ Testimonial manually completed for ${stakeholderSession.stakeholder_name}`)

    // Send webhook callback
    await sendCompletionWebhook(
      stakeholderSession.id,
      updatedContext,
      stakeholderSession
    )

    return NextResponse.json({
      success: true,
      message: 'Testimonial completed successfully'
    })

  } catch (error) {
    console.error('Complete testimonial error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
