# innovaasflowforge - Technical Specification

**Author:** Todd
**Date:** 2025-11-18
**Project Level:** Quick Flow (Brownfield)
**Change Type:** Feature Enhancement
**Development Context:** Client Assessment Report Generation System

---

## Context

### Available Documents

The following documents were loaded to inform this technical specification:

- **Strategic Vision** (docs/strategic-vision.md) - Platform mission, roadmap, target markets
- **Current Implementation** (docs/industry-4-assessment-current.md) - Technical details and status
- **PDF Design Guidelines** (docs/pdf-design-guidelines.md) - Visual standards for reports
- **CLAUDE.md** - Project-specific AI development instructions
- **Architecture Documentation** - Multi-tenancy redesign and database schema

These documents provide comprehensive context on the platform's vision, current state, and design standards for creating professional assessment reports.

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
- Multi-tenant architecture with organizations

**AI & Services:**
- Anthropic Claude API (@anthropic-ai/sdk 0.27.0)
- Resend 6.4.2 (email service)
- OpenAI 6.9.0 (additional AI capabilities)

**Frontend & UI:**
- TailwindCSS 3.4.1 (Catppuccin Mocha theme)
- Lucide React 0.553.0 (icons)
- Zustand 4.4.7 (state management)

**Data Visualization:**
- d3-scale 4.0.2
- d3-shape 3.2.0
- @react-pdf/renderer 4.3.1 (PDF generation - currently non-functional)

**Hosting & Infrastructure:**
- Vercel (serverless deployment)
- Supabase Storage (file storage)
- MCP access: Supabase MCP, Vercel Awesome AI MCP

### Existing Codebase Structure

**Application Architecture:**
```
app/
├── api/                    # Next.js 15 API Routes
│   ├── campaigns/          # Campaign management endpoints
│   ├── sessions/           # Session management
│   └── company-profiles/   # Company and stakeholder management
├── dashboard/              # Protected admin interface
│   ├── campaigns/          # Campaign CRUD pages
│   └── companies/          # Company management pages
├── auth/                   # Authentication pages (login, signup)
└── session/[token]/        # Stakeholder interview interface

lib/
├── agents/                 # AI agent implementations
│   ├── assessment-agent.ts # Stakeholder interview agent
│   └── synthesis-agent.ts  # Cross-synthesis analysis agent
├── supabase/
│   ├── server.ts          # Supabase server client (RLS)
│   └── client.ts          # Supabase browser client
├── pdf-*.tsx              # PDF generation components (non-functional)
├── report-generator.ts    # Markdown report generator
├── anthropic.ts           # Anthropic API client
└── resend.ts              # Email service client

supabase/
└── migrations/            # Database schema migrations (17 files)
```

**Database Schema (Relevant Tables):**
- `organizations` - Multi-tenant organizations
- `user_profiles` - Users with roles (owner, admin, member)
- `campaigns` - Assessment campaigns with organization_id
- `stakeholder_sessions` - Interview sessions
- `agent_sessions` - AI conversation history
- `campaign_synthesis` - Synthesized assessment data
- `company_profiles` - Client company information
- `stakeholder_profiles` - Stakeholder templates

**Key Patterns:**
- Server Components (default in Next.js 15 App Router)
- Client Components marked with `'use client'`
- RESTful API routes in app/api/*
- Row Level Security (RLS) enforced via Supabase
- Service role admin client for privileged operations
- TypeScript strict mode with path aliases (@/*)
- Catppuccin Mocha color scheme throughout
- Brand gradient: Orange (#F25C05) to Teal (#1D9BA3)

---

## The Change

### Problem Statement

After stakeholders complete their Industry 4.0 readiness assessment interviews, consultants need a professional way to present findings to clients. Currently:

1. **No structured client report delivery system** - Consultants can only download markdown files manually
2. **PDF generation is non-functional** - The @react-pdf/renderer implementation doesn't work
3. **No tiered offering capability** - Cannot offer different levels of analysis based on client needs
4. **No controlled access mechanism** - No way to securely share reports with specific clients
5. **No visual engagement** - Clients receive raw data without compelling visualizations
6. **No consultant customization** - Cannot add observations or supporting documents

This limits the platform's value proposition and prevents effective client engagement with assessment results.

### Proposed Solution

Build a comprehensive **Client Assessment Report Generation System** that enables consultants to create tiered, interactive web-based reports with controlled access. The system will:

1. **Generate Reports from Dashboard** - Consultants select report tier (Basic/Informative/Premium) and generate report after all assessments complete
2. **Create Unique Access URLs** - System generates secure token-based URLs for client access
3. **Present Interactive Landing Pages** - Clients view engaging, professional reports with multiple visualization types
4. **Support Three Content Tiers** - Basic (scores), Informative (+themes), Premium (+architecture recommendations)
5. **Enable Consultant Enhancements** - Add observations, upload SOPs/images, attach supporting documents
6. **Provide Access Control** - Consultants can toggle report access on/off (no auto-expiration)
7. **Offer Markdown Downloads** - Clients can download markdown version of report

The solution integrates seamlessly into the existing campaign completion workflow without disrupting current functionality.

### Scope

**In Scope:**

1. Report generation interface in campaign detail page
2. Report metadata database table with tier configuration
3. Secure access token generation and validation
4. Public report landing page (token-based access)
5. Three-tier content differentiation logic
6. Multiple data visualization components (spider graph, bar charts, progress indicators)
7. Anonymous stakeholder quote display
8. Consultant observation input and storage
9. Supporting document upload to Supabase Storage
10. Markdown report download from landing page
11. Access toggle control for consultants
12. Role-based permissions (consultant-only feature)

**Out of Scope:**

- PDF report generation (deferred to future)
- Automated email delivery of report URLs
- Real-time report regeneration on data changes
- Report versioning and history
- Client commenting or feedback features
- Multi-language support
- White-label customization beyond brand colors
- Report analytics and view tracking

---

## Implementation Details

### Source Tree Changes

**NEW FILES TO CREATE:**

1. **app/api/campaigns/[id]/report/route.ts** - CREATE
   - POST endpoint to generate new report
   - PATCH endpoint to update report (observations, toggle access)
   - GET endpoint to fetch report metadata

2. **app/api/reports/[token]/route.ts** - CREATE
   - GET endpoint for public report access via token
   - Returns full report data including tier-appropriate content

3. **app/report/[token]/page.tsx** - CREATE
   - Public report landing page (Server Component)
   - Token validation and report data fetching
   - SEO meta tags for professional sharing

4. **components/report/ReportLandingPage.tsx** - CREATE
   - Client component for interactive report display
   - Handles visualizations, tabs, content rendering

5. **components/report/visualizations/SpiderChart.tsx** - CREATE
   - Spider/radar chart for dimensional scores
   - Built with d3-scale and SVG

6. **components/report/visualizations/PillarBarChart.tsx** - CREATE
   - Bar chart for pillar comparisons
   - d3-scale for data normalization

7. **components/report/visualizations/ScoreGauge.tsx** - CREATE
   - Circular gauge for overall score
   - Animated SVG component

8. **components/report/StakeholderQuotes.tsx** - CREATE
   - Anonymous quote display with role attribution
   - Carousel or grid layout

9. **components/report/TierContent.tsx** - CREATE
   - Conditional rendering based on tier level
   - Premium architecture recommendations

10. **components/dashboard/ReportGenerationPanel.tsx** - CREATE
    - Tier selection interface
    - Generate button with loading state
    - Access URL display and copy functionality

11. **lib/report/tier-content-generator.ts** - CREATE
    - Logic to determine content by tier
    - Extract appropriate data from synthesis

12. **lib/report/token-generator.ts** - CREATE
    - Cryptographically secure token generation
    - URL-safe base64 encoding

13. **supabase/migrations/[timestamp]_create_campaign_reports.sql** - CREATE
    - Database schema for campaign_reports table
    - Indexes and RLS policies

**FILES TO MODIFY:**

1. **app/dashboard/campaigns/[id]/page.tsx** - MODIFY
   - Add "Generate Report" button (consultant-only, visible when all assessments complete)
   - Display existing report status if generated
   - Show access URL and toggle control

2. **supabase/migrations/[latest]_add_consultant_role.sql** - MODIFY
   - Add 'consultant' role to user_profiles if not exists
   - Update permissions for report generation

3. **lib/agents/synthesis-agent.ts** - MODIFY (potentially)
   - Ensure synthesis output includes data needed for all tiers
   - May need to enhance to generate architecture recommendations for Premium tier

### Technical Approach

**Database Design:**

Use Supabase PostgreSQL with a new `campaign_reports` table:

```sql
CREATE TABLE campaign_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Access control
  access_token TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'informative', 'premium')),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Content
  synthesis_snapshot JSONB NOT NULL, -- Snapshot of synthesis data at generation time
  consultant_observations TEXT,
  supporting_documents JSONB DEFAULT '[]'::jsonb, -- Array of Supabase Storage URLs

  -- Metadata
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One report per campaign
  UNIQUE(campaign_id)
);
```

**Token Generation Strategy:**

Use Node.js `crypto` module for cryptographically secure tokens:
- 32 bytes of random data
- Base64 URL-safe encoding
- Check uniqueness before insertion
- Store in `access_token` column with UNIQUE constraint

**Content Tier Logic:**

Implement in `lib/report/tier-content-generator.ts`:

```typescript
type Tier = 'basic' | 'informative' | 'premium'

interface TierContent {
  includeOverallScore: boolean
  includePillarScores: boolean
  includeKeyThemes: boolean
  includeStakeholderQuotes: boolean
  includeGapAnalysis: boolean
  includeArchitectureRecommendations: boolean
  includeImplementationRoadmap: boolean
  includeDetailedDimensions: boolean
}

const TIER_CONFIG: Record<Tier, TierContent> = {
  basic: {
    includeOverallScore: true,
    includePillarScores: true,
    includeKeyThemes: false,
    includeStakeholderQuotes: false,
    includeGapAnalysis: false,
    includeArchitectureRecommendations: false,
    includeImplementationRoadmap: false,
    includeDetailedDimensions: false
  },
  informative: {
    includeOverallScore: true,
    includePillarScores: true,
    includeKeyThemes: true,
    includeStakeholderQuotes: true,
    includeGapAnalysis: true,
    includeArchitectureRecommendations: false,
    includeImplementationRoadmap: false,
    includeDetailedDimensions: true
  },
  premium: {
    includeOverallScore: true,
    includePillarScores: true,
    includeKeyThemes: true,
    includeStakeholderQuotes: true,
    includeGapAnalysis: true,
    includeArchitectureRecommendations: true,
    includeImplementationRoadmap: true,
    includeDetailedDimensions: true
  }
}
```

**Visualization Approach:**

Use SVG-based components with d3 utilities for data scaling:
- **Spider Chart**: SVG polygon with d3-scale for radial positioning
- **Bar Charts**: SVG rects with d3-scale for proportional widths
- **Score Gauges**: SVG arcs with animated transitions
- **Responsive**: viewBox for scaling, media queries for layout
- **Accessible**: ARIA labels, proper color contrast per Catppuccin theme

**File Upload Strategy:**

Use Supabase Storage:
- Bucket: `campaign-reports` (create if not exists)
- Path structure: `{campaign_id}/{filename}`
- RLS: Organization-based access control
- Max file size: 10MB per file
- Allowed types: PDF, PNG, JPG, DOCX, XLSX
- Store URLs in `supporting_documents` JSONB array

**Report Generation Workflow:**

1. Consultant clicks "Generate Report" on campaign detail page
2. System validates:
   - User has consultant role
   - All campaign assessments are submitted (status = 'completed')
   - No existing report OR user confirms overwrite
3. Backend:
   - Fetch latest campaign_synthesis data
   - Generate secure access token
   - Create campaign_reports record
   - Snapshot synthesis data (prevents changes affecting report)
4. Frontend:
   - Display success message
   - Show access URL with copy button
   - Enable access toggle control

**Access Control Pattern:**

Implement two-level authorization:
1. **Token validation**: Check access_token exists and is_active = true
2. **RLS policies**: Ensure campaign belongs to user's organization for management operations

Public report page bypasses auth for viewing (token is the auth mechanism).

### Existing Patterns to Follow

**Next.js 15 App Router Patterns:**

1. **Server Components (default):**
   - Use for report landing page (app/report/[token]/page.tsx)
   - Fetch data directly in component
   - No need for useState/useEffect

2. **Client Components ('use client'):**
   - Interactive visualizations
   - Report generation panel with form state
   - Copy-to-clipboard functionality

3. **API Routes:**
   - Follow existing pattern in app/api/campaigns/[id]/
   - Use getSupabaseAdmin() for privileged operations
   - Return { success: boolean, data?, error? } format

**Supabase Client Usage:**

Follow existing patterns from app/api/campaigns/[id]/route.ts:

```typescript
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin()

  // Bypass RLS for campaign_reports write operations
  const { data, error } = await supabase
    .from('campaign_reports')
    .insert({ ... })

  // Handle response
}
```

**TypeScript Patterns:**

- Define interfaces in same file or types/ directory
- Use strict null checks
- Leverage @/* path aliases
- Export type and interface separately

**Error Handling:**

Follow existing pattern:

```typescript
try {
  // Operation
  return Response.json({ success: true, data })
} catch (err) {
  console.error('Error description:', err)
  return Response.json({
    success: false,
    error: 'User-friendly message'
  }, { status: 500 })
}
```

**Styling Patterns:**

Use Catppuccin Mocha classes from existing codebase:
- Background: `bg-mocha-base`, `bg-mocha-surface0`
- Text: `text-mocha-text`, `text-mocha-subtext1`
- Accents: `bg-gradient-to-r from-brand-orange to-brand-teal`
- Borders: `border-mocha-surface1`
- Hover states: `hover:bg-mocha-surface1`

### Integration Points

**Internal Dependencies:**

1. **Campaign System:**
   - Read campaign data via campaigns table
   - Check stakeholder_sessions completion status
   - Access campaign.organization_id for RLS

2. **Synthesis Engine:**
   - Read from campaign_synthesis table
   - Parse synthesis_data JSONB for pillar scores, themes, recommendations
   - Snapshot at report generation time

3. **User Profile System:**
   - Verify consultant role via user_profiles.role or permissions
   - Check organization_id for multi-tenancy
   - Track generated_by user

4. **Supabase Storage:**
   - Upload supporting documents
   - Generate signed URLs for access
   - Store URLs in campaign_reports.supporting_documents

**External Services:**

1. **Anthropic Claude API (optional enhancement):**
   - Could generate architecture recommendations for Premium tier
   - Not required for MVP - can use synthesis data initially

2. **Vercel Deployment:**
   - Ensure environment variables configured
   - Public report URLs work on production domain

**Database Triggers:**

Leverage existing `update_updated_at_column()` function:

```sql
CREATE TRIGGER update_campaign_reports_updated_at
  BEFORE UPDATE ON campaign_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Development Context

### Relevant Existing Code

**Campaign Detail Page Structure:**
- File: app/dashboard/campaigns/[id]/page.tsx
- Lines 382-416: Report generation buttons already exist (markdown/PDF)
- Pattern to follow: Similar button for "Generate Client Report"
- Add above existing download buttons, make consultant-only visible

**Synthesis Data Structure:**
Reference existing synthesis output format:
- File: lib/agents/synthesis-agent.ts
- campaign_synthesis.synthesis_data JSONB contains:
  - overallScore (number)
  - pillars (array of { name, score, findings })
  - themes (array of strings)
  - recommendations (array of strings)
  - stakeholderInsights (array with role-based data)

**Token-Based Access Pattern:**
Reference existing stakeholder session access:
- File: app/session/[token]/page.tsx
- Pattern: Extract token from params, validate against DB
- Return 404 if invalid, render content if valid

**Supabase Admin Usage:**
- File: app/api/campaigns/[id]/synthesize/route.ts (lines 1-50)
- Shows proper error handling with admin client
- Pattern for saving synthesis data to database

### Dependencies

**Framework/Libraries:**

All dependencies already installed in package.json:

- **Next.js 15.0.3** - App Router, Server Components, API Routes
- **React 18.3.1** - UI components, hooks
- **TypeScript 5.x** - Type safety
- **@supabase/supabase-js 2.39.0** - Database operations
- **@supabase/ssr 0.0.10** - Server-side Supabase client
- **d3-scale 4.0.2** - Data normalization for charts
- **d3-shape 3.2.0** - SVG path generation
- **lucide-react 0.553.0** - Icons
- **zustand 4.4.7** - State management (if needed for report page state)

**Internal Modules:**

- `@/lib/supabase/server` - getSupabaseAdmin(), createClient()
- `@/lib/agents/synthesis-agent` - Synthesis data structure reference
- `@/components/*` - Reusable UI patterns
- `@/types/database` - Supabase type definitions

### Configuration Changes

**Environment Variables:**

No new environment variables required. Existing vars are sufficient:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key for client
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access for API routes

**Supabase Storage:**

Create new storage bucket via Supabase dashboard or migration:

```sql
-- Create storage bucket for campaign report documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-reports', 'campaign-reports', false);

-- RLS policies for storage
CREATE POLICY "Organization members can upload report docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-reports'
  AND auth.uid() IN (
    SELECT id FROM user_profiles
    WHERE organization_id = (
      SELECT organization_id FROM campaigns
      WHERE id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Organization members can view report docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'campaign-reports'
  AND auth.uid() IN (
    SELECT id FROM user_profiles
    WHERE organization_id = (
      SELECT organization_id FROM campaigns
      WHERE id::text = (storage.foldername(name))[1]
    )
  )
);
```

**Database Migrations:**

Two new migrations required:

1. **[timestamp]_add_consultant_role.sql:**
   - Add consultant-specific permissions to user_profiles
   - Update RLS policies for report generation

2. **[timestamp]_create_campaign_reports.sql:**
   - Create campaign_reports table
   - Add indexes and RLS policies
   - Create updated_at trigger

### Existing Conventions (Brownfield)

**Code Style:**
- TypeScript strict mode enabled
- No ESLint/Prettier config found - follow existing file patterns
- Single quotes for strings (observed in codebase)
- 2-space indentation
- Semicolons at end of statements

**File Organization:**
- API routes: app/api/{resource}/{id}/{action}/route.ts
- Page components: app/{route}/[param]/page.tsx
- Shared components: components/{feature}/{Component}.tsx
- Utilities: lib/{purpose}/{utility}.ts
- Types: Define interfaces inline or in types/ directory

**Naming Conventions:**
- Components: PascalCase (ReportLandingPage.tsx)
- Functions: camelCase (generateAccessToken)
- Constants: UPPER_SNAKE_CASE (TIER_CONFIG)
- Database tables: snake_case (campaign_reports)
- API endpoints: kebab-case (/api/campaigns/:id/report)

**Import Patterns:**
- Use @/* path alias for project files
- Group imports: React, Next.js, external, internal, types
- No default exports for utilities, prefer named exports

**Error Handling:**
- Try-catch blocks for all async operations
- Console.error for server-side logging
- Return { success: false, error: string } for API errors
- User-friendly error messages, not technical details

**Database Patterns:**
- Use getSupabaseAdmin() for API routes (bypasses RLS)
- Use createClient() for authenticated user context
- Always handle .error from Supabase operations
- Use JSONB for flexible/nested data structures
- UUID for all primary keys
- Timestamps: created_at, updated_at on all tables

### Test Framework & Standards

**Current State:**
No test framework currently configured in the project.

**Recommendation for Future:**
- Install Jest 29.x or Vitest for unit testing
- React Testing Library for component tests
- Playwright or Cypress for E2E tests

**For This Feature:**
Manual testing checklist:
1. Generate report as consultant - verify DB record created
2. Access report via token - verify content loads
3. Toggle access off - verify 404 response
4. Upload document - verify Supabase Storage upload
5. View each tier - verify appropriate content shown
6. Download markdown - verify file downloads
7. Non-consultant user - verify feature hidden
8. Different organization - verify isolation (RLS working)

---

## Implementation Stack

**Complete Technology Stack:**

**Runtime & Framework:**
- Node.js 20.x LTS
- Next.js 15.0.3 (App Router, Server Components, API Routes)
- React 18.3.1
- TypeScript 5.x (strict mode)

**Database & Storage:**
- PostgreSQL via Supabase
- @supabase/supabase-js 2.39.0
- @supabase/ssr 0.0.10
- Supabase Storage (file uploads)
- Supabase Realtime (if needed for live updates)

**AI & External Services:**
- Anthropic Claude API (@anthropic-ai/sdk 0.27.0) - Optional for Premium tier enhancements
- Resend 6.4.2 - Future email notifications

**UI & Styling:**
- TailwindCSS 3.4.1
- Autoprefixer 10.0.1
- PostCSS 8.x
- Catppuccin Mocha theme (custom)
- Brand colors: Orange (#F25C05), Teal (#1D9BA3)

**Components & Icons:**
- Lucide React 0.553.0 (icon library)
- Custom React components (no component library)

**Data Visualization:**
- d3-scale 4.0.2 (data normalization)
- d3-shape 3.2.0 (SVG shape generation)
- Custom SVG components for charts

**State Management:**
- Zustand 4.4.7 (lightweight state)
- React hooks (useState, useEffect, etc.)

**Development Tools:**
- ESLint 8.x (Next.js config)
- dotenv 17.2.3 (environment variables)

**Hosting:**
- Vercel (serverless functions, edge network)
- Vercel MCP (available via MCP access)

**MCP Integrations:**
- Supabase MCP (database operations)
- Vercel Awesome AI MCP (deployment, analytics)

---

## Technical Details

**Access Token Generation Algorithm:**

```typescript
import { randomBytes } from 'crypto'

export function generateAccessToken(): string {
  // 32 bytes = 256 bits of entropy
  // Base64 URL-safe encoding for 43 characters
  const token = randomBytes(32)
    .toString('base64url')

  return token
}

// Usage:
const accessToken = generateAccessToken()
// Example output: "xK8vN2mP4jR6sT1wQ9zY7cF5hL3nB8oA0eG2dJ4iU6k"
```

**Tier Content Determination Logic:**

```typescript
export function getTierContent(
  tier: 'basic' | 'informative' | 'premium',
  synthesisData: SynthesisData
): TieredReportContent {
  const config = TIER_CONFIG[tier]

  return {
    // Always included
    companyName: synthesisData.companyName,
    overallScore: config.includeOverallScore ? synthesisData.overallScore : null,
    pillarScores: config.includePillarScores ? synthesisData.pillars : null,

    // Tier-dependent
    keyThemes: config.includeKeyThemes ? synthesisData.themes : null,
    stakeholderQuotes: config.includeStakeholderQuotes
      ? extractAnonymousQuotes(synthesisData.stakeholderInsights)
      : null,
    detailedDimensions: config.includeDetailedDimensions
      ? synthesisData.dimensionBreakdown
      : null,
    gapAnalysis: config.includeGapAnalysis
      ? synthesisData.gapAnalysis
      : null,
    architectureRecommendations: config.includeArchitectureRecommendations
      ? generateArchitectureRecommendations(synthesisData)
      : null,
    implementationRoadmap: config.includeImplementationRoadmap
      ? generateRoadmap(synthesisData)
      : null
  }
}
```

**Spider Chart SVG Generation:**

```typescript
// Using d3-scale for radial positioning
import { scaleLinear } from 'd3-scale'

interface DataPoint {
  dimension: string
  score: number // 0-5
}

export function generateSpiderChartPath(data: DataPoint[]): string {
  const angleScale = scaleLinear()
    .domain([0, data.length])
    .range([0, 2 * Math.PI])

  const radiusScale = scaleLinear()
    .domain([0, 5])
    .range([0, 100]) // Max radius in viewport units

  const points = data.map((d, i) => {
    const angle = angleScale(i) - Math.PI / 2 // Start at top
    const radius = radiusScale(d.score)
    return {
      x: 150 + radius * Math.cos(angle), // Center at 150,150
      y: 150 + radius * Math.sin(angle)
    }
  })

  // Create polygon path
  return points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z'
}
```

**Supporting Document Upload Flow:**

```typescript
// 1. Frontend upload handler
async function handleDocumentUpload(file: File, campaignId: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('campaignId', campaignId)

  const response = await fetch(`/api/campaigns/${campaignId}/report/upload`, {
    method: 'POST',
    body: formData
  })

  return response.json()
}

// 2. Backend API route
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const campaignId = formData.get('campaignId') as string

  // Upload to Supabase Storage
  const supabase = getSupabaseAdmin()
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${campaignId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('campaign-reports')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) {
    return Response.json({ success: false, error: uploadError.message })
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('campaign-reports')
    .getPublicUrl(filePath)

  // Update campaign_reports.supporting_documents
  const { error: updateError } = await supabase
    .from('campaign_reports')
    .update({
      supporting_documents: supabase.raw(`
        supporting_documents || jsonb_build_array(jsonb_build_object(
          'name', '${file.name}',
          'url', '${publicUrl}',
          'uploadedAt', '${new Date().toISOString()}'
        ))
      `)
    })
    .eq('campaign_id', campaignId)

  return Response.json({ success: true, url: publicUrl })
}
```

**Security Considerations:**

1. **Token Security:**
   - 256-bit entropy (cryptographically secure)
   - URL-safe encoding
   - Stored hashed in database (optional enhancement)
   - No expiration (manual control via is_active flag)

2. **RLS Policies:**
   - Organization-based isolation for report management
   - Public access only via valid token
   - Consultant role verification for generation

3. **File Upload Validation:**
   - File type whitelist (PDF, images, office docs)
   - File size limit: 10MB per file
   - Malware scanning (future enhancement)
   - Organization storage quota enforcement

4. **Input Sanitization:**
   - Validate tier parameter against enum
   - Sanitize consultant observations (XSS prevention)
   - Validate campaign_id format (UUID)

**Performance Optimizations:**

1. **Report Generation:**
   - Snapshot synthesis data (avoid re-computation)
   - Generate token once, store in DB
   - Use database indexes on access_token, campaign_id

2. **Report Loading:**
   - Server-side rendering for initial load
   - Lazy load visualizations if heavy
   - Cache synthesis data in memory (Vercel serverless)

3. **Visualizations:**
   - SVG (lightweight, scalable)
   - requestAnimationFrame for animations
   - Use React.memo for expensive charts

---

## Development Setup

**Prerequisites:**

1. Node.js 20+ LTS installed
2. Git repository cloned
3. Supabase project configured
4. Vercel account (for deployment)

**Local Development Setup:**

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local

# Edit .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ANTHROPIC_API_KEY=your-anthropic-key (optional for Premium enhancements)

# 3. Run database migrations
# Via Supabase Dashboard → SQL Editor → Execute migrations

# 4. Start development server
npm run dev

# 5. Access application
# Open http://localhost:3000
```

**Testing Report Feature Locally:**

```bash
# 1. Create test campaign with completed assessments
# 2. Ensure test user has consultant role
# 3. Navigate to campaign detail page
# 4. Click "Generate Report" and select tier
# 5. Copy access URL
# 6. Open in incognito window (test public access)
# 7. Verify visualizations render correctly
# 8. Test markdown download
# 9. Toggle access off, verify 404
```

---

## Implementation Guide

### Setup Steps

**Pre-Implementation Checklist:**

- [ ] Create feature branch: `git checkout -b feature/client-report-system`
- [ ] Verify local dev environment running
- [ ] Review existing campaign detail page structure
- [ ] Review synthesis agent output format
- [ ] Ensure Supabase admin credentials configured
- [ ] Check Vercel MCP access working

**Database Schema Setup:**

1. Create migration file: `supabase/migrations/[timestamp]_create_campaign_reports.sql`
2. Add campaign_reports table definition
3. Add storage bucket and RLS policies
4. Add consultant role permissions (if needed)
5. Execute migration via Supabase dashboard
6. Verify tables created with `SELECT * FROM campaign_reports LIMIT 1`

**Component Structure Planning:**

```
components/
└── report/
    ├── ReportLandingPage.tsx         # Main report page
    ├── ReportGenerationPanel.tsx      # Dashboard generation UI
    ├── TierContent.tsx                # Conditional content renderer
    ├── StakeholderQuotes.tsx          # Quote carousel
    ├── MarkdownDownloadButton.tsx     # Download functionality
    └── visualizations/
        ├── SpiderChart.tsx            # Radar chart
        ├── PillarBarChart.tsx         # Bar chart
        ├── ScoreGauge.tsx             # Circular gauge
        └── ProgressIndicator.tsx      # Progress bars
```

### Implementation Steps

**Phase 1: Database & API Foundation (Story 1)**

1. Create database migration for campaign_reports table
2. Add Supabase Storage bucket for documents
3. Implement token generation utility (lib/report/token-generator.ts)
4. Create POST /api/campaigns/[id]/report endpoint (report generation)
5. Create GET /api/reports/[token] endpoint (public access)
6. Test API endpoints with curl/Postman
7. Verify RLS policies enforce organization isolation

**Phase 2: Report Generation UI (Story 2)**

1. Create ReportGenerationPanel component
2. Add tier selection radio buttons (Basic/Informative/Premium)
3. Implement generate button with loading state
4. Display access URL with copy-to-clipboard
5. Add access toggle switch
6. Integrate panel into campaign detail page (consultant-only)
7. Test full generation flow in browser

**Phase 3: Report Landing Page & Visualizations (Story 3)**

1. Create app/report/[token]/page.tsx (Server Component)
2. Implement token validation and data fetching
3. Create ReportLandingPage client component
4. Build SpiderChart with d3-scale
5. Build PillarBarChart component
6. Build ScoreGauge component
7. Implement TierContent conditional rendering
8. Add StakeholderQuotes display
9. Style with Catppuccin theme
10. Test all three tiers render correctly

**Phase 4: Document Upload & Enhancements (Story 4)**

1. Create file upload UI in generation panel
2. Implement POST /api/campaigns/[id]/report/upload endpoint
3. Add Supabase Storage integration
4. Create consultant observations textarea
5. Store observations in campaign_reports table
6. Display observations on report landing page (if present)
7. Add markdown download button
8. Test document upload and display flow

### Testing Strategy

**Manual Testing Checklist:**

**Functional Tests:**
- [ ] Consultant can generate report (all tiers)
- [ ] Access token URL works in browser
- [ ] Non-active reports return 404
- [ ] Basic tier shows limited content
- [ ] Informative tier shows additional themes/quotes
- [ ] Premium tier shows architecture recommendations
- [ ] Markdown download produces valid file
- [ ] Document upload stores in Supabase Storage
- [ ] Observations save and display correctly
- [ ] Access toggle hides/shows report
- [ ] Non-consultant users cannot see generation button

**Security Tests:**
- [ ] Different organization cannot access report
- [ ] Invalid token returns 404
- [ ] File upload rejects invalid file types
- [ ] File upload rejects oversized files
- [ ] RLS policies prevent cross-org data access

**UI/UX Tests:**
- [ ] Report page renders on mobile devices
- [ ] Visualizations scale responsively
- [ ] Colors match Catppuccin theme
- [ ] Loading states display during generation
- [ ] Error messages are user-friendly
- [ ] Copy button provides visual feedback

**Browser Compatibility:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Acceptance Criteria

**Feature Complete When:**

1. ✅ Consultant user can generate report from campaign detail page
2. ✅ System creates unique access token URL for each report
3. ✅ Tier selection (Basic/Informative/Premium) determines content shown
4. ✅ Report landing page displays:
   - Overall readiness score
   - Pillar scores with visualizations
   - Key themes (Informative+)
   - Anonymous stakeholder quotes (Informative+)
   - Architecture recommendations (Premium only)
   - Implementation roadmap (Premium only)
5. ✅ Multiple visualization types render correctly (spider, bar, gauge)
6. ✅ Consultant can add observations to report
7. ✅ Consultant can upload supporting documents (PDFs, images)
8. ✅ Documents display as downloadable links on report page
9. ✅ Markdown download button generates file
10. ✅ Access toggle on/off controls report visibility
11. ✅ Report access via token works without authentication
12. ✅ Invalid/inactive tokens return 404
13. ✅ Non-consultant users cannot access generation features
14. ✅ RLS policies prevent cross-organization access
15. ✅ Existing campaign functionality unchanged (no regressions)
16. ✅ Responsive design works on mobile and desktop
17. ✅ Catppuccin theme applied consistently
18. ✅ All TypeScript compiles without errors
19. ✅ No console errors during normal operation
20. ✅ Performance: Report loads in < 3 seconds

**Not Required for Completion:**
- PDF generation (future enhancement)
- Email notifications (future enhancement)
- Report analytics/view tracking (future enhancement)
- Automated testing suite (manual testing acceptable)

---

## Developer Resources

### File Paths Reference

**New Files to Create:**

```
app/
├── api/
│   ├── campaigns/[id]/report/
│   │   ├── route.ts                    # Generate/update report
│   │   └── upload/route.ts             # Document upload
│   └── reports/[token]/route.ts         # Public report access

├── report/[token]/page.tsx              # Public report landing page

components/
└── report/
    ├── ReportLandingPage.tsx            # Main report component
    ├── ReportGenerationPanel.tsx        # Dashboard UI
    ├── TierContent.tsx                  # Tier-based content
    ├── StakeholderQuotes.tsx            # Quote display
    ├── MarkdownDownloadButton.tsx       # Download button
    └── visualizations/
        ├── SpiderChart.tsx              # Radar chart
        ├── PillarBarChart.tsx           # Bar chart
        ├── ScoreGauge.tsx               # Gauge component
        └── ProgressIndicator.tsx        # Progress bars

lib/
└── report/
    ├── token-generator.ts               # Token generation
    ├── tier-content-generator.ts        # Tier logic
    └── markdown-exporter.ts             # Markdown generation

supabase/
└── migrations/
    ├── [timestamp]_add_consultant_role.sql
    └── [timestamp]_create_campaign_reports.sql
```

**Files to Modify:**

```
app/dashboard/campaigns/[id]/page.tsx    # Add generation panel
```

### Key Code Locations

**Campaign Detail Page:**
- File: app/dashboard/campaigns/[id]/page.tsx
- Insert point: After line 381 (before existing download buttons)
- Add: `<ReportGenerationPanel campaignId={campaign.id} hasReport={!!existingReport} />`

**Synthesis Data Access:**
- File: app/api/campaigns/[id]/synthesize/route.ts
- Reference: How to fetch and structure synthesis data
- Pattern: Use same approach for report generation

**Token Validation Pattern:**
- File: app/session/[token]/page.tsx
- Lines: 1-50 (token extraction and validation)
- Adapt: Similar pattern for report token validation

**Supabase Admin Client:**
- File: lib/supabase/server.ts
- Function: getSupabaseAdmin()
- Import: `import { getSupabaseAdmin } from '@/lib/supabase/server'`

**Catppuccin Theme Classes:**
- Reference: app/dashboard/campaigns/[id]/page.tsx (throughout)
- Background: `bg-mocha-base`, `bg-mocha-surface0`
- Text: `text-mocha-text`, `text-mocha-subtext1`
- Accent: `bg-gradient-to-r from-brand-orange to-brand-teal`

### Testing Locations

**Manual Testing Flow:**

1. **Dashboard** → http://localhost:3000/dashboard
2. **Campaign Detail** → http://localhost:3000/dashboard/campaigns/[uuid]
3. **Generate Report** → Click button, select tier
4. **View Report** → http://localhost:3000/report/[token]
5. **Toggle Access** → Dashboard → Toggle off → Verify 404

**API Testing:**

```bash
# Generate report (requires auth)
curl -X POST http://localhost:3000/api/campaigns/[id]/report \
  -H "Content-Type: application/json" \
  -d '{"tier": "premium"}' \
  -H "Cookie: sb-access-token=..."

# Access report (public)
curl http://localhost:3000/api/reports/[token]

# Upload document
curl -X POST http://localhost:3000/api/campaigns/[id]/report/upload \
  -F "file=@document.pdf" \
  -F "campaignId=[uuid]"
```

**Database Verification:**

```sql
-- Check report created
SELECT * FROM campaign_reports WHERE campaign_id = '[uuid]';

-- Check storage upload
SELECT * FROM storage.objects WHERE bucket_id = 'campaign-reports';

-- Verify RLS working
SET ROLE authenticated;
SET request.jwt.claims.sub TO '[different-user-id]';
SELECT * FROM campaign_reports; -- Should return empty if RLS working
```

### Documentation to Update

**After Feature Complete:**

1. **README.md** - Add section on report generation feature
2. **docs/industry-4-assessment-current.md** - Update with report system details
3. **CLAUDE.md** - Add report system to key features
4. **API Documentation** (if exists) - Document new endpoints:
   - POST /api/campaigns/[id]/report
   - GET /api/reports/[token]
   - POST /api/campaigns/[id]/report/upload

**Inline Code Documentation:**

Add JSDoc comments to key functions:

```typescript
/**
 * Generates a cryptographically secure access token for report access
 * @returns {string} URL-safe base64 encoded token (43 characters)
 */
export function generateAccessToken(): string {
  // Implementation
}

/**
 * Determines which content to include based on report tier
 * @param tier - Report tier (basic, informative, or premium)
 * @param synthesisData - Full synthesis data from campaign
 * @returns {TieredReportContent} Content filtered by tier settings
 */
export function getTierContent(
  tier: Tier,
  synthesisData: SynthesisData
): TieredReportContent {
  // Implementation
}
```

---

## UX/UI Considerations

**UI Components Affected:**

1. **Campaign Detail Page** (app/dashboard/campaigns/[id]/page.tsx)
   - Add: Report generation panel below progress overview
   - Position: After "Synthesis Readiness" card, before "Stakeholder List"
   - Visibility: Only shown to consultant users
   - States: Not generated | Generated (show URL + toggle) | Generating (loading)

2. **Report Landing Page** (app/report/[token]/page.tsx)
   - New public page (no dashboard chrome)
   - Full-width, scrollable layout
   - Hero section with company name and overall score
   - Visualization section with tabs/grid
   - Findings section with collapsible cards
   - Footer with download button

**UX Flow Changes:**

**Current Flow:**
1. Stakeholders complete interviews
2. Consultant reviews in dashboard
3. Downloads markdown report manually
4. Shares file externally

**New Flow:**
1. Stakeholders complete interviews
2. Consultant reviews in dashboard
3. **[NEW]** Clicks "Generate Client Report"
4. **[NEW]** Selects tier (Basic/Informative/Premium)
5. **[NEW]** System generates report + access URL
6. **[NEW]** Consultant copies URL and shares with client
7. **[NEW]** Client opens URL, views interactive report
8. **[NEW]** Client downloads markdown if desired

**Visual/Interaction Patterns:**

**Follow Existing Design System:**
- Catppuccin Mocha color palette (already in Tailwind config)
- Brand gradient for primary CTAs: `bg-gradient-to-r from-brand-orange to-brand-teal`
- Card-based layout: `bg-mocha-surface0 rounded-lg p-6`
- Subtle borders: `border border-mocha-surface1`
- Hover states: `hover:bg-mocha-surface1 transition-colors`

**Report Landing Page Design:**

```
┌─────────────────────────────────────────────┐
│  [Logo/Branding]                            │
│  Industry 4.0 Readiness Assessment          │
│  [Company Name]                             │
│  ──────────────────────────────────────────│
│                                             │
│  Overall Readiness Score: 3.8/5.0          │
│      [Large Circular Gauge]                │
│                                             │
│  ──────────────────────────────────────────│
│                                             │
│  Pillar Scores                             │
│  [Spider Chart]  [Bar Chart]               │
│                                             │
│  ──────────────────────────────────────────│
│  [Tier: Informative/Premium only]         │
│  Key Themes                                │
│  • Digital Infrastructure Gaps             │
│  • Process Automation Opportunities        │
│  • Skills Development Needs                │
│                                             │
│  ──────────────────────────────────────────│
│  [Tier: Informative/Premium only]         │
│  What Stakeholders Said                   │
│  "We're still tracking production with     │
│   spreadsheets..." - Production Manager    │
│                                             │
│  ──────────────────────────────────────────│
│  [Tier: Premium only]                      │
│  Architecture Recommendations              │
│  • Implement MES system                    │
│  • Deploy IoT sensors for real-time data   │
│                                             │
│  ──────────────────────────────────────────│
│                                             │
│  [Download Markdown Report]                │
│  [Consultant Observations - if present]    │
│  [Supporting Documents - if present]       │
└─────────────────────────────────────────────┘
```

**Responsive Design Considerations:**

**Desktop (>1024px):**
- Two-column layout for visualizations
- Side-by-side spider and bar charts
- Wide hero section with large gauge

**Tablet (768px - 1024px):**
- Single column layout
- Full-width visualizations
- Stacked content sections

**Mobile (<768px):**
- Condensed hero section
- Smaller gauge visualization
- Tabbed interface for charts (swipe between)
- Collapsible sections for themes/recommendations

**Accessibility:**

**Keyboard Navigation:**
- Tab order: Generate button → Tier selection → Submit → Copy URL
- Escape key closes modals
- Enter key submits forms

**Screen Reader Compatibility:**
- Proper ARIA labels on visualizations
- `role="img"` for charts with descriptive `aria-label`
- Semantic HTML (h1, h2, section, article)
- Alt text for all icons

**ARIA Labels Needed:**

```tsx
// Spider chart
<svg role="img" aria-label="Spider chart showing readiness scores across 6 dimensions">
  {/* Chart content */}
</svg>

// Tier selection
<fieldset>
  <legend>Select Report Tier</legend>
  <input type="radio" id="basic" name="tier" value="basic"
         aria-describedby="basic-desc" />
  <label htmlFor="basic">Basic</label>
  <span id="basic-desc" className="sr-only">
    Includes overall score and pillar scores only
  </span>
</fieldset>
```

**Color Contrast Standards:**

Verify WCAG AA compliance for Catppuccin colors:
- Text on base: `text-mocha-text` (#cdd6f4) on `bg-mocha-base` (#1e1e2e) ✓ 12.6:1
- Subtext: `text-mocha-subtext1` (#bac2de) on `bg-mocha-base` ✓ 10.1:1
- Orange accent: #F25C05 - Use only for non-text elements or large text
- Teal accent: #1D9BA3 - Verify against backgrounds

**User Feedback:**

**Loading States:**
- Generate button: "Generating Report..." with spinner
- Report page: Skeleton loaders for charts while data loads
- Upload: Progress bar for file uploads

**Error Messages:**
- "Failed to generate report. Please try again."
- "This report is no longer accessible." (for inactive reports)
- "File upload failed. Maximum file size is 10MB."
- "Only PDF, PNG, JPG, DOCX files are allowed."

**Success Confirmations:**
- "Report generated successfully! Share the URL below with your client."
- "Document uploaded successfully."
- "Report access updated."

**Progress Indicators:**
- File upload: `<progress>` element with percentage
- Report generation: Indeterminate spinner
- Visualization loading: Shimmer effect on chart containers

---

## Testing Approach

**CONFORM TO EXISTING TEST STANDARDS:**

Currently, no test framework is configured in the project. For this feature, manual testing will be the primary validation method.

**Recommendation:**
Install Jest and React Testing Library for future test coverage:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Test Strategy:**

### Unit Tests (Future)

**Token Generation:**
```typescript
describe('generateAccessToken', () => {
  it('should generate 43-character URL-safe token', () => {
    const token = generateAccessToken()
    expect(token).toHaveLength(43)
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('should generate unique tokens', () => {
    const token1 = generateAccessToken()
    const token2 = generateAccessToken()
    expect(token1).not.toBe(token2)
  })
})
```

**Tier Content Logic:**
```typescript
describe('getTierContent', () => {
  const mockSynthesis = { /* ... */ }

  it('should include only basics for basic tier', () => {
    const content = getTierContent('basic', mockSynthesis)
    expect(content.overallScore).toBeDefined()
    expect(content.pillarScores).toBeDefined()
    expect(content.keyThemes).toBeNull()
    expect(content.architectureRecommendations).toBeNull()
  })

  it('should include architecture for premium tier', () => {
    const content = getTierContent('premium', mockSynthesis)
    expect(content.architectureRecommendations).toBeDefined()
  })
})
```

### Integration Tests (Future)

**API Routes:**
```typescript
describe('POST /api/campaigns/[id]/report', () => {
  it('should create report with valid tier', async () => {
    const response = await fetch('/api/campaigns/test-id/report', {
      method: 'POST',
      body: JSON.stringify({ tier: 'premium' })
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.accessToken).toHaveLength(43)
  })

  it('should reject invalid tier', async () => {
    const response = await fetch('/api/campaigns/test-id/report', {
      method: 'POST',
      body: JSON.stringify({ tier: 'invalid' })
    })

    expect(response.status).toBe(400)
  })
})
```

### E2E Tests (Future - Playwright/Cypress)

**Report Generation Flow:**
```typescript
test('consultant generates and accesses report', async ({ page }) => {
  // Login as consultant
  await page.goto('/dashboard')
  await page.fill('[name=email]', 'consultant@test.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')

  // Navigate to campaign
  await page.click('text=Test Campaign')

  // Generate report
  await page.click('text=Generate Client Report')
  await page.check('[value=premium]')
  await page.click('text=Generate Report')

  // Wait for success
  await page.waitForSelector('text=Report generated successfully')

  // Copy URL and visit
  const url = await page.inputValue('[data-testid=access-url]')
  await page.goto(url)

  // Verify report displays
  await page.waitForSelector('text=Overall Readiness Score')
  await expect(page.locator('svg[role=img]')).toBeVisible()
})
```

### Manual Testing Coverage

**Coverage Requirements:**

For this feature, achieve comprehensive manual testing coverage:

**Functional Coverage:**
- [ ] Report generation for all three tiers
- [ ] Token validation (valid/invalid/inactive)
- [ ] Content filtering by tier
- [ ] Document upload and display
- [ ] Observations save and display
- [ ] Access toggle functionality
- [ ] Markdown download
- [ ] Role-based access (consultant-only)

**Edge Cases:**
- [ ] Generate report when no synthesis exists → Error
- [ ] Generate report with incomplete assessments → Error
- [ ] Upload file >10MB → Rejected
- [ ] Upload invalid file type → Rejected
- [ ] Access report from different organization → 404
- [ ] Toggle access while client viewing → Immediate 404

**Browser Testing:**
- [ ] Chrome 120+ (desktop)
- [ ] Firefox 120+ (desktop)
- [ ] Safari 17+ (desktop)
- [ ] Mobile Safari (iOS 17+)
- [ ] Chrome Mobile (Android 13+)

**Accessibility Testing:**
- [ ] Keyboard navigation complete
- [ ] Screen reader announces chart data
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Forms have proper labels

**Performance Benchmarks:**
- [ ] Report generation < 5 seconds
- [ ] Report page load < 3 seconds
- [ ] Visualization render < 1 second
- [ ] File upload < 10 seconds for 5MB file

---

## Deployment Strategy

### Deployment Steps

**Pre-Deployment Checklist:**

- [ ] All code merged to main branch
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Manual testing complete (all acceptance criteria met)
- [ ] Database migrations executed on production Supabase
- [ ] Supabase Storage bucket created
- [ ] Environment variables configured in Vercel
- [ ] Consultant role assigned to test users

**Deployment Sequence:**

1. **Database Migration (Production Supabase)**
   ```bash
   # Via Supabase Dashboard → SQL Editor
   # Execute: [timestamp]_add_consultant_role.sql
   # Execute: [timestamp]_create_campaign_reports.sql
   # Verify: SELECT * FROM campaign_reports LIMIT 1;
   ```

2. **Storage Bucket Setup**
   ```bash
   # Via Supabase Dashboard → Storage
   # Create bucket: campaign-reports
   # Set public: false
   # Configure RLS policies per migration
   ```

3. **Vercel Deployment**
   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main

   # Or manual deploy
   vercel --prod
   ```

4. **Post-Deployment Verification**
   - [ ] Visit production dashboard
   - [ ] Generate test report
   - [ ] Access report via token URL
   - [ ] Verify visualizations render
   - [ ] Test document upload
   - [ ] Verify markdown download

**Environment Variables (Vercel):**

All required variables already configured:
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

No new variables needed for this feature.

**Feature Flags (Optional):**

If gradual rollout desired:

```typescript
// lib/feature-flags.ts
export const FEATURE_FLAGS = {
  CLIENT_REPORTS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_CLIENT_REPORTS === 'true'
}

// Usage in component
import { FEATURE_FLAGS } from '@/lib/feature-flags'

{FEATURE_FLAGS.CLIENT_REPORTS_ENABLED && (
  <ReportGenerationPanel />
)}
```

Set in Vercel:
```bash
# Enable for specific environment
NEXT_PUBLIC_ENABLE_CLIENT_REPORTS=true
```

### Rollback Plan

**Rollback Triggers:**

- Critical bugs preventing report access
- Data security breach
- Performance degradation affecting main app
- Database corruption

**Rollback Steps:**

1. **Immediate: Disable Feature via Feature Flag**
   ```bash
   # In Vercel Dashboard → Environment Variables
   Set NEXT_PUBLIC_ENABLE_CLIENT_REPORTS=false
   # Trigger redeploy
   ```

2. **If Flag Not Implemented: Git Revert**
   ```bash
   # Identify deployment to rollback to
   git log --oneline

   # Revert merge commit
   git revert -m 1 <merge-commit-hash>

   # Push to trigger deployment
   git push origin main
   ```

3. **Database Rollback (if schema issues)**
   ```sql
   -- Drop new table (keeps data for recovery)
   ALTER TABLE campaign_reports RENAME TO campaign_reports_backup;

   -- Or delete all reports
   DELETE FROM campaign_reports;
   ```

4. **Verify Rollback**
   - [ ] Feature UI no longer visible
   - [ ] Existing functionality works
   - [ ] No errors in console
   - [ ] Monitor error rates return to baseline

**Recovery:**

After fixing issues:
1. Fix bugs in feature branch
2. Test thoroughly in staging environment
3. Re-merge to main
4. Re-enable feature flag
5. Monitor closely for 24 hours

### Monitoring Approach

**What to Monitor After Deployment:**

**Application Metrics (Vercel Dashboard):**
- [ ] Error rate (should remain < 1%)
- [ ] Response times for new API routes
  - `/api/campaigns/[id]/report` < 5s
  - `/api/reports/[token]` < 2s
- [ ] Function invocations and duration
- [ ] Build success rate

**Database Metrics (Supabase Dashboard):**
- [ ] campaign_reports table row count (should grow)
- [ ] Query performance for report fetches
- [ ] Storage usage in campaign-reports bucket
- [ ] RLS policy performance (no slowdowns)

**User Experience Monitoring:**
- [ ] Report generation success rate
- [ ] Report access 404 rate (should be low)
- [ ] Markdown download success rate
- [ ] Document upload success rate

**Error Monitoring:**

Set up alerts for:
- Any 500 errors on report endpoints
- Failed report generations
- Failed file uploads
- Token validation failures

**Manual Checks (First 48 Hours):**
- [ ] Generate report in production (all tiers)
- [ ] Access report URL
- [ ] Upload document
- [ ] Download markdown
- [ ] Check error logs for unusual patterns

**Success Metrics:**

After 1 week:
- [ ] At least 5 reports generated successfully
- [ ] 0 critical bugs reported
- [ ] < 1% error rate on report endpoints
- [ ] User feedback positive (if collected)
- [ ] No performance degradation on existing features

**Long-Term Monitoring:**

Weekly checks:
- Report generation volume
- Storage usage growth
- Most popular tier selected
- Average report access count

Monthly review:
- Feature usage statistics
- Performance trends
- User feedback summary
- Potential optimizations

---

**END OF TECHNICAL SPECIFICATION**

This specification provides comprehensive guidance for implementing the Client Assessment Report Generation System. All technical decisions are definitive, with specific versions, file paths, and implementation patterns based on the existing codebase.

