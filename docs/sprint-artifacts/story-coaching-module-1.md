# Story 1.1: Database Foundation

**Status:** review

---

## User Story

As a **developer**,
I want **database tables for multi-tenant coaching with brand configuration**,
So that **coaches can be onboarded with their own branded settings and participants can be tracked through the pipeline**.

---

## Acceptance Criteria

**AC #1:** Given the migrations are applied, when I query `tenant_profiles` table, then it exists with columns: id, user_id, slug (unique), display_name, tenant_type, brand_config (JSONB), email_config (JSONB), enabled_assessments (TEXT[]), subscription_tier, is_active, custom_domain, created_at, updated_at

**AC #2:** Given the migrations are applied, when I query `participant_sessions` (renamed from stakeholder_sessions), then the table includes new columns: client_status (TEXT), tenant_id (UUID FK to tenant_profiles)

**AC #3:** Given the migrations are applied, when I query `usage_events` table, then it exists with columns: id, tenant_id, user_id, event_type, event_data (JSONB), tokens_used, model_used, created_at

**AC #4:** Given the migrations are applied, when I query `campaigns` table, then it includes new columns: tenant_id (UUID FK), assessment_type (TEXT), results_disclosure (TEXT default 'full')

**AC #5:** Given Mark's profile is seeded, when I query tenant_profiles by slug 'leadingwithmeaning', then his full profile returns with brand_config containing logo, colors, fonts

**AC #6:** Given RLS is configured, when unauthorized user queries tenant_profiles, then access is denied

---

## Implementation Details

### Tasks / Subtasks

- [x] **Create tenant_profiles migration** (AC: #1)
  - [x] Create `tenant_profiles` table with all columns
  - [x] Add unique constraint on slug
  - [x] Add index on user_id
  - [x] Add index on custom_domain
  - [x] Create updated_at trigger

- [x] **Create participant_sessions migration** (AC: #2)
  - [x] Add `client_status` column with check constraint for valid statuses
  - [x] Add `tenant_id` foreign key column
  - [x] Create index on tenant_id
  - [x] Create index on client_status
  - [x] Update existing views/queries if any

- [x] **Create usage_events migration** (AC: #3)
  - [x] Create `usage_events` table with all columns
  - [x] Add indexes on tenant_id, event_type, created_at
  - [x] Foreign key to tenant_profiles

- [x] **Create campaigns update migration** (AC: #4)
  - [x] Add `tenant_id` column with foreign key
  - [x] Add `assessment_type` column (default 'industry4')
  - [x] Add `results_disclosure` column (default 'full')
  - [x] Create index on tenant_id

- [x] **Configure RLS policies** (AC: #6)
  - [x] Enable RLS on tenant_profiles
  - [x] User can read own tenant profile
  - [x] Service role bypass
  - [x] Public access via slug lookup (for branding)

- [x] **Seed Mark's tenant profile** (AC: #5)
  - [x] Create seed script or migration data
  - [x] Include full brand_config JSON for Leading with Meaning
  - [x] Include email_config with reply-to settings

- [x] **Add tenant queries to lib/supabase/server.ts**
  - [x] `getTenantBySlug(slug: string)`
  - [x] `getTenantByDomain(domain: string)`
  - [x] `getTenantById(id: string)`
  - [x] `getTenantForUser(userId: string)` (bonus - added for dashboard use)

### Technical Summary

This story establishes the multi-tenant data foundation for the coaching module. It creates the `tenant_profiles` table with flexible JSONB configuration for branding, extends `campaigns` and `participant_sessions` for coaching workflows, and creates the `usage_events` table structure for future billing (though billing UI is out of scope).

### Project Structure Notes

- **Files to create:**
  - `supabase/migrations/20260106_001_create_tenant_profiles.sql`
  - `supabase/migrations/20260106_002_update_participant_sessions.sql`
  - `supabase/migrations/20260106_003_create_usage_events.sql`
  - `supabase/migrations/20260106_004_update_campaigns_for_coaching.sql`
  - `supabase/migrations/20260106_005_seed_mark_tenant.sql`

- **Files to modify:**
  - `lib/supabase/server.ts` - Add tenant query functions

- **Expected test locations:** Manual SQL testing via Supabase Dashboard

- **Estimated effort:** 3 story points (~2 days)

- **Prerequisites:** None

### Key Code References

**Existing Migration Patterns:**
- File: `supabase/migrations/20251115_initial_schema.sql`
- Pattern: UUID primary keys, TIMESTAMPTZ, JSONB columns

**Company Profiles Pattern (for JSONB config):**
- File: `supabase/migrations/20251118001_create_company_profiles.sql`
- Pattern: JSONB configuration columns

**Supabase Admin:**
- File: `lib/supabase/server.ts`
- Function: `getSupabaseAdmin()` - add tenant queries here

### Brand Config Schema Reference

```typescript
interface BrandConfig {
  logo: { url: string; alt: string; width?: number };
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
    backgroundSubtle: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  tagline?: string;
  welcomeMessage?: string;
  completionMessage?: string;
  showPoweredBy: boolean;
}
```

### Client Status Values

```sql
CHECK (client_status IN (
  'registered',   -- Signed up, not started
  'started',      -- Began assessment
  'completed',    -- Finished assessment
  'contacted',    -- Coach reached out
  'converted',    -- Became paying client
  'archived'      -- Not a fit
))
```

---

## Context References

**Tech-Spec:** [tech-spec-coaching-module.md](../tech-spec-coaching-module.md) - Primary context document containing:

- Full tenant_profiles schema design
- Brand config TypeScript interface
- Campaign extension columns
- RLS policy patterns

**White-Label Architecture:** [WHITE_LABEL_ARCHITECTURE.md](../leadingwithmeaning/WHITE_LABEL_ARCHITECTURE.md) - Multi-tenant branding design

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Reviewed existing migration patterns in `supabase/migrations/`
- Discovered table was already renamed: stakeholder_sessions → campaign_assignments (migration 20251118005)
- Used JSONB pattern from company_profiles migration for brand_config
- Added composite index on participant_sessions for tenant + status queries
- Included helper function `log_usage_event()` for future billing integration
- Created backward-compatibility views for campaign_assignments and stakeholder_sessions

### Completion Notes

All database foundation tasks completed successfully:

1. **tenant_profiles table** - Full multi-tenant support with JSONB brand_config and email_config, subscription tiers, custom domain support
2. **participant_sessions (renamed)** - Renamed from campaign_assignments to participant_sessions per tech spec. Added client_status (lead pipeline) and tenant_id for multi-tenant isolation. Backward-compat views created.
3. **usage_events table** - Future billing infrastructure with token tracking, cost_cents, and log_usage_event() helper
4. **campaigns extended** - Added tenant_id, assessment_type, results_disclosure for coaching workflows
5. **RLS policies** - Tenant isolation with public slug lookup for branding pages
6. **Mark's profile seeded** - Full Leading with Meaning branding (green/gold palette, Playfair Display/Lato fonts)
7. **TypeScript queries** - Added 4 tenant query functions with full TenantProfile interface typing

### Files Created

- `supabase/migrations/20260106_001_create_tenant_profiles.sql`
- `supabase/migrations/20260106_002_rename_to_participant_sessions.sql` (renames campaign_assignments → participant_sessions, adds coaching columns)
- `supabase/migrations/20260106_003_create_usage_events.sql`
- `supabase/migrations/20260106_004_update_campaigns_for_coaching.sql`
- `supabase/migrations/20260106_005_seed_mark_tenant.sql`

### Files Modified

- `lib/supabase/server.ts` - Added TenantProfile interface and query functions (getTenantBySlug, getTenantByDomain, getTenantById, getTenantForUser)

### Test Results

- TypeScript compilation: No errors in modified files (pre-existing test config issues unrelated to this story)
- Migrations ready for deployment to Supabase

---

## Review Notes

### Senior Developer Review (AI)

(To be filled during code review)
