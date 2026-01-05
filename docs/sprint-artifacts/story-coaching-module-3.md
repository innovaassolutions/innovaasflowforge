# Story 1.3: Registration & Sessions

**Status:** TODO

---

## User Story

As a **prospective coaching client**,
I want **to register for an assessment and complete an AI-guided interview**,
So that **I can discover my leadership archetype and connect with the coach**.

---

## Acceptance Criteria

**AC #1:** Given a coach's registration page at `/coach/[slug]/register`, when I submit name and email, then a `participant_session` is created with status 'registered' and I receive confirmation

**AC #2:** Given I'm a registered participant, when I access `/coach/[slug]/session/[token]`, then I see the session interface with coach's branding applied

**AC #3:** Given I send a message in the session, when the AI responds, then it follows the archetype interview flow (19 questions across 4 sections)

**AC #4:** Given I complete all interview questions, when the AI determines completion, then my default archetype and authentic archetype are calculated and stored in session metadata

**AC #5:** Given a coach creates a client from dashboard, when they click "Send Invitation", then the client receives a branded email with their unique session link

**AC #6:** Given the session starts (first message), when AI sends greeting, then it includes the coach's custom welcome message (if configured)

**AC #7:** Given I'm mid-session, when I refresh or return later, then my conversation history is preserved and I can continue

**AC #8:** Given the interview is complete, when session ends, then client_status is updated to 'completed' and results are stored

---

## Implementation Details

### Tasks / Subtasks

- [ ] **Create registration page** (AC: #1)
  - [ ] Create `app/coach/[slug]/register/page.tsx`
  - [ ] Form fields: name, email
  - [ ] Client-side validation
  - [ ] Success confirmation with next steps
  - [ ] Apply tenant branding

- [ ] **Create registration API** (AC: #1)
  - [ ] Create `app/api/coach/[slug]/register/route.ts`
  - [ ] Validate tenant exists
  - [ ] Create participant_session with status 'registered'
  - [ ] Generate unique session token
  - [ ] Return session token/URL

- [ ] **Create session page** (AC: #2, #6, #7)
  - [ ] Create `app/coach/[slug]/session/[token]/page.tsx`
  - [ ] Follow pattern from `app/session/[token]/page.tsx`
  - [ ] Load conversation history on mount
  - [ ] Display messages with branded styling
  - [ ] Message input with send button
  - [ ] Loading/thinking states

- [ ] **Create session messaging API** (AC: #3, #7)
  - [ ] Create `app/api/coach/[slug]/session/route.ts`
  - [ ] Validate session token
  - [ ] Load/save conversation history
  - [ ] Call archetype interview agent
  - [ ] Update session state

- [ ] **Implement archetype interview agent** (AC: #3, #4, #8)
  - [ ] Create `lib/agents/archetype-interview-agent.ts`
  - [ ] Import from existing `archetype-constitution.ts`
  - [ ] Track question progress through sections
  - [ ] Determine when all questions answered
  - [ ] Call `calculateResults()` on completion
  - [ ] Return completion signal

- [ ] **Create invitation email template** (AC: #5)
  - [ ] Create `lib/email/templates/coaching-invitation.tsx`
  - [ ] Apply coach branding (logo, colors, name)
  - [ ] Include personalized greeting
  - [ ] Include session link button
  - [ ] Include coach contact info

- [ ] **Create send invitation API** (AC: #5)
  - [ ] Create `app/api/coach/[slug]/invite/route.ts`
  - [ ] Validate coach is authenticated
  - [ ] Create participant_session
  - [ ] Send email via Resend
  - [ ] Return success status

- [ ] **Handle completion flow** (AC: #4, #8)
  - [ ] Detect completion in agent
  - [ ] Calculate and store results
  - [ ] Update client_status to 'completed'
  - [ ] Log usage event
  - [ ] Redirect to results based on disclosure config

### Technical Summary

This story implements the core participant experience: registration, AI interview, and completion. It leverages the existing archetype constitution (which already has all 19 questions and scoring) and follows the session UI pattern from the consultant module. The interview agent guides participants through the structured assessment while maintaining state across sessions.

### Project Structure Notes

- **Files to create:**
  - `app/coach/[slug]/register/page.tsx`
  - `app/coach/[slug]/session/[token]/page.tsx`
  - `app/api/coach/[slug]/register/route.ts`
  - `app/api/coach/[slug]/session/route.ts`
  - `app/api/coach/[slug]/invite/route.ts`
  - `lib/agents/archetype-interview-agent.ts`
  - `lib/email/templates/coaching-invitation.tsx`

- **Files to reference (not modify):**
  - `lib/agents/archetype-constitution.ts` - Complete with questions & scoring
  - `app/session/[token]/page.tsx` - UI pattern reference

- **Expected test locations:** Full flow testing via browser

- **Estimated effort:** 4 story points (~3 days)

- **Prerequisites:** Stories 1.1, 1.2 (database and branding infrastructure)

### Key Code References

**Archetype Constitution (COMPLETE):**
- File: `lib/agents/archetype-constitution.ts`
- Exports: `SURVEY_SECTIONS`, `ARCHETYPE_CONSTITUTION`, `calculateResults()`
- Contains: All 19 questions, scoring logic, archetype definitions

**Session UI Pattern:**
- File: `app/session/[token]/page.tsx`
- Pattern: Message state, scroll handling, loading states, completion detection

**Agent Pattern:**
- File: `lib/agents/assessment-agent.ts`
- Pattern: Anthropic client, system prompts, conversation history

**Email Pattern:**
- File: `lib/email/templates/` (reference existing templates)
- Service: `lib/resend.ts`

### Archetype Interview Agent Structure

```typescript
// lib/agents/archetype-interview-agent.ts
interface ArchetypeSessionState {
  currentSection: number;
  currentQuestion: number;
  responses: Record<string, string>;
  isComplete: boolean;
  results?: ArchetypeResults;
}

export async function processArchetypeMessage(
  message: string | null,
  sessionState: ArchetypeSessionState,
  tenant: TenantProfile
): Promise<{
  response: string;
  newState: ArchetypeSessionState;
  isComplete: boolean;
}> {
  // Use ARCHETYPE_CONSTITUTION for system prompt
  // Track progress through SURVEY_SECTIONS
  // Call calculateResults() when complete
}
```

### Interview Flow Reference

From `archetype-constitution.ts`:
1. Q1-Q3: Context setting (role, challenges, aspirations)
2. Q4-Q12: Default mode identification (9 questions about responses under pressure)
3. Q13-Q16: Authentic mode identification (4 questions about natural state)
4. Q17-Q19: Friction signals (3 questions about misalignment)

---

## Context References

**Tech-Spec:** [tech-spec-coaching-module.md](../tech-spec-coaching-module.md) - Contains:

- Interview flow architecture diagram
- Agent structure code samples
- Session state management approach

**Archetype Framework:** [Leadership_Archetypes.md](../leadingwithmeaning/Leadership_Archetypes.md) - Mark's archetype methodology

---

## Dev Agent Record

### Agent Model Used

(To be filled during implementation)

### Debug Log References

(To be filled during implementation)

### Completion Notes

(To be filled during implementation)

### Files Modified

(To be filled during implementation)

### Test Results

(To be filled during implementation)

---

## Review Notes

### Senior Developer Review (AI)

(To be filled during code review)
