import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { notifyEducationAdmin, notifyTenantOwner, notifyCampaignOwner } from '@/lib/services/completion-notification'
import {
  processEducationMessage,
  detectSafeguardingConcerns,
  generateClosingMessage,
  EducationCampaign,
  ConversationState,
  EducationModule,
} from '@/lib/agents/education-interview-agent'
import { processArchetypeMessage, TenantContext } from '@/lib/agents/archetype-interview-agent'
import { ArchetypeSessionState } from '@/lib/agents/archetype-constitution'
import { processMessage as processAssessmentMessage, generateGreeting as generateAssessmentGreeting } from '@/lib/agents/assessment-agent'
import { logUsageEvent, logLLMUsage } from '@/lib/usage/log-usage'
import { checkUsageLimit } from '@/lib/services/usage-tracker'
import type { OpenAIChatMessage, OpenAIChatRequest } from '@/lib/types/voice'

// CORS headers for ElevenLabs cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * POST /api/voice/chat/completions
 * Custom LLM endpoint for ElevenLabs Conversational AI
 *
 * This endpoint receives OpenAI-compatible chat completion requests from ElevenLabs,
 * processes them through the appropriate interview agent, and returns streaming
 * responses in SSE format.
 *
 * The session context is extracted from dynamic variables in the system prompt.
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log(`[voice/chat/completions] ========== POST request received at ${timestamp} ==========`)

  // Debug: Log all headers to see what ElevenLabs sends
  const headersObj: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    // Mask sensitive values but show structure
    if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('key')) {
      headersObj[key] = `${value.substring(0, 20)}... (len: ${value.length})`
    } else {
      headersObj[key] = value
    }
  })
  console.log('[voice/chat/completions] All headers:', JSON.stringify(headersObj, null, 2))

  try {
    // Validate authorization - check multiple possible header formats
    const authHeader = request.headers.get('authorization')
    const xApiKey = request.headers.get('x-api-key')
    const apiKeyHeader = request.headers.get('api-key')

    console.log('[voice/chat/completions] Auth header present:', !!authHeader)
    console.log('[voice/chat/completions] x-api-key present:', !!xApiKey)
    console.log('[voice/chat/completions] api-key present:', !!apiKeyHeader)

    // TEMPORARY: Skip auth check to diagnose ElevenLabs connection issue
    // TODO: Re-enable auth after debugging
    const SKIP_AUTH_FOR_DEBUG = true

    if (!SKIP_AUTH_FOR_DEBUG) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[voice/chat/completions] Missing or invalid auth header')
        return new Response('Unauthorized', { status: 401 })
      }

      const apiKey = authHeader.replace('Bearer ', '')
      const expectedSecret = process.env.ELEVENLABS_LLM_SECRET
      console.log('[voice/chat/completions] API key length:', apiKey.length, 'Expected length:', expectedSecret?.length)

      if (apiKey !== expectedSecret) {
        console.error('[voice/chat/completions] Invalid LLM secret - mismatch')
        return new Response('Unauthorized', { status: 401 })
      }
    } else {
      console.log('[voice/chat/completions] DEBUG MODE: Auth check skipped')
      if (authHeader) {
        const apiKey = authHeader.replace('Bearer ', '')
        console.log('[voice/chat/completions] Received key (first 10 chars):', apiKey.substring(0, 10), 'length:', apiKey.length)
      }
    }

    console.log('[voice/chat/completions] Authorization successful (or skipped)')

    const body: OpenAIChatRequest = await request.json()
    const { messages, stream = true } = body

    console.log('[voice/chat/completions] Messages count:', messages.length)
    console.log('[voice/chat/completions] Message roles:', messages.map((m) => m.role).join(', '))

    // Extract session context from system prompt
    // DEBUG: Print full system prompt to diagnose dynamic variable interpolation
    const systemMessage = messages.find((m) => m.role === 'system')
    console.log('[voice/chat/completions] System prompt (first 500 chars):', systemMessage?.content?.substring(0, 500))
    console.log('[voice/chat/completions] System prompt (last 300 chars):', systemMessage?.content?.slice(-300))

    const sessionContext = parseSessionContext(messages)
    console.log('[voice/chat/completions] Session context:', {
      hasToken: !!sessionContext.sessionToken,
      tokenPrefix: sessionContext.sessionToken?.substring(0, 10),
      moduleId: sessionContext.moduleId,
      verticalKey: sessionContext.verticalKey,
      stakeholderName: sessionContext.stakeholderName,
      isTestMode: sessionContext.isTestMode,
    })

    // Handle test mode - return simple responses without database access
    if (sessionContext.isTestMode) {
      console.log('[voice/chat/completions] TEST MODE - returning simple response')
      const userMessage = messages.filter((m) => m.role === 'user').pop()?.content

      if (!userMessage) {
        // Initial greeting for test mode
        const testGreeting = `Hi there! I'm Jippity, your AI interviewer. This is a test session to verify the voice connection is working properly. Everything sounds great! How are you doing today?`
        if (stream) {
          return streamResponseAsync(Promise.resolve(testGreeting))
        }
        return jsonResponse(testGreeting)
      }

      // Simple response to user input in test mode
      const testResponse = `Thank you for saying that! I heard you clearly. The voice connection is working well. Is there anything specific you'd like to test?`
      if (stream) {
        return streamResponseAsync(Promise.resolve(testResponse))
      }
      return jsonResponse(testResponse)
    }

    if (!sessionContext.sessionToken) {
      console.error('[voice/chat/completions] No session token found in messages')
      return streamError('Session context not found')
    }

    // Get the latest user message
    const userMessage = messages
      .filter((m) => m.role === 'user')
      .pop()?.content

    console.log('[voice/chat/completions] User message:', userMessage ? userMessage.substring(0, 50) + '...' : 'NONE')

    // For streaming responses, return immediately and process async
    // This prevents ElevenLabs timeout while Claude is processing
    if (stream) {
      // Create the content promise (don't await yet!)
      let contentPromise: Promise<string>

      // Handle initial greeting when no user message (first connection)
      if (!userMessage) {
        console.log('[voice/chat/completions] No user message - generating greeting')
        contentPromise = generateInitialGreeting(
          sessionContext.sessionToken,
          sessionContext.stakeholderName,
          sessionContext.moduleId,
          sessionContext.verticalKey
        )
      } else {
        switch (sessionContext.verticalKey) {
          case 'education':
            contentPromise = handleEducationMessage(
              sessionContext.sessionToken,
              userMessage,
              sessionContext.moduleId
            )
            break
          case 'assessment':
            contentPromise = handleAssessmentMessage(
              sessionContext.sessionToken,
              userMessage
            )
            break
          case 'coaching':
            contentPromise = handleCoachingMessage(
              sessionContext.sessionToken,
              userMessage
            )
            break
          default:
            contentPromise = Promise.resolve(
              "I'm sorry, this interview type isn't configured. Please contact support."
            )
        }
      }

      // Return streaming response IMMEDIATELY - content will be streamed when ready
      // This keeps the connection alive while Claude processes
      return streamResponseAsync(contentPromise)
    }

    // Non-streaming: wait for full response
    let response: string

    if (!userMessage) {
      response = await generateInitialGreeting(
        sessionContext.sessionToken,
        sessionContext.stakeholderName,
        sessionContext.moduleId,
        sessionContext.verticalKey
      )
    } else {
      switch (sessionContext.verticalKey) {
        case 'education':
          response = await handleEducationMessage(
            sessionContext.sessionToken,
            userMessage,
            sessionContext.moduleId
          )
          break
        case 'assessment':
          response = await handleAssessmentMessage(
            sessionContext.sessionToken,
            userMessage
          )
          break
        case 'coaching':
          response = await handleCoachingMessage(
            sessionContext.sessionToken,
            userMessage
          )
          break
        default:
          response = "I'm sorry, this interview type isn't configured. Please contact support."
      }
    }

    console.log('[voice/chat/completions] Response length:', response.length)
    return jsonResponse(response)
  } catch (error) {
    console.error('[voice/chat/completions] Error:', error)
    return streamError('An error occurred processing your request')
  }
}

/**
 * Parse session context from the messages array.
 * ElevenLabs passes dynamic variables in the system prompt.
 */
function parseSessionContext(messages: OpenAIChatMessage[]): {
  sessionToken: string | null
  moduleId: string | null
  verticalKey: string
  stakeholderName: string | null
  isTestMode: boolean
} {
  const systemPrompt = messages.find((m) => m.role === 'system')?.content || ''

  // Extract session_token from system prompt
  // Supports ff_edu_xxx (education), base64url tokens (coaching/consulting), and test tokens
  const testTokenMatch = systemPrompt.match(/session_token:\s*(test[-_][\w-]+)/)
  const isTestMode = !!testTokenMatch
  const tokenMatch = isTestMode ? null : systemPrompt.match(/session_token:\s*(\S+)/)
  const sessionToken = testTokenMatch ? testTokenMatch[1] : (tokenMatch ? tokenMatch[1] : null)

  // Extract module_id
  const moduleMatch = systemPrompt.match(/module_id:\s*(\w+[-]?\w*)/)
  const moduleId = moduleMatch ? moduleMatch[1] : null

  // Extract vertical_key
  const verticalMatch = systemPrompt.match(/vertical_key:\s*(\w+)/)
  const verticalKey = verticalMatch ? verticalMatch[1] : 'education'

  // Extract stakeholder_name (note: may be "participant" or placeholder for token-based access)
  const nameMatch = systemPrompt.match(/stakeholder_name:\s*([\w-]+)/)
  const stakeholderName = nameMatch ? nameMatch[1] : null

  return {
    sessionToken,
    moduleId,
    verticalKey,
    stakeholderName,
    isTestMode,
  }
}

/**
 * Handle education interview messages
 */
async function handleEducationMessage(
  sessionToken: string,
  userMessage: string,
  moduleId: string | null
): Promise<string> {
  // Validate education token format
  if (!sessionToken.startsWith('ff_edu_')) {
    console.error('[voice/education] Invalid token format — expected ff_edu_ prefix, got:', sessionToken.substring(0, 10))
    throw new Error('Invalid education session token format')
  }

  // Find participant token
  const { data: participantTokenData, error: tokenError } = await supabaseAdmin
    .from('education_participant_tokens')
    .select(
      `
      id,
      token,
      participant_type,
      cohort_metadata,
      school_id,
      campaign_id,
      is_active,
      schools:school_id(id, name),
      campaigns:campaign_id(
        id,
        name,
        education_config
      )
    `
    )
    .eq('token', sessionToken)
    .single()

  const participantToken = participantTokenData as {
    id: string
    token: string
    participant_type: string
    cohort_metadata: Record<string, string>
    school_id: string
    campaign_id: string
    is_active: boolean
    schools: { id: string; name: string }
    campaigns: {
      id: string
      name: string
      education_config: Record<string, unknown>
    }
  } | null

  if (tokenError || !participantToken) {
    throw new Error('Invalid session token')
  }

  if (!participantToken.is_active) {
    throw new Error('Session has been deactivated')
  }

  // Determine target module
  const validModules: EducationModule[] = [
    'student_wellbeing',
    'teaching_learning',
    'parent_confidence',
  ]
  const rawModule = moduleId?.toLowerCase() || 'student_wellbeing'
  const targetModule: EducationModule = validModules.includes(rawModule as EducationModule)
    ? (rawModule as EducationModule)
    : 'student_wellbeing'

  // Find active agent session
  const { data: agentSessionData, error: sessionError } = await supabaseAdmin
    .from('agent_sessions')
    .select(
      `
      id,
      education_session_context,
      session_context
    `
    )
    .eq('participant_token_id', participantToken.id)
    .contains('education_session_context', { module: targetModule })
    .single()

  const agentSession = agentSessionData as {
    id: string
    education_session_context: Record<string, unknown>
    session_context: Record<string, unknown>
  } | null

  if (sessionError || !agentSession) {
    throw new Error('No active session found')
  }

  // Get conversation history
  const { data: messageHistoryData } = await supabaseAdmin
    .from('agent_messages')
    .select('role, content, created_at')
    .eq('agent_session_id', agentSession.id)
    .order('created_at', { ascending: true })

  const messageHistory = messageHistoryData as Array<{
    role: string
    content: string
    created_at: string
  }> | null

  // Check for safeguarding concerns
  const safeguardingFlags = detectSafeguardingConcerns(userMessage)

  // Build participant and campaign data
  const school = participantToken.schools
  const campaign = participantToken.campaigns

  if (!school || !campaign) {
    throw new Error('Session data incomplete')
  }

  const rawParticipantType =
    participantToken.participant_type?.toLowerCase() || 'student'
  const validParticipantTypes = [
    'student',
    'teacher',
    'parent',
    'leadership',
  ] as const
  const participantType = validParticipantTypes.includes(
    rawParticipantType as (typeof validParticipantTypes)[number]
  )
    ? (rawParticipantType as 'student' | 'teacher' | 'parent' | 'leadership')
    : 'student'

  const safeCohotMetadata = participantToken.cohort_metadata || {}

  const participant = {
    token: participantToken.token,
    participant_type: participantType,
    cohort_metadata: safeCohotMetadata as Record<string, string>,
    campaign_id: participantToken.campaign_id,
    school_id: participantToken.school_id,
  }

  const safeEducationConfig = campaign.education_config || {
    modules: ['student_wellbeing'],
    pilot_type: 'standard',
  }

  const campaignData = {
    id: campaign.id,
    name: campaign.name,
    school: {
      id: school.id,
      name: school.name,
      country: 'Unknown',
    },
    education_config: safeEducationConfig as EducationCampaign['education_config'],
  }

  // Process message through education agent
  const result = await processEducationMessage(
    userMessage,
    participant,
    campaignData,
    targetModule,
    (messageHistory || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: m.created_at,
    })),
    ((agentSession.education_session_context as Record<string, unknown>)
      ?.progress as ConversationState) || {
      phase: 'opening',
      sections_completed: [],
      questions_asked: 0,
      rapport_established: false,
      anonymity_confirmed: false,
      safeguarding_flags: [],
      domains_explored: [],
      current_domain_id: undefined,
      domain_coverage_percent: 0,
    }
  )

  let response = result.response
  const updatedState = result.updatedState
  const safeguardingAlert = result.safeguardingAlert

  // If interview is complete, generate proper closing
  if (updatedState.is_complete) {
    try {
      response = await generateClosingMessage(
        participant,
        campaignData,
        targetModule,
        updatedState
      )
    } catch (closingError) {
      console.error('Error generating closing message:', closingError)
      response =
        "Thank you so much for sharing your thoughts and experiences with me today. Your insights are genuinely valuable and will help identify patterns that can improve outcomes. I really appreciate your openness throughout our conversation."
    }
  }

  // Save messages to database
  // Note: Using type assertion as agent_messages may not be in generated types
  await (supabaseAdmin.from('agent_messages') as ReturnType<typeof supabaseAdmin.from>).insert({
    agent_session_id: agentSession.id,
    role: 'user',
    content: userMessage,
  })

  await (supabaseAdmin.from('agent_messages') as ReturnType<typeof supabaseAdmin.from>).insert({
    agent_session_id: agentSession.id,
    role: 'assistant',
    content: response,
  })

  // Update session progress
  // Note: Using type assertion as RPC functions may not be in generated types
  try {
    await (supabaseAdmin.rpc as Function)('update_education_session_progress', {
      input_session_id: agentSession.id,
      input_questions_asked: updatedState.questions_asked || 0,
      input_sections_completed: updatedState.sections_completed || [],
      input_estimated_completion: Math.min(
        (updatedState.questions_asked || 0) / 15,
        1
      ),
    })
  } catch (rpcErr) {
    console.error('[voice/education] update_education_session_progress RPC failed:', rpcErr)
  }

  // Handle safeguarding alerts
  if (safeguardingFlags.length > 0 || safeguardingAlert) {
    for (const flag of safeguardingFlags) {
      await (supabaseAdmin.rpc as Function)('record_safeguarding_flag', {
        input_session_id: agentSession.id,
        input_flag: flag,
      })

      if (flag.confidence >= 0.7) {
        await (supabaseAdmin.rpc as Function)('create_safeguarding_alert', {
          input_campaign_id: participantToken.campaign_id,
          input_school_id: participantToken.school_id,
          input_participant_token: participantToken.token,
          input_participant_type: participantToken.participant_type,
          input_cohort_metadata: participantToken.cohort_metadata,
          input_trigger_type: flag.type,
          input_trigger_content: userMessage,
          input_trigger_context: response,
          input_confidence: flag.confidence,
          input_ai_analysis: {
            trigger_type: flag.type,
            trigger_content: flag.content,
            agent_assessment: safeguardingAlert,
          },
        })
      }
    }
  }

  // Mark module complete if interview is done
  if (updatedState.is_complete) {
    await (supabaseAdmin.rpc as Function)('mark_module_completed', {
      input_token_id: participantToken.id,
      input_module: targetModule,
    })

    // Notify school admin/facilitator
    const participantLabel = participantToken.participant_type
      ? `${participantToken.participant_type} participant`
      : 'Participant'
    try {
      await notifyEducationAdmin({
        campaignId: participantToken.campaign_id,
        participantName: participantLabel,
        assessmentType: `Education Assessment (${targetModule.replace(/_/g, ' ')})`,
        dashboardPath: `/dashboard/education`,
      })
    } catch (notifyErr) {
      console.error('Failed to send completion notification:', notifyErr)
    }
  }

  // Update participant activity
  await (supabaseAdmin.rpc as Function)('update_participant_activity', {
    input_token_id: participantToken.id,
  })

  return response
}

/**
 * Handle assessment/consulting interview messages via voice
 * Mirrors logic from app/api/sessions/[token]/messages/route.ts
 */
async function handleAssessmentMessage(
  sessionToken: string,
  userMessage: string
): Promise<string> {
  console.log('[voice/assessment] Processing message for token:', sessionToken.substring(0, 10) + '...')

  // Look up campaign assignment by access_token
  const { data: stakeholderSession, error: sessionError } = await (supabaseAdmin
    .from('campaign_assignments') as any)
    .select(`
      *,
      campaigns (
        id,
        name,
        company_name,
        facilitator_name,
        description,
        company_profiles (
          id,
          company_name,
          industry,
          description,
          market_scope,
          employee_count_range,
          annual_revenue_range,
          headquarters_location
        )
      ),
      stakeholder_profiles (
        id,
        full_name,
        email,
        role_type,
        title,
        department
      )
    `)
    .eq('access_token', sessionToken)
    .single()

  if (sessionError || !stakeholderSession) {
    console.error('[voice/assessment] Session lookup failed:', sessionError)
    throw new Error('Invalid session token')
  }

  // Get or create agent session for this stakeholder
  let agentSession: any

  const { data: existingSession } = await (supabaseAdmin
    .from('agent_sessions') as any)
    .select('*')
    .eq('stakeholder_session_id', stakeholderSession.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingSession) {
    agentSession = existingSession
  } else {
    const { data: newSession, error: createError } = await (supabaseAdmin
      .from('agent_sessions') as any)
      .insert({
        stakeholder_session_id: stakeholderSession.id,
        agent_type: 'assessment_interview',
        agent_model: 'claude-sonnet-4-5-20250929',
        conversation_history: [],
        session_context: { phase: 'introduction', topics_covered: [], questions_asked: 0 },
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create agent session: ${createError.message}`)
    }
    agentSession = newSession
  }

  // Get conversation history and state
  const rawHistory = (agentSession.conversation_history || []) as Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }>
  // Ensure all history entries have a timestamp (required by MessageHistory)
  const conversationHistory = rawHistory.map((m) => ({
    role: m.role,
    content: m.content,
    timestamp: m.timestamp || new Date().toISOString(),
  }))
  const currentState = agentSession.session_context || {
    phase: 'introduction',
    topics_covered: [],
    questions_asked: 0,
  }

  // Process through assessment agent
  const { response: assistantResponse, updatedState } = await processAssessmentMessage(
    userMessage,
    stakeholderSession,
    conversationHistory,
    currentState
  )

  // Update conversation history
  const updatedHistory = [
    ...conversationHistory,
    { role: 'user' as const, content: userMessage, timestamp: new Date().toISOString() },
    { role: 'assistant' as const, content: assistantResponse, timestamp: new Date().toISOString() },
  ]

  // Save to agent session
  await (supabaseAdmin.from('agent_sessions') as any)
    .update({
      conversation_history: updatedHistory,
      session_context: updatedState,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', agentSession.id)

  // Handle completion
  if (updatedState.is_complete && stakeholderSession.status !== 'completed') {
    await (supabaseAdmin.from('campaign_assignments') as any)
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', stakeholderSession.id)

    try {
      await notifyCampaignOwner({
        campaignId: stakeholderSession.campaign_id,
        participantName: stakeholderSession.stakeholder_name,
        assessmentType: 'Industry Assessment',
        dashboardPath: `/dashboard/campaigns/${stakeholderSession.campaign_id}`,
      })
    } catch (notifyErr) {
      console.error('[voice/assessment] Failed to send completion notification:', notifyErr)
    }
  }

  return assistantResponse
}

/**
 * Handle coaching interview messages via voice
 * Mirrors logic from app/api/coach/[slug]/session/[token]/message/route.ts
 */
async function handleCoachingMessage(
  sessionToken: string,
  userMessage: string
): Promise<string> {
  console.log('[voice/coaching] Processing message for token:', sessionToken.substring(0, 10) + '...')

  // Look up coaching session by access_token (token is unique, no slug needed)
  const { data: session, error: sessionError } = await (supabaseAdmin
    .from('coaching_sessions') as any)
    .select('id, client_name, client_email, client_status, started_at, tenant_id')
    .eq('access_token', sessionToken)
    .single()

  if (sessionError || !session) {
    console.error('[voice/coaching] Session lookup failed:', sessionError)
    throw new Error('Invalid session token')
  }

  if (session.client_status === 'completed') {
    return 'This session has already been completed. Thank you for your time!'
  }

  // Get tenant profile for branding context
  const { data: tenant, error: tenantError } = await (supabaseAdmin
    .from('tenant_profiles') as any)
    .select('id, display_name, is_active, brand_config')
    .eq('id', session.tenant_id)
    .single()

  if (tenantError || !tenant) {
    throw new Error('Coach profile not found')
  }

  if (!tenant.is_active) {
    throw new Error('This coach is not currently active')
  }

  // Check usage limit
  const usageCheck = await checkUsageLimit(tenant.id)
  if (!usageCheck.allowed) {
    return 'I apologize, but this coaching session has reached its usage limit. Please contact your coach for assistance.'
  }

  // Get or create agent session
  let agentSession: any

  const { data: existingSession } = await (supabaseAdmin
    .from('agent_sessions') as any)
    .select('*')
    .eq('coaching_session_id', session.id)
    .eq('agent_type', 'archetype_interview')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingSession) {
    agentSession = existingSession
  } else {
    const { data: newSession, error: createError } = await (supabaseAdmin
      .from('agent_sessions') as any)
      .insert({
        coaching_session_id: session.id,
        agent_type: 'archetype_interview',
        agent_model: 'claude-sonnet-4-20250514',
        conversation_history: [],
        session_context: null,
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create agent session: ${createError.message}`)
    }
    agentSession = newSession
  }

  // Parse conversation history and session state
  const conversationHistory = (agentSession.conversation_history || []) as Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  const currentState = agentSession.session_context as ArchetypeSessionState | null

  // Build tenant context
  const tenantContext: TenantContext = {
    display_name: tenant.display_name,
    brand_config: tenant.brand_config as TenantContext['brand_config'],
  }

  // Process through archetype agent
  const agentResponse = await processArchetypeMessage(
    userMessage,
    currentState,
    conversationHistory,
    tenantContext,
    session.client_name
  )

  // Build updated history
  const updatedHistory = [...conversationHistory]
  updatedHistory.push({ role: 'user', content: userMessage })
  updatedHistory.push({ role: 'assistant', content: agentResponse.message })

  // Save to agent session
  await (supabaseAdmin.from('agent_sessions') as any)
    .update({
      conversation_history: updatedHistory,
      session_context: agentResponse.sessionState,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', agentSession.id)

  // Update coaching session status
  const updates: Record<string, unknown> = {
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Mark as started if first message
  const isFirstMessage = !session.started_at
  if (isFirstMessage) {
    updates.started_at = new Date().toISOString()
    updates.client_status = 'in_progress'

    await logUsageEvent({
      tenantId: tenant.id,
      eventType: 'session_started',
      eventData: {
        session_id: session.id,
        assessment_type: 'archetype',
        client_name: session.client_name,
        channel: 'voice',
      },
    })
  }

  // Log LLM usage
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
        channel: 'voice',
      }
    )
  }

  // Handle completion
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

    await logUsageEvent({
      tenantId: tenant.id,
      eventType: 'session_completed',
      eventData: {
        session_id: session.id,
        assessment_type: 'archetype',
        default_archetype: agentResponse.sessionState.default_archetype,
        authentic_archetype: agentResponse.sessionState.authentic_archetype,
        is_aligned: agentResponse.sessionState.is_aligned,
        channel: 'voice',
      },
    })
  }

  // Apply session updates
  const { error: updateError } = await (supabaseAdmin
    .from('coaching_sessions') as any)
    .update(updates)
    .eq('id', session.id)

  if (updateError) {
    console.error('[voice/coaching] Failed to update coaching session:', updateError)
  }

  // Notify coach on completion
  if (agentResponse.isComplete) {
    try {
      await notifyTenantOwner({
        tenantId: tenant.id,
        participantName: session.client_name,
        assessmentType: 'Leadership Archetype',
        dashboardPath: '/dashboard/clients',
      })
    } catch (notifyErr) {
      console.error('[voice/coaching] Failed to send completion notification:', notifyErr)
    }
  }

  return agentResponse.message
}

/**
 * Generate an initial greeting for the voice session.
 * This is called when ElevenLabs first connects (no user message yet).
 * Routes to the appropriate greeting generator based on vertical.
 */
async function generateInitialGreeting(
  sessionToken: string,
  stakeholderName: string | null,
  moduleId: string | null,
  verticalKey: string
): Promise<string> {
  console.log('[voice/chat/completions] Generating initial greeting for:', {
    sessionToken: sessionToken.substring(0, 15) + '...',
    stakeholderName,
    moduleId,
    verticalKey,
  })

  switch (verticalKey) {
    case 'education':
      return generateEducationGreeting(sessionToken, stakeholderName)
    case 'assessment':
      return generateConsultingGreeting(sessionToken)
    case 'coaching':
      return generateCoachingGreeting(sessionToken)
    default:
      return `Hi there! Thanks for joining me today. I'm here to have a conversation and learn about your experience. Everything you share is completely confidential, and there are no right or wrong answers. How are you doing today?`
  }
}

/**
 * Generate greeting for education vertical
 */
async function generateEducationGreeting(
  sessionToken: string,
  stakeholderName: string | null
): Promise<string> {
  const { data: participantTokenData } = await supabaseAdmin
    .from('education_participant_tokens')
    .select(`
      participant_type,
      cohort_metadata,
      schools:school_id(name)
    `)
    .eq('token', sessionToken)
    .single()

  const participantToken = participantTokenData as {
    participant_type: string
    cohort_metadata: Record<string, string> | null
    schools: { name: string } | null
  } | null

  const participantType = participantToken?.participant_type?.toLowerCase() || stakeholderName?.toLowerCase() || 'student'
  const schoolName = participantToken?.schools?.name || 'your school'

  let greeting: string

  switch (participantType) {
    case 'student':
      greeting = `Hi, I'm Jippity! Thanks for taking the time to chat with me today. I'm here to learn a bit about your experience at ${schoolName}. This is a relaxed conversation, and there are no right or wrong answers. I'm just interested in hearing your thoughts. Before we start, I want you to know that everything you share is completely confidential. So, how are you doing today?`
      break
    case 'teacher':
      greeting = `Hi, I'm Jippity! Thank you for joining me today. I'm here to gather some insights about your professional experience at ${schoolName}. This is an informal conversation, and I'm genuinely interested in your perspective on teaching and working here. Everything we discuss is confidential and will be used to help improve the school environment. How has your day been so far?`
      break
    case 'parent':
      greeting = `Hi, I'm Jippity! Thank you so much for taking the time to speak with me. I'm here to learn about your experience as a parent with a child at ${schoolName}. This is a relaxed conversation, and your honest feedback is really valuable. Everything you share is confidential. How are you doing today?`
      break
    case 'leadership':
      greeting = `Hi, I'm Jippity! Thank you for making time in your schedule to speak with me. I'm here to discuss your perspective on ${schoolName} and gather your insights as a school leader. Your feedback is valuable for understanding the broader picture. Everything discussed is confidential. How has your week been going?`
      break
    default:
      greeting = `Hi, I'm Jippity! Thanks for joining me today. I'm here to have a friendly conversation and learn about your experience. Everything you share is completely confidential, and there are no right or wrong answers. How are you doing today?`
  }

  console.log('[voice/chat/completions] Generated education greeting for', participantType, '- length:', greeting.length)
  return greeting
}

/**
 * Generate greeting for consulting/assessment vertical
 */
async function generateConsultingGreeting(sessionToken: string): Promise<string> {
  const { data: assignment } = await (supabaseAdmin
    .from('campaign_assignments') as any)
    .select(`
      stakeholder_name,
      campaigns (
        company_name,
        facilitator_name
      )
    `)
    .eq('access_token', sessionToken)
    .single()

  const name = assignment?.stakeholder_name || 'there'
  const companyName = assignment?.campaigns?.company_name || 'your organization'

  const greeting = `Hello ${name}! Thank you for taking the time to speak with me today. I'm here to learn about your experience and perspective at ${companyName} as part of a digital transformation readiness assessment. This conversation is confidential and should take about 20 to 30 minutes. There are no right or wrong answers; I'm genuinely interested in your honest perspective. How are you doing today?`

  console.log('[voice/chat/completions] Generated consulting greeting - length:', greeting.length)
  return greeting
}

/**
 * Generate greeting for coaching vertical
 */
async function generateCoachingGreeting(sessionToken: string): Promise<string> {
  const { data: session } = await (supabaseAdmin
    .from('coaching_sessions') as any)
    .select(`
      client_name,
      tenant_profiles:tenant_id (
        display_name,
        brand_config
      )
    `)
    .eq('access_token', sessionToken)
    .single()

  const clientName = session?.client_name || 'there'
  const coachName = session?.tenant_profiles?.display_name || 'your coach'
  const welcomeMsg = session?.tenant_profiles?.brand_config?.welcomeMessage

  const greeting = welcomeMsg
    ? welcomeMsg.replace(/\{name\}/g, clientName)
    : `Hi ${clientName}! Welcome, and thank you for being here. I'm an AI guide working alongside ${coachName} to help you explore your leadership style. This conversation is a chance for self-discovery, and there are no right or wrong answers. Everything you share is completely confidential. Before we dive in, how are you feeling today?`

  console.log('[voice/chat/completions] Generated coaching greeting - length:', greeting.length)
  return greeting
}

/**
 * Stream a response in SSE format for ElevenLabs
 * Now accepts a Promise to allow immediate streaming while content is being generated
 */
function streamResponse(content: string): Response {
  return streamResponseAsync(Promise.resolve(content))
}

/**
 * Stream a response with immediate connection, allowing content to be generated async
 * This prevents ElevenLabs timeout by sending initial chunk immediately
 */
function streamResponseAsync(contentPromise: Promise<string>): Response {
  const encoder = new TextEncoder()
  const id = `chatcmpl-${Date.now()}`
  const created = Math.floor(Date.now() / 1000)

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial role chunk immediately (standard OpenAI format)
        // This keeps the connection alive while Claude processes
        const roleChunk = JSON.stringify({
          id,
          object: 'chat.completion.chunk',
          created,
          model: 'flowforge-interview-agent',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        })
        controller.enqueue(encoder.encode(`data: ${roleChunk}\n\n`))
        console.log('[streamResponseAsync] Sent role chunk, waiting for content...')

        // Now wait for content (Claude API call)
        const content = await contentPromise
        console.log('[streamResponseAsync] Content received, length:', content.length)

        // Split content into chunks for streaming
        const words = content.split(' ')
        const chunks: string[] = []

        // Create chunks of ~3-5 words for natural speech rhythm
        for (let i = 0; i < words.length; i += 4) {
          chunks.push(words.slice(i, i + 4).join(' '))
        }

        // Send content chunks (without finish_reason)
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const isLast = i === chunks.length - 1
          const chunkContent = isLast ? chunk : chunk + ' '

          const data = JSON.stringify({
            id,
            object: 'chat.completion.chunk',
            created,
            model: 'flowforge-interview-agent',
            choices: [
              {
                index: 0,
                delta: { content: chunkContent },
                logprobs: null,
                finish_reason: null, // Don't send finish_reason with content
              },
            ],
          })

          controller.enqueue(encoder.encode(`data: ${data}\n\n`))

          // Small delay between chunks for natural pacing
          await new Promise((resolve) => setTimeout(resolve, 10))
        }

        // Send final chunk with finish_reason (no content, just finish signal)
        const finishChunk = JSON.stringify({
          id,
          object: 'chat.completion.chunk',
          created,
          model: 'flowforge-interview-agent',
          choices: [
            {
              index: 0,
              delta: {},
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
        })
        controller.enqueue(encoder.encode(`data: ${finishChunk}\n\n`))

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('[streamResponseAsync] Error:', error)
        // Send error as a chunk
        const errorData = JSON.stringify({
          id,
          object: 'chat.completion.chunk',
          created,
          model: 'flowforge-interview-agent',
          choices: [
            {
              index: 0,
              delta: { content: 'I apologize, but something went wrong. Could you please try again?' },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
        })
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...corsHeaders,
    },
  })
}

/**
 * Stream an error message in SSE format
 */
function streamError(errorMessage: string): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const id = `chatcmpl-${Date.now()}`
      const created = Math.floor(Date.now() / 1000)

      const data = JSON.stringify({
        id,
        object: 'chat.completion.chunk',
        created,
        model: 'flowforge-interview-agent',
        choices: [
          {
            index: 0,
            delta: {
              content: `I apologize, but ${errorMessage}. Could you please try again?`,
            },
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      })

      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...corsHeaders,
    },
  })
}

/**
 * Return a non-streaming JSON response
 */
function jsonResponse(content: string): Response {
  return new Response(
    JSON.stringify({
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'flowforge-interview-agent',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content },
          finish_reason: 'stop',
        },
      ],
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  )
}
