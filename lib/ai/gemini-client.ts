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
// Note: API key is optional during build time, but required at runtime
const apiKey = process.env.GOOGLE_GEMINI_API_KEY

// Only initialize if API key is present (skip during build)
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

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
  if (!genAI) {
    throw new Error('Gemini client not initialized. GOOGLE_GEMINI_API_KEY environment variable must be set.')
  }
  return genAI.getGenerativeModel(imageGenerationConfig)
}
