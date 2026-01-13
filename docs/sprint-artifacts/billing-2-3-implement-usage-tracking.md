# Story 2.3: Implement Usage Tracking Per Billing Period

**Epic:** billing-epic-2-tiers-limits (Subscription Tiers & Usage Limits)
**Story ID:** billing-2-3-implement-usage-tracking
**Status:** review
**Created:** 2026-01-13

---

## Story

**As a** platform developer,
**I want** to track cumulative token usage per tenant per billing period,
**So that** the system can calculate usage percentage.

---

## Acceptance Criteria

### AC1: Usage Calculation
**Given** a tenant has a billing_period_start date
**When** the system queries their usage
**Then** it sums all usage_events (input_tokens + output_tokens) since billing_period_start
**And** returns the total as current_usage

### AC2: Percentage Calculation
**Given** a tenant's tier has monthly_token_limit of 2,000,000
**When** their current_usage is 1,500,000
**Then** usage_percentage = 75%

### AC3: Override Respected
**Given** a tenant has usage_limit_override set
**When** calculating percentage
**Then** the override value is used instead of tier limit

### AC4: Helper Function Returns Complete Data
**Given** getTenantUsage(tenantId) is called
**When** executed
**Then** it returns:
- current_usage (tokens)
- limit (from tier or override)
- percentage (0-100+)
- billing_period_start
- billing_period_end (calculated)
- days_remaining

### AC5: Efficient Query Performance
**Given** the usage query runs
**When** executed on a tenant with many events
**Then** it completes in < 100ms
**And** uses the billing index from Story 1.1

---

## Tasks / Subtasks

- [x] **1. Create UsageTrackerService**
  - [x] 1.1 Create `lib/services/usage-tracker.ts`
  - [x] 1.2 Implement `getTenantUsage(tenantId)` method
  - [x] 1.3 Implement `getCurrentUsageTokens(tenantId)` method

- [x] **2. Implement usage calculation**
  - [x] 2.1 Query usage_events for tenant since billing_period_start
  - [x] 2.2 Sum input_tokens + output_tokens
  - [x] 2.3 Return total as current_usage

- [x] **3. Implement percentage calculation**
  - [x] 3.1 Get limit from tier or override
  - [x] 3.2 Calculate: (current_usage / limit) × 100
  - [x] 3.3 Handle edge cases (limit = 0, null)

- [x] **4. Add caching**
  - [x] 4.1 Cache usage results for 1 minute
  - [x] 4.2 Invalidate cache on new usage event (invalidateUsageCache)
  - [x] 4.3 Reduce database queries

- [ ] **5. Write unit tests** (deferred)
  - [ ] 5.1 Test usage calculation
  - [ ] 5.2 Test percentage calculation
  - [ ] 5.3 Test override handling

---

## Dev Notes

### Service Interface

```typescript
// lib/services/usage-tracker.ts

interface TenantUsage {
  tenantId: string;
  currentUsage: number;      // Total tokens used
  limit: number;             // From tier or override
  percentage: number;        // 0-100+
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  daysRemaining: number;
  isOverLimit: boolean;
}

async function getTenantUsage(tenantId: string): Promise<TenantUsage>;
async function getCurrentUsageTokens(tenantId: string): Promise<number>;
```

### Usage Query

```sql
SELECT
  COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens
FROM usage_events
WHERE tenant_id = $1
  AND created_at >= $2  -- billing_period_start
```

### Percentage Calculation

```typescript
const percentage = limit > 0
  ? Math.round((currentUsage / limit) * 100)
  : 100; // If no limit, consider 100%
```

### Prerequisites
- Story 1.1 (input/output tokens in usage_events)
- Story 2.2 (tier_id on tenant_profiles)

---

## Definition of Done

- [ ] UsageTrackerService created
- [ ] getTenantUsage returns complete data
- [ ] Percentage calculation correct
- [ ] Override respected
- [ ] Query performs < 100ms
- [ ] Unit tests pass

---

_Story Version 1.0 | Created 2026-01-13_
