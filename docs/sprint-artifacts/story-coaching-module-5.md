# Story 1.5: Results & Custom Domain

**Status:** TODO

---

## User Story

As a **participant**,
I want **to view my assessment results based on coach settings**,
So that **I can learn about my leadership archetype and decide to engage further**.

---

## Acceptance Criteria

**AC #1:** Given a campaign with `results_disclosure: 'full'`, when participant accesses results page after completion, then full archetype details are displayed (default archetype, authentic archetype, descriptions, alignment analysis)

**AC #2:** Given a campaign with `results_disclosure: 'teaser'`, when participant accesses results page, then only archetype names are shown with a CTA to contact the coach for full results

**AC #3:** Given a campaign with `results_disclosure: 'none'`, when participant completes, then they see only a thank you message with coach contact info (no archetype info)

**AC #4:** Given a participant session token, when accessing `/coach/[slug]/results/[token]` at any time, then their results display persistently (bookmarkable link)

**AC #5:** Given Mark's custom domain (`assessment.leadingwithmeaning.com`) is configured in Vercel, when a visitor accesses that domain, then middleware routes the request to `/coach/leadingwithmeaning/`

**AC #6:** Given custom domain routing is active, when any path is accessed (e.g., `/register`, `/session/[token]`), then tenant branding loads correctly from the rewritten path

**AC #7:** Given Vercel domain configuration, when DNS propagates, then SSL certificate is automatically provisioned

---

## Implementation Details

### Tasks / Subtasks

- [ ] **Create results page** (AC: #1, #2, #3, #4)
  - [ ] Create `app/coach/[slug]/results/[token]/page.tsx`
  - [ ] Fetch session by token
  - [ ] Load tenant and campaign settings
  - [ ] Determine disclosure level
  - [ ] Render appropriate view

- [ ] **Create results API endpoint** (AC: #4)
  - [ ] Create `app/api/coach/[slug]/results/route.ts`
  - [ ] Validate token
  - [ ] Return results based on disclosure setting
  - [ ] Log access event

- [ ] **Implement full results view** (AC: #1)
  - [ ] Display default archetype with description
  - [ ] Display authentic archetype with description
  - [ ] Show alignment analysis (aligned vs misaligned)
  - [ ] Display friction signals if present
  - [ ] Include coach CTA for next steps

- [ ] **Implement teaser results view** (AC: #2)
  - [ ] Show archetype names only (no descriptions)
  - [ ] "Want to learn more?" messaging
  - [ ] Contact coach CTA button
  - [ ] Coach email/booking link

- [ ] **Implement no-results view** (AC: #3)
  - [ ] Thank you message
  - [ ] Coach will be in touch messaging
  - [ ] Coach contact information
  - [ ] Coach branding

- [ ] **Configure middleware for custom domains** (AC: #5, #6)
  - [ ] Modify `middleware.ts`
  - [ ] Detect non-FlowForge hostnames
  - [ ] Query tenant by custom_domain
  - [ ] Rewrite URL to `/coach/[slug]/...`
  - [ ] Preserve original path

- [ ] **Update next.config.js for domains** (AC: #5)
  - [ ] Configure allowed domains
  - [ ] Handle hostname rewrites

- [ ] **Document Vercel domain setup** (AC: #7)
  - [ ] Add instructions to CLAUDE.md or separate doc
  - [ ] CNAME record: `cname.vercel-dns.com`
  - [ ] Vercel dashboard domain configuration
  - [ ] SSL auto-provisioning note

- [ ] **Create domain mapping in database** (AC: #5)
  - [ ] Ensure tenant_profiles.custom_domain is populated for Mark
  - [ ] Query function for domain lookup

### Technical Summary

This story completes the participant experience with configurable results disclosure and enables white-label custom domains. The results page adapts based on campaign settings, allowing coaches to control how much information participants see immediately. Custom domain support transforms the experience from `flowforge.app/coach/mark` to `assessment.leadingwithmeaning.com`.

### Project Structure Notes

- **Files to create:**
  - `app/coach/[slug]/results/[token]/page.tsx`
  - `app/api/coach/[slug]/results/route.ts`
  - `components/coaching/ArchetypeResults.tsx` (full view)
  - `components/coaching/ArchetypeTeaserResults.tsx` (teaser view)
  - `components/coaching/ThankYouMessage.tsx` (no-results view)

- **Files to modify:**
  - `middleware.ts` - Add custom domain routing
  - `next.config.js` - Domain configuration
  - `supabase/migrations/20260106_005_seed_mark_tenant.sql` - Add custom_domain

- **Expected test locations:**
  - Browser testing with mock domains (hosts file)
  - Production testing with actual domain after DNS setup

- **Estimated effort:** 2 story points (~1 day)

- **Prerequisites:** Stories 1.3 (sessions), 1.4 (dashboard)

### Key Code References

**Middleware Pattern:**
- File: `middleware.ts`
- Pattern: Request interception, URL rewriting

**Tenant Query:**
- File: `lib/supabase/server.ts`
- Function: `getTenantByDomain()` (from Story 1.1)

**Results Display Pattern:**
- File: `app/session/[token]/page.tsx` (completion state)
- Reference: How completion is displayed

### Results Disclosure Logic

```typescript
// app/coach/[slug]/results/[token]/page.tsx
type ResultsDisclosure = 'full' | 'teaser' | 'none';

function ResultsPage({ session, campaign, tenant }) {
  const disclosure = campaign.results_disclosure as ResultsDisclosure;

  switch (disclosure) {
    case 'full':
      return <FullArchetypeResults results={session.metadata.results} tenant={tenant} />;
    case 'teaser':
      return <TeaserArchetypeResults results={session.metadata.results} tenant={tenant} />;
    case 'none':
      return <ThankYouMessage tenant={tenant} />;
  }
}
```

### Custom Domain Middleware

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Skip for FlowForge domains
  if (hostname.includes('flowforge.app') ||
      hostname.includes('localhost') ||
      hostname.includes('vercel.app')) {
    return NextResponse.next();
  }

  // Look up tenant by custom domain
  const tenant = await getTenantByDomain(hostname);
  if (tenant) {
    const url = request.nextUrl.clone();
    url.pathname = `/coach/${tenant.slug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Vercel Domain Setup Steps

1. **DNS Configuration (Mark's side):**
   - Add CNAME record: `assessment` → `cname.vercel-dns.com`

2. **Vercel Configuration (FlowForge side):**
   - Project Settings → Domains → Add `assessment.leadingwithmeaning.com`
   - Wait for SSL provisioning (automatic)

3. **Database Update:**
   - Set `tenant_profiles.custom_domain = 'assessment.leadingwithmeaning.com'` for Mark's record

---

## Context References

**Tech-Spec:** [tech-spec-coaching-module.md](../tech-spec-coaching-module.md) - Contains:

- Custom domain flow diagram
- Middleware rewrite code
- Results disclosure logic

**White-Label Architecture:** [WHITE_LABEL_ARCHITECTURE.md](../leadingwithmeaning/WHITE_LABEL_ARCHITECTURE.md) - Subdomain routing strategy

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
