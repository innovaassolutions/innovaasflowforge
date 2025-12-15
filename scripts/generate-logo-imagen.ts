/**
 * Generate FlowForge logos using Google Gemini Image Generation
 *
 * Uses Gemini 2.0 Flash Exp Image Generation (the "Nano Banana" model)
 * for actual image generation via the @google/genai SDK.
 *
 * Concept: FlowForge unlocks organizational "Flow" -
 * revealing new value, opportunities, revenue, and cultural alignment.
 *
 * Run with: npx tsx scripts/generate-logo-imagen.ts
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
import 'dotenv/config'

const API_KEY = process.env.GOOGLE_AI_STUDIO || process.env.GOOGLE_GEMINI_API_KEY

if (!API_KEY) {
  console.error('No Google AI API key found. Set GOOGLE_AI_STUDIO or GOOGLE_GEMINI_API_KEY.')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

// Logo generation prompts
const logoPrompts = {
  iconMark: `Design a premium, minimal logo icon for "FlowForge", a management consulting technology company.

BRAND STORY:
FlowForge helps organizations unlock their hidden potential. Like opening a lock or releasing a dam, we help businesses discover new value, revenue opportunities, and cultural alignment.

VISUAL CONCEPT - "Unlocking Flow":
The icon should visually represent the moment of UNLOCKING or OPENING:
- Two abstract shapes separating/diverging to reveal flowing energy between them
- OR an abstract "F" that suggests flowing water being released
- OR geometric forms parting like doors opening to reveal dynamic movement
- The sense of breakthrough, release, transformation

DESIGN REQUIREMENTS:
- Icon only, no text
- Modern, minimal, geometric style
- Premium SaaS/tech company aesthetic
- Colors: Orange (#F25C05) and Teal (#1D9BA3) - can use gradients
- Clean white background
- Must work as a favicon (recognizable at small sizes)
- Professional, not playful
- Similar quality to: Notion, Linear, Vercel, Stripe icons

OUTPUT: A single, clean icon mark on a white background. Square format.`,

  fullLogo: `Design a premium horizontal logo for "FlowForge", a management consulting technology company.

BRAND STORY:
FlowForge helps organizations unlock their hidden potential - new value, revenue opportunities, and cultural alignment.

CONCEPT - "Unlocking Flow":
The logo should include:
1. An icon mark representing "unlocking flow" - two shapes opening to reveal energy, or flowing forms
2. The wordmark "FlowForge" in a modern, professional sans-serif font

DESIGN REQUIREMENTS:
- Horizontal layout: icon on left, wordmark on right
- Modern, minimal, geometric style
- Premium SaaS/tech aesthetic (like Notion, Linear, Vercel)
- Icon colors: Orange (#F25C05) and Teal (#1D9BA3)
- Wordmark color: Dark charcoal (#171614)
- Clean white background
- Professional weight font (medium to semibold)
- Balanced spacing between icon and text

OUTPUT: A complete horizontal logo with icon and "FlowForge" text.`,

  variations: `Generate 4 different logo icon concepts for "FlowForge", a management consulting platform.

CONCEPT: "Unlocking Flow" - the brand helps organizations unlock hidden potential, new value, and opportunities.

SHOW 4 DIFFERENT INTERPRETATIONS:
1. Two geometric shapes diverging/separating with energy between them
2. An abstract stylized "F" with flowing, dynamic curves
3. A key or lock concept abstracted into modern geometric forms
4. Arrows or paths that split and flow outward

REQUIREMENTS FOR ALL:
- Minimal, geometric, modern
- Colors: Orange (#F25C05) and Teal (#1D9BA3)
- Premium tech company quality
- Clean white background
- Arranged in a 2x2 grid

OUTPUT: 4 distinct logo concepts in a grid layout.`
}

async function generateWithGemini(prompt: string, filename: string) {
  console.log(`\nGenerating: ${filename}...`)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: prompt,
      config: {
        responseModalities: ['image', 'text'],
      },
    })

    // Check for image in response parts
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0]
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // Check for inline data (image)
          const partAny = part as Record<string, unknown>
          if (partAny.inlineData) {
            const inlineData = partAny.inlineData as { data?: string; mimeType?: string }
            if (inlineData.data) {
              const buffer = Buffer.from(inlineData.data, 'base64')
              const outputPath = path.join(process.cwd(), 'public', filename)
              fs.writeFileSync(outputPath, buffer)
              console.log(`  Saved: ${outputPath}`)
              return true
            }
          }
        }

        // Show text response if no image
        for (const part of candidate.content.parts) {
          const partAny = part as Record<string, unknown>
          if (partAny.text) {
            console.log(`  Text response: ${String(partAny.text).substring(0, 300)}...`)
          }
        }
      }
    }

    console.error(`  No image generated`)
    return false

  } catch (error: unknown) {
    const err = error as Error & { status?: number; message?: string }
    console.error(`  Error: ${err.message || JSON.stringify(error)}`)
    return false
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('FlowForge Logo Generation with Gemini Image')
  console.log('Model: gemini-2.0-flash-exp-image-generation')
  console.log('Concept: Unlocking Flow - Value, Opportunity, Alignment')
  console.log('='.repeat(60))

  // Generate icon mark
  await generateWithGemini(logoPrompts.iconMark, 'logo-icon-gemini.png')

  // Generate full logo
  await generateWithGemini(logoPrompts.fullLogo, 'logo-full-gemini.png')

  // Generate variations
  await generateWithGemini(logoPrompts.variations, 'logo-variations-gemini.png')

  console.log('\n' + '='.repeat(60))
  console.log('Generation complete!')
  console.log('')
  console.log('Check /public for generated images.')
  console.log('='.repeat(60))
}

main().catch(console.error)
