import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/supabase/server'
import { CoachingReportDocument, CoachingReportData } from '@/lib/pdf-coaching-report'
import { Archetype } from '@/lib/agents/archetype-constitution'

/**
 * POST /api/coaching/report/[token]/pdf
 *
 * Generates and returns a PDF version of the coaching report.
 */
export async function POST(
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

    console.log(`[Coaching PDF] Starting PDF generation for token: ${token.substring(0, 8)}...`)

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
      console.error('[Coaching PDF] Session not found:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Session not found' },
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

    // Extract archetype results
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

    // Prepare report data for PDF
    const reportData: CoachingReportData = {
      clientName: session.client_name,
      coachName,
      brandName,
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
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
      stories_captured: archetypeResults.stories_captured || []
    }

    console.log(`[Coaching PDF] Rendering PDF for ${session.client_name}...`)

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <CoachingReportDocument data={reportData} />
    )

    console.log(`[Coaching PDF] PDF generated successfully, size: ${pdfBuffer.length} bytes`)

    // Create safe filename
    const safeClientName = session.client_name.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `${safeClientName}_Leadership_Archetype_Report_${new Date().toISOString().split('T')[0]}.pdf`

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('[Coaching PDF] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
