import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string | null
}

interface ConversationDetail {
  id: string
  sessionType: 'industry' | 'coaching' | 'education'
  participantName: string
  participantEmail: string | null
  participantType: string
  contextName: string
  status: string
  agentType: string
  createdAt: string
  lastActivity: string
  messages: ConversationMessage[]
}

/**
 * GET /api/admin/conversations/[id]
 * Get full conversation detail with transcript
 * Access is scoped by user type (same rules as list endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single() as { data: { user_type: string | null } | null, error: any }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const userType = profile.user_type

    // Get tenant for non-admin users
    let tenantId: string | null = null
    if (userType !== 'admin') {
      const { data: tenant } = await supabaseAdmin
        .from('tenant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single() as { data: { id: string } | null, error: any }
      tenantId = tenant?.id || null
    }

    // Fetch the agent session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('agent_sessions')
      .select('*')
      .eq('id', id)
      .single() as any

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Determine session type and verify access
    let detail: ConversationDetail | null = null

    if (session.stakeholder_session_id) {
      detail = await buildIndustryDetail(session, user.id, userType!, tenantId)
    } else if (session.coaching_session_id) {
      detail = await buildCoachingDetail(session, user.id, userType!, tenantId)
    } else if (session.participant_token_id) {
      detail = await buildEducationDetail(session, user.id, userType!, tenantId)
    }

    if (!detail) {
      return NextResponse.json(
        { error: 'You do not have access to this conversation' },
        { status: 403 }
      )
    }

    return NextResponse.json({ conversation: detail })
  } catch (error) {
    console.error('Conversation detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function buildIndustryDetail(
  session: any,
  userId: string,
  userType: string,
  tenantId: string | null
): Promise<ConversationDetail | null> {
  // Fetch the campaign assignment with campaign info
  const { data: assignment } = await supabaseAdmin
    .from('campaign_assignments')
    .select(`
      id,
      stakeholder_name,
      stakeholder_email,
      stakeholder_role,
      status,
      campaigns (
        id,
        name,
        created_by,
        tenant_id
      )
    `)
    .eq('id', session.stakeholder_session_id)
    .single() as any

  if (!assignment?.campaigns) return null

  const campaign = assignment.campaigns

  // Verify access
  if (userType !== 'admin') {
    if (userType === 'consultant') {
      if (campaign.created_by !== userId && !(tenantId && campaign.tenant_id === tenantId)) {
        return null
      }
    } else {
      return null
    }
  }

  const history = Array.isArray(session.conversation_history) ? session.conversation_history : []

  return {
    id: session.id,
    sessionType: 'industry',
    participantName: assignment.stakeholder_name || 'Unknown',
    participantEmail: assignment.stakeholder_email || null,
    participantType: assignment.stakeholder_role || 'stakeholder',
    contextName: campaign.name || 'Unknown Campaign',
    status: assignment.status || 'unknown',
    agentType: session.agent_type || 'interview_agent',
    createdAt: session.created_at,
    lastActivity: session.last_message_at || session.updated_at || session.created_at,
    messages: history.map((m: any) => ({
      role: m.role || 'assistant',
      content: m.content || '',
      timestamp: m.timestamp || null,
    })),
  }
}

async function buildCoachingDetail(
  session: any,
  userId: string,
  userType: string,
  tenantId: string | null
): Promise<ConversationDetail | null> {
  const { data: coachingSession } = await supabaseAdmin
    .from('coaching_sessions')
    .select(`
      id,
      client_name,
      client_email,
      client_status,
      tenant_id,
      tenant_profiles (
        id,
        user_id,
        display_name
      )
    `)
    .eq('id', session.coaching_session_id)
    .single() as any

  if (!coachingSession?.tenant_profiles) return null

  const tenant = coachingSession.tenant_profiles

  // Verify access
  if (userType !== 'admin') {
    if (userType === 'coach') {
      if (tenant.user_id !== userId && !(tenantId && coachingSession.tenant_id === tenantId)) {
        return null
      }
    } else {
      return null
    }
  }

  const history = Array.isArray(session.conversation_history) ? session.conversation_history : []

  return {
    id: session.id,
    sessionType: 'coaching',
    participantName: coachingSession.client_name || 'Unknown',
    participantEmail: coachingSession.client_email || null,
    participantType: 'client',
    contextName: tenant.display_name || 'Unknown Coach',
    status: coachingSession.client_status || 'unknown',
    agentType: session.agent_type || 'archetype_interview',
    createdAt: session.created_at,
    lastActivity: session.last_message_at || session.updated_at || session.created_at,
    messages: history.map((m: any) => ({
      role: m.role || 'assistant',
      content: m.content || '',
      timestamp: m.timestamp || null,
    })),
  }
}

async function buildEducationDetail(
  session: any,
  userId: string,
  userType: string,
  tenantId: string | null
): Promise<ConversationDetail | null> {
  // @ts-ignore - education_participant_tokens not in generated types
  const { data: token } = await supabaseAdmin
    .from('education_participant_tokens')
    .select(`
      id,
      participant_type,
      cohort_metadata,
      campaigns (
        id,
        name,
        tenant_id,
        created_by
      ),
      schools (
        id,
        name
      )
    `)
    .eq('id', session.participant_token_id)
    .single() as any

  if (!token?.campaigns) return null

  const campaign = token.campaigns

  // Verify access
  if (userType !== 'admin') {
    if (userType === 'company') {
      if (!(tenantId && campaign.tenant_id === tenantId) && campaign.created_by !== userId) {
        return null
      }
    } else {
      return null
    }
  }

  // Education uses agent_messages table instead of conversation_history
  // @ts-ignore - agent_messages not in generated types
  const { data: messages } = await supabaseAdmin
    .from('agent_messages')
    .select('role, content, created_at')
    .eq('agent_session_id', session.id)
    .order('created_at', { ascending: true }) as any

  const eduContext = session.education_session_context as Record<string, any> | null
  const participantName = eduContext?.participant_name ||
    token.cohort_metadata?.name ||
    token.participant_type || 'Participant'

  return {
    id: session.id,
    sessionType: 'education',
    participantName,
    participantEmail: null,
    participantType: token.participant_type || 'student',
    contextName: token.schools?.name || campaign.name || 'Unknown',
    status: eduContext?.status || 'unknown',
    agentType: session.agent_type || 'education_interview',
    createdAt: session.created_at,
    lastActivity: session.last_message_at || session.updated_at || session.created_at,
    messages: (messages || []).map((m: any) => ({
      role: m.role || 'assistant',
      content: m.content || '',
      timestamp: m.created_at || null,
    })),
  }
}
