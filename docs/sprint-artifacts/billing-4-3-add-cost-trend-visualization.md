# Story 4.3: Add Cost Trend Visualization

**Epic:** billing-epic-4-admin-dashboard (Admin Dashboard Enhancement)
**Story ID:** billing-4-3-add-cost-trend-visualization
**Status:** done
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** to see cost trends over time,
**So that** I can identify growth patterns and anomalies.

---

## Acceptance Criteria

### AC1: Trend Chart Display
**Given** the admin views the billing dashboard
**When** they view the trends section
**Then** a line chart shows cost over time
**And** the chart is clear and readable

### AC2: Time Aggregation
**Given** different date ranges
**When** viewing trends:
- < 30 days: Aggregate by day
- 30-90 days: Aggregate by week
- > 90 days: Aggregate by month

### AC3: Multiple Views
**Given** the trend chart
**When** admin toggles view options
**Then** they can see:
- Total cost
- By provider (multiple lines)
- By top tenants

### AC4: Styling
**Given** the chart renders
**When** displayed
**Then** it uses Pearl Vibrant color scheme
**And** follows existing chart patterns

---

## Tasks / Subtasks

- [x] **1. Add trend data to API**
  - [x] 1.1 Aggregate by day with provider breakdown
  - [x] 1.2 Return dailyTrend in API response

- [x] **2. Implement chart component**
  - [x] 2.1 Use Recharts library
  - [x] 2.2 Create responsive line chart
  - [x] 2.3 Support multiple data series (by provider)

- [x] **3. Add view toggles**
  - [x] 3.1 Total cost view (single line)
  - [x] 3.2 By provider view (multiple lines)

- [x] **4. Style chart**
  - [x] 4.1 Apply Pearl Vibrant colors
  - [x] 4.2 Add proper labels and tooltips
  - [x] 4.3 Make responsive

---

## Implementation Details

### API Changes
- Updated `app/api/admin/billing/route.ts`:
  - Added `getProviderForTrend()` function to categorize models
  - Added `byDayMap` aggregation for daily trends
  - Returns `dailyTrend` array with fields: `date`, `total_cost_cents`, `anthropic`, `openai`, `google`, `other`

### UI Changes
- Updated `app/dashboard/admin/billing/page.tsx`:
  - Added `DailyTrend` interface
  - Added Recharts imports (LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer)
  - Added `chartView` state toggle ('total' | 'provider')
  - Added responsive trend chart with toggle buttons

### Chart Features
- **Total View**: Single orange line (#F25C05) showing total cost per day
- **Provider View**: Multiple lines with legend showing cost breakdown:
  - Anthropic: Teal (#1D9BA3)
  - OpenAI: Indigo (#6366F1)
  - Google: Green (#22C55E)
  - Other: Gray (#71706B) - only shown if data exists

### Styling
- Uses Pearl Vibrant color scheme
- Grid: #E6E2D6
- Text: #71706B (muted)
- Background: #FFFEFB
- Toggle buttons: Purple (#7C3AED) when active

---

## Dev Notes

### Data Transformation

```typescript
// Transform cents to dollars for display
data.dailyTrend.map((d) => ({
  ...d,
  date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  total: d.total_cost_cents / 100,
  anthropic: d.anthropic / 100,
  openai: d.openai / 100,
  google: d.google / 100,
  other: d.other / 100,
}))
```

### Chart Colors

```typescript
const chartColors = {
  total: '#F25C05',      // Accent orange
  anthropic: '#1D9BA3',  // Teal
  openai: '#6366F1',     // Indigo
  google: '#22C55E',     // Green
  other: '#71706B',      // Gray
};
```

---

## Definition of Done

- [x] Trend chart displays on dashboard
- [x] Daily aggregation shows costs per day
- [x] Total view shows single line
- [x] Provider view shows breakdown lines
- [x] Uses Pearl Vibrant colors
- [x] Responsive and readable
- [x] Tooltips show dollar amounts

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
