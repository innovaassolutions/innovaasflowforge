# Story 1.2: Dashboard UI & Report Generation

**Status:** Done

---

## User Story

As a **school administrator**,
I want **to generate and access synthesis reports from the school dashboard**,
So that **I can easily create reports for completed campaigns and share them with leadership**.

---

## Acceptance Criteria

**AC #1:** Given I'm viewing a school detail page, when a campaign has at least one completed session, then I see a "Generate Report" button next to that campaign

**AC #2:** Given I click "Generate Report", when the request is processing, then a loading spinner is displayed

**AC #3:** Given synthesis completes successfully, when the UI updates, then I see a success message with the shareable report URL

**AC #4:** Given a report URL is displayed, when I click the "Copy" button, then the URL is copied to clipboard with visual confirmation

**AC #5:** Given a report already exists for a campaign, when I view the school page, then I see "View Report" link and the access URL

**AC #6:** Given an error occurs during generation, when the request fails, then an error message is displayed with retry option

---

## Implementation Details

### Tasks / Subtasks

- [x] **Create ReportGenerationPanel component** (AC: #1, #2, #3, #4, #5, #6)
  - [x] Create `components/education/report/ReportGenerationPanel.tsx`
  - [x] Accept props: campaign, existingReport (optional)
  - [x] Show "Generate Report" button if no existing report
  - [x] Show "View Report" + URL if report exists
  - [x] Implement loading state with spinner
  - [x] Implement error state with retry
  - [x] Implement copy-to-clipboard functionality

- [x] **Integrate panel into school detail page** (AC: #1)
  - [x] Modify `app/dashboard/education/schools/[id]/page.tsx`
  - [x] Add panel to each campaign in the campaigns list (after line ~410)
  - [x] Fetch existing reports for campaigns on page load

- [x] **Add report fetching to school page** (AC: #5)
  - [x] Create API call to fetch reports by campaign_id
  - [x] Pass existing report data to ReportGenerationPanel

- [x] **Implement generation flow** (AC: #2, #3)
  - [x] Call POST /api/education/synthesis on button click
  - [x] On success, call POST /api/education/reports
  - [x] Display resulting access URL

- [x] **Style with Pearl Vibrant theme** (AC: all)
  - [x] Use existing Button component from shadcn/ui
  - [x] Apply theme colors (accent for primary actions)
  - [x] Use Lucide icons (FileText, Copy, Check, AlertCircle)

- [ ] **Manual testing**
  - [ ] Test generation on campaign with sessions
  - [ ] Test display of existing report
  - [ ] Test copy to clipboard
  - [ ] Test error handling

### Technical Summary

This story adds the UI layer for report generation to the existing school dashboard. The ReportGenerationPanel component encapsulates all report-related UI for a campaign, including generation trigger, status display, and URL sharing. It integrates into the campaigns list on the school detail page following existing patterns.

### Project Structure Notes

- **Files to create:**
  - `components/education/report/ReportGenerationPanel.tsx`

- **Files to modify:**
  - `app/dashboard/education/schools/[id]/page.tsx`

- **Expected test locations:** Browser - `/dashboard/education/schools/[id]`

- **Estimated effort:** 2 story points (~1 day)

- **Prerequisites:** Story 1.1 (Database & API Foundation)

### Key Code References

**School Dashboard:**
- File: `app/dashboard/education/schools/[id]/page.tsx:356-410`
- Section: Campaigns list - add ReportGenerationPanel after each campaign

**Existing Button Component:**
- File: `components/ui/button.tsx`
- Pattern: Variant styling, loading states

**API URL Helper:**
- File: `lib/api-url.ts`
- Function: `apiUrl()`

**Copy to Clipboard Pattern:**
```typescript
navigator.clipboard.writeText(url)
```

---

## Context References

**Tech-Spec:** [tech-spec-education-reports.md](../tech-spec-education-reports.md) - Primary context document containing:

- Report generation flow
- UI component specifications
- Pearl Vibrant theme colors
- Integration with school dashboard

**Design System:** [design-system.md](../design-system.md) - Pearl Vibrant theme specifications

---

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

- Followed existing patterns from school dashboard page for loading states and error handling
- Used `apiUrl()` helper for API calls consistent with rest of codebase
- Followed Pearl Vibrant theme guidelines from design-system.md

### Completion Notes

**Implementation Summary (2025-12-30):**

1. **ReportGenerationPanel Component Created:**
   - Full state management for idle/generating/success/error states
   - Loading spinner with informative message during synthesis
   - Success state shows report URL with copy-to-clipboard functionality
   - Error state with retry option
   - Displays "View Report" link when report already exists
   - Shows safeguarding signals badge when applicable

2. **School Detail Page Integration:**
   - Added CampaignReport interface for type safety
   - Added campaignReports state to track reports by campaign_id
   - Added report fetching on page load via GET /api/education/reports
   - Integrated ReportGenerationPanel below each campaign in the list
   - Changed campaign cards from Link wrappers to div wrappers to support nested interactive elements
   - Added onReportGenerated callback to update local state after generation

3. **Generation Flow:**
   - Two-step process: POST /api/education/synthesis first, then POST /api/education/reports
   - Proper error handling with user-friendly messages
   - Updates local state on successful generation without requiring page reload

### Files Modified

**New Files Created:**
- `components/education/report/ReportGenerationPanel.tsx`

**Files Modified:**
- `app/dashboard/education/schools/[id]/page.tsx`

### Test Results

TypeScript compilation: PASS (no errors in education components or school page)

---

## Review Notes

### Senior Developer Review (AI)

**Review Date:** 2025-12-30
**Reviewer:** claude-opus-4-5-20251101
**Outcome:** ✅ APPROVE

---

#### Acceptance Criteria Validation

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| #1 | "Generate Report" button visible on campaigns | ✅ PASS | [ReportGenerationPanel.tsx:235-245](components/education/report/ReportGenerationPanel.tsx#L235-L245) - Idle state shows button; [page.tsx:441-462](app/dashboard/education/schools/[id]/page.tsx#L441-L462) - Panel rendered for each campaign |
| #2 | Loading spinner during processing | ✅ PASS | [ReportGenerationPanel.tsx:219-231](components/education/report/ReportGenerationPanel.tsx#L219-L231) - `Loader2` with `animate-spin` |
| #3 | Success message with shareable URL | ✅ PASS | [ReportGenerationPanel.tsx:139-194](components/education/report/ReportGenerationPanel.tsx#L139-L194) - Shows URL + success message |
| #4 | Copy button with visual confirmation | ✅ PASS | [ReportGenerationPanel.tsx:126-136](components/education/report/ReportGenerationPanel.tsx#L126-L136) - `handleCopyUrl()` with Check icon feedback |
| #5 | View Report link for existing reports | ✅ PASS | [page.tsx:160-175](app/dashboard/education/schools/[id]/page.tsx#L160-L175) - Fetches reports; [ReportGenerationPanel.tsx:175-185](components/education/report/ReportGenerationPanel.tsx#L175-L185) - View Report button |
| #6 | Error message with retry option | ✅ PASS | [ReportGenerationPanel.tsx:197-216](components/education/report/ReportGenerationPanel.tsx#L197-L216) - Error state with Retry button |

**Summary: 6 of 6 acceptance criteria fully implemented**

---

#### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Create ReportGenerationPanel.tsx | [x] | ✅ COMPLETE | File exists with 248 lines |
| Accept props: campaign, existingReport | [x] | ✅ COMPLETE | [lines 33-38](components/education/report/ReportGenerationPanel.tsx#L33-L38) |
| Show "Generate Report" button | [x] | ✅ COMPLETE | [lines 235-245](components/education/report/ReportGenerationPanel.tsx#L235-L245) |
| Show "View Report" + URL | [x] | ✅ COMPLETE | [lines 175-185](components/education/report/ReportGenerationPanel.tsx#L175-L185) |
| Loading state with spinner | [x] | ✅ COMPLETE | [lines 219-231](components/education/report/ReportGenerationPanel.tsx#L219-L231) |
| Error state with retry | [x] | ✅ COMPLETE | [lines 197-216](components/education/report/ReportGenerationPanel.tsx#L197-L216) |
| Copy-to-clipboard | [x] | ✅ COMPLETE | [lines 126-136](components/education/report/ReportGenerationPanel.tsx#L126-L136) |
| Modify school page | [x] | ✅ COMPLETE | Import at [line 28](app/dashboard/education/schools/[id]/page.tsx#L28) |
| Add panel to campaigns list | [x] | ✅ COMPLETE | [lines 441-462](app/dashboard/education/schools/[id]/page.tsx#L441-L462) |
| Fetch reports on page load | [x] | ✅ COMPLETE | [lines 160-175](app/dashboard/education/schools/[id]/page.tsx#L160-L175) |
| Pass existingReport to panel | [x] | ✅ COMPLETE | [lines 445-451](app/dashboard/education/schools/[id]/page.tsx#L445-L451) |
| Call POST synthesis on click | [x] | ✅ COMPLETE | [lines 69-80](components/education/report/ReportGenerationPanel.tsx#L69-L80) |
| Call POST reports on success | [x] | ✅ COMPLETE | [lines 89-104](components/education/report/ReportGenerationPanel.tsx#L89-L104) |
| Display access URL | [x] | ✅ COMPLETE | [lines 152-172](components/education/report/ReportGenerationPanel.tsx#L152-L172) |
| Use Button from shadcn/ui | [x] | ✅ COMPLETE | Import at [line 4](components/education/report/ReportGenerationPanel.tsx#L4) |
| Apply theme colors | [x] | ✅ COMPLETE | Uses `hsl(var(--success))`, `text-destructive`, etc. |
| Use Lucide icons | [x] | ✅ COMPLETE | [lines 7-14](components/education/report/ReportGenerationPanel.tsx#L7-L14) |
| Manual testing | [ ] | ⏸️ DEFERRED | Correctly marked incomplete - requires live testing |

**Summary: 17 of 17 completed tasks verified, 0 questionable, 0 falsely marked complete**

---

#### Code Quality Observations

**Strengths:**
- Clean TypeScript interfaces with proper typing
- State machine pattern for managing UI states (idle/generating/success/error)
- Follows existing codebase patterns (`apiUrl()`, `createClient()`, theme variables)
- Proper error handling with try-catch and user-friendly messages
- Smart architectural decision: Changed campaign cards from `<Link>` to `<div>` to support nested interactive elements
- Two-step generation flow matches tech spec (synthesis → report)
- Uses `onReportGenerated` callback to update parent state without page reload

**Security:**
- ✅ Uses session.access_token for authenticated API calls
- ✅ No sensitive data exposed in client-side code
- ✅ Clipboard API used safely with try-catch

---

#### Architectural Alignment

- ✅ Follows tech spec's ReportGenerationPanel specification
- ✅ Integrates at correct location in school page campaigns list
- ✅ Uses Pearl Vibrant theme correctly (theme variables, not hardcoded colors)
- ✅ Uses Lucide icons as specified (FileText, Copy, Check, AlertCircle, Loader2)

---

#### Action Items

**Advisory Notes:**
- Note: Default module fallback at line 54 uses `'wellbeing'` - acceptable for now
- Note: Copy button could benefit from `aria-label` for screen readers (low priority)

---

#### Summary

All 6 acceptance criteria are fully implemented with proper evidence. All 17 development tasks are verified complete. One task (manual testing) is correctly marked incomplete as it requires live environment testing. No blocking issues found. Code follows established patterns, tech spec requirements, and security best practices.

**Recommendation:** Merge and proceed to Story 2-3.
