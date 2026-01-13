# Story 4.2: Add Revenue and Margin Tracking

**Epic:** billing-epic-4-admin-dashboard (Admin Dashboard Enhancement)
**Story ID:** billing-4-2-add-revenue-margin-tracking
**Status:** drafted
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

- [ ] **1. Add revenue tracking**
  - [ ] 1.1 Add `revenue_override_cents` column to tenant_profiles
  - [ ] 1.2 Use tier price as default revenue
  - [ ] 1.3 Override takes precedence when set

- [ ] **2. Calculate margin**
  - [ ] 2.1 Create margin calculation service
  - [ ] 2.2 Revenue - Costs = Margin
  - [ ] 2.3 Handle edge cases (0 revenue)

- [ ] **3. Update dashboard API**
  - [ ] 3.1 Include margin in tenant list response
  - [ ] 3.2 Support sorting by margin
  - [ ] 3.3 Flag low/negative margin tenants

- [ ] **4. Update dashboard UI**
  - [ ] 4.1 Add margin column to tenant table
  - [ ] 4.2 Add margin display to tenant detail
  - [ ] 4.3 Highlight negative margins in red
  - [ ] 4.4 Add "Low Margin" badge

- [ ] **5. Add revenue override UI**
  - [ ] 5.1 Add input field for custom revenue
  - [ ] 5.2 Clear button to reset to tier price
  - [ ] 5.3 Show source (Tier vs Override)

---

## Dev Notes

### Margin Calculation

```typescript
interface TenantMargin {
  revenue: number;         // cents
  costs: number;           // cents
  margin: number;          // revenue - costs
  marginPercent: number;   // (margin / revenue) * 100
  isNegative: boolean;
  isLow: boolean;          // margin < 20%
}

function calculateMargin(revenue: number, costs: number): TenantMargin {
  const margin = revenue - costs;
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

  return {
    revenue,
    costs,
    margin,
    marginPercent,
    isNegative: margin < 0,
    isLow: marginPercent < 20
  };
}
```

### Display Format

```
Tenant: Acme Corp
┌─────────────────────────────────────┐
│ Monthly Revenue:    $99.00          │
│ AI Costs:           $45.32          │
│ ─────────────────────────────────── │
│ Margin:             $53.68 (54.2%)  │
└─────────────────────────────────────┘

Tenant: Problem Corp   [⚠️ Low Margin]
┌─────────────────────────────────────┐
│ Monthly Revenue:    $29.00          │
│ AI Costs:           $35.00          │
│ ─────────────────────────────────── │
│ Margin:            -$6.00 (-20.7%)  │  ← RED
└─────────────────────────────────────┘
```

### Prerequisites
- Story 2.1 (tier prices)
- Story 4.1 (cost display)

---

## Definition of Done

- [ ] Margin calculated for each tenant
- [ ] Dashboard shows revenue/cost/margin
- [ ] Negative margins highlighted red
- [ ] Low margin badge shown
- [ ] Sort by margin works
- [ ] Revenue override works

---

_Story Version 1.0 | Created 2026-01-13_
