/**
 * Create a Custom LLM agent using Node.js runtime endpoint
 */
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1'

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY not set')
    process.exit(1)
  }

  const requestBody = {
    name: 'FlowForge Node.js LLM Test',
    conversation_config: {
      agent: {
        first_message: 'Hello from Node.js! This endpoint runs on Vercel serverless.',
        language: 'en',
        prompt: {
          prompt: 'You are a test assistant.\n\nCONTEXT:\nsession_token: {{session_token}}',
          llm: 'custom-llm',
          temperature: 0.7,
          max_tokens: 1024,
          custom_llm: {
            url: 'https://innovaasflowforge.vercel.app/api/voice/node-llm',
            model_id: 'node-llm',
            api_type: 'chat_completions'
          }
        },
        dynamic_variables: {
          dynamic_variable_placeholders: {
            session_token: 'test'
          }
        }
      },
      tts: {
        voice_id: 'l4Coq6695JDX9xtLqXDE',
        model_id: 'eleven_turbo_v2',
        stability: 0.5,
        similarity_boost: 0.8,
      },
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
      },
      turn: {
        turn_timeout: 30,
        turn_eagerness: 'patient',
      },
      conversation: {
        max_duration_seconds: 600,
        text_only: false,
      },
    },
  }

  console.log('Creating Node.js Custom LLM agent...')
  console.log('URL:', requestBody.conversation_config.agent.prompt.custom_llm.url)

  const response = await fetch(`${ELEVENLABS_API_BASE}/convai/agents/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error:', response.status, errorText)
    process.exit(1)
  }

  const result = await response.json()
  console.log('\n✓ Agent created!')
  console.log('Agent ID:', result.agent_id)
  console.log('\nUpdate test-session route to use this agent ID:', result.agent_id)
}

main().catch(console.error)
