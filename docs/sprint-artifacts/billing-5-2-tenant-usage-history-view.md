# Story 5.2: Tenant Usage History View

**Epic:** billing-epic-5-tenant-visibility (Tenant Usage Visibility)
**Story ID:** billing-5-2-tenant-usage-history-view
**Status:** drafted
**Created:** 2026-01-13

---

## Story

**As a** tenant admin,
**I want** to see my usage history,
**So that** I can understand consumption patterns.

---

## Acceptance Criteria

### AC1: History Page
**Given** the tenant admin clicks "View History" or navigates to usage details
**When** the page loads
**Then** they see:
- Daily usage chart (last 30 days)
- List of recent usage events (last 50)

### AC2: Chart Display
**Given** the usage chart is displayed
**When** viewing
**Then** it shows daily token usage
**And** is styled with Pearl Vibrant theme

### AC3: Event List
**Given** the event list is displayed
**When** viewing each event
**Then** it shows: date, type, tokens used

### AC4: Date Filter
**Given** the history page
**When** tenant changes date range
**Then** chart and list update accordingly

### AC5: Session Breakdown
**Given** the event list
**When** tenant views
**Then** they can see which sessions consumed the most tokens

---

## Tasks / Subtasks

- [ ] **1. Create usage history page**
  - [ ] 1.1 Create `app/dashboard/settings/usage/page.tsx`
  - [ ] 1.2 Layout with chart and list sections
  - [ ] 1.3 Date range filter

- [ ] **2. Create history API endpoint**
  - [ ] 2.1 GET `/api/tenant/usage/history`
  - [ ] 2.2 Return daily aggregates
  - [ ] 2.3 Return recent events

- [ ] **3. Create usage chart**
  - [ ] 3.1 Use Recharts
  - [ ] 3.2 Bar chart for daily usage
  - [ ] 3.3 Apply theme colors

- [ ] **4. Create event list**
  - [ ] 4.1 List recent events
  - [ ] 4.2 Show date, type, tokens
  - [ ] 4.3 Link to session if applicable

- [ ] **5. Add date filtering**
  - [ ] 5.1 Date range picker
  - [ ] 5.2 Update chart on change
  - [ ] 5.3 Update list on change

---

## Dev Notes

### History API Response

```typescript
// GET /api/tenant/usage/history?startDate=X&endDate=Y
interface UsageHistoryResponse {
  dailyUsage: Array<{
    date: string;
    tokens: number;
  }>;
  recentEvents: Array<{
    id: string;
    date: string;
    eventType: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    sessionId?: string;
  }>;
}
```

### Page Layout

```
Usage History
┌─────────────────────────────────────────────────────┐
│ Date Range: [Jan 1 ▼] to [Jan 31 ▼]                │
├─────────────────────────────────────────────────────┤
│                 Daily Usage Chart                   │
│   ▄▄                                               │
│   ██ ▄▄    ▄▄         ▄▄                           │
│   ██ ██ ▄▄ ██    ▄▄   ██ ▄▄                        │
│ ──────────────────────────────────────             │
│   1  2  3  4  5  6  7  8  9  10                    │
├─────────────────────────────────────────────────────┤
│ Recent Activity                                     │
│────────────────────────────────────────────────────│
│ Jan 15 • Interview Message    1,500 tokens         │
│ Jan 15 • Interview Message    2,300 tokens         │
│ Jan 14 • Synthesis           12,000 tokens         │
└─────────────────────────────────────────────────────┘
```

### Prerequisites
- Story 5.1 (tenant usage API)

---

## Definition of Done

- [ ] History page created
- [ ] Daily chart displays
- [ ] Event list shows recent activity
- [ ] Date filter works
- [ ] RLS ensures tenant isolation

---

_Story Version 1.0 | Created 2026-01-13_
