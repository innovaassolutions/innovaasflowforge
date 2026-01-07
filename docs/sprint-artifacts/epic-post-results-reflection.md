# innovaasflowforge - Epic Breakdown

**Date:** 2026-01-06
**Project Level:** Quick-Flow
**Tech-Spec:** [tech-spec-post-results-reflection.md](../tech-spec-post-results-reflection.md)

---

## Epic 1: Post-Results Reflection Flow

**Slug:** post-results-reflection

### Goal

Enable coaching participants to see their archetype results immediately after assessment, with the option to go deeper through AI-guided reflection or exit gracefully with a branded PDF and follow-up email. This maximizes value delivery to participants while capturing richer insights for coaches.

### Scope

**In Scope:**
- Results page displaying comprehensive archetype insights
- "Want to go deeper?" choice UI
- AI-generated contextual reflection questions
- Thank you email with branded PDF attachment
- Persistent return link for later reflection
- Configurable booking CTA per tenant

**Out of Scope:**
- Voice-based reflection
- Multiple assessment types
- Coach dashboard modifications
- Custom domain setup (separate epic)

### Success Criteria

1. Participants see full archetype results immediately after completing assessment
2. Tension patterns display with neutral styling (sand/blue, not red/orange)
3. Participants can choose to reflect deeper or exit gracefully
4. Declining participants receive email with PDF within 30 seconds
5. Booking CTA is configurable per tenant (enable/disable + custom URL)
6. Return links provide persistent access to results and reflection

### Dependencies

- Existing coaching session infrastructure (`app/coach/[slug]/session/[token]/page.tsx`)
- Archetype constitution with scoring (`lib/agents/archetype-constitution.ts`)
- Resend email infrastructure (`lib/resend.ts`)
- React-PDF renderer (`@react-pdf/renderer`)
- Tenant branding context (`lib/contexts/tenant-context.tsx`)

---

## Story Map - Epic 1

```
Epic: Post-Results Reflection Flow (13 points)

├── Story 1.1: Results Page Foundation (5 points)
│   Dependencies: None
│   Delivers: Results page with archetype display + redirect from session
│
├── Story 1.2: Reflection Flow (3 points)
│   Dependencies: Story 1.1
│   Delivers: AI reflection questions + conversation UI
│
├── Story 1.3: Email & PDF (3 points)
│   Dependencies: Story 1.1
│   Delivers: Branded PDF generation + thank you email
│
└── Story 1.4: Polish & Integration (2 points)
    Dependencies: Stories 1.1, 1.2, 1.3
    Delivers: Choice UI, graceful exit flow, booking CTA, return links
```

---

## Stories - Epic 1

### Story 1.1: Results Page Foundation

As a coaching participant,
I want to see my archetype results immediately after completing the assessment,
So that I understand my leadership style and can reflect on the insights.

**Acceptance Criteria:**

**AC #1:** Given a completed assessment, When the session page detects completion, Then it redirects to `/coach/[slug]/results/[token]`

**AC #2:** Given a participant on the results page, When the page loads, Then they see their primary archetype name and description

**AC #3:** Given a participant with a tension pattern, When viewing results, Then the tension pattern displays with sand-colored background and blue/teal text (not red/orange warning colors)

**AC #4:** Given results data, When rendering the "Moving Forward" section, Then actionable recommendations and steps are displayed

**Prerequisites:** None (foundational story)

**Technical Notes:** Create results page route, ArchetypeResults component, TensionPatternCard with correct styling per Mark's feedback. Update session page to redirect on completion.

**Estimated Effort:** 5 points (3-5 days)

---

### Story 1.2: Reflection Flow

As a coaching participant,
I want to answer AI-generated reflection questions based on my archetype results,
So that I can deepen my understanding and capture insights for my coach.

**Acceptance Criteria:**

**AC #1:** Given a participant who clicks "go deeper", When the reflection page loads, Then AI generates 2-3 contextual questions based on their archetype

**AC #2:** Given reflection questions displayed, When participant submits a response, Then AI acknowledges and may ask follow-up questions

**AC #3:** Given reflection conversation, When stored in database, Then reflection_messages JSONB contains the full exchange

**AC #4:** Given reflection completion (2-3 exchanges), When AI wraps up, Then participant sees completion confirmation

**Prerequisites:** Story 1.1 (Results Page Foundation)

**Technical Notes:** Create reflection-agent.ts for AI question generation, reflection page with conversation UI (similar to session page), reflection message API endpoint.

**Estimated Effort:** 3 points (2-3 days)

---

### Story 1.3: Email & PDF

As a coaching participant,
I want to receive a branded PDF of my results via email,
So that I can reference them offline and share with my coach.

**Acceptance Criteria:**

**AC #1:** Given participant completion (with or without reflection), When complete endpoint is called, Then branded PDF is generated matching results page content

**AC #2:** Given PDF generation, When rendered, Then it includes tenant logo, colors, and branding from brand_config

**AC #3:** Given PDF and email ready, When email is sent, Then participant receives email within 30 seconds with PDF attachment

**AC #4:** Given email content, When participant views it, Then it includes thank you message, return link, and booking CTA (if enabled)

**Prerequisites:** Story 1.1 (Results Page Foundation)

**Technical Notes:** Create archetype-results-pdf.tsx using @react-pdf/renderer, archetype-results-email.tsx template, complete API endpoint that triggers both.

**Estimated Effort:** 3 points (2-3 days)

---

### Story 1.4: Polish & Integration

As a coaching participant,
I want a clear choice between going deeper or receiving my results and exiting,
So that my experience feels complete regardless of which path I choose.

**Acceptance Criteria:**

**AC #1:** Given a participant on the results page, When viewing, Then they see "Want to go deeper?" with two clear button options

**AC #2:** Given a participant who clicks "No thanks", When they decline, Then email is sent immediately and they see a thank you confirmation

**AC #3:** Given a tenant with booking enabled, When participant views results or receives email, Then booking CTA button appears with configured URL

**AC #4:** Given a tenant without booking configured, When participant views results, Then no booking CTA is displayed

**AC #5:** Given a participant who received the email, When they click the return link, Then they can access results and add reflection anytime

**Prerequisites:** Stories 1.1, 1.2, 1.3

**Technical Notes:** Create ReflectionChoice component, BookingCTA component with tenant config, update tenant BrandConfig interface for booking settings, handle graceful exit flow.

**Estimated Effort:** 2 points (1-2 days)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 13

**Estimated Timeline:** 6-8 working days

**Recommended Sequence:**
1. Story 1.1 (Foundation) - Must be first
2. Stories 1.2 and 1.3 can be done in parallel
3. Story 1.4 (Polish) - Integrates all pieces

**Story Files:**
- [story-post-results-reflection-1.md](story-post-results-reflection-1.md)
- [story-post-results-reflection-2.md](story-post-results-reflection-2.md)
- [story-post-results-reflection-3.md](story-post-results-reflection-3.md)
- [story-post-results-reflection-4.md](story-post-results-reflection-4.md)
