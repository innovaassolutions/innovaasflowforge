/**
 * Generate variations of the FlowForge full logo
 *
 * Run with: npx tsx scripts/generate-logo-variations.ts
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs'
import * as path from 'path'

import 'dotenv/config'

const API_KEY = process.env.GOOGLE_AI_STUDIO || process.env.GOOGLE_GEMINI_API_KEY

if (!API_KEY) {
  console.error('No Google AI API key found.')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

const basePrompt = `Design a square icon for "FlowForge" - favicon/app icon format.

ICON ONLY (no text):
- A single elegant flowing WAVE shape in vivid orange (#F25C05)
- One smooth S-curve or wave
- Like a gentle wave of water or a silk ribbon
- Graceful, elegant, simple
- Must work at small sizes (favicon)

FORMAT: Square, centered, white background
NO TEXT - just the wave icon centered in a square.`

async function generate(prompt: string, filename: string): Promise<boolean> {
  console.log(`\nGenerating: ${filename}...`)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: prompt,
      config: {
        responseModalities: ['image', 'text'],
      },
    })

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const p = part as Record<string, unknown>
        if (p.inlineData) {
          const data = p.inlineData as { data?: string }
          if (data.data) {
            const buffer = Buffer.from(data.data, 'base64')
            fs.writeFileSync(path.join(process.cwd(), 'public', filename), buffer)
            console.log(`  Saved: public/${filename}`)
            return true
          }
        }
      }
    }
    console.error(`  No image generated`)
    return false
  } catch (error: unknown) {
    console.error(`  Error:`, error)
    return false
  }
}

async function main() {
  console.log('Generating FlowForge logo variations...\n')

  // Generate favicon icon
  await generate(basePrompt, `favicon-wave.png`)

  console.log('\nDone! Check /public for logo-full-var-*.png files.')
}

main().catch(console.error)
