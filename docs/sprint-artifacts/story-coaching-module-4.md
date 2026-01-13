# Story 1.4: Dashboard & Pipeline

**Status:** IN_PROGRESS

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

- [x] **Create coach dashboard page** (AC: #1, #2)
  - [x] Create `app/dashboard/coaching/page.tsx`
  - [x] Fetch pipeline data for logged-in coach
  - [x] Display summary cards with status counts
  - [x] Recent activity feed (recent clients list)
  - [x] Quick links to campaigns, clients

- [x] **Create LeadPipeline component** (AC: #2)
  - [x] Integrated into dashboard page directly
  - [x] Display 6 status columns with counts
  - [x] Color-coded status badges
  - [x] Follow Pearl Vibrant theme

- [x] **Create client list page** (AC: #3, #4)
  - [x] `app/dashboard/coaching/clients/page.tsx` (existed from Story 3)
  - [x] Fetch all clients for coach's tenant
  - [x] Card-based list with status badges
  - [x] Status filter dropdown
  - [x] Search by name/email

- [ ] **Create ClientTable component** (AC: #3, #4)
  - [ ] Create `components/coaching/ClientTable.tsx`
  - [ ] Columns: name, email, status, archetype, dates
  - [ ] Status badge with color
  - [ ] Row click navigates to detail
  - [ ] Checkbox selection (for bulk actions)

- [x] **Implement CSV export** (AC: #4)
  - [x] Add export button to client list
  - [x] Generate CSV client-side
  - [x] Include all required columns
  - [x] Format dates appropriately
  - [x] Trigger browser download

- [x] **Create client detail page** (AC: #5)
  - [x] Create `app/dashboard/coaching/clients/[id]/page.tsx`
  - [x] Display client info (name, email, registration)
  - [x] Display archetype results (if completed)
  - [x] Status dropdown to update
  - [ ] View conversation history (future)
  - [x] Back to list navigation

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

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - No errors encountered

### Completion Notes

**2026-01-13 - Partial Implementation:**

Core dashboard and CSV export functionality completed:

1. **Coach Dashboard** (`/dashboard/coaching/`)
   - Pipeline overview with 6 status counts (Not Started, In Progress, Completed, Contacted, Converted, Archived)
   - Summary stats cards (Total Clients, Completion Rate)
   - Recent clients list with status badges
   - Quick action buttons (View All Clients, Registration Page)
   - Color-coded status indicators following Pearl Vibrant theme

2. **CSV Export** (on clients page)
   - Export button appears when clients exist
   - Generates client-side CSV with columns: Name, Email, Status, Default Archetype, Authentic Archetype, Registration Date, Completion Date
   - Proper CSV escaping for special characters
   - Downloads as `coaching-clients-YYYY-MM-DD.csv`

3. **Filter & Search** (on clients page)
   - Status filter dropdown (All, Not Started, In Progress, Completed, Contacted, Converted, Archived)
   - Search by name or email with real-time filtering
   - Clear filters button when filters are active
   - "No matching clients" state for empty filter results
   - Updated count display showing "X of Y Clients" when filtered

4. **Client Detail Page** (`/dashboard/coaching/clients/[id]`)
   - Timeline showing registration, started, and completion dates
   - Archetype results display (Default and Authentic archetypes)
   - Alignment indicator showing if archetypes match
   - Status update dropdown with all 6 pipeline statuses
   - Quick actions: View Report, Download PDF, Send Invite, Copy Link
   - Clickable client names in list to navigate to detail

**Remaining work for full story completion:**
- Campaign management pages
- API endpoints for dashboard data

### Files Modified

- `app/dashboard/coaching/page.tsx` - Created (new dashboard page)
- `app/dashboard/coaching/clients/page.tsx` - Modified (CSV export, filter, search, link to detail)
- `app/dashboard/coaching/clients/[id]/page.tsx` - Created (new client detail page)

### Test Results

- Build passes successfully
- Dashboard loads with pipeline counts from coaching_sessions table
- CSV export generates correctly formatted file with archetype data

---

## Review Notes

### Senior Developer Review (AI)

(To be filled during code review)
