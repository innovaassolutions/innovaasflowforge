/**
 * Enhancement Agent
 *
 * AI-facilitated synthesis that integrates reflection conversation insights
 * into personalized archetype results. Takes original assessment results
 * plus reflection messages and produces enhanced, contextual narratives.
 *
 * Spec: Reflection Integration Enhancement
 */

import Anthropic from '@anthropic-ai/sdk'
import { ARCHETYPES, type Archetype } from './archetype-constitution'
import type { ReflectionMessage, ArchetypeResultsContext, ReflectionTenantContext } from './reflection-agent'

// Lazy initialization to support scripts that load env vars after import
let anthropicClient: Anthropic | null = null
function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return anthropicClient
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EnhancementInput {
  originalResults: ArchetypeResultsContext
  reflectionMessages: ReflectionMessage[]
  participantName: string
  tenant: ReflectionTenantContext
}

export interface MeaningfulQuote {
  quote: string
  context: string
}

export interface EnhancedResults {
  // Personalized archetype narratives (replace generic descriptions)
  personalizedDefaultNarrative: string
  personalizedAuthenticNarrative: string

  // Enhanced tension pattern insights (if applicable)
  personalizedTensionInsights: string | null

  // Key themes extracted from reflection
  reflectionThemes: string[]

  // Personalized "Moving Forward" guidance
  personalizedGuidance: string

  // Pull quotes from reflection for PDF callouts
  meaningfulQuotes: MeaningfulQuote[]

  // Metadata
  enhancedAt: string
}

export interface EnhancementAgentResponse {
  success: boolean
  enhanced?: EnhancedResults
  error?: string
}

// ============================================================================
// MAIN ENHANCEMENT FUNCTION
// ============================================================================

/**
 * Process reflection messages and generate enhanced, personalized results
 */
export async function processEnhancement(
  input: EnhancementInput
): Promise<EnhancementAgentResponse> {
  const { originalResults, reflectionMessages, participantName, tenant } = input

  // Validate we have reflection content to work with
  const userMessages = reflectionMessages.filter(m => m.role === 'user')
  if (userMessages.length === 0) {
    return {
      success: false,
      error: 'No user reflection messages to enhance from'
    }
  }

  // Build system prompt
  const systemPrompt = buildEnhancementSystemPrompt(
    originalResults,
    participantName,
    tenant
  )

  // Build the conversation context for Claude
  const reflectionTranscript = formatReflectionTranscript(reflectionMessages)

  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the reflection conversation to analyze and synthesize:\n\n${reflectionTranscript}\n\nPlease generate the enhanced, personalized results based on this reflection.`
        }
      ]
    })

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // Parse the JSON response
    const enhanced = parseEnhancementResponse(responseText)

    if (!enhanced) {
      return {
        success: false,
        error: 'Failed to parse enhancement response'
      }
    }

    return {
      success: true,
      enhanced: {
        ...enhanced,
        enhancedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Enhancement agent error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate enhanced results'
    }
  }
}

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

function buildEnhancementSystemPrompt(
  results: ArchetypeResultsContext,
  participantName: string,
  tenant: ReflectionTenantContext
): string {
  const sections: string[] = []

  // Get archetype details
  const defaultArchetype = ARCHETYPES[results.default_archetype]
  const authenticArchetype = ARCHETYPES[results.authentic_archetype]
  const hasTension = !results.is_aligned

  // Core identity
  sections.push('You are an expert leadership assessment synthesizer.')
  sections.push(`Your task is to analyze ${participantName}'s reflection conversation and generate deeply personalized assessment narratives.`)
  sections.push(`This assessment is facilitated by ${tenant.display_name}.`)
  sections.push('')

  // The task
  sections.push('YOUR TASK:')
  sections.push('Analyze the reflection conversation and create personalized narratives that weave together:')
  sections.push('1. The archetype framework and what it means')
  sections.push('2. The specific situations, language, and insights the participant shared')
  sections.push('3. Actionable guidance that feels personally relevant')
  sections.push('')
  sections.push('The output should feel like it was written specifically FOR this person, not a generic description with their name inserted.')
  sections.push('')

  // Participant's archetype results
  sections.push('PARTICIPANT ARCHETYPE RESULTS:')
  sections.push('')
  sections.push(`DEFAULT ARCHETYPE (under pressure): ${defaultArchetype.name}`)
  sections.push(`- Description: ${defaultArchetype.under_pressure}`)
  sections.push(`- Core traits: ${defaultArchetype.core_traits.join(', ')}`)
  sections.push(`- Overuse signals: ${defaultArchetype.overuse_signals.join('; ')}`)
  sections.push('')
  sections.push(`AUTHENTIC ARCHETYPE (when grounded): ${authenticArchetype.name}`)
  sections.push(`- Description: ${authenticArchetype.when_grounded}`)
  sections.push(`- Core traits: ${authenticArchetype.core_traits.join(', ')}`)
  sections.push('')

  if (hasTension) {
    sections.push('TENSION PATTERN:')
    sections.push(`This participant has a TENSION pattern - their default response under pressure (${defaultArchetype.name}) differs from what energizes them when grounded (${authenticArchetype.name}).`)
    sections.push('This represents adaptive strategies developed over time and is common among leaders.')
    sections.push('')
  } else {
    sections.push('ALIGNMENT:')
    sections.push(`This participant is ALIGNED - their ${defaultArchetype.name} archetype shows up both under pressure and when grounded.`)
    sections.push('This suggests consistency in their leadership approach.')
    sections.push('')
  }

  // Writing guidelines
  sections.push('WRITING GUIDELINES:')
  sections.push('- Write in second person ("You tend to..." not "They tend to...")')
  sections.push('- Reference specific situations or language from their reflection')
  sections.push('- Keep narratives warm but professional')
  sections.push('- Normalize patterns as adaptive, not flawed')
  sections.push('- Each narrative should be 100-200 words')
  sections.push('- Themes should be 3-5 words each')
  sections.push('- Quotes should be meaningful moments from the reflection (exact or paraphrased)')
  sections.push('- Guidance should be specific and actionable, not generic advice')
  sections.push('')

  // Output format
  sections.push('OUTPUT FORMAT:')
  sections.push('Respond with ONLY a valid JSON object (no markdown code blocks, no explanation):')
  sections.push('')
  sections.push('{')
  sections.push('  "personalizedDefaultNarrative": "A personalized description of how their default archetype shows up, referencing their specific situations...",')
  sections.push('  "personalizedAuthenticNarrative": "A personalized description of their authentic archetype and what it looks like when they\'re grounded...",')
  if (hasTension) {
    sections.push('  "personalizedTensionInsights": "Personalized insights about the tension between their default and authentic patterns, using their specific examples...",')
  } else {
    sections.push('  "personalizedTensionInsights": null,')
  }
  sections.push('  "reflectionThemes": ["Theme 1", "Theme 2", "Theme 3"],')
  sections.push('  "personalizedGuidance": "Specific, personalized guidance for moving forward based on what they shared...",')
  sections.push('  "meaningfulQuotes": [')
  sections.push('    {"quote": "Something significant they said", "context": "Why this matters"},')
  sections.push('    {"quote": "Another meaningful insight", "context": "The significance"}')
  sections.push('  ]')
  sections.push('}')

  return sections.join('\n')
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format reflection messages into a readable transcript
 */
function formatReflectionTranscript(messages: ReflectionMessage[]): string {
  return messages
    .map(msg => {
      const role = msg.role === 'user' ? 'PARTICIPANT' : 'GUIDE'
      return `${role}: ${msg.content}`
    })
    .join('\n\n')
}

/**
 * Parse the enhancement response JSON
 */
function parseEnhancementResponse(responseText: string): Omit<EnhancedResults, 'enhancedAt'> | null {
  try {
    // Strip any markdown code blocks if present
    let jsonStr = responseText.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)

    // Validate required fields
    if (
      typeof parsed.personalizedDefaultNarrative !== 'string' ||
      typeof parsed.personalizedAuthenticNarrative !== 'string' ||
      !Array.isArray(parsed.reflectionThemes) ||
      typeof parsed.personalizedGuidance !== 'string' ||
      !Array.isArray(parsed.meaningfulQuotes)
    ) {
      console.error('Enhancement response missing required fields')
      return null
    }

    return {
      personalizedDefaultNarrative: parsed.personalizedDefaultNarrative,
      personalizedAuthenticNarrative: parsed.personalizedAuthenticNarrative,
      personalizedTensionInsights: parsed.personalizedTensionInsights || null,
      reflectionThemes: parsed.reflectionThemes,
      personalizedGuidance: parsed.personalizedGuidance,
      meaningfulQuotes: parsed.meaningfulQuotes.map((q: { quote?: string; context?: string }) => ({
        quote: q.quote || '',
        context: q.context || ''
      }))
    }
  } catch (error) {
    console.error('Failed to parse enhancement response:', error)
    console.error('Raw response:', responseText)
    return null
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  processEnhancement
}
