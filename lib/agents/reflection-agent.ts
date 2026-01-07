/**
 * Reflection Agent
 *
 * AI-facilitated post-results reflection for leadership archetype discovery.
 * Generates contextual questions based on participant's archetype results
 * and facilitates a brief (2-3 exchange) reflection conversation.
 *
 * Story: 1.2 Reflection Flow
 */

import Anthropic from '@anthropic-ai/sdk'
import { ARCHETYPES, type Archetype } from './archetype-constitution'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ReflectionTenantContext {
  display_name: string
  brand_config: {
    welcomeMessage?: string
    completionMessage?: string
  }
}

export interface ArchetypeResultsContext {
  default_archetype: Archetype
  authentic_archetype: Archetype
  is_aligned: boolean
  scores: {
    default: Record<Archetype, number>
    authentic: Record<Archetype, number>
    friction: Record<Archetype, number>
  }
}

export interface ReflectionState {
  phase: 'opening' | 'conversation' | 'closing' | 'completed'
  exchange_count: number
  is_complete: boolean
}

export interface ReflectionMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ReflectionAgentResponse {
  message: string
  state: ReflectionState
  isComplete: boolean
}

/**
 * Process a message in the reflection conversation
 */
export async function processReflectionMessage(
  userMessage: string | null,
  currentState: ReflectionState | null,
  conversationHistory: ReflectionMessage[],
  archetypeResults: ArchetypeResultsContext,
  tenant: ReflectionTenantContext,
  participantName: string
): Promise<ReflectionAgentResponse> {
  // Initialize state if needed
  const state: ReflectionState = currentState || {
    phase: 'opening',
    exchange_count: 0,
    is_complete: false,
  }

  // Build system prompt
  const systemPrompt = buildReflectionSystemPrompt(
    state,
    archetypeResults,
    tenant,
    participantName
  )

  // Build messages for Claude
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    })
  }

  // Add current user message if provided
  if (userMessage) {
    messages.push({
      role: 'user',
      content: userMessage,
    })
  }

  // If no messages yet, trigger opening with reflection questions
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: '[Session started - please provide opening reflection questions]',
    })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Update state based on conversation
    const newState = updateReflectionState(state, userMessage, assistantMessage)

    return {
      message: assistantMessage,
      state: newState,
      isComplete: newState.is_complete,
    }
  } catch (error) {
    console.error('Reflection agent error:', error)
    throw new Error('Failed to generate reflection response')
  }
}

/**
 * Build the system prompt for reflection
 */
function buildReflectionSystemPrompt(
  state: ReflectionState,
  results: ArchetypeResultsContext,
  tenant: ReflectionTenantContext,
  participantName: string
): string {
  const sections: string[] = []

  // Get archetype details
  const defaultArchetype = ARCHETYPES[results.default_archetype]
  const authenticArchetype = ARCHETYPES[results.authentic_archetype]
  const hasTension = !results.is_aligned

  // Core identity
  sections.push(`You are a warm, thoughtful leadership reflection guide.`)
  sections.push(`The participant is ${participantName}.`)
  sections.push(`This reflection session is facilitated by ${tenant.display_name}.`)
  sections.push('')

  // Role and stance
  sections.push('YOUR ROLE:')
  sections.push('- Help the participant reflect on their archetype assessment results')
  sections.push('- Ask open-ended questions that invite deeper self-awareness')
  sections.push('- Be warm, curious, and non-judgmental')
  sections.push('- This is reflection, not therapy or coaching')
  sections.push('- The goal is insight and self-discovery, not fixing or diagnosing')
  sections.push('')

  // Tone
  sections.push('TONE:')
  sections.push('- Warm but professional')
  sections.push('- Normalizing ("these patterns make sense")')
  sections.push('- Reflective ("I hear that...")')
  sections.push('- Curious without being clinical')
  sections.push('- Brief acknowledgments, not lengthy validations')
  sections.push('')

  // Participant's archetype results
  sections.push('PARTICIPANT ARCHETYPE RESULTS:')
  sections.push(`Default Archetype (under pressure): ${defaultArchetype.name}`)
  sections.push(`- ${defaultArchetype.under_pressure}`)
  sections.push(`- Core traits: ${defaultArchetype.core_traits.join(', ')}`)
  sections.push('')
  sections.push(`Authentic Archetype (when grounded): ${authenticArchetype.name}`)
  sections.push(`- ${authenticArchetype.when_grounded}`)
  sections.push(`- Core traits: ${authenticArchetype.core_traits.join(', ')}`)
  sections.push('')

  if (hasTension) {
    sections.push('TENSION PATTERN:')
    sections.push(`This participant has a tension pattern - their default response under pressure (${defaultArchetype.name}) differs from what energizes them when grounded (${authenticArchetype.name}).`)
    sections.push('This is common and represents adaptive strategies developed over time.')
    sections.push('')
    sections.push('Potential triggers to explore:')
    defaultArchetype.overuse_signals.forEach((signal) =>
      sections.push(`- ${signal}`)
    )
    sections.push('')
  } else {
    sections.push('ALIGNMENT:')
    sections.push(`This participant is aligned - their ${defaultArchetype.name} archetype shows up both under pressure and when grounded.`)
    sections.push('This suggests consistency in their leadership approach.')
    sections.push('')
  }

  // Phase-specific instructions
  sections.push('CONVERSATION STATE:')
  sections.push(`Phase: ${state.phase}`)
  sections.push(`Exchange count: ${state.exchange_count} of 2-3`)
  sections.push('')

  if (state.phase === 'opening') {
    sections.push('CURRENT TASK: Opening with Reflection Questions')
    sections.push('')
    sections.push('Generate 2-3 thoughtful reflection questions based on their results.')
    sections.push('')
    sections.push('If they have a tension pattern, questions should explore:')
    sections.push('1. How the tension pattern shows up in their daily work')
    sections.push('2. What situations trigger the default response')
    sections.push('3. What one small shift might feel possible')
    sections.push('')
    sections.push('If they are aligned, questions should explore:')
    sections.push('1. How this archetype serves them in their leadership')
    sections.push('2. When they notice this pattern most strongly')
    sections.push('3. What helps them stay in this grounded state')
    sections.push('')
    sections.push('Start with a brief warm acknowledgment of their results, then present questions.')
    sections.push('Invite them to respond to whichever question(s) resonate most.')
  } else if (state.phase === 'conversation') {
    sections.push('CURRENT TASK: Continue Reflection Conversation')
    sections.push('')
    sections.push('Acknowledge their response warmly and briefly.')
    sections.push('You may ask 1-2 follow-up questions if appropriate.')
    sections.push('Keep responses concise - this is about their reflection, not your analysis.')
    sections.push('')
    if (state.exchange_count >= 2) {
      sections.push('We are nearing the end of the reflection (2-3 exchanges max).')
      sections.push('Consider wrapping up with a closing message.')
    }
  } else if (state.phase === 'closing') {
    sections.push('CURRENT TASK: Wrap Up Reflection')
    sections.push('')
    sections.push('Thank them for their reflections.')
    sections.push('Briefly affirm what you heard as valuable.')
    sections.push('Let them know these insights will be included in their results.')
    sections.push('End warmly and encourage them to discuss with their coach.')
  }

  // Output format
  sections.push('')
  sections.push('RESPONSE FORMAT:')
  sections.push('- Respond conversationally, not in markdown')
  sections.push('- Keep responses focused and warm')
  sections.push('- No bullet points or numbered lists in opening questions - use natural prose')
  sections.push('- Use line breaks between questions for readability')
  sections.push('- Maximum 200 words per response')

  return sections.join('\n')
}

/**
 * Update reflection state based on conversation
 */
function updateReflectionState(
  state: ReflectionState,
  userMessage: string | null,
  _assistantMessage: string
): ReflectionState {
  const newState = { ...state }

  if (state.phase === 'opening') {
    // After opening, move to conversation phase
    newState.phase = 'conversation'
    // The opening counts as the first AI message, but not an exchange
    // An exchange is: user responds + AI responds
  } else if (userMessage && state.phase === 'conversation') {
    // User responded, increment exchange count
    newState.exchange_count = state.exchange_count + 1

    // After 2-3 exchanges, move to closing
    if (newState.exchange_count >= 3) {
      newState.phase = 'closing'
    } else if (newState.exchange_count >= 2) {
      // After 2 exchanges, the AI should start wrapping up
      // The system prompt will guide this
    }
  } else if (state.phase === 'closing') {
    // After closing message, mark as complete
    newState.is_complete = true
    newState.phase = 'completed'
  }

  return newState
}

/**
 * Create initial reflection state
 */
export function createInitialReflectionState(): ReflectionState {
  return {
    phase: 'opening',
    exchange_count: 0,
    is_complete: false,
  }
}
