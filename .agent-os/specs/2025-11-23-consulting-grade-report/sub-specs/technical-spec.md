# Technical Specification

> Consulting-Grade Report Redesign
> Created: 2025-11-23

## Architecture Overview

Transform current basic visualization into McKinsey/BCG-quality presentation with:
1. Strategic framework components (2x2 matrix, heat map, Gantt roadmap)
2. AI-generated illustrations via Google Gemini
3. Premium multi-column layout system
4. Page-based narrative structure
5. Enhanced typography and white space

---

## 1. Strategic Framework Components

### 1.1 Priority Matrix (2x2 Impact vs. Effort)

**Component**: `PriorityMatrix.tsx`

**Visual Specification:**
```
High Impact │ [Strategic Bets]    [Quick Wins]
            │     (Orange)          (Green)
            │
            │ [Long-term]        [Fill-ins]
Low Impact  │   (Gray)            (Yellow)
            └────────────────────────────────
             High Effort      Low Effort
```

**Data Structure:**
```typescript
interface MatrixDimension {
  dimension: string
  pillar: string
  score: number // current maturity
  impact: number // 1-5, derived from priority + score gap
  effort: number // 1-5, derived from maturity level
  quadrant: 'quick-wins' | 'strategic-bets' | 'fill-ins' | 'long-term'
}

function transformToMatrixData(assessment: ReadinessAssessment): MatrixDimension[] {
  return assessment.pillars.flatMap(pillar =>
    pillar.dimensions.map(dim => ({
      dimension: dim.dimension,
      pillar: pillar.pillar,
      score: dim.score,
      impact: calculateImpact(dim), // priority + gap to target
      effort: calculateEffort(dim), // based on maturity level
      quadrant: determineQuadrant(impact, effort)
    }))
  )
}

function calculateImpact(dim: DimensionalScore): number {
  // Critical/Important = high impact
  const priorityWeight = {
    critical: 5,
    important: 4,
    foundational: 3,
    opportunistic: 2
  }[dim.priority]

  // Larger gap to target = higher impact
  const gapWeight = (5 - dim.score) / 5 * 2

  return Math.min(5, priorityWeight * 0.7 + gapWeight * 0.3)
}

function calculateEffort(dim: DimensionalScore): number {
  // Lower maturity = higher effort
  const maturityEffort = {
    '0-1': 5, // Newcomer/Beginner - high effort
    '1-2': 4, // Beginner/Intermediate
    '2-3': 3, // Intermediate/Experienced
    '3-4': 2, // Experienced/Expert
    '4-5': 1  // Expert/Leader - low effort
  }

  // Find bucket
  if (dim.score < 1) return 5
  if (dim.score < 2) return 4
  if (dim.score < 3) return 3
  if (dim.score < 4) return 2
  return 1
}
```

**Rendering:**
- SVG-based scatter plot
- Bubble size = score (larger = more mature)
- Color by quadrant
- Hoverable with dimension name + scores
- Annotations: "Quick Wins", "Strategic Bets", etc.

**Implementation:**
```tsx
export function PriorityMatrix({ data }: { data: MatrixDimension[] }) {
  return (
    <svg width="600" height="400" viewBox="0 0 600 400">
      {/* Grid lines */}
      <line x1="300" y1="0" x2="300" y2="400" stroke="#313244" />
      <line x1="0" y1="200" x2="600" y2="200" stroke="#313244" />

      {/* Quadrant labels */}
      <text x="450" y="100" className="text-sm text-mocha-subtext0">Quick Wins</text>
      <text x="450" y="300" className="text-sm text-mocha-subtext0">Fill-ins</text>
      <text x="150" y="100" className="text-sm text-mocha-subtext0">Strategic Bets</text>
      <text x="150" y="300" className="text-sm text-mocha-subtext0">Long-term</text>

      {/* Bubbles */}
      {data.map((dim, i) => (
        <circle
          key={i}
          cx={effortToX(dim.effort)}
          cy={impactToY(dim.impact)}
          r={scoreToRadius(dim.score)}
          fill={quadrantColor(dim.quadrant)}
          opacity="0.8"
        />
      ))}

      {/* Axis labels */}
      <text x="300" y="390" textAnchor="middle">Effort →</text>
      <text x="10" y="200" transform="rotate(-90, 10, 200)">Impact →</text>
    </svg>
  )
}
```

---

### 1.2 Capability Heat Map

**Component**: `CapabilityHeatMap.tsx`

**Visual Specification:**
```
          │ Tech │ Process │ Org │
──────────┼──────┼─────────┼─────┤
Infra     │ 🟢   │         │     │ 4.2
Analytics │ 🟡   │         │     │ 3.1
Security  │ 🟠   │         │     │ 2.5
Ops Int   │      │ 🟢      │     │ 4.0
Supply    │      │ 🟡      │     │ 3.3
Innov     │      │ 🟠      │     │ 2.8
Talent    │      │         │ 🟡  │ 3.5
Strategy  │      │         │ 🟢  │ 4.1
```

**Data Structure:**
```typescript
interface HeatMapCell {
  pillar: string
  dimension: string
  score: number
  intensity: number // 0-100, for color opacity
  gap: number // distance to target (5.0)
}

function transformToHeatMapData(assessment: ReadinessAssessment): HeatMapCell[][] {
  // Create matrix: rows = dimensions, cols = pillars
  const maxDimensions = Math.max(...assessment.pillars.map(p => p.dimensions.length))

  return Array.from({ length: maxDimensions }, (_, rowIdx) =>
    assessment.pillars.map(pillar => {
      const dim = pillar.dimensions[rowIdx]
      return dim ? {
        pillar: pillar.pillar,
        dimension: dim.dimension,
        score: dim.score,
        intensity: (dim.score / 5) * 100,
        gap: 5 - dim.score
      } : null
    }).filter(Boolean)
  )
}
```

**Rendering:**
- CSS Grid for table structure
- Color intensity based on score (0 = red, 5 = green)
- Show score value in cell
- Row/column headers
- Tooltip with gap to target

---

### 1.3 Transformation Roadmap (Gantt-Style)

**Component**: `TransformationRoadmap.tsx`

**Visual Specification:**
```
Phase 1: Foundation (0-3 months)
├── Quick Win 1 ████████░░░░░░░░ (2 weeks)
├── Quick Win 2 ░░████████░░░░░░ (2 weeks)
└── Foundation  ░░░░░░████████░░ (8 weeks)

Phase 2: Build (3-6 months)
├── Strategic 1 ░░░░░░░░░░██████ (12 weeks)
└── Strategic 2 ░░░░░░░░░░░░████ (8 weeks)

Phase 3: Scale (6-12 months)
└── Transform   ░░░░░░░░░░░░░░██ (24 weeks)
```

**Data Structure:**
```typescript
interface RoadmapInitiative {
  name: string
  phase: 'foundation' | 'build' | 'scale'
  startWeek: number // 0-52
  durationWeeks: number
  type: 'quick-win' | 'strategic' | 'transformative'
  dependencies: string[] // initiative names
  dimensions: string[] // related dimensions
}

function transformToRoadmapData(assessment: ReadinessAssessment): RoadmapInitiative[] {
  const quickWins = assessment.pillars.flatMap(p =>
    p.dimensions
      .filter(d => d.priority === 'critical' && d.score < 3)
      .map(d => ({
        name: d.dimension,
        phase: 'foundation',
        startWeek: 0,
        durationWeeks: 2,
        type: 'quick-win',
        dependencies: [],
        dimensions: [d.dimension]
      }))
  )

  const strategic = assessment.pillars.flatMap(p =>
    p.dimensions
      .filter(d => d.priority === 'important')
      .map(d => ({
        name: d.dimension,
        phase: 'build',
        startWeek: 12,
        durationWeeks: 12,
        type: 'strategic',
        dependencies: quickWins.map(qw => qw.name),
        dimensions: [d.dimension]
      }))
  )

  // Add transformative initiatives
  return [...quickWins, ...strategic]
}
```

**Rendering:**
- Timeline axis (weeks 0-52)
- Phase groups
- Horizontal bars for initiatives
- Dependency arrows
- Color by type (green=quick win, orange=strategic, teal=transformative)

---

## 2. AI Illustration Generator

### 2.1 Google Gemini Integration

**Service**: `lib/ai/gemini-client.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function generateIllustration(
  prompt: string,
  style: 'professional' | 'conceptual' | 'technical' = 'professional'
): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

    const fullPrompt = `${styleGuides[style]}\n\n${prompt}\n\nCreate a clean, professional business illustration suitable for a management consulting presentation. Use a modern, minimalist style with the following color palette: Orange (#F25C05), Teal (#1D9BA3), Gray (#313244). Output as SVG code.`

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const svg = extractSVG(response.text())

    return svg
  } catch (error) {
    console.error('Gemini illustration generation failed:', error)
    return null
  }
}

const styleGuides = {
  professional: 'Clean lines, minimal colors, business-appropriate, McKinsey style',
  conceptual: 'Abstract visual metaphor, thought-provoking, artistic',
  technical: 'Detailed diagram, architectural, precise'
}

function extractSVG(text: string): string | null {
  const svgMatch = text.match(/<svg[^>]*>[\s\S]*<\/svg>/i)
  return svgMatch ? svgMatch[0] : null
}
```

### 2.2 Illustration Cache

**Service**: `lib/ai/illustration-cache.ts`

```typescript
interface CachedIllustration {
  prompt: string
  svg: string
  generatedAt: Date
  reportId: string
}

const cache = new Map<string, CachedIllustration>()

export function getCachedIllustration(prompt: string, reportId: string): string | null {
  const key = `${reportId}:${hashPrompt(prompt)}`
  const cached = cache.get(key)

  if (cached && isRecent(cached.generatedAt)) {
    return cached.svg
  }

  return null
}

export function cacheIllustration(prompt: string, svg: string, reportId: string) {
  const key = `${reportId}:${hashPrompt(prompt)}`
  cache.set(key, {
    prompt,
    svg,
    generatedAt: new Date(),
    reportId
  })
}

function isRecent(date: Date): boolean {
  const hoursSince = (Date.now() - date.getTime()) / (1000 * 60 * 60)
  return hoursSince < 24 // Cache for 24 hours
}

function hashPrompt(prompt: string): string {
  // Simple hash for caching
  return Buffer.from(prompt).toString('base64').slice(0, 16)
}
```

### 2.3 Pillar Illustration Prompts

**Utility**: `lib/ai/illustration-prompts.ts`

```typescript
export function getPillarIllustrationPrompt(pillar: string, assessment: PillarScore): string {
  const templates = {
    Technology: `Create a visual representation of digital technology transformation showing:
- Digital infrastructure (cloud, connectivity)
- Data analytics and AI systems
- Cybersecurity shield
Current maturity level: ${assessment.score}/5.0
Style: Modern, interconnected systems diagram with circuit-like patterns`,

    Process: `Create a visual representation of process optimization showing:
- Workflow automation and integration
- Supply chain connectivity
- Innovation pipeline
Current maturity level: ${assessment.score}/5.0
Style: Flow diagram with connected nodes showing transformation from manual to automated`,

    Organization: `Create a visual representation of organizational transformation showing:
- People development and skills growth
- Leadership and strategic alignment
- Cultural change and collaboration
Current maturity level: ${assessment.score}/5.0
Style: Human-centered design with growth metaphors (trees, networks, building)`
  }

  return templates[pillar as keyof typeof templates] || templates.Technology
}
```

---

## 3. Premium Layout System

### 3.1 Multi-Column Grid

**Component**: `ConsultingLayout.tsx`

```typescript
export function ConsultingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="consulting-grid">
      {children}
    </div>
  )
}

// Tailwind config extension
module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        'consulting': '80px 1fr 1fr 80px', // Margin | Content | Content | Margin
        'consulting-asymmetric': '80px 2fr 1fr 80px', // Margin | Main | Sidebar | Margin
      },
      spacing: {
        'consulting-margin': '100px',
        'consulting-gutter': '40px',
      }
    }
  }
}
```

**CSS Classes:**
```css
.consulting-grid {
  display: grid;
  grid-template-columns: 100px 1fr 1fr 100px;
  gap: 40px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 100px 0;
}

.consulting-full {
  grid-column: 2 / 4; /* Spans both content columns */
}

.consulting-main {
  grid-column: 2 / 3; /* Left content column */
}

.consulting-sidebar {
  grid-column: 3 / 4; /* Right content column */
}

.consulting-bleed {
  grid-column: 1 / 5; /* Full bleed including margins */
}
```

### 3.2 Typography Scale

**Tailwind Configuration:**
```javascript
fontSize: {
  'display': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
  'headline': ['36px', { lineHeight: '1.3', fontWeight: '700' }],
  'title': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
  'subtitle': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
  'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
  'caption': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
}
```

---

## 4. Page Structure Components

### 4.1 Executive One-Pager

**Component**: `ExecutiveOnePager.tsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Overall Readiness: 3.4/5.0             │ Hero Metric
│  "Developing" - On the journey          │
├─────────────────────┬───────────────────┤
│  [Priority Matrix]  │ Top 3 Imperatives │ Main Content
│  (Impact vs Effort) │ 1. Quick win...   │
│                     │ 2. Strategic...   │
│                     │ 3. Foundation...  │
├─────────────────────┴───────────────────┤
│  Critical Path: 3-Phase Roadmap         │ Roadmap
│  ████░░░░░░░░░░░░░░░░░░                │
└─────────────────────────────────────────┘
```

**Implementation:**
```tsx
export function ExecutiveOnePager({ assessment }: { assessment: ReadinessAssessment }) {
  const matrixData = transformToMatrixData(assessment)
  const imperatives = extractTopImperatives(assessment, 3)
  const roadmapPhases = generatePhases(assessment)

  return (
    <div className="consulting-grid min-h-screen">
      {/* Hero Metric */}
      <div className="consulting-full">
        <HeroMetric score={assessment.overallScore} />
      </div>

      {/* Priority Matrix */}
      <div className="consulting-main">
        <PriorityMatrix data={matrixData} compact />
      </div>

      {/* Top 3 Imperatives */}
      <div className="consulting-sidebar">
        <ImperativesList imperatives={imperatives} />
      </div>

      {/* Roadmap */}
      <div className="consulting-full">
        <MiniRoadmap phases={roadmapPhases} />
      </div>
    </div>
  )
}
```

---

## 5. Data Transformation Utilities

### 5.1 Strategic Framework Transformers

**File**: `lib/consulting-data-transformers.ts`

```typescript
export function transformToConsultingFormat(assessment: ReadinessAssessment) {
  return {
    priorityMatrix: transformToMatrixData(assessment),
    heatMap: transformToHeatMapData(assessment),
    roadmap: transformToRoadmapData(assessment),
    imperatives: extractTopImperatives(assessment, 3),
    insights: generateStrategicInsights(assessment)
  }
}

function generateStrategicInsights(assessment: ReadinessAssessment): string[] {
  const insights: string[] = []

  // Identify patterns
  const lowScorePillars = assessment.pillars.filter(p => p.score < 3)
  if (lowScorePillars.length > 0) {
    insights.push(`${lowScorePillars.map(p => p.pillar).join(' and ')} require immediate attention`)
  }

  // Identify strengths
  const strongDimensions = assessment.pillars.flatMap(p =>
    p.dimensions.filter(d => d.score >= 4)
  )
  if (strongDimensions.length > 0) {
    insights.push(`Build on existing strengths in ${strongDimensions[0].dimension}`)
  }

  // Identify quick wins
  const quickWins = assessment.pillars.flatMap(p =>
    p.dimensions.filter(d => d.priority === 'critical' && d.score < 3)
  )
  if (quickWins.length > 0) {
    insights.push(`${quickWins.length} quick wins identified for immediate impact`)
  }

  return insights
}
```

---

## 6. Performance Considerations

### 6.1 AI Generation Strategy

**Async Loading:**
- Generate illustrations in background
- Show placeholder while loading
- Cache results for 24 hours
- Fallback to icons if generation fails

**Implementation:**
```tsx
function useAIIllustration(prompt: string, reportId: string) {
  const [svg, setSvg] = useState<string | null>(getCachedIllustration(prompt, reportId))
  const [loading, setLoading] = useState(!svg)

  useEffect(() => {
    if (!svg) {
      generateIllustration(prompt).then(result => {
        if (result) {
          cacheIllustration(prompt, result, reportId)
          setSvg(result)
        }
        setLoading(false)
      })
    }
  }, [prompt, reportId, svg])

  return { svg, loading }
}
```

### 6.2 Bundle Optimization

- Lazy load strategic frameworks (separate chunks)
- Defer AI generation until visible
- Use React.memo for expensive components
- Optimize SVG rendering

---

## 7. Responsive Behavior

### Desktop (1440px+)
- Full multi-column layout
- Priority matrix at full size
- All frameworks visible

### Tablet (768-1439px)
- 2-column grid
- Simplified priority matrix
- Roadmap stacks vertically

### Mobile (375-767px)
- Single column
- Priority matrix as list view
- Heat map shows top dimensions only
- Roadmap simplified to phases

---

## 8. Accessibility

- All SVG charts have aria-labels
- Keyboard navigation for interactive elements
- Color is not sole indicator (patterns/labels)
- Screen reader announcements for key insights
- Focus indicators on all interactive elements

---

## Implementation Order

1. **Priority Matrix** (2-3 days)
2. **AI Integration** (1-2 days)
3. **Heat Map** (1 day)
4. **Roadmap** (2 days)
5. **Layout System** (1 day)
6. **Executive One-Pager** (2 days)
7. **Testing & Polish** (2 days)

**Total Estimate**: 11-14 days
