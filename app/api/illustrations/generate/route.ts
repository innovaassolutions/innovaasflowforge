/**
 * Illustration Generation API Route
 *
 * POST /api/illustrations/generate
 * Generates AI-powered SVG illustrations using Google Gemini.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateIllustrationWithFallback, type IllustrationOptions } from '@/lib/ai'

export const runtime = 'nodejs' // Use Node.js runtime for Gemini API
export const maxDuration = 30 // Max 30 seconds for generation

interface GenerateRequestBody {
  prompt: string
  options?: IllustrationOptions
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequestBody = await request.json()
    const { prompt, options = {} } = body

    // Validate request
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      )
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Generate illustration (with automatic fallback)
    const svg = await generateIllustrationWithFallback(prompt, options)

    return NextResponse.json({
      svg,
      cached: false, // Could enhance this to return cache status
      prompt,
      options
    })

  } catch (error) {
    console.error('[API /illustrations/generate] Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate illustration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
