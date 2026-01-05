import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { ARCHETYPES, Archetype } from '@/lib/agents/archetype-constitution'

/**
 * GET /api/coaching/report/[token]
 *
 * Fetches coaching session report data by access token.
 * Returns archetype scores, stories, and context for display.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing access token' },
        { status: 400 }
      )
    }

    // Fetch coaching session by access token
    const { data: session, error: sessionError } = await (supabaseAdmin
      .from('coaching_sessions') as any)
      .select(`
        id,
        client_name,
        client_email,
        access_token,
        started_at,
        completed_at,
        metadata,
        tenant_id,
        tenant_profiles!inner (
          id,
          display_name,
          brand_config
        )
      `)
      .eq('access_token', token)
      .single()

    if (sessionError || !session) {
      console.error('[Coaching Report] Session not found:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Report not found or invalid token' },
        { status: 404 }
      )
    }

    // Check if session is completed
    if (!session.completed_at) {
      return NextResponse.json(
        { success: false, error: 'Session not yet completed' },
        { status: 400 }
      )
    }

    // Extract archetype results from metadata
    const archetypeResults = session.metadata?.archetype_results
    if (!archetypeResults) {
      return NextResponse.json(
        { success: false, error: 'No archetype results available' },
        { status: 404 }
      )
    }

    // Get tenant/coach info
    const tenant = session.tenant_profiles
    const coachName = tenant?.display_name || 'Your Coach'
    const brandName = tenant?.brand_config?.brandName || 'Leading with Meaning'
    const brandConfig = tenant?.brand_config || {}

    // Format the report data
    const reportData = {
      clientName: session.client_name,
      coachName,
      brandName,
      brandConfig,
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      completedDate: session.completed_at ? new Date(session.completed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null,
      context: archetypeResults.context || {
        role: 'Not specified',
        ambiguity_level: 'Not specified',
        current_feeling: 'Not specified'
      },
      scores: archetypeResults.scores || {
        default: { anchor: 0, catalyst: 0, steward: 0, wayfinder: 0, architect: 0 },
        authentic: { anchor: 0, catalyst: 0, steward: 0, wayfinder: 0, architect: 0 },
        friction: { anchor: 0, catalyst: 0, steward: 0, wayfinder: 0, architect: 0 }
      },
      default_archetype: archetypeResults.default_archetype as Archetype || 'anchor',
      authentic_archetype: archetypeResults.authentic_archetype as Archetype || 'anchor',
      is_aligned: archetypeResults.is_aligned ?? true,
      stories_captured: archetypeResults.stories_captured || [],
      // Include archetype definitions for the frontend
      archetypes: ARCHETYPES
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('[Coaching Report] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
