import { NextRequest, NextResponse } from 'next/server'

/**
 * NODE.JS RUNTIME Custom LLM endpoint
 *
 * Testing if Node.js runtime handles SSE differently than Edge.
 */

// NOT using 'edge' runtime - this will run on Node.js serverless

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log(`[node-llm] ========== REQUEST at ${new Date().toISOString()} ==========`)

  try {
    const body = await request.json()
    const stream = body.stream ?? true

    console.log(`[node-llm] Parsed in ${Date.now() - startTime}ms, messages: ${body.messages?.length}`)

    // Check for user message
    const userMessage = body.messages?.filter((m: { role: string }) => m.role === 'user').pop()

    let responseText: string
    if (userMessage) {
      console.log('[node-llm] User message found:', userMessage.content?.substring(0, 50))
      responseText = "I heard you! This response is from the Node.js runtime endpoint."
    } else {
      console.log('[node-llm] No user message - initial greeting')
      responseText = "Hello from Node.js Runtime! This endpoint runs on Vercel serverless functions."
    }

    const id = `chatcmpl-${Date.now()}`
    const created = Math.floor(Date.now() / 1000)
    const systemFingerprint = `fp_${Date.now().toString(36)}`

    // Handle non-streaming response
    if (!stream) {
      const response = {
        id,
        object: 'chat.completion',
        created,
        model: 'node-llm',
        system_fingerprint: systemFingerprint,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: responseText },
          logprobs: null,
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: responseText.split(' ').length,
          total_tokens: 100 + responseText.split(' ').length
        }
      }
      return NextResponse.json(response, { headers: corsHeaders })
    }

    // Streaming response - build SSE body
    const chunks: string[] = []

    // Role chunk
    chunks.push(`data: ${JSON.stringify({
      id,
      object: 'chat.completion.chunk',
      created,
      model: 'node-llm',
      system_fingerprint: systemFingerprint,
      choices: [{
        index: 0,
        delta: { role: 'assistant', content: '' },
        logprobs: null,
        finish_reason: null
      }],
    })}\n\n`)

    // Content chunk
    chunks.push(`data: ${JSON.stringify({
      id,
      object: 'chat.completion.chunk',
      created,
      model: 'node-llm',
      system_fingerprint: systemFingerprint,
      choices: [{
        index: 0,
        delta: { content: responseText },
        logprobs: null,
        finish_reason: null
      }],
    })}\n\n`)

    // Finish chunk
    chunks.push(`data: ${JSON.stringify({
      id,
      object: 'chat.completion.chunk',
      created,
      model: 'node-llm',
      system_fingerprint: systemFingerprint,
      choices: [{
        index: 0,
        delta: {},
        logprobs: null,
        finish_reason: 'stop'
      }],
    })}\n\n`)

    chunks.push('data: [DONE]\n\n')

    const sseBody = chunks.join('')
    console.log(`[node-llm] Response ready in ${Date.now() - startTime}ms, length: ${sseBody.length}`)

    return new Response(sseBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('[node-llm] Error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
