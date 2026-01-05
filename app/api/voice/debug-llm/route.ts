import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * DEBUG ENDPOINT - Logs everything and writes to Supabase
 *
 * This logs to console and also saves to Supabase to verify
 * ElevenLabs is reaching our endpoint.
 */

// Create Supabase client for logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

// Simple in-memory request counter to track calls
let requestCount = 0

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  requestCount++
  const callNumber = requestCount
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  console.log(`\n${'='.repeat(80)}`)
  console.log(`[debug-llm] CALL #${callNumber} at ${timestamp}`)
  console.log(`${'='.repeat(80)}`)

  // Log URL and method
  console.log('[debug-llm] URL:', request.url)
  console.log('[debug-llm] Method:', request.method)

  // Log all headers
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    // Truncate auth headers for security
    headers[key] = key.toLowerCase().includes('auth') || key.toLowerCase().includes('key')
      ? value.substring(0, 20) + '...'
      : value
  })
  console.log('[debug-llm] Headers:', JSON.stringify(headers, null, 2))

  try {
    // Get raw body
    const bodyText = await request.text()
    console.log('[debug-llm] Body length:', bodyText.length)
    console.log('[debug-llm] Body (first 2000 chars):', bodyText.substring(0, 2000))

    // Parse body
    let body: Record<string, unknown>
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      console.error('[debug-llm] JSON parse error:', e)
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Log parsed body structure
    console.log('[debug-llm] Body keys:', Object.keys(body))
    console.log('[debug-llm] Stream:', body.stream)
    console.log('[debug-llm] Model:', body.model)

    // Log messages in detail
    const messages = body.messages as Array<{ role: string; content?: string }> | undefined
    if (messages) {
      console.log('[debug-llm] Messages count:', messages.length)
      messages.forEach((m, i) => {
        console.log(`[debug-llm] Message[${i}]: role=${m.role}, content_length=${m.content?.length || 0}`)
        console.log(`[debug-llm] Message[${i}] content: ${m.content?.substring(0, 200) || 'empty'}`)
      })
    }

    // Check for user message
    const hasUserMessage = messages?.some(m => m.role === 'user')
    console.log('[debug-llm] Has user message:', hasUserMessage)

    // Log to Supabase for verification (fire and forget)
    supabase.from('debug_logs').insert({
      endpoint: 'debug-llm',
      call_number: callNumber,
      timestamp: timestamp,
      has_user_message: hasUserMessage,
      message_count: messages?.length || 0,
      body_length: bodyText.length,
      headers: JSON.stringify(headers),
      body_preview: bodyText.substring(0, 1000),
    }).then(() => {
      console.log('[debug-llm] Logged to Supabase')
    }).catch((err) => {
      console.error('[debug-llm] Supabase log error:', err)
    })

    // Build response
    const responseText = hasUserMessage
      ? `Debug endpoint call #${callNumber}: I received your message! Processed in ${Date.now() - startTime}ms.`
      : `Debug endpoint call #${callNumber}: Initial greeting at ${timestamp}.`

    const id = `chatcmpl-debug-${callNumber}`
    const created = Math.floor(Date.now() / 1000)

    // Build minimal SSE response
    const sseLines = [
      `data: ${JSON.stringify({
        id,
        object: 'chat.completion.chunk',
        created,
        model: 'debug-llm',
        choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
      })}`,
      '',
      `data: ${JSON.stringify({
        id,
        object: 'chat.completion.chunk',
        created,
        model: 'debug-llm',
        choices: [{ index: 0, delta: { content: responseText }, finish_reason: null }],
      })}`,
      '',
      `data: ${JSON.stringify({
        id,
        object: 'chat.completion.chunk',
        created,
        model: 'debug-llm',
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
      })}`,
      '',
      'data: [DONE]',
      '',
    ]

    const sseBody = sseLines.join('\n')
    console.log('[debug-llm] Response ready in', Date.now() - startTime, 'ms')
    console.log('[debug-llm] Response length:', sseBody.length)
    console.log(`${'='.repeat(80)}\n`)

    return new Response(sseBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('[debug-llm] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}
