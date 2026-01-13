/**
 * Reflection Message API
 *
 * Handles the reflection conversation flow after viewing archetype results.
 * POST: Send a message (or null to start), receive AI response
 * GET: Retrieve current reflection state and messages
 *
 * Story: 1.2 Reflection Flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  processReflectionMessage,
  createInitialReflectionState,
  type ReflectionState,
  type ReflectionMessage,
  type ArchetypeResultsContext,
} from '@/lib/agents/reflection-agent'
import { processEnhancement, type EnhancedResults } from '@/lib/agents/enhancement-agent'
import { type Archetype } from '@/lib/agents/archetype-constitution'
import { logLLMUsage } from '@/lib/usage/log-usage'
import { checkUsageLimit, createUsageLimitError } from '@/lib/services/usage-tracker'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ArchetypeResultsData {
  default_archetype: Archetype
  authentic_archetype: Archetype
  is_aligned: boolean
  scores: {
    default: Record<Archetype, number>
    authentic: Record<Archetype, number>
    friction: Record<Archetype, number>
  }
}

interface ReflectRequestBody {
  message: string | null
}

interface ReflectResponse {
  success: boolean
  message?: string
  state?: ReflectionState
  conversationHistory?: ReflectionMessage[]
  isComplete?: boolean
  isEnhanced?: boolean
  error?: string
}

/**
 * POST - Send a reflection message and receive AI response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
): Promise<NextResponse<ReflectResponse>> {
  try {
    const { slug, token } = await params
    const body = (await request.json()) as ReflectRequestBody
    const { message } = body

    const supabase = getServiceClient()

    // Verify tenant exists and is active
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, slug, is_active, brand_config')
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
      .select(
        'id, client_name, client_email, client_status, reflection_status, reflection_messages, metadata'
      )
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session link' },
        { status: 404 }
      )
    }

    // Check if session is completed
    if (session.client_status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Assessment not yet completed' },
        { status: 400 }
      )
    }

    // Check if reflection is already completed
    if (session.reflection_status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Reflection already completed' },
        { status: 400 }
      )
    }

    // Check usage limit before processing AI request (Story 2.4)
    const usageCheck = await checkUsageLimit(tenant.id)
    if (!usageCheck.allowed) {
      const errorResponse = createUsageLimitError(usageCheck)
      return NextResponse.json(
        { success: false, error: errorResponse.body.message as string },
        { status: errorResponse.status, headers: errorResponse.headers }
      )
    }

    // Extract archetype results from metadata
    const metadata = session.metadata as { archetype_results?: ArchetypeResultsData } | null
    const archetypeResults = metadata?.archetype_results

    if (!archetypeResults) {
      return NextResponse.json(
        { success: false, error: 'Results not yet processed' },
        { status: 400 }
      )
    }

    // Get existing reflection messages and state
    const reflectionMessages = (session.reflection_messages || []) as ReflectionMessage[]

    // Determine current state
    let currentState: ReflectionState | null = null
    if (reflectionMessages.length > 0) {
      // Reconstruct state from message count
      const userMessageCount = reflectionMessages.filter((m) => m.role === 'user').length
      currentState = {
        phase: userMessageCount >= 2 ? 'closing' : 'conversation',
        exchange_count: userMessageCount,
        is_complete: false,
      }
    }

    // Process message through reflection agent
    const agentResponse = await processReflectionMessage(
      message,
      currentState,
      reflectionMessages,
      archetypeResults as ArchetypeResultsContext,
      {
        display_name: tenant.display_name,
        brand_config: tenant.brand_config as { welcomeMessage?: string; completionMessage?: string },
      },
      session.client_name
    )

    // Log LLM usage for billing (with separate input/output tokens)
    if (agentResponse.usage) {
      await logLLMUsage(
        tenant.id,
        agentResponse.usage.model,
        agentResponse.usage.input_tokens,
        agentResponse.usage.output_tokens,
        {
          session_id: session.id,
          assessment_type: 'archetype_reflection',
          exchange_count: agentResponse.state.exchange_count,
        },
        supabase
      )
    }

    // Build updated conversation history
    const updatedMessages: ReflectionMessage[] = [...reflectionMessages]

    // Add user message if provided
    if (message) {
      updatedMessages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      })
    }

    // Add assistant response
    updatedMessages.push({
      role: 'assistant',
      content: agentResponse.message,
      timestamp: new Date().toISOString(),
    })

    // Determine new reflection status
    let newReflectionStatus = session.reflection_status
    if (newReflectionStatus === 'pending' || newReflectionStatus === 'none' || !newReflectionStatus) {
      newReflectionStatus = 'accepted'
    }
    if (agentResponse.isComplete) {
      newReflectionStatus = 'completed'
    }

    // If reflection is complete, trigger enhancement synthesis
    let enhancedResults: EnhancedResults | null = null
    let isEnhanced = false

    if (agentResponse.isComplete) {
      console.log('Reflection complete, triggering enhancement synthesis...')

      const enhancementResponse = await processEnhancement({
        originalResults: archetypeResults as ArchetypeResultsContext,
        reflectionMessages: updatedMessages,
        participantName: session.client_name,
        tenant: {
          display_name: tenant.display_name,
          brand_config: tenant.brand_config as { welcomeMessage?: string; completionMessage?: string },
        },
      })

      if (enhancementResponse.success && enhancementResponse.enhanced) {
        enhancedResults = enhancementResponse.enhanced
        isEnhanced = true
        console.log('Enhancement synthesis successful')
      } else {
        // Log error but don't fail the request - reflection is still valid
        console.error('Enhancement synthesis failed:', enhancementResponse.error)
      }
    }

    // Update session with new messages, status, and enhanced results
    const updateData: Record<string, unknown> = {
      reflection_messages: updatedMessages,
      reflection_status: newReflectionStatus,
    }

    if (enhancedResults) {
      updateData.enhanced_results = enhancedResults
    }

    const { error: updateError } = await supabase
      .from('coaching_sessions')
      .update(updateData)
      .eq('id', session.id)

    if (updateError) {
      console.error('Failed to update reflection messages:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to save reflection' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: agentResponse.message,
      state: agentResponse.state,
      conversationHistory: updatedMessages,
      isComplete: agentResponse.isComplete,
      isEnhanced,
    })
  } catch (error) {
    console.error('Reflection message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process reflection message' },
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve current reflection state and messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
): Promise<NextResponse<ReflectResponse>> {
  try {
    const { slug, token } = await params
    const supabase = getServiceClient()

    // Verify tenant exists and is active
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, slug, is_active')
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
      .select('id, reflection_status, reflection_messages')
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session link' },
        { status: 404 }
      )
    }

    const reflectionMessages = (session.reflection_messages || []) as ReflectionMessage[]
    const userMessageCount = reflectionMessages.filter((m) => m.role === 'user').length

    // Reconstruct state
    const state: ReflectionState = {
      phase:
        session.reflection_status === 'completed'
          ? 'completed'
          : userMessageCount >= 2
            ? 'closing'
            : userMessageCount > 0
              ? 'conversation'
              : 'opening',
      exchange_count: userMessageCount,
      is_complete: session.reflection_status === 'completed',
    }

    return NextResponse.json({
      success: true,
      state,
      conversationHistory: reflectionMessages,
      isComplete: session.reflection_status === 'completed',
    })
  } catch (error) {
    console.error('Reflection fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reflection state' },
      { status: 500 }
    )
  }
}
