# FlowForge Design System

> **MANDATORY REFERENCE** - All UI development must conform to these specifications.
> Last Updated: December 2024
> Theme: Pearl Vibrant (Light Mode)

## Quick Reference

**Primary Colors:**
- Accent: `#F25C05` (Orange) - CTAs, links, highlights, active states
- Accent Hover: `#DC5204` - Button/link hover states
- Accent Subtle: `#FEF5EE` - Badge backgrounds, highlighted sections

**Backgrounds:**
- Base: `#FFFEFB` - Main page backgrounds
- Subtle: `#FAF8F3` - Cards, inputs, sidebars
- Muted: `#F2EFE7` - Hover states, dividers, progress bar backgrounds

**Text:**
- Primary: `#171614` - Headings, body text
- Muted: `#71706B` - Secondary text, labels, placeholders

**Borders:**
- Default: `#E6E2D6` - Card borders, input borders, separators

**Semantic Colors:**
- Success: `#16A34A` / Subtle: `#DCFCE7`
- Warning: `#CA8A04` / Subtle: `#FEF9C3`

---

## CSS Custom Properties

When implementing styles, use these CSS variable names:

```css
:root {
  /* Pearl Vibrant Theme */
  --bg: #FFFEFB;
  --bg-subtle: #FAF8F3;
  --bg-muted: #F2EFE7;
  --border: #E6E2D6;
  --text: #171614;
  --text-muted: #71706B;
  --accent: #F25C05;
  --accent-hover: #DC5204;
  --accent-subtle: #FEF5EE;
  --success: #16A34A;
  --success-subtle: #DCFCE7;
  --warning: #CA8A04;
  --warning-subtle: #FEF9C3;
}
```

---

## Typography

**Font Family:**
- Primary: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- Monospace (code): `'SF Mono', Monaco, monospace`

**Font Sizes:**
- Page Title: `1.75rem` (28px), weight 700
- Section Title: `1.1rem` (17.6px), weight 600
- Body: `0.875rem` (14px), weight 400
- Labels: `0.75rem` (12px), weight 500, uppercase, letter-spacing 0.03-0.05em
- Small/Badges: `0.7rem` (11.2px), weight 600

**Line Height:** 1.6 for body text

---

## Spacing

**Page Padding:**
- Main content: `32px 40px`
- Cards: `24px`
- Compact cards: `20px 24px`

**Component Gaps:**
- Section margins: `32-40px`
- Card grids: `20-24px` gap
- Button groups: `12-16px` gap
- Form elements: `12px` gap

---

## Component Specifications

### Buttons

**Primary Button:**
```css
.btn-primary {
  background: var(--accent);        /* #F25C05 */
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
}
.btn-primary:hover {
  background: var(--accent-hover);  /* #DC5204 */
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: var(--bg-subtle);     /* #FAF8F3 */
  color: var(--text);               /* #171614 */
  border: 1px solid var(--border);  /* #E6E2D6 */
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}
.btn-secondary:hover {
  background: var(--bg-muted);      /* #F2EFE7 */
}
```

### Cards

```css
.card {
  background: var(--bg-subtle);     /* #FAF8F3 */
  border: 1px solid var(--border);  /* #E6E2D6 */
  border-radius: 12px;
  padding: 24px;
}
.card:hover {
  border-color: var(--accent);      /* #F25C05 */
  box-shadow: 0 4px 12px rgba(242, 92, 5, 0.1);
}
```

### Inputs

```css
.input {
  background: var(--bg-subtle);     /* #FAF8F3 */
  border: 1px solid var(--border);  /* #E6E2D6 */
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.875rem;
  color: var(--text);               /* #171614 */
}
.input:focus {
  border-color: var(--accent);      /* #F25C05 */
  outline: none;
}
.input::placeholder {
  color: var(--text-muted);         /* #71706B */
}
```

### Badges

**Status Badges:**
```css
/* In Progress / Active */
.badge-progress {
  background: var(--accent-subtle); /* #FEF5EE */
  color: var(--accent);             /* #F25C05 */
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Complete / Success */
.badge-complete {
  background: var(--success-subtle); /* #DCFCE7 */
  color: var(--success);             /* #16A34A */
}

/* Pending / Warning */
.badge-pending {
  background: var(--warning-subtle); /* #FEF9C3 */
  color: var(--warning);             /* #CA8A04 */
}
```

### Progress Bars

```css
.progress-bar {
  height: 6px;
  background: var(--bg-muted);      /* #F2EFE7 */
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);        /* #F25C05 */
  border-radius: 3px;
}
```

### Navigation Items

```css
.nav-item {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-muted);         /* #71706B */
}
.nav-item:hover {
  background: var(--bg-muted);      /* #F2EFE7 */
  color: var(--text);               /* #171614 */
}
.nav-item.active {
  background: var(--accent-subtle); /* #FEF5EE */
  color: var(--accent);             /* #F25C05 */
  font-weight: 500;
}
```

---

## Layout Patterns

### Dashboard Layout
- Sidebar: `260px` width, `var(--bg-subtle)` background
- Main content: Flexible, `var(--bg)` background
- Stats grid: 4 columns on desktop, responsive

### Interview/Chat Layout
- Max width: `800px`, centered
- No sidebar (focus mode)
- Progress bar at top
- Chat bubbles: AI left-aligned, User right-aligned

### Report Layout
- Hero section with gradient: `var(--bg-subtle)` to `var(--bg)`
- Max content width: `1000px`
- Score circle: 180px diameter

---

## Tailwind CSS Classes

Custom `ff-*` classes are defined in `tailwind.config.ts` for exact design system colors:

| Design Token | Tailwind Class | Hex Value |
|--------------|----------------|-----------|
| Background | `bg-ff-bg` | #FFFEFB |
| Background Subtle | `bg-ff-subtle` | #FAF8F3 |
| Background Muted | `bg-ff-muted` | #F2EFE7 |
| Border | `border-ff-border` | #E6E2D6 |
| Text Primary | `text-ff-text` | #171614 |
| Text Muted | `text-ff-text-muted` | #71706B |
| Accent | `bg-ff-accent` / `text-ff-accent` | #F25C05 |
| Accent Hover | `hover:bg-ff-accent-hover` | #DC5204 |
| Accent Subtle | `bg-ff-accent-subtle` | #FEF5EE |
| Success | `bg-ff-success` / `text-ff-success` | #16A34A |
| Success Subtle | `bg-ff-success-subtle` | #DCFCE7 |
| Warning | `bg-ff-warning` / `text-ff-warning` | #CA8A04 |
| Warning Subtle | `bg-ff-warning-subtle` | #FEF9C3 |
| Teal | `bg-ff-teal` / `text-ff-teal` | #1D9BA3 |

**Usage Examples:**
```html
<!-- Card with proper background -->
<div class="bg-ff-subtle border border-ff-border rounded-xl p-6">

<!-- Primary button -->
<button class="bg-ff-accent hover:bg-ff-accent-hover text-white">

<!-- Text hierarchy -->
<h1 class="text-ff-text">Heading</h1>
<p class="text-ff-text-muted">Secondary text</p>

<!-- Status badge -->
<span class="bg-ff-success-subtle text-ff-success">Complete</span>
```

---

## Design Principles

1. **Orange Accent Sparingly** - Use `#F25C05` only for:
   - Primary CTAs
   - Active navigation states
   - Progress indicators
   - Key highlights
   - Never for large background areas

2. **Generous Whitespace** - Minimum 32px padding on content areas

3. **Subtle Depth** - Cards use subtle borders, not heavy shadows

4. **Professional Typography** - Inter font, clear hierarchy, no decorative fonts

5. **Warm Light Theme** - Pearl backgrounds create premium, approachable feel

---

## Reference Files

For complete visual examples, see:
- `docs/ux-color-themes.html` - Full color palette explorer with all 3 theme variations
- `docs/ux-design-directions.html` - Complete mockups for Dashboard, Interview, Report, Sales pages

---

## Checklist for UI Changes

Before committing any UI changes, verify:

- [ ] Colors match Pearl Vibrant theme tokens exactly
- [ ] Accent color (#F25C05) used only for interactive elements
- [ ] Border radius: 8px for buttons/inputs, 12px for cards
- [ ] Font is Inter with correct weights
- [ ] Spacing follows 12/16/20/24/32/40px scale
- [ ] Hover states use correct colors (--accent-hover for primary, --bg-muted for secondary)
- [ ] Status badges use semantic colors (success/warning/accent)
