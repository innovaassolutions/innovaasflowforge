/**
 * List available Google AI models
 */

import { GoogleGenAI } from '@google/genai'
import 'dotenv/config'

const API_KEY = process.env.GOOGLE_AI_STUDIO || process.env.GOOGLE_GEMINI_API_KEY

if (!API_KEY) {
  console.error('No API key found')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

async function main() {
  console.log('Fetching available models...\n')

  try {
    const models = await ai.models.list()

    console.log('Available models:')
    console.log('='.repeat(60))

    for await (const model of models) {
      const name = model.name || 'unknown'
      const methods = model.supportedActions || []

      // Filter for image generation capable models
      if (name.includes('imagen') || name.includes('image') || methods.includes('generateImages')) {
        console.log(`\n${name}`)
        console.log(`  Methods: ${methods.join(', ') || 'N/A'}`)
        if (model.description) {
          console.log(`  Description: ${model.description.substring(0, 100)}...`)
        }
      }
    }
  } catch (error) {
    console.error('Error listing models:', error)
  }
}

main()
