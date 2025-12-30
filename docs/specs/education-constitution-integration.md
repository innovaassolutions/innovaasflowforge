# Education Module Constitution Integration

> **Spec Document**
> Created: 2025-12-30
> Status: Planning
> Author: BMad Master

## Overview

This document outlines the integration of the new Claude Constitution documents into FlowForge's education interview agent. The constitutions represent a significant upgrade in conversational psychology, domain coverage, and interview methodology.

---

## Executive Summary

### What We're Doing

Integrating three Claude Constitution documents into the education interview agent to dramatically improve interview quality, depth, and psychological sophistication.

### Why It Matters

- Current interview agent covers **3 sections per module**
- New constitutions cover **8-12 domains per module**
- New constitutions include proven conversation psychology techniques
- Better interviews → better synthesis → better reports → more value for schools

### What's NOT Changing

- Synthesis agent (already aligned with Four Lenses framework)
- Report structure (already matches 5-section format)
- Database schema (no changes required)
- API routes (no changes required)

---

## Source Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Parent Constitution | `docs/modules/education/questions/FlowForge_Parent_Module_Claude_Constitution.md` | Parent interview methodology |
| Student Constitution | `docs/modules/education/questions/FlowForge_Student_Wellbeing_Claude_Constitution.md` | Student interview methodology |
| Teacher Constitution | `docs/modules/education/questions/FlowForge_Teacher_Module_Claude_Constitution.md` | Teacher interview methodology |
| Parent Report Format | `docs/modules/education/reports/FlowForge_Parent_Module_Report.md` | Report structure (reference only) |
| Teacher Report Format | `docs/modules/education/reports/FlowForge_Teacher_Module_Report.md` | Report structure (reference only) |
| Student Report Format | `docs/modules/education/reports/Student_Wellbeing_Report_Format.md` | Report structure (reference only) |

---

## Target File

**Primary file to modify:**
```
lib/agents/education-interview-agent.ts
```

---

## Gap Analysis Summary

### Domain Coverage Expansion

| Module | Current | Target | Gap |
|--------|---------|--------|-----|
| **Parent (parent_confidence)** | 3 sections | 10 domains | +7 domains |
| **Student (student_wellbeing)** | 3 sections | 8 domains | +5 domains |
| **Teacher (teaching_learning)** | 3 sections | 12 domains | +9 domains |

### New Domains by Module

#### Parent Module (10 Domains)
1. Communication & Transparency
2. Frequency & Quality of Updates
3. Access to Teachers & Administration
4. Two-Way Communication & Responsiveness
5. Transparency (Policies, Tuition, Leadership)
6. Academic Satisfaction & Curriculum Fit
7. Wellbeing & Safety
8. School Culture & Community
9. Operations & Services
10. Emotional & Psychological Indicators

#### Student Module (8 Domains)
1. Academic Life
2. Peer Relationships
3. Student-Teacher Relationships
4. Student-Staff Relationships (Non-Teaching)
5. Leadership Perception
6. Wellbeing & Emotional Load
7. Facilities & Environment
8. Emotional Psychology (Deep Signal Layer)

#### Teacher Module (12 Domains)
1. Workload, Burnout & Time Allocation
2. Curriculum Delivery, Teaching Style & Expectations
3. Classroom Management, Discipline & Behaviour
4. Teacher-Teacher Relationship Dynamics
5. Teacher-Leadership Relationship
6. Professional Development & Career Growth
7. Administrative & Operational Support
8. Teacher-Parent Relationship Dynamics
9. Teacher-Student Relationship & Classroom Atmosphere
10. School-Wide Culture, Values & Inclusion
11. Wellbeing, Stress & Emotional Indicators
12. Improvement Signals (Open Diagnostic)

---

## Implementation Tasks

### Task 1: Create Constitution Prompt Generator

**What:** Create a new function that generates system prompts from the constitution documents.

**Why:** The constitutions contain rich, structured content that needs to be dynamically incorporated into the LLM system prompt.

**Approach:**
- Store constitution content as structured constants (not file reads at runtime)
- Create `generateConstitutionPrompt(participantType, module, conversationState)` function
- Include: role/stance, tone/voice, core rules, domain map, closing protocol

**Location:** `lib/agents/education-interview-agent.ts`

**Estimated Changes:** ~300-400 new lines

---

### Task 2: Expand Domain Tracking in Conversation State

**What:** Update `ConversationState` interface and tracking logic to handle 8-12 domains instead of 3 sections.

**Current Interface:**
```typescript
export interface ConversationState {
  phase: ConversationPhase
  sections_completed: string[]  // Currently tracks 3 sections
  questions_asked: number
  rapport_established: boolean
  anonymity_confirmed: boolean
  // ...
}
```

**New Interface:**
```typescript
export interface ConversationState {
  phase: ConversationPhase
  domains_explored: DomainExploration[]  // Track each domain
  sections_completed: string[]  // Keep for backwards compatibility
  questions_asked: number
  rapport_established: boolean
  anonymity_confirmed: boolean
  current_domain?: string
  domain_responses: Record<string, 'positive' | 'neutral' | 'negative'>
  // ...
}

export interface DomainExploration {
  domain: string
  explored: boolean
  response_type?: 'positive' | 'neutral' | 'negative'
  depth: number  // 0-3: not explored, touched, explored, deep-dived
}
```

**Estimated Changes:** ~50 lines interface, ~100 lines tracking logic

---

### Task 3: Implement Exploration Logic

**What:** Add response-type branching logic as specified in the constitutions.

**Constitution Specification:**
```
- Positive response → explore fragility
- Neutral response → widen the lens
- Negative response → deepen without escalating
```

**Implementation:**
- After each user response, classify as positive/neutral/negative
- Use LLM to classify (or simple keyword heuristics)
- Inform next question selection based on classification
- Track in conversation state for synthesis

**Location:** New function `classifyResponse()` and updates to `updateConversationState()`

**Estimated Changes:** ~100 lines

---

### Task 4: Implement Domain Traversal Logic

**What:** Ensure all domains are covered before closing, with appropriate depth.

**Constitution Specification:**
> "You must traverse ALL domains, even if the participant is positive."

**Implementation:**
- Track which domains have been explored
- Before closing, check domain coverage
- If domains are unexplored, redirect to those domains
- Allow natural conversation flow while ensuring coverage

**Logic:**
```typescript
function shouldCloseConversation(state: ConversationState): boolean {
  const minDomainCoverage = 0.7  // At least 70% of domains touched
  const coveredDomains = state.domains_explored.filter(d => d.depth >= 1).length
  const totalDomains = state.domains_explored.length

  return (
    state.questions_asked >= 12 &&
    (coveredDomains / totalDomains) >= minDomainCoverage
  )
}
```

**Estimated Changes:** ~80 lines

---

### Task 5: Update Closing Protocol

**What:** Implement the constitution-specified closing approach.

**Constitution Specification:**
> "Before we wrap up, is there anything about [your experience] that people don't usually ask about — but you think actually matters?"

**Implementation:**
- Add closing question template per participant type
- Verify domain coverage before closing
- Generate appropriate closing message
- Do NOT reassure, defend, or summarise emotionally

**Estimated Changes:** ~50 lines

---

### Task 6: Add Tone Validation (Optional Enhancement)

**What:** Implement guardrails to prevent "bad tone" responses.

**Constitution Examples (Bad Tone to Avoid):**
- "We're sorry you feel that way."
- "Thank you for your feedback."
- "We take this seriously."
- "That must be frustrating." (unless distress is explicit)

**Implementation:**
- Add post-processing check on LLM responses
- Flag or regenerate responses that match bad tone patterns
- Low priority but improves quality

**Estimated Changes:** ~60 lines

---

## Implementation Order

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Create Constitution Prompt Generator (Task 1)            │
│ 2. Expand Domain Tracking (Task 2)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Intelligence                                        │
├─────────────────────────────────────────────────────────────┤
│ 3. Implement Exploration Logic (Task 3)                      │
│ 4. Implement Domain Traversal Logic (Task 4)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Polish                                              │
├─────────────────────────────────────────────────────────────┤
│ 5. Update Closing Protocol (Task 5)                          │
│ 6. Add Tone Validation (Task 6 - Optional)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Constitution Content Structure

Each constitution will be stored as a TypeScript constant with this structure:

```typescript
interface ConstitutionContent {
  // Section 1: Role & Stance
  role: {
    you_are_not: string[]
    you_are: string[]
    you_do_not: string[]
    internal_feeling: string  // What participant should feel
  }

  // Section 2: Tone & Voice
  tone: {
    qualities: string[]  // calm, mature, respectful, etc.
    sound_like: string[]
    good_examples: string[]
    bad_examples: string[]
  }

  // Section 3: Core Rules
  rules: Array<{
    name: string
    description: string
    if_they_say: string[]
    you_must_explore: string[]
  }>

  // Section 4: Domain Traversal Logic
  traversal: {
    positive: string  // "explore fragility"
    neutral: string   // "widen the lens"
    negative: string  // "deepen without escalating"
  }

  // Section 5: Domain Map
  domains: Array<{
    name: string
    goal: string
    start_question: string
    explore_questions: string[]
    listen_for: string[]
  }>

  // Section 6: Closing
  closing: {
    final_question: string
    do_not: string[]
    tone: string
  }

  // Section 7: Success Criteria (internal reference)
  success_criteria: string[]
}
```

---

## Testing Strategy

### Unit Tests
- Constitution prompt generation produces valid prompts
- Domain tracking correctly identifies covered domains
- Response classification correctly categorizes responses
- Closing logic triggers at appropriate times

### Integration Tests
- Full conversation flow covers all domains
- Safeguarding detection still works
- Message history properly maintained
- Conversation state persists correctly

### Manual Testing
- Conduct test interviews with each participant type
- Verify tone matches constitution guidelines
- Confirm domain coverage at conversation end
- Test edge cases (short answers, tangential responses)

---

## Rollout Strategy

### Phase 1: Development (This Sprint)
- Implement all tasks in development environment
- Run unit and integration tests
- Conduct internal testing

### Phase 2: Pilot Testing
- Deploy to staging environment
- Run with 1-2 test schools
- Collect feedback on conversation quality

### Phase 3: Production Rollout
- Deploy to production
- Monitor conversation metrics
- Iterate based on feedback

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Average domains covered per interview | ~3 | 6+ |
| Interview completion rate | TBD | 85%+ |
| Average interview depth (questions) | ~8 | 10-12 |
| Domain coverage at close | ~30% | 70%+ |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Longer system prompts → higher token cost | Monitor token usage, optimize prompt length |
| More complex state → potential bugs | Thorough testing, backwards compatibility |
| Constitution content drift from docs | Single source of truth, versioning |
| Interview becomes too long | Target 12-15 questions max, smart domain prioritization |

---

## Appendix: File Changes Summary

| File | Action | Estimated Lines |
|------|--------|-----------------|
| `lib/agents/education-interview-agent.ts` | Major modification | +500-600 lines |
| `lib/agents/education-constitutions.ts` | New file | +800-1000 lines |
| `lib/agents/education-synthesis-agent.ts` | No changes | 0 |

---

## Next Steps

1. Review and approve this spec
2. Begin Task 1: Constitution Prompt Generator
3. Iterate through implementation phases
4. Test and deploy

---

*Document prepared by BMad Master for Todd*
