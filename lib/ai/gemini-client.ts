/**
 * Google Gemini Client
 *
 * Initializes and configures the Google Generative AI client for image generation.
 * Used for creating custom illustrations for consulting reports.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Initialize the Gemini client with API key from environment
const apiKey = process.env.GOOGLE_GEMINI_API_KEY

if (!apiKey) {
  throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set')
}

export const genAI = new GoogleGenerativeAI(apiKey)

// Model configuration for image generation
export const imageGenerationConfig = {
  model: 'gemini-1.5-flash', // Fast model for image understanding and generation guidance
  generationConfig: {
    temperature: 0.8, // Creative but controlled
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
}

/**
 * Get a Gemini model instance configured for image generation
 */
export function getImageGenerationModel() {
  return genAI.getGenerativeModel(imageGenerationConfig)
}
