# Story 1.2: Branding Infrastructure

**Status:** review

---

## User Story

As a **coach participant**,
I want **to see the coach's branding when I access their assessment**,
So that **the experience feels consistent with the coach's personal brand**.

---

## Acceptance Criteria

**AC #1:** Given a brand_config with custom colors, when the branded layout loads, then CSS custom properties (--brand-primary, --brand-bg, --brand-text, etc.) are injected into the document

**AC #2:** Given a brand_config with custom fonts (heading, body), when the layout loads, then Google Fonts are dynamically loaded via next/font or link injection

**AC #3:** Given a tenant with a logo URL, when BrandedHeader renders, then the logo displays with correct sizing and alt text

**AC #4:** Given the `/coach/[slug]/` route is accessed with valid slug, when the layout wrapper renders, then it applies correct branding from tenant_profiles

**AC #5:** Given an invalid slug, when `/coach/[slug]/` is accessed, then a 404 page is shown

**AC #6:** Given Tailwind config is extended, when using classes like `bg-brand-primary` or `text-brand-text`, then they reference the CSS custom properties

---

## Implementation Details

### Tasks / Subtasks

- [x] **Create brand theme generator** (AC: #1)
  - [x] Create `lib/theme/brand-theme.ts`
  - [x] Implement `generateBrandCss(brand: BrandConfig): string`
  - [x] Map all brand_config colors to CSS variables
  - [x] Handle missing/default values gracefully

- [x] **Create branded layout wrapper** (AC: #4, #5)
  - [x] Create `app/coach/[slug]/layout.tsx`
  - [x] Fetch tenant by slug in layout
  - [x] Return 404 if tenant not found
  - [x] Inject brand CSS into head
  - [x] Pass tenant context to children

- [x] **Implement Google Fonts loading** (AC: #2)
  - [x] Dynamic font loading based on brand_config.fonts
  - [x] Support common font families (Inter, Playfair Display, etc.)
  - [x] Fallback fonts for missing families

- [x] **Create BrandedHeader component** (AC: #3)
  - [x] Create `components/coaching/BrandedHeader.tsx`
  - [x] Display tenant logo with configurable width
  - [x] Show tagline if configured
  - [x] Apply brand colors to header background
  - [x] Optional "Powered by FlowForge" footer

- [x] **Extend Tailwind configuration** (AC: #6)
  - [x] Update `tailwind.config.ts`
  - [x] Add brand-* color tokens referencing CSS variables
  - [x] Add brand-heading and brand-body font families

- [x] **Create tenant context provider** (AC: #4)
  - [x] Create context for sharing tenant data
  - [x] Avoid prop drilling through layout

### Technical Summary

This story creates the white-label branding infrastructure that allows each coach's participant-facing pages to display custom logos, colors, and fonts. The brand configuration stored in JSONB is transformed into CSS custom properties at runtime, enabling dynamic theming without rebuilding the application.

### Project Structure Notes

- **Files to create:**
  - `lib/theme/brand-theme.ts`
  - `app/coach/[slug]/layout.tsx`
  - `components/coaching/BrandedHeader.tsx`
  - `lib/contexts/tenant-context.tsx` (optional)

- **Files to modify:**
  - `tailwind.config.js` - Add brand-* color tokens

- **Expected test locations:** Visual testing in browser with Mark's brand config

- **Estimated effort:** 2 story points (~1 day)

- **Prerequisites:** Story 1.1 (tenant_profiles table must exist)

### Key Code References

**Existing Layout Pattern:**
- File: `app/dashboard/layout.tsx`
- Pattern: Server component layout with data fetching

**Existing Theme Colors:**
- File: `tailwind.config.js`
- Reference: Pearl Vibrant theme color tokens

**Tenant Query:**
- File: `lib/supabase/server.ts`
- Function: `getTenantBySlug()` (created in Story 1.1)

### Brand CSS Generation Example

```typescript
// lib/theme/brand-theme.ts
export function generateBrandCss(brand: BrandConfig): string {
  return `
    :root {
      --brand-primary: ${brand.colors.primary};
      --brand-primary-hover: ${brand.colors.primaryHover};
      --brand-secondary: ${brand.colors.secondary};
      --brand-bg: ${brand.colors.background};
      --brand-bg-subtle: ${brand.colors.backgroundSubtle};
      --brand-text: ${brand.colors.text};
      --brand-text-muted: ${brand.colors.textMuted};
      --brand-border: ${brand.colors.border};
      --brand-font-heading: '${brand.fonts.heading}', serif;
      --brand-font-body: '${brand.fonts.body}', sans-serif;
    }
  `;
}
```

### Tailwind Extension Example

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-hover': 'var(--brand-primary-hover)',
        'brand-bg': 'var(--brand-bg)',
        'brand-text': 'var(--brand-text)',
        // ... etc
      },
      fontFamily: {
        'brand-heading': 'var(--brand-font-heading)',
        'brand-body': 'var(--brand-font-body)',
      }
    }
  }
}
```

---

## Context References

**Tech-Spec:** [tech-spec-coaching-module.md](../tech-spec-coaching-module.md) - Contains:

- Runtime theming approach
- Brand CSS generation code
- BrandConfig interface

**White-Label Architecture:** [WHITE_LABEL_ARCHITECTURE.md](../leadingwithmeaning/WHITE_LABEL_ARCHITECTURE.md) - CSS variable injection strategy

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Reviewed existing dashboard layout pattern for layout structure
- Reviewed tailwind.config.ts for color token conventions
- Used CSS custom properties approach for runtime theming
- Implemented 15 common Google Fonts with proper weights mapping
- Created both BrandedHeader and BrandedFooter components

### Completion Notes

All branding infrastructure tasks completed successfully:

1. **Brand theme generator** - `generateBrandCss()` converts brand_config to CSS custom properties with fallback defaults
2. **Google Fonts loading** - `getGoogleFontsUrl()` dynamically generates Google Fonts URL for custom heading/body fonts (15 popular fonts supported)
3. **Branded layout** - Server component fetches tenant by slug, injects brand CSS, provides tenant context, returns 404 for invalid slugs
4. **BrandedHeader/Footer** - Display logo, tagline, and optional "Powered by FlowForge" using CSS variables
5. **Tenant context** - `useTenant()` hook for accessing tenant data without prop drilling
6. **Tailwind extension** - Added brand-* color tokens and brand-heading/brand-body font families

Bonus: Created landing page at `/coach/[slug]/` with welcome message and Register/Continue cards.

### Files Created

- `lib/theme/brand-theme.ts` - CSS generation and Google Fonts URL utilities
- `lib/contexts/tenant-context.tsx` - TenantProvider and useTenant hook
- `components/coaching/BrandedHeader.tsx` - Header and Footer components
- `app/coach/[slug]/layout.tsx` - Branded layout wrapper
- `app/coach/[slug]/page.tsx` - Coach landing page
- `app/coach/[slug]/not-found.tsx` - 404 page for invalid slugs

### Files Modified

- `tailwind.config.ts` - Added brand-* color tokens and font families

### Test Results

- TypeScript compilation: No errors in new files
- Ready for visual testing with Mark's branding at `/coach/leadingwithmeaning`

---

## Review Notes

### Senior Developer Review (AI)

(To be filled during code review)
