# Story 5.3: In-App Usage Warning Banner

**Epic:** billing-epic-5-tenant-visibility (Tenant Usage Visibility)
**Story ID:** billing-5-3-in-app-usage-warning-banner
**Status:** done
**Created:** 2026-01-13

---

## Story

**As a** tenant user,
**I want** to see a warning banner when approaching my limit,
**So that** I'm aware before getting locked out.

---

## Acceptance Criteria

### AC1: 75% Warning Banner
**Given** a tenant user is using the platform
**When** their usage is 75-89%
**Then** a yellow warning banner appears
**And** message: "You've used X% of your monthly allowance. [View Usage]"

### AC2: 90% Warning Banner
**Given** a tenant user is using the platform
**When** their usage is 90-99%
**Then** an orange warning banner appears
**And** message: "Warning: You've used X% of your monthly allowance. Consider upgrading. [Upgrade] [View Usage]"

### AC3: 100% Lockout Banner
**Given** a tenant user is using the platform
**When** their usage is 100%
**Then** a red banner appears
**And** message: "Usage limit reached. Your sessions are paused until [date] or you upgrade. [Upgrade]"

### AC4: Dismissible
**Given** a warning banner is displayed
**When** user clicks dismiss
**Then** banner hides for that session
**And** reappears on next session if still applicable

### AC5: Non-Blocking
**Given** banners are displayed
**When** user interacts with app
**Then** banners don't block UI
**And** they're informational only

---

## Tasks / Subtasks

- [x] **1. Create UsageBanner component**
  - [x] 1.1 Create `components/billing/UsageBanner.tsx`
  - [x] 1.2 Accept usage percentage prop
  - [x] 1.3 Render appropriate variant

- [x] **2. Implement banner variants**
  - [x] 2.1 Yellow (75-89%) variant
  - [x] 2.2 Orange (90-99%) variant
  - [x] 2.3 Red (100%) variant

- [x] **3. Add to main layout**
  - [x] 3.1 Import in tenant layout
  - [x] 3.2 Fetch usage on load
  - [x] 3.3 Position at top of content

- [x] **4. Implement dismiss**
  - [x] 4.1 Store dismissed state in localStorage
  - [x] 4.2 Reset on threshold change
  - [x] 4.3 Reset on new session (24-hour timeout)

- [x] **5. Add links**
  - [x] 5.1 "View Usage" links to usage page
  - [x] 5.2 "Upgrade" links to upgrade page

---

## Dev Notes

### Banner Component

```tsx
// components/billing/UsageBanner.tsx
interface UsageBannerProps {
  percentage: number;
  resetDate: string;
  onDismiss?: () => void;
}

export function UsageBanner({ percentage, resetDate, onDismiss }: UsageBannerProps) {
  if (percentage < 75) return null;

  const variant =
    percentage >= 100 ? 'destructive' :
    percentage >= 90 ? 'warning' :
    'caution';

  const colors = {
    caution: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={`p-4 border rounded-lg ${colors[variant]} mb-4`}>
      <div className="flex items-center justify-between">
        <p>{getMessage(percentage, resetDate)}</p>
        <div className="flex gap-2">
          {percentage >= 90 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/upgrade">Upgrade</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings/usage">View Usage</Link>
          </Button>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              ✕
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function getMessage(percentage: number, resetDate: string): string {
  if (percentage >= 100) {
    return `Usage limit reached. Your sessions are paused until ${resetDate} or you upgrade.`;
  }
  if (percentage >= 90) {
    return `Warning: You've used ${percentage}% of your monthly allowance. Consider upgrading.`;
  }
  return `You've used ${percentage}% of your monthly allowance.`;
}
```

### LocalStorage Dismiss

```typescript
const DISMISS_KEY = 'usage_banner_dismissed';

function getDismissedThreshold(): number | null {
  const stored = localStorage.getItem(DISMISS_KEY);
  if (!stored) return null;
  const { threshold, timestamp } = JSON.parse(stored);
  // Reset after 24 hours
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return null;
  return threshold;
}

function dismissBanner(threshold: number) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify({
    threshold,
    timestamp: Date.now()
  }));
}
```

### Prerequisites
- Story 3.2 (notification triggers)
- Story 5.1 (usage data)

---

## Definition of Done

- [x] Banner component created
- [x] Three variants implemented
- [x] Added to tenant layout
- [x] Dismiss works correctly
- [x] Links work
- [x] Non-blocking

---

## Implementation Details

### Files Created/Modified

- `components/billing/UsageBanner.tsx` - Self-contained warning banner component
- `components/billing/index.ts` - Updated barrel export
- `app/dashboard/layout.tsx` - Added UsageBanner to top of dashboard content

### Banner Features

- **Yellow (75-89%)**: Soft warning with "View Usage" link
- **Orange (90-99%)**: Stronger warning with "Upgrade" and "View Usage" links
- **Red (100%)**: Lockout message with "Upgrade" link and reset date

### Dismiss Functionality

- Uses localStorage with 24-hour expiry
- Tracks dismissed threshold (75/90/100)
- If usage crosses to higher threshold, banner reappears
- Dismiss is per-browser session

### Self-Contained Design

Component fetches its own data from `/api/tenant/usage` and handles:
- Loading state (returns null)
- No tenant (returns null)
- Under 75% (returns null)
- Error (returns null)

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
