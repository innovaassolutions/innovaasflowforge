/**
 * Generate Industry Character Illustrations using Google Gemini
 *
 * Uses a reference image as a style guide - the model interprets
 * the reference directly rather than relying on text descriptions.
 *
 * Run with: npx tsx scripts/generate-industry-illustrations.ts
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

// Path to the style reference image
const REFERENCE_IMAGE_PATH = path.join(process.cwd(), 'docs', 'style-reference-illustration.png')

// Load reference image as base64
function loadReferenceImage(): string | null {
  try {
    if (fs.existsSync(REFERENCE_IMAGE_PATH)) {
      const imageBuffer = fs.readFileSync(REFERENCE_IMAGE_PATH)
      return imageBuffer.toString('base64')
    }
    console.warn('Reference image not found at:', REFERENCE_IMAGE_PATH)
    return null
  } catch (error) {
    console.error('Error loading reference image:', error)
    return null
  }
}

// Simple, direct prompts - let the model interpret the reference image
const characterPrompts = {
  industrialist: `Using the attached image as your style guide, create an illustration of a female industrialist / manufacturing leader.

She should be confident, professional, wearing industrial attire (blazer over workwear or safety vest). She could be holding a tablet or clipboard.

Match the EXACT illustration style, colors, and artistic approach of the reference image. Square format.`,

  chemist: `Using the attached image as your style guide, create an illustration of a male chemist / pharmaceutical scientist.

He should be focused and intelligent, wearing a lab coat, holding or examining a flask or beaker. Could have safety goggles pushed up on his forehead.

Match the EXACT illustration style, colors, and artistic approach of the reference image. Square format.`,

  teacher: `Using the attached image as your style guide, create an illustration of a female teacher / educator.

She should be warm and engaging with open body language, wearing professional academic attire (cardigan or blouse). She could be holding a book or gesturing while explaining.

Match the EXACT illustration style, colors, and artistic approach of the reference image. Square format.`,

  consultant: `Using the attached image as your style guide, create an illustration of a male business consultant / professional advisor.

He should be polished and confident, wearing contemporary business attire (well-fitted blazer, open collar). He could be holding a laptop or pointing strategically.

Match the EXACT illustration style, colors, and artistic approach of the reference image. Square format.`
}

async function generateWithGemini(
  prompt: string,
  filename: string,
  referenceImageBase64: string | null
): Promise<boolean> {
  console.log(`\nGenerating: ${filename}...`)

  try {
    // Build content with reference image if available
    const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = []

    // Add reference image first if available
    if (referenceImageBase64) {
      contents.push({
        inlineData: {
          mimeType: 'image/png',
          data: referenceImageBase64
        }
      })
      console.log('  Including reference image for style matching...')
    }

    // Add the text prompt
    contents.push({ text: prompt })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
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
              const outputPath = path.join(process.cwd(), 'public', 'illustrations', filename)

              // Ensure directory exists
              const dir = path.dirname(outputPath)
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
              }

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
  console.log('Industry Character Illustrations - Gemini Image Generation')
  console.log('Model: gemini-2.5-flash-image')
  console.log('Reference: docs/style-reference-illustration.png')
  console.log('='.repeat(60))

  // Load the reference image for style consistency
  console.log('\nLoading reference image...')
  const referenceImage = loadReferenceImage()
  if (referenceImage) {
    console.log('  Reference image loaded successfully!')
  } else {
    console.log('  WARNING: No reference image found. Proceeding with text-only prompts.')
    console.log(`  Expected location: ${REFERENCE_IMAGE_PATH}`)
  }

  const results: Record<string, boolean> = {}

  // Generate each character with reference image
  results.industrialist = await generateWithGemini(
    characterPrompts.industrialist,
    'industrialist.png',
    referenceImage
  )

  results.chemist = await generateWithGemini(
    characterPrompts.chemist,
    'chemist.png',
    referenceImage
  )

  results.teacher = await generateWithGemini(
    characterPrompts.teacher,
    'teacher.png',
    referenceImage
  )

  results.consultant = await generateWithGemini(
    characterPrompts.consultant,
    'consultant.png',
    referenceImage
  )

  console.log('\n' + '='.repeat(60))
  console.log('Generation complete!')
  console.log('')
  console.log('Results:')
  for (const [name, success] of Object.entries(results)) {
    console.log(`  ${success ? '✓' : '✗'} ${name}`)
  }
  console.log('')
  console.log('Gender distribution: Female (industrialist, teacher), Male (chemist, consultant)')
  console.log('Check /public/illustrations/ for generated images.')
  console.log('='.repeat(60))
}

main().catch(console.error)
