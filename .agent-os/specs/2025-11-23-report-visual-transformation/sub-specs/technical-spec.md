# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-11-23-report-visual-transformation/spec.md

> Created: 2025-11-23
> Version: 1.0.0

## Technical Requirements

### Chart Rendering
- Recharts library for all web-based visualizations
- Responsive charts that adapt to container width
- Color-coded data points using traffic light system
- Tooltips with formatted data on hover
- Accessible SVG output with ARIA labels

### UI Components
- Consistent Mocha theme styling (Catppuccin)
- Brand colors: Orange (#F25C05), Teal (#1D9BA3)
- Score badge component with gradient backgrounds
- Priority tags with semantic colors (critical=red, important=orange, etc.)
- Quote cards with stakeholder attribution
- Callout boxes with themed borders

### Data Transformation
- Pure functions to convert synthesis data to chart formats
- Type-safe transformations with TypeScript interfaces
- No mutations of source data
- Memoization for expensive transformations

### Performance
- Lazy load chart components below the fold
- Code splitting for chart library (separate bundle)
- Client-side rendering only (no SSR for charts)
- Target <3s initial page load with all charts

### Responsive Breakpoints
- Desktop (1024px+): Multi-column grid layout
- Tablet (768-1023px): Two-column layout
- Mobile (320-767px): Single column, stacked

## Approach Options

### Option A: Recharts Only (Selected)

**Pros:**
- React-native, declarative API
- Good TypeScript support
- Responsive by default
- Active maintenance
- Sufficient for all required chart types

**Cons:**
- Slightly heavier bundle size than alternatives
- Limited 3D chart options (not needed)

**Rationale:** Recharts provides all required chart types (radar, bar, area, pie) with excellent React integration. The declarative API matches our component architecture, and TypeScript support ensures type safety throughout the chart pipeline.

### Option B: Chart.js + react-chartjs-2

**Pros:**
- Lighter bundle size
- More chart types available
- Extensive plugin ecosystem

**Cons:**
- Imperative API (less React-friendly)
- TypeScript support is secondary
- More boilerplate for React integration

**Rejected:** Less idiomatic for React applications.

### Option C: D3.js Direct Integration

**Pros:**
- Maximum customization
- Already have d3-scale and d3-shape installed
- Industry standard for complex visualizations

**Cons:**
- Steep learning curve
- Manual DOM manipulation (anti-pattern in React)
- Significantly more development time
- Overkill for standard business charts

**Rejected:** Too complex for our needs. Reserve D3 for future custom visualizations if needed.

## External Dependencies

### New Dependencies Required

**recharts** - Composable charting library for React
- **Version:** ^2.10.0 (latest stable)
- **Justification:** Primary charting library for all visualizations. Provides radar, bar, area, and composed charts with responsive design and TypeScript support.
- **Bundle Impact:** ~85KB gzipped

**@google/generative-ai** - Google Gemini SDK
- **Version:** ^0.1.3 (latest stable)
- **Justification:** Infrastructure for future AI image generation (Phase 2). Install now to establish integration patterns.
- **Bundle Impact:** ~15KB gzipped
- **Note:** Usage deferred to Phase 2; install only for future compatibility

## Component Architecture

### New Component Structure

```
components/reports/
├── charts/
│   ├── RadarChart.tsx          # Multi-pillar comparison
│   ├── DimensionBarChart.tsx   # Individual dimension scores
│   ├── ProgressBar.tsx         # Maturity level indicator
│   └── index.ts                # Barrel export
├── ui/
│   ├── ScoreBadge.tsx          # Circular score display with color
│   ├── PriorityTag.tsx         # Inline priority badge
│   ├── QuoteCard.tsx           # Stakeholder quote display
│   ├── CalloutBox.tsx          # Highlighted insight box
│   ├── MetricCard.tsx          # Dashboard metric card
│   └── index.ts                # Barrel export
├── sections/
│   ├── ExecutiveSummary.tsx    # Hero section with score + metrics
│   ├── DimensionalAnalysis.tsx # Pillar/dimension charts
│   ├── Recommendations.tsx     # Strategic recommendations
│   └── index.ts                # Barrel export
└── ReportGenerationPanel.tsx  # Existing component

```

### Data Flow

```
Synthesis Data (from API)
    ↓
lib/chart-data-transformers.ts
    ↓
Chart-Ready Data Structures
    ↓
Chart Components (Recharts)
    ↓
Rendered Visualizations
```

## New Utility Files

### lib/chart-data-transformers.ts

**Purpose:** Convert ReadinessAssessment data into Recharts-compatible formats

**Functions:**
```typescript
// Radar chart data for pillar comparison
transformToRadarData(pillars: Pillar[]): RadarDataPoint[]

// Bar chart data for dimension scores
transformToDimensionBarData(dimensions: Dimension[]): BarDataPoint[]

// Progress bar data for maturity levels
transformToProgressData(score: number): ProgressDataPoint

// Dashboard metric cards
transformToMetricCards(assessment: ReadinessAssessment): MetricCard[]
```

### lib/download-utils.ts

**Purpose:** Handle PDF and Markdown downloads from report viewer

**Functions:**
```typescript
// Generate context-aware filename with access token
generateReportFilename(companyName: string, campaignName: string, token: string, format: 'pdf' | 'md'): string

// Trigger browser download
downloadReport(url: string, filename: string): Promise<void>
```

## Integration Points

### Modified Files

**app/reports/[token]/page.tsx** - **MAJOR REFACTOR**
- Replace text-heavy sections with chart components
- Add download buttons to page header
- Integrate ExecutiveSummary, DimensionalAnalysis, Recommendations sections
- Add lazy loading for chart components

**lib/report-generator.ts** - **ADD FUNCTIONS**
- Keep existing markdown generation
- Add chart data transformation exports
- Add download utility exports

**components/reports/ReportGenerationPanel.tsx** - **MINOR CHANGE**
- Remove download button UI (move to report page)
- Keep report generation logic intact

**package.json** - **ADD DEPENDENCIES**
- recharts: ^2.10.0
- @google/generative-ai: ^0.1.3 (infrastructure only)

## TypeScript Interfaces

### Chart Data Types

```typescript
// Radar chart
interface RadarDataPoint {
  axis: string          // Pillar name (Technology, Process, Organization)
  value: number         // Score 0-5
  fullMark: number      // Always 5
}

// Bar chart
interface BarDataPoint {
  dimension: string     // Dimension name
  score: number         // Score 0-5
  pillar: string        // Parent pillar
  priority: PriorityLevel
  color: string         // Color based on score
}

// Progress bar
interface ProgressDataPoint {
  current: number       // Current score
  target: number        // Next level threshold
  percentage: number    // Percentage to next level
  level: MaturityLevel
}

// Metric card
interface MetricCard {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color: string
}
```

## Color System

### Score-Based Colors (Consistent Across All Charts)

```typescript
const getScoreColor = (score: number): string => {
  if (score >= 4.0) return '#10b981'  // Green - High
  if (score >= 3.0) return '#eab308'  // Yellow - Medium-High
  if (score >= 2.0) return '#f97316'  // Orange - Medium-Low
  return '#ef4444'                     // Red - Low
}
```

### Priority Colors

```typescript
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return '#ef4444'      // Red
    case 'important': return '#f97316'     // Orange
    case 'foundational': return '#eab308'  // Yellow
    case 'opportunistic': return '#1D9BA3' // Teal
    default: return '#6b7280'              // Gray
  }
}
```

## Accessibility

### Basic Requirements

- All charts wrapped in `<figure>` with descriptive `<figcaption>`
- ARIA labels on interactive chart elements
- Keyboard navigation support for tooltips
- Color contrast ratio 4.5:1 minimum
- Screen reader-friendly data table fallbacks (hidden)

### Implementation

```tsx
<figure role="img" aria-label="Digital transformation readiness by pillar">
  <RadarChart data={radarData} />
  <figcaption>
    Radar chart showing Technology at 3.2, Process at 2.8, Organization at 3.5
  </figcaption>
</figure>
```

## Performance Optimizations

### Code Splitting

```tsx
// Lazy load chart components
const RadarChart = dynamic(() => import('@/components/reports/charts/RadarChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

### Memoization

```tsx
// Memoize expensive chart data transformations
const radarData = useMemo(
  () => transformToRadarData(pillars),
  [pillars]
)
```

### Bundle Analysis

- Recharts loaded only on report pages
- Chart components code-split from main bundle
- Expected bundle increase: ~100KB gzipped

## Error Handling

### Chart Rendering Errors

```tsx
<ErrorBoundary fallback={<ChartErrorFallback />}>
  <RadarChart data={radarData} />
</ErrorBoundary>
```

### Data Validation

- Validate synthesis data structure before transformation
- Provide fallback values for missing data
- Log errors to console in development

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

SVG support required (universally available in target browsers).

---

**Implementation Priority:** High
**Estimated Complexity:** Medium-High
**Risk Level:** Low (using battle-tested libraries)
