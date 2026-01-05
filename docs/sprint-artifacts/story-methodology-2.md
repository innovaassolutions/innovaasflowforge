# Story: TypeScript Types & Validation

**Story ID:** METHODOLOGY-2
**Epic:** [Methodology Configuration System](../epics.md)
**Tech Spec:** [tech-spec.md](../tech-spec.md)
**Priority:** P0 - Critical Path
**Status:** Ready
**Depends On:** METHODOLOGY-1

---

## User Story

**As a** developer
**I want** TypeScript interfaces and Zod validation for methodology configs
**So that** I have type safety and runtime validation for methodology data

## Context

Methodology configurations are stored as JSONB in the database. We need TypeScript types that match this structure and Zod schemas for runtime validation when reading from the database or accepting API input.

## Tech Spec Reference

See [tech-spec.md](../tech-spec.md) sections:
- Technical Approach > 2. Constitution JSONB Structure
- Technical Details > JSONB Schema Validation

---

## Acceptance Criteria

- [ ] **AC1:** `types/methodology.ts` exports MethodologyConfig interface
- [ ] **AC2:** All nested interfaces (Role, Tone, Phase, Question, etc.) are typed
- [ ] **AC3:** `lib/methodology/schema.ts` exports Zod schemas
- [ ] **AC4:** Zod schema validates existing archetype constitution structure
- [ ] **AC5:** Validation errors include clear field paths
- [ ] **AC6:** Optional fields handled correctly (scoring, follow_up_prompts)

---

## Tasks

### Task 1: Create TypeScript Interfaces
**File:** `types/methodology.ts`

```typescript
/**
 * Methodology Configuration Types
 * 
 * These types define the structure of interview methodologies
 * stored as JSONB in the methodologies table.
 */

export interface MethodologyRole {
  identity: string
  stance: string
  you_are: string[]
  you_are_not: string[]
  internal_feeling: string
}

export interface MethodologyTone {
  qualities: string[]
  good_examples: string[]
  bad_examples: string[]
}

export interface MethodologyPhase {
  id: string
  name: string
  order: number
  transition_prompt: string
}

export interface QuestionOption {
  key: string
  category: string
  text: string
  score_weight?: number
}

export interface MethodologyQuestion {
  id: string
  phase_id: string
  order: number
  stem: string
  selection_type: 'single' | 'ranked' | 'open'
  scored: boolean
  options?: QuestionOption[]
  follow_up_prompts?: string[]
}

export interface ScoringCategory {
  name: string
  description: string
}

export interface MethodologyScoring {
  categories: Record<string, ScoringCategory>
  calculation: 'sum' | 'average' | 'weighted'
}

export interface MethodologyClosing {
  summarize_themes: boolean
  template: string
}

export interface MethodologyRule {
  name: string
  description: string
  examples?: string[]
}

export interface MethodologyConfig {
  version: string
  role: MethodologyRole
  tone: MethodologyTone
  phases: MethodologyPhase[]
  questions: MethodologyQuestion[]
  scoring?: MethodologyScoring
  closing: MethodologyClosing
  rules: MethodologyRule[]
}

// Database row type
export interface Methodology {
  id: string
  tenant_id: string | null
  slug: string
  name: string
  description: string | null
  category: 'coaching' | 'consulting' | 'education' | 'custom'
  is_system_default: boolean
  is_active: boolean
  config: MethodologyConfig
  created_at: string
  updated_at: string
  created_by: string | null
}

// API input types
export interface CreateMethodologyInput {
  slug: string
  name: string
  description?: string
  category: 'coaching' | 'consulting' | 'education' | 'custom'
  config: MethodologyConfig
}

export interface UpdateMethodologyInput {
  name?: string
  description?: string
  category?: 'coaching' | 'consulting' | 'education' | 'custom'
  config?: MethodologyConfig
  is_active?: boolean
}
```

### Task 2: Create Zod Validation Schemas
**File:** `lib/methodology/schema.ts`

```typescript
import { z } from 'zod'

export const MethodologyRoleSchema = z.object({
  identity: z.string().min(1, 'Identity is required'),
  stance: z.string().min(1, 'Stance is required'),
  you_are: z.array(z.string()).min(1, 'At least one "you are" item required'),
  you_are_not: z.array(z.string()).min(1, 'At least one "you are not" item required'),
  internal_feeling: z.string().min(1, 'Internal feeling is required')
})

export const MethodologyToneSchema = z.object({
  qualities: z.array(z.string()).min(1, 'At least one tone quality required'),
  good_examples: z.array(z.string()),
  bad_examples: z.array(z.string())
})

export const MethodologyPhaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  order: z.number().int().min(0),
  transition_prompt: z.string()
})

export const QuestionOptionSchema = z.object({
  key: z.string().min(1),
  category: z.string().min(1),
  text: z.string().min(1),
  score_weight: z.number().optional()
})

export const MethodologyQuestionSchema = z.object({
  id: z.string().min(1),
  phase_id: z.string().min(1),
  order: z.number().int().min(0),
  stem: z.string().min(1, 'Question stem is required'),
  selection_type: z.enum(['single', 'ranked', 'open']),
  scored: z.boolean(),
  options: z.array(QuestionOptionSchema).optional(),
  follow_up_prompts: z.array(z.string()).optional()
})

export const ScoringCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string()
})

export const MethodologyScoringSchema = z.object({
  categories: z.record(ScoringCategorySchema),
  calculation: z.enum(['sum', 'average', 'weighted'])
})

export const MethodologyClosingSchema = z.object({
  summarize_themes: z.boolean(),
  template: z.string().min(1, 'Closing template is required')
})

export const MethodologyRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  examples: z.array(z.string()).optional()
})

export const MethodologyConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+$/, 'Version must be in format X.Y'),
  role: MethodologyRoleSchema,
  tone: MethodologyToneSchema,
  phases: z.array(MethodologyPhaseSchema).min(1, 'At least one phase required'),
  questions: z.array(MethodologyQuestionSchema).min(1, 'At least one question required'),
  scoring: MethodologyScoringSchema.optional(),
  closing: MethodologyClosingSchema,
  rules: z.array(MethodologyRuleSchema)
})

export const CreateMethodologyInputSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['coaching', 'consulting', 'education', 'custom']),
  config: MethodologyConfigSchema
})

export const UpdateMethodologyInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(['coaching', 'consulting', 'education', 'custom']).optional(),
  config: MethodologyConfigSchema.optional(),
  is_active: z.boolean().optional()
})

// Validation helper
export function validateMethodologyConfig(config: unknown): {
  success: boolean
  data?: z.infer<typeof MethodologyConfigSchema>
  error?: z.ZodError
} {
  const result = MethodologyConfigSchema.safeParse(config)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}
```

### Task 3: Install Zod (if not present)
```bash
npm install zod
```

### Task 4: Test Validation Against Existing Constitution
Create a quick test to ensure the schema validates the existing archetype constitution structure.

---

## Definition of Done

- [ ] TypeScript interfaces created and exported
- [ ] Zod schemas created with proper validation rules
- [ ] Zod installed as dependency
- [ ] Schemas tested against archetype constitution data
- [ ] Optional fields work correctly
- [ ] Error messages are descriptive
