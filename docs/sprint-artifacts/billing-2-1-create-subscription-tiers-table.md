# Story 2.1: Create Subscription Tiers Table

**Epic:** billing-epic-2-tiers-limits (Subscription Tiers & Usage Limits)
**Story ID:** billing-2-1-create-subscription-tiers-table
**Status:** review
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** a database table to define subscription tiers with usage limits,
**So that** tenants can be assigned appropriate packages.

---

## Acceptance Criteria

### AC1: Table Created
**Given** no subscription_tiers table exists
**When** the migration runs
**Then** a subscription_tiers table is created with:
- `id` (UUID, primary key)
- `name` (TEXT NOT NULL UNIQUE) - 'starter', 'pro', 'enterprise'
- `display_name` (TEXT) - 'Starter', 'Pro', 'Enterprise'
- `monthly_token_limit` (BIGINT) - NULL means check session limit
- `monthly_session_limit` (INTEGER) - NULL means check token limit
- `price_cents_monthly` (INTEGER) - subscription price
- `is_active` (BOOLEAN DEFAULT true)
- `created_at`, `updated_at` timestamps

### AC2: No Unlimited Tiers
**Given** the subscription_tiers table exists
**When** attempting to insert a tier with both limits NULL
**Then** the insert is rejected due to CHECK constraint
**And** constraint enforces: at least one limit must be set

### AC3: Seed Data
**Given** the migration completes
**When** querying subscription_tiers
**Then** seed data exists for:
- Starter: 500,000 tokens/month, $29/month
- Pro: 2,000,000 tokens/month, $99/month
- Enterprise: 10,000,000 tokens/month, $499/month

### AC4: Unique Name Constraint
**Given** the table exists
**When** attempting to insert duplicate tier name
**Then** the insert is rejected

---

## Tasks / Subtasks

- [x] **1. Create migration file**
  - [x] 1.1 Create `supabase/migrations/20260113_003_create_subscription_tiers.sql`
  - [x] 1.2 Define table schema with all columns
  - [x] 1.3 Add UNIQUE constraint on name

- [x] **2. Add CHECK constraint**
  - [x] 2.1 Ensure at least one limit is set (no unlimited)
  - [x] 2.2 Verify constraint with test insert

- [x] **3. Seed tier data**
  - [x] 3.1 Insert Starter tier
  - [x] 3.2 Insert Pro tier
  - [x] 3.3 Insert Enterprise tier

- [x] **4. Configure RLS**
  - [x] 4.1 Enable RLS
  - [x] 4.2 Admin-only write policy
  - [x] 4.3 Authenticated read policy

- [x] **5. Regenerate types** _(N/A - no database.types.ts in project)_
  - [x] 5.1 Run type generation - Skipped
  - [x] 5.2 Verify SubscriptionTier type exists - N/A

---

## Dev Notes

### Migration SQL Reference

```sql
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  monthly_token_limit BIGINT,
  monthly_session_limit INTEGER,
  price_cents_monthly INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure at least one limit is set (no unlimited tiers)
  CONSTRAINT at_least_one_limit CHECK (
    monthly_token_limit IS NOT NULL OR monthly_session_limit IS NOT NULL
  )
);

-- Seed data
INSERT INTO subscription_tiers (name, display_name, monthly_token_limit, price_cents_monthly) VALUES
  ('starter', 'Starter', 500000, 2900),
  ('pro', 'Pro', 2000000, 9900),
  ('enterprise', 'Enterprise', 10000000, 49900);
```

### Tier Pricing Summary

| Tier | Token Limit | Price | Notes |
|------|-------------|-------|-------|
| Starter | 500K tokens | $29/mo | Entry level |
| Pro | 2M tokens | $99/mo | Most popular |
| Enterprise | 10M tokens | $499/mo | High volume |

### Prerequisites
- None (can run parallel to Epic 1)

---

## Definition of Done

- [x] Migration created and applied
- [x] CHECK constraint prevents unlimited tiers
- [x] 3 tiers seeded with correct limits/prices
- [x] RLS policies configured
- [x] TypeScript types regenerated _(N/A)_

---

## Dev Agent Record

### Implementation Log

| Date | Action | Result |
|------|--------|--------|
| 2026-01-13 | Created migration file `20260113_003_create_subscription_tiers.sql` | Success |
| 2026-01-13 | Applied migration via Supabase MCP | Success |
| 2026-01-13 | Verified 3 tiers seeded correctly | All verified |
| 2026-01-13 | Tested CHECK constraint rejects unlimited tiers | Confirmed |

### File List

| File | Change |
|------|--------|
| `supabase/migrations/20260113_003_create_subscription_tiers.sql` | Created |

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-13 | Initial implementation - subscription_tiers table complete | Dev Agent |

---

_Story Version 1.1 | Completed 2026-01-13_
