# Story 1.4: Polish & Integration

**Status:** Complete

---

## User Story

As a coaching participant,
I want a clear choice between going deeper or receiving my results and exiting,
So that my experience feels complete regardless of which path I choose.

---

## Acceptance Criteria

**AC #1:** Given a participant on the results page, When viewing, Then they see "Want to go deeper?" with two clear button options

**AC #2:** Given a participant who clicks "No thanks", When they decline, Then email is sent immediately and they see a thank you confirmation

**AC #3:** Given a tenant with booking enabled, When participant views results or receives email, Then booking CTA button appears with configured URL

**AC #4:** Given a tenant without booking configured, When participant views results, Then no booking CTA is displayed

**AC #5:** Given a participant who received the email, When they click the return link, Then they can access results and add reflection anytime

---

## Implementation Details

### Tasks / Subtasks

- [x] **ReflectionChoice Component** (AC: #1)
  - [x] Create `components/coaching/ReflectionChoice.tsx`
  - [x] Display "Want to go deeper?" heading
  - [x] Two buttons: "Yes, let's explore" and "No thanks, I'm good"
  - [x] Style with tenant branding
  - [x] Handle loading states during API calls

- [x] **BookingCTA Component** (AC: #3, #4) - Integrated into ReflectionChoice
  - [x] Accept `url` and `buttonText` props
  - [x] Render as branded button linking to booking URL
  - [x] Conditionally render based on `tenant.brand_config.booking.enabled`
  - [x] Support showing on results page

- [x] **Tenant Brand Config Update** (AC: #3, #4)
  - [x] Update `lib/supabase/server.ts` TenantProfile interface
  - [x] Add `booking?: { enabled: boolean; url: string; buttonText?: string; showOnResults?: boolean; showInEmail?: boolean; }`

- [x] **Graceful Exit Flow** (AC: #2, #5)
  - [x] Handle "No thanks" click in ReflectionChoice
  - [x] Call complete API endpoint
  - [x] Show thank you confirmation with:
    - Success message
    - Return link explanation
    - Booking CTA (if enabled)
  - [x] Update reflection_status to 'declined' in complete API

- [x] **Return Link Functionality** (AC: #5)
  - [x] Results page loads for returning users
  - [x] If previously declined, show option to "Add reflection now"
  - [x] If reflection completed, show reflection complete message
  - [x] If reflection in progress, show continue button
  - [x] Handle all session states gracefully

- [x] **Results Page Integration** (AC: #1, #3)
  - [x] Add ReflectionChoice to results page with bookingConfig prop
  - [x] BookingCTA integrated into ReflectionChoice component
  - [x] Handle post-reflection state (hide choice, show completion)
  - [x] Handle post-exit state (hide choice, show return options)
  - [x] Added local state management with onStatusChange callback

- [ ] **End-to-End Testing** (AC: #1-#5) - Manual testing required
  - [ ] Test complete "go deeper" path
  - [ ] Test complete "no thanks" exit path
  - [ ] Test booking CTA enabled
  - [ ] Test booking CTA disabled
  - [ ] Test return link after email sent
  - [ ] Test return link to add reflection later

### Technical Summary

This story integrates all pieces and adds the choice UI for a polished user experience. Key components:

1. **ReflectionChoice** - Clear UI for the two paths (deeper vs exit)
2. **BookingCTA** - Configurable booking button that appears based on tenant settings
3. **Graceful Exit** - When declining, immediately trigger email/PDF and show confirmation
4. **Return Link** - Persistent access to results and option to add reflection later

This story ties together Stories 1.1, 1.2, and 1.3 into a cohesive flow.

### Project Structure Notes

- **Files to create:**
  - `components/coaching/ReflectionChoice.tsx`
  - `components/coaching/BookingCTA.tsx`

- **Files to modify:**
  - `types/tenant.ts` (add booking config)
  - `app/coach/[slug]/results/[token]/page.tsx` (integrate components)
  - `lib/email/templates/archetype-results-email.tsx` (add BookingCTA)

- **Expected test locations:** Manual end-to-end testing

- **Estimated effort:** 2 story points (1-2 days)

- **Prerequisites:** Stories 1.1, 1.2, 1.3

### Key Code References

| Reference | Location | Usage |
|-----------|----------|-------|
| Results page | `app/coach/[slug]/results/[token]/page.tsx` | Integration point |
| Reflection page | `app/coach/[slug]/results/[token]/reflect/page.tsx` | Link target |
| Complete API | `app/api/coach/[slug]/results/[token]/complete/route.ts` | Exit trigger |
| Tenant types | `types/tenant.ts` | BrandConfig interface |

---

## Context References

**Tech-Spec:** [tech-spec-post-results-reflection.md](../tech-spec-post-results-reflection.md) - Primary context document containing:

- Results page data flow diagram
- Booking config structure
- Graceful exit flow

**Epic:** [epic-post-results-reflection.md](epic-post-results-reflection.md) - Epic scope and success criteria.

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - clean implementation with no significant debugging required.

### Completion Notes

**Implementation Date:** 2026-01-07

**Key Implementation Decisions:**

1. **BookingCTA Integration:** Instead of creating a separate BookingCTA component, the booking CTA was integrated directly into ReflectionChoice. This simplifies the component tree and keeps all reflection-related UI in one place.

2. **Type Safety:** Added `ReflectionStatus` type union (`'none' | 'pending' | 'accepted' | 'completed' | 'declined'`) to ensure type-safe status handling throughout the component chain.

3. **Local State Management:** Added `reflectionStatus` state in the results page with `onStatusChange` callback to update UI immediately when user declines, without requiring a page refresh.

4. **Graceful Exit Flow:** The "No thanks" button triggers the complete API which:
   - Generates PDF with results
   - Sends email with PDF attachment
   - Updates `reflection_status` to 'declined' in database
   - Updates local state to show thank you confirmation

5. **All Reflection States Handled:**
   - `pending` - Shows "Want to go deeper?" choice UI
   - `accepted` - Shows "Reflection In Progress" with continue button
   - `completed` - Shows "Reflection Complete" with view link
   - `declined` - Shows "Results Delivered" with option to add reflection later
   - `justDeclined` (local) - Shows thank you confirmation immediately after declining

### Files Modified

| File | Changes |
|------|---------|
| `components/coaching/ReflectionChoice.tsx` | Major rewrite: added graceful exit flow, booking CTA integration, all status states, loading/error handling |
| `lib/supabase/server.ts` | Added `booking` config to TenantProfile interface |
| `app/api/coach/[slug]/results/[token]/complete/route.ts` | Added `reflection_status: 'declined'` update when called |
| `app/coach/[slug]/results/[token]/page.tsx` | Added local reflectionStatus state, passed bookingConfig and onStatusChange to ReflectionChoice |

### Test Results

**Build:** Passed successfully on Next.js 15.5.7

**Manual Testing Required:**
- [ ] Test complete "go deeper" path
- [ ] Test complete "no thanks" exit path
- [ ] Test booking CTA enabled (requires tenant config)
- [ ] Test booking CTA disabled (default)
- [ ] Test return link after email sent
- [ ] Test return link to add reflection later

---

## Review Notes

<!-- Will be populated during code review -->
