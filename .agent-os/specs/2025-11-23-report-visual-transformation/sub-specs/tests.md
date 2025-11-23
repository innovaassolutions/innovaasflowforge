# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-11-23-report-visual-transformation/spec.md

> Created: 2025-11-23
> Version: 1.0.0

## Test Coverage

### Unit Tests

**lib/chart-data-transformers.ts**
- `transformToRadarData()` returns correct RadarDataPoint array structure
- `transformToRadarData()` handles empty pillars array gracefully
- `transformToRadarData()` calculates fullMark as 5 for all data points
- `transformToDimensionBarData()` flattens nested dimension data correctly
- `transformToDimensionBarData()` applies correct score colors based on value
- `transformToDimensionBarData()` preserves priority and pillar metadata
- `transformToProgressData()` calculates percentage correctly for all score ranges
- `transformToProgressData()` identifies correct maturity level for each score
- `transformToMetricCards()` generates 3-5 metric cards from assessment data
- `transformToMetricCards()` includes correct icons for each metric type

**lib/download-utils.ts**
- `generateReportFilename()` includes access token in filename
- `generateReportFilename()` sanitizes company and campaign names
- `generateReportFilename()` appends correct file extension (.pdf or .md)
- `generateReportFilename()` handles special characters in names
- `downloadReport()` triggers browser download with correct filename
- `downloadReport()` handles download errors gracefully

**lib/report-generator.ts** (existing helper functions)
- `getScoreColor()` returns green for scores 4.0-5.0
- `getScoreColor()` returns yellow for scores 3.0-3.9
- `getScoreColor()` returns orange for scores 2.0-2.9
- `getScoreColor()` returns red for scores 0-1.9
- `getPriorityColor()` returns correct color for each priority level
- `getConfidenceColor()` returns correct color for each confidence level

### Component Tests

**components/reports/charts/RadarChart.tsx**
- Renders Recharts RadarChart component
- Displays correct number of axes (3 for pillars)
- Shows data points with correct values
- Applies score-based colors to data areas
- Displays tooltip on hover with pillar name and score
- Handles empty data array without crashing
- Renders accessible ARIA labels
- Responsive: adjusts size based on container width

**components/reports/charts/DimensionBarChart.tsx**
- Renders horizontal bars for all dimensions
- Bars are color-coded by score value
- Displays dimension names on Y-axis
- Shows score values (0-5) on X-axis
- Priority badges visible next to dimension names
- Tooltip shows dimension, score, priority, pillar on hover
- Handles dimensions with missing data gracefully
- Sorts dimensions by pillar grouping

**components/reports/charts/ProgressBar.tsx**
- Displays filled bar representing current score percentage
- Shows current score and next level threshold
- Includes maturity level label
- Color changes based on score range
- Handles edge cases (score = 0, score = 5)
- Animates progress bar fill on mount (optional)

**components/reports/ui/ScoreBadge.tsx**
- Renders circular badge with score value
- Background gradient uses brand colors
- Text color contrasts with background (WCAG AA)
- Size prop controls badge dimensions
- Displays score with one decimal place (e.g., "3.2")
- Handles edge values (0.0, 5.0) correctly

**components/reports/ui/PriorityTag.tsx**
- Displays inline badge with priority text
- Background color matches priority level (critical=red, etc.)
- Text is uppercase for emphasis
- Padding and border-radius match design system
- Supports all priority levels: critical, important, foundational, opportunistic

**components/reports/ui/QuoteCard.tsx**
- Renders quote text with quotation marks
- Shows stakeholder name and title below quote
- Left border uses brand teal color
- Italic font style for quote text
- Truncates long quotes with "..." (optional)
- Handles missing attribution data gracefully

**components/reports/ui/CalloutBox.tsx**
- Renders content with themed border
- Background uses subtle alpha transparency
- Icon displayed if provided (Lucide icon)
- Supports variant prop (info, warning, success, critical)
- Border color changes based on variant
- Accessible role and ARIA labels

**components/reports/ui/MetricCard.tsx**
- Displays metric label and value
- Shows icon in brand color
- Trend indicator (up/down/neutral arrow) if provided
- Compact card design fits dashboard grid
- Handles numeric and string values
- Tooltip shows additional context on hover

**components/reports/sections/ExecutiveSummary.tsx**
- Renders hero header with company name
- Displays large overall score badge
- Shows 3-5 metric cards in grid
- Includes executive summary text
- Critical finding callout box visible
- Gradient background applied to header
- Responsive: stacks on mobile, grid on desktop

**components/reports/sections/DimensionalAnalysis.tsx**
- Displays pillar cards with mini scores
- Shows radar chart for pillar comparison
- Lists dimensions under each pillar
- Each dimension has bar chart
- Progress bars for gap-to-next
- Expandable detailed findings (if tier permits)
- Handles basic/informative/premium tier content rules

**components/reports/sections/Recommendations.tsx**
- Displays numbered recommendations
- Each recommendation has impact/effort indicators (if data available)
- Priority ranking visual (icon or color coding)
- Timeline info displayed if present
- Success metrics shown if available
- Handles empty recommendations array

### Integration Tests

**app/reports/[token]/page.tsx**
- Fetches report data on mount with valid token
- Displays loading state while fetching
- Shows error state if token is invalid
- Renders ExecutiveSummary section with correct data
- Renders DimensionalAnalysis section with charts
- Renders Recommendations section (if tier permits)
- Download buttons visible in page header
- PDF download triggers with correct filename
- Markdown download triggers with correct filename
- Tier-based content filtering works (basic/informative/premium)
- Responsive layout adjusts for mobile/tablet/desktop
- Navigation works between sections (if anchor links added)

**Report Generation Flow**
- Generate report from campaign panel
- Navigate to report URL
- Verify all charts render correctly
- Verify download buttons work
- Test regeneration updates chart data
- Verify tier changes affect visible content

### Visual Regression Tests

**Chart Rendering**
- Radar chart appearance snapshot
- Bar chart appearance snapshot
- Progress bar appearance snapshot
- Score badge appearance snapshot
- Metric card grid snapshot
- Executive summary section snapshot
- Dimensional analysis section snapshot

### Accessibility Tests

**Keyboard Navigation**
- Tab through interactive elements in logical order
- Download buttons accessible via keyboard
- Chart tooltips accessible via keyboard focus
- No keyboard traps

**Screen Reader**
- ARIA labels present on all charts
- Figcaptions provide chart context
- Interactive elements have accessible names
- Error messages announced

**Color Contrast**
- All text meets WCAG AA (4.5:1)
- Chart colors distinguishable
- Focus indicators visible

## Mocking Requirements

### Mocked APIs

**Report Data Fetch**
```typescript
// Mock successful report fetch
mockFetch('/api/reports/[token]', {
  success: true,
  report: mockReportData
})

// Mock error states
mockFetch('/api/reports/invalid-token', {
  success: false,
  error: 'Report not found'
})
```

### Mocked Components

**Recharts**
```typescript
// Mock Recharts components for unit tests
jest.mock('recharts', () => ({
  RadarChart: ({ children }) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  // etc.
}))
```

### Test Data

**Mock Synthesis Data**
```typescript
const mockAssessment: ReadinessAssessment = {
  overallScore: 3.2,
  pillars: [
    {
      pillar: 'Technology',
      score: 3.5,
      dimensions: [
        {
          dimension: 'Digital Infrastructure',
          score: 3.8,
          confidence: 'high',
          priority: 'critical',
          keyFindings: ['Finding 1', 'Finding 2'],
          supportingQuotes: ['Quote 1'],
          gapToNext: 'Implement API gateway'
        },
        // ... more dimensions
      ]
    },
    // ... more pillars
  ],
  executiveSummary: 'Test summary...',
  keyThemes: ['Theme 1', 'Theme 2'],
  contradictions: [],
  recommendations: ['Recommendation 1', 'Recommendation 2'],
  stakeholderPerspectives: []
}
```

## Test Execution Strategy

### Pre-Commit
- Run unit tests for modified files
- Check TypeScript compilation
- Lint modified files

### CI Pipeline
- Run all unit tests
- Run integration tests
- Visual regression tests (on main branch only)
- Accessibility tests
- Build verification

### Manual Testing Checklist

**Before Marking Complete:**
- [ ] Load report page in Chrome, Firefox, Safari
- [ ] Test on mobile device (iOS/Android)
- [ ] Verify all charts render with real data
- [ ] Download PDF and verify content
- [ ] Download Markdown and verify formatting
- [ ] Test with basic, informative, and premium tiers
- [ ] Verify color-coded scores match traffic light system
- [ ] Check console for errors or warnings
- [ ] Test with slow network (throttled)
- [ ] Verify loading states appear correctly

---

**Test Coverage Target:** 80%+ for new code
**Critical Paths:** Report data fetch, chart rendering, downloads
