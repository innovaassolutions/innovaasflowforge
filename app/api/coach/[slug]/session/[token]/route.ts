/**
 * Coach Session API - GET
 *
 * Loads session data and conversation history for an archetype interview.
 *
 * Story: 3-3-registration-sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { slug, token } = await params
    const supabase = getServiceClient()

    // Verify tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, is_active')
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
      .select('id, client_name, client_email, client_status, metadata, started_at')
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session link' },
        { status: 404 }
      )
    }

    // Check for existing agent session (using coaching_session_id for coaching module)
    const { data: agentSession } = await supabase
      .from('agent_sessions')
      .select('id, conversation_history, session_context')
      .eq('coaching_session_id', session.id)
      .eq('agent_type', 'archetype_interview')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let isResuming = false
    let conversationHistory: Array<{ role: string; content: string; timestamp?: string }> = []
    let sessionState = null

    if (agentSession) {
      isResuming = true
      // Parse conversation history
      const history = agentSession.conversation_history as Array<{ role: string; content: string; timestamp?: string }>
      conversationHistory = history.filter(msg => msg.role !== 'system').map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
      }))
      sessionState = agentSession.session_context
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        stakeholder_name: session.client_name,
        stakeholder_email: session.client_email,
        status: session.client_status,
        client_status: session.client_status,
      },
      isResuming,
      conversationHistory,
      sessionState,
    })
  } catch (error) {
    console.error('Session load error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load session' },
      { status: 500 }
    )
  }
}
