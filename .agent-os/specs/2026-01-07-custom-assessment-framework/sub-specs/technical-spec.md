# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2026-01-07-custom-assessment-framework/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## Technical Requirements

### 1. Assessment Definition Schema

The assessment definition uses a structured markdown format with YAML frontmatter. This format balances human readability with machine parseability.

```markdown
---
name: "Leadership Effectiveness Assessment"
version: "1.0"
type: "multi-dimensional"
author: "Coach Name"
description: "A comprehensive assessment of leadership effectiveness across 5 dimensions"
interview_style:
  default: 3  # 1=Highly Structured, 5=Fully Conversational
  allow_override: true
result_disclosure: "full"  # full, teaser, none
---

## Dimensions

### Strategic Thinking
- **weight**: 0.25
- **description**: Ability to see the big picture and plan for the future
- **interview_themes**:
  - Long-term planning approaches
  - How they handle uncertainty
  - Decision-making frameworks used
- **scoring_rubric**:
  - 1-2: Primarily reactive, short-term focus
  - 3-4: Balanced approach with some strategic planning
  - 5: Highly strategic, future-oriented thinking

### Emotional Intelligence
- **weight**: 0.20
- **description**: Self-awareness and ability to manage relationships
- **interview_themes**:
  - Self-reflection practices
  - Handling difficult conversations
  - Team dynamics awareness
- **scoring_rubric**:
  - 1-2: Limited self-awareness
  - 3-4: Developing emotional intelligence
  - 5: High EQ, strong interpersonal skills

[Additional dimensions...]

## Result Categories

### The Visionary Leader
- **score_range**: [4.0, 5.0]
- **primary_dimensions**: ["Strategic Thinking", "Innovation"]
- **description**: Leaders who excel at seeing possibilities and inspiring change
- **strengths**:
  - Forward-thinking perspective
  - Ability to inspire and motivate
  - Comfort with ambiguity
- **growth_areas**:
  - May overlook operational details
  - Could benefit from grounding practices
- **recommendations**:
  - Partner with detail-oriented team members
  - Schedule regular execution check-ins

### The Operational Excellence Leader
- **score_range**: [3.5, 5.0]
- **primary_dimensions**: ["Execution", "Process Optimization"]
[Additional categories...]

## Interview Guidelines

### Opening
"Welcome to the Leadership Effectiveness Assessment. I'm here to understand your leadership approach through a conversational exploration. There are no right or wrong answers - I'm interested in how you think about and approach leadership challenges."

### Probing Questions
- When exploring strategic thinking: "Can you walk me through a time when you had to make a decision with significant long-term implications?"
- When exploring emotional intelligence: "How do you typically handle situations where team members have conflicting perspectives?"

### Closing
"Thank you for sharing your experiences. Your responses paint a picture of your unique leadership approach..."
```

### 2. Assessment Definition Parser

```typescript
interface AssessmentDefinition {
  metadata: {
    name: string
    version: string
    type: 'single-outcome' | 'multi-dimensional' | 'comparative'
    author: string
    description: string
    interviewStyle: {
      default: number // 1-5
      allowOverride: boolean
    }
    resultDisclosure: 'full' | 'teaser' | 'none'
  }
  dimensions: AssessmentDimension[]
  resultCategories: ResultCategory[]
  interviewGuidelines: InterviewGuidelines
}

interface AssessmentDimension {
  name: string
  weight: number
  description: string
  interviewThemes: string[]
  scoringRubric: Record<string, string>
}

interface ResultCategory {
  name: string
  scoreRange: [number, number]
  primaryDimensions: string[]
  description: string
  strengths: string[]
  growthAreas: string[]
  recommendations: string[]
}

interface InterviewGuidelines {
  opening: string
  probingQuestions: Record<string, string[]>
  closing: string
}
```

### 3. Interview Agent Adaptation

The existing interview agent will be extended with a new context injection system:

```typescript
interface CustomAssessmentContext {
  assessmentId: string
  definition: AssessmentDefinition
  interviewStyle: number // 1-5 override or default
  currentFocus: string // current dimension being explored
  dimensionsCovered: string[]
  dimensionScores: Record<string, number>
}

// System prompt template injection
function buildSystemPrompt(context: CustomAssessmentContext): string {
  const styleDescriptor = getStyleDescriptor(context.interviewStyle)

  return `
You are conducting a ${context.definition.metadata.name} assessment.

ASSESSMENT FRAMEWORK:
${context.definition.metadata.description}

DIMENSIONS TO EXPLORE:
${context.definition.dimensions.map(d => `- ${d.name}: ${d.description}`).join('\n')}

INTERVIEW STYLE: ${styleDescriptor}
${context.interviewStyle <= 2 ? 'Follow the structured question flow closely.' : ''}
${context.interviewStyle >= 4 ? 'Allow natural conversation flow while covering all dimensions.' : ''}

CURRENT FOCUS: ${context.currentFocus}
Themes to explore: ${context.definition.dimensions.find(d => d.name === context.currentFocus)?.interviewThemes.join(', ')}

SCORING GUIDANCE:
${JSON.stringify(context.definition.dimensions.find(d => d.name === context.currentFocus)?.scoringRubric)}

${context.definition.interviewGuidelines.probingQuestions[context.currentFocus]?.join('\n') || ''}
`
}
```

### 4. Dynamic Results Renderer

Create a generic results renderer that reads the assessment definition and renders accordingly:

```typescript
// Components needed
interface CustomResultsProps {
  assessment: AssessmentDefinition
  results: AssessmentResults
  tenant: TenantProfile
}

interface AssessmentResults {
  dimensionScores: Record<string, number>
  overallScore: number
  matchedCategory: ResultCategory
  insights: string[]
  transcript: Message[]
}

// Renderer maps assessment type to layout
const RESULT_LAYOUTS = {
  'single-outcome': SingleOutcomeLayout,    // Like archetype results
  'multi-dimensional': MultiDimensionalLayout,  // Radar chart + dimension cards
  'comparative': ComparativeLayout          // Before/after or benchmark comparison
}
```

### 5. Assessment Library UI

Dashboard page structure:
```
/dashboard/settings/assessments
├── AssessmentList (grid of assessment cards)
├── AssessmentCard (preview, edit, status toggle)
├── CreateAssessmentModal
│   ├── UploadTab (markdown file upload)
│   └── BuilderTab (guided form builder)
└── AssessmentPreview (interactive preview mode)
```

## Approach Options

**Option A: Pure Markdown Upload**
- Pros: Simple for technical users, version-controllable, portable
- Cons: Steeper learning curve, validation harder

**Option B: Visual Builder Only**
- Pros: User-friendly, guided experience
- Cons: Less flexible, harder to export/share

**Option C: Hybrid Approach** (Selected)
- Pros: Supports both technical and non-technical users
- Cons: More development effort

**Rationale:** The hybrid approach serves both power users who want full control via markdown and casual users who prefer a guided builder. The markdown format becomes the source of truth, with the builder generating valid markdown.

## External Dependencies

### New Dependencies

- **gray-matter** - YAML frontmatter parser for markdown
  - Justification: Standard library for parsing markdown with frontmatter
  - Version: ^4.0.3

- **remark + remark-parse** - Markdown AST parser
  - Justification: Already in use for other markdown processing
  - Version: Existing

### Existing Dependencies Leveraged

- **@react-pdf/renderer** - PDF generation (already installed)
- **recharts** - Charts for multi-dimensional results (already installed)
- **zustand** - State management for builder (already installed)

## Integration Points

### 1. Campaign Creation Flow
```
Campaign Type Selection
├── Industry 4.0 (hardcoded)
├── Archetype (hardcoded)
├── Education (hardcoded)
├── Custom (hardcoded)
└── [Tenant's Custom Assessments] (dynamic from DB)
```

### 2. Interview Agent
- Extend `lib/agents/interview-agent.ts` with assessment context loader
- Add assessment-specific prompt builder
- Track dimension progress during interview

### 3. Results Generation
- Extend synthesis agent to use custom scoring rubrics
- Map responses to custom result categories
- Generate results matching assessment schema

### 4. Existing Report Patterns
Follow the coaching results pattern (tenant-branded) as the base:
- CSS custom properties for colors
- Dynamic content rendering based on assessment definition
- PDF generation with tenant branding

## Performance Considerations

1. **Assessment Definition Caching**
   - Cache parsed assessment definitions in memory
   - Invalidate on assessment update
   - TTL: 1 hour

2. **Large Assessment Files**
   - Max file size: 500KB
   - Max dimensions: 20
   - Max result categories: 15

3. **Interview Context**
   - Load assessment definition once at session start
   - Store in session context, not fetched per message
