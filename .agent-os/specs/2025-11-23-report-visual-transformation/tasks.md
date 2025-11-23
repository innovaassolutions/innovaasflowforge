# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-11-23-report-visual-transformation/spec.md

> Created: 2025-11-23
> Status: Ready for Implementation

## Tasks

- [ ] 1. Install Dependencies and Setup Infrastructure
  - [ ] 1.1 Write test for recharts import (verify installation)
  - [ ] 1.2 Install recharts package (`npm install recharts`)
  - [ ] 1.3 Install @google/generative-ai package (`npm install @google/generative-ai`)
  - [ ] 1.4 Create component folder structure (charts/, ui/, sections/)
  - [ ] 1.5 Create lib/chart-data-transformers.ts file stub
  - [ ] 1.6 Create lib/download-utils.ts file stub
  - [ ] 1.7 Verify all tests pass

- [ ] 2. Build Data Transformation Layer
  - [ ] 2.1 Write tests for transformToRadarData()
  - [ ] 2.2 Implement transformToRadarData() function
  - [ ] 2.3 Write tests for transformToDimensionBarData()
  - [ ] 2.4 Implement transformToDimensionBarData() function
  - [ ] 2.5 Write tests for transformToProgressData()
  - [ ] 2.6 Implement transformToProgressData() function
  - [ ] 2.7 Write tests for transformToMetricCards()
  - [ ] 2.8 Implement transformToMetricCards() function
  - [ ] 2.9 Verify all data transformer tests pass

- [ ] 3. Create Chart Components
  - [ ] 3.1 Write tests for RadarChart component
  - [ ] 3.2 Implement RadarChart component with Recharts
  - [ ] 3.3 Write tests for DimensionBarChart component
  - [ ] 3.4 Implement DimensionBarChart component with Recharts
  - [ ] 3.5 Write tests for ProgressBar component
  - [ ] 3.6 Implement ProgressBar component (CSS-based, not Recharts)
  - [ ] 3.7 Create charts/index.ts barrel export
  - [ ] 3.8 Verify all chart component tests pass

- [ ] 4. Create UI Components
  - [ ] 4.1 Write tests for ScoreBadge component
  - [ ] 4.2 Implement ScoreBadge component
  - [ ] 4.3 Write tests for PriorityTag component
  - [ ] 4.4 Implement PriorityTag component
  - [ ] 4.5 Write tests for QuoteCard component
  - [ ] 4.6 Implement QuoteCard component
  - [ ] 4.7 Write tests for CalloutBox component
  - [ ] 4.8 Implement CalloutBox component
  - [ ] 4.9 Write tests for MetricCard component
  - [ ] 4.10 Implement MetricCard component
  - [ ] 4.11 Create ui/index.ts barrel export
  - [ ] 4.12 Verify all UI component tests pass

- [ ] 5. Create Section Components
  - [ ] 5.1 Write tests for ExecutiveSummary component
  - [ ] 5.2 Implement ExecutiveSummary section with ScoreBadge and MetricCards
  - [ ] 5.3 Write tests for DimensionalAnalysis component
  - [ ] 5.4 Implement DimensionalAnalysis section with RadarChart and BarCharts
  - [ ] 5.5 Write tests for Recommendations component
  - [ ] 5.6 Implement Recommendations section with visual indicators
  - [ ] 5.7 Create sections/index.ts barrel export
  - [ ] 5.8 Verify all section component tests pass

- [ ] 6. Implement Download Utilities
  - [ ] 6.1 Write tests for generateReportFilename()
  - [ ] 6.2 Implement generateReportFilename() with token in filename
  - [ ] 6.3 Write tests for downloadReport()
  - [ ] 6.4 Implement downloadReport() browser download trigger
  - [ ] 6.5 Verify all download utility tests pass

- [ ] 7. Refactor Report Viewer Page
  - [ ] 7.1 Write integration tests for report page with charts
  - [ ] 7.2 Import all section components into report page
  - [ ] 7.3 Replace executive summary section with ExecutiveSummary component
  - [ ] 7.4 Replace pillar/dimension sections with DimensionalAnalysis component
  - [ ] 7.5 Replace recommendations section with Recommendations component
  - [ ] 7.6 Add download buttons to page header (PDF and Markdown)
  - [ ] 7.7 Implement lazy loading for chart components
  - [ ] 7.8 Test responsive layout on mobile, tablet, desktop
  - [ ] 7.9 Verify all integration tests pass

- [ ] 8. Update Report Generation Panel
  - [ ] 8.1 Remove download button UI from ReportGenerationPanel
  - [ ] 8.2 Keep report generation logic intact
  - [ ] 8.3 Test report generation still works correctly
  - [ ] 8.4 Verify panel tests pass

- [ ] 9. Visual and Accessibility Testing
  - [ ] 9.1 Manual test: Load report in Chrome, Firefox, Safari
  - [ ] 9.2 Manual test: View on mobile device
  - [ ] 9.3 Manual test: Test keyboard navigation
  - [ ] 9.4 Manual test: Verify color contrast with accessibility tools
  - [ ] 9.5 Manual test: Test screen reader announcements
  - [ ] 9.6 Manual test: Download PDF and verify content
  - [ ] 9.7 Manual test: Download Markdown and verify formatting
  - [ ] 9.8 Manual test: Test all three tiers (basic, informative, premium)
  - [ ] 9.9 Fix any visual or accessibility issues found

- [ ] 10. Performance Optimization and Polish
  - [ ] 10.1 Measure page load time with all charts
  - [ ] 10.2 Implement code splitting for Recharts if needed
  - [ ] 10.3 Add memoization to expensive transformations
  - [ ] 10.4 Test with slow network (throttled)
  - [ ] 10.5 Optimize bundle size (analyze with next-bundle-analyzer if needed)
  - [ ] 10.6 Verify <3s page load target met
  - [ ] 10.7 Run final test suite
  - [ ] 10.8 Verify all acceptance criteria from spec.md
