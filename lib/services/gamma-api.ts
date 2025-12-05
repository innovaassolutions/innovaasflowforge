/**
 * Gamma AI API Service
 *
 * Generates professional consulting reports using Gamma AI.
 * Handles brand customization and PDF generation.
 *
 * Story: 1.3 - Report Landing Page & Visualizations
 */

import type { ReadinessAssessment } from '@/lib/agents/synthesis-agent'

const GAMMA_API_KEY = process.env.GAMMA_API_KEY
const GAMMA_API_BASE_URL = 'https://api.gamma.app/v1'

interface GammaGenerateRequest {
  prompt: string
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
  }
  format?: 'presentation' | 'document' | 'webpage'
}

interface GammaGenerateResponse {
  id: string
  status: 'processing' | 'completed' | 'failed'
  url?: string
  pdfUrl?: string
  error?: string
}

/**
 * Generate report content prompt from synthesis data
 */
function buildReportPrompt(
  companyName: string,
  campaignName: string,
  synthesis: ReadinessAssessment,
  tier: 'basic' | 'informative' | 'premium',
  consultantObservations?: string | null
): string {
  const { overallScore, pillars, executiveSummary, recommendations } = synthesis

  let prompt = `Create a professional management consulting assessment report for ${companyName}.

REPORT TITLE: Digital Transformation Readiness Assessment
CAMPAIGN: ${campaignName}
OVERALL SCORE: ${overallScore.toFixed(1)}/5.0

DESIGN REQUIREMENTS:
- Visual-first layout with minimal text (McKinsey/BCG style)
- Light background (white/off-white), professional and print-ready
- Large, prominent overall score on first page
- Use brand colors: Primary Orange (#F25C05), Secondary Teal (#1D9BA3)
- Include data visualizations: radar chart for pillars, bar charts for dimensions
- Traffic light color coding: Green (4.0+), Yellow (3.0-3.9), Orange (2.0-2.9), Red (0-1.9)

EXECUTIVE SUMMARY (2-3 sentences max):
${executiveSummary.split('\n\n')[0]}

PILLAR SCORES:
${pillars.map(p => `- ${p.pillar}: ${p.score.toFixed(1)}/5.0 (${p.dimensions.length} dimensions assessed)`).join('\n')}

`

  // Add tier-specific content
  if (tier === 'informative' || tier === 'premium') {
    prompt += `\nKEY RECOMMENDATIONS:\n${recommendations.slice(0, 5).map((r, i) => `${i + 1}. ${r.title} (Priority: ${r.priority})`).join('\n')}\n`
  }

  if (tier === 'premium') {
    prompt += `\nDETAILED INSIGHTS:\nInclude priority matrix, capability heat map, and transformation roadmap.\n`
  }

  if (consultantObservations) {
    prompt += `\nCONSULTANT OBSERVATIONS:\n${consultantObservations}\n`
  }

  prompt += `\nFORMAT: Create a visual-first presentation where charts and infographics dominate. Use minimal text with maximum 2-3 sentences per section. Make it print-ready and professional.`

  return prompt
}

/**
 * Generate report using Gamma AI
 */
export async function generateGammaReport(
  companyName: string,
  campaignName: string,
  synthesis: ReadinessAssessment,
  tier: 'basic' | 'informative' | 'premium',
  consultantObservations?: string | null
): Promise<GammaGenerateResponse> {
  if (!GAMMA_API_KEY) {
    throw new Error('GAMMA_API_KEY environment variable is not set')
  }

  const prompt = buildReportPrompt(
    companyName,
    campaignName,
    synthesis,
    tier,
    consultantObservations
  )

  try {
    // Initial generation request
    const response = await fetch(`${GAMMA_API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GAMMA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        format: 'document',
        theme: {
          primaryColor: '#F25C05', // Brand orange
          secondaryColor: '#1D9BA3', // Brand teal
        },
      } as GammaGenerateRequest),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Gamma API error: ${response.status} - ${errorData.error || response.statusText}`
      )
    }

    const data: GammaGenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Gamma API generation error:', error)
    throw error
  }
}

/**
 * Check status of Gamma report generation
 */
export async function checkGammaReportStatus(
  reportId: string
): Promise<GammaGenerateResponse> {
  if (!GAMMA_API_KEY) {
    throw new Error('GAMMA_API_KEY environment variable is not set')
  }

  try {
    const response = await fetch(`${GAMMA_API_BASE_URL}/documents/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GAMMA_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status}`)
    }

    const data: GammaGenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Gamma API status check error:', error)
    throw error
  }
}

/**
 * Poll Gamma API until report is ready (max 60 seconds)
 */
export async function waitForGammaReport(
  reportId: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<GammaGenerateResponse> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await checkGammaReportStatus(reportId)

    if (status.status === 'completed') {
      return status
    }

    if (status.status === 'failed') {
      throw new Error(`Gamma report generation failed: ${status.error}`)
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Gamma report generation timed out')
}
