# Spec Requirements Document

> Spec: Report Visual Transformation
> Created: 2025-11-23
> Status: Planning

## Overview

Transform the current text-heavy report system into a visual-first consulting report experience that matches McKinsey, BCG, PWC, and Accenture quality standards. Replace dense paragraphs with interactive charts, data visualizations, and AI-generated imagery to create professional, high-impact assessment reports.

## User Stories

### Story 1: Visual Executive Summary

As a **consultant**, I want the executive summary to display a prominent hero score with visual dashboard cards, so that clients immediately grasp their overall transformation readiness at a glance.

**Workflow:**
1. Consultant generates report for client
2. Client accesses shareable report URL
3. Executive summary displays with:
   - Large, color-coded overall score badge
   - 3-5 key metric cards with icons
   - Pillar scores with mini visual indicators
   - Critical finding callout box
4. Client understands status within 30 seconds

**Problem Solved:** Eliminates confusion from text-dense summaries. Clients get immediate visual understanding of their readiness level.

### Story 2: Interactive Dimensional Charts

As a **client organization**, I want to see my dimensional scores as interactive charts (radar, bar, progress), so that I can quickly identify strengths, gaps, and areas requiring attention without reading lengthy paragraphs.

**Workflow:**
1. Client navigates to dimensional analysis section
2. Views pillar-level radar chart showing multi-dimensional comparison
3. Sees individual dimension bar charts with color-coded scores
4. Interacts with progress bars showing path to next maturity level
5. Clicks dimension for detailed findings (expandable)

**Problem Solved:** Visual pattern recognition is faster than text parsing. Stakeholders can identify priorities instantly.

### Story 3: Stakeholder Perspective Comparisons

As a **facilitator**, I want stakeholder perspectives displayed in comparison views with divergence indicators, so that I can highlight alignment gaps and consensus areas to drive productive client conversations.

**Workflow:**
1. Facilitator reviews stakeholder perspectives section
2. Sees side-by-side comparison cards
3. Identifies divergence indicators (red flags)
4. Notes consensus areas (green highlights)
5. Uses visual insights to guide strategic discussions

**Problem Solved:** Makes stakeholder alignment visible. Facilitates data-driven conversations about organizational readiness.

## Spec Scope

1. **Chart Component Library** - Reusable React components for radar charts, bar charts, progress bars, heat maps, and trend lines using Recharts
2. **UI Component Library** - Score badges, priority tags, quote cards, callout boxes, and metric cards with consistent styling
3. **Web Report Redesign** - Transform report viewer page with visual-first layout, interactive charts, and expandable sections
4. **Data Transformation Layer** - Utilities to convert synthesis data into chart-ready formats
5. **Download Functionality** - Move PDF/Markdown download buttons from campaign panel to report viewer page with context-aware naming

## Out of Scope

- **PDF Chart Embedding** - Will remain text-based for now (SVG integration is complex, defer to future phase)
- **AI Image Generation** - Google Gemini integration deferred to Phase 2 (infrastructure only in this phase)
- **Advanced Interactivity** - Drill-down interactions, chart filters, and animation effects (defer to Phase 2)
- **Mobile Optimization** - Basic responsive design only; deep mobile UX refinements deferred
- **Accessibility Enhancements** - WCAG 2.1 AA compliance audit deferred (implement basics only)

## Expected Deliverable

1. **Browsable Visual Report** - Navigate to report URL and see transformed visual layout with radar chart, bar charts, and progress indicators
2. **Interactive Charts** - Hover over chart elements to see tooltips with detailed data
3. **Download Buttons** - Click PDF or Markdown download buttons on report page (not campaign panel) and receive properly named files
4. **Responsive Design** - View report on desktop (1024px+) with multi-column layout; tablet/mobile stacks vertically
5. **Color-Coded Scores** - All scores use traffic light system (green 4-5, yellow 3-4, orange 2-3, red 0-2) consistently across all visualizations

---

## Spec Documentation

- Tasks: @.agent-os/specs/2025-11-23-report-visual-transformation/tasks.md
- Technical Specification: @.agent-os/specs/2025-11-23-report-visual-transformation/sub-specs/technical-spec.md
- Tests Specification: @.agent-os/specs/2025-11-23-report-visual-transformation/sub-specs/tests.md

## Related Documentation

- Current State Analysis: @docs/report-visualization-analysis.md
- Design Guidelines: @docs/report-design-guidelines.md
- PDF Design Guidelines: @docs/pdf-design-guidelines.md
