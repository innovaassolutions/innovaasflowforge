# innovaasflowforge - Epic Breakdown

**Date:** 2025-01-05
**Project Level:** Quick Flow (Brownfield)
**Tech Spec:** [tech-spec-coaching-module.md](../tech-spec-coaching-module.md)

---

## Epic 1: Coaching Module

**Slug:** coaching-module

### Goal

Enable individual coaches like Mark Nickerson to offer white-labeled AI-facilitated assessments (starting with Leadership Archetypes) with self-registration lead generation, branded participant experiences, and a lead pipeline dashboard for client management.

### Scope

**In Scope:**
- Unified `tenant_profiles` table with `brand_config` JSONB for multi-tenant branding
- Rename `stakeholder_sessions` → `participant_sessions` platform-wide
- Usage tracking infrastructure (`usage_events` table structure)
- White-label branding with CSS variable injection
- Self-registration flow for lead generation
- Coach-created client flow with email invitations
- Text-based archetype interview agent using existing constitution
- Lead pipeline dashboard with status tracking
- Client list with filtering and CSV export
- Configurable results disclosure (full/teaser/none)
- Persistent results access via token
- Custom subdomain routing for Mark's domain

**Out of Scope:**
- Voice interviews (text chat only for MVP)
- Billing/payment UI (usage tracked only, manual invoicing)
- Multiple assessment types beyond Archetypes
- Coach self-service signup (Mark manually onboarded)
- Brand config editor UI (manual JSON configuration)

### Success Criteria

1. Self-registered visitor appears in coach's dashboard as "registered"
2. Coach-created client receives branded invitation email
3. Session pages display coach's custom branding (logo, colors, fonts)
4. AI interview progresses through all 19 archetype questions
5. Results calculated correctly using existing `calculateResults()`
6. Results disclosure respects campaign configuration
7. Pipeline shows correct counts by status
8. CSV export includes all lead fields (name, email, status, archetype, date)
9. Custom subdomain `assessment.leadingwithmeaning.com` routes correctly
10. Pearl Vibrant theme maintained for dashboard; coach branding for participant-facing

### Dependencies

- **Internal:**
  - Archetype constitution (lib/agents/archetype-constitution.ts) - EXISTS, COMPLETE
  - Existing session UI pattern (app/session/[token]/page.tsx) - EXISTS
  - Supabase auth system - CONFIGURED
  - Resend email service - CONFIGURED
  - Anthropic Claude API - CONFIGURED

- **External:**
  - Mark's custom domain DNS configuration (CNAME to Vercel)
  - Vercel custom domain settings

---

## Story Map - Epic 1

```
Epic: Coaching Module (15 points)
│
├── Story 1.1: Database Foundation (3 points)
│   Dependencies: None
│   Deliverables: 4 migrations, tenant queries, Mark's seed data
│
├── Story 1.2: Branding Infrastructure (2 points)
│   Dependencies: Story 1.1
│   Deliverables: CSS theme generator, branded layout, BrandedHeader
│
├── Story 1.3: Registration & Sessions (4 points)
│   Dependencies: Story 1.2
│   Deliverables: Registration flow, session page, interview agent, invitation email
│
├── Story 1.4: Dashboard & Pipeline (4 points)
│   Dependencies: Story 1.3
│   Deliverables: Coach dashboard, pipeline component, client list, CSV export
│
└── Story 1.5: Results & Custom Domain (2 points)
    Dependencies: Stories 1.3, 1.4
    Deliverables: Results page, disclosure logic, subdomain routing
```

---

## Stories - Epic 1

### Story 1.1: Database Foundation

As a **developer**,
I want **database tables for multi-tenant coaching with brand configuration**,
So that **coaches can be onboarded with their own branded settings and participants can be tracked through the pipeline**.

**Acceptance Criteria:**

AC #1: Given the migrations are applied, when I query `tenant_profiles`, then the table exists with columns: id, user_id, slug, display_name, tenant_type, brand_config (JSONB), email_config (JSONB), enabled_assessments, subscription_tier, is_active, created_at, updated_at
AC #2: Given the migrations are applied, when I query `participant_sessions` (renamed from stakeholder_sessions), then the table includes: client_status, tenant_id columns
AC #3: Given the migrations are applied, when I query `usage_events`, then the table exists with columns: id, tenant_id, event_type, event_data, created_at
AC #4: Given the migrations are applied, when I query `campaigns`, then it includes: tenant_id, assessment_type, results_disclosure columns
AC #5: Given Mark's profile is seeded, when I query by slug 'leadingwithmeaning', then his tenant profile with brand_config returns

**Prerequisites:** None

**Technical Notes:** Uses existing migration patterns, JSONB for flexible brand config

**Estimated Effort:** 3 points (~2 days)

---

### Story 1.2: Branding Infrastructure

As a **coach participant**,
I want **to see the coach's branding when I access their assessment**,
So that **the experience feels consistent with the coach's personal brand**.

**Acceptance Criteria:**

AC #1: Given a brand_config with custom colors, when the branded layout loads, then CSS custom properties (--brand-*) are injected
AC #2: Given a brand_config with custom fonts, when the layout loads, then Google Fonts are dynamically loaded
AC #3: Given a tenant with a logo URL, when BrandedHeader renders, then the logo displays correctly
AC #4: Given the `/coach/[slug]/` route, when accessed with valid slug, then the layout wrapper applies correct branding
AC #5: Given Tailwind config is extended, when using `brand-primary` classes, then they reference CSS variables

**Prerequisites:** Story 1.1

**Technical Notes:** CSS variable injection, Google Fonts API, layout wrapper pattern

**Estimated Effort:** 2 points (~1 day)

---

### Story 1.3: Registration & Sessions

As a **prospective coaching client**,
I want **to register for an assessment and complete an AI-guided interview**,
So that **I can discover my leadership archetype and connect with the coach**.

**Acceptance Criteria:**

AC #1: Given a coach's registration page, when I submit name/email, then a participant_session is created with status 'registered'
AC #2: Given I'm a registered participant, when I access the session page, then I see the coach's branding
AC #3: Given I send a message, when the AI responds, then it follows the archetype interview flow (19 questions)
AC #4: Given I complete all questions, when scoring runs, then my default/authentic archetypes are stored in session metadata
AC #5: Given a coach creates a client, when they send invitation, then the client receives a branded email with session link
AC #6: Given the session starts, when AI sends first message, then it's a warm, branded welcome

**Prerequisites:** Story 1.2

**Technical Notes:** Uses existing archetype-constitution.ts, follows session UI pattern from consultant module

**Estimated Effort:** 4 points (~3 days)

---

### Story 1.4: Dashboard & Pipeline

As a **coach**,
I want **a dashboard to view my leads in a pipeline and export them**,
So that **I can manage my client acquisition and follow up with interested prospects**.

**Acceptance Criteria:**

AC #1: Given I'm logged in as a coach, when I access `/dashboard/coaching/`, then I see my lead pipeline by status
AC #2: Given leads in various statuses, when the pipeline renders, then counts show correctly (registered, started, completed, contacted, converted, archived)
AC #3: Given I'm on the client list, when I filter by status, then only matching clients show
AC #4: Given I click "Export CSV", when download completes, then file contains: name, email, status, archetype, registration_date
AC #5: Given I click a client, when detail page loads, then I see their assessment results and can update status
AC #6: Given I create a new campaign, when form submits, then campaign is created with tenant_id and results_disclosure config

**Prerequisites:** Story 1.3

**Technical Notes:** Follows existing dashboard patterns, CSV generation client-side

**Estimated Effort:** 4 points (~3 days)

---

### Story 1.5: Results & Custom Domain

As a **participant**,
I want **to view my assessment results based on coach settings**,
So that **I can learn about my leadership archetype and decide to engage further**.

**Acceptance Criteria:**

AC #1: Given campaign has `resultsDisclosure: 'full'`, when participant completes, then full archetype details are shown
AC #2: Given campaign has `resultsDisclosure: 'teaser'`, when participant completes, then only archetype names and CTA to contact coach are shown
AC #3: Given campaign has `resultsDisclosure: 'none'`, when participant completes, then thank you message only, no results
AC #4: Given a participant session token, when accessing `/coach/[slug]/results/[token]`, then results display persistently
AC #5: Given Mark's custom domain configured, when accessing `assessment.leadingwithmeaning.com`, then middleware routes to `/coach/leadingwithmeaning/`
AC #6: Given custom domain routing, when any path is accessed, then branding loads correctly

**Prerequisites:** Stories 1.3, 1.4

**Technical Notes:** Middleware rewrite, Vercel custom domain, results disclosure logic

**Estimated Effort:** 2 points (~1 day)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 15 points

**Estimated Timeline:** 7-10 working days

**Recommended Sequence:**
1. Story 1.1 (Database) - Start immediately
2. Story 1.2 (Branding) - After 1.1 complete
3. Story 1.3 (Registration & Sessions) - After 1.2 complete (largest story)
4. Story 1.4 (Dashboard & Pipeline) - After 1.3 complete
5. Story 1.5 (Results & Custom Domain) - After 1.3 and 1.4 complete

---

**Implementation Ready:** Stories reference [tech-spec-coaching-module.md](../tech-spec-coaching-module.md) for complete technical context.
