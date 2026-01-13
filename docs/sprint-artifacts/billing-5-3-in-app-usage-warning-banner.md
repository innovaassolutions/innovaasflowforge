# Story 5.3: In-App Usage Warning Banner

**Epic:** billing-epic-5-tenant-visibility (Tenant Usage Visibility)
**Story ID:** billing-5-3-in-app-usage-warning-banner
**Status:** drafted
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

- [ ] **1. Create UsageBanner component**
  - [ ] 1.1 Create `components/billing/UsageBanner.tsx`
  - [ ] 1.2 Accept usage percentage prop
  - [ ] 1.3 Render appropriate variant

- [ ] **2. Implement banner variants**
  - [ ] 2.1 Yellow (75-89%) variant
  - [ ] 2.2 Orange (90-99%) variant
  - [ ] 2.3 Red (100%) variant

- [ ] **3. Add to main layout**
  - [ ] 3.1 Import in tenant layout
  - [ ] 3.2 Fetch usage on load
  - [ ] 3.3 Position at top of content

- [ ] **4. Implement dismiss**
  - [ ] 4.1 Store dismissed state in localStorage
  - [ ] 4.2 Reset on threshold change
  - [ ] 4.3 Reset on new session

- [ ] **5. Add links**
  - [ ] 5.1 "View Usage" links to usage page
  - [ ] 5.2 "Upgrade" links to upgrade page

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

- [ ] Banner component created
- [ ] Three variants implemented
- [ ] Added to tenant layout
- [ ] Dismiss works correctly
- [ ] Links work
- [ ] Non-blocking

---

_Story Version 1.0 | Created 2026-01-13_
