# Story 1.1: Database & API Foundation

**Status:** drafted

## Story

As a **system developer**,
I want to **establish the database schema and core API endpoints for report generation**,
So that **consultants can generate and access secure, tier-based reports from completed campaigns**.

## Context

This is the foundational story for Epic 1: Client Assessment Report Generation System. It establishes the database infrastructure, secure token generation, and core API endpoints that all subsequent stories will build upon.

**Key Implementation Points:**
- Database schema with campaign_reports table and RLS policies for organization isolation
- Cryptographic token generation (256-bit security) for public report access
- Report generation API with UPSERT strategy for regeneration support
- Public token-based access API without authentication requirements
- Supabase Storage bucket for future document uploads (Story 1.4)

**Critical Decisions from Tech Spec:**
- ✅ **Report Regeneration**: UPSERT strategy using `ON CONFLICT (campaign_id) DO UPDATE` to maintain same access token
- ✅ **Access Control**: Campaign-level permissions (can_generate_reports flag OR admin-class profile), not role-based
- ✅ **Data Source**: Uses existing `ReadinessAssessment` interface from [lib/agents/synthesis-agent.ts](lib/agents/synthesis-agent.ts:625-642)
- ✅ **Campaign Status**: Checks `campaigns.status = 'completed'` before allowing report generation

## Acceptance Criteria

### AC-1: Report Generation Core Functionality

**AC-1.1** System creates campaign_reports record with unique access token when authorized user requests report generation for completed campaign

**AC-1.2** Access token is cryptographically secure (256-bit, base64url encoded) with entropy sufficient to prevent brute force attacks

**AC-1.3** Report data is accessible via public token endpoint (`GET /api/reports/[token]`) without authentication requirements

**AC-1.4** RLS policies enforce organization isolation preventing cross-company data access

**AC-1.5** Invalid or inactive tokens return 404 response with appropriate error message

### AC-9: Security and Access Control (Story 1.1 Scope)

**AC-9.1** Report generation restricted to authenticated users with campaign report permissions (campaign-level flag OR admin-class profile)

**AC-9.2** Public report access requires only valid access token (no authentication)

**AC-9.3** Inactive reports (is_active = false) return 404 even with valid token

**AC-9.4** Users can only generate reports for campaigns they have permission to access (organization-scoped RLS policies)

**AC-9.5** RLS policies prevent direct database queries across organization boundaries

### AC-10: Performance and Reliability (Story 1.1 Scope)

**AC-10.1** Report generation API responds within 5 seconds (95th percentile)

**AC-10.6** Failed report generation does not create partial database records (transaction boundary)

### AC-11: Integration and Compatibility

**AC-11.1** Report system does not disrupt existing campaign creation workflow

**AC-11.2** Report system does not interfere with stakeholder interview sessions

**AC-11.3** Report system does not modify campaign_synthesis data (read-only access)

**AC-11.4** TypeScript compilation succeeds with strict mode enabled (no type errors)

**AC-11.6** Database migrations run successfully on clean Supabase instance

## Tasks / Subtasks

- [ ] **Task 1: Create Database Migration** (AC: 1.1, 1.4, 1.5, 9.5, 11.6)
  - [ ] 1.1: Create migration file `supabase/migrations/[timestamp]_create_campaign_reports.sql`
  - [ ] 1.2: Define campaign_reports table schema with all columns (see schema below)
  - [ ] 1.3: Add UNIQUE constraints on `access_token` and `campaign_id`
  - [ ] 1.4: Add foreign key `campaign_id` references campaigns(id) ON DELETE CASCADE
  - [ ] 1.5: Create indexes on `access_token`, `campaign_id`, `created_by`
  - [ ] 1.6: Define RLS policies for organization-scoped access (see policies below)
  - [ ] 1.7: Create Supabase Storage bucket `campaign-reports` (private, non-public)
  - [ ] 1.8: Define Storage RLS policies for organization members
  - [ ] 1.9: Test migration on local Supabase instance
  - [ ] 1.10: Verify RLS policies with test queries (cross-org access blocked)

- [ ] **Task 2: Implement Token Generation Utility** (AC: 1.2)
  - [ ] 2.1: Create `lib/utils/token-generator.ts`
  - [ ] 2.2: Implement `generateAccessToken()` using `crypto.randomBytes(32)`
  - [ ] 2.3: Convert to base64url encoding (43 characters)
  - [ ] 2.4: Write unit tests for token format and uniqueness
  - [ ] 2.5: Test collision handling (generate 10k tokens, verify uniqueness)

- [ ] **Task 3: Build Report Generation API Endpoint** (AC: 1.1, 9.1, 9.4, 10.1, 10.6, 11.3, 11.4)
  - [ ] 3.1: Create `app/api/campaigns/[id]/report/route.ts` with POST handler
  - [ ] 3.2: Validate user authentication and campaign permissions
  - [ ] 3.3: Verify campaign status = 'completed' before generation
  - [ ] 3.4: Load campaign_synthesis data (READ ONLY - verify no modifications)
  - [ ] 3.5: Generate access token using token-generator utility
  - [ ] 3.6: Snapshot synthesis_snapshot JSONB from campaign_synthesis.synthesis_data
  - [ ] 3.7: Implement UPSERT logic using ON CONFLICT (campaign_id) DO UPDATE
  - [ ] 3.8: Handle regeneration with same token, increment regeneration_count
  - [ ] 3.9: Wrap database operations in transaction boundary
  - [ ] 3.10: Return report_id and access_token on success
  - [ ] 3.11: Handle errors with appropriate HTTP status codes
  - [ ] 3.12: Write API integration tests (valid request, permission denied, missing synthesis)

- [ ] **Task 4: Build Report Access API Endpoint** (AC: 1.3, 1.5, 9.2, 9.3)
  - [ ] 4.1: Create `app/api/reports/[token]/route.ts` with GET handler
  - [ ] 4.2: Query campaign_reports by access_token (no auth required)
  - [ ] 4.3: Check is_active flag, return 404 if false
  - [ ] 4.4: Return 404 for invalid/missing tokens (no data leakage)
  - [ ] 4.5: Increment access_count and update last_accessed_at on success
  - [ ] 4.6: Return report data with 200 status
  - [ ] 4.7: Write API integration tests (valid token, invalid token, inactive report)

- [ ] **Task 5: Add TypeScript Type Definitions** (AC: 11.4, 11.5)
  - [ ] 5.1: Extend `lib/types/database.types.ts` with CampaignReport interface
  - [ ] 5.2: Import ReadinessAssessment type from synthesis-agent.ts
  - [ ] 5.3: Define API request/response types
  - [ ] 5.4: Verify TypeScript compilation with `tsc --noEmit`

- [ ] **Task 6: Integration Testing and Validation** (AC: 10.1, 11.1, 11.2)
  - [ ] 6.1: Test report generation API with curl/Postman
  - [ ] 6.2: Verify token access API with multiple users
  - [ ] 6.3: Test permission checks (unauthorized user blocked)
  - [ ] 6.4: Test RLS policies with different organization contexts
  - [ ] 6.5: Verify regeneration maintains same token
  - [ ] 6.6: Test campaign workflows unchanged (create, add stakeholders)
  - [ ] 6.7: Verify interview sessions unaffected
  - [ ] 6.8: Measure P95 latency (target < 5s)

## Dev Notes

### Database Schema

**campaign_reports Table:**
```sql
CREATE TABLE campaign_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign Reference
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Access Control
  access_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Report Configuration
  report_tier TEXT NOT NULL CHECK (report_tier IN ('basic', 'informative', 'premium')),

  -- Report Data
  synthesis_snapshot JSONB NOT NULL, -- ReadinessAssessment interface
  consultant_observations TEXT,
  supporting_documents JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Regeneration Tracking
  regenerated_at TIMESTAMPTZ,
  regeneration_count INTEGER NOT NULL DEFAULT 0,

  -- Access Tracking
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(campaign_id) -- One report per campaign
);

CREATE INDEX idx_campaign_reports_access_token ON campaign_reports(access_token);
CREATE INDEX idx_campaign_reports_campaign_id ON campaign_reports(campaign_id);
CREATE INDEX idx_campaign_reports_created_by ON campaign_reports(created_by);
```

**RLS Policies:**
```sql
-- Allow facilitators to manage reports for their campaigns
CREATE POLICY "Users can manage reports for their campaigns" ON campaign_reports
  FOR ALL USING (
    created_by = auth.uid()
    OR
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE created_by = auth.uid()
      OR company_profile_id IN (
        SELECT company_profile_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Allow public access via valid token (read-only)
CREATE POLICY "Public token access for reports" ON campaign_reports
  FOR SELECT USING (
    access_token IS NOT NULL
    AND is_active = true
  );
```

### Architecture Patterns

**Token Security:**
- Use Node.js crypto module (server-side only, not browser)
- 256-bit entropy: `crypto.randomBytes(32)` → base64url → 43 characters
- UNIQUE constraint provides database-level collision protection
- Retry on PostgreSQL error 23505 (unique violation)

**UPSERT Strategy (Regeneration):**
```typescript
const { data, error } = await supabase
  .from('campaign_reports')
  .insert({
    campaign_id,
    access_token: existingToken || generateAccessToken(),
    report_tier,
    synthesis_snapshot,
    created_by: userId,
    regeneration_count: 0
  })
  .onConflict('campaign_id')
  .merge({
    report_tier,
    synthesis_snapshot,
    regenerated_at: new Date().toISOString(),
    regeneration_count: sql`regeneration_count + 1`,
    updated_at: new Date().toISOString()
  })
  .select()
  .single();
```

**Data Source:**
- Read synthesis data from `campaign_synthesis.synthesis_data` column
- Data structure: `ReadinessAssessment` interface ([lib/agents/synthesis-agent.ts](lib/agents/synthesis-agent.ts:625-642))
- Fields: overallScore, pillars, executiveSummary, keyThemes, contradictions, recommendations, stakeholderPerspectives
- Snapshot to campaign_reports.synthesis_snapshot (READ ONLY - do not modify source)

### MCP Server Integration

**IMPORTANT: Use MCP Servers for Infrastructure Operations**

This project has access to Supabase and Vercel MCP servers. Use these tools instead of manual scripts or CLI commands:

**Supabase MCP Tools:**
- `mcp__supabase__apply_migration` - Apply migration files directly to database
- `mcp__supabase__execute_sql` - Run SQL queries for testing and verification
- `mcp__supabase__list_tables` - Verify schema and table structure
- `mcp__supabase__list_migrations` - Check migration history
- `mcp__supabase__get_advisors` - Security and performance recommendations
- `mcp__supabase__generate_typescript_types` - Generate types from database schema

**Vercel MCP Tools:**
- `mcp__vercel-awesome-ai__list_projects` - List all Vercel projects
- `mcp__vercel-awesome-ai__list_deployments` - Check deployment status
- `mcp__vercel-awesome-ai__get_deployment_build_logs` - Debug build issues
- `mcp__vercel-awesome-ai__search_vercel_documentation` - Search Vercel docs

**Migration Workflow:**
1. Create migration SQL file in `supabase/migrations/`
2. Use `mcp__supabase__apply_migration` with migration name and SQL content
3. Verify with `mcp__supabase__list_tables` and `mcp__supabase__execute_sql`
4. Run `mcp__supabase__get_advisors` to check for security/performance issues
5. Generate TypeScript types with `mcp__supabase__generate_typescript_types`

**Testing with MCP:**
- Use `mcp__supabase__execute_sql` to run test queries and verify RLS policies
- Check table structure with `mcp__supabase__list_tables`
- Validate migrations applied correctly with `mcp__supabase__list_migrations`

### Testing Standards

**Unit Tests** (`lib/utils/token-generator.test.ts`):
- Verify 43-character base64url format
- Test uniqueness across 10,000 generations
- Validate no collisions

**API Integration Tests**:
- POST /api/campaigns/[id]/report:
  - ✅ Valid request returns access_token
  - ✅ Permission check blocks unauthorized users
  - ✅ Campaign status validation
  - ✅ Synthesis data requirement
  - ✅ Regeneration updates existing record
  - ✅ Transaction rollback on error
- GET /api/reports/[token]:
  - ✅ Valid token returns report data
  - ✅ Invalid token returns 404
  - ✅ Inactive report returns 404
  - ✅ Access tracking updates

**Database Tests**:
- RLS Policy: Org A user blocked from Org B reports
- RLS Policy: Public token access works without auth
- Foreign key cascade: Campaign deletion removes reports
- UNIQUE constraints enforced

### References

**Technical Specifications:**
- [Epic 1 Tech Spec](docs/sprint-artifacts/tech-spec-epic-1.md) - Complete acceptance criteria and traceability
- [Architecture: Multi-Tenancy Redesign](docs/ARCHITECTURE-multi-tenancy-redesign.md) - RLS policy patterns
- [Synthesis Agent Interface](lib/agents/synthesis-agent.ts:625-642) - ReadinessAssessment data structure

**Acceptance Criteria Traceability:**
- AC-1.1 → Task 1 (migration), Task 3 (API endpoint)
- AC-1.2 → Task 2 (token generator)
- AC-1.3 → Task 4 (public access endpoint)
- AC-1.4, AC-9.5 → Task 1.6 (RLS policies)
- AC-1.5 → Task 4.3-4.4 (404 handling)
- AC-9.1, AC-9.4 → Task 3.2 (permission checks)
- AC-10.1, AC-10.6 → Task 3.9 (transactions), Task 6.8 (performance)

**Design Decisions:**
- [QUESTION-1 RESOLVED](docs/sprint-artifacts/tech-spec-epic-1.md:1025-1034): Campaign-level permissions, not role-based
- [QUESTION-2 RESOLVED](docs/sprint-artifacts/tech-spec-epic-1.md:1036-1042): campaigns.status field confirmed
- [QUESTION-3 RESOLVED](docs/sprint-artifacts/tech-spec-epic-1.md:1044-1058): ReadinessAssessment interface documented
- [QUESTION-6 RESOLVED](docs/sprint-artifacts/tech-spec-epic-1.md:1076-1099): UPSERT strategy with same token

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by story-context workflow -->

### Agent Model Used

<!-- Will be filled when dev agent starts implementation -->

### Debug Log References

<!-- Will be added during implementation -->

### Completion Notes List

<!-- Will be added after story completion -->

### File List

<!-- Will be added after story completion -->
