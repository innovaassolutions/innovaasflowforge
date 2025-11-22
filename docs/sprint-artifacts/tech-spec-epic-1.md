# Epic Technical Specification: Client Assessment Report Generation System

Date: 2025-11-20
Author: Todd
Epic ID: 1
Status: Draft

---

## Overview

The Client Assessment Report Generation System transforms how consultants present Industry 4.0 readiness assessment results to clients. Currently, the platform successfully conducts AI-facilitated stakeholder interviews and generates synthesis data, but lacks a professional client-facing delivery mechanism. This epic implements a comprehensive web-based report system that enables consultants to generate tiered, interactive reports with controlled access.

The system addresses a critical gap in the value chain: consultants complete assessments through multi-stakeholder AI interviews, synthesis analysis generates comprehensive readiness scores and recommendations, but clients receive only raw markdown files. This epic creates a professional report landing page with data visualizations, tiered content (Basic/Informative/Premium), secure token-based access, and consultant customization capabilities (observations, document uploads).

Built on the existing Next.js 15 + Supabase architecture, this feature integrates seamlessly into the campaign completion workflow without disrupting current functionality. The implementation leverages d3-scale for visualizations, follows the Catppuccin Mocha design system, and maintains TypeScript strict mode throughout.

## Objectives and Scope

**Primary Objectives:**
1. Enable consultants to generate professional client reports from campaign dashboard
2. Provide three-tiered content offerings (Basic, Informative, Premium) for different client needs
3. Create secure, token-based access URLs for client viewing without authentication
4. Present interactive data visualizations (spider charts, bar charts, gauges) for engagement
5. Allow consultant customization through observations and supporting document uploads
6. Provide markdown download capability for client record-keeping

**In Scope:**
- Report generation UI integrated into campaign detail page (consultant-only)
- Database schema for campaign_reports with tier configuration and access control
- Secure access token generation (256-bit cryptographic tokens)
- Public report landing page with responsive design
- Three visualization components: SpiderChart, PillarBarChart, ScoreGauge
- Tier-based content filtering logic
- Anonymous stakeholder quote display (Informative+)
- Architecture recommendations display (Premium only)
- Consultant observations input and storage
- Supporting document upload to Supabase Storage
- Markdown export functionality
- Access toggle control (on/off, no expiration)
- Role-based permissions enforcement

**Out of Scope (Deferred):**
- PDF generation (@react-pdf/renderer non-functional)
- Automated email delivery of report URLs
- Real-time report regeneration on data changes
- Report versioning and history
- Client commenting or feedback features
- Multi-language support
- White-label customization beyond brand colors
- Report analytics and view tracking

## System Architecture Alignment

**Aligns with Existing Architecture:**

The report system integrates into the established multi-tenant Next.js 15 + Supabase architecture without structural changes:

1. **Multi-Tenancy Model**: Leverages existing company_profiles and user_profiles structure from the multi-tenancy redesign. Reports are company-scoped through `campaign_reports.campaign_id → campaigns.company_profile_id`.

2. **Authentication Pattern**: Follows existing token-based access pattern used for stakeholder_sessions. Public report pages use access_token for authorization, consistent with `app/session/[token]/page.tsx` pattern.

3. **Database Strategy**: Adds campaign_reports table to existing Supabase PostgreSQL schema. Maintains Row Level Security (RLS) policies for organization isolation. Uses JSONB for flexible synthesis_snapshot storage, consistent with campaign_synthesis pattern.

4. **API Design**: Implements RESTful endpoints following `app/api/campaigns/[id]/` pattern. Uses getSupabaseAdmin() for privileged operations, createClient() for user context. Maintains `{ success: boolean, data?, error? }` response format.

5. **Storage Integration**: Utilizes Supabase Storage with new `campaign-reports` bucket. Follows organization-based RLS policies. Stores document URLs in JSONB array, consistent with flexible schema approach.

6. **UI/UX Consistency**: Adheres to Catppuccin Mocha theme (bg-mocha-base, text-mocha-text). Uses brand gradient (Orange #F25C05 to Teal #1D9BA3) for primary actions. Follows existing card-based layouts and responsive patterns.

7. **TypeScript Standards**: Maintains strict mode compilation. Uses @/* path aliases. Follows existing interface/type patterns from campaign and synthesis systems.

**No Architectural Conflicts**: Feature is purely additive, introducing no breaking changes to existing campaign, synthesis, or authentication flows.

## Detailed Design

### Services and Modules

| Module/Service | Responsibility | Inputs | Outputs | Owner |
|----------------|----------------|---------|---------|-------|
| **ReportGenerationPanel** | Campaign dashboard UI for report creation | campaign_id, user_role | Report generation request | Frontend (React) |
| **ReportLandingPage** | Public report display component | access_token | Rendered report with visualizations | Frontend (React) |
| **POST /api/campaigns/[id]/report** | Generate new report with tier selection | campaign_id, tier, consultant_observations | campaign_reports record, access_token | API Route |
| **GET /api/reports/[token]** | Public report data access | access_token | Report data (tier-filtered synthesis) | API Route |
| **POST /api/campaigns/[id]/report/upload** | Supporting document upload handler | file, campaign_id | Supabase Storage URL | API Route |
| **token-generator.ts** | Cryptographic token generation | None | 256-bit base64url token | Utility |
| **tier-content-generator.ts** | Content filtering by tier | tier, synthesis_data | TieredReportContent | Utility |
| **markdown-exporter.ts** | Report markdown generation | report_data | Markdown file | Utility |
| **SpiderChart.tsx** | Radar chart visualization | pillar_scores[] | SVG chart component | Component |
| **PillarBarChart.tsx** | Bar chart visualization | pillar_scores[] | SVG chart component | Component |
| **ScoreGauge.tsx** | Circular gauge visualization | overall_score | SVG gauge component | Component |

### Data Models and Contracts

**campaign_reports Table:**

```sql
CREATE TABLE campaign_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Access Control
  access_token TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'informative', 'premium')),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Content
  synthesis_snapshot JSONB NOT NULL,
  consultant_observations TEXT,
  supporting_documents JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(campaign_id)
);

CREATE INDEX idx_campaign_reports_campaign ON campaign_reports(campaign_id);
CREATE INDEX idx_campaign_reports_token ON campaign_reports(access_token);
CREATE INDEX idx_campaign_reports_generated_by ON campaign_reports(generated_by);
```

**TypeScript Interfaces:**

```typescript
interface CampaignReport {
  id: string;
  campaign_id: string;
  access_token: string;
  tier: 'basic' | 'informative' | 'premium';
  is_active: boolean;
  synthesis_snapshot: SynthesisData;
  consultant_observations: string | null;
  supporting_documents: SupportingDocument[];
  generated_by: string;
  generated_at: string;
  last_accessed_at: string | null;
  access_count: number;
  created_at: string;
  updated_at: string;
}

interface SynthesisData {
  company_name: string;
  overall_score: number; // 0-5
  pillars: PillarScore[];
  dimensions: DimensionScore[];
  key_themes: string[];
  gap_analysis: string[];
  recommendations: string[];
  stakeholder_insights: StakeholderInsight[];
  architecture_recommendations?: string[]; // Premium tier
  implementation_roadmap?: RoadmapItem[]; // Premium tier
}

interface PillarScore {
  name: string;
  score: number; // 0-5
  findings: string;
}

interface DimensionScore {
  dimension: string;
  score: number; // 0-5
  pillar: string;
}

interface StakeholderInsight {
  role: string;
  key_quotes: string[];
  priorities: string[];
}

interface SupportingDocument {
  name: string;
  url: string;
  uploaded_at: string;
  file_type: string;
}

interface TierContent {
  includeOverallScore: boolean;
  includePillarScores: boolean;
  includeDetailedDimensions: boolean;
  includeKeyThemes: boolean;
  includeStakeholderQuotes: boolean;
  includeGapAnalysis: boolean;
  includeArchitectureRecommendations: boolean;
  includeImplementationRoadmap: boolean;
}
```

**Supabase Storage Bucket:**

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-reports', 'campaign-reports', false);

-- File structure: {campaign_id}/{timestamp}-{filename}
-- Max file size: 10MB
-- Allowed types: PDF, PNG, JPG, JPEG, DOCX, XLSX
```

### APIs and Interfaces

**POST /api/campaigns/[id]/report**

Generate or regenerate campaign report.

```typescript
// Request
{
  tier: 'basic' | 'informative' | 'premium';
  consultant_observations?: string;
}

// Response (Success)
{
  success: true;
  data: {
    access_token: string;
    access_url: string;
    report_id: string;
  }
}

// Response (Error)
{
  success: false;
  error: string;
}

// Validation Rules:
// - User must have consultant role
// - All campaign stakeholder_sessions must have status = 'completed'
// - campaign_synthesis must exist for campaign
// - tier must be valid enum value
```

**GET /api/reports/[token]**

Public report data access (no authentication required).

```typescript
// Request: access_token in URL path

// Response (Success)
{
  success: true;
  data: {
    company_name: string;
    tier: string;
    content: TieredReportContent; // Filtered by tier
    consultant_observations: string | null;
    supporting_documents: SupportingDocument[];
    generated_at: string;
  }
}

// Response (Not Found/Inactive)
{
  success: false;
  error: 'Report not found or no longer accessible'
}

// Side Effects:
// - Increments access_count
// - Updates last_accessed_at timestamp
```

**POST /api/campaigns/[id]/report/upload**

Upload supporting document to report.

```typescript
// Request (multipart/form-data)
{
  file: File; // Max 10MB
  campaign_id: string;
}

// Response (Success)
{
  success: true;
  data: {
    url: string;
    file_name: string;
  }
}

// Response (Error)
{
  success: false;
  error: string; // 'File too large' | 'Invalid file type' | 'Upload failed'
}

// File Validation:
// - Type whitelist: .pdf, .png, .jpg, .jpeg, .docx, .xlsx
// - Max size: 10MB
// - Virus scanning: Future enhancement
```

**PATCH /api/campaigns/[id]/report**

Update report observations or toggle access.

```typescript
// Request
{
  consultant_observations?: string;
  is_active?: boolean;
}

// Response
{
  success: true;
  data: {
    report_id: string;
    updated_at: string;
  }
}
```

### Workflows and Sequencing

**Report Generation Sequence:**

```
1. Consultant → Campaign Detail Page
   - Views campaign with status = 'completed'
   - All stakeholder_sessions.status = 'completed'
   - campaign_synthesis exists

2. Click "Generate Client Report"
   - Opens ReportGenerationPanel modal/drawer
   - Displays tier selection (radio buttons)
   - Shows consultant observations textarea
   - Displays generate button

3. Select Tier + Submit
   - Frontend: POST /api/campaigns/[id]/report
   - Backend validates:
     a. User has consultant role (user_profiles.role or permissions)
     b. Campaign belongs to user's organization
     c. Synthesis data exists

4. Server Processing
   a. Fetch campaign_synthesis.synthesis_data (JSONB)
   b. Generate access_token (crypto.randomBytes(32).toString('base64url'))
   c. Snapshot synthesis_data to campaign_reports.synthesis_snapshot
   d. Create campaign_reports record with tier
   e. Return access_token to frontend

5. Display Results
   - Show success message
   - Display access URL with copy button
   - Enable access toggle control
   - Show "Upload Documents" button (optional)

6. Optional: Upload Supporting Documents
   - User selects files (<10MB each)
   - POST /api/campaigns/[id]/report/upload
   - Files uploaded to Supabase Storage: campaign-reports/{campaign_id}/{timestamp}-{filename}
   - URLs stored in campaign_reports.supporting_documents JSONB array
```

**Report Access Sequence:**

```
1. Client receives URL: https://app.com/report/{access_token}

2. Browser → GET /report/[token]/page.tsx (Server Component)
   - Server extracts token from URL params
   - Server queries: SELECT * FROM campaign_reports WHERE access_token = ? AND is_active = true
   - If not found or inactive → return 404
   - If found → load full report data

3. Server Response
   - Increments access_count, updates last_accessed_at
   - Passes report data to ReportLandingPage component
   - Applies tier-based content filtering

4. Client Rendering (ReportLandingPage)
   - Displays company name + overall score
   - Renders SpiderChart with dimension scores
   - Renders PillarBarChart with pillar scores
   - Renders ScoreGauge with overall readiness
   - Shows tier-appropriate content sections:
     * Basic: Scores only
     * Informative: + Key themes, stakeholder quotes, gap analysis
     * Premium: + Architecture recommendations, implementation roadmap
   - Displays consultant observations (if present)
   - Lists supporting documents with download links
   - Provides markdown download button

5. Markdown Download
   - Click download button
   - Client: Calls markdown-exporter.ts utility
   - Generates markdown from report data
   - Triggers browser download: {company_name}-assessment-report.md
```

**Access Control Sequence:**

```
1. Consultant toggles access OFF
   - PATCH /api/campaigns/[id]/report { is_active: false }
   - Updates campaign_reports.is_active = false

2. Client attempts access
   - GET /api/reports/[token]
   - Query finds record but is_active = false
   - Returns 404 response
   - Client sees "Report no longer accessible" message

3. Consultant toggles access ON
   - PATCH /api/campaigns/[id]/report { is_active: true }
   - Report becomes accessible again immediately
```

## Non-Functional Requirements

### Performance

**Target Metrics:**
- Report generation API response: < 5 seconds (95th percentile)
- Public report page load (cold start): < 3 seconds (95th percentile)
- Visualization rendering: < 1 second per chart
- File upload: < 10 seconds for 5MB file
- Markdown download generation: < 2 seconds

**Optimization Strategies:**
- **Database**: Index on access_token and campaign_id for O(1) lookups. JSONB synthesis_snapshot avoids join complexity.
- **Server Components**: Next.js 15 Server Components eliminate client-side hydration overhead for report landing page.
- **Visualization**: SVG-based charts with d3-scale for efficient client-side rendering. Use React.memo for expensive chart components.
- **Caching**: Vercel Edge Network caches static report pages. Synthesis snapshots prevent re-computation.
- **File Storage**: Supabase Storage CDN for document delivery. Lazy load document previews.

**Load Considerations:**
- Expected volume: ~50 reports generated per day initially
- Concurrent report views: ~20 simultaneous clients
- Vercel serverless functions auto-scale for API endpoints
- Supabase handles 500+ concurrent connections

### Security

**Access Control:**
- **Token-based authorization**: 256-bit cryptographic tokens (crypto.randomBytes(32)) provide ~10^77 entropy, making brute force infeasible.
- **Public access boundaries**: Report landing pages are public but require knowledge of unguessable token. No user data exposed in URLs beyond token.
- **Role-based permissions**: Report generation restricted to users with consultant role (verified via user_profiles.role or permissions JSONB).
- **Organization isolation**: RLS policies enforce company_profile_id scoping. No cross-organization data access.

**Data Protection:**
- **Synthesis snapshots**: Immutable copies prevent data tampering. Original campaign_synthesis remains protected by existing RLS.
- **Storage security**: Supabase Storage RLS policies restrict document access to organization members. Files not publicly accessible.
- **Input validation**: Tier enum validation, file type whitelist, 10MB size limit. Consultant observations sanitized for XSS prevention.
- **HTTPS-only**: All API endpoints and report pages served over TLS 1.3.

**Authentication:**
- **Consultant actions**: Require authenticated session (Supabase Auth) with consultant role verification.
- **Client access**: Token-only authentication for report viewing (no account required). Token acts as bearer credential.
- **Token lifecycle**: No automatic expiration. Manual toggle via is_active flag. Tokens remain valid until explicitly revoked.

**Threat Mitigation:**
- **SQL injection**: Parameterized queries via Supabase client prevent injection.
- **XSS**: React automatic escaping + sanitization of consultant observations.
- **CSRF**: Vercel SameSite cookie policy protects authenticated endpoints.
- **File upload attacks**: File type validation, size limits. Future: malware scanning integration.

### Reliability/Availability

**Availability Target:** 99.5% uptime (aligned with Vercel and Supabase SLAs)

**Failure Modes & Recovery:**
1. **Report generation failure**: Graceful error message to user. Synthesis data remains intact for retry. No partial records created (transaction boundary).
2. **File upload failure**: Retry mechanism in frontend. Failed uploads don't corrupt campaign_reports record. Supabase Storage has built-in retry.
3. **Report access failure**: 404 fallback page with support contact. Error logged for investigation. Client can retry immediately.
4. **Database unavailable**: Vercel serverless functions retry with exponential backoff. User sees loading state, then error after timeout.

**Data Durability:**
- **Campaign reports**: Backed by Supabase PostgreSQL with daily backups and point-in-time recovery.
- **Synthesis snapshots**: JSONB storage ensures report remains accessible even if original synthesis is modified/deleted.
- **Uploaded documents**: Supabase Storage replicates files across availability zones. 99.95% durability guarantee.

**Degradation Gracefully:**
- If Supabase Storage unavailable: Report displays without supporting documents, shows error message.
- If visualization rendering fails: Display data in table format fallback.
- If markdown export fails: Show error, report remains viewable online.

**Monitoring & Alerting:**
- Track report generation success rate (target: >99%)
- Monitor report access 404 rate (target: <5%)
- Alert on API error rate spike (>1% for 5 minutes)
- Track Supabase connection pool usage

### Observability

**Logging Requirements:**
- **Report generation**: Log campaign_id, tier, generated_by, timestamp, duration. Include errors with stack traces.
- **Report access**: Log access_token (hashed), timestamp, is_active status, rendering duration. Track access_count increment.
- **File uploads**: Log file size, type, campaign_id, upload duration, success/failure.
- **API errors**: Full error context (endpoint, request params, user_id, error message, stack trace).

**Metrics to Track:**
- **Report metrics**: Generation count by tier, average generation time, regeneration frequency.
- **Access metrics**: Unique report views, average views per report, access after toggle-off attempts.
- **Performance metrics**: P50/P95/P99 latencies for all API endpoints, visualization render time.
- **Storage metrics**: Document upload volume, storage quota usage per organization.

**Tracing:**
- **End-to-end request tracing**: Vercel provides automatic distributed tracing for API routes.
- **Database query tracing**: Supabase logs slow queries (>1s). Review periodically for optimization.
- **Client-side monitoring**: Track visualization rendering performance with performance.mark().

**Debugging Tools:**
- **Vercel Logs**: Real-time API logs with request/response inspection.
- **Supabase Dashboard**: Database query logs, RLS policy evaluation traces.
- **Browser DevTools**: Client-side rendering performance, network waterfall for report page.
- **Error Tracking**: Console errors logged to Vercel. Consider integration with Sentry for production.

## MCP Server Integration (Development Tools)

**CRITICAL: All Epic 1 Stories Must Use MCP Servers**

This project is configured with Supabase and Vercel MCP servers. Development agents MUST use these tools instead of manual scripts, CLI commands, or custom automation.

### Supabase MCP Tools (Database Operations)

**Migration Management:**
- `mcp__supabase__apply_migration` - Apply migration files to database
- `mcp__supabase__list_migrations` - Check migration history and status

**Database Operations:**
- `mcp__supabase__execute_sql` - Run SQL queries for testing and verification
- `mcp__supabase__list_tables` - Verify schema and table structure
- `mcp__supabase__list_extensions` - Check installed PostgreSQL extensions

**Type Generation:**
- `mcp__supabase__generate_typescript_types` - Auto-generate TypeScript types from schema

**Quality & Security:**
- `mcp__supabase__get_advisors` - Security and performance recommendations (RLS policy checks, missing indexes, etc.)
- `mcp__supabase__get_logs` - Retrieve application logs for debugging

**Project Management:**
- `mcp__supabase__get_project` - Project details and configuration
- `mcp__supabase__list_branches` - Development branch management

### Vercel MCP Tools (Deployment Operations)

**Deployment Management:**
- `mcp__vercel-awesome-ai__list_deployments` - Check deployment status and history
- `mcp__vercel-awesome-ai__get_deployment` - Get specific deployment details
- `mcp__vercel-awesome-ai__get_deployment_build_logs` - Debug build failures

**Documentation:**
- `mcp__vercel-awesome-ai__search_vercel_documentation` - Search Vercel docs for best practices

**Project Info:**
- `mcp__vercel-awesome-ai__list_projects` - List all Vercel projects
- `mcp__vercel-awesome-ai__get_project` - Get project configuration

### Standard Development Workflows Using MCP

**Story 1.1 - Database Migration:**
1. Create migration SQL file in `supabase/migrations/`
2. Apply with `mcp__supabase__apply_migration`
3. Verify tables with `mcp__supabase__list_tables`
4. Run security audit with `mcp__supabase__get_advisors`
5. Generate types with `mcp__supabase__generate_typescript_types`

**Story 1.2-1.4 - API Development:**
1. Implement API routes and components
2. Test locally with `npm run dev`
3. Commit and push to Git
4. Check deployment with `mcp__vercel-awesome-ai__list_deployments`
5. Debug any issues with `mcp__vercel-awesome-ai__get_deployment_build_logs`

**Testing RLS Policies:**
1. Write test SQL queries
2. Execute with `mcp__supabase__execute_sql`
3. Verify organization isolation works correctly
4. Run security advisor to catch policy gaps

**Type Safety Workflow:**
1. Complete database schema changes
2. Run `mcp__supabase__generate_typescript_types`
3. Update `lib/types/database.types.ts` with generated types
4. Verify TypeScript compilation succeeds

## Dependencies and Integrations

### Framework Dependencies

**Core Framework:**
- **Next.js 15.0.3**: App Router with Server Components for report landing pages. React Server Components eliminate client-side hydration overhead.
- **React 18.3.1**: Client components for interactive visualizations (SpiderChart, PillarBarChart, ScoreGauge).
- **TypeScript 5.x**: Strict mode enabled. Ensures type safety across API contracts and data models.

**UI and Styling:**
- **TailwindCSS 3.x**: Utility-first styling with Catppuccin Mocha theme configuration. Custom gradient classes for brand colors (Orange #F25C05, Teal #1D9BA3).
- **Lucide React (^0.553.0)**: Icon library for UI actions (copy, download, upload, toggle). Replaces emoji usage per user preferences.

**Data Visualization:**
- **d3-scale (^4.0.2)**: Scaling functions for chart axes and data mapping. Used in SpiderChart for polar coordinate calculations.
- **d3-shape (^3.2.0)**: SVG path generators for radar polygons, bar shapes, and arc gauges.

**State Management:**
- **Zustand (^4.4.7)**: Lightweight state management for report generation UI state (tier selection, observations input, upload progress).

**Database and Storage:**
- **@supabase/supabase-js (^2.39.0)**: Database queries, RLS policy evaluation, Storage uploads.
- **@supabase/ssr (^0.0.10)**: Server-side rendering utilities for authenticated requests in Server Components.

**AI Integration:**
- **@anthropic-ai/sdk (^0.27.0)**: Not directly used in this epic, but synthesis_snapshot contains data generated by Claude-powered synthesis agent.

**Version Constraints:**
- Next.js 15.x required for Server Components and streaming architecture.
- React 18.3+ required for concurrent rendering features.
- d3-scale/d3-shape compatibility: Both must be 4.x/3.x respectively for consistent API.
- Supabase client 2.39+ required for Storage bucket RLS policy support.

### Internal Module Dependencies

**Existing Services (Used by Epic 1):**
- **lib/supabase/server.ts**: `createClient()` for authenticated requests, `getSupabaseAdmin()` for privileged operations (report generation).
- **lib/supabase/client.ts**: Browser client for file uploads and markdown downloads from ReportLandingPage.
- **lib/agents/synthesis-agent.ts**: Generates synthesis_data used as input for campaign_reports.synthesis_snapshot. Epic 1 consumes output, does not modify agent.

**New Modules Created by Epic 1:**
- **lib/utils/token-generator.ts**: Cryptographic token generation with crypto.randomBytes(32).
- **lib/utils/tier-content-generator.ts**: Content filtering logic based on tier enum. Maps tier to TierContent boolean flags.
- **lib/utils/markdown-exporter.ts**: Converts SynthesisData to formatted markdown string. Includes chart data as tables.
- **components/reports/SpiderChart.tsx**: SVG radar chart with d3-scale polar coordinate mapping.
- **components/reports/PillarBarChart.tsx**: Horizontal bar chart with SVG rect elements.
- **components/reports/ScoreGauge.tsx**: Circular arc gauge with d3-shape arc generator.
- **components/reports/ReportGenerationPanel.tsx**: Campaign dashboard UI for tier selection and report creation.
- **components/reports/ReportLandingPage.tsx**: Public-facing report display with tier-filtered content.

**Shared Utilities (Used by Epic 1):**
- **lib/utils/cn.ts**: Tailwind class merging utility (clsx + tailwind-merge). Used in all report components for conditional styling.
- **lib/types/database.types.ts**: Database type definitions. Epic 1 extends with CampaignReport interface.

**Database Schema Dependencies:**
- **campaigns table**: Foreign key reference for campaign_reports.campaign_id. Must exist before report generation.
- **campaign_synthesis table**: Source of synthesis_data snapshotted to campaign_reports. Requires synthesis_data JSONB column.
- **company_profiles table**: Organization isolation via campaigns.company_profile_id. RLS policies leverage this relationship.
- **user_profiles table**: Role verification for consultant permissions. Requires role column or permissions JSONB.

**Component Dependencies:**
- ReportGenerationPanel depends on campaign completion status (all stakeholder_sessions.status = 'completed').
- ReportLandingPage depends on campaign_reports.synthesis_snapshot structure matching SynthesisData interface.
- Visualization components depend on standardized data shapes (PillarScore[], DimensionScore[]).

### External Service Integrations

**Supabase (Primary Backend):**
- **Service**: Managed PostgreSQL + Storage
- **Integration Points**:
  - Database: campaign_reports table with RLS policies
  - Storage: campaign-reports bucket for supporting documents
  - Authentication: Service role key for privileged operations, anon key for public access
- **Configuration**:
  - Environment: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Connection pooling: Default Supabase settings (500 max connections)
  - Row Level Security: Organization-scoped policies on campaign_reports
- **Data Flow**:
  - Report Generation: Server Component → getSupabaseAdmin() → INSERT campaign_reports
  - Report Access: Server Component → createClient() → SELECT with is_active check
  - File Upload: Client → Supabase Storage API → UPSERT supporting_documents JSONB
- **Error Handling**: Supabase client throws PostgrestError. Wrapped in try-catch with user-friendly messages.

**Vercel (Hosting and Deployment):**
- **Service**: Next.js hosting with serverless functions
- **Integration Points**:
  - API Routes: All /api/campaigns/[id]/report/* endpoints deployed as serverless functions
  - Edge Network: Caches report landing pages for fast access
  - Environment Variables: Securely stores Supabase credentials
- **Configuration**:
  - Runtime: Node.js 20+
  - Region: Auto (multi-region)
  - Function timeout: 10s (default)
- **Monitoring**: Vercel logs provide API request/response tracing. No additional integration required.

**Supabase Storage (Document Uploads):**
- **Bucket**: `campaign-reports` (private bucket, non-public)
- **File Structure**: `{campaign_id}/{timestamp}-{filename}`
- **RLS Policies**: Organization members can upload/read their company's documents. Service role bypasses RLS for migrations.
- **URL Format**: `https://{project}.supabase.co/storage/v1/object/campaign-reports/{campaign_id}/{file}`
- **Constraints**: Max 10MB per file, whitelist: .pdf, .png, .jpg, .jpeg, .docx, .xlsx

**Browser Crypto API:**
- **Usage**: Token generation via `crypto.randomBytes(32)` in server-side Node.js environment (not browser).
- **Fallback**: None required. Node.js crypto module guaranteed available in Vercel serverless runtime.

**No New External Services:**
- Epic 1 uses only existing integrations (Supabase, Vercel).
- No third-party analytics, monitoring, or CDN services added.
- Future consideration: Sentry for error tracking (not in scope).

### Integration Constraints

**API Rate Limits:**
- Supabase: 100 requests/second per project (shared across all endpoints). Epic 1 adds minimal load (~5-10 report generations/hour).
- Vercel: 100GB bandwidth/month on Pro plan. Report pages ~500KB each. Documents stored in Supabase (not Vercel bandwidth).

**Storage Quotas:**
- Supabase Storage: 100GB on Pro plan. Estimate ~50MB/campaign with documents. Supports ~2000 campaigns before quota review.

**Database Connection Pool:**
- Supabase: 500 max connections. Epic 1 uses connection pooling via Supabase client (no manual management).

**CORS Configuration:**
- Supabase Storage: CORS enabled for same-origin requests. Public report pages served from same domain, no cross-origin issues.
- API Routes: Next.js API routes automatically handle CORS for same-origin. No additional configuration needed.

**Migration Dependencies:**
- Migration for campaign_reports table must run before Epic 1 deployment.
- Storage bucket creation can run independently (no schema dependency).
- No data migration required (new feature, no existing data to transform).

## Acceptance Criteria (Authoritative)

The following acceptance criteria define the complete and testable requirements for Epic 1. Each criterion is numbered for traceability and must be satisfied before story completion.

### AC-1: Report Generation Core Functionality

**AC-1.1** System creates campaign_reports record with unique access token when consultant requests report generation for completed campaign

**AC-1.2** Access token is cryptographically secure (256-bit, base64url encoded) with entropy sufficient to prevent brute force attacks

**AC-1.3** Report data is accessible via public token endpoint (`GET /api/reports/[token]`) without authentication requirements

**AC-1.4** RLS policies enforce organization isolation preventing cross-company data access

**AC-1.5** Invalid or inactive tokens return 404 response with appropriate error message

### AC-2: Report Generation User Interface

**AC-2.1** Campaign detail page displays "Generate Client Report" button for consultants when all stakeholder_sessions.status = 'completed'

**AC-2.2** Report generation panel provides tier selection (Basic, Informative, Premium) via radio buttons

**AC-2.3** Generate button shows loading state (spinner, disabled state) during API processing

**AC-2.4** System displays generated access URL with copy-to-clipboard button after successful generation

**AC-2.5** Consultant can toggle report access on/off using switch control, affecting is_active flag

**AC-2.6** Report generation panel is visible to users with campaign report access permissions (campaign-level "can_generate_reports" flag OR admin-class user profile)

**AC-2.7** Existing campaign markdown download buttons remain functional after report feature integration

### AC-3: Report Landing Page Display

**AC-3.1** Public report page renders when valid access token provided in URL

**AC-3.2** Overall readiness score (0-5) displays prominently at top of report

**AC-3.3** Pillar scores display in both spider chart (radar) and horizontal bar chart visualizations

**AC-3.4** Score gauge component displays overall readiness as circular arc with percentage

**AC-3.5** Basic tier displays only scores and charts (no detailed recommendations)

**AC-3.6** Informative tier displays scores, charts, key themes, stakeholder quotes, and gap analysis

**AC-3.7** Premium tier displays all Informative content plus architecture recommendations and implementation roadmap

**AC-3.8** Anonymous stakeholder quotes display correctly for Informative and Premium tiers

**AC-3.9** Architecture recommendations section displays only for Premium tier reports

### AC-4: Visualization Requirements

**AC-4.1** SpiderChart renders correctly with all pillar dimensions plotted on polar coordinates

**AC-4.2** PillarBarChart displays all pillars with proportional bar lengths (0-5 scale)

**AC-4.3** ScoreGauge renders as circular arc with score percentage and color gradient

**AC-4.4** All visualizations are responsive and adapt to mobile (320px+) and desktop viewports

**AC-4.5** Visualizations include ARIA labels for screen reader accessibility

**AC-4.6** Charts render using d3-scale and d3-shape libraries (no external chart libraries)

### AC-5: Theming and Design

**AC-5.1** Report landing page applies Catppuccin Mocha theme consistently (bg-mocha-base, text-mocha-text)

**AC-5.2** Primary action buttons use brand gradient (Orange #F25C05 to Teal #1D9BA3)

**AC-5.3** Report layout follows card-based design pattern consistent with existing dashboard

**AC-5.4** Typography uses system font stack with proper hierarchy (headings, body, captions)

**AC-5.5** Color contrast meets WCAG AA standards for accessibility (4.5:1 for body text)

### AC-6: Consultant Observations

**AC-6.1** Report generation panel includes textarea for consultant observations input

**AC-6.2** Observations textarea supports markdown formatting (bold, italic, lists)

**AC-6.3** Saved observations display on public report page in dedicated section

**AC-6.4** Observations persist across report regeneration (PATCH endpoint updates)

**AC-6.5** Empty observations do not display placeholder text on public report

### AC-7: Document Upload System

**AC-7.1** File upload UI accepts multiple file selection (<10MB each)

**AC-7.2** System validates file types against whitelist: PDF, PNG, JPG, JPEG, DOCX, XLSX

**AC-7.3** System rejects files exceeding 10MB size limit with clear error message

**AC-7.4** Files upload to Supabase Storage bucket `campaign-reports` with path structure `{campaign_id}/{timestamp}-{filename}`

**AC-7.5** File URLs store in campaign_reports.supporting_documents JSONB array

**AC-7.6** Uploaded documents display as downloadable links on public report page

**AC-7.7** Document links open in new tab with appropriate file type handling

### AC-8: Markdown Export

**AC-8.1** Public report page displays "Download Markdown" button

**AC-8.2** Clicking download button generates complete markdown file from report data

**AC-8.3** Markdown file includes all tier-appropriate content in formatted text

**AC-8.4** Chart data exports as markdown tables with pillar names and scores

**AC-8.5** Markdown filename follows pattern: `{company_name}-assessment-report.md`

**AC-8.6** Browser triggers download without page navigation

### AC-9: Security and Access Control

**AC-9.1** Report generation restricted to authenticated users with campaign report permissions (campaign-level flag OR admin-class profile)

**AC-9.2** Public report access requires only valid access token (no authentication)

**AC-9.3** Inactive reports (is_active = false) return 404 even with valid token

**AC-9.4** Users can only generate reports for campaigns they have permission to access (organization-scoped RLS policies)

**AC-9.5** RLS policies prevent direct database queries across organization boundaries

**AC-9.6** File uploads restricted to organization members (Storage RLS policies)

**AC-9.7** XSS prevention applied to consultant observations (sanitization/escaping)

### AC-10: Performance and Reliability

**AC-10.1** Report generation API responds within 5 seconds (95th percentile)

**AC-10.2** Public report page loads within 3 seconds cold start (95th percentile)

**AC-10.3** Visualization rendering completes within 1 second per chart

**AC-10.4** File upload completes within 10 seconds for 5MB file

**AC-10.5** Markdown download generation completes within 2 seconds

**AC-10.6** Failed report generation does not create partial database records (transaction boundary)

### AC-11: Integration and Compatibility

**AC-11.1** Report system does not disrupt existing campaign creation workflow

**AC-11.2** Report system does not interfere with stakeholder interview sessions

**AC-11.3** Report system does not modify campaign_synthesis data (read-only access)

**AC-11.4** TypeScript compilation succeeds with strict mode enabled (no type errors)

**AC-11.5** All new components follow existing project conventions (@/* imports, cn() utility)

**AC-11.6** Database migrations run successfully on clean Supabase instance

**AC-11.7** Feature works on Chrome, Firefox, Safari (latest 2 versions)

## Traceability Mapping

This table maps each acceptance criterion to the technical implementation details, ensuring complete coverage from requirements through testing.

| AC ID | Spec Section(s) | Component(s) / API(s) | Test Idea |
|-------|----------------|----------------------|-----------|
| **AC-1.1** | Detailed Design → Data Models, APIs | POST /api/campaigns/[id]/report, campaign_reports table | API test: POST request with valid campaign_id returns success with report_id and token |
| **AC-1.2** | Security → Access Control, Dependencies | token-generator.ts (crypto.randomBytes) | Unit test: Verify token length (43 chars base64url), test uniqueness across 10k generations |
| **AC-1.3** | APIs → GET /api/reports/[token], Workflows | GET /api/reports/[token] route, ReportLandingPage | Integration test: Public GET request with valid token returns 200 with report data |
| **AC-1.4** | Architecture Alignment → Database Strategy, Security | RLS policies on campaign_reports, company_profiles FK | Database test: Attempt cross-org access via direct query (should fail), test RLS with different user contexts |
| **AC-1.5** | APIs → GET /api/reports/[token], Security | GET /api/reports/[token] with is_active check | Integration test: Request with invalid token returns 404, toggled-off report returns 404 |
| **AC-2.1** | Detailed Design → Services, Workflows | ReportGenerationPanel.tsx, campaign detail page integration | UI test: Navigate to completed campaign, verify button visible; incomplete campaign has no button |
| **AC-2.2** | Detailed Design → Services, UI/UX Consistency | ReportGenerationPanel tier selection (radio inputs) | UI test: Verify 3 radio options render, only one selectable, default selection exists |
| **AC-2.3** | Performance, Detailed Design → Services | ReportGenerationPanel loading state management | UI test: Click generate, verify spinner appears, button disabled; success clears loading state |
| **AC-2.4** | Workflows → Report Generation Sequence, APIs | ReportGenerationPanel display logic, navigator.clipboard API | UI test: After generation, verify URL displayed, click copy button, verify clipboard contains correct URL |
| **AC-2.5** | APIs → PATCH endpoint, Workflows → Access Control | PATCH /api/campaigns/[id]/report, toggle switch UI | Integration test: Toggle off, verify is_active=false, public access returns 404; toggle on, access restored |
| **AC-2.6** | Security → Access Control, Detailed Design | ReportGenerationPanel permission check (campaign.can_generate_reports OR user admin status) | Integration test: Load page as user without permissions, verify panel hidden; authorized user sees panel |
| **AC-2.7** | Integration → No Disruption, Detailed Design | Campaign detail page existing download buttons | Regression test: Verify markdown download buttons still functional after report feature deployment |
| **AC-3.1** | Workflows → Report Access Sequence, APIs | app/report/[token]/page.tsx (Server Component) | Integration test: Visit /report/[valid-token], verify 200 response with rendered HTML |
| **AC-3.2** | Detailed Design → Data Models, UI Components | ReportLandingPage overall_score display | UI test: Verify score displays in large font at top, matches synthesis_snapshot.overall_score |
| **AC-3.3** | Detailed Design → Services (SpiderChart, PillarBarChart) | SpiderChart.tsx, PillarBarChart.tsx rendering | UI test: Verify both charts render with same pillar data, chart dimensions accurate |
| **AC-3.4** | Detailed Design → Services (ScoreGauge) | ScoreGauge.tsx with arc generator | UI test: Verify circular gauge renders, arc angle proportional to score, percentage label correct |
| **AC-3.5** | Detailed Design → Data Models (TierContent), Workflows | tier-content-generator.ts, TierContent component | Integration test: Request Basic tier report, verify only scores/charts visible, no recommendations |
| **AC-3.6** | Detailed Design → Data Models (TierContent), Workflows | tier-content-generator.ts, ReportLandingPage sections | Integration test: Request Informative tier, verify themes, quotes, gap analysis visible |
| **AC-3.7** | Detailed Design → Data Models (TierContent), Workflows | tier-content-generator.ts, Premium-tier sections | Integration test: Request Premium tier, verify architecture recommendations and roadmap visible |
| **AC-3.8** | Detailed Design → Services, Data Models | StakeholderQuotes component, synthesis_snapshot.stakeholder_insights | UI test: Verify quotes display without names (anonymous), correct role labels, Informative+ only |
| **AC-3.9** | Detailed Design → Data Models, Scope | Premium tier conditional rendering | Integration test: Load Premium report, verify arch recommendations section; Basic/Informative reports hide section |
| **AC-4.1** | Detailed Design → Services (SpiderChart), Dependencies | SpiderChart.tsx with d3-scale polar coordinates | Visual test: Verify radar polygon plotted correctly, all dimensions labeled, scales accurate |
| **AC-4.2** | Detailed Design → Services (PillarBarChart) | PillarBarChart.tsx with SVG rect elements | Visual test: Verify bars proportional to scores (0-5), labels aligned, colors consistent |
| **AC-4.3** | Detailed Design → Services (ScoreGauge), Dependencies | ScoreGauge.tsx with d3-shape arc generator | Visual test: Verify arc renders 0-360° based on score, gradient colors applied, percentage centered |
| **AC-4.4** | Non-Functional → Performance, Detailed Design | All visualization components, responsive CSS | Responsive test: Load report on 320px, 768px, 1920px viewports; verify charts resize correctly |
| **AC-4.5** | Non-Functional → Security (Accessibility), Detailed Design | ARIA labels on all chart SVG elements | Accessibility test: Screen reader announces chart purpose and data, aria-label attributes present |
| **AC-4.6** | Dependencies → Data Visualization, Detailed Design | d3-scale (^4.0.2), d3-shape (^3.2.0) imports | Dependency test: Verify no Recharts/Chart.js imports, only d3 libraries used for chart rendering |
| **AC-5.1** | Architecture → UI/UX Consistency, Detailed Design | ReportLandingPage with Catppuccin classes | Visual test: Verify bg-mocha-base background, text-mocha-text foreground, consistent theme |
| **AC-5.2** | Architecture → UI/UX Consistency, Detailed Design | Button components with gradient classes | Visual test: Verify primary buttons use Orange→Teal gradient, hover states work |
| **AC-5.3** | Architecture → UI/UX Consistency, Detailed Design | ReportLandingPage layout structure | Visual test: Compare report layout to dashboard, verify card-based design pattern matches |
| **AC-5.4** | Dependencies → UI and Styling, Detailed Design | Typography CSS classes, font stack | Visual test: Verify heading sizes (h1-h6), body text readable, proper hierarchy |
| **AC-5.5** | Non-Functional → Security (Accessibility), Detailed Design | Color contrast ratios (Catppuccin theme) | Accessibility test: Run axe-core contrast checks, verify 4.5:1 ratio for text, 3:1 for large text |
| **AC-6.1** | Detailed Design → Services, Data Models | ReportGenerationPanel textarea input | UI test: Verify textarea renders in generation panel, character count optional, multi-line input |
| **AC-6.2** | Detailed Design → Data Models, Scope | Observations textarea markdown support | UI test: Enter markdown syntax (**, *, lists), verify saved and rendered correctly on report page |
| **AC-6.3** | Workflows → Report Access Sequence, APIs | ReportLandingPage observations display | Integration test: Generate report with observations, load public page, verify observations section visible |
| **AC-6.4** | APIs → PATCH endpoint, Data Models | PATCH /api/campaigns/[id]/report, consultant_observations column | Integration test: Update observations via PATCH, regenerate report, verify new observations display |
| **AC-6.5** | Detailed Design → Data Models, UI Logic | ReportLandingPage conditional rendering (null check) | UI test: Generate report without observations, verify no placeholder text or empty section |
| **AC-7.1** | Detailed Design → Services, APIs | File upload UI in ReportGenerationPanel, multiple file input | UI test: Select multiple files, verify all queued for upload, file list displays with sizes |
| **AC-7.2** | APIs → POST upload endpoint, Security | POST /api/campaigns/[id]/report/upload validation | Integration test: Upload .exe file, verify rejection; upload .pdf, verify acceptance |
| **AC-7.3** | APIs → POST upload endpoint, Security | File size validation in upload route | Integration test: Upload 11MB file, verify 400 error with "File too large" message |
| **AC-7.4** | Dependencies → Supabase Storage, APIs | Supabase Storage upload, bucket path structure | Integration test: Upload file, verify Storage path matches {campaign_id}/{timestamp}-{filename} pattern |
| **AC-7.5** | Data Models → supporting_documents JSONB, APIs | campaign_reports.supporting_documents array update | Database test: Upload 3 files, query campaign_reports, verify JSONB array contains 3 URLs with metadata |
| **AC-7.6** | Detailed Design → Services, Workflows | ReportLandingPage document links rendering | UI test: Load report with 2 documents, verify 2 download links displayed with file names |
| **AC-7.7** | Detailed Design → Services, UI/UX | Document link target="_blank" attributes | UI test: Click document link, verify opens in new tab, correct file downloads |
| **AC-8.1** | Detailed Design → Services, Scope | MarkdownDownloadButton.tsx on public report page | UI test: Load report, verify "Download Markdown" button visible at bottom |
| **AC-8.2** | Detailed Design → Services, Dependencies | MarkdownDownloadButton click handler, markdown-exporter.ts | Integration test: Click button, verify markdown file downloads, browser triggers download dialog |
| **AC-8.3** | Detailed Design → Services, Data Models | markdown-exporter.ts tier-aware content generation | Integration test: Download Premium markdown, verify contains all Premium content; Basic markdown has minimal content |
| **AC-8.4** | Detailed Design → Services, Dependencies | markdown-exporter.ts chart data formatting | Content test: Open downloaded markdown, verify tables with pillar names and scores formatted correctly |
| **AC-8.5** | Detailed Design → Services, Data Models | markdown-exporter.ts filename generation | Integration test: Download report for "Acme Manufacturing", verify filename: `acme-manufacturing-assessment-report.md` |
| **AC-8.6** | Detailed Design → Services, UI/UX | MarkdownDownloadButton download trigger | UI test: Click download, verify no page navigation, download starts in background |
| **AC-9.1** | Security → Access Control, APIs | POST /api/campaigns/[id]/report permission check | Security test: Attempt generation as unauthorized user, verify 403 error; authorized user succeeds |
| **AC-9.2** | Security → Access Control, Workflows | GET /api/reports/[token] no auth requirement | Security test: Request report in incognito browser (no cookies), verify 200 response |
| **AC-9.3** | Security → Access Control, APIs | GET /api/reports/[token] is_active check | Security test: Toggle report off, attempt access, verify 404; no data leakage in response |
| **AC-9.4** | Security → Access Control, RLS Policies | POST /api/campaigns/[id]/report organization check | Security test: User A attempts to generate report for User B's campaign (different org), verify 403 or data not found |
| **AC-9.5** | Security → Access Control, RLS Policies | Supabase RLS on campaign_reports table | Database test: Attempt SELECT campaign_reports with mismatched organization, verify 0 rows returned |
| **AC-9.6** | Security → Storage Security, Dependencies | Supabase Storage RLS on campaign-reports bucket | Security test: Attempt upload to other org's path, verify rejected; attempt download other org's file, verify denied |
| **AC-9.7** | Security → Data Protection, APIs | XSS sanitization in observations rendering | Security test: Enter `<script>alert('XSS')</script>` in observations, verify escaped/sanitized on report page |
| **AC-10.1** | Performance → Target Metrics | POST /api/campaigns/[id]/report endpoint | Performance test: Generate 20 reports, measure P95 latency, verify <5s |
| **AC-10.2** | Performance → Target Metrics, Architecture | app/report/[token]/page.tsx Server Component | Performance test: Cold start 10 report page loads, measure P95, verify <3s |
| **AC-10.3** | Performance → Target Metrics, Optimization | SpiderChart, PillarBarChart, ScoreGauge rendering | Performance test: Measure chart render time with performance.mark(), verify <1s per chart |
| **AC-10.4** | Performance → Target Metrics, Dependencies | POST /api/campaigns/[id]/report/upload | Performance test: Upload 5MB file, measure end-to-end time, verify <10s |
| **AC-10.5** | Performance → Target Metrics | MarkdownDownloadButton, markdown-exporter.ts | Performance test: Trigger download, measure generation time, verify <2s |
| **AC-10.6** | Reliability → Failure Modes, APIs | POST /api/campaigns/[id]/report transaction boundary | Error test: Force error mid-generation, verify no partial campaign_reports record exists |
| **AC-11.1** | Scope → Out of Scope, Integration | Campaign creation workflow | Regression test: Create new campaign with stakeholders, verify no errors, workflow unchanged |
| **AC-11.2** | Scope → Out of Scope, Integration | Stakeholder interview session flow | Regression test: Complete interview session, verify no impact from report feature |
| **AC-11.3** | Architecture → Database Strategy, Integration | campaign_synthesis read-only access | Integration test: Generate report, verify campaign_synthesis.synthesis_data unchanged (SELECT before/after) |
| **AC-11.4** | Architecture → TypeScript Standards, Dependencies | TypeScript compiler (tsc) with strict mode | Build test: Run `tsc --noEmit`, verify 0 errors, all types resolve correctly |
| **AC-11.5** | Dependencies → Internal Modules, Architecture | All new components using project conventions | Code review test: Verify @/* imports used, cn() utility for classes, follows existing patterns |
| **AC-11.6** | Dependencies → Migration Dependencies, Detailed Design | Supabase migration files | Migration test: Fresh Supabase instance, run migrations, verify no errors, schema correct |
| **AC-11.7** | Reliability → Availability, Scope | Cross-browser compatibility | Browser test: Load report in Chrome 120+, Firefox 121+, Safari 17+; verify rendering correct |

## Risks, Assumptions, Open Questions

### Risks and Mitigation Strategies

**RISK-1: Token Collision (Low Probability, High Impact)**
- **Description**: Two reports generate identical access tokens, causing data leakage
- **Probability**: Extremely low (1 in 10^77 with 256-bit tokens)
- **Impact**: Critical - client access to wrong organization's data
- **Mitigation**:
  - Use UNIQUE constraint on campaign_reports.access_token (database-level enforcement)
  - Token generation retries on collision (PostgreSQL error code 23505)
  - Monitor for collision errors in production logs
- **Acceptance**: Risk accepted given cryptographic token entropy

**RISK-2: Synthesis Data Structure Changes (Medium Probability, Medium Impact)**
- **Description**: synthesis_snapshot structure diverges from SynthesisData interface after synthesis agent updates
- **Probability**: Medium - synthesis agent may evolve over time
- **Impact**: Medium - report landing page rendering errors, missing data
- **Mitigation**:
  - Version synthesis_snapshot structure (add schema_version field)
  - Implement fallback rendering for missing fields
  - Add migration script to backfill old snapshots if structure changes
  - Document SynthesisData interface as stable contract between synthesis and reports
- **Ownership**: Monitor synthesis agent changes in code review

**RISK-3: Supabase Storage Quota Exhaustion (Medium Probability, Low Impact)**
- **Description**: Document uploads exceed 100GB storage quota on Pro plan
- **Probability**: Medium - 2000 campaigns with 50MB average
- **Impact**: Low - file uploads fail, reports still accessible
- **Mitigation**:
  - Implement storage quota monitoring (Supabase dashboard)
  - Add file cleanup workflow for old/unused campaigns (future enhancement)
  - Set up alerting at 80% quota utilization
  - Document upgrade path to Team plan (500GB storage)
- **Acceptance**: Monitor quota usage monthly

**RISK-4: d3 Library Breaking Changes (Low Probability, Medium Impact)**
- **Description**: d3-scale or d3-shape major version update breaks visualization rendering
- **Probability**: Low - stable APIs, infrequent major versions
- **Impact**: Medium - charts fail to render on report pages
- **Mitigation**:
  - Pin exact versions in package.json (d3-scale@4.0.2, d3-shape@3.2.0)
  - Test visualizations in CI pipeline before deploying updates
  - Document d3 upgrade process with visual regression testing
  - Fallback to table-based data display if charts fail
- **Ownership**: Review d3 changelog before any version bumps

**RISK-5: RLS Policy Misconfiguration (Low Probability, Critical Impact)**
- **Description**: Incorrect RLS policies allow cross-organization data access
- **Probability**: Low - policies tested in development
- **Impact**: Critical - data breach, GDPR violations
- **Mitigation**:
  - **Primary**: Write comprehensive RLS policy tests (see Test Strategy)
  - Peer review all RLS policy changes
  - Test with multiple user contexts (consultant A, consultant B, different orgs)
  - Run security audit before production deployment
  - Document RLS policy patterns for future features
- **Acceptance**: Zero tolerance - must pass all security tests

**RISK-6: Performance Degradation with Large Synthesis Data (Medium Probability, Low Impact)**
- **Description**: Report pages load slowly with large synthesis_snapshot (>1MB JSON)
- **Probability**: Medium - comprehensive assessments may have extensive data
- **Impact**: Low - page load exceeds 3s target but remains functional
- **Mitigation**:
  - Implement JSONB column compression in PostgreSQL
  - Use Next.js streaming for incremental page rendering
  - Lazy load visualizations below the fold
  - Monitor P95 latencies in production (see Observability)
- **Acceptance**: Optimization if P95 exceeds 5s in production

### Assumptions Requiring Validation

**ASSUMPTION-1: Consultant Role Identification**
- **Assumption**: User role can be reliably determined via `user_profiles.role` column or `permissions` JSONB
- **Validation Required**: Confirm schema includes role field and values ('consultant', 'company')
- **Impact if Invalid**: Cannot restrict report generation to consultants
- **Validation Method**: Query existing user_profiles schema, check RLS policies
- **Owner**: Dev team to verify with database administrator

**ASSUMPTION-2: Campaign Synthesis Always Exists for Completed Campaigns**
- **Assumption**: All campaigns with status='completed' have corresponding campaign_synthesis record
- **Validation Required**: Check if synthesis can fail or be skipped
- **Impact if Invalid**: Report generation fails with null synthesis_data
- **Validation Method**: Query campaigns JOIN campaign_synthesis, check for orphaned campaigns
- **Mitigation**: Add null check in report generation API, return clear error message
- **Owner**: Verify with stakeholder interview workflow implementation

**ASSUMPTION-3: Catppuccin Mocha Theme Classes Available**
- **Assumption**: Tailwind config includes all Catppuccin Mocha color classes (bg-mocha-base, text-mocha-text, etc.)
- **Validation Required**: Check tailwind.config.js for theme extension
- **Impact if Invalid**: Styling breaks, report pages unstyled
- **Validation Method**: Grep for 'mocha' in tailwind config, test build output
- **Mitigation**: Add theme classes if missing, update config documentation
- **Owner**: Frontend developer to validate during Story 1.3

**ASSUMPTION-4: No PDF Generation Required for MVP**
- **Assumption**: Markdown export satisfies client reporting needs (PDF generation deferred)
- **Validation Required**: User research with consultants on client preferences
- **Impact if Invalid**: Must re-prioritize PDF generation feature
- **Validation Method**: Workshop feedback, pilot user testing
- **Acceptance**: Validated by Product Owner decision to defer PDF
- **Owner**: Product Owner to gather feedback post-Epic 1 deployment

**ASSUMPTION-5: 10MB File Size Limit is Sufficient**
- **Assumption**: Supporting documents are typically <10MB (PDFs, images, small reports)
- **Validation Required**: Survey consultants on typical document sizes
- **Impact if Invalid**: Users frustrated by upload rejections
- **Validation Method**: Analyze existing document uploads in similar tools
- **Mitigation**: Increase limit to 20MB if needed (minimal cost impact)
- **Owner**: Product Owner to confirm with consultant users

**ASSUMPTION-6: Access Token Never Expires**
- **Assumption**: Clients need permanent access to reports (no expiration implemented)
- **Validation Required**: Confirm business requirement for indefinite access
- **Impact if Invalid**: Must add expiration logic and renewal workflow
- **Validation Method**: Product Owner confirmation, legal/compliance review
- **Acceptance**: Validated by business requirement (manual toggle sufficient)
- **Owner**: Product Owner to document policy decision

### Open Questions Requiring Resolution

**QUESTION-1: Report Generation Access Control** ✅ RESOLVED
- **Question**: How is consultant role stored and verified? Is it `user_profiles.role = 'consultant'` or `user_profiles.permissions JSONB`?
- **Context**: Report generation restricts to consultants only (AC-2.6, AC-9.1)
- **RESOLUTION**: Campaign-level permission check instead of user role. Each campaign has a permission flag (checkbox or field) like "Has report access" or "Can Access Reports". Users with admin-class profiles also have access.
- **Implementation**:
  - Add `can_generate_reports` boolean to campaigns table OR check user permissions JSONB
  - Report generation button visible based on campaign permission + user admin status
  - No consultant-specific role check required
- **Impact**: AC-2.6 and AC-9.1 updated to reflect campaign-level permissions
- **Date Resolved**: 2025-11-21

**QUESTION-2: Campaign Status Field Location** ✅ RESOLVED
- **Question**: Is campaign completion status stored as `campaigns.status = 'completed'` or derived from `stakeholder_sessions` completion?
- **Context**: Report generation button visibility depends on completion status (AC-2.1)
- **RESOLUTION**: Field exists in database as `campaigns.status` with values: 'draft', 'active', 'completed', 'archived'
- **Source**: Confirmed in supabase/migrations/20251115_initial_schema.sql:14
- **Implementation**: Report generation button checks `campaigns.status = 'completed'` AND campaign permissions
- **Date Resolved**: 2025-11-21

**QUESTION-3: Synthesis Data Schema Documentation** ✅ RESOLVED
- **Question**: Is there formal documentation of the `SynthesisData` interface structure? Do all fields exist consistently?
- **Context**: Report rendering depends on specific fields (pillars, dimensions, key_themes, etc.)
- **RESOLUTION**: TypeScript interface exists as `ReadinessAssessment` in lib/agents/synthesis-agent.ts
- **Actual Structure**:
  - `overallScore: number` (0-5 scale)
  - `pillars: PillarScore[]` (each with `pillar`, `score`, `dimensions[]`)
  - `executiveSummary: string`
  - `keyThemes: string[]`
  - `contradictions: string[]` (not `gap_analysis` as assumed)
  - `recommendations: string[]` (generic, not `architecture_recommendations`)
  - `stakeholderPerspectives: StakeholderPerspective[]`
- **Implementation**: Tech spec should reference existing `ReadinessAssessment` interface, not create new `SynthesisData`
- **Source**: lib/agents/synthesis-agent.ts:625-642
- **Date Resolved**: 2025-11-21

**QUESTION-4: Storage Bucket Permissions Model**
- **Question**: Should RLS policies allow consultant A to view consultant B's documents within same organization? Or strict isolation?
- **Context**: Supabase Storage RLS policy design for campaign-reports bucket
- **Blocking**: Story 1.4 file upload security
- **Urgency**: Before Story 1.4 start
- **Owner**: Product Owner + Dev team
- **Resolution Path**: Define access control policy, document in security requirements

**QUESTION-5: Markdown Export Format Preferences**
- **Question**: What markdown formatting do clients prefer? Tables vs lists for scores? Include raw JSON data?
- **Context**: Markdown exporter implementation details
- **Blocking**: Not blocking (can iterate)
- **Urgency**: Before Story 1.4 completion
- **Owner**: Product Owner
- **Resolution Path**: Review markdown templates from other tools, gather client feedback from workshop

**QUESTION-6: Report Regeneration Behavior** ✅ RESOLVED
- **Question**: When regenerating a report (same campaign), should we update existing record or create new one? How handle access tokens?
- **Context**: UNIQUE constraint on campaign_id suggests one report per campaign, but regeneration workflow unclear
- **RESOLUTION**: Option A selected - UPSERT with same access token
- **Implementation Strategy**:
  ```sql
  INSERT INTO campaign_reports (
    campaign_id, access_token, report_tier, synthesis_snapshot, ...
  ) VALUES (...)
  ON CONFLICT (campaign_id) DO UPDATE
    SET report_tier = EXCLUDED.report_tier,
        synthesis_snapshot = EXCLUDED.synthesis_snapshot,
        consultant_observations = EXCLUDED.consultant_observations,
        regenerated_at = NOW(),
        regeneration_count = campaign_reports.regeneration_count + 1,
        updated_at = NOW()
  ```
- **Benefits**:
  - Client bookmarked URLs remain valid (same access_token)
  - No orphaned report records
  - Simpler implementation
  - Tracks regeneration history with counter
- **Additional Fields**: Add `regenerated_at TIMESTAMPTZ` and `regeneration_count INTEGER DEFAULT 0`
- **Date Resolved**: 2025-11-21

**QUESTION-7: Multi-Language Support Roadmap**
- **Question**: Is multi-language support planned for Q1 2025? Should we design for internationalization now?
- **Context**: Out of scope for Epic 1 (deferred), but architectural decisions may affect future cost
- **Blocking**: Not blocking
- **Urgency**: Low (post-Epic 1)
- **Owner**: Product Owner
- **Resolution Path**: Product roadmap planning session, document i18n requirements if confirmed

## Test Strategy Summary

### Testing Philosophy

Epic 1 follows a **multi-layered testing approach** ensuring quality from unit tests through production monitoring:

1. **Unit Tests**: Isolated logic verification (utilities, data transformations)
2. **Integration Tests**: API contracts, database operations, cross-module interactions
3. **UI Component Tests**: React component rendering, user interactions
4. **End-to-End Tests**: Full user workflows from generation to access
5. **Security Tests**: Access control, RLS policies, XSS prevention
6. **Performance Tests**: Latency targets, load handling
7. **Accessibility Tests**: WCAG AA compliance, screen reader support

### Test Levels and Coverage

#### Level 1: Unit Tests (Target: 80% coverage of utilities)

**Scope**: Pure functions, utilities, data transformations

**Test Files**:
- `lib/utils/token-generator.test.ts`: Token generation, uniqueness, format validation
- `lib/utils/tier-content-generator.test.ts`: Tier filtering logic, content mapping
- `lib/utils/markdown-exporter.test.ts`: Markdown formatting, tier-aware content, filename generation

**Key Test Cases**:
- Token generator produces 43-character base64url strings
- Token uniqueness across 10,000 generations (collision detection)
- Tier content generator correctly maps tier to boolean flags
- Markdown exporter handles null/undefined fields gracefully
- Markdown table formatting for chart data

**Framework**: Jest + TypeScript
**Run Frequency**: Every commit (pre-commit hook)
**Success Criteria**: 100% pass, no console errors

#### Level 2: Database Tests (Target: 100% coverage of schema)

**Scope**: Migrations, RLS policies, constraints, triggers

**Test Scenarios**:
- Campaign_reports table creation with all columns and constraints
- UNIQUE constraint on access_token prevents duplicates
- UNIQUE constraint on campaign_id enforces one report per campaign
- Foreign key CASCADE deletes work (campaign deletion removes reports)
- RLS policies prevent cross-organization access
- Supabase Storage bucket creation with correct permissions

**Tools**: Supabase CLI, pg_prove (PostgreSQL testing), custom test scripts
**Environment**: Isolated test database (fresh migrations)
**Run Frequency**: Before merging Story 1.1
**Success Criteria**: All migrations apply cleanly, RLS tests pass

**Critical RLS Policy Tests**:
```sql
-- Test 1: Consultant A cannot access Consultant B's report (different orgs)
SELECT COUNT(*) FROM campaign_reports
WHERE created_by = 'consultant_b_user_id'
-- Should return 0 when authenticated as consultant A

-- Test 2: Public token access works without authentication
SELECT * FROM campaign_reports
WHERE access_token = 'valid_token_123' AND is_active = true
-- Should return 1 row even with no auth context

-- Test 3: Inactive reports are inaccessible
SELECT * FROM campaign_reports
WHERE access_token = 'valid_token_123' AND is_active = false
-- Should return 0 rows (filtered by API, not RLS)
```

#### Level 3: API Integration Tests (Target: 100% endpoint coverage)

**Scope**: All API routes, request/response contracts, error handling

**Test Files**:
- `app/api/campaigns/[id]/report/route.test.ts`: Report generation endpoint
- `app/api/reports/[token]/route.test.ts`: Public report access endpoint
- `app/api/campaigns/[id]/report/upload/route.test.ts`: File upload endpoint

**POST /api/campaigns/[id]/report Test Cases**:
- ✅ Valid request generates report with access_token
- ✅ Consultant-only access (403 for non-consultants)
- ✅ Requires completed campaign (400 if incomplete)
- ✅ Requires synthesis data (404 if missing)
- ✅ Tier validation (400 for invalid tier enum)
- ✅ Regeneration updates existing report (UPSERT behavior)
- ✅ Transaction rollback on error (no partial records)

**GET /api/reports/[token] Test Cases**:
- ✅ Valid token returns report data with 200
- ✅ Invalid token returns 404
- ✅ Inactive report returns 404
- ✅ Increments access_count on success
- ✅ Updates last_accessed_at timestamp
- ✅ Tier filtering applied to content
- ✅ No authentication required

**POST /api/campaigns/[id]/report/upload Test Cases**:
- ✅ Valid file upload returns Storage URL
- ✅ File type validation (whitelist enforcement)
- ✅ File size validation (10MB limit)
- ✅ Storage path structure correct: {campaign_id}/{timestamp}-{filename}
- ✅ JSONB array update in supporting_documents
- ✅ Consultant-only access

**Framework**: Jest + Supertest or Next.js test utilities
**Environment**: Test database with seed data
**Run Frequency**: Before merging each story
**Success Criteria**: 100% pass, all status codes correct

#### Level 4: UI Component Tests (Target: 90% component coverage)

**Scope**: React components, user interactions, state management

**Test Files**:
- `components/reports/ReportGenerationPanel.test.tsx`
- `components/reports/ReportLandingPage.test.tsx`
- `components/reports/SpiderChart.test.tsx`
- `components/reports/PillarBarChart.test.tsx`
- `components/reports/ScoreGauge.test.tsx`

**ReportGenerationPanel Test Cases**:
- ✅ Renders tier selection radio buttons (3 options)
- ✅ Generate button triggers API call with selected tier
- ✅ Loading state displays during API call
- ✅ Success displays access URL with copy button
- ✅ Copy button writes to clipboard
- ✅ Toggle switch controls is_active state
- ✅ Error message displays on API failure

**ReportLandingPage Test Cases**:
- ✅ Overall score displays prominently
- ✅ All three charts render with test data
- ✅ Basic tier hides recommendations
- ✅ Informative tier shows quotes and themes
- ✅ Premium tier shows architecture recommendations
- ✅ Consultant observations display when present
- ✅ Document links render with correct URLs
- ✅ Markdown download button triggers export

**Visualization Component Tests**:
- ✅ SpiderChart renders SVG with correct polygon points
- ✅ PillarBarChart renders bars proportional to scores
- ✅ ScoreGauge renders arc with correct angle (score/5 * 360°)
- ✅ Charts handle missing data gracefully (0 scores)
- ✅ ARIA labels present for accessibility

**Framework**: Jest + React Testing Library
**Approach**: Render components with mock data, assert DOM output
**Run Frequency**: Every commit
**Success Criteria**: 100% pass, no console warnings

#### Level 5: End-to-End Tests (Target: 100% user workflow coverage)

**Scope**: Complete user journeys from login to report access

**Test Scenarios**:

**E2E-1: Report Generation Happy Path**
1. Login as consultant
2. Navigate to completed campaign detail page
3. Click "Generate Client Report"
4. Select "Informative" tier
5. Add consultant observations
6. Click "Generate"
7. Verify success message with access URL
8. Copy URL to clipboard
9. Visit URL in incognito browser
10. Verify report renders with correct tier content

**E2E-2: Document Upload Workflow**
1. Generate report (as in E2E-1)
2. Click "Upload Documents"
3. Select 2 PDF files (<10MB)
4. Upload files
5. Verify upload success messages
6. Refresh report page
7. Verify 2 document links displayed
8. Click document link, verify download

**E2E-3: Access Control Enforcement**
1. Generate report as Consultant A
2. Logout
3. Login as Consultant B (different organization)
4. Attempt to access Consultant A's campaign
5. Verify 404 or access denied

**E2E-4: Report Access Toggle**
1. Generate report
2. Toggle access OFF
3. Verify public access returns 404
4. Toggle access ON
5. Verify public access restored

**Framework**: Playwright or Cypress
**Environment**: Staging environment with test data
**Run Frequency**: Before production deployment
**Success Criteria**: 100% pass, all workflows complete

#### Level 6: Security Tests (Target: 100% threat model coverage)

**Scope**: Authentication, authorization, data protection, input validation

**Security Test Cases**:

**SEC-1: Token Security**
- ✅ Token entropy sufficient (256-bit)
- ✅ Token uniqueness enforced by database
- ✅ Token not guessable (brute force infeasible)

**SEC-2: Access Control**
- ✅ Non-consultant cannot generate reports (403)
- ✅ Consultant cannot access other org's campaigns
- ✅ RLS policies enforce organization boundaries
- ✅ Public access requires valid token only

**SEC-3: Input Validation**
- ✅ XSS prevention in consultant observations (escape/sanitize)
- ✅ File upload type validation (whitelist enforcement)
- ✅ File size limit enforcement (10MB)
- ✅ Tier enum validation (reject invalid values)
- ✅ SQL injection prevention (parameterized queries)

**SEC-4: Storage Security**
- ✅ RLS policies on campaign-reports bucket
- ✅ Cross-org document access prevented
- ✅ File URLs not guessable

**Tools**: Manual testing, automated security scanner (OWASP ZAP), code review
**Run Frequency**: Before Story 1.4 completion, before production
**Success Criteria**: Zero critical vulnerabilities, all tests pass

#### Level 7: Performance Tests (Target: Meet all SLA targets)

**Scope**: API latency, page load times, visualization rendering

**Performance Benchmarks**:
- ✅ Report generation API: P95 < 5s
- ✅ Public report page load: P95 < 3s (cold start)
- ✅ Chart rendering: <1s per chart
- ✅ File upload: <10s for 5MB file
- ✅ Markdown export: <2s

**Test Approach**:
1. Use k6 or Artillery for API load testing
2. Lighthouse CI for page load performance
3. Chrome DevTools Performance tab for chart rendering
4. Test with realistic synthesis data sizes (100KB-1MB JSONB)

**Load Testing Scenarios**:
- 20 concurrent report generations
- 50 concurrent report page views
- 10 concurrent file uploads

**Framework**: k6 (API), Lighthouse CI (page load), performance.mark() (client)
**Run Frequency**: Before production deployment, quarterly
**Success Criteria**: All benchmarks met at 95th percentile

#### Level 8: Accessibility Tests (Target: WCAG AA compliance)

**Scope**: Screen reader support, keyboard navigation, color contrast

**Accessibility Checks**:
- ✅ All visualizations have ARIA labels
- ✅ Color contrast ratios meet 4.5:1 (body text)
- ✅ Keyboard navigation works for all controls
- ✅ Screen reader announces report structure
- ✅ Focus indicators visible
- ✅ No ARIA violations

**Tools**: axe-core, Lighthouse accessibility audit, manual screen reader testing (NVDA, VoiceOver)
**Run Frequency**: Before Story 1.3 completion
**Success Criteria**: 100% axe-core pass, zero critical violations

### Test Data Strategy

**Mock Data Requirements**:
- 3 test campaigns (Basic, Informative, Premium tiers)
- 2 test organizations (for cross-org access testing)
- 4 test users (2 consultants, 2 company users)
- Sample synthesis data with all fields populated
- Test documents (PDFs, images) for upload testing

**Seed Script**: `supabase/seed-test-data.sql`
**Reset Strategy**: Drop and recreate test database before each test run

### Test Execution Plan

**Pre-Commit**:
- Unit tests (automated via Husky hook)
- TypeScript compilation check

**Story Completion**:
- Story 1.1: Unit tests, database tests, API integration tests
- Story 1.2: UI component tests, E2E test (report generation)
- Story 1.3: UI component tests (charts), E2E test (report viewing), accessibility tests
- Story 1.4: UI component tests, E2E tests (upload, markdown), security tests

**Epic Completion**:
- Full regression test suite
- Performance tests
- Security audit
- Cross-browser testing (Chrome, Firefox, Safari)

**Production Deployment**:
- Smoke tests (critical paths)
- Monitor error rates and performance metrics
- Gradual rollout with feature flag (optional)

### Continuous Monitoring (Post-Deployment)

**Metrics to Track**:
- Report generation success rate (target: >99%)
- Report access 404 rate (target: <5%)
- API error rate (target: <1%)
- P95 latencies for all endpoints
- Storage quota utilization

**Alerting Thresholds**:
- Error rate >1% for 5 minutes
- P95 latency >10s for report generation
- Storage quota >80%
- RLS policy violations detected

**Tools**: Vercel Analytics, Supabase Dashboard, custom logging
