/**
 * Create a test agent without Custom LLM but with proper turn settings
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
    name: 'FlowForge Test (With Turn Settings)',
    conversation_config: {
      agent: {
        first_message: 'Hello! This is a test conversation. I have a longer first message to make sure you can hear everything I say. How are you doing today?',
        language: 'en',
        prompt: {
          prompt: 'You are a friendly test assistant. Keep responses brief.',
          llm: 'gemini-2.0-flash-001',
          temperature: 0.7,
          max_tokens: 256,
        },
      },
      tts: {
        voice_id: 'cgSgspJ2msm6clMCkdW9', // Default voice
        model_id: 'eleven_turbo_v2',
        stability: 0.5,
        similarity_boost: 0.8,
      },
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
      },
      turn: {
        turn_timeout: 15, // 15 seconds to wait for response
        turn_eagerness: 'patient', // Less eager to interrupt
      },
      conversation: {
        max_duration_seconds: 300, // 5 minutes
        text_only: false,
      },
    },
    platform_settings: {
      overrides: {
        conversation_config_override: {
          agent: {
            first_message: true,
            language: true,
          },
        },
      },
      privacy: {
        record_voice: false,
        retention_days: 7,
      },
    },
  }

  console.log('Creating test agent with turn settings...')
  
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
  console.log('\nUpdate ELEVENLABS_AGENT_ID in Vercel to:', result.agent_id)
}

main().catch(console.error)
