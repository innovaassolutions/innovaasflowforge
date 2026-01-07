/**
 * Download PDF API
 *
 * Generates and returns the archetype results PDF for download.
 * Does not send email - just returns the PDF buffer.
 *
 * Story: 1.3 Email & PDF (shelved email, PDF download only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ArchetypeResultsPDFData } from '@/lib/pdf/archetype-results-pdf'
import { ARCHETYPES, type Archetype } from '@/lib/agents/archetype-constitution'
import type { TenantProfile } from '@/lib/supabase/server'

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
  completed_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
): Promise<NextResponse> {
  try {
    const { slug, token } = await params
    const supabase = getServiceClient()

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Coach not found' },
        { status: 404 }
      )
    }

    // Get coaching session
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, client_name, client_email, client_status, reflection_status, reflection_messages, enhanced_results, completed_at, metadata')
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if assessment is completed
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

    // Validate archetype keys exist in ARCHETYPES
    if (!ARCHETYPES[archetypeResults.default_archetype]) {
      return NextResponse.json(
        { success: false, error: `Invalid archetype: ${archetypeResults.default_archetype}` },
        { status: 400 }
      )
    }
    if (!ARCHETYPES[archetypeResults.authentic_archetype]) {
      return NextResponse.json(
        { success: false, error: `Invalid archetype: ${archetypeResults.authentic_archetype}` },
        { status: 400 }
      )
    }

    // Build enriched results
    const primaryArchetypeData = ARCHETYPES[archetypeResults.default_archetype]
    const authenticArchetypeData = ARCHETYPES[archetypeResults.authentic_archetype]
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

    // Format generated date
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Cast tenant to TenantProfile type
    const tenantProfile = tenant as unknown as TenantProfile

    // Prepare PDF data
    const pdfData: ArchetypeResultsPDFData = {
      session: {
        id: session.id,
        client_name: session.client_name,
        client_email: session.client_email,
        client_status: session.client_status,
        reflection_status: session.reflection_status || 'pending',
        completed_at: session.completed_at
      },
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
      tenant: tenantProfile,
      reflectionMessages: session.reflection_messages as Array<{ role: 'user' | 'assistant'; content: string }> | undefined,
      enhancedResults: session.enhanced_results as ArchetypeResultsPDFData['enhancedResults'],
      generatedDate,
      validatedLogoUrl: (tenantProfile.brand_config as { logo?: { url?: string } })?.logo?.url || null
    }

    // Generate PDF using Pages Router API
    const internalBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://innovaas.co'
    const pdfApiUrl = `${internalBaseUrl}/flowforge/api/generate-archetype-pdf`

    console.log('📄 Generating PDF for download:', session.client_name)

    const pdfResponse = await fetch(pdfApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfData),
      signal: AbortSignal.timeout(30000),
    })

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text().catch(() => 'Failed to read response')
      console.error('❌ PDF API error:', errorText.substring(0, 200))
      return NextResponse.json(
        { success: false, error: 'Failed to generate PDF' },
        { status: 500 }
      )
    }

    const pdfResult = await pdfResponse.json()

    if (!pdfResult.success || !pdfResult.pdfBase64) {
      return NextResponse.json(
        { success: false, error: pdfResult.error || 'PDF generation failed' },
        { status: 500 }
      )
    }

    // Return PDF as downloadable file
    const pdfBuffer = Buffer.from(pdfResult.pdfBase64, 'base64')
    const filename = `${session.client_name.replace(/[^a-zA-Z0-9]/g, '-')}-leadership-archetype-results.pdf`

    console.log('✅ PDF generated for download, size:', pdfBuffer.length, 'bytes')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Download PDF API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
