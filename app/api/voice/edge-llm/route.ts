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
  const timestamp = new Date().toISOString()
  console.log(`[edge-llm] REQUEST at ${timestamp}`)

  try {
    const body = await request.json()
    const stream = body.stream ?? true // Default to streaming
    console.log('[edge-llm] Messages:', body.messages?.length)
    console.log('[edge-llm] Stream:', stream)
    console.log('[edge-llm] Full request body keys:', Object.keys(body))

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

    // Streaming response
    console.log('[edge-llm] Returning streaming response')
    const encoder = new TextEncoder()

    // Use TransformStream for proper async streaming
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    // Stream chunks asynchronously
    ;(async () => {
      try {
        // Role chunk - OpenAI includes content:"" with role
        const roleChunk = {
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
        }
        await writer.write(encoder.encode(`data: ${JSON.stringify(roleChunk)}\n\n`))

        // Content chunks - send word by word for natural streaming
        const words = responseText.split(' ')
        for (const word of words) {
          const contentChunk = {
            id,
            object: 'chat.completion.chunk',
            created,
            model: 'edge-llm',
            system_fingerprint: systemFingerprint,
            choices: [{
              index: 0,
              delta: { content: word + ' ' },
              logprobs: null,
              finish_reason: null
            }],
          }
          await writer.write(encoder.encode(`data: ${JSON.stringify(contentChunk)}\n\n`))
        }

        // Finish chunk
        const finishChunk = {
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
        }
        await writer.write(encoder.encode(`data: ${JSON.stringify(finishChunk)}\n\n`))
        await writer.write(encoder.encode('data: [DONE]\n\n'))

        console.log('[edge-llm] Stream completed successfully')
      } catch (err) {
        console.error('[edge-llm] Stream error:', err)
      } finally {
        await writer.close()
      }
    })()

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
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
