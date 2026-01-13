# Story 5.2: Tenant Usage History View

**Epic:** billing-epic-5-tenant-visibility (Tenant Usage Visibility)
**Story ID:** billing-5-2-tenant-usage-history-view
**Status:** done
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

- [x] **1. Create usage history page**
  - [x] 1.1 Create `app/dashboard/settings/usage/page.tsx`
  - [x] 1.2 Layout with chart and list sections
  - [x] 1.3 Date range filter

- [x] **2. Create history API endpoint**
  - [x] 2.1 GET `/api/tenant/usage/history`
  - [x] 2.2 Return daily aggregates
  - [x] 2.3 Return recent events

- [x] **3. Create usage chart**
  - [x] 3.1 Use Recharts
  - [x] 3.2 Bar chart for daily usage
  - [x] 3.3 Apply theme colors

- [x] **4. Create event list**
  - [x] 4.1 List recent events
  - [x] 4.2 Show date, type, tokens
  - [x] 4.3 Link to session if applicable

- [x] **5. Add date filtering**
  - [x] 5.1 Date range picker
  - [x] 5.2 Update chart on change
  - [x] 5.3 Update list on change

---

## Implementation Details

### Files Created

- `app/api/tenant/usage/history/route.ts` - API endpoint for historical data
- `app/dashboard/settings/usage/page.tsx` - Usage history page
- Updated `components/billing/UsageCard.tsx` - Added "History" link

### API Response Format

```typescript
{
  dateRange: { start: string, end: string },
  summary: {
    totalTokens: number,
    avgDailyTokens: number,
    peakDay: string,
    peakTokens: number,
    totalEvents: number
  },
  dailyUsage: Array<{ date: string, tokens: number }>,
  recentEvents: Array<{
    id: string,
    date: string,
    eventType: string,
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
    modelUsed: string | null,
    sessionId: string | null
  }>
}
```

### Page Features

- Summary cards: Total tokens, Avg daily, Peak day, Total events
- Bar chart using Recharts with purple theme color
- Recent events list with event type badges
- Date range filter with Apply button
- Loading and error states
- Refresh button

### Navigation

- "History" link added to UsageCard period info section
- Back to Dashboard link in page header

---

## Definition of Done

- [x] History page created
- [x] Daily chart displays
- [x] Event list shows recent activity
- [x] Date filter works
- [x] RLS ensures tenant isolation

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
