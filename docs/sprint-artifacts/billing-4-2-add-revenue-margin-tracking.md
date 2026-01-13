# Story 4.2: Add Revenue and Margin Tracking

**Epic:** billing-epic-4-admin-dashboard (Admin Dashboard Enhancement)
**Story ID:** billing-4-2-add-revenue-margin-tracking
**Status:** done
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** to record tenant revenue and see margin calculations,
**So that** I can identify unprofitable tenants.

---

## Acceptance Criteria

### AC1: Margin Display
**Given** a tenant has a subscription tier with price_cents_monthly
**When** the admin views tenant billing details
**Then** they see:
- Monthly revenue: $X.XX (from tier price)
- AI costs: $X.XX (sum of cost_cents for period)
- Margin: $X.XX (revenue - costs)
- Margin %: X% (margin / revenue)

### AC2: Negative Margin Highlight
**Given** a tenant's margin is negative
**When** displayed in the tenant list
**Then** it is highlighted in red/warning color
**And** a "Low Margin" badge appears

### AC3: Margin Sorting
**Given** the admin views the tenant overview
**When** looking at tenant list
**Then** they can sort by margin (lowest first)
**And** identify unprofitable tenants quickly

### AC4: Revenue Override
**Given** a tenant has a custom deal not matching tier price
**When** admin views tenant details
**Then** they can set a manual revenue amount
**And** margin calculations use override value

---

## Tasks / Subtasks

- [x] **1. Add revenue tracking**
  - [x] 1.1 Add `revenue_override_cents` column to tenant_profiles
  - [x] 1.2 Use tier price as default revenue
  - [x] 1.3 Override takes precedence when set

- [x] **2. Calculate margin**
  - [x] 2.1 Margin calculation in API route
  - [x] 2.2 Revenue - Costs = Margin
  - [x] 2.3 Handle edge cases (0 revenue)

- [x] **3. Update dashboard API**
  - [x] 3.1 Include margin in tenant list response
  - [x] 3.2 Include margin % and flags
  - [x] 3.3 Flag low/negative margin tenants

- [x] **4. Update dashboard UI**
  - [x] 4.1 Add margin columns to tenant table
  - [x] 4.2 Add margin to summary cards
  - [x] 4.3 Highlight negative margins in red
  - [x] 4.4 Add "Negative" and "Low" margin badges
  - [x] 4.5 Row background highlighting for at-risk tenants

- [x] **5. Revenue override display**
  - [x] 5.1 Show "Custom" badge when override is set
  - [x] 5.2 Show source (Tier badge)
  - [x] 5.3 Revenue uses override when set

---

## Implementation Details

### Migration Created
- `supabase/migrations/20260113_007_add_revenue_override.sql`
- Adds `revenue_override_cents` column to `tenant_profiles`

### API Changes
- Updated `app/api/admin/billing/route.ts`:
  - Fetches subscription tier prices
  - Calculates margin for each tenant
  - Returns: `revenue_cents`, `margin_cents`, `margin_percentage`, `has_revenue_override`, `is_negative_margin`, `is_low_margin`
  - Summary includes: `totalRevenueCents`, `totalMarginCents`, `overallMarginPercentage`, `tenantsWithNegativeMargin`, `tenantsWithLowMargin`

### UI Changes
- Updated `app/dashboard/admin/billing/page.tsx`:
  - Added 8 summary cards (cost, revenue, margin, margin %, tokens, events, tenants, at-risk)
  - Tenant table shows: Tenant, Tier, Cost, Revenue, Margin, Margin %
  - Red background for negative margin rows
  - Orange background for low margin rows
  - "Negative" badge in red, "Low" badge in orange
  - "Custom" badge when revenue override is set

### Margin Thresholds
- **Negative margin**: margin < 0
- **Low margin**: margin % > 0 and < 20%

---

## Dev Notes

### Margin Calculation

```typescript
// Revenue: use override if set, otherwise tier price
const tierPrice = tierPriceMap.get(tierName) || 0
const revenueCents = tenant?.revenue_override_cents ?? tierPrice

// Calculate margin
const marginCents = revenueCents - data.total_cost_cents
const marginPercentage = revenueCents > 0
  ? Math.round((marginCents / revenueCents) * 100)
  : 0
```

---

## Definition of Done

- [x] Margin calculated for each tenant
- [x] Dashboard shows revenue/cost/margin
- [x] Negative margins highlighted red
- [x] Low margin badge shown
- [x] At-risk tenants summary card
- [x] Revenue override column exists and is used in calculations

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
