/**
 * Pages Router API for Archetype PDF Generation
 *
 * This endpoint is called by the App Router complete route to generate PDFs
 * because Pages Router works better with @react-pdf/renderer.
 *
 * See: https://github.com/diegomura/react-pdf/issues/2460
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { renderToBuffer } from '@react-pdf/renderer'
import { ArchetypeResultsPDF, type ArchetypeResultsPDFData } from '@/lib/pdf/archetype-results-pdf'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const pdfData: ArchetypeResultsPDFData = req.body

    if (!pdfData || !pdfData.session || !pdfData.results || !pdfData.tenant) {
      return res.status(400).json({ error: 'Missing required PDF data' })
    }

    console.log('📄 Generating Archetype PDF for:', pdfData.session.client_name)

    const buffer = await renderToBuffer(ArchetypeResultsPDF({ data: pdfData }))

    console.log('✅ Archetype PDF generated successfully, size:', buffer.length, 'bytes')

    // Return the PDF as base64 for easy transport
    res.status(200).json({
      success: true,
      pdfBase64: buffer.toString('base64'),
      size: buffer.length,
    })
  } catch (error: any) {
    console.error('❌ Archetype PDF generation error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })

    res.status(500).json({
      success: false,
      error: error?.message || 'Unknown error',
    })
  }
}
