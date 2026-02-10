/**
 * Pages Router API for Education Report PDF Generation
 *
 * This endpoint is called by the App Router download route to generate PDFs
 * because Pages Router works better with @react-pdf/renderer.
 *
 * See: https://github.com/diegomura/react-pdf/issues/2460
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { renderToBuffer } from '@react-pdf/renderer'
import { EducationReportPDF, type EducationReportPDFData } from '@/lib/pdf/education-report-pdf'

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
    const pdfData: EducationReportPDFData = req.body

    if (!pdfData || !pdfData.school || !pdfData.synthesis || !pdfData.module) {
      return res.status(400).json({ error: 'Missing required PDF data' })
    }

    console.log('📄 Generating Education PDF for:', pdfData.school.name, '-', pdfData.module)

    const buffer = await renderToBuffer(EducationReportPDF({ data: pdfData }))

    console.log('✅ Education PDF generated successfully, size:', buffer.length, 'bytes')

    res.status(200).json({
      success: true,
      pdfBase64: buffer.toString('base64'),
      size: buffer.length,
    })
  } catch (error: any) {
    console.error('❌ Education PDF generation error:', {
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
