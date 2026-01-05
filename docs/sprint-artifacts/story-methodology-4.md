# Story: Dynamic Prompt Generation

**Story ID:** METHODOLOGY-4
**Epic:** [Methodology Configuration System](../epics.md)
**Tech Spec:** [tech-spec.md](../tech-spec.md)
**Priority:** P1 - High
**Status:** Ready
**Depends On:** METHODOLOGY-2

---

## User Story

**As a** developer
**I want** a function that generates Claude system prompts from methodology configs
**So that** AI interviews can use database-stored methodologies

## Context

The existing `generateArchetypeSystemPrompt()` in `archetype-constitution.ts` is hardcoded. We need a dynamic version that accepts a `MethodologyConfig` and generates an equivalent system prompt.

## Tech Spec Reference

See [tech-spec.md](../tech-spec.md) sections:
- Technical Approach > 3. Dynamic System Prompt Generation
- Key Code Locations > System prompt generation

---

## Acceptance Criteria

- [ ] **AC1:** `generateSystemPrompt()` accepts MethodologyConfig and session state
- [ ] **AC2:** Output format matches existing archetype prompt structure
- [ ] **AC3:** All role, tone, and rules sections included
- [ ] **AC4:** Current phase and question rendered correctly
- [ ] **AC5:** Story probing prompts included per phase
- [ ] **AC6:** Closing template supports variable substitution

---

## Tasks

### Task 1: Create Prompt Generator Module
**File:** `lib/methodology/prompt-generator.ts`

```typescript
import { MethodologyConfig, MethodologyPhase, MethodologyQuestion } from '@/types/methodology'

export interface SessionState {
  phase: string
  current_question_index: number
  context?: Record<string, string>
}

export interface PromptGeneratorOptions {
  tenantName?: string
  coachName?: string
  participantName?: string
}

/**
 * Generate a Claude system prompt from a methodology configuration
 */
export function generateSystemPrompt(
  config: MethodologyConfig,
  state: SessionState,
  options: PromptGeneratorOptions = {}
): string {
  const sections: string[] = []

  // Header
  sections.push(generateHeader(config, options))
  sections.push('')

  // Role & Stance
  sections.push(generateRoleSection(config))
  sections.push('')

  // Tone & Voice
  sections.push(generateToneSection(config))
  sections.push('')

  // Rules
  sections.push(generateRulesSection(config))
  sections.push('')

  // Current State
  sections.push(generateStateSection(config, state))
  sections.push('')

  // Story Probing
  sections.push(generateStoryProbingSection(config, state))
  sections.push('')

  // Current Question (if applicable)
  const currentQuestion = getCurrentQuestion(config, state.current_question_index)
  if (currentQuestion) {
    sections.push(generateQuestionSection(currentQuestion))
    sections.push('')
  }

  return sections.join('\n')
}

function generateHeader(
  config: MethodologyConfig,
  options: PromptGeneratorOptions
): string {
  const lines = [
    `You are conducting an interview session using the "${config.role.identity}" methodology.`
  ]
  
  if (options.tenantName) {
    lines.push(`This session is provided by ${options.tenantName}.`)
  }
  
  if (options.coachName) {
    lines.push(`The participant will discuss results with their coach, ${options.coachName}.`)
  }

  return lines.join('\n')
}

function generateRoleSection(config: MethodologyConfig): string {
  const { role } = config
  const lines = [
    'ROLE & STANCE (NON-NEGOTIABLE):',
    `Identity: ${role.identity}`,
    `Stance: ${role.stance}`,
    '',
    'You are NOT:'
  ]
  
  role.you_are_not.forEach(item => lines.push(`- ${item}`))
  
  lines.push('')
  lines.push('You ARE:')
  role.you_are.forEach(item => lines.push(`- ${item}`))
  
  lines.push('')
  lines.push('Your job is to create the internal feeling:')
  lines.push(`> "${role.internal_feeling}"`)

  return lines.join('\n')
}

function generateToneSection(config: MethodologyConfig): string {
  const { tone } = config
  const lines = [
    'TONE & VOICE (CRITICAL):',
    'Your tone must always be:',
    tone.qualities.join(', '),
    '',
    'GOOD tone examples:'
  ]
  
  tone.good_examples.forEach(ex => lines.push(`- "${ex}"`))
  
  lines.push('')
  lines.push('BAD tone (do not use):')
  tone.bad_examples.forEach(ex => lines.push(`- "${ex}"`))

  return lines.join('\n')
}

function generateRulesSection(config: MethodologyConfig): string {
  const lines = ['CORE RULES:']
  
  config.rules.forEach((rule, idx) => {
    lines.push(`${idx + 1}. ${rule.name}: ${rule.description}`)
    if (rule.examples && rule.examples.length > 0) {
      rule.examples.forEach(ex => lines.push(`   Example: "${ex}"`))
    }
  })

  return lines.join('\n')
}

function generateStateSection(
  config: MethodologyConfig,
  state: SessionState
): string {
  const totalQuestions = config.questions.length
  const progress = Math.round((state.current_question_index / totalQuestions) * 100)
  
  const currentPhase = config.phases.find(p => p.id === state.phase)
  
  const lines = [
    'CONVERSATION STATE:',
    `Phase: ${currentPhase?.name || state.phase}`,
    `Question: ${state.current_question_index} of ${totalQuestions}`,
    `Progress: ${progress}%`
  ]

  if (state.context) {
    Object.entries(state.context).forEach(([key, value]) => {
      lines.push(`${key}: ${value}`)
    })
  }

  return lines.join('\n')
}

function generateStoryProbingSection(
  config: MethodologyConfig,
  state: SessionState
): string {
  const currentPhase = config.phases.find(p => p.id === state.phase)
  const currentQuestion = getCurrentQuestion(config, state.current_question_index)
  
  const lines = [
    'STORY PROBING:',
    'After each selection, probe for a real example.',
    'Use prompts like:'
  ]
  
  // Use follow_up_prompts from current question if available
  if (currentQuestion?.follow_up_prompts && currentQuestion.follow_up_prompts.length > 0) {
    currentQuestion.follow_up_prompts.forEach(p => lines.push(`- "${p}"`))
  } else {
    // Default probing prompts
    lines.push('- "Can you think of a recent time when that happened?"')
    lines.push('- "What does that look like in practice?"')
    lines.push('- "Is there a situation that comes to mind?"')
  }

  return lines.join('\n')
}

function generateQuestionSection(question: MethodologyQuestion): string {
  const lines = [
    'CURRENT QUESTION:',
    `Q${question.order}: ${question.stem}`,
    'Options:'
  ]
  
  if (question.options) {
    question.options.forEach(opt => {
      lines.push(`  ${opt.key}. ${opt.text}`)
    })
  }
  
  lines.push(`Selection type: ${question.selection_type}`)
  if (question.scored) {
    lines.push('(This question is scored)')
  }

  return lines.join('\n')
}

function getCurrentQuestion(
  config: MethodologyConfig,
  index: number
): MethodologyQuestion | undefined {
  return config.questions.find(q => q.order === index)
}

/**
 * Generate closing summary using template
 */
export function generateClosingSummary(
  config: MethodologyConfig,
  results: Record<string, any>
): string {
  let template = config.closing.template
  
  // Replace template variables
  Object.entries(results).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  })

  return template
}

/**
 * Get phase transition prompt
 */
export function getPhaseTransition(
  config: MethodologyConfig,
  fromPhase: string,
  toPhase: string
): string | undefined {
  const nextPhase = config.phases.find(p => p.id === toPhase)
  return nextPhase?.transition_prompt
}
```

### Task 2: Create Dynamic Interview Agent
**File:** `lib/agents/dynamic-interview-agent.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { MethodologyConfig } from '@/types/methodology'
import { generateSystemPrompt, SessionState } from '@/lib/methodology/prompt-generator'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface TenantContext {
  display_name: string
  coach_name?: string
}

export interface AgentResponse {
  message: string
  sessionState: SessionState
  isComplete: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Process a message using a database-stored methodology
 */
export async function processDynamicMessage(
  methodology: MethodologyConfig,
  userMessage: string | null,
  currentState: SessionState | null,
  conversationHistory: Message[],
  tenant: TenantContext,
  participantName: string
): Promise<AgentResponse> {
  // Initialize state if needed
  const state = currentState || {
    phase: methodology.phases[0]?.id || 'opening',
    current_question_index: 0,
    context: {}
  }

  // Build system prompt from methodology config
  const systemPrompt = generateSystemPrompt(methodology, state, {
    tenantName: tenant.display_name,
    coachName: tenant.coach_name,
    participantName
  })

  // Build messages for Claude
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content })
  }

  if (userMessage) {
    messages.push({ role: 'user', content: userMessage })
  }

  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: '[Session started - please provide the opening greeting]'
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
    const newState = updateSessionState(methodology, state, userMessage, assistantMessage)
    const isComplete = checkIfComplete(methodology, newState)

    return {
      message: assistantMessage,
      sessionState: newState,
      isComplete
    }

  } catch (error) {
    console.error('Dynamic interview agent error:', error)
    throw error
  }
}

function updateSessionState(
  methodology: MethodologyConfig,
  state: SessionState,
  userMessage: string | null,
  assistantMessage: string
): SessionState {
  // Simple state progression - in real implementation, 
  // parse responses to track question progress
  return {
    ...state,
    current_question_index: state.current_question_index + 1
  }
}

function checkIfComplete(
  methodology: MethodologyConfig,
  state: SessionState
): boolean {
  return state.current_question_index >= methodology.questions.length
}
```

### Task 3: Test with Existing Archetype Data
Create a test to verify the dynamic agent produces similar output to the hardcoded version.

---

## Definition of Done

- [ ] Prompt generator created and tested
- [ ] Dynamic interview agent created
- [ ] Output matches format of existing archetype prompts
- [ ] All methodology sections rendered correctly
- [ ] Phase transitions work correctly
- [ ] Closing summary template substitution works
