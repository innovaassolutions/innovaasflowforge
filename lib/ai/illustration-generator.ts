/**
 * AI Illustration Generator
 *
 * Uses Google Gemini to generate custom SVG illustrations for consulting reports.
 * Implements McKinsey/BCG-style visual storytelling with brand colors.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { getImageGenerationModel } from './gemini-client'
import { imageCache, generateCacheKey } from './image-cache'

// Style guides for different illustration types
const styleGuides = {
  professional: `Professional business illustration style. Clean lines, minimal detail, modern abstract shapes.
    Corporate consulting aesthetic similar to McKinsey/BCG/PWC presentations. Flat design with subtle gradients.`,

  conceptual: `Conceptual diagram style. Abstract representation of ideas using geometric shapes, icons, and connecting lines.
    Information architecture and flow diagrams. Strategic thinking visualization.`,

  technical: `Technical diagram style. Process flows, system architecture, data flows.
    Professional technical documentation aesthetic with clear hierarchy and annotations.`
}

// Brand color palette
const brandColors = {
  primary: '#F25C05', // Orange
  secondary: '#1D9BA3', // Teal
  background: '#1e1e2e', // Mocha base
  surface: '#313244', // Mocha surface
  text: '#cdd6f4', // Mocha text
  accent1: '#10b981', // Green
  accent2: '#eab308', // Yellow
  accent3: '#6b7280' // Gray
}

export type IllustrationStyle = keyof typeof styleGuides

export interface IllustrationOptions {
  style?: IllustrationStyle
  width?: number
  height?: number
  includeText?: boolean
  complexity?: 'simple' | 'moderate' | 'detailed'
}

/**
 * Generate a custom SVG illustration using Google Gemini
 *
 * @param prompt - Description of the illustration to generate
 * @param options - Generation options
 * @returns SVG code as string, or null if generation fails
 */
export async function generateIllustration(
  prompt: string,
  options: IllustrationOptions = {}
): Promise<string | null> {
  const {
    style = 'professional',
    width = 800,
    height = 600,
    includeText = true,
    complexity = 'moderate'
  } = options

  // Check cache first
  const cacheKey = generateCacheKey(`${prompt}-${style}-${width}-${height}`)
  const cached = imageCache.get(cacheKey)
  if (cached) {
    console.log('[IllustrationGenerator] Using cached illustration')
    return cached
  }

  try {
    const model = getImageGenerationModel()

    // Construct detailed prompt for SVG generation
    const fullPrompt = `You are a professional business illustration designer creating diagrams for McKinsey/BCG-style consulting reports.

TASK: Generate complete, valid SVG code for the following illustration.

DESCRIPTION: ${prompt}

STYLE: ${styleGuides[style]}

SPECIFICATIONS:
- Canvas size: ${width}x${height}px
- Use viewBox="0 0 ${width} ${height}" for proper scaling
- Color palette (use ONLY these colors):
  * Primary (Orange): ${brandColors.primary}
  * Secondary (Teal): ${brandColors.secondary}
  * Accent Green: ${brandColors.accent1}
  * Accent Yellow: ${brandColors.accent2}
  * Gray: ${brandColors.accent3}
  * Background: ${brandColors.background}
  * Surface: ${brandColors.surface}
  * Text: ${brandColors.text}
- Complexity: ${complexity}
- Include text labels: ${includeText}
- Professional, clean, modern aesthetic
- Suitable for business presentations

REQUIREMENTS:
1. Generate ONLY valid SVG code - no explanations, no markdown, no extra text
2. Start with <svg> and end with </svg>
3. Use the specified color palette exclusively
4. Include appropriate spacing and margins (80px margins)
5. Ensure all elements are properly closed
6. Use clean, geometric shapes
7. Maintain visual hierarchy
8. Make it visually striking but professional

OUTPUT: Return ONLY the complete SVG code, nothing else.`

    console.log('[IllustrationGenerator] Generating illustration via Gemini...')

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    let svgCode = response.text()

    // Clean up response - remove markdown code blocks if present
    svgCode = svgCode.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim()

    // Validate it's actually SVG
    if (!svgCode.startsWith('<svg') || !svgCode.includes('</svg>')) {
      console.error('[IllustrationGenerator] Generated content is not valid SVG')
      return null
    }

    // Cache the result
    imageCache.set(cacheKey, svgCode)

    console.log('[IllustrationGenerator] Successfully generated and cached illustration')
    return svgCode

  } catch (error) {
    console.error('[IllustrationGenerator] Failed to generate illustration:', error)
    return null
  }
}

/**
 * Generate illustration for a specific pillar
 *
 * @param pillarName - Name of the pillar (e.g., "Technology", "Process", "Organization")
 * @param context - Additional context about the pillar
 * @returns SVG code or null
 */
export async function generatePillarIllustration(
  pillarName: string,
  context?: string
): Promise<string | null> {
  const contextText = context ? `\nContext: ${context}` : ''

  const prompt = `Create a professional business illustration representing "${pillarName}" transformation in a digital transformation assessment.${contextText}

The illustration should:
- Be abstract and conceptual, not literal
- Use modern geometric shapes and clean lines
- Represent growth, progress, and transformation
- Be suitable for a C-suite executive presentation
- Convey professionalism and strategic thinking

Example concepts:
- Technology: Digital infrastructure, connected systems, data flows
- Process: Workflow optimization, efficiency, streamlined operations
- Organization: Team collaboration, culture change, capability building`

  return generateIllustration(prompt, {
    style: 'conceptual',
    width: 800,
    height: 600,
    complexity: 'moderate'
  })
}

/**
 * Generate a strategic framework diagram
 *
 * @param frameworkType - Type of framework (e.g., "2x2 matrix", "pyramid", "funnel")
 * @param labels - Labels for the framework elements
 * @returns SVG code or null
 */
export async function generateFrameworkDiagram(
  frameworkType: string,
  labels: string[]
): Promise<string | null> {
  const prompt = `Create a ${frameworkType} strategic framework diagram for a consulting report.

Labels to include: ${labels.join(', ')}

The diagram should:
- Be clean and minimalist
- Use the brand color palette effectively
- Have clear visual hierarchy
- Include proper spacing and alignment
- Be immediately understandable
- Follow McKinsey/BCG design standards`

  return generateIllustration(prompt, {
    style: 'professional',
    width: 800,
    height: 600,
    includeText: true,
    complexity: 'simple'
  })
}

/**
 * Get a placeholder SVG if AI generation fails
 *
 * @param width - SVG width
 * @param height - SVG height
 * @param text - Placeholder text
 * @returns Placeholder SVG code
 */
export function getPlaceholderSVG(
  width: number = 800,
  height: number = 600,
  text: string = 'Illustration'
): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${brandColors.surface}"/>
  <circle cx="${width/2}" cy="${height/2}" r="80" fill="${brandColors.primary}" opacity="0.2"/>
  <circle cx="${width/2}" cy="${height/2}" r="60" fill="${brandColors.secondary}" opacity="0.3"/>
  <text
    x="${width/2}"
    y="${height/2}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="sans-serif"
    font-size="24"
    fill="${brandColors.text}"
  >
    ${text}
  </text>
  <text
    x="${width/2}"
    y="${height/2 + 40}"
    text-anchor="middle"
    font-family="sans-serif"
    font-size="14"
    fill="${brandColors.text}"
    opacity="0.6"
  >
    (Placeholder)
  </text>
</svg>`
}

/**
 * Generate illustration with automatic fallback to placeholder
 *
 * @param prompt - Illustration description
 * @param options - Generation options
 * @returns SVG code (generated or placeholder)
 */
export async function generateIllustrationWithFallback(
  prompt: string,
  options: IllustrationOptions = {}
): Promise<string> {
  const generated = await generateIllustration(prompt, options)

  if (generated) {
    return generated
  }

  // Fallback to placeholder
  console.log('[IllustrationGenerator] Using placeholder SVG as fallback')
  return getPlaceholderSVG(
    options.width || 800,
    options.height || 600,
    prompt.split(' ').slice(0, 3).join(' ')
  )
}
