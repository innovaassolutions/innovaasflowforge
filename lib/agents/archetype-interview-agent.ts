/**
 * Archetype Interview Agent
 *
 * AI-facilitated leadership archetype discovery following
 * the constitution and question flow from archetype-constitution.ts.
 *
 * Story: 3-3-registration-sessions
 *
 * FIXED: 2026-01-12
 * - Added robust selection parsing to avoid false positives (e.g., "a" as article)
 * - Added response storage to track answers for scoring
 * - Fixed premature completion (was using >= instead of checking phase)
 * - Added support for ranked selections (most + second most)
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  ArchetypeSessionState,
  ArchetypeResponse,
  SurveyQuestion,
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
  usage?: {
    input_tokens: number
    output_tokens: number
    model: string
  }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Result of parsing user's selection from their message
 */
interface ParsedSelection {
  detected: boolean
  most_like_me: 'A' | 'B' | 'C' | 'D' | 'E' | null
  second_most_like_me: 'A' | 'B' | 'C' | 'D' | 'E' | null
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Parse user's selection from their message with robust pattern matching.
 * Avoids false positives from casual mentions of letters (e.g., "a" as article).
 */
function parseUserSelection(
  userMessage: string,
  question: SurveyQuestion
): ParsedSelection {
  const msg = userMessage.trim()
  const msgLower = msg.toLowerCase()

  // Pattern 1: Just letter(s) at end of message - "A" or "B and C" or "A, B"
  // Must be the primary content, not buried in a sentence
  const endLetterPattern = /\b([A-E])(?:\s*(?:and|then|,|&)\s*([A-E]))?\s*[.!?]?\s*$/i
  const endMatch = msg.match(endLetterPattern)

  // Pattern 2: Explicit choice phrases - "I choose A", "Option B", "My answer is C"
  const choicePattern = /(?:i\s+)?(?:choose|pick|select|go\s+with|say|think)\s+(?:option\s+)?([A-E])\b/i
  const choiceMatch = msg.match(choicePattern)

  // Pattern 3: "option A" or "answer A" standalone
  const optionPattern = /\b(?:option|answer|choice)\s+([A-E])\b/i
  const optionMatch = msg.match(optionPattern)

  // Pattern 4: Ranked selection - "B is most like me, D is second" or "B first, D second"
  const rankedPattern = /([A-E])\s+(?:is\s+)?(?:most|first|#1|number\s+one).*?([A-E])\s+(?:is\s+)?(?:second|next|#2|number\s+two)/i
  const rankedMatch = msg.match(rankedPattern)

  // Pattern 5: Reverse ranked - "most like me is B, second is D"
  const reverseRankedPattern = /(?:most|first).*?(?:is\s+)?([A-E]).*?(?:second|next).*?(?:is\s+)?([A-E])/i
  const reverseRankedMatch = msg.match(reverseRankedPattern)

  // Pattern 6: Two letters with "and" - "A and B" or "B & D" (for ranked questions)
  const twoLettersPattern = /\b([A-E])\s*(?:and|&|,)\s*([A-E])\b/i
  const twoLettersMatch = msg.match(twoLettersPattern)

  // Pattern 7: Single letter at START of message (common quick response)
  const startLetterPattern = /^([A-E])\b/i
  const startMatch = msg.match(startLetterPattern)

  // Pattern 8: Contains substantial option text (at least 25 chars to avoid false positives)
  const textMatches: Array<{ key: 'A' | 'B' | 'C' | 'D' | 'E', matchLength: number }> = []
  for (const opt of question.options) {
    const optTextLower = opt.text.toLowerCase()
    // Check for significant substring match (25+ chars or 50%+ of option text)
    const minMatchLength = Math.min(25, Math.floor(optTextLower.length * 0.5))
    if (optTextLower.length >= minMatchLength) {
      const searchText = optTextLower.slice(0, minMatchLength)
      if (msgLower.includes(searchText)) {
        textMatches.push({ key: opt.key, matchLength: searchText.length })
      }
    }
  }
  // Sort by match length descending and take the best match
  textMatches.sort((a, b) => b.matchLength - a.matchLength)

  // Evaluate patterns in order of confidence

  // Ranked patterns (highest confidence for ranked questions)
  if (rankedMatch) {
    return {
      detected: true,
      most_like_me: rankedMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      second_most_like_me: rankedMatch[2].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      confidence: 'high'
    }
  }

  if (reverseRankedMatch) {
    return {
      detected: true,
      most_like_me: reverseRankedMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      second_most_like_me: reverseRankedMatch[2].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      confidence: 'high'
    }
  }

  // Two letters with connector (good for ranked)
  if (twoLettersMatch) {
    return {
      detected: true,
      most_like_me: twoLettersMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      second_most_like_me: twoLettersMatch[2].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      confidence: 'high'
    }
  }

  // End of message letter(s) - high confidence
  if (endMatch && endMatch[1]) {
    return {
      detected: true,
      most_like_me: endMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      second_most_like_me: endMatch[2]?.toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E' | null || null,
      confidence: 'high'
    }
  }

  // Start of message letter - high confidence (quick response like "B")
  if (startMatch && msg.length < 20) {
    return {
      detected: true,
      most_like_me: startMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      second_most_like_me: null,
      confidence: 'high'
    }
  }

  // Explicit choice phrase
  if (choiceMatch) {
    return {
      detected: true,
      most_like_me: choiceMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      second_most_like_me: null,
      confidence: 'medium'
    }
  }

  // Option/answer phrase
  if (optionMatch) {
    return {
      detected: true,
      most_like_me: optionMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
      second_most_like_me: null,
      confidence: 'medium'
    }
  }

  // Text match (lowest confidence)
  if (textMatches.length > 0) {
    return {
      detected: true,
      most_like_me: textMatches[0].key,
      second_most_like_me: textMatches.length > 1 ? textMatches[1].key : null,
      confidence: 'low'
    }
  }

  // No valid selection detected
  return {
    detected: false,
    most_like_me: null,
    second_most_like_me: null,
    confidence: 'low'
  }
}

/**
 * Determine the phase for a given question index
 */
function getPhaseForQuestionIndex(index: number): ArchetypeSessionState['phase'] {
  if (index <= 0) return 'opening'
  if (index <= 3) return 'context'
  if (index <= 12) return 'default_mode'
  if (index <= 16) return 'authentic_mode'
  if (index <= 19) return 'friction_signals'
  return 'closing'
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
    const model = 'claude-sonnet-4-20250514'
    const response = await anthropic.messages.create({
      model,
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
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        model,
      },
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
    sections.push('Ranked selection: ask for MOST like them, then SECOND most like them.')
    sections.push('DO NOT ask for examples or stories - just collect their two selections and move to the next question.')
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
    sections.push('Same ranked format: ask for MOST like them, then SECOND most like them.')
    sections.push('DO NOT ask for examples or stories - just collect their two selections and move to the next question.')
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
    sections.push('Single-select: ask them to pick ONE option that resonates most.')
    sections.push('DO NOT ask for elaboration - just collect their selection and move to the next question.')
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

  // Output format
  sections.push('')
  sections.push('RESPONSE FORMAT:')
  sections.push('Respond conversationally but efficiently. Do not use markdown formatting.')
  sections.push('Keep responses brief and warm - acknowledge their answer, then move to the next question.')
  sections.push('One question at a time. Do NOT ask follow-up questions or request stories/examples.')
  sections.push('CRITICAL: This is a survey-style assessment. Collect answers quickly without probing.')

  return sections.join('\n')
}

/**
 * Update session state based on conversation.
 *
 * This function:
 * 1. Parses user selections using robust pattern matching
 * 2. Stores responses for later scoring
 * 3. Handles both single-select and ranked questions
 * 4. Advances through phases appropriately
 */
function updateSessionState(
  state: ArchetypeSessionState,
  userMessage: string | null,
  assistantMessage: string
): ArchetypeSessionState {
  // Deep clone state to avoid mutations
  const newState: ArchetypeSessionState = {
    ...state,
    responses: { ...state.responses },
    stories_captured: [...state.stories_captured],
    context: { ...state.context },
    scores: {
      default: { ...state.scores.default },
      authentic: { ...state.scores.authentic },
      friction: { ...state.scores.friction },
    },
  }

  // Handle opening phase - transition after AI delivers greeting
  if (state.phase === 'opening') {
    // The AI has delivered the opening greeting, move to first question
    newState.phase = 'context'
    newState.current_question_index = 1
    return newState
  }

  // Handle closing phase - transition to completed after closing message delivered
  if (state.phase === 'closing') {
    newState.phase = 'completed'
    return newState
  }

  // No user message means nothing to process
  if (!userMessage) {
    return newState
  }

  // Get current question
  const currentQ = getQuestionByIndex(state.current_question_index)
  if (!currentQ) {
    return newState
  }

  // Parse the user's selection
  const parsed = parseUserSelection(userMessage, currentQ)

  // If no valid selection detected, don't advance
  // The AI will re-prompt for the answer
  if (!parsed.detected || !parsed.most_like_me) {
    return newState
  }

  // For ranked questions (Q4-Q16), we need both selections
  if (currentQ.selection_type === 'ranked') {
    if (!parsed.second_most_like_me) {
      // Only got first selection - store partial and wait for second
      // Check if we already have a partial response
      const existingResponse = state.responses[currentQ.id]
      if (existingResponse?.most_like_me && !existingResponse.second_most_like_me) {
        // We had first choice, this might be the second
        // Treat the new selection as second choice
        newState.responses[currentQ.id] = {
          question_id: currentQ.id,
          most_like_me: existingResponse.most_like_me,
          second_most_like_me: parsed.most_like_me,
        }
      } else {
        // Store as partial response - waiting for second choice
        newState.responses[currentQ.id] = {
          question_id: currentQ.id,
          most_like_me: parsed.most_like_me,
          second_most_like_me: null,
        }
        // Don't advance - AI will prompt for second choice
        return newState
      }
    } else {
      // Got both selections
      newState.responses[currentQ.id] = {
        question_id: currentQ.id,
        most_like_me: parsed.most_like_me,
        second_most_like_me: parsed.second_most_like_me,
      }
    }
  } else {
    // Single-select question (context Q1-Q3, friction Q17-Q19)
    newState.responses[currentQ.id] = {
      question_id: currentQ.id,
      most_like_me: parsed.most_like_me,
      second_most_like_me: null,
    }
  }

  // Advance to next question
  const nextIndex = state.current_question_index + 1
  const totalQuestions = getTotalQuestions()

  if (nextIndex > totalQuestions) {
    // All questions answered, move to closing
    newState.phase = 'closing'
    newState.current_question_index = totalQuestions
  } else {
    // Move to next question and update phase
    newState.current_question_index = nextIndex
    newState.phase = getPhaseForQuestionIndex(nextIndex)
  }

  return newState
}

/**
 * Check if the interview is complete.
 *
 * FIXED: Previously used `>= getTotalQuestions()` which caused premature completion
 * when reaching question 19 (before it was answered).
 * Now only returns true when phase is 'completed' (after closing message delivered).
 */
function checkCompletion(state: ArchetypeSessionState): boolean {
  return state.phase === 'completed'
}

/**
 * Get archetype details for results display
 */
export function getArchetypeDetails(archetype: string) {
  return ARCHETYPES[archetype as keyof typeof ARCHETYPES]
}
