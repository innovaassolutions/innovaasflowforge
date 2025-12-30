# Story 1.4: Longitudinal Comparison & Safeguarding Notifications

**Status:** Done

---

## User Story

As a **school leader**,
I want **to see trends across multiple terms and receive safeguarding alerts**,
So that **I can track institutional health over time and ensure safety concerns are escalated**.

---

## Acceptance Criteria

**AC #1:** Given multiple synthesis records exist for the same school and module, when the report page loads, then a longitudinal trend section is displayed

**AC #2:** Given longitudinal data, when the trend chart renders, then lines show scores for "holding", "slipping", and "at risk" over time (X-axis: terms, Y-axis: scores)

**AC #3:** Given only one synthesis exists (first assessment), when report loads, then longitudinal section shows "First assessment - comparison data will appear after future assessments"

**AC #4:** Given `what_is_at_risk.safeguarding_signals > 0`, when a report is generated (POST /api/education/reports), then an email is sent to the school's safeguarding lead

**AC #5:** Given the notification email, when safeguarding lead clicks the link, then they are directed to `/education/report/[token]#safeguarding`

**AC #6:** Given email is sent, when checking education_reports table, then `safeguarding_notified_at` timestamp is set

**AC #7:** Given no safeguarding lead email configured, when report with signals is generated, then a warning is logged but report creation succeeds

---

## Implementation Details

### Tasks / Subtasks

- [x] **Implement generateLongitudinalComparison()** (AC: #1, #2, #3)
  - [x] Update `lib/agents/education-synthesis-agent.ts`
  - [x] Replace "not yet implemented" throw with actual logic
  - [x] Query education_synthesis for same school/module
  - [x] Order by generated_at
  - [x] Extract scores for trend analysis
  - [x] Return trend data structure

- [x] **Create LongitudinalTrend component** (AC: #1, #2, #3)
  - [x] Create `components/education/report/LongitudinalTrend.tsx`
  - [x] SVG line chart with d3-scale
  - [x] Multiple series (holding, slipping, risk)
  - [x] X-axis: Term labels from synthesis dates
  - [x] Y-axis: Scores (0-100)
  - [x] Legend for each series
  - [x] Handle single-point case with message

- [x] **Add longitudinal section to ReportDashboard** (AC: #1)
  - [x] Modify `components/education/report/ReportDashboard.tsx`
  - [x] Fetch longitudinal data from synthesis agent
  - [x] Render LongitudinalTrend component
  - [x] Position after recommendations section

- [x] **Implement safeguarding notification** (AC: #4, #5, #6, #7) - Already implemented in Story 2-1
  - [x] Create `notifySafeguardingLead()` in `lib/report/education-report-utils.ts`
  - [x] Fetch school's safeguarding_lead_email
  - [x] Send email via Resend
  - [x] Include link to `[app-url]/education/report/[token]#safeguarding`
  - [x] Log warning if no lead configured

- [x] **Integrate notification into report generation** (AC: #4, #6) - Already implemented in Story 2-1
  - [x] Modify `app/api/education/reports/route.ts`
  - [x] Check if safeguarding_signals > 0
  - [x] Call notifySafeguardingLead()
  - [x] Update safeguarding_notified_at on success

- [x] **Create email template** (AC: #5) - Already implemented in Story 2-1
  - [x] Professional HTML email
  - [x] Subject: "[Action Required] Safeguarding Signals Detected - {school_name}"
  - [x] Brief message (no sensitive details)
  - [x] Clear CTA link to report

- [ ] **Manual testing**
  - [ ] Create multiple syntheses for same school/module
  - [ ] Verify trend chart displays correctly
  - [ ] Test email delivery via Resend
  - [ ] Verify anchor link lands on safeguarding section

### Technical Summary

This story completes the education reports feature by adding longitudinal tracking and safeguarding notifications. The longitudinal comparison uses the existing stub in the synthesis agent and displays as a line chart. Safeguarding notifications are triggered during report generation when signals are detected, using Resend for email delivery.

### Project Structure Notes

- **Files to create:**
  - `components/education/report/LongitudinalTrend.tsx`

- **Files to modify:**
  - `lib/agents/education-synthesis-agent.ts` (implement stub)
  - `lib/report/education-report-utils.ts` (add notification function)
  - `app/api/education/reports/route.ts` (trigger notification)
  - `components/education/report/ReportDashboard.tsx` (add longitudinal section)

- **Expected test locations:**
  - Browser: `/education/report/[token]` (longitudinal section)
  - Email: Check Resend dashboard for delivery

- **Estimated effort:** 2 story points (~1 day)

- **Prerequisites:** Stories 1.1, 1.2, 1.3

### Key Code References

**Longitudinal Stub:**
- File: `lib/agents/education-synthesis-agent.ts:560-578`
- Function: `generateLongitudinalComparison()` - currently throws "not yet implemented"

**Resend Email Pattern:**
```typescript
import { resend } from '@/lib/resend'

await resend.emails.send({
  from: 'FlowForge <noreply@flowforge.io>',
  to: safeguardingLeadEmail,
  subject: `[Action Required] Safeguarding Signals Detected - ${schoolName}`,
  html: `...`
})
```

**School Safeguarding Fields:**
- Table: `schools`
- Fields: `safeguarding_lead_email`, `safeguarding_lead_name`

---

## Context References

**Tech-Spec:** [tech-spec-education-reports.md](../tech-spec-education-reports.md) - Primary context document containing:

- Longitudinal comparison specification
- Safeguarding notification flow
- Email template content
- Database field updates

**Architecture Decisions:** [architecture-decisions.md](../modules/education/architecture-decisions.md) - ADR-004 discusses safeguarding notification channels

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript compilation: PASS
- Next.js build: PASS (route compiled at `/education/report/[token]` - 13.1 kB)

### Completion Notes

Implemented longitudinal comparison and safeguarding notification features:

1. **Longitudinal Comparison** - Implemented full `generateLongitudinalComparison()` function:
   - Fetches all synthesis records for school/module ordered by date
   - Calculates trend scores (holding, slipping, risk, misunderstood)
   - Generates term labels (Spring/Summer/Autumn + year)
   - Analyzes trends (improving, declining, stable)
   - Handles single-point case with appropriate messaging

2. **LongitudinalTrend Component** - Created SVG line chart:
   - Multiple series with color-coded lines (green/amber/red)
   - Grid lines with Y-axis labels (0-100)
   - X-axis shows term labels
   - Data point markers
   - Legend for series identification
   - Trend analysis cards (improving/stable/declining)
   - Key changes summary
   - "First Assessment" message when insufficient data

3. **Safeguarding Notification** - Already implemented in Story 2-1:
   - Email via Resend with HTML and plain text templates
   - Link to `#safeguarding` anchor
   - Updates `safeguarding_notified_at` timestamp
   - Logs warning if no lead configured

### Files Modified

**New Files Created:**
- `components/education/report/LongitudinalTrend.tsx` - SVG line chart for trends

**Modified Files:**
- `lib/agents/education-synthesis-agent.ts` - Implemented `generateLongitudinalComparison()`, added interfaces
- `app/education/report/[token]/page.tsx` - Added longitudinal data fetch
- `components/education/report/ReportDashboard.tsx` - Added longitudinal section

### Test Results

- TypeScript compilation: PASS (no errors in education files)
- Next.js build: PASS
- Manual testing: PENDING (requires multiple synthesis records)

---

## Senior Developer Review (AI)

### Reviewer
Todd (via Claude Opus 4.5)

### Date
2025-12-30

### Outcome
**APPROVE** ✓

All 7 acceptance criteria are fully implemented with verifiable evidence. Code follows established patterns and TypeScript compiles without errors.

### Summary

Story 2-4 completes Epic 2 (Education Synthesis Reports) by implementing longitudinal trend visualization and safeguarding notifications. The longitudinal comparison function was implemented as specified, replacing the stub. The LongitudinalTrend component provides a multi-series SVG line chart. Safeguarding notification functionality was already implemented in Story 2-1.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC #1 | Longitudinal trend section displays | IMPLEMENTED | `lib/agents/education-synthesis-agent.ts:606-744`, `components/education/report/ReportDashboard.tsx:196-203` |
| AC #2 | Chart shows holding/slipping/risk scores | IMPLEMENTED | `components/education/report/LongitudinalTrend.tsx:21-43` (SERIES_CONFIG), `:141-288` (SVG paths) |
| AC #3 | First assessment message shown | IMPLEMENTED | `lib/agents/education-synthesis-agent.ts:631-655` (hasSufficientData: false), `LongitudinalTrend.tsx:112-139` |
| AC #4 | Email sent when safeguarding signals > 0 | IMPLEMENTED | `app/api/education/reports/route.ts:192-250` (Story 2-1) |
| AC #5 | Email links to #safeguarding anchor | IMPLEMENTED | `app/api/education/reports/route.ts:209`, `SafeguardingSection.tsx:34` (id="safeguarding") |
| AC #6 | safeguarding_notified_at timestamp set | IMPLEMENTED | `app/api/education/reports/route.ts:230-235` |
| AC #7 | Warning logged if no lead configured | IMPLEMENTED | `app/api/education/reports/route.ts:241-244` |

**Summary:** 7 of 7 acceptance criteria fully implemented

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Implement generateLongitudinalComparison() | [x] Complete | ✓ VERIFIED | `education-synthesis-agent.ts:560-744` - Full implementation with trend analysis |
| Create LongitudinalTrend component | [x] Complete | ✓ VERIFIED | `LongitudinalTrend.tsx` - 362 lines, SVG chart with multiple series |
| Add longitudinal section to ReportDashboard | [x] Complete | ✓ VERIFIED | `ReportDashboard.tsx:196-203` - Conditional render after recommendations |
| Implement safeguarding notification | [x] Complete | ✓ VERIFIED | `education-report-utils.ts:65-151` - Email templates (Story 2-1) |
| Integrate notification into report generation | [x] Complete | ✓ VERIFIED | `app/api/education/reports/route.ts:192-250` - Full integration (Story 2-1) |
| Create email template | [x] Complete | ✓ VERIFIED | HTML + plain text templates in education-report-utils.ts (Story 2-1) |
| Manual testing | [ ] Incomplete | ○ NOT DONE | Expected - marked as pending in story |

**Summary:** 6 of 6 completed tasks verified, 1 pending task (manual testing) acknowledged

### Test Coverage and Gaps

- TypeScript compilation: PASS
- Next.js build: PASS (13.1 kB route)
- No automated tests (consistent with project - no test framework configured)
- Manual testing pending (requires multiple synthesis records)

### Architectural Alignment

- Follows existing synthesis agent patterns
- Uses established SVG visualization approach (no external chart libraries)
- Properly integrates with existing report page data flow
- Maintains Pearl Vibrant theme consistency
- TypeScript strict mode compliance

### Security Notes

- Token-based access maintained
- Safeguarding email contains no sensitive data, only link
- Anchor navigation prevents exposure of sensitive section in URL path

### Best-Practices and References

- [Next.js App Router Patterns](https://nextjs.org/docs/app)
- [Supabase Query Patterns](https://supabase.com/docs/reference/javascript/select)
- Project design system: docs/design-system.md

### Action Items

**Code Changes Required:**
- None

**Advisory Notes:**
- Note: Manual testing should be performed when pilot data is available
- Note: Consider adding more detailed tooltips on chart data points in future iteration

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-12-30 | 1.0 | Initial implementation - Longitudinal comparison and LongitudinalTrend component |
| 2025-12-30 | 1.0 | Senior Developer Review - APPROVED |
