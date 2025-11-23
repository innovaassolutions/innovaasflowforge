# Spec Tasks

> Consulting-Grade Report Redesign
> Created: 2025-11-23
> Status: Ready for Implementation

## Task Breakdown

### Phase 1: Strategic Frameworks (Priority 1)

- [ ] 1. Priority Matrix Component
  - [ ] 1.1 Create data transformation logic (calculateImpact, calculateEffort)
  - [ ] 1.2 Build MatrixDimension interface and transformToMatrixData()
  - [ ] 1.3 Create PriorityMatrix SVG component with quadrants
  - [ ] 1.4 Add bubble rendering with hover tooltips
  - [ ] 1.5 Add quadrant labels and axis annotations
  - [ ] 1.6 Test with real assessment data

- [ ] 2. Capability Heat Map Component
  - [ ] 2.1 Create HeatMapCell interface and transformToHeatMapData()
  - [ ] 2.2 Build CapabilityHeatMap component with CSS Grid
  - [ ] 2.3 Implement color intensity based on score
  - [ ] 2.4 Add row/column headers
  - [ ] 2.5 Add hover tooltips showing gap to target
  - [ ] 2.6 Test responsive behavior

- [ ] 3. Transformation Roadmap Component
  - [ ] 3.1 Create RoadmapInitiative interface and transformToRoadmapData()
  - [ ] 3.2 Build TransformationRoadmap component with timeline
  - [ ] 3.3 Render horizontal bars for initiatives
  - [ ] 3.4 Add dependency arrows between initiatives
  - [ ] 3.5 Color code by type (quick-win/strategic/transformative)
  - [ ] 3.6 Add phase groupings (Foundation/Build/Scale)

### Phase 2: AI Integration (Priority 1)

- [ ] 4. Google Gemini Client Setup
  - [ ] 4.1 Create lib/ai/gemini-client.ts with GoogleGenerativeAI
  - [ ] 4.2 Implement generateIllustration() with style options
  - [ ] 4.3 Create extractSVG() utility for parsing responses
  - [ ] 4.4 Add error handling and fallbacks
  - [ ] 4.5 Test with sample prompts

- [ ] 5. Illustration Cache System
  - [ ] 5.1 Create lib/ai/illustration-cache.ts with Map-based cache
  - [ ] 5.2 Implement getCachedIllustration() and cacheIllustration()
  - [ ] 5.3 Add 24-hour expiry logic
  - [ ] 5.4 Create cache warming strategy

- [ ] 6. Pillar Illustration Generator
  - [ ] 6.1 Create lib/ai/illustration-prompts.ts with prompt templates
  - [ ] 6.2 Implement getPillarIllustrationPrompt() for each pillar
  - [ ] 6.3 Create useAIIllustration() React hook
  - [ ] 6.4 Build IllustrationPlaceholder component
  - [ ] 6.5 Test generation for all three pillars

### Phase 3: Premium Layout System (Priority 2)

- [ ] 7. Multi-Column Grid System
  - [ ] 7.1 Extend Tailwind config with consulting grid classes
  - [ ] 7.2 Create ConsultingLayout component
  - [ ] 7.3 Add grid column span utilities (full/main/sidebar/bleed)
  - [ ] 7.4 Test responsive breakpoints
  - [ ] 7.5 Add CSS for consulting-grid classes

- [ ] 8. Typography Scale
  - [ ] 8.1 Extend Tailwind fontSize config (display/headline/title/subtitle)
  - [ ] 8.2 Create Typography component wrappers (if needed)
  - [ ] 8.3 Apply to existing components
  - [ ] 8.4 Test hierarchy and readability

- [ ] 9. White Space System
  - [ ] 9.1 Define consulting-margin and consulting-gutter spacing
  - [ ] 9.2 Apply generous padding (80-100pt) to page sections
  - [ ] 9.3 Add visual dividers between sections
  - [ ] 9.4 Test breathing room and visual balance

### Phase 4: Executive One-Pager (Priority 1)

- [ ] 10. Hero Metric Component
  - [ ] 10.1 Create HeroMetric component with large score display
  - [ ] 10.2 Add maturity level label and context
  - [ ] 10.3 Style with gradient and visual emphasis
  - [ ] 10.4 Add "so what?" insight below score

- [ ] 11. Strategic Imperatives Display
  - [ ] 11.1 Create extractTopImperatives() utility (top 3 from matrix)
  - [ ] 11.2 Build ImperativesList component
  - [ ] 11.3 Display with icons and impact indicators
  - [ ] 11.4 Add visual hierarchy (1, 2, 3 numbering)

- [ ] 12. Mini Roadmap Component
  - [ ] 12.1 Create MiniRoadmap simplified version
  - [ ] 12.2 Show 3 phases with progress bars
  - [ ] 12.3 Add week markers (0-52)
  - [ ] 12.4 Color code by phase

- [ ] 13. Executive One-Pager Assembly
  - [ ] 13.1 Create ExecutiveOnePager section component
  - [ ] 13.2 Assemble HeroMetric + Matrix + Imperatives + Roadmap
  - [ ] 13.3 Apply consulting grid layout
  - [ ] 13.4 Test full-page composition
  - [ ] 13.5 Ensure 60-second comprehension target

### Phase 5: Enhanced Recommendations (Priority 2)

- [ ] 14. Recommendation Scoring
  - [ ] 14.1 Add impact/effort scoring to recommendation generation
  - [ ] 14.2 Create RecommendationCard interface with scores
  - [ ] 14.3 Build enhanced RecommendationCard component
  - [ ] 14.4 Add timeline indicators (0-3mo / 3-6mo / 6-12mo)
  - [ ] 14.5 Show dependencies between recommendations

- [ ] 15. Recommendation Grouping
  - [ ] 15.1 Group recommendations by strategic theme
  - [ ] 15.2 Create ThemeGroup component
  - [ ] 15.3 Add visual theme indicators
  - [ ] 15.4 Sequence for maximum impact (quick wins first)

### Phase 6: Page Structure (Priority 2)

- [ ] 16. Page-Based Navigation
  - [ ] 16.1 Create page sections (Executive / Current State / Analysis / Insights / Recommendations / Roadmap)
  - [ ] 16.2 Add sticky navigation header with page indicators
  - [ ] 16.3 Implement smooth scroll between pages
  - [ ] 16.4 Add "next page" affordances

- [ ] 17. Current State Page
  - [ ] 17.1 Create CurrentStatePage component
  - [ ] 17.2 Show overall assessment summary
  - [ ] 17.3 Display pillar scores with AI illustrations
  - [ ] 17.4 Add strategic context

- [ ] 18. Strategic Insights Page
  - [ ] 18.1 Create generateStrategicInsights() utility
  - [ ] 18.2 Build StrategicInsightsPage component
  - [ ] 18.3 Display key themes with visual treatment
  - [ ] 18.4 Show contradictions and alignment
  - [ ] 18.5 Add annotated frameworks

### Phase 7: Visual Polish (Priority 3)

- [ ] 19. Annotated Chart Insights
  - [ ] 19.1 Add "So what?" callouts to all major charts
  - [ ] 19.2 Create Annotation component with arrow pointing
  - [ ] 19.3 Position strategically on charts
  - [ ] 19.4 Use pull-quote styling

- [ ] 20. Visual Dividers
  - [ ] 20.1 Create SectionDivider component
  - [ ] 20.2 Design with subtle visual interest (gradient line, icon)
  - [ ] 20.3 Add between major sections
  - [ ] 20.4 Maintain white space

- [ ] 21. Pull Quotes
  - [ ] 21.1 Enhance QuoteCard with consulting styling
  - [ ] 21.2 Add large quotation marks
  - [ ] 21.3 Use sidebar placement in multi-column layout
  - [ ] 21.4 Select most impactful stakeholder quotes

### Phase 8: Integration & Testing (Priority 3)

- [ ] 22. Report Page Integration
  - [ ] 22.1 Update app/reports/[token]/page.tsx with new structure
  - [ ] 22.2 Replace current sections with page-based layout
  - [ ] 22.3 Add ExecutiveOnePager as first page
  - [ ] 22.4 Lazy load strategic frameworks
  - [ ] 22.5 Test navigation flow

- [ ] 23. AI Generation Testing
  - [ ] 23.1 Test illustration generation for all pillars
  - [ ] 23.2 Verify caching works correctly
  - [ ] 23.3 Test fallback behavior when generation fails
  - [ ] 23.4 Measure generation time (<10 seconds target)

- [ ] 24. Responsive Testing
  - [ ] 24.1 Test desktop layout (1440px+)
  - [ ] 24.2 Test tablet simplified layout (768-1439px)
  - [ ] 24.3 Test mobile single-column (375-767px)
  - [ ] 24.4 Verify all frameworks adapt appropriately

- [ ] 25. Visual Quality Review
  - [ ] 25.1 Compare to McKinsey/BCG report samples
  - [ ] 25.2 Check typography hierarchy (3+ levels clear)
  - [ ] 25.3 Verify white space (80-100pt margins)
  - [ ] 25.4 Ensure color usage is strategic
  - [ ] 25.5 Test AI illustration quality

- [ ] 26. Performance Optimization
  - [ ] 26.1 Lazy load frameworks and AI components
  - [ ] 26.2 Memoize expensive transformations
  - [ ] 26.3 Optimize SVG rendering
  - [ ] 26.4 Measure page load (<5 seconds with AI)
  - [ ] 26.5 Test with slow network (throttled)

- [ ] 27. Accessibility Verification
  - [ ] 27.1 Add aria-labels to all strategic frameworks
  - [ ] 27.2 Test keyboard navigation
  - [ ] 27.3 Verify color contrast on new components
  - [ ] 27.4 Test screen reader announcements
  - [ ] 27.5 Add focus indicators

### Phase 9: Documentation (Priority 3)

- [ ] 28. Update Documentation
  - [ ] 28.1 Document new components in README
  - [ ] 28.2 Create visual examples for each framework
  - [ ] 28.3 Document AI generation usage
  - [ ] 28.4 Add consulting layout guidelines
  - [ ] 28.5 Update acceptance criteria verification

## Estimated Timeline

- **Phase 1 (Frameworks)**: 5-6 days
- **Phase 2 (AI)**: 2-3 days
- **Phase 3 (Layout)**: 2 days
- **Phase 4 (One-Pager)**: 3 days
- **Phase 5 (Recommendations)**: 2 days
- **Phase 6 (Pages)**: 3 days
- **Phase 7 (Polish)**: 2 days
- **Phase 8 (Testing)**: 3 days
- **Phase 9 (Docs)**: 1 day

**Total**: 23-26 days (4-5 weeks)

## Dependencies

- Google Gemini API key configured (✅ Already done)
- Current visualization components (✅ Already built)
- Recharts library (✅ Already installed)
- Assessment data structure (✅ Already defined)

## Success Criteria

- [ ] Report looks indistinguishable from McKinsey/BCG presentation
- [ ] Executive one-pager conveys strategy in 60 seconds
- [ ] All strategic frameworks render correctly
- [ ] AI illustrations generate successfully (80%+ success rate)
- [ ] Performance remains <5 seconds total load
- [ ] Responsive design works on all devices
- [ ] Accessibility standards met (WCAG AA)
