# Story 5.1: Tenant Usage Dashboard Component

**Epic:** billing-epic-5-tenant-visibility (Tenant Usage Visibility)
**Story ID:** billing-5-1-tenant-usage-dashboard-component
**Status:** done
**Created:** 2026-01-13

---

## Story

**As a** tenant admin,
**I want** to see my current usage and remaining allowance,
**So that** I can manage my consumption.

---

## Acceptance Criteria

### AC1: Usage Display
**Given** the tenant admin is on their dashboard
**When** they view the usage section
**Then** they see:
- Current usage: X tokens (Y% of limit)
- Remaining: Z tokens
- Visual progress bar showing percentage
- Billing period: Jan 1 - Jan 31
- Days remaining: N days

### AC2: Progress Bar Colors
**Given** the progress bar is displayed
**When** usage is at different levels
**Then** colors change:
- Green: 0-74%
- Yellow: 75-89%
- Red: 90-100%

### AC3: Usage API
**Given** a tenant is authenticated
**When** calling GET `/api/tenant/usage`
**Then** returns complete usage data
**And** respects RLS (tenant sees only their data)

---

## Tasks / Subtasks

- [x] **1. Create Usage API endpoint**
  - [x] 1.1 Create GET `/api/tenant/usage`
  - [x] 1.2 Use UsageTrackerService
  - [x] 1.3 Return formatted response

- [x] **2. Create UsageCard component**
  - [x] 2.1 Create `components/billing/UsageCard.tsx`
  - [x] 2.2 Display all usage metrics
  - [x] 2.3 Implement progress bar

- [x] **3. Style progress bar**
  - [x] 3.1 Green for 0-74%
  - [x] 3.2 Yellow for 75-89%
  - [x] 3.3 Red for 90-100%

- [x] **4. Add to tenant dashboard**
  - [x] 4.1 Import UsageCard
  - [x] 4.2 Fetch usage on load
  - [x] 4.3 Handle loading/error states

- [x] **5. Add refresh capability**
  - [x] 5.1 Manual refresh button
  - [x] 5.2 Auto-refresh option (not implemented - manual refresh preferred)

---

## Implementation Details

### Files Created

- `app/api/tenant/usage/route.ts` - API endpoint returning usage data
- `components/billing/UsageCard.tsx` - React component with progress bar
- `components/billing/index.ts` - Barrel export

### API Response Format

```typescript
{
  currentUsage: number,
  limit: number,
  remaining: number,
  percentage: number,
  billingPeriod: { start: string, end: string },
  daysRemaining: number,
  tier: { name: string, displayName: string },
  isOverLimit: boolean,
  hasOverride: boolean,
  display: {
    usage: string,
    percentage: string,
    status: string,
    statusColor: 'green' | 'yellow' | 'red'
  }
}
```

### UsageCard Features

- Full view with all metrics, period info, and warnings
- Compact view option for sidebar/header placement
- Loading and error states
- Manual refresh button
- Warning banners for approaching/exceeded limits
- Pearl Vibrant design with emerald/amber/red color scheme

### Dashboard Integration

- Added to coach dashboard after quick stats section
- Self-contained component that handles its own data fetching
- Returns null for non-tenant users (graceful degradation)

---

## Definition of Done

- [x] Usage API endpoint works
- [x] UsageCard component created
- [x] Progress bar colors correct
- [x] Added to tenant dashboard
- [x] Follows Pearl Vibrant design

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
