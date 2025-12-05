/**
 * Gamma API Test Route
 *
 * Tests Gamma API connectivity and explores available endpoints.
 * DELETE THIS FILE after integration is complete.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const GAMMA_API_KEY = process.env.GAMMA_API_KEY

  if (!GAMMA_API_KEY) {
    return NextResponse.json(
      { error: 'GAMMA_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    // Test 1: Try to list documents/presentations
    const listResponse = await fetch('https://api.gamma.app/v1/documents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GAMMA_API_KEY}`,
      },
    })

    const listResult = {
      status: listResponse.status,
      ok: listResponse.ok,
      data: listResponse.ok ? await listResponse.json() : await listResponse.text(),
    }

    // Test 2: Try to generate a simple document
    const generateResponse = await fetch('https://api.gamma.app/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GAMMA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: 'Create a simple test presentation about digital transformation.',
        format: 'document',
      }),
    })

    const generateResult = {
      status: generateResponse.status,
      ok: generateResponse.ok,
      data: generateResponse.ok ? await generateResponse.json() : await generateResponse.text(),
    }

    return NextResponse.json({
      success: true,
      tests: {
        list: listResult,
        generate: generateResult,
      },
      note: 'Check which endpoints work and adjust gamma-api.ts accordingly',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'API test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
