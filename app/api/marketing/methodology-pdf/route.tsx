import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ScoringMethodologyPDF } from '@/lib/pdf-marketing-methodology'

/**
 * GET /api/marketing/methodology-pdf
 *
 * Generates and returns the Scoring Methodology marketing PDF.
 * This is a static marketing document showcasing FlowForge's assessment methodology.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Marketing PDF] Starting methodology PDF generation...')

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <ScoringMethodologyPDF />
    )

    console.log(`[Marketing PDF] PDF generated successfully, size: ${pdfBuffer.length} bytes`)

    // Create filename with current date
    const filename = `FlowForge_Assessment_Methodology_${new Date().toISOString().split('T')[0]}.pdf`

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
    console.error('[Marketing PDF] Error:', error)
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
