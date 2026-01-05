# innovaasflowforge - Technical Specification

**Author:** Todd
**Date:** 2025-01-05
**Project Level:** Quick-Flow
**Change Type:** Feature Addition
**Development Context:** Brownfield

---

## Context

### Available Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Leadership Archetypes Framework | `docs/leadingwithmeaning/Leadership_Archetypes.md` | Mark's archetype methodology |
| Project Scope | `docs/leadingwithmeaning/PROJECT_SCOPE.md` | Original feature requirements |
| White-Label Architecture | `docs/leadingwithmeaning/WHITE_LABEL_ARCHITECTURE.md` | Branding architecture design |
| Archetype Constitution | `lib/agents/archetype-constitution.ts` | **Already implemented** - All 19 questions, scoring |
| Existing Session UI | `app/session/[token]/page.tsx` | Reference pattern for coaching sessions |
| Stakeholder Schema | `supabase/migrations/20251115_initial_schema.sql` | Database patterns to extend |

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

**Reference Pattern: Consultant Module**

```
app/
├── session/[token]/page.tsx          # Stakeholder interview UI
├── dashboard/
│   ├── campaigns/                    # Campaign management
│   │   ├── page.tsx                  # Campaign list
│   │   ├── new/page.tsx              # Create campaign
│   │   └── [id]/                     # Campaign details
│   └── companies/[id]/
│       └── stakeholders/             # Stakeholder management

lib/
├── agents/
│   ├── archetype-constitution.ts     # ALREADY EXISTS - scoring, questions
│   ├── assessment-agent.ts           # Interview agent pattern
│   └── synthesis-agent.ts            # Analysis agent pattern
├── supabase/
│   ├── client.ts                     # Browser client
│   └── server.ts                     # Server client (service role)

supabase/migrations/
├── 20251115_initial_schema.sql       # campaigns, stakeholder_sessions, agent_sessions
├── 20251118001_create_company_profiles.sql
└── 20251118004_update_campaigns.sql
```

**Existing Patterns:**
- Token-based session access (no auth required for participants)
- Campaign → Stakeholder relationship
- Agent sessions with conversation history in JSONB
- RLS policies for multi-tenancy
- Brand colors via CSS classes (`brand-orange`, `brand-teal`)

---

## The Change

### Problem Statement

FlowForge currently serves consultants (Industry 4.0 assessments) and educators (student wellbeing), but lacks support for **individual coaches** who need:

1. **Multi-tenant branding** — Coaches need their own branded experience for clients
2. **Lead generation** — Self-registration for marketing funnels (not just known stakeholders)
3. **Client management** — Dashboard to track leads through pipeline with status tracking
4. **Flexible assessments** — Starting with Leadership Archetypes, extensible to other coaching tools
5. **Custom domains** — White-label URLs for premium coach experience

**Impact if not addressed:** Coaches like Mark Nickerson cannot use FlowForge for their practice, limiting platform growth to consultants and educators only.

### Proposed Solution

Build a **Coaching Module** that extends FlowForge's existing consultant architecture:

1. **Unified Tenant Profiles** — Single `tenant_profiles` table for coaches, consultants, schools
2. **White-Label Branding** — `brand_config` JSONB for logos, colors, fonts, messaging
3. **Dual Registration Flows** — Self-service (lead gen) AND coach-created (known clients)
4. **Lead Pipeline Dashboard** — Status tracking (Registered → Completed → Contacted → Converted)
5. **Archetype Interview Agent** — Text-based AI using existing `archetype-constitution.ts`
6. **Configurable Results** — Campaign-level control: full/teaser/none
7. **Custom Subdomain** — `assessment.coachsite.com` → Vercel routing

### Scope

**In Scope:**

1. Database: `tenant_profiles` table with `brand_config` JSONB
2. Database: `participant_sessions` (rename from `stakeholder_sessions`)
3. Database: Usage tracking hooks (`usage_events` table structure only)
4. Routes: `/coach/[slug]/session/[token]` - Branded session pages
5. Routes: `/coach/[slug]/register` - Self-registration for campaigns
6. Routes: `/coach/[slug]/results/[token]` - Persistent results access
7. Dashboard: Coach lead pipeline at `/dashboard/coaching/`
8. Dashboard: Client list with status, filtering, CSV export
9. Agent: `archetype-interview-agent.ts` using existing constitution
10. Branding: CSS variable injection for runtime theming
11. Email: Branded invitation emails via Resend
12. Subdomain: Vercel custom domain configuration for Mark

**Out of Scope:**

1. Voice interviews (text chat only for MVP)
2. Billing/payment UI (manual invoicing, usage tracked only)
3. Multiple assessment types beyond Archetypes
4. Coach self-service signup (Mark manually onboarded)
5. Brand config editor UI (manual JSON configuration)
6. Usage billing dashboard (data collection only)

---

## Implementation Details

### Source Tree Changes

**NEW FILES:**

| Path | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260106_001_create_tenant_profiles.sql` | CREATE | Unified tenant table with brand_config |
| `supabase/migrations/20260106_002_rename_to_participants.sql` | CREATE | Rename stakeholder_sessions → participant_sessions |
| `supabase/migrations/20260106_003_create_usage_events.sql` | CREATE | Usage tracking table structure |
| `supabase/migrations/20260106_004_update_campaigns_for_coaching.sql` | CREATE | Add tenant_id, assessment_type, results_config |
| `lib/agents/archetype-interview-agent.ts` | CREATE | Interview agent using archetype-constitution.ts |
| `lib/theme/brand-theme.ts` | CREATE | CSS variable generation from brand_config |
| `lib/email/templates/coaching-invitation.tsx` | CREATE | Branded invitation email template |
| `lib/services/usage-tracker.ts` | CREATE | Usage event logging service |
| `app/coach/[slug]/layout.tsx` | CREATE | Branded layout wrapper |
| `app/coach/[slug]/session/[token]/page.tsx` | CREATE | Coaching session page |
| `app/coach/[slug]/register/page.tsx` | CREATE | Self-registration page |
| `app/coach/[slug]/results/[token]/page.tsx` | CREATE | Persistent results page |
| `app/api/coach/[slug]/register/route.ts` | CREATE | Registration API |
| `app/api/coach/[slug]/session/route.ts` | CREATE | Session messaging API |
| `app/api/coach/[slug]/results/route.ts` | CREATE | Results retrieval API |
| `app/dashboard/coaching/page.tsx` | CREATE | Coach dashboard - lead pipeline |
| `app/dashboard/coaching/clients/page.tsx` | CREATE | Client list with filters |
| `app/dashboard/coaching/clients/[id]/page.tsx` | CREATE | Client detail view |
| `app/dashboard/coaching/campaigns/page.tsx` | CREATE | Campaign management |
| `app/dashboard/coaching/campaigns/new/page.tsx` | CREATE | Create campaign |
| `components/coaching/LeadPipeline.tsx` | CREATE | Pipeline visualization component |
| `components/coaching/ClientTable.tsx` | CREATE | Client list with export |
| `components/coaching/BrandedHeader.tsx` | CREATE | Dynamic branded header |

**MODIFIED FILES:**

| Path | Action | Description |
|------|--------|-------------|
| `lib/agents/archetype-constitution.ts` | MODIFY | Add session state management helpers |
| `lib/supabase/server.ts` | MODIFY | Add tenant profile queries |
| `app/dashboard/layout.tsx` | MODIFY | Add coaching nav item |
| `middleware.ts` | MODIFY | Handle custom subdomain routing |
| `next.config.js` | MODIFY | Add custom domain configuration |

### Technical Approach

**1. Tenant Architecture**

Use unified `tenant_profiles` table instead of separate coach/consultant/school tables:

```sql
CREATE TABLE tenant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  tenant_type TEXT NOT NULL, -- 'coach', 'consultant', 'school'
  brand_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  email_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled_assessments TEXT[] DEFAULT ARRAY['archetype'],
  subscription_tier TEXT DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. Brand Config Structure**

```typescript
interface BrandConfig {
  logo: { url: string; alt: string; width?: number };
  colors: {
    primary: string;      // Buttons, links
    primaryHover: string;
    secondary: string;    // Accents
    background: string;
    backgroundSubtle: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;  // Google Font name
    body: string;
  };
  tagline?: string;
  welcomeMessage?: string;
  completionMessage?: string;
  showPoweredBy: boolean;
}
```

**3. Runtime Theming**

Inject CSS custom properties at page load:

```typescript
// lib/theme/brand-theme.ts
export function generateBrandCss(brand: BrandConfig): string {
  return `
    :root {
      --brand-primary: ${brand.colors.primary};
      --brand-primary-hover: ${brand.colors.primaryHover};
      --brand-bg: ${brand.colors.background};
      --brand-text: ${brand.colors.text};
      --brand-font-heading: '${brand.fonts.heading}', serif;
      --brand-font-body: '${brand.fonts.body}', sans-serif;
    }
  `;
}
```

**4. Archetype Interview Agent**

Extend existing constitution with session management:

```typescript
// lib/agents/archetype-interview-agent.ts
import {
  ARCHETYPE_CONSTITUTION,
  SURVEY_SECTIONS,
  calculateResults
} from './archetype-constitution';

export async function processArchetypeMessage(
  message: string | null,
  sessionState: ArchetypeSessionState,
  tenant: TenantProfile
): Promise<{
  response: string;
  newState: ArchetypeSessionState;
  isComplete: boolean;
}> {
  // Use existing constitution for system prompt
  // Track question progress through sections
  // Calculate results when complete
}
```

**5. Lead Pipeline Status**

```typescript
type ClientStatus =
  | 'registered'   // Signed up, not started
  | 'started'      // Began assessment
  | 'completed'    // Finished assessment
  | 'contacted'    // Coach reached out
  | 'converted'    // Became paying client
  | 'archived';    // Not a fit
```

**6. Custom Subdomain Routing**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Check for custom domains mapped to tenants
  if (!hostname.includes('flowforge.app')) {
    const tenant = await getTenantByDomain(hostname);
    if (tenant) {
      // Rewrite to /coach/[slug]/...
      const url = request.nextUrl.clone();
      url.pathname = `/coach/${tenant.slug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
```

### Existing Patterns to Follow

**From `app/session/[token]/page.tsx`:**
- Token-based session access pattern
- Message state management with `useState`
- Scroll-to-bottom on new messages
- Loading/sending states
- Completion detection and UI change

**From `lib/agents/assessment-agent.ts`:**
- Anthropic client initialization
- System prompt generation
- Conversation history management
- JSON response parsing

**From `supabase/migrations/20251115_initial_schema.sql`:**
- UUID primary keys with `gen_random_uuid()`
- TIMESTAMPTZ for timestamps with defaults
- JSONB for flexible data (conversation_history, metadata)
- RLS policies pattern
- Index naming conventions

### Integration Points

| System | Integration | Details |
|--------|-------------|---------|
| Supabase Auth | User authentication | Coach login via existing auth |
| Supabase DB | Data persistence | All tables use Supabase PostgreSQL |
| Anthropic Claude | AI interviews | Via existing `lib/anthropic.ts` |
| Resend | Email delivery | Branded invitations |
| Vercel | Custom domains | DNS CNAME configuration |
| Google Fonts | Typography | Dynamic font loading |

---

## Development Context

### Relevant Existing Code

| File | Reference For |
|------|---------------|
| `app/session/[token]/page.tsx` | Session UI structure, message handling |
| `lib/agents/assessment-agent.ts` | Agent pattern, Anthropic integration |
| `lib/agents/archetype-constitution.ts` | All archetype content (already complete) |
| `app/dashboard/campaigns/page.tsx` | Dashboard list pattern |
| `app/dashboard/companies/[id]/stakeholders/page.tsx` | Participant management pattern |
| `supabase/migrations/20251118001_create_company_profiles.sql` | JSONB config pattern |

### Dependencies

**Framework/Libraries (from package.json):**

| Package | Version | Usage |
|---------|---------|-------|
| next | 15.5.7 | App framework |
| react | 18.3.1 | UI library |
| typescript | ^5 | Language |
| @supabase/supabase-js | 2.39.0 | Database client |
| @anthropic-ai/sdk | 0.27.0 | Claude AI |
| resend | 6.4.2 | Email sending |
| tailwindcss | 3.4.1 | Styling |
| lucide-react | 0.553.0 | Icons |
| zustand | 4.4.7 | State management |

**Internal Modules:**

| Module | Purpose |
|--------|---------|
| `lib/supabase/server.ts` | Server-side Supabase client |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/anthropic.ts` | Anthropic client wrapper |
| `lib/resend.ts` | Email client |
| `lib/agents/archetype-constitution.ts` | Archetype content & scoring |

### Configuration Changes

| File | Change |
|------|--------|
| `.env.local` | No changes needed (uses existing keys) |
| `next.config.js` | Add `domains` for custom subdomains |
| `tailwind.config.js` | Extend with `brand-*` CSS variable colors |
| `vercel.json` | Add custom domain routing rules |

### Existing Conventions (Brownfield)

**Code Style:**
- TypeScript strict mode
- Functional components with hooks
- camelCase variables, PascalCase components
- Async/await for all async operations
- Error handling with try/catch

**File Organization:**
- Feature-based organization under `app/`
- Shared utilities in `lib/`
- UI components in `components/ui/`
- Feature components in `components/[feature]/`

**Database:**
- snake_case column names
- UUID primary keys
- TIMESTAMPTZ for all timestamps
- JSONB for flexible schemas
- RLS enabled on all tables

**Testing:**
- No formal test framework currently in place
- Manual testing via dev server

### Test Framework & Standards

Currently no automated testing framework. For this feature:

- Manual testing via development server
- Supabase SQL testing in dashboard
- API testing via curl/Postman

---

## Implementation Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20.x LTS |
| Framework | Next.js (App Router) | 15.5.7 |
| Language | TypeScript | 5.x |
| Database | Supabase PostgreSQL | Latest |
| ORM | Supabase JS Client | 2.39.0 |
| AI | Anthropic Claude | claude-sonnet-4-20250514 |
| Styling | TailwindCSS | 3.4.1 |
| Email | Resend | 6.4.2 |
| Hosting | Vercel | Latest |

---

## Technical Details

### Archetype Interview Flow

1. **Session Initialization**
   - Participant accesses `/coach/[slug]/session/[token]`
   - System loads tenant brand_config
   - Creates agent_session with archetype constitution system prompt
   - Sends initial greeting from AI

2. **Question Progression**
   - AI guides through 19 questions across 4 sections
   - Q1-Q3: Context setting (role, challenges, aspirations)
   - Q4-Q12: Default mode identification (under pressure)
   - Q13-Q16: Authentic mode identification (natural state)
   - Q17-Q19: Friction signals (misalignment indicators)

3. **Scoring & Results**
   - Use existing `calculateResults()` from constitution
   - Determine default archetype, authentic archetype, alignment
   - Store in session metadata

4. **Results Display**
   - Check campaign `resultsDisclosure` setting
   - Show full/teaser/none based on config
   - Provide persistent access link

### Lead Pipeline Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Self-Reg    │────▶│ Participant │────▶│ Agent       │
│ /register   │     │ Session     │     │ Session     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              participant_sessions                    │
│  status: registered → started → completed           │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              Coach Dashboard                         │
│  - View pipeline by status                          │
│  - Update status (contacted, converted, archived)   │
│  - Export to CSV                                    │
│  - View individual results                          │
└─────────────────────────────────────────────────────┘
```

### Custom Domain Flow

1. **Setup (one-time per coach)**
   - Coach provides domain: `assessment.leadingwithmeaning.com`
   - Coach adds CNAME record pointing to `cname.vercel-dns.com`
   - FlowForge adds domain to Vercel project
   - FlowForge maps domain → tenant_id in database

2. **Request Flow**
   - Request to `assessment.leadingwithmeaning.com/session/abc123`
   - Middleware detects non-FlowForge domain
   - Looks up tenant by domain
   - Rewrites to `/coach/leadingwithmeaning/session/abc123`
   - Page loads with tenant's brand_config

---

## Development Setup

```bash
# 1. Clone repo (if not already)
git clone <repo-url>
cd innovaasflowforge

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Configure SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Configure ANTHROPIC_API_KEY
# Configure RESEND_API_KEY

# 4. Run database migrations
# Apply via Supabase Dashboard or CLI

# 5. Start development server
npm run dev

# 6. Access at http://localhost:3000
```

---

## Implementation Guide

### Setup Steps

1. Create feature branch: `git checkout -b feature/coaching-module`
2. Verify dev environment: `npm run dev`
3. Review existing patterns in `app/session/[token]/page.tsx`
4. Review `lib/agents/archetype-constitution.ts` (already complete)

### Implementation Steps

**Phase 1: Database Foundation (Story 1)**
1. Create `tenant_profiles` migration
2. Create `participant_sessions` rename migration
3. Create `usage_events` table structure
4. Update `campaigns` table for coaching
5. Seed Mark's tenant profile

**Phase 2: Branding Infrastructure (Story 2)**
1. Implement `lib/theme/brand-theme.ts`
2. Create branded layout at `app/coach/[slug]/layout.tsx`
3. Add Google Fonts dynamic loading
4. Extend Tailwind with brand CSS variables
5. Create `BrandedHeader.tsx` component

**Phase 3: Registration & Sessions (Story 3)**
1. Build self-registration page
2. Create registration API endpoint
3. Build session page (extend existing pattern)
4. Create session messaging API
5. Implement archetype interview agent
6. Add invitation email template

**Phase 4: Dashboard & Pipeline (Story 4)**
1. Create coach dashboard layout
2. Build lead pipeline component
3. Create client list with filtering
4. Implement CSV export
5. Add client detail view with results

**Phase 5: Results & Custom Domain (Story 5)**
1. Build results page with disclosure logic
2. Implement persistent results access
3. Configure middleware for custom domains
4. Set up Mark's subdomain in Vercel
5. End-to-end testing

### Testing Strategy

**Manual Testing Checklist:**

- [ ] Self-registration creates participant_session
- [ ] Coach-created client receives invitation email
- [ ] Session loads with correct branding
- [ ] AI interview progresses through all 19 questions
- [ ] Results calculated correctly (test aligned and misaligned cases)
- [ ] Results disclosure respects campaign config
- [ ] Dashboard shows correct pipeline counts
- [ ] CSV export includes all required fields
- [ ] Custom subdomain routes correctly
- [ ] Mobile responsive on all pages

### Acceptance Criteria

1. **Given** a visitor on coach's landing page, **when** they complete registration, **then** they appear in coach's dashboard as "registered"

2. **Given** a participant in session, **when** they complete all questions, **then** results are calculated and stored correctly

3. **Given** a campaign with `resultsDisclosure: 'teaser'`, **when** participant completes, **then** they see only archetype names and CTA

4. **Given** a coach on dashboard, **when** they export CSV, **then** file contains all leads with name, email, status, archetype, date

5. **Given** Mark's custom domain configured, **when** visitor accesses `assessment.leadingwithmeaning.com`, **then** they see Mark's branding

---

## Developer Resources

### File Paths Reference

**New Files:**
```
supabase/migrations/20260106_001_create_tenant_profiles.sql
supabase/migrations/20260106_002_rename_to_participants.sql
supabase/migrations/20260106_003_create_usage_events.sql
supabase/migrations/20260106_004_update_campaigns_for_coaching.sql
lib/agents/archetype-interview-agent.ts
lib/theme/brand-theme.ts
lib/email/templates/coaching-invitation.tsx
lib/services/usage-tracker.ts
app/coach/[slug]/layout.tsx
app/coach/[slug]/session/[token]/page.tsx
app/coach/[slug]/register/page.tsx
app/coach/[slug]/results/[token]/page.tsx
app/api/coach/[slug]/register/route.ts
app/api/coach/[slug]/session/route.ts
app/api/coach/[slug]/results/route.ts
app/dashboard/coaching/page.tsx
app/dashboard/coaching/clients/page.tsx
app/dashboard/coaching/clients/[id]/page.tsx
app/dashboard/coaching/campaigns/page.tsx
app/dashboard/coaching/campaigns/new/page.tsx
components/coaching/LeadPipeline.tsx
components/coaching/ClientTable.tsx
components/coaching/BrandedHeader.tsx
```

### Key Code Locations

| Function/Class | Location |
|----------------|----------|
| Archetype questions | `lib/agents/archetype-constitution.ts:SURVEY_SECTIONS` |
| Archetype scoring | `lib/agents/archetype-constitution.ts:calculateResults()` |
| Session UI pattern | `app/session/[token]/page.tsx:StakeholderInterviewPage` |
| Supabase server client | `lib/supabase/server.ts:createClient()` |
| Anthropic client | `lib/anthropic.ts` |
| Email sending | `lib/resend.ts` |

### Testing Locations

| Test Type | Location |
|-----------|----------|
| Manual | Development server at localhost:3000 |
| Database | Supabase Dashboard SQL Editor |
| API | curl/Postman to localhost:3000/api/* |

### Documentation to Update

| Document | Update |
|----------|--------|
| `CLAUDE.md` | Add Coaching Module section |
| `docs/leadingwithmeaning/WHITE_LABEL_ARCHITECTURE.md` | Mark as implemented |

---

## UX/UI Considerations

### UI Components Affected

**New Components:**
- `LeadPipeline.tsx` - Kanban-style or table pipeline view
- `ClientTable.tsx` - Sortable, filterable client list
- `BrandedHeader.tsx` - Dynamic header with coach logo
- Registration form page
- Results display page

### UX Flow Changes

**New Flow - Lead Gen:**
```
Coach's Website → Register Page → Session → Results → Dashboard Update
```

**New Flow - Coach-Created:**
```
Dashboard → Add Client → Send Invite → Session → Results → Dashboard Update
```

### Visual/Interaction Patterns

- Follow existing dashboard patterns from `/dashboard/campaigns/`
- Use existing UI components from `components/ui/`
- Brand colors injected via CSS variables
- Responsive: Mobile-first for session pages (participants on phones)

### Accessibility

- Keyboard navigation for all interactive elements
- ARIA labels for status badges
- Color contrast: Ensure brand colors meet WCAG AA
- Screen reader support for pipeline status

### User Feedback

- Loading spinners during registration
- Success message after registration
- "Thinking..." indicator during AI response
- Progress indicator showing question count
- Clear completion state with next steps

---

## Testing Approach

### Test Strategy

**No automated testing framework currently in place.**

Manual testing protocol:

1. **Registration Flow**
   - Test self-registration with valid data
   - Test validation (email format, required fields)
   - Verify email delivery

2. **Session Flow**
   - Complete full 19-question interview
   - Verify state persistence on refresh
   - Test edge cases (empty responses, very long responses)

3. **Results Flow**
   - Test full disclosure mode
   - Test teaser mode
   - Test no disclosure mode
   - Verify persistent access works

4. **Dashboard Flow**
   - Verify pipeline counts
   - Test status updates
   - Verify CSV export format
   - Test filtering

5. **Branding**
   - Verify colors apply correctly
   - Verify fonts load
   - Verify logo displays
   - Test on custom domain

---

## Deployment Strategy

### Deployment Steps

1. Create PR with all changes
2. Review migrations carefully (production data impact)
3. Apply migrations to staging Supabase
4. Deploy to Vercel preview
5. Manual testing on preview
6. Seed Mark's tenant profile
7. Configure Mark's custom domain in Vercel
8. Merge to main
9. Apply migrations to production
10. Verify production deployment
11. DNS propagation for custom domain

### Rollback Plan

1. If migrations fail: Restore from Supabase backup
2. If app fails: Revert merge, redeploy previous commit
3. If custom domain fails: Remove domain from Vercel, use path-based routing

### Monitoring

- Vercel deployment logs for errors
- Supabase logs for database issues
- Anthropic usage dashboard for AI costs
- Resend dashboard for email delivery
- Manual spot-checks of coach dashboard
