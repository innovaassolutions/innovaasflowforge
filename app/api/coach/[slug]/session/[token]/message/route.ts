/**
 * Coach Session Message API - POST
 *
 * Processes messages in an archetype interview session.
 * Tracks usage events for billing and analytics.
 *
 * Story: 3-3-registration-sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processArchetypeMessage, TenantContext } from '@/lib/agents/archetype-interview-agent'
import { ArchetypeSessionState } from '@/lib/agents/archetype-constitution'
import { logUsageEvent, logLLMUsage } from '@/lib/usage/log-usage'
import { checkUsageLimit, createUsageLimitError } from '@/lib/services/usage-tracker'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface MessageRequest {
  message: string | null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { slug, token } = await params
    const body: MessageRequest = await request.json()
    const supabase = getServiceClient()

    // Verify tenant exists and get brand config
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, is_active, brand_config')
      .eq('slug', slug)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Coach not found' },
        { status: 404 }
      )
    }

    if (!tenant.is_active) {
      return NextResponse.json(
        { success: false, error: 'This coach is not currently active' },
        { status: 403 }
      )
    }

    // Find coaching session by token
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, client_name, client_email, client_status, started_at')
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session link' },
        { status: 404 }
      )
    }

    // Check if session is already completed
    if (session.client_status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'This session has already been completed' },
        { status: 400 }
      )
    }

    // Check usage limit before processing AI request (Story 2.4)
    const usageCheck = await checkUsageLimit(tenant.id)
    if (!usageCheck.allowed) {
      const errorResponse = createUsageLimitError(usageCheck)
      return NextResponse.json(errorResponse.body, {
        status: errorResponse.status,
        headers: errorResponse.headers,
      })
    }

    // Get or create agent session
    let agentSession = await getOrCreateAgentSession(supabase, session.id)

    // Parse existing conversation history
    const conversationHistory = (agentSession.conversation_history as Array<{
      role: 'user' | 'assistant'
      content: string
    }>) || []

    // Parse existing session state
    const currentState = agentSession.session_context as ArchetypeSessionState | null

    // Build tenant context for the agent
    const tenantContext: TenantContext = {
      display_name: tenant.display_name,
      brand_config: tenant.brand_config as TenantContext['brand_config'],
    }

    // Process message with archetype agent
    const agentResponse = await processArchetypeMessage(
      body.message,
      currentState,
      conversationHistory,
      tenantContext,
      session.client_name
    )

    // Build updated conversation history
    const updatedHistory = [...conversationHistory]
    if (body.message) {
      updatedHistory.push({
        role: 'user',
        content: body.message,
      })
    }
    updatedHistory.push({
      role: 'assistant',
      content: agentResponse.message,
    })

    // Update agent session
    await supabase
      .from('agent_sessions')
      .update({
        conversation_history: updatedHistory,
        session_context: agentResponse.sessionState,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentSession.id)

    // Update participant session status
    const updates: Record<string, unknown> = {
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Mark as started if first message
    const isFirstMessage = !session.started_at
    if (isFirstMessage) {
      updates.started_at = new Date().toISOString()
      updates.client_status = 'in_progress'

      // Log session_started event
      await logUsageEvent({
        tenantId: tenant.id,
        eventType: 'session_started',
        eventData: {
          session_id: session.id,
          assessment_type: 'archetype',
          client_name: session.client_name,
        },
      }, supabase)
    }

    // Log llm_request event for this message (with separate input/output tokens for accurate cost)
    if (agentResponse.usage) {
      await logLLMUsage(
        tenant.id,
        agentResponse.usage.model,
        agentResponse.usage.input_tokens,
        agentResponse.usage.output_tokens,
        {
          session_id: session.id,
          assessment_type: 'archetype',
          prompt_type: isFirstMessage ? 'opening' : 'conversation',
          question_index: agentResponse.sessionState.current_question_index,
        },
        supabase
      )
    }

    // Mark as completed if interview is done
    if (agentResponse.isComplete) {
      updates.completed_at = new Date().toISOString()
      updates.client_status = 'completed'
      updates.metadata = {
        archetype_results: {
          default_archetype: agentResponse.sessionState.default_archetype,
          authentic_archetype: agentResponse.sessionState.authentic_archetype,
          is_aligned: agentResponse.sessionState.is_aligned,
          scores: agentResponse.sessionState.scores,
          completed_at: new Date().toISOString(),
        },
      }

      // Log session_completed event
      await logUsageEvent({
        tenantId: tenant.id,
        eventType: 'session_completed',
        eventData: {
          session_id: session.id,
          assessment_type: 'archetype',
          default_archetype: agentResponse.sessionState.default_archetype,
          authentic_archetype: agentResponse.sessionState.authentic_archetype,
          is_aligned: agentResponse.sessionState.is_aligned,
        },
      }, supabase)
    }

    await supabase
      .from('coaching_sessions')
      .update(updates)
      .eq('id', session.id)

    return NextResponse.json({
      success: true,
      message: agentResponse.message,
      sessionState: {
        phase: agentResponse.sessionState.phase,
        current_question_index: agentResponse.sessionState.current_question_index,
        is_complete: agentResponse.isComplete,
      },
      isComplete: agentResponse.isComplete,
    })
  } catch (error) {
    console.error('Message processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

async function getOrCreateAgentSession(
  supabase: ReturnType<typeof getServiceClient>,
  coachingSessionId: string
) {
  // Check for existing agent session (using coaching_session_id for coaching module)
  const { data: existing } = await supabase
    .from('agent_sessions')
    .select('*')
    .eq('coaching_session_id', coachingSessionId)
    .eq('agent_type', 'archetype_interview')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    return existing
  }

  // Create new agent session (using coaching_session_id for coaching module)
  const { data: newSession, error } = await supabase
    .from('agent_sessions')
    .insert({
      coaching_session_id: coachingSessionId,
      agent_type: 'archetype_interview',
      agent_model: 'claude-sonnet-4-20250514',
      conversation_history: [],
      session_context: null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create agent session: ${error.message}`)
  }

  return newSession
}
