import React from 'react'
import { renderToFile } from '@react-pdf/renderer'
import { ScoringMethodologyPDF } from '../lib/pdf-marketing-methodology'
import path from 'path'

async function generatePDF() {
  const outputPath = path.join(process.cwd(), 'docs', 'FlowForge_Assessment_Methodology.pdf')

  console.log('Generating PDF...')

  await renderToFile(
    <ScoringMethodologyPDF />,
    outputPath
  )

  console.log(`PDF saved to: ${outputPath}`)
}

generatePDF().catch(console.error)
