import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface ConversationListItem {
  id: string
  sessionType: 'industry' | 'coaching' | 'education'
  participantName: string
  participantEmail: string | null
  participantType: string
  contextName: string
  status: string
  messageCount: number
  lastActivity: string
  createdAt: string
}

/**
 * GET /api/admin/conversations
 * List conversations scoped by user type:
 * - Consultant: campaigns they created
 * - Coach: coaching sessions under their tenant
 * - Company/School: education campaigns under their tenant
 * - Admin: all conversations platform-wide
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and tenant
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single() as { data: { user_type: string | null } | null, error: any }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const userType = profile.user_type
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10), 100)
    const typeFilter = searchParams.get('type') || 'all'
    const search = searchParams.get('search') || ''

    // Get tenant profile for non-admin users
    let tenantId: string | null = null
    if (userType !== 'admin') {
      const { data: tenant } = await supabaseAdmin
        .from('tenant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single() as { data: { id: string } | null, error: any }
      tenantId = tenant?.id || null
    }

    // Fetch conversations based on user type and filters
    const conversations: ConversationListItem[] = []

    // Industry conversations (via campaign_assignments → campaigns)
    if (typeFilter === 'all' || typeFilter === 'industry') {
      const shouldFetch = userType === 'admin' ||
        userType === 'consultant' ||
        (userType === 'coach' && false) // coaches don't see industry
      if (shouldFetch) {
        const items = await fetchIndustryConversations(user.id, userType!, tenantId)
        conversations.push(...items)
      }
    }

    // Coaching conversations (via coaching_sessions)
    if (typeFilter === 'all' || typeFilter === 'coaching') {
      const shouldFetch = userType === 'admin' || userType === 'coach'
      if (shouldFetch) {
        const items = await fetchCoachingConversations(user.id, userType!, tenantId)
        conversations.push(...items)
      }
    }

    // Education conversations (via education_participant_tokens)
    if (typeFilter === 'all' || typeFilter === 'education') {
      const shouldFetch = userType === 'admin' || userType === 'company'
      if (shouldFetch) {
        const items = await fetchEducationConversations(user.id, userType!, tenantId)
        conversations.push(...items)
      }
    }

    // Apply search filter
    let filtered = conversations
    if (search) {
      const lowerSearch = search.toLowerCase()
      filtered = conversations.filter(c =>
        c.participantName.toLowerCase().includes(lowerSearch) ||
        (c.participantEmail && c.participantEmail.toLowerCase().includes(lowerSearch)) ||
        c.contextName.toLowerCase().includes(lowerSearch)
      )
    }

    // Sort by last activity descending
    filtered.sort((a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )

    // Build summary
    const summary = {
      total: filtered.length,
      industry: filtered.filter(c => c.sessionType === 'industry').length,
      coaching: filtered.filter(c => c.sessionType === 'coaching').length,
      education: filtered.filter(c => c.sessionType === 'education').length,
    }

    // Paginate
    const offset = (page - 1) * limit
    const paginated = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      conversations: paginated,
      pagination: {
        page,
        pageSize: limit,
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
      summary,
    })
  } catch (error) {
    console.error('Conversations list error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Fetch industry (campaign-based) conversations from agent_sessions
 * joined through campaign_assignments → campaigns
 */
async function fetchIndustryConversations(
  userId: string,
  userType: string,
  tenantId: string | null
): Promise<ConversationListItem[]> {
  try {
    // Build query: agent_sessions with stakeholder_session_id (industry)
    let query = supabaseAdmin
      .from('agent_sessions')
      .select(`
        id,
        conversation_history,
        created_at,
        last_message_at,
        updated_at,
        agent_type,
        campaign_assignments!agent_sessions_stakeholder_session_id_fkey (
          id,
          stakeholder_name,
          stakeholder_email,
          stakeholder_role,
          status,
          campaign_id,
          campaigns (
            id,
            name,
            created_by,
            tenant_id
          )
        )
      `)
      .not('stakeholder_session_id', 'is', null)

    const { data, error } = await query as any

    if (error) {
      console.error('Error fetching industry conversations:', error)
      return []
    }

    if (!data) return []

    // Filter by user access and map to unified shape
    return (data as any[])
      .filter((row: any) => {
        const assignment = row.campaign_assignments
        if (!assignment?.campaigns) return false
        const campaign = assignment.campaigns

        if (userType === 'admin') return true
        if (userType === 'consultant') {
          // Consultant sees campaigns they created OR under their tenant
          return campaign.created_by === userId ||
            (tenantId && campaign.tenant_id === tenantId)
        }
        return false
      })
      .map((row: any) => {
        const assignment = row.campaign_assignments
        const campaign = assignment.campaigns
        const history = Array.isArray(row.conversation_history) ? row.conversation_history : []

        return {
          id: row.id,
          sessionType: 'industry' as const,
          participantName: assignment.stakeholder_name || 'Unknown',
          participantEmail: assignment.stakeholder_email || null,
          participantType: assignment.stakeholder_role || 'stakeholder',
          contextName: campaign.name || 'Unknown Campaign',
          status: assignment.status || 'unknown',
          messageCount: history.length,
          lastActivity: row.last_message_at || row.updated_at || row.created_at,
          createdAt: row.created_at,
        }
      })
  } catch (err) {
    console.error('fetchIndustryConversations error:', err)
    return []
  }
}

/**
 * Fetch coaching conversations from agent_sessions
 * joined through coaching_sessions → tenant_profiles
 */
async function fetchCoachingConversations(
  userId: string,
  userType: string,
  tenantId: string | null
): Promise<ConversationListItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('agent_sessions')
      .select(`
        id,
        conversation_history,
        created_at,
        last_message_at,
        updated_at,
        agent_type,
        coaching_sessions!agent_sessions_coaching_session_id_fkey (
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
        )
      `)
      .not('coaching_session_id', 'is', null) as any

    if (error) {
      console.error('Error fetching coaching conversations:', error)
      return []
    }

    if (!data) return []

    return (data as any[])
      .filter((row: any) => {
        const session = row.coaching_sessions
        if (!session?.tenant_profiles) return false

        if (userType === 'admin') return true
        if (userType === 'coach') {
          return session.tenant_profiles.user_id === userId ||
            (tenantId && session.tenant_id === tenantId)
        }
        return false
      })
      .map((row: any) => {
        const session = row.coaching_sessions
        const tenant = session.tenant_profiles
        const history = Array.isArray(row.conversation_history) ? row.conversation_history : []

        return {
          id: row.id,
          sessionType: 'coaching' as const,
          participantName: session.client_name || 'Unknown',
          participantEmail: session.client_email || null,
          participantType: 'client',
          contextName: tenant?.display_name || 'Unknown Coach',
          status: session.client_status || 'unknown',
          messageCount: history.length,
          lastActivity: row.last_message_at || row.updated_at || row.created_at,
          createdAt: row.created_at,
        }
      })
  } catch (err) {
    console.error('fetchCoachingConversations error:', err)
    return []
  }
}

/**
 * Fetch education conversations from agent_sessions
 * joined through education_participant_tokens → campaigns
 */
async function fetchEducationConversations(
  userId: string,
  userType: string,
  tenantId: string | null
): Promise<ConversationListItem[]> {
  try {
    // @ts-ignore - education_participant_tokens not in generated types
    const { data, error } = await supabaseAdmin
      .from('agent_sessions')
      .select(`
        id,
        conversation_history,
        created_at,
        last_message_at,
        updated_at,
        agent_type,
        education_session_context
      `)
      .not('participant_token_id', 'is', null) as any

    if (error) {
      console.error('Error fetching education conversations:', error)
      return []
    }

    if (!data || data.length === 0) return []

    // Get the participant token IDs to look up context
    const sessionIds = data.map((s: any) => s.id)

    // Fetch participant tokens with campaign info for these sessions
    // @ts-ignore - education_participant_tokens not in generated types
    const { data: tokenData } = await supabaseAdmin
      .from('agent_sessions')
      .select(`
        id,
        participant_token_id
      `)
      .in('id', sessionIds)
      .not('participant_token_id', 'is', null) as any

    if (!tokenData) return []

    const tokenIds = [...new Set(tokenData.map((t: any) => t.participant_token_id).filter(Boolean))]
    const sessionTokenMap: Record<string, string> = {}
    for (const t of tokenData) {
      sessionTokenMap[t.id] = t.participant_token_id
    }

    // Fetch token details with campaign/school info
    // @ts-ignore - education_participant_tokens not in generated types
    const { data: tokens } = await supabaseAdmin
      .from('education_participant_tokens')
      .select(`
        id,
        participant_type,
        cohort_metadata,
        campaign_id,
        school_id,
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
      .in('id', tokenIds) as any

    const tokenMap: Record<string, any> = {}
    if (tokens) {
      for (const t of tokens) {
        tokenMap[t.id] = t
      }
    }

    // Get message counts from agent_messages for education sessions
    // @ts-ignore - agent_messages not in generated types
    const { data: messageCounts } = await supabaseAdmin
      .from('agent_messages')
      .select('agent_session_id')
      .in('agent_session_id', sessionIds) as any

    const msgCountMap: Record<string, number> = {}
    if (messageCounts) {
      for (const m of messageCounts) {
        msgCountMap[m.agent_session_id] = (msgCountMap[m.agent_session_id] || 0) + 1
      }
    }

    return (data as any[])
      .filter((row: any) => {
        const tokenId = sessionTokenMap[row.id]
        const token = tokenId ? tokenMap[tokenId] : null
        if (!token?.campaigns) return false

        if (userType === 'admin') return true
        if (userType === 'company') {
          return (tenantId && token.campaigns.tenant_id === tenantId) ||
            token.campaigns.created_by === userId
        }
        return false
      })
      .map((row: any) => {
        const tokenId = sessionTokenMap[row.id]
        const token = tokenId ? tokenMap[tokenId] : null
        const campaign = token?.campaigns
        const school = token?.schools
        const eduContext = row.education_session_context as Record<string, any> | null

        // Education uses agent_messages table, not conversation_history
        const msgCount = msgCountMap[row.id] || 0

        // Try to get participant name from cohort_metadata or education_session_context
        const participantName = eduContext?.participant_name ||
          token?.cohort_metadata?.name ||
          token?.participant_type || 'Participant'

        return {
          id: row.id,
          sessionType: 'education' as const,
          participantName,
          participantEmail: null,
          participantType: token?.participant_type || 'student',
          contextName: school?.name || campaign?.name || 'Unknown',
          status: eduContext?.status || 'unknown',
          messageCount: msgCount,
          lastActivity: row.last_message_at || row.updated_at || row.created_at,
          createdAt: row.created_at,
        }
      })
  } catch (err) {
    console.error('fetchEducationConversations error:', err)
    return []
  }
}
