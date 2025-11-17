# Digital Readiness Scoring Framework

> **Based on:** Industry 4.0 assessment best practices (adapted from Singapore's approach)
> **Created:** November 17, 2025
> **Status:** Design Document for Synthesis Engine

## Overview

This framework provides a structured methodology for assessing organizational digital transformation readiness based on multi-stakeholder interview insights. The scoring approach is adapted from proven Industry 4.0 maturity assessment frameworks used globally.

## Core Structure

### Three Pillars & Eight Dimensions

Our framework evaluates readiness across **3 core pillars** broken into **8 key dimensions**:

#### 1. Technology Pillar (3 dimensions)

**T1: Digital Infrastructure**
- Current state of automation, connectivity, and digital tools
- IT/OT convergence and system integration
- Data infrastructure and accessibility

**T2: Analytics & Intelligence**
- Data collection and analysis capabilities
- Use of AI, machine learning, or advanced analytics
- Real-time monitoring and decision support systems

**T3: Cybersecurity & Resilience**
- Security posture and risk management
- Business continuity and disaster recovery
- Technology reliability and uptime

#### 2. Process Pillar (3 dimensions)

**P1: Operations Integration**
- Vertical integration across organizational levels
- Process standardization and optimization
- Digital workflow automation

**P2: Supply Chain Integration**
- Horizontal integration with partners/suppliers
- Supply chain visibility and coordination
- External collaboration capabilities

**P3: Innovation & Lifecycle**
- Product/service innovation processes
- Digital product lifecycle management
- Time-to-market and agility

#### 3. Organization Pillar (2 dimensions)

**O1: Talent & Culture**
- Workforce digital skills and readiness
- Learning & development programs
- Leadership competency in digital transformation
- Culture of innovation and change readiness

**O2: Strategy & Governance**
- Digital transformation strategy clarity
- Governance and decision-making structures
- Inter/intra-company collaboration
- Resource allocation and investment

## Scoring Methodology

### Maturity Levels (0-5 Scale)

Each dimension is scored on a 6-level maturity scale:

**Level 0: Newcomer**
- Little to no awareness or capability
- Largely manual or ad-hoc processes
- No strategic consideration

**Level 1: Beginner**
- Initial awareness and exploration
- Pilot projects or isolated implementations
- Limited scope and impact

**Level 2: Intermediate**
- Defined processes and some standardization
- Multiple implementations across departments
- Emerging best practices

**Level 3: Experienced**
- Integrated systems and processes
- Organization-wide adoption
- Measurable business impact
- Continuous improvement culture

**Level 4: Expert**
- Optimized and adaptive systems
- Industry best practices implemented
- Strong competitive advantage
- Innovation-driven culture

**Level 5: Leader**
- Industry-leading capabilities
- Ecosystem-wide influence
- Transformative business model innovation
- Benchmark for others

### Important Scoring Principles

1. **Not all 5s are realistic** - Scores should reflect genuine maturity, not aspirational goals
2. **Industry context matters** - A "3" in manufacturing may differ from a "3" in services
3. **Evidence-based only** - Scores must be supported by interview content
4. **Multi-perspective validation** - Cross-stakeholder consistency increases confidence

## Benchmarking Mechanisms

### 1. Evidence Tracking

Each score includes:
- **Key supporting quotes** from interviews
- **Stakeholder perspectives** that informed the score
- **Contradictions or gaps** noted across roles

### 2. Confidence Indicators

Scores are tagged with confidence levels:
- **High Confidence**: 4+ stakeholders provided aligned evidence
- **Medium Confidence**: 2-3 stakeholders addressed this area
- **Low Confidence**: Only 1 stakeholder or conflicting evidence
- **Insufficient Data**: Topic not adequately covered in interviews

### 3. Comparative Context

Each dimensional score includes:
- **Typical range** for similar organizations (when data available)
- **Industry benchmark** context
- **Gap to next level** - what would move the score up

### 4. Prioritization Matrix

Using adapted TIER principles:
- **T**echnology readiness (current state)
- **I**mpact potential (business value)
- **E**ase of implementation (resource requirements)
- **R**elevance to strategy (strategic alignment)

Dimensions are categorized as:
- **Critical** - High impact, high strategic relevance
- **Important** - Significant opportunity for improvement
- **Foundational** - Prerequisites for advanced capabilities
- **Opportunistic** - Lower priority but worth considering

## Synthesis Process

### Step 1: Transcript Analysis (Per Stakeholder)

For each completed interview:
1. Extract mentions related to each dimension
2. Identify specific capabilities, gaps, and pain points
3. Note maturity indicators (language, specificity, scope)
4. Flag contradictions or uncertainties

### Step 2: Cross-Stakeholder Synthesis

1. Aggregate insights across all stakeholders
2. Identify consensus themes
3. Note role-specific perspectives (e.g., C-suite vs. frontline)
4. Resolve contradictions or note them as findings

### Step 3: Dimensional Scoring

For each dimension:
1. Map evidence to maturity level descriptors
2. Assign score (0-5) based on preponderance of evidence
3. Document confidence level
4. Identify key quotes supporting the score

### Step 4: Overall Readiness Calculation

**Overall Score** = Weighted average of dimensional scores

Default weights:
- Technology Pillar: 40%
- Process Pillar: 35%
- Organization Pillar: 25%

*(Weights can be adjusted based on organization type/goals)*

### Step 5: Prioritization Analysis

Using TIER matrix:
1. Identify 3-5 highest-priority dimensions
2. Consider current score, impact potential, and strategic fit
3. Generate prioritized recommendations

## Output Format

### Readiness Score Card

```
Overall Digital Readiness: X.X / 5.0

Technology Pillar: X.X / 5.0
├─ Digital Infrastructure: X [Confidence: High]
├─ Analytics & Intelligence: X [Confidence: Medium]
└─ Cybersecurity & Resilience: X [Confidence: High]

Process Pillar: X.X / 5.0
├─ Operations Integration: X [Confidence: High]
├─ Supply Chain Integration: X [Confidence: Low]
└─ Innovation & Lifecycle: X [Confidence: Medium]

Organization Pillar: X.X / 5.0
├─ Talent & Culture: X [Confidence: High]
└─ Strategy & Governance: X [Confidence: High]
```

### Dimensional Detail (per dimension)

```
## Digital Infrastructure: Score 2.5/5.0 (Intermediate)

**Confidence:** High (5/6 stakeholders)

**Key Findings:**
- Current state shows mix of legacy and modern systems
- Strong automation in production, weak in admin processes
- Leadership recognizes need for integration

**Supporting Evidence:**
> "We have automated our production line, but our ERP system is 15 years old and doesn't talk to anything." - Operations Manager

> "IT is constantly firefighting integration issues. We need a unified platform." - CTO

**Gap to Next Level (Experienced - 3.0):**
- Implement integrated digital platform
- Standardize data formats across systems
- Establish API-based architecture

**Priority:** Critical (High impact, foundational for other improvements)
```

## Quality Assurance

### Validation Checks

Before finalizing scores:
1. ✓ All dimensions have supporting evidence cited
2. ✓ Scores align with maturity level descriptors
3. ✓ Confidence levels reflect actual data availability
4. ✓ Cross-stakeholder contradictions are documented
5. ✓ Priority recommendations are actionable

### Red Flags

Watch for and address:
- **Score inflation** - Avoid optimistic bias
- **Insufficient evidence** - Don't score without data
- **Ignored contradictions** - Surface conflicting perspectives
- **Vague recommendations** - Be specific and actionable

## Implementation Notes

### For the Synthesis Agent

The synthesis agent (Claude-powered) will:
1. Process all interview transcripts
2. Extract dimension-relevant content using structured prompts
3. Apply maturity level criteria systematically
4. Generate scores with evidence tracking
5. Produce human-readable report sections

### Prompt Engineering Strategy

Use multi-stage prompts:
1. **Extraction**: "Identify all mentions of [dimension] in this transcript"
2. **Classification**: "Map these mentions to maturity levels 0-5"
3. **Synthesis**: "Combine findings across stakeholders"
4. **Scoring**: "Assign scores with confidence levels and evidence"
5. **Recommendations**: "Generate prioritized actions using TIER framework"

### Example Synthesis Prompt

```
You are analyzing stakeholder interviews to assess organizational digital readiness.

DIMENSION: Digital Infrastructure
MATURITY LEVELS: [0-5 descriptors provided]

TASK: Review the following interview transcripts and:
1. Extract all relevant mentions
2. Classify evidence by maturity level
3. Assign a score (0-5) with confidence level
4. Provide 3 supporting quotes
5. Identify gap to next level

TRANSCRIPTS:
[Interview content]

OUTPUT FORMAT:
Score: X.X/5.0
Confidence: [High/Medium/Low]
Evidence: [Quotes]
Gap Analysis: [Next steps]
```

## Adaptation Notes

This framework is inspired by globally-recognized Industry 4.0 maturity assessment methodologies but has been adapted for:
- Multi-stakeholder qualitative interview data (vs. quantitative assessments)
- Broader organizational contexts (not just manufacturing)
- Conversation-based evidence (vs. checklist-based scoring)
- 8 dimensions (vs. 16) for more accessible reporting

## Future Enhancements

Potential framework improvements:
1. **Custom dimension weighting** based on industry/organization type
2. **Trend analysis** across multiple assessments over time
3. **Peer benchmarking** against anonymized industry data
4. **Automated gap recommendations** using AI
5. **Visual maturity heatmaps** and spider charts

---

**Document Status:** Design Complete, Ready for Implementation
**Next Step:** Build synthesis-agent.ts using this framework
