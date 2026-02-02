# FlowForge Scoring Mechanisms

> Technical reference for assessment scoring across all application types

## Overview

FlowForge uses **three distinct scoring systems** optimized for different assessment contexts:

| Application | Scale Type | Primary Metric | Method |
|-------------|-----------|----------------|--------|
| **Consulting** | Numeric (0-5) | Maturity score | AI analysis + weighted average |
| **Coaching** | Ranked points | Archetype match | User selection + point aggregation |
| **Education** | Qualitative | Theme alignment % | Multi-stakeholder synthesis |

---

## 1. Consulting Assessment Scoring

**Framework**: Digital Transformation Readiness Assessment
**Scale**: 0-5 Maturity Levels
**Location**: `lib/agents/synthesis-agent.ts`

### Structure

**3 Pillars** (weighted):
- **Technology** (40%): Digital Infrastructure, Analytics & Intelligence, Cybersecurity & Resilience
- **Process** (35%): Operations Integration, Supply Chain Integration, Innovation & Lifecycle
- **Organization** (25%): Talent & Culture, Strategy & Governance

**8 Dimensions** total across the three pillars.

### Maturity Scale

| Score | Level | Description |
|-------|-------|-------------|
| 0 | Newcomer | Little awareness, manual processes, no strategy |
| 1 | Beginner | Initial awareness, pilots, limited scope |
| 2 | Intermediate | Defined processes, multi-department, emerging best practices |
| 3 | Experienced | Integrated systems, org-wide adoption, measurable impact |
| 4 | Expert | Optimized operations, industry best practices, strong advantage |
| 5 | Leader | Industry-leading, ecosystem influence, transformative |

### Scoring Algorithm

1. **Dimension Analysis**: AI analyzes all interview transcripts per dimension, extracting evidence and assigning 0-5 scores
2. **Confidence Assessment**: High/Medium/Low/Insufficient based on stakeholder alignment
3. **Pillar Calculation**: Average of dimension scores within each pillar
4. **Overall Score**: Weighted average formula:

```
Overall = (Technology × 0.40) + (Process × 0.35) + (Organization × 0.25)
```

### Data Structure

```typescript
DimensionalScore {
  dimension: string
  score: number              // 0-5
  confidence: 'high' | 'medium' | 'low' | 'insufficient'
  keyFindings: string[]
  supportingQuotes: string[]
  gapToNext: string
  priority: 'critical' | 'important' | 'foundational' | 'opportunistic'
}

ReadinessAssessment {
  overallScore: number
  pillars: PillarScore[]
  executiveSummary: string
  keyThemes: string[]
  contradictions: string[]
  recommendations: string[]
  stakeholderPerspectives: StakeholderPerspective[]
}
```

### Color Coding

```typescript
score >= 4.0  →  Green   (#10b981)  // Expert/Leader
score >= 3.0  →  Yellow  (#eab308)  // Experienced
score >= 2.0  →  Orange  (#f97316)  // Intermediate
score < 2.0   →  Red     (#ef4444)  // Newcomer/Beginner
```

---

## 2. Coaching Assessment Scoring

**Framework**: Leadership Archetype Discovery
**Scale**: Ranked point system
**Location**: `lib/agents/archetype-constitution.ts`

### Structure

**5 Archetypes**:
- **Anchor** (A): Stability and grounding
- **Catalyst** (B): Change and energy
- **Steward** (C): Care and protection
- **Wayfinder** (D): Vision and exploration
- **Architect** (E): Systems and structure

**3 Scoring Sections**:
- **Default Mode** (Q4-Q12): How you respond under pressure (9 questions)
- **Authentic Mode** (Q13-Q16): How you lead when grounded (4 questions)
- **Friction Signals** (Q17-Q19): What drains you (3 questions)

### Scoring Algorithm

**Point System**:
- Ranked #1 (Most like me) = 2 points
- Ranked #2 (Second most) = 1 point
- Single selection questions = 2 points only

**Calculation**:
```typescript
// Aggregate scores per section
scores.default   = sum of default_mode question scores
scores.authentic = sum of authentic_mode question scores
scores.friction  = sum of friction_signals question scores

// Determine dominant archetype per section
default_archetype  = archetype with highest default score
authentic_archetype = archetype with highest authentic score

// Alignment check
is_aligned = (default_archetype === authentic_archetype)
```

### Results Structure

```typescript
ArchetypeResults {
  default_archetype: Archetype
  authentic_archetype: Archetype
  is_aligned: boolean
  scores: {
    default: Record<Archetype, number>
    authentic: Record<Archetype, number>
    friction: Record<Archetype, number>
  }
}
```

### Tension Pattern Detection

When `default_archetype ≠ authentic_archetype`, the participant exhibits a **tension pattern**—they lead differently under pressure than when grounded. This insight drives personalized coaching recommendations.

---

## 3. Education Assessment Scoring

**Framework**: Four Lenses Analysis + Triangulation
**Scale**: Qualitative with percentage alignment
**Location**: `lib/agents/education-synthesis-agent.ts`

### Structure

**Four Lenses Framework**:

| Lens | Purpose | Key Metrics |
|------|---------|-------------|
| **What is Holding** | Strengths and successes | Stakeholder agreement % |
| **What is Slipping** | Declining areas | Risk trajectory |
| **What is Misunderstood** | Perception gaps | Gap count between groups |
| **What is at Risk** | Urgent concerns | Safeguarding signal count |

### Lens Data Structure

```typescript
FourLenses {
  what_is_holding: {
    description: string
    evidence: string[]              // 3-5 actual quotes
    stakeholder_agreement: number   // 0-100
  }
  what_is_slipping: {
    description: string
    evidence: string[]
    stakeholder_agreement: number
    risk_trajectory: 'stable' | 'declining' | 'critical'
  }
  what_is_misunderstood: {
    description: string
    evidence: string[]
    perception_gaps: Array<{
      group_a: string
      group_b: string
      gap_description: string
    }>
  }
  what_is_at_risk: {
    description: string
    evidence: string[]
    safeguarding_signals: number
    intervention_recommended: boolean
  }
}
```

### Triangulation

Compares perspectives across stakeholder groups:
- Students
- Teachers
- Parents
- Leadership

**Outputs**:
- Alignment scores (0-100) per theme
- Blind spots where one group sees something others don't
- Consensus patterns across groups

### Scoring Metrics

| Metric | Scale | Description |
|--------|-------|-------------|
| Urgency Level | low/medium/high/critical | Overall synthesis priority |
| Alignment Scores | 0-100 | Cross-stakeholder agreement |
| Safeguarding Signals | Count | Concerns requiring intervention |
| Data Quality | Percentage | Session completion rates |

### Data Quality Tracking

```typescript
DataQualityMetrics {
  totalSessions: number
  completeSessions: number        // ≥70% completion
  averageDepthScore: number       // questions answered / 15
  stakeholderCoverage: Record<string, number>
}
```

### Anonymization

Education synthesis never exposes individual participant identities—only aggregate patterns and anonymized quotes.

---

## Comparison Summary

| Aspect | Consulting | Coaching | Education |
|--------|-----------|----------|-----------|
| **Primary Output** | Maturity score (0-5) | Archetype assignment | Theme alignment |
| **Evidence Basis** | Interview transcripts | User selections | Multi-stakeholder interviews |
| **Confidence Measure** | High/Med/Low levels | N/A | Agreement percentages |
| **Gap Analysis** | Current vs. next level | Default vs. authentic | Cross-group perception |
| **Report Style** | Quantitative + charts | Pattern recognition | Institutional insights |
| **Identity Handling** | Full attribution | Named results | Anonymized |

---

## Shared Utilities

**Location**: `lib/chart-data-transformers.ts`

### Score Color Mapping

```typescript
function getScoreColor(score: number): string {
  if (score >= 4.0) return '#10b981'  // Green
  if (score >= 3.0) return '#eab308'  // Yellow
  if (score >= 2.0) return '#f97316'  // Orange
  return '#ef4444'                    // Red
}
```

### Maturity Level Helpers

```typescript
function getMaturityLevel(score: number): string
function getNextLevelThreshold(score: number): number
function transformToProgressData(score: number): ProgressDataPoint
```

---

## Key Design Principles

1. **Context-Appropriate Scoring**: Each system uses algorithms optimized for its use case rather than forcing a one-size-fits-all approach

2. **Evidence Transparency**: All systems maintain supporting evidence (quotes, findings, perspectives) for validation and trust

3. **Alignment Patterns**: Each system identifies gaps or tensions in its own way:
   - Consulting: Gap to next maturity level
   - Coaching: Tension between default and authentic modes
   - Education: Stakeholder perception misalignment

4. **AI + Structure**: All systems combine AI synthesis with structured frameworks for consistent, reliable outputs

5. **Rich Storage**: Scores stored as comprehensive JSON enabling detailed reporting and longitudinal analysis
