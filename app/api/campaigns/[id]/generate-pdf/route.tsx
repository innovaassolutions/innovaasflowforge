import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@joshuajaco/react-pdf-renderer-bundled'
import { AssessmentPDFDocument } from '@/lib/pdf-document'
import { ReportMetadata } from '@/lib/report-generator'
import { ReadinessAssessment } from '@/lib/agents/synthesis-agent'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    console.log(`[Generate PDF] Starting PDF generation for campaign ${campaignId}`)

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await (supabaseAdmin
      .from('campaigns') as any)
      .select('id, name, company_name, facilitator_name, description')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    console.log(`[Generate PDF] Campaign found: ${campaign.name}`)

    // Fetch synthesis data, or generate it if it doesn't exist
    let assessment: ReadinessAssessment

    const { data: synthesisData, error: synthesisError } = await (supabaseAdmin
      .from('campaign_synthesis') as any)
      .select('synthesis_data')
      .eq('campaign_id', campaignId)
      .single()

    if (synthesisError || !synthesisData) {
      console.log(`[Generate PDF] No synthesis found, running synthesis now...`)

      // Run synthesis
      const { synthesizeCampaign } = await import('@/lib/agents/synthesis-agent')
      assessment = await synthesizeCampaign(campaignId)

      console.log(`[Generate PDF] Synthesis completed`)
    } else {
      console.log(`[Generate PDF] Using existing synthesis data`)
      assessment = synthesisData.synthesis_data
    }

    // Count stakeholders
    const { count: stakeholderCount } = await (supabaseAdmin
      .from('stakeholders') as any)
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)

    // Prepare metadata
    const metadata: ReportMetadata = {
      campaignName: campaign.name,
      companyName: campaign.company_name,
      facilitatorName: campaign.facilitator_name,
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      stakeholderCount: stakeholderCount || 0
    }

    console.log(`[Generate PDF] Rendering PDF document...`)

    // Generate PDF using @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      <AssessmentPDFDocument assessment={assessment} metadata={metadata} />
    )

    console.log(`[Generate PDF] PDF generated successfully, size: ${pdfBuffer.length} bytes`)

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${campaign.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Assessment_${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('[Generate PDF] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
