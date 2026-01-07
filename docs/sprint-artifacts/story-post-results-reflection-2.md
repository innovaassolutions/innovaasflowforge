# Story 1.2: Reflection Flow

**Status:** Completed

---

## User Story

As a coaching participant,
I want to answer AI-generated reflection questions based on my archetype results,
So that I can deepen my understanding and capture insights for my coach.

---

## Acceptance Criteria

**AC #1:** Given a participant who clicks "go deeper", When the reflection page loads, Then AI generates 2-3 contextual questions based on their archetype

**AC #2:** Given reflection questions displayed, When participant submits a response, Then AI acknowledges and may ask follow-up questions

**AC #3:** Given reflection conversation, When stored in database, Then reflection_messages JSONB contains the full exchange

**AC #4:** Given reflection completion (2-3 exchanges), When AI wraps up, Then participant sees completion confirmation with next steps

---

## Implementation Details

### Tasks / Subtasks

- [x] **Reflection Agent** (AC: #1)
  - [x] Create `lib/agents/reflection-agent.ts`
  - [x] Create system prompt that references participant's archetype
  - [x] Generate 2-3 contextual reflection questions
  - [x] Handle follow-up generation based on responses
  - [x] Detect conversation completion (2-3 exchanges max)

- [x] **Reflection Page** (AC: #1, #2, #4)
  - [x] Create `app/coach/[slug]/results/[token]/reflect/page.tsx`
  - [x] Use same UI pattern as session page (messages list)
  - [x] Display AI-generated questions on load
  - [x] Handle user responses with loading states
  - [x] Show completion confirmation when done

- [x] **Reflection Message API** (AC: #2, #3)
  - [x] Create `app/api/coach/[slug]/results/[token]/reflect/route.ts`
  - [x] Accept user message, return AI response
  - [x] Store conversation in `reflection_messages` JSONB
  - [x] Update `reflection_status` appropriately
  - [x] Detect and signal conversation completion

- [x] **Database Updates** (AC: #3)
  - [x] Update session with reflection_status on each message
  - [x] Append messages to reflection_messages array
  - [x] Track completion state

- [x] **Navigation Flow** (AC: #4)
  - [x] Link from results page "go deeper" to reflection page
  - [x] On completion, show confirmation with options
  - [x] Option to return to results page
  - [x] Option to trigger email/PDF (handled in Story 1.3)

- [ ] **Manual Testing** (AC: #1-#4)
  - [ ] Verify AI generates relevant questions for different archetypes
  - [ ] Test conversation flow (submit response, get follow-up)
  - [ ] Verify messages stored in database correctly
  - [ ] Test completion detection and confirmation display

### Technical Summary

This story implements the AI-powered reflection conversation flow. Key components:

1. **Reflection Agent** - Uses Claude to generate contextual questions based on the participant's archetype and tension pattern. Questions should be warm, curious, and non-judgmental.

2. **Reflection Page** - Similar UI pattern to the session page with messages list, but simpler (no progress bar, shorter conversation).

3. **Reflection API** - Handles message exchange, stores in JSONB, detects completion.

The AI should:
- Generate 2-3 open-ended questions based on archetype
- Acknowledge responses warmly
- Ask 1-2 follow-ups if appropriate
- Wrap up after 2-3 exchanges total

### Project Structure Notes

- **Files to create:**
  - `lib/agents/reflection-agent.ts`
  - `app/coach/[slug]/results/[token]/reflect/page.tsx`
  - `app/api/coach/[slug]/results/[token]/reflect/route.ts`

- **Files to modify:**
  - `app/coach/[slug]/results/[token]/page.tsx` (add link to reflection)

- **Expected test locations:** Manual testing via development server

- **Estimated effort:** 3 story points (2-3 days)

- **Prerequisites:** Story 1.1 (Results Page Foundation)

### Key Code References

| Reference | Location | Usage |
|-----------|----------|-------|
| Session message UI | `app/coach/[slug]/session/[token]/page.tsx` | Message list pattern |
| Interview agent | `lib/agents/archetype-interview-agent.ts` | AI conversation pattern |
| Anthropic client | `lib/anthropic.ts` | Claude API usage |
| Archetype content | `lib/agents/archetype-constitution.ts` | Archetype descriptions |

---

## Context References

**Tech-Spec:** [tech-spec-post-results-reflection.md](../tech-spec-post-results-reflection.md) - Primary context document containing:

- Reflection agent system prompt structure
- Conversation flow design
- Database schema for reflection_messages

**Architecture:** Reflection follows same conversation pattern as assessment interview but is shorter (2-3 exchanges vs 19 questions).

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript build passed with no errors in new files
- Next.js build completed successfully

### Completion Notes

Implemented the complete reflection flow including:

1. **Reflection Agent** (`lib/agents/reflection-agent.ts`)
   - Uses Claude claude-sonnet-4 for AI-powered question generation
   - System prompt includes participant's archetype results and tension pattern
   - Generates 2-3 contextual reflection questions
   - Handles follow-up conversation with exchange tracking
   - Detects completion after 2-3 exchanges

2. **Reflection API** (`app/api/coach/[slug]/results/[token]/reflect/route.ts`)
   - GET endpoint to retrieve current reflection state and messages
   - POST endpoint to send messages and receive AI responses
   - Stores conversation in reflection_messages JSONB column
   - Updates reflection_status appropriately (pending → accepted → completed)

3. **Reflection Page** (`app/coach/[slug]/results/[token]/reflect/page.tsx`)
   - Same UI pattern as session page (chat interface)
   - Displays AI-generated questions on load
   - Handles user responses with loading states
   - Shows completion confirmation with return to results button
   - Supports resuming existing reflections

4. **ReflectionChoice Component** (`components/coaching/ReflectionChoice.tsx`)
   - "Want to go deeper?" choice UI on results page
   - Shows appropriate state (not started, in progress, completed)
   - Links to reflection page or shows completion message

5. **Results Page Updated** (`app/coach/[slug]/results/[token]/page.tsx`)
   - Added ReflectionChoice component between "Moving Forward" and footer

### Files Modified

**Created:**
- `lib/agents/reflection-agent.ts` - Reflection AI agent
- `app/api/coach/[slug]/results/[token]/reflect/route.ts` - Reflection API
- `app/coach/[slug]/results/[token]/reflect/page.tsx` - Reflection page
- `components/coaching/ReflectionChoice.tsx` - Reflection choice component

**Modified:**
- `components/coaching/index.ts` - Export ReflectionChoice
- `app/coach/[slug]/results/[token]/page.tsx` - Add ReflectionChoice component

### Test Results

- TypeScript: No errors in new files (pre-existing test file errors unrelated)
- Next.js Build: Successful compilation
- Manual testing: Pending (per story requirements)

---

## Review Notes

<!-- Will be populated during code review -->
