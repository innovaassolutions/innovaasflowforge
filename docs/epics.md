# innovaasflowforge - Epic Breakdown

**Date:** 2025-11-18
**Project Level:** Quick Flow (Brownfield)

---

## Epic 1: Client Assessment Report Generation System

**Slug:** client-report-system

### Goal

Enable consultants to generate tiered, interactive web-based reports for clients with controlled access, professional visualizations, and downloadable markdown exports. Replace non-functional PDF generation with a modern, engaging report presentation system.

### Scope

Build a complete end-to-end system that allows consultants to:
1. Generate reports from campaign dashboard after all assessments are complete
2. Select report tier (Basic, Informative, Premium) determining content depth
3. Create secure access tokens for client viewing
4. Control report visibility (toggle on/off)
5. Add consultant observations and upload supporting documents
6. Enable clients to view interactive reports with multiple visualizations
7. Provide markdown download capability

**Database:** New `campaign_reports` table with Supabase PostgreSQL, Supabase Storage bucket for documents

**API Endpoints:** POST `/api/campaigns/[id]/report`, GET `/api/reports/[token]`, POST `/api/campaigns/[id]/report/upload`

**UI Components:** Report generation panel (dashboard), public report landing page, data visualizations (spider chart, bar chart, gauge)

### Success Criteria

1. ✅ Consultant can generate report from campaign detail page (all tiers)
2. ✅ System creates unique, secure access token URLs
3. ✅ Three tiers display appropriate content levels
4. ✅ Report visualizations render correctly and responsively
5. ✅ Consultant can add observations and upload documents
6. ✅ Clients can access reports via token without authentication
7. ✅ Markdown download functions correctly
8. ✅ Access control prevents unauthorized viewing
9. ✅ No disruption to existing campaign functionality
10. ✅ All TypeScript compiles without errors

### Dependencies

**External:**
- Existing campaign synthesis data (campaign_synthesis table)
- User profile system with role-based permissions
- Supabase Storage for document uploads

**Internal:**
- None - can be developed as standalone feature

**Prerequisite Work:**
- Database migrations must be run first
- Test user needs consultant role assignment

---

## Story Map - Epic 1

```
Epic: Client Assessment Report Generation System
│
├── Story 1.1: Database & API Foundation ⭐ (Start here)
│   ├── Subtask: Create database migration
│   ├── Subtask: Implement token generation utility
│   ├── Subtask: Build report generation API endpoint
│   ├── Subtask: Build report access API endpoint
│   └── Subtask: Test API with curl/Postman
│
├── Story 1.2: Report Generation UI (Dashboard)
│   ├── Subtask: Create ReportGenerationPanel component
│   ├── Subtask: Build tier selection interface
│   ├── Subtask: Implement generate button with loading state
│   ├── Subtask: Display access URL with copy function
│   ├── Subtask: Add access toggle control
│   ├── Subtask: Integrate into campaign detail page
│   └── Subtask: Test generation flow end-to-end
│
├── Story 1.3: Report Landing Page & Visualizations
│   ├── Subtask: Create public report page (Server Component)
│   ├── Subtask: Build ReportLandingPage client component
│   ├── Subtask: Implement SpiderChart visualization
│   ├── Subtask: Implement PillarBarChart visualization
│   ├── Subtask: Implement ScoreGauge component
│   ├── Subtask: Build TierContent conditional rendering
│   ├── Subtask: Create StakeholderQuotes display
│   ├── Subtask: Apply Catppuccin theme styling
│   └── Subtask: Test all tiers render correctly
│
└── Story 1.4: Document Upload & Enhancements
    ├── Subtask: Create file upload UI
    ├── Subtask: Build document upload API endpoint
    ├── Subtask: Integrate Supabase Storage
    ├── Subtask: Add consultant observations input
    ├── Subtask: Display observations on report page
    ├── Subtask: Implement markdown download button
    └── Subtask: Test document upload flow
```

---

## Stories - Epic 1

### Story 1.1: Database & API Foundation

As a **system developer**,
I want to **establish the database schema and core API endpoints for report generation**,
So that **consultants can generate and access secure report data**.

**Acceptance Criteria:**

**Given** all campaign assessments are complete
**When** a consultant requests report generation via API
**Then** the system creates a campaign_reports record with unique access token

**And** the token is cryptographically secure (256-bit, base64url)
**And** report data is accessible via public token endpoint
**And** RLS policies enforce organization isolation
**And** invalid/inactive tokens return 404

**Prerequisites:** None - first story in epic

**Technical Notes:**
- Create migration: `[timestamp]_create_campaign_reports.sql`
- Implement `lib/report/token-generator.ts` using crypto.randomBytes
- Build `app/api/campaigns/[id]/report/route.ts` (POST for generation)
- Build `app/api/reports/[token]/route.ts` (GET for access)
- Add Supabase Storage bucket creation to migration
- Use getSupabaseAdmin() for privileged operations

**Estimated Effort:** 5 points (1-2 days)

---

### Story 1.2: Report Generation UI (Dashboard)

As a **consultant**,
I want to **generate client reports from the campaign dashboard with tier selection**,
So that **I can create appropriate-level reports and share access URLs with clients**.

**Acceptance Criteria:**

**Given** I am logged in as a consultant with completed campaign
**When** I click "Generate Client Report" and select a tier
**Then** the system generates a report and displays the access URL

**And** the generation button shows loading state during processing
**And** the access URL has a copy-to-clipboard button
**And** I can toggle report access on/off after generation
**And** the panel is only visible to users with consultant role
**And** existing download buttons remain functional

**Prerequisites:** Story 1.1 (Database & API Foundation) complete

**Technical Notes:**
- Create `components/report/ReportGenerationPanel.tsx`
- Add radio buttons for tier selection (Basic/Informative/Premium)
- Implement loading spinner during API call
- Use navigator.clipboard.writeText() for copy function
- Integrate into `app/dashboard/campaigns/[id]/page.tsx` after line 381
- Check user role via user_profiles.role or permissions JSONB

**Estimated Effort:** 5 points (1-2 days)

---

### Story 1.3: Report Landing Page & Visualizations

As a **client**,
I want to **view an interactive, professional assessment report via access URL**,
So that **I can understand our Industry 4.0 readiness with compelling visualizations**.

**Acceptance Criteria:**

**Given** I have a valid report access token URL
**When** I visit the URL in my browser
**Then** I see an interactive report with my company's assessment results

**And** the overall readiness score displays prominently
**And** pillar scores show in spider chart and bar chart
**And** tier-appropriate content is displayed (Basic/Informative/Premium)
**And** visualizations are responsive and accessible
**And** the Catppuccin Mocha theme is applied consistently
**And** anonymous stakeholder quotes display (Informative+)
**And** architecture recommendations show (Premium only)

**Prerequisites:** Story 1.1 (Database & API Foundation) complete

**Technical Notes:**
- Create `app/report/[token]/page.tsx` as Server Component
- Build `components/report/ReportLandingPage.tsx` (client component)
- Implement `components/report/visualizations/SpiderChart.tsx` using d3-scale
- Implement `components/report/visualizations/PillarBarChart.tsx`
- Implement `components/report/visualizations/ScoreGauge.tsx`
- Create `components/report/TierContent.tsx` for conditional rendering
- Build `components/report/StakeholderQuotes.tsx` for quote display
- Use `lib/report/tier-content-generator.ts` for content filtering
- Apply Catppuccin classes: bg-mocha-base, text-mocha-text, etc.
- Add ARIA labels to all visualizations for accessibility

**Estimated Effort:** 8 points (2-3 days)

---

### Story 1.4: Document Upload & Enhancements

As a **consultant**,
I want to **add observations and upload supporting documents to reports**,
So that **I can provide additional context and value to clients beyond automated analysis**.

**Acceptance Criteria:**

**Given** I have generated a report for a campaign
**When** I add consultant observations and upload a document
**Then** the observations and documents appear on the client report page

**And** file uploads are validated (type whitelist, 10MB limit)
**And** documents store in Supabase Storage with proper organization
**And** uploaded files display as downloadable links on report page
**And** observations textarea supports markdown formatting
**And** markdown download button generates complete report file
**And** all functionality works on mobile and desktop

**Prerequisites:** Story 1.2 (Report Generation UI) and Story 1.3 (Report Landing Page) complete

**Technical Notes:**
- Add file upload UI to ReportGenerationPanel component
- Create `app/api/campaigns/[id]/report/upload/route.ts`
- Upload to Supabase Storage bucket: `campaign-reports`
- File path structure: `{campaign_id}/{timestamp}-{filename}`
- Validate file types: PDF, PNG, JPG, DOCX, XLSX
- Store URLs in campaign_reports.supporting_documents JSONB array
- Create observations textarea in generation panel
- Build `components/report/MarkdownDownloadButton.tsx`
- Implement `lib/report/markdown-exporter.ts` for full report export
- Display observations and documents on public report page

**Estimated Effort:** 5 points (1-2 days)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 23 points

**Estimated Timeline:** 5-8 business days (1-2 weeks)

**Development Sequence:**
1. Story 1.1 (Days 1-2): Database & API Foundation
2. Story 1.2 (Days 2-3): Report Generation UI
3. Story 1.3 (Days 4-6): Report Landing Page & Visualizations (largest story)
4. Story 1.4 (Days 7-8): Document Upload & Enhancements

**Recommended Approach:**
- Complete stories sequentially to build upon working foundation
- Test each story thoroughly before proceeding
- Story 1.3 can be worked on concurrently with 1.2 if team size allows
- Story 1.4 enhances existing functionality, can be treated as optional for MVP

**Testing Strategy:**
- Manual testing after each story
- Full integration test after Story 1.3
- Security and access control testing after all stories complete
- Performance testing on report page load

---
