# Spec Requirements Document

> Spec: Consulting-Grade Report Redesign
> Created: 2025-11-23
> Status: Planning

## Overview

Transform the current functional dashboard into a $250k McKinsey/BCG/PWC-quality consulting report with custom strategic frameworks, AI-generated illustrations, sophisticated typography, and narrative-driven visual storytelling.

## Problem Statement

**Current State**: Basic data visualization dashboard
- Standard charts (radar, bar, progress)
- Generic UI components
- No strategic frameworks
- Lacks visual narrative
- Corporate dashboard aesthetic, not consulting presentation

**Desired State**: Premium consulting-grade report
- Custom strategic frameworks (2x2 matrices, transformation roadmaps)
- AI-generated concept illustrations (via Google Gemini)
- Sophisticated typography and white space
- Visual narrative that builds to recommendations
- Executive one-pager with key insights
- Professional presentation quality

**Gap**: Missing the strategic storytelling, custom visualizations, and premium design that command C-suite attention and justify consulting fees.

## User Stories

### Story 1: Executive One-Pager

As a **C-suite executive**, I want a single-page visual summary of the entire assessment, so that I can grasp the strategic situation, priorities, and recommended actions in 60 seconds without reading the full report.

**Workflow:**
1. Executive receives report link
2. First page loads as visual executive summary
3. Sees at-a-glance:
   - Overall readiness score with visual context
   - 2x2 priority matrix (Impact vs. Effort)
   - Top 3 strategic imperatives
   - Critical path forward (visual roadmap)
   - One-sentence "so what?" insight
4. Can dive deeper into sections or share the one-pager

**Problem Solved:** Executives don't have time for 40-page reports. One visual page makes the assessment actionable immediately.

### Story 2: Strategic Framework Visualizations

As a **transformation leader**, I want to see our maturity positioned on industry-standard frameworks (capability heat maps, maturity matrices, transformation roadmaps), so that I can understand where we stand and plan the journey strategically.

**Workflow:**
1. Navigate to Strategic Position section
2. See custom 2x2 matrix: Current state vs. Target state
3. View heat map: Capabilities across dimensions
4. Explore transformation roadmap: Phased journey with milestones
5. Compare to industry benchmarks (visual comparison)
6. Identify quick wins vs. strategic investments

**Problem Solved:** Generic charts don't show strategic positioning. Frameworks provide context and guide decision-making.

### Story 3: AI-Generated Visual Storytelling

As a **consultant**, I want each pillar and recommendation to have custom AI-generated illustrations that make abstract concepts tangible, so that clients remember and act on the insights.

**Workflow:**
1. Generate report with Gemini AI integration
2. System creates custom illustrations for:
   - Technology transformation (e.g., digital infrastructure visual)
   - Process evolution (e.g., workflow optimization diagram)
   - Organizational change (e.g., culture transformation metaphor)
3. Each recommendation includes visual representation
4. Client sees visual narrative, not just text

**Problem Solved:** Text and generic charts are forgettable. Custom visuals create memorable insights that drive action.

### Story 4: Narrative-Driven Layout

As a **stakeholder**, I want the report to tell a compelling story from current state → analysis → insights → recommendations → roadmap, so that I understand the logic and feel confident in the proposed path forward.

**Workflow:**
1. Page 1: Executive summary (the answer)
2. Page 2: Current state assessment (where we are)
3. Page 3: Dimensional analysis (deep dive)
4. Page 4: Strategic insights (what it means)
5. Page 5: Prioritized recommendations (what to do)
6. Page 6: Implementation roadmap (how to get there)
7. Each page builds on the previous, creating logical flow

**Problem Solved:** Stacked sections feel disjointed. Narrative flow creates coherent argument and builds buy-in.

## Spec Scope

### 1. Executive One-Pager Component
- Hero metric with context (score + meaning)
- 2x2 priority matrix (Impact vs. Effort for all dimensions)
- Top 3 strategic imperatives (visual callouts)
- Critical path visual (simplified roadmap)
- "So what?" insight box
- Custom layout (not standard grid)

### 2. Strategic Framework Components
- **Priority Matrix**: 2x2 with bubble sizing for effort
- **Capability Heat Map**: Pillar x Dimension grid with color intensity
- **Maturity Curve**: Line chart showing progression path
- **Transformation Roadmap**: Gantt-style timeline with phases
- **Comparison Charts**: Current vs. Target state side-by-side
- **MECE Framework**: Visual breakdown of analysis structure

### 3. AI Illustration Integration (Google Gemini)
- Generate pillar-specific concept illustrations
- Create visual metaphors for transformation themes
- Design process flow diagrams
- Produce custom framework diagrams
- Cache generated images for reuse
- Fallback to icons if generation fails

### 4. Premium Typography & Layout System
- Multi-column layouts (not just stacked sections)
- Strategic white space (80-100pt margins)
- Typography scale: Display → Headline → Title → Body
- Pull quotes with visual treatment
- Section dividers with visual interest
- Annotated chart insights ("So what?")

### 5. Narrative Page Structure
- Page 1: Executive One-Pager
- Page 2: Current State Assessment
- Page 3: Dimensional Deep Dive
- Page 4: Strategic Insights & Themes
- Page 5: Prioritized Action Plan
- Page 6: Implementation Roadmap
- Each page is self-contained visual story

### 6. Enhanced Recommendations Section
- Recommendation cards with:
  - Impact score (High/Medium/Low)
  - Effort estimate (Quick win / Strategic investment)
  - Time horizon (0-3 months / 3-6 months / 6-12 months)
  - Dependencies visualization
  - Expected outcomes
  - Visual priority indicator
- Grouped by strategic theme
- Sequenced for maximum impact

### 7. Implementation Roadmap Visualization
- Phased approach (Foundation → Build → Scale)
- Timeline with milestones
- Dependency arrows between initiatives
- Resource allocation indicators
- Risk callouts
- Quick wins highlighted
- Gantt-style visual

## Out of Scope

- **Animated Transitions**: Static visuals only (no motion graphics)
- **Interactive Drill-Downs**: One-way presentation (no filtering/pivoting)
- **Real-Time Collaboration**: Static report sharing only
- **Multi-Language Support**: English only
- **Custom Branding**: Uses platform branding (no client logo upload)
- **PDF with AI Images**: Web-only for now (PDF remains text-based)

## Expected Deliverable

1. **Executive One-Pager** - Single scrollable page with complete strategic summary
2. **Strategic Frameworks** - 2x2 matrix, heat map, maturity curve, roadmap all functional
3. **AI-Generated Illustrations** - 3-5 custom visuals per report (pillar illustrations, concepts)
4. **Premium Layout** - Multi-column, generous white space, sophisticated typography
5. **Narrative Flow** - 6 distinct "pages" that tell cohesive story
6. **Action-Oriented Recommendations** - Impact/Effort scoring, timeline, dependencies visualized

## Acceptance Criteria

### Visual Quality
- [ ] Report looks like McKinsey/BCG presentation (comparable to $250k engagement)
- [ ] Typography hierarchy is immediately clear (3+ levels)
- [ ] White space creates visual breathing room (80-100pt margins)
- [ ] Color usage is strategic, not decorative
- [ ] AI illustrations are professional and on-brand

### Strategic Frameworks
- [ ] 2x2 priority matrix positions all dimensions correctly
- [ ] Heat map shows capability gaps clearly
- [ ] Transformation roadmap shows phased approach with dependencies
- [ ] Each framework includes "so what?" annotation

### Narrative Flow
- [ ] Executive one-pager tells complete story in 60 seconds
- [ ] Each section builds logically on previous
- [ ] Recommendations directly tie to dimensional findings
- [ ] Roadmap connects to priority matrix (quick wins vs. strategic bets)

### AI Integration
- [ ] Google Gemini generates pillar-specific illustrations
- [ ] Generated images are cached and reused
- [ ] Fallback to icons works gracefully
- [ ] Image generation doesn't block page load

### Responsiveness
- [ ] Desktop (1440px+): Full multi-column layouts
- [ ] Tablet (768-1439px): Simplified layouts, key visuals preserved
- [ ] Mobile (375-767px): Single column, frameworks stack vertically

### Performance
- [ ] AI image generation happens async (doesn't block render)
- [ ] Page load remains <3 seconds
- [ ] Frameworks render smoothly (no lag)

---

## Technical Approach

### AI Illustration Generation

**Google Gemini Integration:**
```typescript
// lib/ai-illustration-generator.ts
async function generatePillarIllustration(pillar: string, context: string): Promise<string> {
  // Use Gemini to generate concept illustration
  // Return base64 or URL
}
```

**Prompt Engineering:**
- "Create a professional business illustration representing [pillar] transformation"
- Style: "Clean, modern, McKinsey-style consulting diagram"
- Format: SVG or PNG, 800x600px
- Color palette: Brand colors (orange/teal) + mocha theme

### Strategic Framework Data Transformations

**Priority Matrix:**
```typescript
interface MatrixPosition {
  dimension: string
  impact: number // 1-5
  effort: number // 1-5
  size: number // bubble size
  color: string
}
```

**Heat Map:**
```typescript
interface HeatMapCell {
  pillar: string
  dimension: string
  score: number // 0-5
  intensity: number // 0-100%
  gap: number // distance to target
}
```

### Page-Based Layout System

Each "page" is a full-viewport section with custom layout:
- Page 1: Custom grid (not Tailwind defaults)
- Page 2-6: Mix of single/multi-column
- Scroll behavior: Smooth scroll to sections
- Navigation: Sticky header with page indicators

---

## Design Principles

### From McKinsey/BCG Best Practices

1. **Answer First** - Executive summary shows conclusion, not intro
2. **MECE** - Mutually Exclusive, Collectively Exhaustive structure
3. **Pyramid Principle** - Support each assertion with evidence
4. **Visual > Text** - Every insight should have visual representation
5. **White Space** - Let content breathe (80-100pt margins)
6. **Annotation** - Every chart needs "so what?" callout
7. **Action-Oriented** - Every insight leads to recommendation

### Typography Scale

```css
Display: 48px/1.2 (Executive one-pager title)
Headline: 36px/1.3 (Page titles)
Title: 24px/1.4 (Section headers)
Subtitle: 18px/1.5 (Subsections)
Body: 16px/1.6 (Main text)
Caption: 14px/1.5 (Chart labels)
```

### Color Strategy

- **Brand Orange**: Primary actions, key metrics, highlights
- **Brand Teal**: Secondary elements, supporting data
- **Traffic Light**: Green (strong), Yellow (developing), Orange (nascent), Red (critical gap)
- **Neutrals**: Mocha theme for backgrounds, text
- **Accent**: Use sparingly for emphasis

---

## Implementation Phases

### Phase 1: Strategic Frameworks (Priority 1)
- 2x2 Priority Matrix component
- Capability Heat Map component
- Transformation Roadmap component
- Data transformation utilities

### Phase 2: AI Integration (Priority 1)
- Google Gemini client setup
- Image generation utilities
- Caching mechanism
- Fallback handling

### Phase 3: Premium Layout System (Priority 2)
- Multi-column layout components
- Typography scale implementation
- White space system
- Page-based structure

### Phase 4: Executive One-Pager (Priority 1)
- Hero metric component
- Mini priority matrix
- Strategic imperatives display
- "So what?" insight box

### Phase 5: Enhanced Recommendations (Priority 2)
- Impact/Effort scoring display
- Timeline visualization
- Dependency mapping
- Grouped by theme

### Phase 6: Polish & Testing (Priority 3)
- Visual QA
- Responsive testing
- AI generation testing
- Performance optimization

---

## Success Metrics

**Qualitative:**
- Looks indistinguishable from McKinsey/BCG report
- Executives can understand strategy in 60 seconds
- Clients remember key insights (visual stickiness)

**Quantitative:**
- <5 second total load time (including AI generation)
- 90+ Lighthouse performance score
- <10 seconds to generate all AI illustrations
- Zero layout shift after images load

---

## Related Documentation

- Design Guidelines: @docs/report-design-guidelines.md
- PDF Guidelines: @docs/pdf-design-guidelines.md
- Current Implementation: @.agent-os/specs/2025-11-23-report-visual-transformation/
- Google Gemini Docs: https://ai.google.dev/gemini-api/docs

---

## Next Steps

1. Create detailed technical specification
2. Design each strategic framework component
3. Build AI illustration integration
4. Implement premium layout system
5. Construct executive one-pager
6. Test with real assessment data
7. Iterate based on visual quality
