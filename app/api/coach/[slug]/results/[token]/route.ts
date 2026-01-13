/**
 * Coach Results API
 *
 * Fetches archetype results for a completed coaching session.
 * Returns session data, archetype results, and tenant branding.
 * Respects tenant's results_disclosure setting (full/teaser/none).
 *
 * Story: 1.1 Results Page Foundation
 * Updated: 3-5 Results Disclosure
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ARCHETYPES, type Archetype } from '@/lib/agents/archetype-constitution'
import type { EnhancedResults } from '@/lib/agents/enhancement-agent'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface ArchetypeResultsData {
  default_archetype: Archetype
  authentic_archetype: Archetype
  is_aligned: boolean
  scores: {
    default: Record<Archetype, number>
    authentic: Record<Archetype, number>
    friction: Record<Archetype, number>
  }
  completed_at: string
}

export type ResultsDisclosure = 'full' | 'teaser' | 'none'

export interface ResultsResponse {
  success: boolean
  disclosure?: ResultsDisclosure
  session?: {
    id: string
    client_name: string
    client_email: string
    client_status: string
    reflection_status: string
    completed_at: string
  }
  results?: {
    primary_archetype: {
      key: Archetype
      name: string
      core_traits?: string[]
      under_pressure?: string
      when_grounded?: string
      overuse_signals?: string[]
    }
    authentic_archetype: {
      key: Archetype
      name: string
      core_traits?: string[]
      under_pressure?: string
      when_grounded?: string
      overuse_signals?: string[]
    }
    tension_pattern: {
      has_tension: boolean
      description?: string
      triggers?: string[]
    }
    scores?: ArchetypeResultsData['scores']
  }
  enhancedResults?: EnhancedResults | null
  tenant?: {
    id: string
    display_name: string
    slug: string
    brand_config: Record<string, unknown>
    contact_email?: string
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
): Promise<NextResponse<ResultsResponse>> {
  try {
    const { slug, token } = await params
    const supabase = getServiceClient()

    // Verify tenant exists and is active
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, slug, is_active, brand_config, email_config, results_disclosure')
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
      .select('id, client_name, client_email, client_status, reflection_status, completed_at, metadata, enhanced_results')
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

    // Extract archetype results from metadata
    const metadata = session.metadata as { archetype_results?: ArchetypeResultsData } | null
    const archetypeResults = metadata?.archetype_results

    if (!archetypeResults) {
      return NextResponse.json(
        { success: false, error: 'Results not yet processed' },
        { status: 400 }
      )
    }

    // Build enriched results with archetype details
    const primaryArchetypeData = ARCHETYPES[archetypeResults.default_archetype]
    const authenticArchetypeData = ARCHETYPES[archetypeResults.authentic_archetype]

    // Determine if there's a tension pattern (misalignment)
    const hasTension = !archetypeResults.is_aligned
    const tensionPattern = hasTension ? {
      has_tension: true,
      description: `Your default response under pressure (${primaryArchetypeData.name}) differs from what energizes you when grounded (${authenticArchetypeData.name}). This tension is common and often reflects adaptive strategies you've developed.`,
      triggers: [
        ...primaryArchetypeData.overuse_signals.slice(0, 2),
        'When stressed, you may over-rely on familiar patterns that don\'t serve your deeper needs'
      ]
    } : {
      has_tension: false
    }

    // Update reflection_status to 'pending' if still 'none' (first time viewing results)
    if (session.reflection_status === 'none' || !session.reflection_status) {
      await supabase
        .from('coaching_sessions')
        .update({ reflection_status: 'pending' })
        .eq('id', session.id)
    }

    // Get disclosure level (default to 'full' for backwards compatibility)
    const disclosure = (tenant.results_disclosure as ResultsDisclosure) || 'full'

    // Extract contact email from email_config
    const emailConfig = tenant.email_config as { replyTo?: string } | null
    const contactEmail = emailConfig?.replyTo

    // Build response based on disclosure level
    const baseResponse = {
      success: true,
      disclosure,
      session: {
        id: session.id,
        client_name: session.client_name,
        client_email: session.client_email,
        client_status: session.client_status,
        reflection_status: session.reflection_status || 'pending',
        completed_at: session.completed_at,
      },
      tenant: {
        id: tenant.id,
        display_name: tenant.display_name,
        slug: tenant.slug,
        brand_config: tenant.brand_config as Record<string, unknown>,
        contact_email: contactEmail,
      }
    }

    // For 'none' disclosure: only return tenant info (no results)
    if (disclosure === 'none') {
      return NextResponse.json(baseResponse)
    }

    // For 'teaser' disclosure: only archetype names, no details
    if (disclosure === 'teaser') {
      return NextResponse.json({
        ...baseResponse,
        results: {
          primary_archetype: {
            key: archetypeResults.default_archetype,
            name: primaryArchetypeData.name
          },
          authentic_archetype: {
            key: archetypeResults.authentic_archetype,
            name: authenticArchetypeData.name
          },
          tension_pattern: {
            has_tension: hasTension
          }
        }
      })
    }

    // For 'full' disclosure: return everything
    return NextResponse.json({
      ...baseResponse,
      results: {
        primary_archetype: {
          ...primaryArchetypeData,
          key: archetypeResults.default_archetype
        },
        authentic_archetype: {
          ...authenticArchetypeData,
          key: archetypeResults.authentic_archetype
        },
        tension_pattern: tensionPattern,
        scores: archetypeResults.scores
      },
      enhancedResults: session.enhanced_results as EnhancedResults | null,
    })
  } catch (error) {
    console.error('Results fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}
