# Leading with Meaning - Brand Guide

> Brand reference documentation for FlowForge integration
> Last Updated: 2025-12-31

---

## 1. Brand Overview

**Business Name:** Leading with Meaning
**Tagline:** Leadership Coaching
**Founder:** Mark Nickerson
**Website:** https://leadingwithmeaning.com/
**LinkedIn:** https://linkedin.com/in/mnickerson
**Location:** Texas, USA (Central Time)

---

## 2. Brand Promise

### Core Promise
> "Lead with clarity. Manage with confidence. Do your best work without losing yourself."

### Supporting Tagline
> "Less noise. More direction. Less doubt. More authority."

### Brand Positioning
Leadership coaching for emerging leaders who are:
- Overwhelmed with minimal training
- Navigating shifting priorities
- Struggling to maintain personal identity within corporate structures
- Seeking clarity, confidence, and authentic communication

---

## 3. Color Palette

### Primary Colors (Inferred from Website)

Based on the website analysis, Leading with Meaning uses a **minimalist, professional palette**:

| Color | Hex (Estimated) | Usage |
|-------|-----------------|-------|
| **Primary Dark** | `#1a1a2e` | Headlines, primary text |
| **Primary Text** | `#333333` | Body text |
| **Background** | `#ffffff` | Page backgrounds |
| **Background Alt** | `#f8f8f8` | Section backgrounds |
| **Accent** | `#2d3436` | Buttons, borders |
| **Accent Hover** | `#1a1a2e` | Button hover states |

### Recommended FlowForge Theme

For the archetype assessment, BMad Master recommends:

```css
:root {
  /* Primary palette */
  --lwm-primary: #1a1a2e;        /* Deep navy - professional, trustworthy */
  --lwm-primary-light: #2d3436;  /* Lighter navy for hover states */
  --lwm-text: #333333;           /* Dark gray for body text */
  --lwm-text-muted: #666666;     /* Muted text for secondary content */

  /* Backgrounds */
  --lwm-bg: #ffffff;             /* White - clean, minimal */
  --lwm-bg-subtle: #f8f9fa;      /* Light gray for cards/sections */
  --lwm-bg-muted: #f0f0f0;       /* Slightly darker for hover states */

  /* Accent (for CTAs, progress, active states) */
  --lwm-accent: #4a5568;         /* Slate gray - professional accent */
  --lwm-accent-hover: #2d3748;   /* Darker slate for hover */

  /* Borders */
  --lwm-border: #e2e8f0;         /* Light border */
  --lwm-border-dark: #cbd5e0;    /* Darker border for emphasis */

  /* Status colors */
  --lwm-success: #48bb78;        /* Green for completion */
  --lwm-warning: #ed8936;        /* Orange for attention */
}
```

### Color Notes

- The website uses a **restrained, professional palette**
- Avoids bright or saturated colors
- Relies on **typography and whitespace** rather than color for hierarchy
- **No orange or bold accent colors** - this is intentional brand positioning
- The calm, minimal aesthetic reflects the coaching philosophy

---

## 4. Typography

### Font Families

The website appears to use Squarespace's default modern sans-serif stack. For FlowForge, recommend:

**Primary Font:** Inter (already in FlowForge)
**Fallback:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Page Title) | 36-48px | 700 (Bold) | 1.2 |
| H2 (Section) | 28-32px | 600 (Semibold) | 1.3 |
| H3 (Subsection) | 20-24px | 600 (Semibold) | 1.4 |
| Body | 16-18px | 400 (Regular) | 1.6 |
| Small | 14px | 400 (Regular) | 1.5 |
| Caption | 12px | 500 (Medium) | 1.4 |

### Typography Principles

1. **Generous line height** - Reflects calm, readable approach
2. **Clear hierarchy** - Bold headlines, lighter body
3. **Ample whitespace** - Between paragraphs and sections
4. **Sentence case** - For most text (not ALL CAPS unless intentional)

---

## 5. Logo

### Logo Description
- Simple, professional wordmark
- "Clear background" version available (transparent PNG)
- Minimal design without complex graphics
- Works on both light and dark backgrounds

### Logo Usage
- Header: ~143px height (desktop), max 30px (mobile)
- Centered or left-aligned in header
- Adequate clear space around logo

### Logo Assets Needed from Mark
- [ ] Logo SVG (vector format)
- [ ] Logo PNG (high-res, transparent background)
- [ ] Logo PNG (dark version for light backgrounds)
- [ ] Logo PNG (light version for dark backgrounds)
- [ ] Favicon/icon version

---

## 6. Visual Style

### Layout Principles
- **Grid-based:** 8 columns (mobile), 24 columns (desktop)
- **Generous padding:** 6vw (mobile), 4vw (desktop)
- **Consistent gaps:** ~11px between elements
- **Breathing room:** Ample whitespace between sections

### Component Styling

**Buttons:**
```css
.btn-primary {
  background: var(--lwm-primary);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  border: none;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--lwm-primary-light);
}
```

**Cards:**
```css
.card {
  background: var(--lwm-bg);
  border: 1px solid var(--lwm-border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: none; /* Flat design, no shadows */
}
```

**Input Fields:**
```css
.input {
  background: var(--lwm-bg-subtle);
  border: 1px solid var(--lwm-border);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
}

.input:focus {
  border-color: var(--lwm-primary);
  outline: none;
}
```

### Design Principles

1. **Clean & Minimal** - No visual noise
2. **Professional** - Business-appropriate aesthetic
3. **Calm** - Reflects coaching philosophy
4. **Intentional** - Every element serves a purpose
5. **Accessible** - High contrast, readable text

---

## 7. Brand Voice

### Tone Attributes
- **Professional** - Business-appropriate language
- **Empathetic** - Acknowledges challenges without coddling
- **Direct** - Clear, no jargon
- **Grounded** - Practical, not theoretical
- **Hopeful** - Solutions-oriented

### Voice Examples

**Good:**
> "You are not struggling. You are leading in chaos without a map, minimal training, and no margin for error."

> "Stepping into coaching is a meaningful decision, and the first conversation matters."

**Avoid:**
- Corporate jargon
- Overly casual or colloquial language
- Therapy-speak
- Judgmental or deficit-focused framing

### Writing Style
- Second person ("you") for direct engagement
- Active voice
- Short, punchy sentences for impact
- Longer sentences for reflection

---

## 8. Imagery

### Photography Style
- **Professional headshots** - Business casual, approachable
- **Natural lighting** - Warm, inviting
- **Leadership contexts** - Office, meetings, thinking poses
- **Diverse representation** - When using stock imagery

### Image Treatment
- No heavy filters or effects
- Natural color grading
- Clean backgrounds preferred
- High quality, well-composed shots

### Icons
- **Lucide icons** (already in FlowForge)
- Simple, outlined style
- Consistent stroke width
- Minimal, purposeful usage

---

## 9. Application to Archetype Assessment

### Session Interface
- Clean, distraction-free design
- LWM logo in header
- Progress indicator in subtle accent color
- Generous whitespace around questions
- Professional, calm aesthetic

### Report Design
- Cover page with LWM branding
- Section headers in primary dark color
- Body text in standard text color
- Accent used sparingly for scores/highlights
- Footer: "Prepared by Leading with Meaning"

### Email Communications
- Simple, text-focused design
- LWM logo in header
- Minimal graphics
- Clear call-to-action buttons

---

## 10. Assets Checklist

### Needed from Mark

- [ ] **Logo files** (SVG, PNG in multiple sizes)
- [ ] **Color confirmation** (exact hex values if available)
- [ ] **Font preference** (confirm Inter or specify alternative)
- [ ] **Headshot** (high-res for reports)
- [ ] **Brand guidelines** (if existing documentation exists)
- [ ] **Favicon** (small icon for browser tab)

### To Create

- [ ] FlowForge theme configuration
- [ ] Report PDF template
- [ ] Email templates
- [ ] Session UI mockups

---

*Document prepared by BMad Master for FlowForge integration*
*Version 1.0 | December 31, 2025*
