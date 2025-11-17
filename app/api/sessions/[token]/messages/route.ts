import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { processMessage, generateGreeting } from '@/lib/agents/assessment-agent'

/**
 * POST /api/sessions/[token]/messages
 * Send a message to the AI agent and receive a response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: accessToken } = await params
    const { message, agentSessionId } = await request.json()

    if (!agentSessionId) {
      return NextResponse.json(
        { error: 'Missing required field: agentSessionId' },
        { status: 400 }
      )
    }

    // Verify access token and get session details
    const { data: stakeholderSession, error: sessionError } = await supabaseAdmin
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

    if (sessionError || !stakeholderSession) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
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

    // Handle initial greeting (no message provided)
    if (!message) {
      const greeting = await generateGreeting(stakeholderSession)

      const greetingMessage = {
        role: 'assistant' as const,
        content: greeting,
        timestamp: new Date().toISOString()
      }

      const initialState = {
        phase: 'introduction',
        topics_covered: [],
        questions_asked: 0,
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

    // Process user message through assessment agent
    const { response: assistantResponse, updatedState } = await processMessage(
      message,
      stakeholderSession,
      agentSession.conversation_history || [],
      agentSession.session_context || { phase: 'introduction', topics_covered: [], questions_asked: 0 }
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
      console.error('❌ CRITICAL: Agent session update failed:', updateError)
      console.error('Failed to save state:', {
        agentSessionId,
        questions_asked: updatedState.questions_asked,
        is_complete: updatedState.is_complete,
        phase: updatedState.phase
      })
    } else {
      console.log(`✅ State saved: Q${updatedState.questions_asked} | Phase: ${updatedState.phase} | Complete: ${updatedState.is_complete}`)
    }

    // Check if interview is complete and update stakeholder session status
    if (updatedState.is_complete) {
      console.log(`🎯 Completion detected for ${stakeholderSession.stakeholder_name} at Q${updatedState.questions_asked}`)

      if (stakeholderSession.status !== 'completed') {
        const { error: statusUpdateError } = await (supabaseAdmin
          .from('stakeholder_sessions') as any)
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', stakeholderSession.id)

        if (statusUpdateError) {
          console.error('❌ Stakeholder session status update error:', statusUpdateError)
        } else {
          console.log(`✅ Interview completed for ${stakeholderSession.stakeholder_name}`)
        }
      } else {
        console.log(`ℹ️  Session already marked as completed`)
      }
    }

    return NextResponse.json({
      success: true,
      message: assistantResponse,
      conversationState: updatedState,
      isComplete: updatedState.is_complete || false
    })

  } catch (error) {
    console.error('Message processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
