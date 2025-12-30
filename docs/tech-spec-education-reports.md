# innovaasflowforge - Technical Specification

**Author:** Todd
**Date:** 2025-12-30
**Project Level:** Quick Flow (Brownfield)
**Change Type:** Feature Enhancement
**Development Context:** Education Synthesis Reports System

---

## Context

### Available Documents

The following documents were loaded to inform this technical specification:

- **Architecture Decisions** (docs/modules/education/architecture-decisions.md) - ADRs for pseudonymous tokens, schools entity, safeguarding
- **FlowForge for Schools** (docs/modules/education/flowforge-for-schools.md) - Product vision, Four Lenses framework, 12-module system
- **Education Synthesis Agent** (lib/agents/education-synthesis-agent.ts) - Fully implemented synthesis logic
- **School Dashboard** (app/dashboard/education/schools/[id]/page.tsx) - Existing UI patterns
- **Existing Tech Spec** (docs/tech-spec.md) - Consulting report patterns for reference
- **Design System** (docs/design-system.md) - Pearl Vibrant theme specifications

### Project Stack

**Framework & Runtime:**
- Next.js 15.0.3 (App Router pattern)
- React 18.3.1
- Node.js 20+ LTS
- TypeScript 5.x (strict mode enabled)

**Database & Backend:**
- Supabase (PostgreSQL with RLS)
- @supabase/supabase-js 2.39.0
- @supabase/ssr 0.0.10
- Pseudonymous token architecture (no PII in FlowForge)

**AI & Services:**
- Anthropic Claude API (@anthropic-ai/sdk)
- Education synthesis agent (already implemented)
- Resend for email notifications

**Frontend & UI:**
- TailwindCSS with Pearl Vibrant theme
- Lucide React icons
- Custom visualization components (SVG-based)

**Theme Colors (Pearl Vibrant):**
- Accent: #F25C05 (Orange)
- Accent Hover: #DC5204
- Secondary: #1D9BA3 (Teal)
- Background: #FFFEFB
- Card: #FAF8F3
- Border: #E6E2D6
- Text: #171614
- Text Muted: #71706B

### Existing Codebase Structure

**Education Module Architecture:**
```
app/
├── api/education/
│   ├── schools/              # School CRUD (existing)
│   ├── campaigns/            # Campaign management (existing)
│   ├── access-codes/         # Code generation (existing)
│   ├── session/[token]/      # Interview sessions (existing)
│   ├── safeguarding/alerts/  # Alert management (existing)
│   ├── synthesis/            # NEW - Trigger synthesis
│   └── reports/[token]/      # NEW - Report access
├── dashboard/education/
│   ├── schools/[id]/         # School detail (existing - needs report panel)
│   └── reports/              # NEW - Reports management
└── education/
    └── report/[token]/       # NEW - Public report landing page

lib/
├── agents/
│   ├── education-interview-agent.ts   # Existing
│   └── education-synthesis-agent.ts   # Existing - READY TO USE
└── report/
    └── education-report-generator.ts  # NEW - Report utilities
```

**Database Tables (Education):**
- `schools` - School profiles with safeguarding config
- `campaigns` - Assessment campaigns (education_config for modules)
- `education_access_codes` - One-time access codes
- `education_participant_tokens` - Pseudonymous tokens
- `education_safeguarding_alerts` - Break-glass events
- `agent_sessions` - Extended with participant_token_id
- `education_synthesis` - NEW - Synthesis results storage
- `education_reports` - NEW - Report access tokens

**Key Patterns:**
- Pseudonymous architecture (NO PII stored)
- School → Campaign → Sessions → Synthesis → Report chain
- Safeguarding-first design with break-glass protocol
- Pearl Vibrant theme (see design-system.md)

---

## The Change

### Problem Statement

The education vertical can capture stakeholder interviews through campaigns and has a fully implemented synthesis agent that produces rich analysis using the Four Lenses framework. However:

1. **No way to trigger synthesis** - The `generateEducationSynthesis()` function exists but has no API endpoint
2. **No report delivery mechanism** - School leadership cannot view synthesis results
3. **No visualization** - The Four Lenses, triangulation insights, and recommendations have no UI
4. **No secure sharing** - Cannot share reports with school leadership via secure link
5. **No longitudinal tracking** - Cannot compare results across terms despite stub function existing
6. **Safeguarding insights buried** - Critical safety signals not surfaced appropriately

This limits the value of collected interview data and prevents schools from acting on insights.

### Proposed Solution

Build an **Education Synthesis Reports System** that enables:

1. **Generate Reports** - School contacts or Innovaas admins trigger synthesis for completed campaigns
2. **Executive Dashboard** - Visual report with charts, Four Lenses cards, triangulation insights
3. **Secure Sharing** - Token-based URLs for school leadership access
4. **Confidential Safeguarding** - Separate section with safeguarding signals + notification to lead
5. **Longitudinal Comparison** - Compare results across multiple terms/campaigns
6. **Recommendations** - Actionable items grouped by timeframe (immediate/short-term/strategic)

### Scope

**In Scope:**

1. API endpoint to trigger education synthesis (POST /api/education/synthesis)
2. Report storage with secure access tokens
3. Dashboard UI panel for report generation (on school detail page)
4. Report landing page with executive dashboard visualizations
5. Stakeholder participation donut chart
6. Color-coded Four Lenses cards (green/amber/orange/red)
7. Triangulation alignment visualization
8. Urgency level indicator
9. Recommendations timeline display
10. Confidential safeguarding section (restricted visibility)
11. Email notification to safeguarding lead on generation
12. Longitudinal comparison (term-over-term trends)
13. Module-based reports (one report per campaign/module)

**Out of Scope:**

- PDF export (deferred - formatting complexity)
- Multi-tier reports (single comprehensive report per module)
- Real-time report regeneration on data changes
- Report versioning and history
- Client commenting or feedback features
- White-label customization
- Multi-language support

---

## Implementation Details

### Source Tree Changes

**NEW FILES TO CREATE:**

1. **app/api/education/synthesis/route.ts** - CREATE
   - POST endpoint to trigger synthesis generation
   - Validates campaign completion status
   - Calls existing `generateEducationSynthesis()`
   - Saves result to database

2. **app/api/education/reports/route.ts** - CREATE
   - POST endpoint to generate report from synthesis
   - Creates secure access token
   - Stores report metadata
   - Triggers safeguarding notification if signals present

3. **app/api/education/reports/[token]/route.ts** - CREATE
   - GET endpoint for public report access via token
   - Returns full report data for rendering
   - Tracks access count

4. **app/education/report/[token]/page.tsx** - CREATE
   - Public report landing page (Server Component)
   - Token validation and data fetching
   - SEO meta tags for professional sharing

5. **components/education/report/ReportDashboard.tsx** - CREATE
   - Client component for executive dashboard display
   - Orchestrates all visualization components

6. **components/education/report/FourLensesCards.tsx** - CREATE
   - Color-coded cards for Four Lenses framework
   - Green (holding), Amber (slipping), Orange (misunderstood), Red (at risk)

7. **components/education/report/StakeholderDonut.tsx** - CREATE
   - Donut chart showing participation by stakeholder type
   - Uses d3-scale for proportions

8. **components/education/report/TriangulationChart.tsx** - CREATE
   - Visualization of aligned vs divergent themes
   - Shows stakeholder group perspectives

9. **components/education/report/UrgencyGauge.tsx** - CREATE
   - Visual gauge for urgency level (low/medium/high/critical)
   - Animated SVG component

10. **components/education/report/RecommendationsTimeline.tsx** - CREATE
    - Groups recommendations by timeframe
    - Immediate / Short-term / Strategic sections

11. **components/education/report/LongitudinalTrend.tsx** - CREATE
    - Line chart comparing synthesis results over time
    - Term-over-term comparison

12. **components/education/report/SafeguardingSection.tsx** - CREATE
    - Confidential section for safeguarding signals
    - Visually distinct (warning styling)
    - Only shown if safeguarding_signals > 0

13. **components/education/report/ReportGenerationPanel.tsx** - CREATE
    - Dashboard UI for triggering report generation
    - Shows existing report status
    - Access URL display with copy button

14. **lib/report/education-report-utils.ts** - CREATE
    - Token generation for education reports
    - Safeguarding notification helper
    - Longitudinal data aggregation

15. **supabase/migrations/[timestamp]_create_education_reports.sql** - CREATE
    - Database schema for education_synthesis and education_reports tables
    - Indexes and RLS policies

**FILES TO MODIFY:**

1. **app/dashboard/education/schools/[id]/page.tsx** - MODIFY
   - Add ReportGenerationPanel component
   - Show report status per campaign
   - Link to generated reports

2. **lib/agents/education-synthesis-agent.ts** - MODIFY (minor)
   - Implement `generateLongitudinalComparison()` (currently throws "not yet implemented")

### Technical Approach

**Database Design:**

```sql
-- Store synthesis results
CREATE TABLE education_synthesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id),
  module TEXT NOT NULL,

  -- Synthesis content (full JSON from agent)
  content JSONB NOT NULL,

  -- Metadata
  model_used TEXT NOT NULL,
  source_token_ids UUID[] NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Store report access
CREATE TABLE education_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synthesis_id UUID NOT NULL REFERENCES education_synthesis(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id),

  -- Access control
  access_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Safeguarding
  has_safeguarding_signals BOOLEAN NOT NULL DEFAULT false,
  safeguarding_notified_at TIMESTAMPTZ,

  -- Tracking
  generated_by UUID REFERENCES auth.users(id),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for token lookup
CREATE UNIQUE INDEX idx_education_reports_token ON education_reports(access_token);

-- Index for school queries
CREATE INDEX idx_education_synthesis_school ON education_synthesis(school_id);
CREATE INDEX idx_education_reports_school ON education_reports(school_id);
```

**Token Generation:**

Use existing pattern from consulting reports:
```typescript
import { randomBytes } from 'crypto'

export function generateReportAccessToken(): string {
  return randomBytes(32).toString('base64url')
}
```

**Four Lenses Color Mapping:**

```typescript
const LENS_COLORS = {
  what_is_holding: {
    bg: 'bg-[hsl(var(--success))]/10',
    border: 'border-[hsl(var(--success))]/50',
    icon: 'text-[hsl(var(--success))]',
    label: 'What\'s Holding'
  },
  what_is_slipping: {
    bg: 'bg-warning/10',
    border: 'border-warning/50',
    icon: 'text-warning',
    label: 'What\'s Slipping'
  },
  what_is_misunderstood: {
    bg: 'bg-accent-subtle',
    border: 'border-accent/50',
    icon: 'text-accent',
    label: 'What\'s Misunderstood'
  },
  what_is_at_risk: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/50',
    icon: 'text-destructive',
    label: 'What\'s At Risk'
  }
}
```

**Safeguarding Notification:**

```typescript
async function notifySafeguardingLead(
  schoolId: string,
  reportToken: string,
  safeguardingSignals: number
): Promise<void> {
  // Fetch school's safeguarding lead
  const { data: school } = await supabaseAdmin
    .from('schools')
    .select('safeguarding_lead_email, safeguarding_lead_name, name')
    .eq('id', schoolId)
    .single()

  if (!school?.safeguarding_lead_email) {
    console.warn('No safeguarding lead configured for school:', schoolId)
    return
  }

  // Send email via Resend
  await resend.emails.send({
    from: 'FlowForge Safeguarding <alerts@flowforge.io>',
    to: school.safeguarding_lead_email,
    subject: `[Action Required] Safeguarding Signals Detected - ${school.name}`,
    html: `
      <p>Dear ${school.safeguarding_lead_name},</p>
      <p>A new assessment report for ${school.name} has identified
         <strong>${safeguardingSignals} safeguarding signal(s)</strong>
         that require your attention.</p>
      <p>Please review the confidential safeguarding section of the report.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/education/report/${reportToken}#safeguarding">
         View Report Safeguarding Section
      </a></p>
    `
  })
}
```

**Report Generation Flow:**

1. User clicks "Generate Report" on school dashboard
2. System validates:
   - User has permission (school contact or Innovaas admin)
   - Campaign has completed sessions
   - Module is specified
3. Backend:
   - Calls `generateEducationSynthesis(campaignId, schoolId, module)`
   - Saves synthesis to `education_synthesis` table
   - Generates access token
   - Creates `education_reports` record
   - If safeguarding_signals > 0, triggers notification
4. Frontend:
   - Shows success with access URL
   - Copy button for sharing

### Existing Patterns to Follow

**From schools/[id]/page.tsx:**
- Client component with `'use client'`
- `createClient()` for auth
- `apiUrl()` helper for API calls
- Stats cards layout with icons
- Loading/error states
- Pearl Vibrant theme classes

**From existing consulting reports:**
- Token-based public access
- `getSupabaseAdmin()` for privileged operations
- Access tracking (count, last_accessed_at)

**Visualization Pattern:**
- SVG-based components with d3-scale
- `viewBox` for responsive scaling
- Tailwind classes for styling
- No external chart libraries

### Integration Points

**Internal Dependencies:**

1. **Education Synthesis Agent:**
   - `generateEducationSynthesis(campaignId, schoolId, module)`
   - `generateLongitudinalComparison(schoolId, module, synthesisIds)`

2. **Schools System:**
   - Fetch safeguarding lead for notifications
   - School name for report branding

3. **Campaigns System:**
   - Campaign status and module configuration
   - Completion validation

4. **Email Service:**
   - Resend for safeguarding notifications

**Database Relationships:**

```
schools
  └── campaigns (school_id)
        └── education_synthesis (campaign_id)
              └── education_reports (synthesis_id)
```

---

## Development Context

### Relevant Existing Code

**Education Synthesis Agent:**
- File: lib/agents/education-synthesis-agent.ts
- Function: `generateEducationSynthesis()` - Lines 361-532
- Returns: `EducationSynthesisResult` interface with Four Lenses, triangulation, recommendations

**School Dashboard:**
- File: app/dashboard/education/schools/[id]/page.tsx
- Insert point: After line 410 (Campaigns section)
- Pattern: Stats cards, action buttons, sidebar layout

**Safeguarding Alerts:**
- File: app/api/education/safeguarding/alerts/route.ts
- Pattern: School-scoped queries, status filtering

**Consulting Report Pattern:**
- File: app/api/reports/[token]/route.ts
- Pattern: Token validation, access tracking

### Dependencies

**Framework/Libraries (already installed):**
- Next.js 15.0.3
- React 18.3.1
- TypeScript 5.x
- @supabase/supabase-js 2.39.0
- d3-scale 4.0.2
- d3-shape 3.2.0
- lucide-react
- resend

**Internal Modules:**
- `@/lib/supabase/server` - getSupabaseAdmin()
- `@/lib/agents/education-synthesis-agent` - synthesis functions
- `@/lib/resend` - email service
- `@/lib/api-url` - apiUrl() helper

### Configuration Changes

**Environment Variables:**
No new variables required. Existing vars sufficient:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

### Existing Conventions (Brownfield)

**Code Style:**
- TypeScript strict mode
- Single quotes for strings
- 2-space indentation
- Semicolons at end of statements

**File Organization:**
- API routes: app/api/education/{resource}/route.ts
- Page components: app/{route}/[param]/page.tsx
- Shared components: components/education/report/{Component}.tsx

**Naming Conventions:**
- Components: PascalCase (FourLensesCards.tsx)
- Functions: camelCase (generateReportAccessToken)
- Database tables: snake_case (education_reports)
- API endpoints: kebab-case (/api/education/reports)

**UI Theme:**
- Pearl Vibrant colors (see design-system.md)
- Lucide icons only (no emojis)
- Border radius: 8px buttons, 12px cards
- Spacing: 12/16/20/24/32/40px scale

### Test Framework & Standards

**Current State:**
No test framework configured. Manual testing required.

**Manual Testing Checklist:**
1. Generate synthesis for campaign with completed sessions
2. Generate report and copy access URL
3. Access report via token (incognito window)
4. Verify Four Lenses cards display correctly
5. Verify triangulation chart renders
6. Test safeguarding notification (if signals present)
7. Test longitudinal comparison with multiple syntheses
8. Verify access toggle works
9. Test RLS - different school cannot access report

---

## Implementation Stack

**Complete Technology Stack:**

- **Runtime:** Node.js 20.x LTS
- **Framework:** Next.js 15.0.3 (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **Database:** PostgreSQL via Supabase
- **AI:** Anthropic Claude API (via existing synthesis agent)
- **Email:** Resend
- **Styling:** TailwindCSS with Pearl Vibrant theme
- **Icons:** Lucide React
- **Visualizations:** d3-scale + d3-shape + custom SVG
- **Hosting:** Vercel

---

## Technical Details

**Stakeholder Donut Chart:**

```typescript
interface StakeholderData {
  type: string
  count: number
  color: string
}

const STAKEHOLDER_COLORS: Record<string, string> = {
  student: '#1D9BA3',    // Teal
  teacher: '#F25C05',    // Orange
  parent: '#6366F1',     // Indigo
  leadership: '#10B981', // Emerald
  staff: '#8B5CF6'       // Purple
}

// Use d3-shape for arc generation
import { pie, arc } from 'd3-shape'

const pieGenerator = pie<StakeholderData>()
  .value(d => d.count)
  .sort(null)

const arcGenerator = arc<PieArcDatum<StakeholderData>>()
  .innerRadius(60)
  .outerRadius(100)
```

**Triangulation Visualization:**

Display aligned vs divergent themes as grouped cards:
- Aligned: Green border, shows consensus across groups
- Divergent: Amber border, shows where perspectives differ
- Blind spots: Red border, what one group sees others don't

**Longitudinal Comparison:**

```typescript
interface LongitudinalDataPoint {
  synthesisId: string
  generatedAt: string
  termLabel: string // "Term 1 2024", "Term 2 2024"
  urgencyLevel: string
  holdingScore: number
  slippingScore: number
  riskScore: number
}

// Line chart with multiple series
// X-axis: Terms
// Y-axis: Scores (0-100)
// Lines: Holding (green), Slipping (amber), Risk (red)
```

**Security Considerations:**

1. **Token Security:**
   - 256-bit entropy (cryptographically secure)
   - URL-safe base64 encoding
   - UNIQUE constraint in database

2. **RLS Policies:**
   - Synthesis: Organization-based access
   - Reports: Token-based public access OR organization access
   - Safeguarding section: Additional check for safeguarding lead

3. **Safeguarding Data:**
   - Never expose in URL parameters
   - Anchor link to section (`#safeguarding`)
   - Email contains no sensitive details, just link

---

## Development Setup

**Local Development:**

```bash
# Already set up - just run
npm run dev

# Access at http://localhost:3000
```

**Testing Report Feature:**

1. Ensure test school exists with completed campaign
2. Navigate to school detail page
3. Click "Generate Report" on campaign
4. Copy access URL
5. Open in incognito to test public access

---

## Implementation Guide

### Setup Steps

**Pre-Implementation Checklist:**

- [ ] Create feature branch: `git checkout -b feature/education-synthesis-reports`
- [ ] Review education-synthesis-agent.ts output structure
- [ ] Review existing school dashboard layout
- [ ] Verify Resend email service configured

### Implementation Steps

**Story 1: Database & API Foundation**
1. Create database migration for education_synthesis and education_reports tables
2. Add RLS policies for new tables
3. Create POST /api/education/synthesis endpoint
4. Create POST /api/education/reports endpoint
5. Create GET /api/education/reports/[token] endpoint
6. Test API endpoints

**Story 2: Dashboard UI & Report Generation**
1. Create ReportGenerationPanel component
2. Add panel to school detail page (after campaigns section)
3. Implement report generation flow
4. Display access URL with copy button
5. Show existing report status per campaign

**Story 3: Report Landing Page & Visualizations**
1. Create app/education/report/[token]/page.tsx
2. Create ReportDashboard client component
3. Build FourLensesCards component (color-coded)
4. Build StakeholderDonut chart
5. Build TriangulationChart visualization
6. Build UrgencyGauge component
7. Build RecommendationsTimeline component
8. Create SafeguardingSection (confidential)
9. Style with Pearl Vibrant theme

**Story 4: Longitudinal & Notifications**
1. Implement generateLongitudinalComparison() in synthesis agent
2. Create LongitudinalTrend chart component
3. Add longitudinal section to report page
4. Implement safeguarding notification via Resend
5. Update report generation to trigger notifications
6. Test full flow end-to-end

### Testing Strategy

**Manual Testing per Story:**

Story 1:
- [ ] Migration creates tables successfully
- [ ] RLS policies allow organization access
- [ ] Synthesis API generates valid result
- [ ] Report API creates token and stores

Story 2:
- [ ] Generation panel shows on school page
- [ ] Generate button triggers API correctly
- [ ] Access URL displays and copies
- [ ] Existing report status shows

Story 3:
- [ ] Token URL loads report page
- [ ] Four Lenses cards render with correct colors
- [ ] Donut chart shows stakeholder breakdown
- [ ] Triangulation displays aligned/divergent
- [ ] Safeguarding section only shows if signals > 0

Story 4:
- [ ] Longitudinal chart shows multiple terms
- [ ] Trend lines display correctly
- [ ] Safeguarding email sends to lead
- [ ] Email contains correct link

### Acceptance Criteria

**Feature Complete When:**

1. School contact or admin can generate synthesis report
2. Report accessible via secure token URL
3. Executive dashboard displays with all visualizations
4. Four Lenses cards color-coded correctly
5. Stakeholder participation visible
6. Triangulation insights displayed
7. Recommendations grouped by timeframe
8. Safeguarding section separate and confidential
9. Safeguarding lead notified when signals present
10. Longitudinal comparison functional across terms
11. Pearl Vibrant theme applied consistently
12. Mobile responsive
13. No console errors
14. TypeScript compiles without errors

---

## Developer Resources

### File Paths Reference

**New Files:**

```
app/api/education/synthesis/route.ts
app/api/education/reports/route.ts
app/api/education/reports/[token]/route.ts
app/education/report/[token]/page.tsx

components/education/report/
├── ReportDashboard.tsx
├── ReportGenerationPanel.tsx
├── FourLensesCards.tsx
├── StakeholderDonut.tsx
├── TriangulationChart.tsx
├── UrgencyGauge.tsx
├── RecommendationsTimeline.tsx
├── LongitudinalTrend.tsx
└── SafeguardingSection.tsx

lib/report/education-report-utils.ts

supabase/migrations/[timestamp]_create_education_reports.sql
```

**Files to Modify:**

```
app/dashboard/education/schools/[id]/page.tsx
lib/agents/education-synthesis-agent.ts
```

### Key Code Locations

**Synthesis Agent:**
- File: lib/agents/education-synthesis-agent.ts:361
- Function: generateEducationSynthesis()

**School Dashboard:**
- File: app/dashboard/education/schools/[id]/page.tsx:356
- Section: Campaigns list (add report panel after)

### Testing Locations

**Manual Testing Flow:**
1. Dashboard: `/dashboard/education/schools/[id]`
2. Generate Report: Click button on campaign
3. View Report: `/education/report/[token]`
4. Safeguarding: `/education/report/[token]#safeguarding`

---

## UX/UI Considerations

**Report Landing Page Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  [School Logo]  Module Assessment Report                │
│  School Name • Generated Date                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │ Urgency     │  │  Stakeholder Participation      │  │
│  │ [GAUGE]     │  │  [DONUT CHART]                  │  │
│  │ HIGH        │  │  Students: 45  Teachers: 12     │  │
│  └─────────────┘  └─────────────────────────────────┘  │
│                                                         │
│  FOUR LENSES                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ HOLDING  │ │ SLIPPING │ │ MISUNDER │ │ AT RISK  │  │
│  │ [Green]  │ │ [Amber]  │ │ [Orange] │ │ [Red]    │  │
│  │ ...      │ │ ...      │ │ ...      │ │ ...      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  TRIANGULATION                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │ Aligned Themes | Divergent Themes | Blind Spots│   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  RECOMMENDATIONS                                       │
│  [Immediate] [Short-term] [Strategic]                  │
│                                                         │
│  LONGITUDINAL TRENDS                                   │
│  [Line Chart: Term over Term]                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ⚠️ CONFIDENTIAL: SAFEGUARDING SECTION                 │
│  [Only visible if safeguarding_signals > 0]            │
└─────────────────────────────────────────────────────────┘
```

**Responsive Behavior:**
- Desktop: 2-column layout for top metrics
- Tablet: Stack vertically
- Mobile: Full-width cards, collapsible sections

**Accessibility:**
- ARIA labels on all charts
- Keyboard navigation for expandable sections
- Color contrast per WCAG AA
- Screen reader descriptions for visualizations

---

## Deployment Strategy

### Deployment Steps

1. Create and merge feature branch
2. Run database migration on Supabase
3. Verify environment variables (no new ones needed)
4. Deploy via Vercel (automatic on merge to main)
5. Test in production with pilot school

### Rollback Plan

1. Revert merge commit if critical issues
2. Database: Tables can remain (no data loss risk)
3. Monitor error rates for 24 hours post-deploy

### Monitoring

- Check Vercel function logs for API errors
- Monitor Supabase for synthesis generation performance
- Track Resend email delivery for safeguarding notifications
- Verify report access tracking incrementing

---

**END OF TECHNICAL SPECIFICATION**
