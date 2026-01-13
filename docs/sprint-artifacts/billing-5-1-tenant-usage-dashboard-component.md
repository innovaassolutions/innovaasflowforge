# Story 5.1: Tenant Usage Dashboard Component

**Epic:** billing-epic-5-tenant-visibility (Tenant Usage Visibility)
**Story ID:** billing-5-1-tenant-usage-dashboard-component
**Status:** drafted
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

- [ ] **1. Create Usage API endpoint**
  - [ ] 1.1 Create GET `/api/tenant/usage`
  - [ ] 1.2 Use UsageTrackerService
  - [ ] 1.3 Return formatted response

- [ ] **2. Create UsageCard component**
  - [ ] 2.1 Create `components/billing/UsageCard.tsx`
  - [ ] 2.2 Display all usage metrics
  - [ ] 2.3 Implement progress bar

- [ ] **3. Style progress bar**
  - [ ] 3.1 Green for 0-74%
  - [ ] 3.2 Yellow for 75-89%
  - [ ] 3.3 Red for 90-100%

- [ ] **4. Add to tenant dashboard**
  - [ ] 4.1 Import UsageCard
  - [ ] 4.2 Fetch usage on load
  - [ ] 4.3 Handle loading/error states

- [ ] **5. Add refresh capability**
  - [ ] 5.1 Manual refresh button
  - [ ] 5.2 Auto-refresh option

---

## Dev Notes

### Usage API Response

```typescript
// GET /api/tenant/usage
interface UsageResponse {
  currentUsage: number;        // tokens used
  limit: number;               // from tier or override
  remaining: number;           // limit - current
  percentage: number;          // 0-100
  billingPeriod: {
    start: string;             // "2026-01-01"
    end: string;               // "2026-01-31"
  };
  daysRemaining: number;
  tier: {
    name: string;
    displayName: string;
  };
}
```

### UsageCard Component

```tsx
// components/billing/UsageCard.tsx
interface UsageCardProps {
  usage: UsageResponse;
}

export function UsageCard({ usage }: UsageCardProps) {
  const progressColor =
    usage.percentage >= 90 ? 'bg-red-500' :
    usage.percentage >= 75 ? 'bg-yellow-500' :
    'bg-green-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage This Period</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${progressColor}`}
            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
          />
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted">Used</p>
            <p className="text-xl font-bold">
              {formatNumber(usage.currentUsage)} tokens
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Remaining</p>
            <p className="text-xl font-bold">
              {formatNumber(usage.remaining)} tokens
            </p>
          </div>
        </div>

        {/* Period info */}
        <p className="mt-4 text-sm text-muted">
          {usage.daysRemaining} days until reset
        </p>
      </CardContent>
    </Card>
  );
}
```

### Prerequisites
- Story 2.3 (usage tracking service)

---

## Definition of Done

- [ ] Usage API endpoint works
- [ ] UsageCard component created
- [ ] Progress bar colors correct
- [ ] Added to tenant dashboard
- [ ] Follows Pearl Vibrant design

---

_Story Version 1.0 | Created 2026-01-13_
