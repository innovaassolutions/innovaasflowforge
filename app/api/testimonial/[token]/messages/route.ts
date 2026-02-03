import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  processMessage,
  generateGreeting,
  CustomerContext,
  CustomerSuccessSessionState
} from '@/lib/agents/customer-success-agent'

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
  console.log('📦 Payload:', JSON.stringify(payload, null, 2))

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
      const errorText = await response.text()
      console.error('❌ Webhook failed:', response.status, errorText)
    } else {
      console.log('✅ Testimonial webhook sent successfully')
    }
  } catch (error) {
    console.error('❌ Webhook error:', error)
  }
}

/**
 * POST /api/testimonial/[token]/messages
 * Send a message to the customer success agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: accessToken } = await params
    const { message, agentSessionId } = await request.json()

    console.log('💬 Testimonial message:', {
      token: accessToken.substring(0, 10) + '...',
      hasMessage: !!message,
      agentSessionId
    })

    if (!agentSessionId) {
      return NextResponse.json(
        { error: 'Missing required field: agentSessionId' },
        { status: 400 }
      )
    }

    // Verify access token and get session details
    const { data: stakeholderSession, error: sessionError } = await supabaseAdmin
      .from('campaign_assignments')
      .select(`
        *,
        campaigns (
          id,
          name,
          company_name,
          facilitator_name
        )
      `)
      .eq('access_token', accessToken)
      .single() as any

    if (sessionError || !stakeholderSession) {
      console.error('❌ Session lookup failed:', sessionError)
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }

    // Verify this is a testimonial session
    if (stakeholderSession.metadata?.type !== 'testimonial') {
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      )
    }

    // Get agent session
    const { data: agentSession, error: agentError } = (await supabaseAdmin
      .from('agent_sessions')
      .select('*')
      .eq('id', agentSessionId)
      .eq('stakeholder_session_id', stakeholderSession.id)
      .single()) as any

    if (agentError || !agentSession) {
      return NextResponse.json(
        { error: 'Invalid agent session' },
        { status: 404 }
      )
    }

    // Build customer context
    const customerContext: CustomerContext = {
      contact_name: stakeholderSession.stakeholder_name,
      contact_email: stakeholderSession.stakeholder_email,
      contact_title: stakeholderSession.stakeholder_title || '',
      company_name: stakeholderSession.metadata?.company_name || '',
      project_id: stakeholderSession.metadata?.project_id || ''
    }

    // Handle initial greeting (no message provided)
    if (!message) {
      const greeting = await generateGreeting(customerContext)

      const greetingMessage = {
        role: 'assistant' as const,
        content: greeting,
        timestamp: new Date().toISOString()
      }

      const initialState: CustomerSuccessSessionState = {
        phase: 'challenge', // After greeting, ready for challenge question
        questions_asked: 0,
        responses: {},
        is_complete: false,
        last_interaction: new Date().toISOString()
      }

      // Save initial message and state
      const { error: updateError } = await (supabaseAdmin
        .from('agent_sessions') as any)
        .update({
          conversation_history: [greetingMessage],
          session_context: initialState,
          last_message_at: new Date().toISOString()
        })
        .eq('id', agentSessionId)

      if (updateError) {
        console.error('Agent session update error:', updateError)
      }

      return NextResponse.json({
        success: true,
        message: greeting,
        conversationState: initialState
      })
    }

    // Process user message through customer success agent
    const currentState = agentSession.session_context as CustomerSuccessSessionState || {
      phase: 'greeting',
      questions_asked: 0,
      responses: {},
      is_complete: false
    }

    const { response: assistantResponse, updatedState } = await processMessage(
      message,
      customerContext,
      agentSession.conversation_history || [],
      currentState
    )

    // Update message history
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    }

    const assistantMessage = {
      role: 'assistant' as const,
      content: assistantResponse,
      timestamp: new Date().toISOString()
    }

    const updatedHistory = [
      ...(agentSession.conversation_history || []),
      userMessage,
      assistantMessage
    ]

    // Save updated agent session
    const { error: updateError } = await (supabaseAdmin
      .from('agent_sessions') as any)
      .update({
        conversation_history: updatedHistory,
        session_context: updatedState,
        last_message_at: new Date().toISOString()
      })
      .eq('id', agentSessionId)

    if (updateError) {
      console.error('❌ Agent session update failed:', updateError)
    } else {
      console.log(`✅ State saved: Phase=${updatedState.phase} | Complete=${updatedState.is_complete}`)
    }

    // Handle completion
    if (updatedState.is_complete && stakeholderSession.status !== 'completed') {
      console.log(`🎯 Testimonial complete for ${stakeholderSession.stakeholder_name}`)

      // Update stakeholder session status
      const { error: statusUpdateError } = await (supabaseAdmin
        .from('campaign_assignments') as any)
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            ...stakeholderSession.metadata,
            testimonial: updatedState.approved_testimonial || updatedState.draft_testimonial,
            rating: updatedState.rating,
            themes: updatedState.themes
          }
        })
        .eq('id', stakeholderSession.id)

      if (statusUpdateError) {
        console.error('❌ Session status update error:', statusUpdateError)
      } else {
        console.log(`✅ Testimonial session completed`)

        // Send webhook callback
        await sendCompletionWebhook(
          stakeholderSession.id,
          updatedState,
          stakeholderSession
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: assistantResponse,
      conversationState: updatedState,
      isComplete: updatedState.is_complete || false
    })

  } catch (error) {
    console.error('Testimonial message error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
