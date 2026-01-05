/**
 * Archetype Interview Agent
 *
 * AI-facilitated leadership archetype discovery following
 * the constitution and question flow from archetype-constitution.ts.
 *
 * Story: 3-3-registration-sessions
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  ArchetypeSessionState,
  createInitialSessionState,
  generateArchetypeSystemPrompt,
  calculateResults,
  getQuestionByIndex,
  getTotalQuestions,
  ARCHETYPE_CONSTITUTION,
  ARCHETYPES,
} from './archetype-constitution'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface TenantContext {
  display_name: string
  brand_config: {
    welcomeMessage?: string
    completionMessage?: string
  }
}

export interface AgentResponse {
  message: string
  sessionState: ArchetypeSessionState
  isComplete: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Process a message in the archetype interview
 */
export async function processArchetypeMessage(
  userMessage: string | null,
  currentState: ArchetypeSessionState | null,
  conversationHistory: Message[],
  tenant: TenantContext,
  participantName: string
): Promise<AgentResponse> {
  // Initialize state if needed
  const state = currentState || createInitialSessionState()

  // Build system prompt
  const systemPrompt = buildSystemPrompt(state, tenant, participantName)

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

  // If no messages yet, trigger opening greeting
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: '[Session started - please provide the opening greeting]',
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

    // Update session state based on conversation
    const newState = updateSessionState(state, userMessage, assistantMessage)

    // Check if interview is complete
    const isComplete = checkCompletion(newState)

    if (isComplete && !newState.default_archetype) {
      // Calculate final results
      const results = calculateResults(newState)
      newState.default_archetype = results.default_archetype
      newState.authentic_archetype = results.authentic_archetype
      newState.is_aligned = results.is_aligned
      newState.scores = results.scores
    }

    return {
      message: assistantMessage,
      sessionState: newState,
      isComplete,
    }
  } catch (error) {
    console.error('Archetype agent error:', error)
    throw new Error('Failed to generate response')
  }
}

/**
 * Build the system prompt with current state context
 */
function buildSystemPrompt(
  state: ArchetypeSessionState,
  tenant: TenantContext,
  participantName: string
): string {
  const sections: string[] = []

  // Core identity
  sections.push(`You are conducting a Leadership Archetype Discovery session.`)
  sections.push(`The participant is ${participantName}.`)
  sections.push(`This session is facilitated by ${tenant.display_name}.`)
  sections.push('')

  // Role from constitution
  const role = ARCHETYPE_CONSTITUTION.role
  sections.push('YOUR ROLE:')
  sections.push(`Identity: ${role.identity}`)
  sections.push(`Stance: ${role.stance}`)
  sections.push('')
  sections.push('You ARE:')
  role.you_are.forEach((item) => sections.push(`- ${item}`))
  sections.push('')
  sections.push('You are NOT:')
  role.you_are_not.forEach((item) => sections.push(`- ${item}`))
  sections.push('')

  // Tone
  const tone = ARCHETYPE_CONSTITUTION.tone
  sections.push('TONE:')
  sections.push(tone.qualities.join(', '))
  sections.push('')
  sections.push('Good examples:')
  tone.good_examples.slice(0, 3).forEach((ex) => sections.push(`- "${ex}"`))
  sections.push('')

  // Current phase and progress
  sections.push('SESSION STATE:')
  sections.push(`Phase: ${state.phase}`)
  sections.push(`Question index: ${state.current_question_index} of ${getTotalQuestions()}`)
  sections.push('')

  // Phase-specific instructions
  if (state.phase === 'opening') {
    const welcomeMessage = tenant.brand_config.welcomeMessage ||
      'Welcome to your Leadership Archetype Assessment. This conversation will help you discover your authentic leadership style and how it shows up under pressure.'
    sections.push('CURRENT TASK: Opening')
    sections.push('Greet the participant warmly and introduce the session.')
    sections.push(`Use this welcome message as inspiration: "${welcomeMessage}"`)
    sections.push('Explain that there are 19 questions across 4 sections.')
    sections.push('Emphasize there are no right or wrong answers.')
    sections.push('After the greeting, transition to the first context question.')
  } else if (state.phase === 'context') {
    sections.push('CURRENT TASK: Context Questions (Q1-Q3)')
    sections.push('These questions gather context about the participant\'s role.')
    sections.push('Single-select: ask them to pick ONE option that fits best.')
    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('')
      sections.push(`Current Question: ${question.stem}`)
      sections.push('Options:')
      question.options.forEach((opt) => sections.push(`  ${opt.key}. ${opt.text}`))
    }
  } else if (state.phase === 'default_mode') {
    sections.push('CURRENT TASK: Default Mode Questions (Q4-Q12)')
    sections.push('These questions explore how the participant responds under pressure.')
    sections.push('Ranked selection: ask for MOST like them, then SECOND most.')
    sections.push('After their selection, probe for a real example or story.')
    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('')
      sections.push(`Current Question: ${question.stem}`)
      sections.push('Options:')
      question.options.forEach((opt) => sections.push(`  ${opt.key}. ${opt.text}`))
    }
  } else if (state.phase === 'authentic_mode') {
    sections.push('CURRENT TASK: Authentic Mode Questions (Q13-Q16)')
    sections.push('These questions explore leadership when grounded and at their best.')
    sections.push('Same ranked format: MOST like them, then SECOND most.')
    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('')
      sections.push(`Current Question: ${question.stem}`)
      sections.push('Options:')
      question.options.forEach((opt) => sections.push(`  ${opt.key}. ${opt.text}`))
    }
  } else if (state.phase === 'friction_signals') {
    sections.push('CURRENT TASK: Friction Signal Questions (Q17-Q19)')
    sections.push('These questions identify what is currently draining the participant.')
    sections.push('Single-select: ask them to pick ONE that resonates most.')
    sections.push('These can be tender - be extra gentle and normalizing.')
    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('')
      sections.push(`Current Question: ${question.stem}`)
      sections.push('Options:')
      question.options.forEach((opt) => sections.push(`  ${opt.key}. ${opt.text}`))
    }
  } else if (state.phase === 'closing') {
    sections.push('CURRENT TASK: Closing')
    sections.push('Thank the participant for their thoughtful responses.')
    sections.push('Let them know their results will be available shortly.')
    sections.push('The coach will be in touch to discuss their archetype pattern.')
  }

  // Story probing reminders
  if (['default_mode', 'authentic_mode'].includes(state.phase)) {
    sections.push('')
    sections.push('STORY PROBING:')
    sections.push('After they select their options, ask for a concrete example:')
    ARCHETYPE_CONSTITUTION.story_probing.prompts.default_mode.forEach((p) =>
      sections.push(`- "${p}"`)
    )
  }

  // Output format
  sections.push('')
  sections.push('RESPONSE FORMAT:')
  sections.push('Respond conversationally. Do not use markdown formatting.')
  sections.push('Keep responses focused and warm.')
  sections.push('One question at a time. Do not overwhelm with multiple questions.')

  return sections.join('\n')
}

/**
 * Update session state based on conversation
 */
function updateSessionState(
  state: ArchetypeSessionState,
  userMessage: string | null,
  assistantMessage: string
): ArchetypeSessionState {
  const newState = { ...state }

  // Detect phase transitions and question progress
  // This is a simplified heuristic - in production, we'd parse responses more carefully

  if (state.phase === 'opening') {
    // After opening greeting, move to context
    newState.phase = 'context'
    newState.current_question_index = 1
  } else if (userMessage) {
    // User responded, potentially advance to next question
    const currentQ = getQuestionByIndex(state.current_question_index)

    if (currentQ) {
      // Check if this looks like a question response (contains A, B, C, D, or E reference)
      const hasSelection = /\b[A-E]\b/i.test(userMessage) ||
        currentQ.options.some(opt =>
          userMessage.toLowerCase().includes(opt.text.toLowerCase().slice(0, 20))
        )

      if (hasSelection) {
        // Move to next question
        const nextIndex = state.current_question_index + 1

        if (nextIndex > getTotalQuestions()) {
          newState.phase = 'closing'
          newState.current_question_index = getTotalQuestions()
        } else if (nextIndex > 16) {
          newState.phase = 'friction_signals'
          newState.current_question_index = nextIndex
        } else if (nextIndex > 12) {
          newState.phase = 'authentic_mode'
          newState.current_question_index = nextIndex
        } else if (nextIndex > 3) {
          newState.phase = 'default_mode'
          newState.current_question_index = nextIndex
        } else {
          newState.phase = 'context'
          newState.current_question_index = nextIndex
        }
      }
    }
  }

  return newState
}

/**
 * Check if the interview is complete
 */
function checkCompletion(state: ArchetypeSessionState): boolean {
  return state.phase === 'closing' || state.current_question_index >= getTotalQuestions()
}

/**
 * Get archetype details for results display
 */
export function getArchetypeDetails(archetype: string) {
  return ARCHETYPES[archetype as keyof typeof ARCHETYPES]
}
