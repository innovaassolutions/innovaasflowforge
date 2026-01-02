import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  processEducationMessage,
  detectSafeguardingConcerns,
  generateClosingMessage,
  EducationCampaign,
  ConversationState,
  EducationModule,
} from '@/lib/agents/education-interview-agent'
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
  console.log('[voice/chat/completions] POST request received')

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
    const sessionContext = parseSessionContext(messages)
    console.log('[voice/chat/completions] Session context:', {
      hasToken: !!sessionContext.sessionToken,
      tokenPrefix: sessionContext.sessionToken?.substring(0, 10),
      moduleId: sessionContext.moduleId,
      verticalKey: sessionContext.verticalKey,
      stakeholderName: sessionContext.stakeholderName,
    })

    if (!sessionContext.sessionToken) {
      console.error('[voice/chat/completions] No session token found in messages')
      return streamError('Session context not found')
    }

    // Get the latest user message
    const userMessage = messages
      .filter((m) => m.role === 'user')
      .pop()?.content

    console.log('[voice/chat/completions] User message:', userMessage ? userMessage.substring(0, 50) + '...' : 'NONE')

    // Route to appropriate handler based on vertical
    let response: string

    // Handle initial greeting when no user message (first connection)
    if (!userMessage) {
      console.log('[voice/chat/completions] No user message - generating greeting')
      response = await generateInitialGreeting(
        sessionContext.sessionToken,
        sessionContext.stakeholderName,
        sessionContext.moduleId
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
          // TODO: Implement assessment handler
          response = await handleAssessmentMessage(
            sessionContext.sessionToken,
            userMessage
          )
          break
        default:
          response = await handleEducationMessage(
            sessionContext.sessionToken,
            userMessage,
            sessionContext.moduleId
          )
      }
    }

    console.log('[voice/chat/completions] Response length:', response.length)

    // Return response in appropriate format
    if (stream) {
      return streamResponse(response)
    } else {
      return jsonResponse(response)
    }
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
} {
  const systemPrompt = messages.find((m) => m.role === 'system')?.content || ''

  // Extract session_token from system prompt
  // Format: session_token: ff_edu_xxxxx
  const tokenMatch = systemPrompt.match(/session_token:\s*(ff_[a-z]+_[a-zA-Z0-9]+)/)
  const sessionToken = tokenMatch ? tokenMatch[1] : null

  // Extract module_id
  const moduleMatch = systemPrompt.match(/module_id:\s*(\w+)/)
  const moduleId = moduleMatch ? moduleMatch[1] : null

  // Extract vertical_key
  const verticalMatch = systemPrompt.match(/vertical_key:\s*(\w+)/)
  const verticalKey = verticalMatch ? verticalMatch[1] : 'education'

  // Extract stakeholder_name
  const nameMatch = systemPrompt.match(/stakeholder_name:\s*(\w+)/)
  const stakeholderName = nameMatch ? nameMatch[1] : null

  // Also check 'user' field in request for context
  return {
    sessionToken,
    moduleId,
    verticalKey,
    stakeholderName,
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
  await (supabaseAdmin.rpc as Function)('update_education_session_progress', {
    input_session_id: agentSession.id,
    input_questions_asked: updatedState.questions_asked || 0,
    input_sections_completed: updatedState.sections_completed || [],
    input_estimated_completion: Math.min(
      (updatedState.questions_asked || 0) / 15,
      1
    ),
  })

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
  }

  // Update participant activity
  await (supabaseAdmin.rpc as Function)('update_participant_activity', {
    input_token_id: participantToken.id,
  })

  return response
}

/**
 * Handle assessment interview messages (placeholder)
 */
async function handleAssessmentMessage(
  sessionToken: string,
  userMessage: string
): Promise<string> {
  // TODO: Implement assessment interview handler
  // For now, return a placeholder response
  console.log('Assessment handler called with:', { sessionToken, userMessage })
  return "I understand you'd like to discuss your digital transformation journey. However, the assessment interview module is still being configured. Please try again later."
}

/**
 * Generate an initial greeting for the voice session.
 * This is called when ElevenLabs first connects (no user message yet).
 */
async function generateInitialGreeting(
  sessionToken: string,
  stakeholderName: string | null,
  moduleId: string | null
): Promise<string> {
  console.log('[voice/chat/completions] Generating initial greeting for:', {
    sessionToken: sessionToken.substring(0, 15) + '...',
    stakeholderName,
    moduleId,
  })

  // Fetch participant info to personalize the greeting
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

  // Generate personalized greeting based on participant type
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

  console.log('[voice/chat/completions] Generated greeting for', participantType, '- length:', greeting.length)

  return greeting
}

/**
 * Stream a response in SSE format for ElevenLabs
 */
function streamResponse(content: string): Response {
  const encoder = new TextEncoder()

  // Split content into chunks for streaming
  const words = content.split(' ')
  const chunks: string[] = []

  // Create chunks of ~3-5 words for natural speech rhythm
  for (let i = 0; i < words.length; i += 4) {
    chunks.push(words.slice(i, i + 4).join(' '))
  }

  const stream = new ReadableStream({
    async start(controller) {
      const id = `chatcmpl-${Date.now()}`
      const created = Math.floor(Date.now() / 1000)

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
              finish_reason: isLast ? 'stop' : null,
            },
          ],
        })

        controller.enqueue(encoder.encode(`data: ${data}\n\n`))

        // Small delay between chunks for natural pacing
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

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
