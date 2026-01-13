# Story 4.3: Add Cost Trend Visualization

**Epic:** billing-epic-4-admin-dashboard (Admin Dashboard Enhancement)
**Story ID:** billing-4-3-add-cost-trend-visualization
**Status:** drafted
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

- [ ] **1. Create trend data endpoint**
  - [ ] 1.1 Create `/api/admin/billing/trends` endpoint
  - [ ] 1.2 Accept date range parameters
  - [ ] 1.3 Return aggregated data by day/week/month

- [ ] **2. Implement data aggregation**
  - [ ] 2.1 Aggregate by day for short ranges
  - [ ] 2.2 Aggregate by week for medium ranges
  - [ ] 2.3 Aggregate by month for long ranges

- [ ] **3. Create trend chart component**
  - [ ] 3.1 Use Recharts library
  - [ ] 3.2 Create line chart component
  - [ ] 3.3 Support multiple data series

- [ ] **4. Add view toggles**
  - [ ] 4.1 Total cost view
  - [ ] 4.2 By provider view
  - [ ] 4.3 By tenant view (top 5)

- [ ] **5. Style chart**
  - [ ] 5.1 Apply Pearl Vibrant colors
  - [ ] 5.2 Add proper labels and legends
  - [ ] 5.3 Make responsive

---

## Dev Notes

### Trend Data Structure

```typescript
interface TrendDataPoint {
  date: string;           // "2026-01-15"
  totalCostCents: number;
  byProvider?: {
    anthropic: number;
    openai: number;
    google: number;
  };
}

interface TrendResponse {
  data: TrendDataPoint[];
  aggregation: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}
```

### Aggregation Query

```sql
-- Daily aggregation
SELECT
  DATE(created_at) as date,
  SUM(cost_cents) as total_cost_cents,
  SUM(CASE WHEN model_used LIKE 'claude%' THEN cost_cents ELSE 0 END) as anthropic,
  SUM(CASE WHEN model_used LIKE 'gpt%' THEN cost_cents ELSE 0 END) as openai,
  SUM(CASE WHEN model_used LIKE 'gemini%' THEN cost_cents ELSE 0 END) as google
FROM usage_events
WHERE created_at BETWEEN $1 AND $2
GROUP BY DATE(created_at)
ORDER BY date;
```

### Chart Colors (Pearl Vibrant)

```typescript
const chartColors = {
  total: '#F25C05',      // Accent orange
  anthropic: '#1D9BA3',  // Teal
  openai: '#6366F1',     // Indigo
  google: '#22C55E',     // Green
};
```

### Prerequisites
- Story 4.1 (cost data available)

---

## Definition of Done

- [ ] Trend chart displays on dashboard
- [ ] Aggregation adapts to date range
- [ ] Multiple views work
- [ ] Uses Pearl Vibrant colors
- [ ] Responsive and readable

---

_Story Version 1.0 | Created 2026-01-13_
