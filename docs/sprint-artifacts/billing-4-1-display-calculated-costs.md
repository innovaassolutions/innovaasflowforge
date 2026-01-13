# Story 4.1: Display Calculated Costs in Dashboard

**Epic:** billing-epic-4-admin-dashboard (Admin Dashboard Enhancement)
**Story ID:** billing-4-1-display-calculated-costs
**Status:** drafted
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** the billing dashboard to show real calculated costs (not $0.00),
**So that** I can understand actual AI spend.

---

## Acceptance Criteria

### AC1: Cost Display
**Given** usage events have cost_cents populated (from Epic 1)
**When** the admin views the billing dashboard
**Then** all cost displays show actual calculated values
**And** costs are formatted as currency ($X.XX)

### AC2: By Model Breakdown
**Given** the admin views "By Model" tab
**When** costs are aggregated
**Then** each model shows total cost accurately
**And** sorted by highest cost first

### AC3: By Tenant Breakdown
**Given** the admin views "By Tenant" tab
**When** costs are aggregated
**Then** each tenant shows total cost accurately
**And** tenant name displayed with cost

### AC4: By Provider Breakdown
**Given** the admin views "By Provider" tab
**When** costs are aggregated
**Then** each provider (Anthropic, OpenAI, Google) shows total
**And** percentages calculated correctly

### AC5: Date Range Filter
**Given** the admin sets a date range
**When** filtering
**Then** only costs within that range are shown
**And** totals update accordingly

---

## Tasks / Subtasks

- [ ] **1. Verify dashboard infrastructure**
  - [ ] 1.1 Review existing `app/dashboard/admin/billing/page.tsx`
  - [ ] 1.2 Identify current cost display locations
  - [ ] 1.3 Check API endpoints for cost aggregation

- [ ] **2. Update cost aggregation queries**
  - [ ] 2.1 Update query to sum cost_cents
  - [ ] 2.2 Group by model, tenant, provider
  - [ ] 2.3 Ensure proper date filtering

- [ ] **3. Update cost display formatting**
  - [ ] 3.1 Format cents to dollars ($X.XX)
  - [ ] 3.2 Handle 0 costs gracefully
  - [ ] 3.3 Add proper number formatting

- [ ] **4. Test with real data**
  - [ ] 4.1 Verify costs match expected calculations
  - [ ] 4.2 Check aggregations are correct
  - [ ] 4.3 Verify date filtering works

---

## Dev Notes

### Cost Formatting

```typescript
function formatCost(costCents: number): string {
  return `$${(costCents / 100).toFixed(2)}`;
}

// Examples:
// 125 cents -> "$1.25"
// 0 cents -> "$0.00"
// 1500 cents -> "$15.00"
```

### Aggregation Query

```sql
-- By Model
SELECT
  model_used,
  COUNT(*) as event_count,
  SUM(cost_cents) as total_cost_cents
FROM usage_events
WHERE created_at BETWEEN $1 AND $2
GROUP BY model_used
ORDER BY total_cost_cents DESC;

-- By Tenant
SELECT
  tenant_id,
  t.tenant_name,
  SUM(cost_cents) as total_cost_cents
FROM usage_events u
JOIN tenant_profiles t ON u.tenant_id = t.id
WHERE u.created_at BETWEEN $1 AND $2
GROUP BY tenant_id, t.tenant_name
ORDER BY total_cost_cents DESC;
```

### Prerequisites
- Epic 1 complete (cost_cents being populated)

---

## Definition of Done

- [ ] Dashboard shows real costs (not $0.00)
- [ ] By Model tab correct
- [ ] By Tenant tab correct
- [ ] By Provider tab correct
- [ ] Date filtering works
- [ ] Currency properly formatted

---

_Story Version 1.0 | Created 2026-01-13_
