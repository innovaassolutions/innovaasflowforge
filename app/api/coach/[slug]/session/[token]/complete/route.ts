import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyTenantOwner } from '@/lib/services/completion-notification'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/coach/[slug]/session/[token]/complete
 * Facilitator override - manually mark a coaching session as complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { slug, token } = await params
    const supabase = getServiceClient()

    // Verify tenant exists and is active
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, is_active')
      .eq('slug', slug)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      )
    }

    if (!tenant.is_active) {
      return NextResponse.json(
        { error: 'This coach is not currently active' },
        { status: 403 }
      )
    }

    // Find coaching session by token and tenant
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, client_name, client_status')
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Return early if already completed
    if (session.client_status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Session already completed',
      })
    }

    // Get agent session
    const { data: agentSession, error: agentError } = await (supabase
      .from('agent_sessions') as any)
      .select('id, session_context')
      .eq('coaching_session_id', session.id)
      .eq('agent_type', 'archetype_interview')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (agentError || !agentSession) {
      return NextResponse.json(
        { error: 'Agent session not found' },
        { status: 404 }
      )
    }

    // Update agent session context with facilitator override
    const updatedContext = {
      ...(agentSession.session_context || {}),
      phase: 'completed',
      is_complete: true,
      facilitator_override: true,
      completed_at: new Date().toISOString(),
    }

    const { error: contextError } = await (supabase
      .from('agent_sessions') as any)
      .update({ session_context: updatedContext })
      .eq('id', agentSession.id)

    if (contextError) {
      console.error('[coaching/complete] Failed to update agent session:', contextError)
      return NextResponse.json(
        { error: 'Failed to update agent session' },
        { status: 500 }
      )
    }

    // Update coaching session status
    const { error: statusError } = await supabase
      .from('coaching_sessions')
      .update({
        client_status: 'completed',
        completed_at: new Date().toISOString(),
      } as any)
      .eq('id', session.id)

    if (statusError) {
      console.error('[coaching/complete] Failed to update coaching session:', statusError)
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      )
    }

    console.log(`[coaching/complete] Session ${session.id} manually completed for ${session.client_name}`)

    // Notify coach
    try {
      await notifyTenantOwner({
        tenantId: tenant.id,
        participantName: session.client_name,
        assessmentType: 'Leadership Archetype',
        dashboardPath: '/dashboard/clients',
      }, supabase)
    } catch (notifyErr) {
      console.error('[coaching/complete] Failed to send completion notification:', notifyErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Session marked as complete',
    })
  } catch (error) {
    console.error('[coaching/complete] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
