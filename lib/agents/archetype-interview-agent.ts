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
  SurveyQuestion,
  createInitialSessionState,
  calculateResults,
  getQuestionByIndex,
  getTotalQuestions,
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

  // Build prefilled response for question phases to FORCE exact question text
  // This prevents the AI from substituting its own questions
  const prefill = buildAssistantPrefill(state, userMessage)

  try {
    const model = 'claude-sonnet-4-20250514'

    // If we have a prefill, add it as an assistant message to force continuation
    const messagesWithPrefill = prefill
      ? [...messages, { role: 'assistant' as const, content: prefill }]
      : messages

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messagesWithPrefill,
    })

    // Handle response - may be empty if prefill covered everything
    let generatedText = ''
    if (response.content && response.content.length > 0 && response.content[0].type === 'text') {
      generatedText = response.content[0].text
    }

    // Combine prefill with generated text
    const assistantMessage = prefill ? prefill + generatedText : generatedText

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
    console.error('Archetype agent error:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      phase: state.phase,
      currentQuestionIndex: state.current_question_index,
      hasPrefill: !!prefill,
      userMessageLength: userMessage?.length || 0,
    })
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build a prefilled assistant response to FORCE the exact question text.
 * This prevents the AI from substituting its own questions.
 *
 * When user answers question N, we present question N+1.
 * Returns null for closing/completed phases.
 */
function buildAssistantPrefill(
  state: ArchetypeSessionState,
  userMessage: string | null
): string | null {
  // Don't prefill for closing or completed phases
  if (state.phase === 'closing' || state.phase === 'completed') {
    return null
  }

  // Only prefill when user has provided a message
  if (!userMessage) {
    return null
  }

  let questionIndex: number

  // Special case: Opening phase - user confirmed ready, present Q1
  if (state.phase === 'opening') {
    questionIndex = 1
  } else {
    // User just answered current question, present the NEXT question
    questionIndex = state.current_question_index + 1
  }

  const totalQuestions = getTotalQuestions()

  // If no more questions, don't prefill (let AI handle closing)
  if (questionIndex > totalQuestions) {
    return null
  }

  const question = getQuestionByIndex(questionIndex)
  if (!question) {
    return null
  }

  // Build the exact question text
  const lines: string[] = []

  // Brief acknowledgment (skip for Q1 since opening message handles intro)
  if (state.phase !== 'opening') {
    lines.push('Thank you.')
    lines.push('')
  }

  // Add section transition messages at key points
  if (questionIndex === 4) {
    // Transition from Context (Q1-3) to Default Mode (Q4-12)
    lines.push('Now we\'ll move into questions about how you tend to respond when things get tense, overloaded, or high stakes.')
    lines.push('')
    lines.push('What you do instinctively matters more than what you intend. Think about what you ACTUALLY do, not what you think you should do.')
    lines.push('')
  } else if (questionIndex === 13) {
    // Transition from Default Mode to Authentic Mode
    lines.push('We\'ve explored how you tend to respond under pressure. Now let\'s shift.')
    lines.push('')
    lines.push('Think about moments when your leadership feels sustainable, effective, and true to you. When you feel confident, controlled, and fully aligned.')
    lines.push('')
  } else if (questionIndex === 17) {
    // Transition to Friction Signals
    lines.push('Now for the last few questions. These are about the parts of leadership that drain you right now.')
    lines.push('')
    lines.push('Answer based on what you thought and felt during a recent hard or demanding stretch.')
    lines.push('')
    lines.push('For these final three questions, just select the ONE option that resonates most.')
    lines.push('')
  }

  // Add selection format reminder for ranked questions (Q4-Q16)
  if (question.selection_type === 'ranked') {
    lines.push('Please select the option that is MOST like you, then the one that is SECOND most like you.')
    lines.push('')
  }

  // The exact question - THIS IS THE KEY PART THAT CANNOT BE CHANGED
  lines.push(`Question ${question.index}: ${question.stem}`)
  lines.push('')

  // All options exactly as defined
  question.options.forEach((opt) => {
    lines.push(`${opt.key.toLowerCase()}. ${opt.text}`)
  })

  // Add blank line after options to signal completion
  // This helps prevent AI from continuing to add more options
  lines.push('')

  return lines.join('\n')
}

/**
 * Build the system prompt with current state context.
 *
 * CRITICAL: This prompt must enforce STRICT survey administration.
 * Per Mark's feedback (2026-01-13):
 * - NO editorializing or judgment calls ("that makes sense", etc.)
 * - Questions MUST be presented in exact order with ALL options
 * - Selection format instructions MUST appear from Q4 onward
 * - Context framing ("under pressure" / "when grounded") MUST be explicit
 */
function buildSystemPrompt(
  state: ArchetypeSessionState,
  tenant: TenantContext,
  participantName: string
): string {
  const sections: string[] = []

  // Core identity - STRICT survey administrator
  sections.push(`You are administering the Leadership Archetypes Survey for ${tenant.display_name}.`)
  sections.push(`The participant is ${participantName}.`)
  sections.push('')

  // CRITICAL behavioral rules - STRICT COPY MODE
  sections.push('=== YOU ARE A QUESTION COPIER, NOT A QUESTION CREATOR ===')
  sections.push('')
  sections.push('YOUR ONLY JOB: Copy the EXACT question text I provide below. Do NOT think. Do NOT improve. Do NOT substitute.')
  sections.push('')
  sections.push('FAILURE EXAMPLES (what you must NEVER do):')
  sections.push('- WRONG: "Which best describes the size of your organization?" <-- FABRICATED')
  sections.push('- WRONG: "How many years of leadership experience do you have?" <-- FABRICATED')
  sections.push('- WRONG: Any question about organization size, years of experience, or demographics not listed below')
  sections.push('')
  sections.push('SUCCESS EXAMPLE:')
  sections.push('- RIGHT: Copy the EXACT text from the "COPY THIS QUESTION VERBATIM" section below')
  sections.push('')
  sections.push('THE SURVEY HAS EXACTLY 19 PRE-WRITTEN QUESTIONS. They are provided below.')
  sections.push('You are a human-readable display system. Your job is to COPY, not CREATE.')
  sections.push('')
  sections.push('BEHAVIORAL RULES:')
  sections.push('1. NO editorializing ("That makes sense", "Great choice", etc.)')
  sections.push('2. Acknowledge with ONLY "Thank you." or "Got it."')
  sections.push('3. Then COPY the exact question from the section marked "COPY THIS QUESTION VERBATIM"')
  sections.push('4. Include ALL options (a through e) exactly as written')
  sections.push('5. NO commentary, NO additional questions, NO elaboration')
  sections.push('')

  // Current phase and progress
  sections.push('=== SESSION STATE ===')
  sections.push(`Current Phase: ${state.phase}`)
  sections.push(`Question: ${state.current_question_index} of ${getTotalQuestions()}`)
  sections.push('')

  // Phase-specific instructions with EXACT transition messages
  if (state.phase === 'opening') {
    const welcomeMessage = tenant.brand_config.welcomeMessage ||
      `Welcome to the Leadership Archetypes Survey. I'm here to walk you through 19 questions that will help you understand how your leadership shows up under pressure and what kind of leadership feels most authentic to you when you're grounded.`

    sections.push('=== OPENING INSTRUCTIONS ===')
    sections.push('')
    sections.push('Deliver this welcome message:')
    sections.push('')
    sections.push(`"${welcomeMessage}`)
    sections.push('')
    sections.push('There are no right or wrong answers. Answer based on instinct, not aspiration.')
    sections.push('')
    sections.push('We\'ll start with three quick context questions about your role. For these, just select the one answer that fits best.')
    sections.push('')
    sections.push('Ready to begin?"')
    sections.push('')
    sections.push('After they confirm, present Question 1.')

  } else if (state.phase === 'context') {
    sections.push('=== CONTEXT SECTION (Q1-Q3) ===')
    sections.push('')
    sections.push('These are demographic/context questions. Single-select only.')
    sections.push('Instruction to participant: "Select the ONE answer that is most accurate for you."')
    sections.push('')

    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║           COPY THIS QUESTION VERBATIM (WORD FOR WORD)        ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push(`Question ${question.index}: ${question.stem}`)
      sections.push('')
      question.options.forEach((opt) => sections.push(`${opt.key.toLowerCase()}. ${opt.text}`))
      sections.push('')
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║     END - DO NOT ADD ANY OTHER QUESTIONS OR CONTENT          ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push('Wait for their single selection, then move to next question.')

      // Transition message when moving to Section 2
      if (state.current_question_index === 3) {
        sections.push('')
        sections.push('AFTER Q3, DELIVER THIS TRANSITION (verbatim):')
        sections.push('"Thank you for that context. Now we\'ll move into questions about how you tend to respond when things get tense, overloaded, or high stakes.')
        sections.push('')
        sections.push('What you do instinctively matters more than what you intend. Think about what you ACTUALLY do, not what you think you should do.')
        sections.push('')
        sections.push('For each question, please select:')
        sections.push('- First, the option that feels MOST like your usual response')
        sections.push('- Then, the option that feels SECOND most like your usual response"')
      }
    }

  } else if (state.phase === 'default_mode') {
    sections.push('=== DEFAULT MODE UNDER PRESSURE (Q4-Q12) ===')
    sections.push('')
    sections.push('CONTEXT FRAMING: These questions are about behavior UNDER PRESSURE.')
    sections.push('The participant should think about their reactions when overwhelmed, under pressure, or navigating conflict.')
    sections.push('')
    sections.push('SELECTION FORMAT: Ranked selection (MOST like me + SECOND most like me)')
    sections.push('')
    sections.push('CRITICAL: For EVERY question in this section, remind them:')
    sections.push('"Please select the option that is MOST like you, then the one that is SECOND most like you."')
    sections.push('')

    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║           COPY THIS QUESTION VERBATIM (WORD FOR WORD)        ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push(`Question ${question.index}: ${question.stem}`)
      sections.push('')
      question.options.forEach((opt) => sections.push(`${opt.key.toLowerCase()}. ${opt.text}`))
      sections.push('')
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║     END - DO NOT ADD ANY OTHER QUESTIONS OR CONTENT          ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push('ALL 5 OPTIONS MUST BE SHOWN. Do not omit any.')
      sections.push('')
      sections.push('Collect BOTH selections (most + second most) before proceeding.')

      // Transition message when moving to Section 3
      if (state.current_question_index === 12) {
        sections.push('')
        sections.push('AFTER Q12, DELIVER THIS TRANSITION (verbatim):')
        sections.push('"We\'ve explored how you tend to respond under pressure. Now let\'s shift.')
        sections.push('')
        sections.push('Think about moments when your leadership feels sustainable, effective, and true to you. When you feel confident, controlled, and fully aligned.')
        sections.push('')
        sections.push('Same format: select what feels MOST like you, then SECOND most like you."')
      }
    }

  } else if (state.phase === 'authentic_mode') {
    sections.push('=== AUTHENTIC MODE WHEN GROUNDED (Q13-Q16) ===')
    sections.push('')
    sections.push('CONTEXT FRAMING: These questions are about leadership when GROUNDED and at their best.')
    sections.push('The participant should think about when they feel confident, controlled, and fully aligned.')
    sections.push('')
    sections.push('SELECTION FORMAT: Ranked selection (MOST like me + SECOND most like me)')
    sections.push('')
    sections.push('CRITICAL: For EVERY question in this section, remind them:')
    sections.push('"Please select the option that is MOST like you, then the one that is SECOND most like you."')
    sections.push('')

    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║           COPY THIS QUESTION VERBATIM (WORD FOR WORD)        ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push(`Question ${question.index}: ${question.stem}`)
      sections.push('')
      question.options.forEach((opt) => sections.push(`${opt.key.toLowerCase()}. ${opt.text}`))
      sections.push('')
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║     END - DO NOT ADD ANY OTHER QUESTIONS OR CONTENT          ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push('ALL 5 OPTIONS MUST BE SHOWN. Do not omit any.')
      sections.push('')
      sections.push('Collect BOTH selections (most + second most) before proceeding.')

      // Transition message when moving to Section 4
      if (state.current_question_index === 16) {
        sections.push('')
        sections.push('AFTER Q16, DELIVER THIS TRANSITION (verbatim):')
        sections.push('"Now for the last few questions. These are about the parts of leadership that drain you right now.')
        sections.push('')
        sections.push('Answer based on what you thought and felt during a recent hard or demanding stretch.')
        sections.push('')
        sections.push('For these final three questions, just select the ONE option that resonates most."')
      }
    }

  } else if (state.phase === 'friction_signals') {
    sections.push('=== FRICTION AND EXHAUSTION SIGNALS (Q17-Q19) ===')
    sections.push('')
    sections.push('CONTEXT FRAMING: These questions identify what is currently draining the participant.')
    sections.push('They should answer based on a recent hard or demanding stretch.')
    sections.push('')
    sections.push('SELECTION FORMAT: Single-select (ONE option only)')
    sections.push('')
    sections.push('Instruction to participant: "Select the ONE option that resonates most."')
    sections.push('')

    const question = getQuestionByIndex(state.current_question_index)
    if (question) {
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║           COPY THIS QUESTION VERBATIM (WORD FOR WORD)        ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push(`Question ${question.index}: ${question.stem}`)
      sections.push('')
      question.options.forEach((opt) => sections.push(`${opt.key.toLowerCase()}. ${opt.text}`))
      sections.push('')
      sections.push('╔══════════════════════════════════════════════════════════════╗')
      sections.push('║     END - DO NOT ADD ANY OTHER QUESTIONS OR CONTENT          ║')
      sections.push('╚══════════════════════════════════════════════════════════════╝')
      sections.push('')
      sections.push('ALL 5 OPTIONS MUST BE SHOWN. Do not omit any.')
      sections.push('')
      sections.push('Collect their single selection before proceeding.')
    }

  } else if (state.phase === 'closing') {
    sections.push('=== CLOSING ===')
    sections.push('')
    sections.push('Deliver this closing message:')
    sections.push('')
    sections.push('"Thank you for completing the Leadership Archetypes Survey.')
    sections.push('')
    sections.push('Your responses have been recorded. Your coach will receive your results and will be in touch to discuss your leadership patterns and what they mean for you.')
    sections.push('')
    sections.push('Take care."')
  }

  // Final output format rules
  sections.push('')
  sections.push('=== OUTPUT FORMAT ===')
  sections.push('- Do NOT use markdown formatting (no **, no ##, no bullet points)')
  sections.push('- Present options as a simple lettered list (a. b. c. d. e.)')
  sections.push('- Keep acknowledgments to 2-3 words maximum: "Thank you." or "Got it."')
  sections.push('- NO follow-up questions, NO requests for stories or examples')
  sections.push('- NO commentary on their answers')
  sections.push('- This is a SURVEY, not a conversation')

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
  _assistantMessage: string // Unused but kept for future potential use
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

  // Handle opening phase - transition ONLY after user confirms they're ready
  // CRITICAL: Do NOT advance until user has responded (e.g., "Ready")
  // If we advance before user responds, Q1 will be skipped!
  if (state.phase === 'opening' && userMessage) {
    // User confirmed ready, now transition to first question
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
