# Leading with Meaning - Brand Guide

> Brand reference documentation for FlowForge integration
> Last Updated: 2026-01-05

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

### Primary Colors (From Website)

The Leading with Meaning brand uses **deep navy blue** as the primary color with **warm coral** accents:

| Color | Hex | Usage |
|-------|-----|-------|
| **Brand Navy** | `#1e3a5f` | Logo, primary buttons, headings, body text |
| **Brand Navy Hover** | `#153050` | Button hover states |
| **Coral Accent** | `#c4776a` | Highlights, accent text, decorative elements |
| **Text Muted** | `#5a6a7a` | Secondary text, captions |
| **Background** | `#f5f3ef` | Warm beige page backgrounds |
| **Background Subtle** | `#ebe8e3` | Cards, input fields, sections |
| **Border** | `#e0dcd5` | Borders, dividers |

### FlowForge Theme Configuration

```css
:root {
  /* Brand Colors - matched to leadingwithmeaning.com */
  --brand-primary: #1e3a5f;        /* Deep navy from logo */
  --brand-primary-hover: #153050;  /* Darker navy for hover */
  --brand-secondary: #c4776a;      /* Coral accent color */
  --brand-bg: #f5f3ef;             /* Warm beige background */
  --brand-bg-subtle: #ebe8e3;      /* Slightly darker beige for cards */
  --brand-text: #1e3a5f;           /* Navy text (matches brand) */
  --brand-text-muted: #5a6a7a;     /* Muted blue-gray text */
  --brand-border: #e0dcd5;         /* Warm gray border */
}
```

### Color Notes

- Primary brand color is **deep navy blue** (#1e3a5f) - used for logo, text, and buttons
- Secondary **coral accent** (#c4776a) - used for highlights and decorative elements
- **Warm beige backgrounds** (#f5f3ef) - creates an inviting, calm aesthetic
- The color palette reflects the coaching philosophy: grounded, warm, professional
- Navy text on beige backgrounds provides excellent readability

---

## 4. Typography

### Font Families

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
- **Design:** Square frame containing stylized "LWM" letters with compass/directional element
- **Text:** "LEADING WITH MEANING" with "COACHING" below
- **Color:** Deep navy blue (#1e3a5f) on transparent/white background
- **Style:** Professional, geometric, balanced

### Logo Files
- **Primary:** `lwm_logo.png` (transparent background, navy on white)
- **Location:** `/docs/leadingwithmeaning/brand/lwm_logo.png`
- **Also copied to:** `/public/brand/lwm_logo.png` for web access

### Logo Usage
- Header: 120-180px width, maintain aspect ratio
- Centered in branded pages
- Adequate clear space around logo (minimum 20px)
- Use on white or light backgrounds

### Logo Assets
- [x] Logo PNG (transparent background) - `lwm_logo.png`
- [ ] Logo SVG (vector format) - request from Mark
- [ ] Favicon/icon version - request from Mark

---

## 6. Visual Style

### Layout Principles
- **Grid-based:** Responsive design
- **Generous padding:** 24-40px on mobile, 40-60px on desktop
- **Consistent spacing:** 16/24/32/48px scale
- **Breathing room:** Ample whitespace between sections

### Component Styling

**Buttons:**
```css
.btn-primary {
  background: #1e3a5f;
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  border: none;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #153050;
}
```

**Cards:**
```css
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: none; /* Flat design, no shadows */
}
```

**Input Fields:**
```css
.input {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
}

.input:focus {
  border-color: #1e3a5f;
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
- **LWM logo prominently displayed in header**
- Progress indicator in brand navy color
- Generous whitespace around questions
- Professional, calm aesthetic

### Report Design
- Cover page with LWM branding
- Section headers in brand navy (#1e3a5f)
- Body text in dark gray (#1a202c)
- Accent used sparingly for scores/highlights
- Footer: "Prepared by Leading with Meaning"

### Email Communications
- Simple, text-focused design
- LWM logo in header
- Brand navy for CTA buttons
- Minimal graphics
- Clear call-to-action buttons

---

## 10. Database Configuration

### Tenant Profile brand_config

```json
{
  "logo": {
    "url": "/flowforge/brand/lwm_logo.png",
    "alt": "Leading with Meaning",
    "width": 200
  },
  "colors": {
    "primary": "#1e3a5f",
    "primaryHover": "#153050",
    "secondary": "#c4776a",
    "background": "#f5f3ef",
    "backgroundSubtle": "#ebe8e3",
    "text": "#1e3a5f",
    "textMuted": "#5a6a7a",
    "border": "#e0dcd5"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },
  "tagline": "Leadership Coaching",
  "welcomeMessage": "Lead with clarity. Manage with confidence. Do your best work without losing yourself.",
  "completionMessage": "Thank you for completing your Leadership Archetype Assessment. Your insights have been recorded and will help guide our coaching conversation.",
  "showPoweredBy": true
}
```

---

## 11. Assets Checklist

### Available
- [x] Logo PNG (transparent background)
- [x] Brand colors (derived from logo)
- [x] Typography specifications
- [x] Component styling guide

### Needed from Mark
- [ ] Logo SVG (vector format for crisp scaling)
- [ ] Favicon (small icon for browser tab)
- [ ] Headshot (high-res for reports)
- [ ] Confirmation of any color preferences

---

*Document prepared for FlowForge integration*
*Version 2.0 | January 5, 2026*
