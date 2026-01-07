# innovaasflowforge - Technical Specification

**Author:** Todd
**Date:** 2026-01-06
**Project Level:** Quick-Flow
**Change Type:** Feature Addition
**Development Context:** Brownfield

---

## Context

### Available Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Meeting Minutes | `docs/meetingminutes/assessment_platform_project_discussion.md` | Mark's feedback on results page |
| Coaching Module Tech-Spec | `docs/tech-spec-coaching-module.md` | Parent feature architecture |
| Archetype Constitution | `lib/agents/archetype-constitution.ts` | Scoring, archetypes, patterns |
| Session Page | `app/coach/[slug]/session/[token]/page.tsx` | Current session implementation |
| Design System | `docs/design-system.md` | Pearl Vibrant theme reference |

### Project Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 15.5.7 |
| Language | TypeScript | ^5 |
| React | React | 18.3.1 |
| Database | Supabase (PostgreSQL) | 2.39.0 |
| Styling | TailwindCSS | 3.4.1 |
| AI - Claude | @anthropic-ai/sdk | 0.27.0 |
| Email | resend | 6.4.2 |
| PDF | @react-pdf/renderer | 4.3.1 |
| Charts | recharts | 3.4.1 |
| State | zustand | 4.4.7 |
| UI Components | Radix UI | Various (@radix-ui/*) |
| Icons | lucide-react | 0.553.0 |

### Existing Codebase Structure

**Current Session Flow:**
```
app/coach/[slug]/session/[token]/page.tsx
├── 19 multiple choice questions
├── AI-guided conversation
├── On completion: Shows "Assessment Complete!" message
└── No results display, no follow-up
```

**Relevant Existing Code:**
```
lib/agents/archetype-constitution.ts    # All archetype content, scoring logic
lib/agents/archetype-interview-agent.ts # Interview agent (calculates results)
lib/pdf-document.tsx                    # Existing PDF patterns
lib/resend.ts                           # Email infrastructure
lib/theme/brand-theme.ts                # Tenant branding CSS generation
```

**Database:**
- `coaching_sessions` - Stores session data, results in `metadata` JSONB
- `tenant_profiles` - Brand config, booking URL, feature toggles

---

## The Change

### Problem Statement

The current coaching assessment ends abruptly with a generic "Assessment Complete" message. Participants:
- Don't see their archetype results immediately
- Have no opportunity for deeper reflection
- Receive no automated follow-up email
- Cannot return to add insights later

This misses the opportunity to:
1. Deliver immediate value to participants (their results)
2. Capture richer insights through reflection questions
3. Maintain engagement with automated follow-up
4. Drive booking conversions with integrated CTA

**Mark's Specific Feedback:**
- Visual styling needs adjustment (no red/orange warning colors)
- "Misaligned" should be renamed to "Tension Pattern"
- Long-form questions should move to AFTER results display
- PDF needed for offline reference
- Booking button needed to maintain momentum

### Proposed Solution

Build a **Post-Results Reflection Flow** with four components:

1. **Results Page** (`/coach/[slug]/results/[token]`)
   - Full archetype insights with branded styling
   - "Tension Pattern" visualization (sand background, blue text)
   - "Moving Forward" guidance section
   - Booking CTA (configurable)
   - "Want to go deeper?" choice

2. **Reflection Flow** (if user chooses to go deeper)
   - AI-generated contextual questions based on archetype results
   - Conversational interface (reuse session UI pattern)
   - Enhanced PDF with reflection responses

3. **Graceful Exit** (if user declines deeper reflection)
   - Thank you email from coach (branded)
   - PDF attachment with base results
   - Link to return and add reflection anytime

4. **Configuration**
   - Booking URL in tenant brand_config
   - Toggle to enable/disable booking CTA
   - All styling follows tenant branding

### Scope

**In Scope:**

1. Results page with comprehensive archetype insights
2. Visual styling per Mark's feedback (tension pattern colors)
3. "Want to go deeper?" choice UI component
4. AI-generated contextual reflection questions
5. Reflection conversation flow (post-results)
6. Thank you email with branded PDF attachment
7. Persistent return link for adding reflection later
8. Booking CTA (configurable per tenant)
9. Branded PDF generation matching results page
10. Database updates to track reflection status

**Out of Scope:**

1. Voice-based reflection (text chat only)
2. Multiple assessment types (archetype only for now)
3. Coach dashboard changes (participant-facing only)
4. Custom domain setup (separate scope)
5. Editing previous responses

---

## Implementation Details

### Source Tree Changes

**NEW FILES:**

| Path | Action | Description |
|------|--------|-------------|
| `app/coach/[slug]/results/[token]/page.tsx` | CREATE | Results display page with archetype insights |
| `app/coach/[slug]/results/[token]/reflect/page.tsx` | CREATE | Reflection conversation page |
| `app/api/coach/[slug]/results/[token]/route.ts` | CREATE | Results data API |
| `app/api/coach/[slug]/results/[token]/reflect/route.ts` | CREATE | Reflection message API |
| `app/api/coach/[slug]/results/[token]/complete/route.ts` | CREATE | Complete & send email API |
| `lib/agents/reflection-agent.ts` | CREATE | AI agent for generating reflection questions |
| `lib/pdf/archetype-results-pdf.tsx` | CREATE | Branded PDF document component |
| `lib/email/templates/archetype-results-email.tsx` | CREATE | Thank you email template |
| `components/coaching/ArchetypeResults.tsx` | CREATE | Results display component |
| `components/coaching/TensionPatternCard.tsx` | CREATE | Tension pattern visualization |
| `components/coaching/BookingCTA.tsx` | CREATE | Configurable booking button |
| `components/coaching/ReflectionChoice.tsx` | CREATE | "Want to go deeper?" UI |
| `supabase/migrations/20260106_008_add_reflection_tracking.sql` | CREATE | Add reflection fields to sessions |

**MODIFIED FILES:**

| Path | Action | Description |
|------|--------|-------------|
| `app/coach/[slug]/session/[token]/page.tsx` | MODIFY | Redirect to results page on completion |
| `lib/agents/archetype-interview-agent.ts` | MODIFY | Ensure results stored in session metadata |
| `types/tenant.ts` | MODIFY | Add booking_config to BrandConfig interface |

### Technical Approach

**1. Results Page Architecture**

The results page fetches session data and renders archetype insights:

```typescript
// app/coach/[slug]/results/[token]/page.tsx
export default async function ResultsPage({ params }: { params: { slug: string; token: string } }) {
  const session = await getSessionWithResults(params.token)
  const tenant = await getTenantBySlug(params.slug)

  if (!session || session.status !== 'completed') {
    redirect(`/coach/${params.slug}/session/${params.token}`)
  }

  return (
    <BrandedLayout tenant={tenant}>
      <ArchetypeResults results={session.metadata.results} tenant={tenant} />
      <ReflectionChoice
        sessionToken={params.token}
        hasReflection={session.metadata.has_reflection}
      />
      {tenant.brand_config.booking?.enabled && (
        <BookingCTA url={tenant.brand_config.booking.url} />
      )}
    </BrandedLayout>
  )
}
```

**2. Archetype Results Display**

Based on Mark's feedback, the results should show:

```typescript
interface ArchetypeResults {
  primaryArchetype: {
    name: string           // e.g., "Team Steward"
    description: string    // Full archetype description
    strengths: string[]    // Key strengths
    challenges: string[]   // Growth areas
  }
  tensionPattern: {
    name: string           // e.g., "Under Pressure → Default Mode"
    description: string    // What this means
    triggers: string[]     // Common triggers
  } | null
  movingForward: {
    recommendations: string[]
    actionSteps: string[]
  }
  scores: {
    [archetype: string]: number  // Raw scores for transparency
  }
}
```

**3. Visual Styling - Tension Pattern**

Per Mark's feedback, tension patterns should NOT look like warnings:

```typescript
// components/coaching/TensionPatternCard.tsx
export function TensionPatternCard({ pattern }: { pattern: TensionPattern }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: 'var(--brand-bg-muted)',  // Sand-colored, not orange
        border: '1px solid var(--brand-border)',
      }}
    >
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--brand-secondary)' }}  // Blue/teal, not red
      >
        Tension Pattern
      </h3>
      <p style={{ color: 'var(--brand-text)' }}>
        {pattern.description}
      </p>
    </div>
  )
}
```

**4. Reflection Agent**

AI generates contextual questions based on archetype results:

```typescript
// lib/agents/reflection-agent.ts
export async function generateReflectionQuestions(
  results: ArchetypeResults,
  tenant: TenantProfile
): Promise<string> {
  const systemPrompt = `You are a thoughtful leadership coach helping ${tenant.display_name}'s client
reflect on their Leadership Archetype Assessment results.

Their primary archetype is: ${results.primaryArchetype.name}
${results.tensionPattern ? `They have a tension pattern: ${results.tensionPattern.name}` : ''}

Generate 2-3 open-ended reflection questions that:
1. Help them explore how this archetype shows up in their work
2. Invite them to consider specific situations where they've experienced the tension pattern
3. Encourage them to think about one small step they could take

Be warm, curious, and non-judgmental. This is reflection, not therapy.`

  // Use Claude to generate personalized questions
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Please generate reflection questions for this participant.' }]
  })

  return response.content[0].text
}
```

**5. Email with PDF**

```typescript
// app/api/coach/[slug]/results/[token]/complete/route.ts
export async function POST(request: Request, { params }: RouteParams) {
  const session = await getSessionWithResults(params.token)
  const tenant = await getTenantBySlug(params.slug)

  // Generate branded PDF
  const pdfBuffer = await generateArchetypePDF(session, tenant)

  // Send email via Resend
  await resend.emails.send({
    from: `${tenant.display_name} <noreply@flowforge.app>`,
    to: session.stakeholder_email,
    subject: `Your Leadership Archetype Results - ${tenant.display_name}`,
    react: ArchetypeResultsEmail({
      participantName: session.stakeholder_name,
      results: session.metadata.results,
      tenant: tenant,
      returnLink: `${process.env.NEXT_PUBLIC_APP_URL}/coach/${tenant.slug}/results/${params.token}`,
    }),
    attachments: [{
      filename: 'leadership-archetype-results.pdf',
      content: pdfBuffer,
    }]
  })

  // Update session status
  await updateSessionStatus(params.token, { email_sent: true, email_sent_at: new Date() })

  return Response.json({ success: true })
}
```

**6. Booking Configuration**

Add to tenant brand_config:

```typescript
// types/tenant.ts
interface BrandConfig {
  // ... existing fields
  booking?: {
    enabled: boolean
    url: string           // Acuity/Calendly link
    buttonText?: string   // Default: "Book Your Review Call"
    showOnResults: boolean
    showInEmail: boolean
  }
}
```

**7. Database Migration**

```sql
-- supabase/migrations/20260106_008_add_reflection_tracking.sql

-- Add reflection tracking to coaching_sessions
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS reflection_status TEXT DEFAULT 'none';
-- Values: 'none', 'offered', 'accepted', 'completed', 'declined'

ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS reflection_messages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;

-- Index for querying by reflection status
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_reflection_status
ON coaching_sessions(tenant_id, reflection_status);

COMMENT ON COLUMN coaching_sessions.reflection_status IS
'Tracks participant''s post-results reflection journey: none → offered → accepted/declined → completed';
```

### Existing Patterns to Follow

**From `app/coach/[slug]/session/[token]/page.tsx`:**
- Token-based session access pattern
- Brand CSS variable injection via `useTenant()` hook
- Message state management with `useState`
- Scroll-to-bottom on new messages
- Loading/sending states

**From `lib/pdf-document.tsx`:**
- React-PDF document structure
- Page layout with margins
- Section headers and content blocks
- Brand color integration

**From `lib/email/templates/`:**
- React Email component patterns
- Responsive email layout
- CTA button styling

### Integration Points

| System | Integration | Details |
|--------|-------------|---------|
| Session Page | Redirect | On completion, redirect to `/results/[token]` |
| Archetype Agent | Data Source | Results from `session.metadata.results` |
| Tenant Context | Branding | All pages use tenant CSS variables |
| Resend | Email | Thank you email with PDF attachment |
| Supabase Storage | PDF | Store generated PDFs for later access |
| Claude AI | Reflection | Generate contextual reflection questions |

---

## Development Context

### Relevant Existing Code

| File | Reference For |
|------|---------------|
| `app/coach/[slug]/session/[token]/page.tsx` | Session UI structure, tenant branding |
| `lib/agents/archetype-constitution.ts` | Archetype definitions, scoring |
| `lib/pdf-document.tsx` | PDF generation patterns |
| `lib/resend.ts` | Email sending |
| `lib/theme/brand-theme.ts` | CSS variable generation |
| `components/ui/` | Shared UI components |

### Dependencies

**Framework/Libraries (from package.json):**

| Package | Version | Usage |
|---------|---------|-------|
| next | 15.5.7 | App framework |
| react | 18.3.1 | UI library |
| @react-pdf/renderer | 4.3.1 | PDF generation |
| resend | 6.4.2 | Email sending |
| @anthropic-ai/sdk | 0.27.0 | Claude AI for reflection |
| tailwindcss | 3.4.1 | Styling |
| lucide-react | 0.553.0 | Icons |

**Internal Modules:**

| Module | Purpose |
|--------|---------|
| `lib/supabase/server.ts` | Server-side Supabase client |
| `lib/contexts/tenant-context.tsx` | Tenant branding context |
| `lib/agents/archetype-constitution.ts` | Archetype content & scoring |
| `lib/resend.ts` | Email client |

### Configuration Changes

| File | Change |
|------|--------|
| `types/tenant.ts` | Add `booking` to BrandConfig interface |
| No `.env` changes | Uses existing keys |

### Existing Conventions (Brownfield)

**Code Style:**
- TypeScript strict mode
- Functional components with hooks
- camelCase variables, PascalCase components
- Async/await for all async operations
- CSS variables for branding: `var(--brand-*)`

**File Organization:**
- Feature pages under `app/coach/[slug]/`
- API routes under `app/api/coach/[slug]/`
- Components in `components/coaching/`
- PDF components in `lib/pdf/`

**Database:**
- snake_case column names
- JSONB for flexible schemas (metadata, reflection_messages)
- RLS enabled on all tables

### Test Framework & Standards

No automated testing framework. Manual testing via:
- Development server at localhost:3000
- Supabase SQL testing in dashboard
- Email testing via Resend dashboard

---

## Implementation Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20.x LTS |
| Framework | Next.js (App Router) | 15.5.7 |
| Language | TypeScript | 5.x |
| Database | Supabase PostgreSQL | Latest |
| AI | Anthropic Claude | claude-sonnet-4-20250514 |
| PDF | @react-pdf/renderer | 4.3.1 |
| Email | Resend | 6.4.2 |
| Styling | TailwindCSS + CSS Variables | 3.4.1 |

---

## Technical Details

### Results Page Data Flow

```
1. User completes 19-question assessment
   └─► Session status: 'completed'
   └─► Results stored in session.metadata.results

2. Session page redirects to /results/[token]
   └─► Results page fetches session data
   └─► Renders ArchetypeResults component
   └─► Shows ReflectionChoice component

3a. User clicks "Yes, let's go deeper"
    └─► reflection_status: 'accepted'
    └─► Navigate to /results/[token]/reflect
    └─► AI generates contextual questions
    └─► Conversation stored in reflection_messages

3b. User clicks "No thanks, I'm good"
    └─► reflection_status: 'declined'
    └─► Trigger email with PDF
    └─► Show thank you confirmation
    └─► Display return link for later
```

### PDF Structure

```
┌─────────────────────────────────────────┐
│  [Logo]          Leadership Archetype   │
│                  Assessment Results     │
├─────────────────────────────────────────┤
│  Prepared for: [Participant Name]       │
│  Date: [Assessment Date]                │
│  Coach: [Tenant Display Name]           │
├─────────────────────────────────────────┤
│                                         │
│  YOUR PRIMARY ARCHETYPE                 │
│  ══════════════════════                 │
│  [Archetype Name]                       │
│  [Description paragraph]                │
│                                         │
│  Key Strengths:                         │
│  • [Strength 1]                         │
│  • [Strength 2]                         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  TENSION PATTERN (if applicable)        │
│  ════════════════                       │
│  [Pattern description]                  │
│  [Triggers and context]                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  MOVING FORWARD                         │
│  ══════════════                         │
│  [Recommendations]                      │
│  [Action steps]                         │
│                                         │
├─────────────────────────────────────────┤
│  [Booking CTA if enabled]               │
│  [Return link]                          │
│                                         │
│  [Powered by FlowForge - if enabled]    │
└─────────────────────────────────────────┘
```

### Reflection Conversation Flow

```
AI: "Thank you for exploring your results! Based on your Team Steward
archetype, I have a few reflection questions for you:

1. Can you think of a recent situation where you prioritized team
   harmony over addressing a difficult issue? What was the outcome?

2. Your tension pattern suggests you may default to conflict avoidance
   under pressure. When do you notice this happening most?

3. What's one small step you could take this week to address something
   you've been avoiding?

Take your time - there's no right or wrong answer here."

User: [Responds to questions]

AI: [Acknowledges, asks follow-up if appropriate, or wraps up warmly]

[After 2-3 exchanges]
AI: "Thank you for these reflections! I've added them to your results.
You'll receive an email with your complete assessment including these
insights. [Booking CTA if enabled]"
```

---

## Development Setup

```bash
# Already set up - no additional setup needed
npm run dev

# Access coaching flow at:
# http://localhost:3000/coach/[slug]/session/[token]
# Results will redirect to:
# http://localhost:3000/coach/[slug]/results/[token]
```

---

## Implementation Guide

### Setup Steps

1. Create feature branch: `git checkout -b feature/post-results-reflection`
2. Verify dev environment: `npm run dev`
3. Review existing session page: `app/coach/[slug]/session/[token]/page.tsx`
4. Review archetype constitution: `lib/agents/archetype-constitution.ts`
5. Review existing PDF patterns: `lib/pdf-document.tsx`

### Implementation Steps

**Story 1: Results Page Foundation**
1. Create database migration for reflection tracking
2. Create results page route and component
3. Create ArchetypeResults display component
4. Create TensionPatternCard with correct styling
5. Update session page to redirect on completion
6. Test results display with real session data

**Story 2: Reflection Flow**
1. Create reflection-agent.ts for AI question generation
2. Create reflection page with conversation UI
3. Create reflection message API endpoint
4. Store reflection messages in session
5. Test full reflection conversation flow

**Story 3: Email & PDF**
1. Create archetype-results-pdf.tsx component
2. Create archetype-results-email.tsx template
3. Create complete endpoint (triggers email + PDF)
4. Add BookingCTA component (configurable)
5. Test email delivery with PDF attachment

**Story 4: Polish & Integration**
1. Add "Want to go deeper?" choice UI
2. Handle graceful exit flow (decline → email)
3. Add return link functionality
4. Update tenant brand_config for booking settings
5. End-to-end testing of all paths

### Testing Strategy

**Manual Testing Checklist:**

- [ ] Results page loads with archetype data
- [ ] Tension pattern styled correctly (no warning colors)
- [ ] "Want to go deeper?" buttons work
- [ ] Reflection questions generated contextually
- [ ] Reflection conversation flows naturally
- [ ] Email sent on completion/decline
- [ ] PDF attached and renders correctly
- [ ] PDF follows tenant branding
- [ ] Booking CTA appears when enabled
- [ ] Booking CTA hidden when disabled
- [ ] Return link works after email sent
- [ ] Mobile responsive on all pages

### Acceptance Criteria

1. **Given** a participant who completes the assessment, **when** they are redirected to results, **then** they see their full archetype insights with correct styling

2. **Given** a participant on the results page, **when** they click "Yes, let's go deeper", **then** they see AI-generated reflection questions based on their archetype

3. **Given** a participant who declines reflection, **when** they click "No thanks", **then** they receive a thank you email with PDF attachment within 30 seconds

4. **Given** a tenant with booking enabled, **when** a participant views results, **then** they see the booking CTA button linking to the configured URL

5. **Given** a participant who receives the thank you email, **when** they click the return link, **then** they can access their results and add reflection anytime

---

## Developer Resources

### File Paths Reference

**New Files:**
```
app/coach/[slug]/results/[token]/page.tsx
app/coach/[slug]/results/[token]/reflect/page.tsx
app/api/coach/[slug]/results/[token]/route.ts
app/api/coach/[slug]/results/[token]/reflect/route.ts
app/api/coach/[slug]/results/[token]/complete/route.ts
lib/agents/reflection-agent.ts
lib/pdf/archetype-results-pdf.tsx
lib/email/templates/archetype-results-email.tsx
components/coaching/ArchetypeResults.tsx
components/coaching/TensionPatternCard.tsx
components/coaching/BookingCTA.tsx
components/coaching/ReflectionChoice.tsx
supabase/migrations/20260106_008_add_reflection_tracking.sql
```

### Key Code Locations

| Function/Class | Location |
|----------------|----------|
| Archetype definitions | `lib/agents/archetype-constitution.ts:ARCHETYPES` |
| Result calculation | `lib/agents/archetype-constitution.ts:calculateResults()` |
| Session page pattern | `app/coach/[slug]/session/[token]/page.tsx` |
| Tenant context | `lib/contexts/tenant-context.tsx` |
| PDF patterns | `lib/pdf-document.tsx` |
| Email patterns | `lib/email/templates/` |

### Testing Locations

| Test Type | Location |
|-----------|----------|
| Manual | Development server at localhost:3000 |
| Database | Supabase Dashboard SQL Editor |
| Email | Resend Dashboard (delivery logs) |
| PDF | Browser download + preview |

### Documentation to Update

| Document | Update |
|----------|--------|
| `CLAUDE.md` | Add Post-Results Reflection section |
| `docs/bmm-workflow-status.yaml` | Add new epic to active_epics |

---

## UX/UI Considerations

### UI Components Affected

**New Components:**
- `ArchetypeResults.tsx` - Full results display
- `TensionPatternCard.tsx` - Styled tension pattern (sand/blue, not orange/red)
- `BookingCTA.tsx` - Configurable booking button
- `ReflectionChoice.tsx` - "Want to go deeper?" choice UI

### UX Flow Changes

**Current:**
```
Assessment → "Complete!" message → Done
```

**New:**
```
Assessment → Results Page → Choice → [Reflect OR Email+Exit]
```

### Visual/Interaction Patterns

- Follow Pearl Vibrant theme from `docs/design-system.md`
- Tension Pattern: Sand background (`--brand-bg-muted`), blue/teal text (`--brand-secondary`)
- NO red or orange for tension/warning states
- Booking CTA: Primary brand color button
- Mobile-first: Participants often on phones

### Accessibility

- Keyboard navigation for choice buttons
- ARIA labels for archetype sections
- Color contrast: Ensure tension pattern meets WCAG AA
- Screen reader support for results content

### User Feedback

- Loading spinner during PDF generation
- Success confirmation after email sent
- "Thinking..." indicator during AI response
- Clear visual distinction between choice options

---

## Testing Approach

### Test Strategy

**Manual testing protocol:**

1. **Results Display**
   - Complete assessment, verify redirect to results
   - Check all archetype sections render
   - Verify tension pattern styling (no warning colors)
   - Test with multiple archetype results

2. **Reflection Flow**
   - Click "go deeper", verify questions generated
   - Submit reflection response, verify conversation flows
   - Complete reflection, verify email sent

3. **Exit Flow**
   - Click "no thanks", verify email sent
   - Check PDF attachment renders correctly
   - Verify return link works

4. **Booking CTA**
   - Enable booking in tenant settings, verify button appears
   - Disable booking, verify button hidden
   - Test link opens correct URL

5. **Branding**
   - Test with different tenant brand configs
   - Verify PDF follows branding
   - Verify email follows branding

---

## Deployment Strategy

### Deployment Steps

1. Create PR with all changes
2. Apply migration to staging Supabase
3. Deploy to Vercel preview
4. Test complete flow on preview
5. Merge to main
6. Apply migration to production
7. Verify production deployment
8. Test with Mark's tenant

### Rollback Plan

1. If migration fails: No data loss, just add columns
2. If app fails: Revert merge, redeploy previous commit
3. If email fails: Check Resend dashboard, retry manually

### Monitoring

- Vercel deployment logs for errors
- Supabase logs for database issues
- Resend dashboard for email delivery
- Manual spot-checks of results pages
