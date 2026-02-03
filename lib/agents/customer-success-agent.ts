/**
 * Customer Success Agent
 *
 * AI-facilitated testimonial collection following a warm, conversational
 * interview that draws out specific details about the customer's experience
 * and synthesizes them into a polished testimonial.
 *
 * Flow:
 * 1. Thank customer for working with Innovaas
 * 2. Ask about original challenge/need
 * 3. Ask about experience working with the team
 * 4. Ask about results/outcomes
 * 5. Ask what they'd tell someone considering Innovaas
 * 6. Synthesize into 2-3 sentence testimonial
 * 7. Ask for approval/edits
 * 8. Collect star rating
 */

import { anthropic } from '@/lib/anthropic'

export interface CustomerSuccessSessionState {
  phase: 'greeting' | 'challenge' | 'experience' | 'results' | 'recommendation' | 'synthesis' | 'review' | 'rating' | 'completed'
  questions_asked: number
  responses: {
    challenge?: string
    experience?: string
    results?: string
    recommendation?: string
  }
  draft_testimonial?: string
  approved_testimonial?: string
  rating?: number
  themes?: string[]
  is_complete?: boolean
  last_interaction?: string
}

export interface CustomerContext {
  contact_name: string
  contact_email: string
  contact_title: string
  company_name: string
  project_id: string
}

export interface AgentResponse {
  message: string
  sessionState: CustomerSuccessSessionState
  isComplete: boolean
  usage?: {
    input_tokens: number
    output_tokens: number
    model: string
  }
}

interface MessageHistory {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * Initialize a new session state
 */
export function createInitialSessionState(): CustomerSuccessSessionState {
  return {
    phase: 'greeting',
    questions_asked: 0,
    responses: {},
    is_complete: false
  }
}

/**
 * Generate system prompt for the customer success agent
 */
function generateSystemPrompt(
  customerContext: CustomerContext,
  sessionState: CustomerSuccessSessionState
): string {
  return `You are a friendly Customer Success representative for Innovaas, a digital transformation consulting company. Your goal is to have a warm, genuine conversation with ${customerContext.contact_name} to capture their experience working with us and create a compelling testimonial.

CUSTOMER CONTEXT:
Name: ${customerContext.contact_name}
Title: ${customerContext.contact_title}
Company: ${customerContext.company_name}

CURRENT STATE:
Phase: ${sessionState.phase}
Questions Asked: ${sessionState.questions_asked}
Responses Captured:
${sessionState.responses.challenge ? `- Challenge: ${sessionState.responses.challenge}` : '- Challenge: Not yet captured'}
${sessionState.responses.experience ? `- Experience: ${sessionState.responses.experience}` : '- Experience: Not yet captured'}
${sessionState.responses.results ? `- Results: ${sessionState.responses.results}` : '- Results: Not yet captured'}
${sessionState.responses.recommendation ? `- Recommendation: ${sessionState.responses.recommendation}` : '- Recommendation: Not yet captured'}
${sessionState.draft_testimonial ? `\nDraft Testimonial: "${sessionState.draft_testimonial}"` : ''}
${sessionState.approved_testimonial ? `\nApproved Testimonial: "${sessionState.approved_testimonial}"` : ''}

CONVERSATION GUIDELINES:
- Be warm, appreciative, and genuinely interested
- Keep responses concise but friendly
- Ask ONE question at a time
- Acknowledge and reflect back what they share before moving on
- Draw out specific details - names, numbers, concrete examples
- When they give brief answers, gently probe for more specifics

PHASE-SPECIFIC INSTRUCTIONS:

GREETING (phase: greeting):
- Thank them warmly for taking time to share their experience
- Express genuine appreciation for the opportunity to work together
- Transition to asking about their original challenge

CHALLENGE (phase: challenge):
Ask: "What challenge or need originally brought you to Innovaas?"
- Listen for pain points, business problems, frustrations
- If vague, probe: "What was the impact of that challenge on your operations?"

EXPERIENCE (phase: experience):
Ask: "How would you describe your experience working with our team?"
- Listen for team dynamics, communication, professionalism
- Probe for specifics: "Was there a moment that stood out to you?"

RESULTS (phase: results):
Ask: "What results or outcomes have you seen so far?"
- Listen for metrics, improvements, ROI
- Probe for concrete numbers: "Can you quantify that improvement?"

RECOMMENDATION (phase: recommendation):
Ask: "What would you tell someone who's considering working with Innovaas?"
- Listen for their advice, endorsement, perspective
- This often provides the most quotable content

SYNTHESIS (phase: synthesis):
- Create a polished 2-3 sentence testimonial from their responses
- Include: the challenge, what Innovaas provided, and the outcome/recommendation
- Make it sound natural, like something they would actually say
- Present it: "Based on what you've shared, here's a testimonial I've drafted..."

REVIEW (phase: review):
- Ask them to review the testimonial
- "Does this capture what you'd like to say? Feel free to suggest any changes."
- If they suggest edits, incorporate them and present the revised version
- When they approve (say "yes", "looks good", "approved", etc.), confirm and move to rating

RATING (phase: rating):
- Ask for a star rating: "On a scale of 1-5 stars, how would you rate your overall experience working with Innovaas?"
- Thank them warmly for the rating and their testimonial

COMPLETED (phase: completed):
- Express heartfelt gratitude
- Let them know their testimonial will be shared with the team
- Wish them continued success

IMPORTANT:
- Stay in character as a warm, professional customer success rep
- Never break the fourth wall or mention being an AI
- If they seem rushed, offer to keep things brief
- Be genuinely appreciative - this customer chose to share their experience`
}

/**
 * Determine the next phase based on current phase and response
 */
function getNextPhase(currentPhase: string): CustomerSuccessSessionState['phase'] {
  const phaseOrder: CustomerSuccessSessionState['phase'][] = [
    'greeting', 'challenge', 'experience', 'results', 'recommendation', 'synthesis', 'review', 'rating', 'completed'
  ]
  const currentIndex = phaseOrder.indexOf(currentPhase as CustomerSuccessSessionState['phase'])
  if (currentIndex === -1 || currentIndex >= phaseOrder.length - 1) {
    return 'completed'
  }
  return phaseOrder[currentIndex + 1]
}

/**
 * Extract themes from the collected responses
 */
function extractThemes(responses: CustomerSuccessSessionState['responses']): string[] {
  const themes: string[] = []
  const text = Object.values(responses).filter(Boolean).join(' ').toLowerCase()

  // Common theme patterns
  const themePatterns: [RegExp, string][] = [
    [/\b(speed|fast|quick|rapid|efficient)\b/i, 'efficiency'],
    [/\b(communication|responsive|available|support)\b/i, 'communication'],
    [/\b(expert|knowledge|professional|skilled)\b/i, 'expertise'],
    [/\b(transform|change|improve|modernize)\b/i, 'transformation'],
    [/\b(cost|roi|saving|budget)\b/i, 'cost-effectiveness'],
    [/\b(team|collaborative|partner|together)\b/i, 'collaboration'],
    [/\b(quality|reliable|trust|depend)\b/i, 'reliability'],
    [/\b(innovat|creative|new|cutting.edge)\b/i, 'innovation'],
    [/\b(result|outcome|deliver|achieve)\b/i, 'results-driven'],
    [/\b(understand|listen|custom|tailor)\b/i, 'customer-focus'],
  ]

  for (const [pattern, theme] of themePatterns) {
    if (pattern.test(text) && !themes.includes(theme)) {
      themes.push(theme)
    }
  }

  return themes.slice(0, 5) // Limit to top 5 themes
}

/**
 * Parse rating from user message
 */
function parseRating(message: string): number | null {
  // Look for explicit number
  const numberMatch = message.match(/\b([1-5])\b/)
  if (numberMatch) {
    return parseInt(numberMatch[1], 10)
  }

  // Look for word forms
  const wordMap: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'perfect': 5, 'excellent': 5, 'amazing': 5, 'outstanding': 5,
    'great': 4, 'good': 4, 'very good': 4,
    'okay': 3, 'average': 3, 'decent': 3,
    'poor': 2, 'bad': 1, 'terrible': 1
  }

  const lowerMessage = message.toLowerCase()
  for (const [word, rating] of Object.entries(wordMap)) {
    if (lowerMessage.includes(word)) {
      return rating
    }
  }

  return null
}

/**
 * Check if user approved the testimonial
 */
function isApproval(message: string): boolean {
  const approvalPatterns = [
    /\b(yes|yep|yeah|yup|sure|ok|okay|approved?|correct|good|great|perfect|looks?\s+good|sounds?\s+good|that'?s?\s+(?:good|great|perfect|right|correct)|love\s+it|works?\s+(?:for\s+me)?)\b/i,
    /^(y|yes|ok|👍|✓|✅)$/i
  ]
  return approvalPatterns.some(pattern => pattern.test(message.trim()))
}

/**
 * Check if user wants to edit the testimonial
 */
function wantsToEdit(message: string): boolean {
  const editPatterns = [
    /\b(change|edit|modify|revise|update|adjust|tweak|instead|rather|actually|but|however|can\s+you|could\s+you|would\s+you)\b/i
  ]
  return editPatterns.some(pattern => pattern.test(message))
}

/**
 * Process a message through the customer success agent
 */
export async function processMessage(
  message: string,
  customerContext: CustomerContext,
  messageHistory: MessageHistory[],
  sessionState: CustomerSuccessSessionState
): Promise<{ response: string; updatedState: CustomerSuccessSessionState }> {
  let updatedState = { ...sessionState }
  updatedState.last_interaction = new Date().toISOString()

  // Handle special phases
  if (sessionState.phase === 'review') {
    if (isApproval(message) && !wantsToEdit(message)) {
      // User approved the testimonial
      updatedState.approved_testimonial = sessionState.draft_testimonial
      updatedState.phase = 'rating'
      updatedState.themes = extractThemes(sessionState.responses)
    }
    // If they want edits, let Claude handle the revision naturally
  } else if (sessionState.phase === 'rating') {
    const rating = parseRating(message)
    if (rating) {
      updatedState.rating = rating
      updatedState.phase = 'completed'
      updatedState.is_complete = true
    }
  }

  // Generate system prompt
  const systemPrompt = generateSystemPrompt(customerContext, updatedState)

  // Prepare messages for Claude - include instruction for this turn
  let turnInstruction = ''

  if (updatedState.phase === 'rating' && !updatedState.rating) {
    turnInstruction = '\n\nThe user just provided their rating. Thank them warmly for both the testimonial and the rating. Express genuine appreciation and let them know their feedback means a lot to the team.'
  } else if (updatedState.phase === 'completed') {
    turnInstruction = '\n\nThe interview is complete! Give a warm, brief closing message thanking them for their time and testimonial. Keep it to 2-3 sentences.'
  } else if (sessionState.phase === 'review' && isApproval(message) && !wantsToEdit(message)) {
    turnInstruction = '\n\nThe user approved the testimonial! Thank them warmly and now ask for their star rating (1-5 stars).'
  }

  const messages = [
    ...messageHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user' as const,
      content: message + turnInstruction
    }
  ]

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages
  })

  let assistantResponse = response.content[0].type === 'text'
    ? response.content[0].text
    : ''

  // Update state based on phase progression
  if (!sessionState.is_complete) {
    updatedState.questions_asked = (sessionState.questions_asked || 0) + 1

    // Store responses based on current phase
    if (sessionState.phase === 'challenge') {
      updatedState.responses.challenge = message
      updatedState.phase = 'experience'
    } else if (sessionState.phase === 'experience') {
      updatedState.responses.experience = message
      updatedState.phase = 'results'
    } else if (sessionState.phase === 'results') {
      updatedState.responses.results = message
      updatedState.phase = 'recommendation'
    } else if (sessionState.phase === 'recommendation') {
      updatedState.responses.recommendation = message
      updatedState.phase = 'synthesis'

      // Now synthesize the testimonial - generate it via Claude
      const synthesisPrompt = `Based on these customer responses, create a polished 2-3 sentence testimonial that sounds natural and genuine:

Challenge: ${updatedState.responses.challenge}
Experience: ${updatedState.responses.experience}
Results: ${updatedState.responses.results}
Recommendation: ${updatedState.responses.recommendation}

Write ONLY the testimonial text, nothing else. Make it sound like something ${customerContext.contact_name} would actually say. Include specific details they mentioned.`

      const testimonialResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 256,
        messages: [{ role: 'user', content: synthesisPrompt }]
      })

      const draftTestimonial = testimonialResponse.content[0].type === 'text'
        ? testimonialResponse.content[0].text.replace(/^["']|["']$/g, '').trim()
        : ''

      updatedState.draft_testimonial = draftTestimonial
      updatedState.phase = 'review'

      // Append the testimonial presentation to the response
      assistantResponse = `Thank you for sharing all of that! Based on what you've told me, here's a testimonial I've drafted for you:\n\n"${draftTestimonial}"\n\nDoes this capture what you'd like to say? Feel free to suggest any changes, or let me know if it looks good!`
    } else if (sessionState.phase === 'greeting') {
      updatedState.phase = 'challenge'
    } else if (sessionState.phase === 'synthesis') {
      // This shouldn't happen normally, but handle it
      updatedState.phase = 'review'
    }
  }

  // Handle rating phase completion
  if (updatedState.phase === 'rating') {
    const parsedRating = parseRating(message)
    if (parsedRating !== null) {
      updatedState.rating = parsedRating
      updatedState.phase = 'completed'
      updatedState.is_complete = true
      updatedState.themes = extractThemes(updatedState.responses)
    }
  }

  return {
    response: assistantResponse,
    updatedState
  }
}

/**
 * Generate initial greeting message for the agent
 */
export async function generateGreeting(
  customerContext: CustomerContext
): Promise<string> {
  const systemPrompt = `You are a friendly Customer Success representative for Innovaas, a digital transformation consulting company. Generate a warm, brief greeting for ${customerContext.contact_name} (${customerContext.contact_title} at ${customerContext.company_name}).

Your greeting should:
1. Thank them warmly for taking time to share their experience
2. Express genuine appreciation for the opportunity to work together
3. Let them know this will only take a few minutes
4. Transition to asking about their original challenge

Keep it conversational, warm, and brief (3-4 sentences max). End with your first question about what challenge originally brought them to Innovaas.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 300,
    messages: [{ role: 'user', content: 'Generate the greeting message.' }],
    system: systemPrompt
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
