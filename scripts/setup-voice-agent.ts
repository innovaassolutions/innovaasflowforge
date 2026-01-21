/**
 * ElevenLabs Voice Agent Setup Script
 *
 * Creates or updates an ElevenLabs Conversational AI agent with proper
 * Custom LLM configuration for FlowForge voice interviews.
 *
 * Usage:
 *   npx tsx scripts/setup-voice-agent.ts [--env production|preview|local]
 *
 * Environment variables required:
 *   - ELEVENLABS_API_KEY: Your ElevenLabs API key
 *   - ELEVENLABS_LLM_SECRET: Secret for Custom LLM authorization
 *
 * The script will:
 *   1. Detect the target environment
 *   2. Create a new agent with Custom LLM configured
 *   3. Output the agent ID for use in your environment variables
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ============================================================================
// Configuration
// ============================================================================

interface EnvironmentConfig {
  name: string
  baseUrl: string
  llmEndpoint: string
}

const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  production: {
    name: 'Production',
    baseUrl: 'https://flowforge.innovaas.co',
    llmEndpoint: 'https://flowforge.innovaas.co/api/voice/chat/completions',
  },
  preview: {
    name: 'Preview',
    baseUrl: 'https://innovaasflowforge.vercel.app',
    llmEndpoint:
      'https://innovaasflowforge.vercel.app/api/voice/chat/completions',
  },
  local: {
    name: 'Local Development',
    baseUrl: 'http://localhost:3000',
    llmEndpoint: 'http://localhost:3000/api/voice/chat/completions',
  },
}

// Voice configuration
const VOICE_CONFIG = {
  voiceId: 'l4Coq6695JDX9xtLqXDE', // Current Jippity voice
  modelId: 'eleven_turbo_v2', // Higher quality TTS model for English
  stability: 0.5,
  similarityBoost: 0.8,
  speed: 1.0,
}

// System prompt template with dynamic variable placeholders
// NOTE: Variable format (session_token:, module_id:, etc.) must match regex patterns
// in /api/voice/chat/completions/route.ts parseSessionContext()
const SYSTEM_PROMPT = `You are Jippity, a friendly and professional AI interviewer for FlowForge education assessments.

CONTEXT FROM FLOWFORGE:
session_token: {{session_token}}
module_id: {{module_id}}
vertical_key: {{vertical_key}}
stakeholder_name: {{stakeholder_name}}

YOUR ROLE:
You are conducting a voice interview to gather insights from educational stakeholders. Your responses should be warm, professional, and conversational.

IMPORTANT INSTRUCTIONS:
1. The FlowForge Custom LLM endpoint handles all interview logic
2. Your responses come FROM the Custom LLM - just speak them naturally
3. Keep a conversational, supportive tone appropriate for education contexts
4. Listen actively and respond empathetically to participant concerns

The Custom LLM endpoint will provide your actual responses based on the interview structure and participant context.`

// ============================================================================
// ElevenLabs API Client
// ============================================================================

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1'

async function createAgent(
  env: EnvironmentConfig,
  llmSecret: string
): Promise<{ agentId: string; name: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set')
  }

  const agentName = `FlowForge Interviewer (${env.name})`

  console.log(`\nCreating agent: ${agentName}`)
  console.log(`Custom LLM endpoint: ${env.llmEndpoint}`)

  const requestBody = {
    name: agentName,
    conversation_config: {
      agent: {
        // Use a placeholder first message - will be overridden by client
        // Having a non-empty value ensures ElevenLabs knows this is a conversational agent
        first_message: 'Hello! I am ready to begin our conversation.',
        language: 'en',
        prompt: {
          prompt: SYSTEM_PROMPT,
          llm: 'custom-llm', // Note: hyphen, not underscore
          temperature: 0.7,
          max_tokens: 1024,
          custom_llm: {
            url: env.llmEndpoint,
            model_id: 'flowforge-education',
            api_type: 'chat_completions',
            request_headers: {
              Authorization: `Bearer ${llmSecret}`,
            },
          },
          // Removed ignore_default_personality - was causing issues with conversation flow
        },
        // Dynamic variables are simple string placeholders
        dynamic_variables: {
          dynamic_variable_placeholders: {
            session_token: 'unknown',
            module_id: 'default',
            vertical_key: 'education',
            stakeholder_name: 'participant',
          },
        },
      },
      tts: {
        voice_id: VOICE_CONFIG.voiceId,
        model_id: VOICE_CONFIG.modelId,
        stability: VOICE_CONFIG.stability,
        similarity_boost: VOICE_CONFIG.similarityBoost,
        speed: VOICE_CONFIG.speed,
        optimize_streaming_latency: 3,
      },
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
      },
      turn: {
        turn_timeout: 30, // Increased from 10 to match working test agent
        turn_eagerness: 'patient', // Changed from 'normal' for better conversation flow
      },
      conversation: {
        max_duration_seconds: 1800, // 30 minutes max
        text_only: false,
      },
    },
    platform_settings: {
      overrides: {
        conversation_config_override: {
          agent: {
            first_message: true, // Allow first message override
            language: true, // Allow language override
          },
        },
      },
      privacy: {
        record_voice: false,
        retention_days: 30,
      },
    },
  }

  console.log('\nSending request to ElevenLabs...')

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
    console.error('API Error Response:', errorText)
    throw new Error(
      `Failed to create agent: ${response.status} ${response.statusText}\n${errorText}`
    )
  }

  const result = await response.json()
  return {
    agentId: result.agent_id,
    name: agentName,
  }
}

async function listAgents(): Promise<
  Array<{ agent_id: string; name: string }>
> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set')
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/convai/agents`, {
    headers: {
      'xi-api-key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to list agents: ${response.status}`)
  }

  const result = await response.json()
  return result.agents || []
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log('=' .repeat(60))
  console.log('FlowForge Voice Agent Setup')
  console.log('=' .repeat(60))

  // Parse command line arguments
  const args = process.argv.slice(2)
  let targetEnv = 'production' // Default

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) {
      targetEnv = args[i + 1]
      i++
    }
  }

  if (!ENVIRONMENTS[targetEnv]) {
    console.error(`\nError: Unknown environment "${targetEnv}"`)
    console.log('Valid environments:', Object.keys(ENVIRONMENTS).join(', '))
    process.exit(1)
  }

  const env = ENVIRONMENTS[targetEnv]
  console.log(`\nTarget Environment: ${env.name}`)
  console.log(`Base URL: ${env.baseUrl}`)

  // Check required environment variables
  const apiKey = process.env.ELEVENLABS_API_KEY
  const llmSecret = process.env.ELEVENLABS_LLM_SECRET

  if (!apiKey) {
    console.error('\nError: ELEVENLABS_API_KEY is not set')
    console.log('Please set this in your .env.local file')
    process.exit(1)
  }

  if (!llmSecret) {
    console.error('\nError: ELEVENLABS_LLM_SECRET is not set')
    console.log('Please set this in your .env.local file')
    process.exit(1)
  }

  console.log(`\nAPI Key: ${apiKey.substring(0, 10)}...`)
  console.log(`LLM Secret: ${llmSecret.substring(0, 10)}... (${llmSecret.length} chars)`)

  // List existing agents
  console.log('\n--- Existing Agents ---')
  try {
    const agents = await listAgents()
    if (agents.length === 0) {
      console.log('No agents found')
    } else {
      agents.forEach((agent) => {
        console.log(`  - ${agent.name} (${agent.agent_id})`)
      })
    }
  } catch (error) {
    console.warn('Could not list agents:', error)
  }

  // Create new agent
  console.log('\n--- Creating New Agent ---')
  try {
    const { agentId, name } = await createAgent(env, llmSecret)

    console.log('\n' + '=' .repeat(60))
    console.log('SUCCESS!')
    console.log('=' .repeat(60))
    console.log(`\nAgent created successfully!`)
    console.log(`\nAgent Name: ${name}`)
    console.log(`Agent ID: ${agentId}`)
    console.log(`\n--- Next Steps ---`)
    console.log(`\n1. Update your environment variables:`)
    console.log(`   ELEVENLABS_AGENT_ID=${agentId}`)
    console.log(`\n2. For Vercel, add this to your project settings:`)
    console.log(`   Settings > Environment Variables > ELEVENLABS_AGENT_ID`)
    console.log(`\n3. Redeploy your application to use the new agent`)
  } catch (error) {
    console.error('\n--- Agent Creation Failed ---')
    console.error(error)
    process.exit(1)
  }
}

main().catch(console.error)
