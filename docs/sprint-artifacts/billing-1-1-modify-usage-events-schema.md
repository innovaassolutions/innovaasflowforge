# Story 1.1: Modify Usage Events Schema

**Epic:** billing-epic-1-foundation (Foundation - Schema & Cost Calculation)
**Story ID:** billing-1-1-modify-usage-events-schema
**Status:** review
**Created:** 2026-01-13

---

## Story

**As a** platform developer,
**I want** the usage_events table to store input and output tokens separately,
**So that** costs can be calculated accurately based on provider-specific input/output rates.

---

## Acceptance Criteria

### AC1: Schema Columns Added
**Given** the existing usage_events table with a single tokens_used column
**When** the migration runs
**Then** the table has new columns:
- `input_tokens` (INTEGER DEFAULT 0)
- `output_tokens` (INTEGER DEFAULT 0)
**And** the existing `tokens_used` column is retained for backward compatibility

### AC2: Data Backfill
**Given** existing rows in usage_events with tokens_used values
**When** the migration completes
**Then** all existing rows have:
- `input_tokens = 0`
- `output_tokens = tokens_used`
**And** no data loss occurs

### AC3: Constraints Added
**Given** the new columns exist
**When** attempting to insert negative token values
**Then** the CHECK constraint rejects the insert
**And** the constraint enforces: `input_tokens >= 0 AND output_tokens >= 0`

### AC4: Billing Index Created
**Given** the usage_events table
**When** the migration completes
**Then** an index exists on `(tenant_id, created_at DESC)` for efficient billing aggregation queries
**And** the index is filtered: `WHERE tenant_id IS NOT NULL`

### AC5: Verification Query
**Given** the migrations are applied
**When** I query `SELECT input_tokens, output_tokens FROM usage_events LIMIT 1`
**Then** both columns exist and return valid integer values

---

## Tasks / Subtasks

- [x] **1. Create migration file**
  - [x] 1.1 Create `supabase/migrations/20260113_001_add_input_output_tokens.sql`
  - [x] 1.2 Add `input_tokens INTEGER DEFAULT 0` column
  - [x] 1.3 Add `output_tokens INTEGER DEFAULT 0` column

- [x] **2. Backfill existing data**
  - [x] 2.1 Update all existing rows: `SET input_tokens = 0, output_tokens = tokens_used`
  - [x] 2.2 Ensure backfill handles NULL values gracefully

- [x] **3. Add constraints**
  - [x] 3.1 Add CHECK constraint: `positive_tokens CHECK (input_tokens >= 0 AND output_tokens >= 0)`
  - [x] 3.2 Verify constraint rejects negative values

- [x] **4. Create billing index**
  - [x] 4.1 Create index: `idx_usage_events_billing ON usage_events (tenant_id, created_at DESC) WHERE tenant_id IS NOT NULL`
  - [x] 4.2 Verify index improves query performance

- [x] **5. Regenerate TypeScript types** _(N/A - no database.types.ts file exists in project)_
  - [x] 5.1 Run `npx supabase gen types typescript` - Skipped, no types file
  - [x] 5.2 Update `lib/supabase/database.types.ts` if needed - N/A
  - [x] 5.3 Verify new columns appear in UsageEvent type - N/A

- [x] **6. Apply and verify migration**
  - [x] 6.1 Apply migration to production database via Supabase MCP
  - [x] 6.2 Run verification queries (all ACs verified)
  - [x] 6.3 Confirm no existing functionality is broken

---

## Dev Notes

### Migration SQL Reference

```sql
-- Add input/output token columns
ALTER TABLE usage_events
  ADD COLUMN input_tokens INTEGER DEFAULT 0,
  ADD COLUMN output_tokens INTEGER DEFAULT 0;

-- Backfill existing data (assume all were output tokens)
UPDATE usage_events
SET input_tokens = 0,
    output_tokens = COALESCE(tokens_used, 0)
WHERE input_tokens IS NULL;

-- Add constraint for non-negative values
ALTER TABLE usage_events
  ADD CONSTRAINT positive_tokens
  CHECK (input_tokens >= 0 AND output_tokens >= 0);

-- Create index for billing aggregation queries
CREATE INDEX IF NOT EXISTS idx_usage_events_billing
  ON usage_events (tenant_id, created_at DESC)
  WHERE tenant_id IS NOT NULL;
```

### Key Considerations

1. **Backward Compatibility**: Keep `tokens_used` column - some legacy code may reference it
2. **Default Values**: Use DEFAULT 0 so existing INSERT statements don't break
3. **Backfill Logic**: Assume existing tokens were output tokens (conservative for cost calculation)
4. **Index Strategy**: Partial index on `tenant_id IS NOT NULL` for billing-specific queries

### Related Files

- Existing migration: `supabase/migrations/20260106_003_create_usage_events.sql`
- Type definitions: `lib/supabase/database.types.ts`
- Usage logging: `lib/usage/log-usage.ts` (will be updated in Story 1.3)

### Testing Approach

1. Apply migration locally
2. Verify schema with `\d usage_events` in psql
3. Test constraint with intentional negative insert (should fail)
4. Run sample billing query to confirm index usage
5. Verify TypeScript compilation succeeds

---

## Tech Spec Reference

**Source:** [tech-spec-epic-billing-epic-1-foundation.md](./tech-spec-epic-billing-epic-1-foundation.md)

**Relevant Sections:**
- Data Models: Usage Events Table Modification (lines 139-159)
- AC1: Schema columns exist and backfill correct (line 288)
- NFR Performance: Database query < 10ms with index (line 208)

---

## Definition of Done

- [x] Migration file created and reviewed
- [x] Migration applied successfully to database
- [x] All existing data backfilled correctly (10/10 rows)
- [x] CHECK constraint verified working (rejects negative values)
- [x] Billing index created and verified
- [x] TypeScript types regenerated _(N/A - no database.types.ts in project)_
- [x] No regression in existing functionality
- [x] Story marked as `review` in sprint-status.yaml

---

## Dev Agent Record

### Implementation Log

| Date | Action | Result |
|------|--------|--------|
| 2026-01-13 | Created migration file `20260113_001_add_input_output_tokens.sql` | Success |
| 2026-01-13 | Applied migration via Supabase MCP | Success |
| 2026-01-13 | Fixed backfill logic (DEFAULT 0 required different WHERE clause) | Success |
| 2026-01-13 | Verified all 5 acceptance criteria | All passed |
| 2026-01-13 | Tested CHECK constraint rejects negative values | Confirmed |

### Debug Log

**Plan:** Add input_tokens and output_tokens columns to usage_events table with proper backfill, constraints, and indexing for billing cost calculations.

**Implementation approach:**
1. Used `ADD COLUMN IF NOT EXISTS` for idempotency
2. Discovered backfill issue: columns get DEFAULT 0 before UPDATE runs, so `WHERE IS NULL` doesn't match. Fixed to `WHERE output_tokens = 0 AND tokens_used > 0`
3. Applied `positive_tokens` CHECK constraint
4. Created partial index `idx_usage_events_billing` for billing queries

### Completion Notes

All acceptance criteria verified:
- **AC1:** Columns exist with correct types and defaults
- **AC2:** 10/10 rows backfilled correctly (input_tokens=0, output_tokens=tokens_used)
- **AC3:** CHECK constraint active, tested rejection of negative values
- **AC4:** Partial index created on (tenant_id, created_at DESC) WHERE tenant_id IS NOT NULL
- **AC5:** Verification query returns valid integers for both columns

### Blockers Encountered

None.

### Decisions Made

1. **Backfill logic fix:** Changed WHERE clause from `IS NULL` to `output_tokens = 0 AND tokens_used > 0` because DEFAULT 0 is applied before UPDATE runs.

### File List

| File | Change |
|------|--------|
| `supabase/migrations/20260113_001_add_input_output_tokens.sql` | Created |

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-13 | Initial implementation - schema migration complete | Dev Agent |

---

_Story Version 1.1 | Completed 2026-01-13_
