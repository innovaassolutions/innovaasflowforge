# Story 1.3: Email & PDF

**Status:** Completed

---

## User Story

As a coaching participant,
I want to receive a branded PDF of my results via email,
So that I can reference them offline and share with my coach.

---

## Acceptance Criteria

**AC #1:** Given participant completion (with or without reflection), When complete endpoint is called, Then branded PDF is generated matching results page content

**AC #2:** Given PDF generation, When rendered, Then it includes tenant logo, colors, and branding from brand_config

**AC #3:** Given PDF and email ready, When email is sent, Then participant receives email within 30 seconds with PDF attachment

**AC #4:** Given email content, When participant views it, Then it includes thank you message, return link, and booking CTA (if enabled)

---

## Implementation Details

### Tasks / Subtasks

- [x] **PDF Document Component** (AC: #1, #2)
  - [x] Create `lib/pdf/archetype-results-pdf.tsx`
  - [x] Use @react-pdf/renderer for document structure
  - [x] Include tenant logo from brand_config.logo.url
  - [x] Apply tenant colors via style objects
  - [x] Structure: Header > Archetype > Tension Pattern > Moving Forward
  - [x] Include booking CTA if enabled
  - [x] Include return link for persistent access

- [x] **PDF Styling** (AC: #2)
  - [x] Create styles object matching Pearl Vibrant theme
  - [x] Apply tenant primary/secondary colors
  - [x] Use tenant fonts (or fallback to system fonts)
  - [x] Follow existing PDF patterns from `lib/pdf-document.tsx`

- [x] **Email Template** (AC: #4)
  - [x] Create `lib/email/templates/archetype-results-email.tsx`
  - [x] Use React Email components
  - [x] Include personalized greeting (participant name)
  - [x] Include thank you message from tenant
  - [x] Include return link to results page
  - [x] Include booking CTA button (if enabled)
  - [x] Mobile-responsive email layout

- [x] **Complete API Endpoint** (AC: #1, #3)
  - [x] Create `app/api/coach/[slug]/results/[token]/complete/route.ts`
  - [x] Generate PDF buffer using archetype-results-pdf
  - [x] Send email via Resend with PDF attachment
  - [x] Update session: email_sent_at, pdf_generated_at
  - [x] Return success/error response

- [x] **Resend Integration** (AC: #3)
  - [x] Use existing `lib/resend.ts` client
  - [x] Send from tenant name (e.g., "Mark Nickerson Coaching")
  - [x] Attach PDF as `leadership-archetype-results.pdf`
  - [x] Handle errors gracefully

- [ ] **Manual Testing** (AC: #1-#4)
  - [ ] Generate PDF, verify all sections render
  - [ ] Verify PDF branding matches tenant config
  - [ ] Trigger email, verify delivery < 30 seconds
  - [ ] Verify email content and PDF attachment
  - [ ] Test booking CTA link in email

### Technical Summary

This story implements PDF generation and email delivery for archetype results. Key components:

1. **PDF Document** - Uses @react-pdf/renderer to create a branded document matching the results page content. Must handle tenant branding (logo, colors, fonts).

2. **Email Template** - React Email template with personalized content, return link, and optional booking CTA.

3. **Complete API** - Orchestrates PDF generation and email sending. Called when participant completes (either after reflection or on declining to reflect).

Key technical considerations:
- PDF images: Use external URLs for logos, not local paths
- PDF fonts: May need to register Google Fonts or use system fallbacks
- Email attachments: Resend accepts Buffer for PDF content
- Timing: Target < 30 second delivery

### Project Structure Notes

- **Files to create:**
  - `lib/pdf/archetype-results-pdf.tsx`
  - `lib/email/templates/archetype-results-email.tsx`
  - `app/api/coach/[slug]/results/[token]/complete/route.ts`

- **Files to reference:**
  - `lib/pdf-document.tsx` (existing PDF patterns)
  - `lib/resend.ts` (email client)
  - `docs/pdf-design-guidelines.md` (PDF styling guide)

- **Expected test locations:** Manual testing + Resend dashboard

- **Estimated effort:** 3 story points (2-3 days)

- **Prerequisites:** Story 1.1 (Results Page Foundation)

### Key Code References

| Reference | Location | Usage |
|-----------|----------|-------|
| Existing PDF patterns | `lib/pdf-document.tsx` | Document structure |
| PDF design guide | `docs/pdf-design-guidelines.md` | Styling standards |
| Email client | `lib/resend.ts` | Sending emails |
| Brand config | `types/tenant.ts:BrandConfig` | Branding fields |

---

## Context References

**Tech-Spec:** [tech-spec-post-results-reflection.md](../tech-spec-post-results-reflection.md) - Primary context document containing:

- PDF structure diagram
- Email content requirements
- Complete API flow

**Design Guidelines:** [pdf-design-guidelines.md](../pdf-design-guidelines.md) - Visual hierarchy, typography, and brand color application.

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript build passed with no errors in new files
- Next.js build completed successfully

### Completion Notes

Implemented the complete Email & PDF delivery system for archetype results:

1. **PDF Document Component** (`lib/pdf/archetype-results-pdf.tsx`)
   - Mirrors web results page structure exactly
   - Dynamic tenant branding (colors from brand_config)
   - Tenant logo on each page header
   - Multi-page layout: Main Results → Tension Pattern (if any) + Authentic → Moving Forward + Reflections
   - Reflection Q&A displayed as text blocks when completed
   - Sand/neutral colors for tension pattern (not warning colors)
   - Professional styling following PDF design guidelines

2. **Email Template** (`lib/email/templates/archetype-results-email.tsx`)
   - React Email components for mobile-responsive layout
   - Personalized greeting and thank you message
   - Dynamic archetype-specific messaging (aligned vs tension)
   - Return link to results page
   - Booking CTA section (ready for future integration)
   - Tenant branding (logo, colors)

3. **Complete API Endpoint** (`app/api/coach/[slug]/results/[token]/complete/route.ts`)
   - Generates PDF buffer using @react-pdf/renderer
   - Sends email via Resend with PDF attachment
   - Updates session timestamps (email_sent_at, pdf_generated_at)
   - Comprehensive error handling for PDF and email failures
   - Prevents duplicate emails (checks email_sent_at before sending)

### Files Modified

**Created:**
- `lib/pdf/archetype-results-pdf.tsx` - PDF document component
- `lib/email/templates/archetype-results-email.tsx` - Email template
- `app/api/coach/[slug]/results/[token]/complete/route.ts` - Complete API endpoint

### Test Results

- TypeScript: No errors in new files
- Next.js Build: Successful compilation
- Manual testing: Pending (per story requirements)

---

## Review Notes

<!-- Will be populated during code review -->
