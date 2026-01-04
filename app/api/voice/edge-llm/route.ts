/**
 * EDGE RUNTIME Custom LLM endpoint
 *
 * Matching OpenAI's exact SSE streaming format for ElevenLabs Custom LLM.
 * Key differences from our original format:
 * - Include empty content:"" in role chunk
 * - Add system_fingerprint field
 * - Use async streaming with proper timing
 */

export const runtime = 'edge'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  console.log(`[edge-llm] ========== REQUEST at ${timestamp} ==========`)

  try {
    // Parse body first - minimal logging to reduce latency
    const body = await request.json()
    const stream = body.stream ?? true

    console.log(`[edge-llm] Parsed in ${Date.now() - startTime}ms, messages: ${body.messages?.length}, stream: ${stream}`)

    // Check for user message
    const userMessage = body.messages?.filter((m: { role: string }) => m.role === 'user').pop()

    let responseText: string
    if (userMessage) {
      console.log('[edge-llm] User message found:', userMessage.content?.substring(0, 50))
      responseText = "I heard you! This response is coming from the Edge Runtime endpoint. The connection is working perfectly."
    } else {
      console.log('[edge-llm] No user message - initial greeting')
      responseText = "Hello from Edge Runtime! This is the initial greeting from the Custom LLM endpoint."
    }

    const id = `chatcmpl-${Date.now()}`
    const created = Math.floor(Date.now() / 1000)
    const systemFingerprint = `fp_${Date.now().toString(36)}`

    // Handle non-streaming response
    if (!stream) {
      console.log('[edge-llm] Returning non-streaming response')
      const response = {
        id,
        object: 'chat.completion',
        created,
        model: 'edge-llm',
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
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }

    // Streaming response - synchronous SSE body for reliability
    console.log('[edge-llm] Creating SSE response...')

    // Build SSE response as a single string (more reliable for ElevenLabs)
    const chunks: string[] = []

    // Role chunk with empty content
    chunks.push(`data: ${JSON.stringify({
      id,
      object: 'chat.completion.chunk',
      created,
      model: 'edge-llm',
      system_fingerprint: systemFingerprint,
      choices: [{
        index: 0,
        delta: { role: 'assistant', content: '' },
        logprobs: null,
        finish_reason: null
      }],
    })}\n\n`)

    // Content chunk - send as single chunk instead of word-by-word
    chunks.push(`data: ${JSON.stringify({
      id,
      object: 'chat.completion.chunk',
      created,
      model: 'edge-llm',
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
      model: 'edge-llm',
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
    console.log('[edge-llm] SSE response length:', sseBody.length)
    console.log('[edge-llm] SSE preview:', sseBody.substring(0, 300))

    return new Response(sseBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('[edge-llm] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}
