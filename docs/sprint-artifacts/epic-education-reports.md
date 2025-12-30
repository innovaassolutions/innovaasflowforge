# innovaasflowforge - Epic Breakdown

**Date:** 2025-12-30
**Project Level:** Quick Flow (Brownfield)
**Tech Spec:** [tech-spec-education-reports.md](../tech-spec-education-reports.md)

---

## Epic 1: Education Synthesis Reports

**Slug:** education-reports

### Goal

Enable school leadership to access actionable institutional intelligence from stakeholder interviews through an executive dashboard-style report system with secure sharing, color-coded Four Lenses visualization, triangulation insights, and longitudinal trend analysis.

### Scope

**In Scope:**
- API endpoints for synthesis generation and report access
- Secure token-based report sharing
- Dashboard UI for report generation (school detail page)
- Executive dashboard report landing page
- Color-coded Four Lenses cards (holding/slipping/misunderstood/at-risk)
- Stakeholder participation donut chart
- Triangulation alignment/divergence visualization
- Urgency level gauge
- Recommendations timeline display
- Confidential safeguarding section with notification
- Longitudinal comparison (term-over-term trends)

**Out of Scope:**
- PDF export
- Multi-tier reports
- Real-time regeneration
- Report versioning
- Client commenting

### Success Criteria

1. School contact or Innovaas admin can generate synthesis report for completed campaigns
2. Reports accessible via secure 256-bit token URL
3. Executive dashboard displays all visualizations correctly
4. Four Lenses cards color-coded and readable
5. Safeguarding section only visible when signals present
6. Safeguarding lead receives email notification
7. Longitudinal comparison shows trends across terms
8. Pearl Vibrant theme applied consistently
9. Mobile responsive
10. TypeScript compiles without errors

### Dependencies

- **Internal:**
  - Education synthesis agent (lib/agents/education-synthesis-agent.ts) - EXISTS
  - Schools system with safeguarding config - EXISTS
  - Campaigns with education_config - EXISTS
  - Resend email service - CONFIGURED

- **External:**
  - None (all dependencies already in place)

---

## Story Map - Epic 1

```
Epic: Education Synthesis Reports (12 points)
│
├── Story 1.1: Database & API Foundation (3 points)
│   Dependencies: None
│   Deliverables: Tables, RLS, 3 API endpoints
│
├── Story 1.2: Dashboard UI & Report Generation (2 points)
│   Dependencies: Story 1.1
│   Deliverables: ReportGenerationPanel, school page integration
│
├── Story 1.3: Report Landing Page & Visualizations (5 points)
│   Dependencies: Story 1.2
│   Deliverables: Public report page, all chart components
│
└── Story 1.4: Longitudinal & Safeguarding Notifications (2 points)
    Dependencies: Stories 1.1, 1.2, 1.3
    Deliverables: Trend chart, email notifications, longitudinal API
```

---

## Stories - Epic 1

### Story 1.1: Database & API Foundation

As a **developer**,
I want **database tables and API endpoints for education synthesis and reports**,
So that **the system can store synthesis results and provide secure token-based access**.

**Acceptance Criteria:**

AC #1: Given the database is migrated, when I query education_synthesis, then the table exists with correct schema
AC #2: Given a completed campaign, when POST /api/education/synthesis is called, then synthesis is generated and stored
AC #3: Given a synthesis exists, when POST /api/education/reports is called, then a report with access token is created
AC #4: Given a valid token, when GET /api/education/reports/[token] is called, then the full report data is returned
AC #5: Given an invalid token, when GET /api/education/reports/[token] is called, then 404 is returned

**Prerequisites:** None

**Technical Notes:** Uses existing synthesis agent, follows consulting report patterns

**Estimated Effort:** 3 points (~2 days)

---

### Story 1.2: Dashboard UI & Report Generation

As a **school administrator**,
I want **to generate and access synthesis reports from the school dashboard**,
So that **I can easily create reports for completed campaigns and share them with leadership**.

**Acceptance Criteria:**

AC #1: Given I'm on a school detail page, when a campaign has completed sessions, then I see a "Generate Report" button
AC #2: Given I click "Generate Report", when synthesis succeeds, then I see a shareable URL with copy button
AC #3: Given a report exists, when I view the school page, then I see the report status and access URL
AC #4: Given loading state, when generation is in progress, then a spinner is displayed

**Prerequisites:** Story 1.1

**Technical Notes:** Follows existing school dashboard patterns, Pearl Vibrant theme

**Estimated Effort:** 2 points (~1 day)

---

### Story 1.3: Report Landing Page & Visualizations

As a **school leader**,
I want **to view an executive dashboard report via secure link**,
So that **I can quickly understand institutional health across the Four Lenses with visual charts**.

**Acceptance Criteria:**

AC #1: Given a valid token, when I access /education/report/[token], then the report page loads
AC #2: Given report data, when page renders, then Four Lenses cards display with correct colors (green/amber/orange/red)
AC #3: Given stakeholder data, when page renders, then donut chart shows participation breakdown
AC #4: Given triangulation data, when page renders, then aligned/divergent themes are visualized
AC #5: Given urgency level, when page renders, then gauge displays correct level
AC #6: Given recommendations, when page renders, then timeline groups by immediate/short-term/strategic
AC #7: Given safeguarding_signals > 0, when page renders, then confidential section is visible
AC #8: Given safeguarding_signals == 0, when page renders, then confidential section is hidden
AC #9: Given mobile device, when page loads, then layout is responsive

**Prerequisites:** Stories 1.1, 1.2

**Technical Notes:** SVG-based charts with d3-scale, Pearl Vibrant theme, no external chart libraries

**Estimated Effort:** 5 points (~3 days)

---

### Story 1.4: Longitudinal Comparison & Safeguarding Notifications

As a **school leader**,
I want **to see trends across multiple terms and receive safeguarding alerts**,
So that **I can track institutional health over time and ensure safety concerns are escalated**.

**Acceptance Criteria:**

AC #1: Given multiple syntheses for same school/module, when report loads, then longitudinal trend chart displays
AC #2: Given trend data, when chart renders, then lines show holding/slipping/risk scores over time
AC #3: Given safeguarding_signals > 0, when report is generated, then safeguarding lead receives email
AC #4: Given email is sent, when lead clicks link, then they land on #safeguarding section
AC #5: Given no prior syntheses, when report loads, then longitudinal section shows "First assessment - no comparison data"

**Prerequisites:** Stories 1.1, 1.2, 1.3

**Technical Notes:** Implements generateLongitudinalComparison() stub, uses Resend for email

**Estimated Effort:** 2 points (~1 day)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 12 points

**Estimated Timeline:** 5-7 working days

**Recommended Sequence:**
1. Story 1.1 (Foundation) - Start immediately
2. Story 1.2 (Dashboard UI) - After 1.1 complete
3. Story 1.3 (Report Page) - After 1.2 complete (longest story)
4. Story 1.4 (Longitudinal & Notifications) - After 1.3 complete

---

**Implementation Ready:** Stories reference [tech-spec-education-reports.md](../tech-spec-education-reports.md) for complete technical context.
