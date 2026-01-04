/**
 * EDGE RUNTIME Custom LLM endpoint
 *
 * Using Edge Runtime instead of Node.js for better SSE streaming compatibility.
 * Edge functions run closer to ElevenLabs servers and handle streaming differently.
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
    console.log('[edge-llm] Messages:', body.messages?.length)

    // Check for user message
    const userMessage = body.messages?.filter((m: { role: string }) => m.role === 'user').pop()

    let responseText: string
    if (userMessage) {
      responseText = "I heard you! This response is coming from the Edge Runtime endpoint. The connection is working perfectly."
    } else {
      responseText = "Hello from Edge Runtime! This is the initial greeting from the Custom LLM endpoint."
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const id = `chatcmpl-${Date.now()}`
    const created = Math.floor(Date.now() / 1000)

    const stream = new ReadableStream({
      start(controller) {
        // Role chunk
        const roleData = JSON.stringify({
          id,
          object: 'chat.completion.chunk',
          created,
          model: 'edge-llm',
          choices: [{ index: 0, delta: { role: 'assistant' }, logprobs: null, finish_reason: null }],
        })
        controller.enqueue(encoder.encode(`data: ${roleData}\n\n`))

        // Content chunks
        const words = responseText.split(' ')
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' '
          const data = JSON.stringify({
            id,
            object: 'chat.completion.chunk',
            created,
            model: 'edge-llm',
            choices: [{ index: 0, delta: { content: chunk }, logprobs: null, finish_reason: null }],
          })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        // Finish chunk
        const finishData = JSON.stringify({
          id,
          object: 'chat.completion.chunk',
          created,
          model: 'edge-llm',
          choices: [{ index: 0, delta: {}, logprobs: null, finish_reason: 'stop' }],
        })
        controller.enqueue(encoder.encode(`data: ${finishData}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
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
