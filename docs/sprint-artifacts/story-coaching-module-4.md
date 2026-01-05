# Story 1.4: Dashboard & Pipeline

**Status:** TODO

---

## User Story

As a **coach**,
I want **a dashboard to view my leads in a pipeline and export them**,
So that **I can manage my client acquisition and follow up with interested prospects**.

---

## Acceptance Criteria

**AC #1:** Given I'm logged in as a coach, when I access `/dashboard/coaching/`, then I see my lead pipeline overview with counts by status

**AC #2:** Given leads exist in various statuses, when the pipeline renders, then it shows correct counts for: registered, started, completed, contacted, converted, archived

**AC #3:** Given I'm on the clients list page, when I select a status filter, then only clients with that status are displayed

**AC #4:** Given I click "Export CSV" on the client list, when the download completes, then the file contains columns: name, email, status, archetype_default, archetype_authentic, registration_date, completion_date

**AC #5:** Given I click on a client row, when the detail page loads, then I see their full assessment results (if completed) and can update their status

**AC #6:** Given I click "Create Campaign", when I complete the form with name and results_disclosure setting, then a new campaign is created linked to my tenant

**AC #7:** Given I click "Add Client" on a campaign, when I enter name/email and click Send Invitation, then an invitation email is sent (Story 1.3 integration)

**AC #8:** Given I update a client's status (e.g., to 'contacted'), when I save, then the pipeline counts update accordingly

---

## Implementation Details

### Tasks / Subtasks

- [ ] **Create coach dashboard page** (AC: #1, #2)
  - [ ] Create `app/dashboard/coaching/page.tsx`
  - [ ] Fetch pipeline data for logged-in coach
  - [ ] Display summary cards with status counts
  - [ ] Recent activity feed (optional)
  - [ ] Quick links to campaigns, clients

- [ ] **Create LeadPipeline component** (AC: #2)
  - [ ] Create `components/coaching/LeadPipeline.tsx`
  - [ ] Display 6 status columns or summary cards
  - [ ] Clickable to filter client list
  - [ ] Color-coded status badges
  - [ ] Follow Pearl Vibrant theme

- [ ] **Create client list page** (AC: #3, #4)
  - [ ] Create `app/dashboard/coaching/clients/page.tsx`
  - [ ] Fetch all clients for coach's tenant
  - [ ] Table with sortable columns
  - [ ] Status filter dropdown
  - [ ] Search by name/email
  - [ ] Pagination if needed

- [ ] **Create ClientTable component** (AC: #3, #4)
  - [ ] Create `components/coaching/ClientTable.tsx`
  - [ ] Columns: name, email, status, archetype, dates
  - [ ] Status badge with color
  - [ ] Row click navigates to detail
  - [ ] Checkbox selection (for bulk actions)

- [ ] **Implement CSV export** (AC: #4)
  - [ ] Add export button to client list
  - [ ] Generate CSV client-side
  - [ ] Include all required columns
  - [ ] Format dates appropriately
  - [ ] Trigger browser download

- [ ] **Create client detail page** (AC: #5)
  - [ ] Create `app/dashboard/coaching/clients/[id]/page.tsx`
  - [ ] Display client info (name, email, registration)
  - [ ] Display archetype results (if completed)
  - [ ] Status dropdown to update
  - [ ] View conversation history (optional)
  - [ ] Back to list navigation

- [ ] **Create campaign management pages** (AC: #6, #7)
  - [ ] Create `app/dashboard/coaching/campaigns/page.tsx` - List campaigns
  - [ ] Create `app/dashboard/coaching/campaigns/new/page.tsx` - Create form
  - [ ] Campaign form: name, description, results_disclosure
  - [ ] Campaign detail: view participants, add client

- [ ] **Create API endpoints for dashboard**
  - [ ] `GET /api/coach/dashboard` - Pipeline summary data
  - [ ] `GET /api/coach/clients` - Client list with filters
  - [ ] `PATCH /api/coach/clients/[id]` - Update client status
  - [ ] `POST /api/coach/campaigns` - Create campaign

- [ ] **Add coaching nav item to dashboard layout** (AC: #1)
  - [ ] Modify `app/dashboard/layout.tsx`
  - [ ] Add "Coaching" section with icon
  - [ ] Conditional display based on user type

### Technical Summary

This story creates the coach's back-office experience for managing leads and campaigns. The lead pipeline provides at-a-glance visibility into the sales funnel, while the client list enables detailed management and CSV export for CRM integration. Campaign management allows coaches to create different assessments with varying results disclosure settings.

### Project Structure Notes

- **Files to create:**
  - `app/dashboard/coaching/page.tsx`
  - `app/dashboard/coaching/clients/page.tsx`
  - `app/dashboard/coaching/clients/[id]/page.tsx`
  - `app/dashboard/coaching/campaigns/page.tsx`
  - `app/dashboard/coaching/campaigns/new/page.tsx`
  - `components/coaching/LeadPipeline.tsx`
  - `components/coaching/ClientTable.tsx`
  - `app/api/coach/dashboard/route.ts`
  - `app/api/coach/clients/route.ts`
  - `app/api/coach/clients/[id]/route.ts`
  - `app/api/coach/campaigns/route.ts`

- **Files to modify:**
  - `app/dashboard/layout.tsx` - Add coaching nav item

- **Expected test locations:** Browser testing of full dashboard flow

- **Estimated effort:** 4 story points (~3 days)

- **Prerequisites:** Story 1.3 (clients must be able to register/complete)

### Key Code References

**Existing Dashboard Pattern:**
- File: `app/dashboard/campaigns/page.tsx`
- Pattern: List view with table, status badges

**Stakeholder Management Pattern:**
- File: `app/dashboard/companies/[id]/stakeholders/page.tsx`
- Pattern: Participant list, invite flow

**UI Components:**
- File: `components/ui/` - Button, Table, Badge, Select, etc.
- Pattern: shadcn/ui components

### Pipeline Status Colors

Following Pearl Vibrant theme:

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| registered | `bg-blue-100 text-blue-800` | New lead, not started |
| started | `bg-amber-100 text-amber-800` | In progress |
| completed | `bg-green-100 text-green-800` | Assessment done |
| contacted | `bg-purple-100 text-purple-800` | Coach followed up |
| converted | `bg-brand-accent text-white` | Became client |
| archived | `bg-gray-100 text-gray-500` | Not pursuing |

### CSV Export Format

```csv
Name,Email,Status,Default Archetype,Authentic Archetype,Registered,Completed
John Smith,john@example.com,completed,The Protector,The Maverick,2025-01-05,2025-01-05
Jane Doe,jane@example.com,started,,,,2025-01-04,
```

---

## Context References

**Tech-Spec:** [tech-spec-coaching-module.md](../tech-spec-coaching-module.md) - Contains:

- Lead pipeline architecture diagram
- Client status flow
- Dashboard page structure

**UX Design:** [design-system.md](../design-system.md) - Pearl Vibrant theme colors

---

## Dev Agent Record

### Agent Model Used

(To be filled during implementation)

### Debug Log References

(To be filled during implementation)

### Completion Notes

(To be filled during implementation)

### Files Modified

(To be filled during implementation)

### Test Results

(To be filled during implementation)

---

## Review Notes

### Senior Developer Review (AI)

(To be filled during code review)
