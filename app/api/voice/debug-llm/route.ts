import { NextRequest } from 'next/server'

/**
 * DEBUG ENDPOINT - Logs everything ElevenLabs sends
 *
 * This is a minimal endpoint to verify ElevenLabs is calling us.
 * Returns a hardcoded response immediately.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[debug-llm] REQUEST RECEIVED at ${timestamp}`)
  console.log(`${'='.repeat(60)}`)

  // Log all headers
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = key.toLowerCase().includes('auth') ? value.substring(0, 20) + '...' : value
  })
  console.log('[debug-llm] Headers:', JSON.stringify(headers, null, 2))

  // Log body
  try {
    const body = await request.json()
    console.log('[debug-llm] Body:', JSON.stringify(body, null, 2).substring(0, 1000))
  } catch (e) {
    console.log('[debug-llm] Body parse error:', e)
  }

  // Return immediate SSE response
  const encoder = new TextEncoder()
  const id = `chatcmpl-${Date.now()}`
  const created = Math.floor(Date.now() / 1000)

  const chunks = [
    { delta: { role: 'assistant' }, finish_reason: null },
    { delta: { content: 'Debug endpoint received your message! ' }, finish_reason: null },
    { delta: { content: 'ElevenLabs is successfully calling us.' }, finish_reason: null },
    { delta: {}, finish_reason: 'stop' },
  ]

  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        const data = JSON.stringify({
          id,
          object: 'chat.completion.chunk',
          created,
          model: 'debug',
          choices: [{ index: 0, ...chunk, logprobs: null }],
        })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()

      console.log('[debug-llm] Response sent successfully')
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders,
    },
  })
}
