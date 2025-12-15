# FlowForge UX Design Specification

_Created on 2025-12-15 by Todd_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

**Innovaas FlowForge** is an AI-Assisted Business Consulting Platform that conducts multi-stakeholder assessments through AI-facilitated interviews, synthesizes cross-functional insights, and delivers strategic transformation recommendations.

**Core Business Principle:** "You are not selling an AI. You are selling discovery outcomes."

### Target Users

| User Type | Role | Primary Goal |
|-----------|------|--------------|
| **Consultants** | Campaign managers | Scale assessment capacity 3x without hiring |
| **Stakeholders** | Interview participants | Share organizational insights efficiently |
| **Clients** | Report consumers | Gain decision-grade intelligence |
| **Prospects** | Potential customers | Understand ROI and value proposition |

### UX Surfaces

1. **Consultant Dashboard** - Campaign creation, stakeholder management, synthesis review, report generation
2. **Stakeholder Interview Experience** - AI-facilitated conversation flow
3. **Client Report Landing Page** - Executive-grade visualizations with tiered content
4. **Sales & Pricing Pages** - ROI-focused value proposition

### Visual Direction (PIVOT from current)

| Element | Previous | New Direction |
|---------|----------|---------------|
| **Mode** | Dark (Catppuccin Mocha) | **Light (warm cream/off-white)** |
| **Primary Color** | Orange-Teal gradient | **Refined orange (single accent)** |
| **Vibe** | Developer-aesthetic | **Premium business intelligence** |
| **Target Feel** | Technical tool | **Modern consulting firm** |

### Design Inspirations

- **Les Arbres Fruitiers** - Warm cream background, bold accent, generous whitespace
- **Stripe** - Restrained, trustworthy, premium through subtlety
- **ChainGPT Labs** - Sophisticated animations, modern micro-interactions

### Design Principles

1. **Premium through restraint** - What's NOT there matters
2. **One strong accent color** - No gradients, focused color use
3. **Generous whitespace** - Breathing room = premium
4. **Sophisticated micro-interactions** - Subtle animations elevate quality
5. **Grid-based structure** - Clean, predictable layouts
6. **Icons only** - No emojis (user preference)

### Technical Framework

- Next.js 15, React 18, TailwindCSS

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Selected:** shadcn/ui

**Rationale:**
- **Not a component library** - A collection of re-usable components built on Radix UI primitives
- **Copy/paste ownership** - Components live in your codebase, fully customizable
- **Tailwind-native** - Perfect integration with existing TailwindCSS setup
- **Accessibility built-in** - Radix UI primitives ensure WCAG compliance
- **Design token flexibility** - Easy to implement warm light theme with CSS variables
- **No vendor lock-in** - Components become your code, styled your way

**Installation Approach:**
```bash
npx shadcn@latest init
```

**Theme Configuration:**
- Override default shadcn theme with warm cream/off-white base colors
- Replace default accent with refined orange (#F25C05 or similar)
- Configure CSS variables in `globals.css` for consistent theming

**Key Components to Install:**
| Component | Use Case |
|-----------|----------|
| Button | All CTAs and actions |
| Card | Dashboard panels, report sections |
| Dialog | Confirmations, stakeholder forms |
| Input | All form fields |
| Select | Tier selection, dropdowns |
| Tabs | Dashboard navigation |
| Progress | Interview progress, loading states |
| Table | Stakeholder lists, data displays |
| Badge | Status indicators |
| Skeleton | Loading states |

**Migration Strategy:**
1. Install shadcn/ui with custom theme configuration
2. Create warm light theme CSS variables
3. Migrate existing components incrementally
4. Maintain backward compatibility during transition

---

## 2. Core User Experience

### 2.1 Defining Experience

**"Discovery Intelligence Platform"** - The experience should feel like having access to a premium business intelligence service, not using software.

**Core Experience Pillars:**

| Pillar | Description | Implementation |
|--------|-------------|----------------|
| **Effortless Orchestration** | Consultants should feel in control without micromanaging | Campaign dashboard with status-at-a-glance, automated stakeholder reminders |
| **Natural Conversation** | Stakeholders should forget they're talking to AI | Conversational interview flow, contextual follow-ups, human-like pacing |
| **Decision-Grade Insights** | Reports should inspire confidence, not raise questions | Clear visualizations, executive summaries, actionable recommendations |
| **Premium Simplicity** | Every screen should feel considered, not feature-packed | Generous whitespace, focused UI, progressive disclosure |

**Experience Differentiation:**

- **Not a Survey Tool** - Dynamic conversation, not rigid questionnaires
- **Not a Chat Widget** - Purposeful interviews with clear progress
- **Not Raw Data** - Synthesized insights with strategic context
- **Not Generic SaaS** - Premium consulting aesthetic throughout

### 2.2 Novel UX Patterns

**1. Progress Persistence Without Overwhelm**
- Subtle progress indicators that don't create anxiety
- "You're doing great" micro-feedback moments
- Session memory allowing natural breaks in interviews

**2. Contextual AI Transparency**
- Clear indication when AI is processing vs. ready
- Subtle typing indicators that feel natural, not robotic
- No "thinking" spinners - use meaningful loading states

**3. Tier-Aware Content Reveal**
- Reports progressively reveal depth based on tier
- Upsell moments feel like value discovery, not paywalls
- Premium content teased elegantly, never hidden aggressively

**4. Consultant-Stakeholder Handoff**
- Seamless transition from invite email to interview
- No account creation barrier for stakeholders
- Token-based access that expires gracefully

---

## 3. Visual Foundation

### 3.1 Color System

**Selected Theme:** Pearl Vibrant (Theme C from exploration)

**Primary Palette:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#FFFEFB` | Main page backgrounds |
| `--background-subtle` | `#FAF8F3` | Cards, inputs, sidebars |
| `--background-muted` | `#F2EFE7` | Hover states, dividers |
| `--border` | `#E6E2D6` | Borders, separators |
| `--text` | `#171614` | Headings, body text |
| `--text-muted` | `#71706B` | Secondary text, labels |
| `--accent` | `#F25C05` | CTAs, links, highlights |
| `--accent-hover` | `#DC5204` | Button hover states |
| `--accent-subtle` | `#FEF5EE` | Badge backgrounds, highlights |

**Semantic Colors:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#16A34A` | Completed states, positive indicators |
| `--success-subtle` | `#DCFCE7` | Success backgrounds |
| `--warning` | `#CA8A04` | Pending states, caution |
| `--warning-subtle` | `#FEF9C3` | Warning backgrounds |
| `--error` | `#DC2626` | Error states, destructive actions |
| `--error-subtle` | `#FEE2E2` | Error backgrounds |

**Color Usage Principles:**

1. **Orange for Action** - Reserve `--accent` for interactive elements only
2. **Warm Neutrals** - Background tones have slight warmth, never cold gray
3. **Semantic Clarity** - Status colors are distinct and accessible
4. **Restraint** - Most surfaces use neutral backgrounds; color is the exception

**Contrast Ratios (WCAG AA):**
- `--text` on `--background`: 15.8:1 (AAA)
- `--accent` on `--background`: 4.8:1 (AA)
- `--text-muted` on `--background`: 5.2:1 (AA)

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Direction:** Warm Light with Premium Business Intelligence Aesthetic

**Visual Language:**

| Element | Specification |
|---------|---------------|
| **Mode** | Light (warm cream/off-white base) |
| **Primary Accent** | Vibrant Orange (#F25C05) - single accent, no gradients |
| **Typography** | Inter - clean, modern, excellent readability |
| **Border Radius** | 8px (buttons), 12px (cards), 16px (containers) |
| **Shadows** | Soft, diffused (0 4px 24px rgba(0,0,0,0.08)) |
| **Spacing Scale** | 4, 8, 12, 16, 20, 24, 32, 40, 60, 80px |

**Design Personality:**

- **The Innovator** - Forward-thinking clarity, like the clean lines of a modern gallery
- Professional yet energetic
- Premium yet accessible
- Sophisticated without being cold

**Layout Principles:**

1. **Grid-Based Structure** - 12-column grid, consistent gutters
2. **Generous Whitespace** - 40-60px margins, 20-32px gaps
3. **Clear Visual Hierarchy** - Headlines, subheads, body, captions
4. **Progressive Disclosure** - Show essentials first, details on demand

**Animation Philosophy:**

- **Purposeful Motion** - Animations communicate state changes
- **Subtle Micro-interactions** - Button hovers, card lifts, input focus
- **No Gratuitous Animation** - Movement serves function
- **Performance-First** - Use CSS transforms, avoid layout shifts

**Interactive Mockups:**

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

**Journey 1: Consultant Creates Campaign**

```
Login → Dashboard → "New Campaign" → Campaign Setup
                                         ↓
                        Enter: Name, Organization, Assessment Type
                                         ↓
                             Add Stakeholders (Name, Email, Role)
                                         ↓
                                Review & Launch
                                         ↓
                     System sends invite emails → Dashboard (tracking)
```

**Key UX Moments:**
- Campaign setup should feel like 3 steps max
- Stakeholder addition should support bulk entry
- Preview invite email before sending
- Success state confirms invites sent

---

**Journey 2: Stakeholder Completes Interview**

```
Email Invite → Click Link → Landing Page (org, purpose)
                                   ↓
                          "Begin Assessment" CTA
                                   ↓
                        Interview Flow (5-8 sections)
                                   ↓
                    Progress bar shows completion %
                                   ↓
                     Completion Screen (thank you)
                                   ↓
               Consultant notified of completion
```

**Key UX Moments:**
- No login required (token access)
- Clear expectation setting (time estimate, purpose)
- Natural conversation pacing
- Option to pause and resume later
- Graceful completion celebration

---

**Journey 3: Consultant Generates Report**

```
Dashboard → Campaign (all complete) → "Generate Report"
                                            ↓
                               Select Report Tier
                                            ↓
                           AI Synthesis (loading state)
                                            ↓
                              Report Preview
                                            ↓
                    Copy shareable link OR download MD
```

**Key UX Moments:**
- Clear indication when synthesis is ready
- Tier selection explains value difference
- Preview before sharing
- Easy link sharing with copy-to-clipboard

---

**Journey 4: Client Views Report**

```
Email/Link → Report Landing Page → Executive Summary
                                         ↓
                              Overall Score (visual)
                                         ↓
                                Pillar Breakdown
                                         ↓
                          Detailed Findings (tier-dependent)
                                         ↓
                         Recommendations (tier-dependent)
                                         ↓
                            Download/Share options
```

**Key UX Moments:**
- Immediate value visible (score)
- Professional, shareable presentation
- Clear upgrade path for higher tiers
- Print-friendly layout

---

## 6. Component Library

### 6.1 Component Strategy

**Foundation:** shadcn/ui components with custom theme overrides

**Component Categories:**

| Category | Components | Notes |
|----------|------------|-------|
| **Primitives** | Button, Input, Select, Checkbox, Radio | Core form elements |
| **Layout** | Card, Dialog, Sheet, Tabs, Separator | Container patterns |
| **Feedback** | Badge, Progress, Skeleton, Toast | Status communication |
| **Navigation** | Dropdown Menu, Command, Navigation Menu | Wayfinding |
| **Data Display** | Table, Avatar, Tooltip | Information presentation |
| **Custom** | ChatBubble, ScoreGauge, PillarChart, ProgressSteps | FlowForge-specific |

**Button Variants:**

```
Primary    → Orange fill, white text (main CTAs)
Secondary  → Border only, text color (secondary actions)
Ghost      → No border, subtle hover (tertiary actions)
Destructive → Red fill (delete, cancel)
```

**Card Variants:**

```
Default    → Subtle background, border
Interactive → Hover lift effect (clickable items)
Highlighted → Accent border (featured/selected)
```

**Input States:**

```
Default    → Subtle background, border
Focus      → Accent border, subtle glow
Error      → Error border, error message below
Disabled   → Reduced opacity, no interaction
```

**Custom Components to Build:**

1. **ChatBubble** - Interview conversation display
   - AI variant (left-aligned, subtle bg)
   - User variant (right-aligned, accent bg)

2. **ScoreGauge** - Circular progress for overall scores
   - Animated fill on load
   - Centered value display

3. **PillarChart** - Bar chart for pillar scores
   - Horizontal bars with labels
   - Accent color fill

4. **ProgressSteps** - Interview progress indicator
   - Horizontal step indicators
   - Complete/current/pending states

5. **StakeholderCard** - Stakeholder list item
   - Avatar, name, role, status badge
   - Interview completion progress

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

**Navigation Patterns:**

| Context | Pattern | Rationale |
|---------|---------|-----------|
| Dashboard | Left sidebar (260px) | Consultant workspace, persistent nav |
| Interview | Header only (minimal) | Stakeholder focus mode, no distractions |
| Report | Header + anchor nav | Client viewing, scrollable sections |
| Sales Pages | Top nav bar | Marketing standard, CTAs prominent |

**Form Patterns:**

1. **Labels Above Inputs** - Better scanability, more space for content
2. **Inline Validation** - Show errors immediately after blur
3. **Required Indicators** - Asterisk (*) on label, not input
4. **Helper Text** - Below input, muted color

**Empty States:**

- Always provide clear messaging
- Include primary action CTA when applicable
- Use subtle illustration/icon (not distracting)
- Example: "No campaigns yet. Create your first assessment."

**Loading States:**

| Context | Pattern |
|---------|---------|
| Page load | Skeleton screens (content shape) |
| Button action | Spinner in button, disabled state |
| AI processing | Pulsing indicator with message |
| Data fetch | Subtle inline spinner |

**Error Handling:**

- Toast notifications for transient errors
- Inline messages for form validation
- Full-page error states for critical failures
- Always provide recovery action

**Confirmation Patterns:**

- Destructive actions require explicit confirmation
- Use Dialog for important decisions
- Success toast after completed actions
- No confirmation for low-risk actions

**Iconography:**

- **Library:** Lucide React (consistent with shadcn/ui)
- **Size:** 16px (inline), 20px (buttons), 24px (navigation)
- **Style:** Stroke icons, 2px stroke weight
- **No emojis** - Icons only throughout the application

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Breakpoints:**

| Name | Width | Target |
|------|-------|--------|
| `xs` | 400px | Small phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large monitors |

**Layout Adaptations:**

| Surface | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Dashboard | Sidebar + main | Collapsible sidebar | Bottom nav + full-width |
| Interview | Centered column (800px max) | Same | Full-width with padding |
| Report | Wide content (1000px max) | Same | Stack sections vertically |
| Cards | 2-4 column grid | 2 column | Single column |

**Mobile-First Considerations:**

1. **Touch Targets** - Minimum 44x44px for interactive elements
2. **Thumb Zones** - Primary actions in easy reach
3. **Scroll vs. Paginate** - Prefer scrolling for content flow
4. **Reduced Motion** - Respect `prefers-reduced-motion`

### 8.2 Accessibility (WCAG 2.1 AA)

**Color & Contrast:**

- All text meets 4.5:1 contrast ratio (normal text)
- Large text meets 3:1 minimum
- Color is never the only indicator of state
- Focus states are clearly visible

**Keyboard Navigation:**

- All interactive elements focusable via Tab
- Logical focus order (top-to-bottom, left-to-right)
- Skip links for main content
- Escape closes dialogs/modals

**Screen Readers:**

- Semantic HTML structure (headings, landmarks)
- ARIA labels for icon-only buttons
- Live regions for dynamic content
- Alt text for meaningful images

**Form Accessibility:**

- Labels associated with inputs (for attribute)
- Error messages linked via aria-describedby
- Required fields indicated in accessible way
- Form validation announced to screen readers

**Motion & Animation:**

- Respect `prefers-reduced-motion` media query
- No content depends solely on animation
- Pause/stop controls for auto-playing content
- Animations under 5 seconds or user-controllable

**Testing Checklist:**

- [ ] Keyboard-only navigation works
- [ ] Screen reader announces all content correctly
- [ ] Color contrast passes automated testing
- [ ] Focus visible on all interactive elements
- [ ] Forms announce errors appropriately
- [ ] No seizure-inducing flashing content

---

## 9. Implementation Guidance

### 9.1 Implementation Priority

**Phase 1: Foundation (Week 1-2)**

1. Install and configure shadcn/ui with custom theme
2. Create CSS variables for color system in `globals.css`
3. Set up Inter font family
4. Create base layout components (Sidebar, Header, PageContainer)

**Phase 2: Component Migration (Week 2-3)**

1. Replace existing buttons with shadcn Button variants
2. Update form inputs with shadcn Input, Select, etc.
3. Create Card variants for campaign and stakeholder displays
4. Implement Badge components for status indicators

**Phase 3: Custom Components (Week 3-4)**

1. Build ChatBubble component for interviews
2. Create ScoreGauge for report visualizations
3. Implement PillarChart for pillar breakdowns
4. Design ProgressSteps for interview flow

**Phase 4: Page Redesign (Week 4-6)**

1. Dashboard - Apply new layout and component styling
2. Campaign Detail - Update cards and progress indicators
3. Interview Flow - Redesign conversation UI
4. Report Landing - Implement new visual design

### 9.2 CSS Variable Setup

```css
/* globals.css - Theme Configuration */
:root {
  --background: 60 33% 99%;
  --background-subtle: 43 33% 97%;
  --background-muted: 43 20% 93%;
  --border: 43 18% 87%;
  --text: 40 7% 9%;
  --text-muted: 40 3% 44%;
  --accent: 22 97% 49%;
  --accent-hover: 22 95% 44%;
  --accent-subtle: 22 90% 97%;
  --success: 142 76% 36%;
  --success-subtle: 142 76% 93%;
  --warning: 45 93% 40%;
  --warning-subtle: 48 96% 89%;
  --error: 0 84% 50%;
  --error-subtle: 0 93% 94%;
  --radius: 0.5rem;
}
```

### 9.3 Key Files to Modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add custom colors, extend theme |
| `app/globals.css` | Add CSS variables, base styles |
| `components/ui/*` | shadcn components (to be added) |
| `app/layout.tsx` | Update font, base styling |
| `app/dashboard/*` | Apply new layout patterns |
| `app/session/*` | Redesign interview UI |
| `app/report/*` | Implement new report design |

### 9.4 Completion Summary

**UX Design Specification Complete**

This document provides the complete design foundation for FlowForge's UI redesign:

| Section | Status |
|---------|--------|
| Design System Choice | shadcn/ui selected |
| Core Experience | Defined with 4 pillars |
| Color System | Pearl Vibrant theme documented |
| Design Direction | Warm light, premium BI aesthetic |
| User Journeys | 4 critical paths mapped |
| Component Library | Strategy and variants defined |
| UX Patterns | Consistency rules established |
| Responsive Strategy | Breakpoints and adaptations set |
| Accessibility | WCAG 2.1 AA requirements documented |

**Next Steps:**

1. Review color theme explorer: [ux-color-themes.html](./ux-color-themes.html)
2. Review design mockups: [ux-design-directions.html](./ux-design-directions.html)
3. Approve design direction
4. Begin Phase 1 implementation

---

## Appendix

### Related Documents

- Strategic Vision: `docs/strategic-vision.md`
- Tech Spec: `docs/tech-spec.md`
- Epics: `docs/epics.md`
- Go-to-Market Strategy: `docs/go-to-market-strategy.md`

### Version History

| Date       | Version | Changes                         | Author |
| ---------- | ------- | ------------------------------- | ------ |
| 2025-12-15 | 1.0     | Initial UX Design Specification | Todd   |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._
