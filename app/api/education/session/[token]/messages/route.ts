import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  processEducationMessage,
  detectSafeguardingConcerns
} from '@/lib/agents/education-interview-agent'

/**
 * POST /api/education/session/[token]/messages
 * Send a message in an education interview session
 * This is a PUBLIC endpoint - token is the authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { message, module } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Validate token format
    if (!token.startsWith('ff_edu_')) {
      return NextResponse.json(
        { error: 'Invalid session token format' },
        { status: 400 }
      )
    }

    // Find participant token
    // @ts-ignore - education_participant_tokens table not yet in generated types
    const { data: participantToken, error: tokenError } = await supabaseAdmin
      .from('education_participant_tokens')
      .select(`
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
      `)
      .eq('token', token)
      .single()

    if (tokenError || !participantToken) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 404 }
      )
    }

    if (!participantToken.is_active) {
      return NextResponse.json(
        { error: 'This session has been deactivated' },
        { status: 410 }
      )
    }

    // Find active agent session
    const targetModule = module || 'student_wellbeing'
    const { data: agentSession, error: sessionError } = await supabaseAdmin
      .from('agent_sessions')
      .select(`
        id,
        education_session_context,
        conversation_state
      `)
      .eq('participant_token_id', participantToken.id)
      .eq('education_session_context->>module', targetModule)
      .single()

    if (sessionError || !agentSession) {
      return NextResponse.json(
        { error: 'No active session found. Please start a new session.' },
        { status: 404 }
      )
    }

    // Get conversation history
    const { data: messageHistory } = await supabaseAdmin
      .from('agent_messages')
      .select('role, content, created_at')
      .eq('agent_session_id', agentSession.id)
      .order('created_at', { ascending: true })

    // Check for safeguarding concerns BEFORE processing
    const safeguardingFlags = detectSafeguardingConcerns(message)

    // Build participant and campaign data
    const school = participantToken.schools as unknown as { id: string; name: string }
    const campaign = participantToken.campaigns as unknown as {
      id: string
      name: string
      education_config: Record<string, unknown>
    }

    const participant = {
      token: participantToken.token,
      participant_type: participantToken.participant_type as 'student' | 'teacher' | 'parent' | 'leadership',
      cohort_metadata: participantToken.cohort_metadata as Record<string, string>
    }

    const campaignData = {
      id: campaign.id,
      name: campaign.name,
      school_name: school.name,
      education_config: campaign.education_config
    }

    // Process message through education agent
    const { response, updatedState, safeguardingAlert } = await processEducationMessage(
      message,
      participant,
      campaignData,
      targetModule,
      (messageHistory || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.created_at
      })),
      (agentSession.education_session_context as Record<string, unknown>)?.progress as Record<string, unknown> || {
        phase: 'introduction',
        topics_covered: [],
        questions_asked: 0
      }
    )

    // Save user message
    await supabaseAdmin
      .from('agent_messages')
      .insert({
        agent_session_id: agentSession.id,
        role: 'user',
        content: message
      })

    // Save assistant response
    await supabaseAdmin
      .from('agent_messages')
      .insert({
        agent_session_id: agentSession.id,
        role: 'assistant',
        content: response
      })

    // Update session progress
    // @ts-ignore - update_education_session_progress function not yet in generated types
    await supabaseAdmin.rpc('update_education_session_progress', {
      input_session_id: agentSession.id,
      input_questions_asked: updatedState.questions_asked || 0,
      input_sections_completed: JSON.stringify(updatedState.topics_covered || []),
      input_estimated_completion: Math.min((updatedState.questions_asked || 0) / 15, 1)
    })

    // Handle safeguarding alerts
    if (safeguardingFlags.length > 0 || safeguardingAlert) {
      // Record flags in session
      for (const flag of safeguardingFlags) {
        // @ts-ignore - record_safeguarding_flag function not yet in generated types
        await supabaseAdmin.rpc('record_safeguarding_flag', {
          input_session_id: agentSession.id,
          input_flag: JSON.stringify(flag)
        })

        // Create safeguarding alert if confidence is high enough
        if (flag.confidence >= 0.7) {
          // @ts-ignore - create_safeguarding_alert function not yet in generated types
          await supabaseAdmin.rpc('create_safeguarding_alert', {
            input_campaign_id: participantToken.campaign_id,
            input_school_id: participantToken.school_id,
            input_participant_token: participantToken.token,
            input_participant_type: participantToken.participant_type,
            input_cohort_metadata: participantToken.cohort_metadata,
            input_trigger_type: flag.type,
            input_trigger_content: message,
            input_trigger_context: response,
            input_confidence: flag.confidence,
            input_ai_analysis: JSON.stringify({
              patterns_matched: flag.patterns,
              agent_assessment: safeguardingAlert
            })
          })
        }
      }
    }

    // Check if interview is complete
    const isComplete = updatedState.is_complete || false
    if (isComplete) {
      // Mark module as completed
      // @ts-ignore - mark_module_completed function not yet in generated types
      await supabaseAdmin.rpc('mark_module_completed', {
        input_token_id: participantToken.id,
        input_module: targetModule
      })
    }

    // Update participant activity
    // @ts-ignore - update_participant_activity function not yet in generated types
    await supabaseAdmin.rpc('update_participant_activity', {
      input_token_id: participantToken.id
    })

    return NextResponse.json({
      success: true,
      response,
      conversationState: updatedState,
      isComplete,
      safeguardingDetected: safeguardingFlags.length > 0
    })

  } catch (error) {
    console.error('Message processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
