# FlowForge Agent Architecture

**Multi-Methodology Consulting Platform**

## Core Principle

FlowForge is NOT limited to Industry 4.0 assessments. It's a **multi-disciplinary consulting platform** supporting various management consulting methodologies through a **modular agent system**.

## Supported Methodologies

### Current
- **Industry 4.0 Best Practices**: Digital transformation readiness assessment

### Planned
- **Theory of Constraints (TOC)**: System bottleneck identification and resolution
- **Lean Six Sigma**: Process optimization and waste reduction
- **BMAD Method**: Strategic business planning frameworks
- **Additional Frameworks**: Extensible for new methodologies

## Agent Design Pattern

Each methodology has a specialized agent with four key components:

### 1. Knowledge Base
Domain-specific reference materials, frameworks, and best practices.

**Example - Industry 4.0 Agent:**
- UNS (Unified Namespace) architecture
- IIoT protocols and standards
- Smart manufacturing best practices
- Digital transformation frameworks

**Example - TOC Agent:**
- Goldratt's Theory of Constraints
- Five Focusing Steps methodology
- Throughput accounting principles
- Bottleneck identification techniques

### 2. Questioning Framework
Methodology-appropriate interview structure and question progression.

**Example - Industry 4.0 Agent:**
- Technology infrastructure assessment
- Data integration maturity
- Operational technology landscape
- Digital readiness scoring

**Example - Lean Six Sigma Agent:**
- Process mapping and analysis
- Waste identification (8 wastes)
- Value stream analysis
- DMAIC methodology alignment

### 3. Synthesis Engine
Specialized analysis capabilities for cross-stakeholder synthesis.

**Example - Industry 4.0 Agent:**
- Technology maturity assessment
- Digital transformation roadmap
- Investment prioritization
- ROI projections

**Example - TOC Agent:**
- Constraint identification across perspectives
- System dynamics analysis
- Throughput optimization recommendations
- Buffer management strategies

### 4. Reporting Templates
Custom output formats appropriate for the methodology.

**Example - Industry 4.0 Agent:**
- Digital maturity scorecard
- Technology architecture diagrams
- Implementation roadmap
- Investment analysis

**Example - BMAD Strategic Planning Agent:**
- Business model canvas
- Strategic initiative breakdown
- Resource allocation plans
- Milestone tracking

## Implementation Architecture

### Campaign Type Selection

```typescript
type CampaignType =
  | 'industry_4_0_readiness'
  | 'theory_of_constraints'
  | 'lean_six_sigma'
  | 'bmad_strategic_planning'
  // Extensible for new types

interface Campaign {
  id: string
  name: string
  campaign_type: CampaignType  // Determines which agent is used
  company_profile_id: string
  created_by: string
  // ... other fields
}
```

### Agent Selection Logic

```typescript
function selectAgent(campaignType: CampaignType): ConsultingAgent {
  const agentRegistry = {
    'industry_4_0_readiness': Industry40Agent,
    'theory_of_constraints': TOCAgent,
    'lean_six_sigma': LeanSixSigmaAgent,
    'bmad_strategic_planning': BMADPlanningAgent,
  }

  return new agentRegistry[campaignType]()
}
```

### Agent Interface

```typescript
interface ConsultingAgent {
  // Identification
  methodologyType: string
  displayName: string
  description: string

  // Knowledge
  knowledgeBase: KnowledgeSource[]
  terminologyGlossary: Record<string, string>

  // Interview
  questioningFramework: InterviewStructure
  conversationFlows: ConversationFlow[]

  // Analysis
  synthesisEngine: {
    crossStakeholderAnalysis(): SynthesisReport
    identifyPatterns(): Pattern[]
    generateRecommendations(): Recommendation[]
  }

  // Output
  reportingTemplates: {
    executiveSummary(): PDFDocument
    detailedAnalysis(): PDFDocument
    actionPlan(): PDFDocument
  }
}
```

### Knowledge Base Structure

```typescript
interface KnowledgeSource {
  id: string
  methodology: string
  category: string
  title: string
  content: string  // Markdown or structured data
  tags: string[]
  references: string[]
}

// Example for TOC
const tocKnowledgeBase: KnowledgeSource[] = [
  {
    id: 'toc-001',
    methodology: 'theory_of_constraints',
    category: 'core_concepts',
    title: 'Five Focusing Steps',
    content: `
      1. IDENTIFY the constraint
      2. EXPLOIT the constraint
      3. SUBORDINATE everything else
      4. ELEVATE the constraint
      5. Return to step 1 (prevent inertia)
    `,
    tags: ['core', 'focusing_steps'],
    references: ['Goldratt, The Goal']
  },
  // ... more knowledge sources
]
```

## Agent Registration System

### Adding New Methodology

1. **Create Knowledge Base**: Add methodology-specific reference materials to `docs/knowledge/[methodology]/`

2. **Define Agent Class**: Implement `ConsultingAgent` interface

```typescript
// lib/agents/toc-agent.ts
export class TheoryOfConstraintsAgent implements ConsultingAgent {
  methodologyType = 'theory_of_constraints'
  displayName = 'Theory of Constraints Assessment'
  description = 'Identify and resolve system bottlenecks'

  knowledgeBase = loadKnowledgeBase('theory_of_constraints')

  questioningFramework = {
    phases: [
      'current_state_mapping',
      'constraint_identification',
      'impact_analysis',
      'improvement_opportunities'
    ],
    questionsByPhase: { /* ... */ }
  }

  synthesisEngine = {
    crossStakeholderAnalysis() {
      // TOC-specific synthesis logic
      return identifySystemConstraints()
    },
    identifyPatterns() {
      // Pattern matching for bottlenecks
      return findCommonConstraints()
    },
    generateRecommendations() {
      // TOC-based recommendations using Five Focusing Steps
      return createFocusingStepsPlan()
    }
  }

  reportingTemplates = {
    executiveSummary() {
      return generateTOCExecutiveSummary()
    },
    detailedAnalysis() {
      return generateConstraintAnalysis()
    },
    actionPlan() {
      return generateFiveStepActionPlan()
    }
  }
}
```

3. **Register in Agent Registry**:

```typescript
// lib/agents/registry.ts
export const AGENT_REGISTRY = {
  'industry_4_0_readiness': Industry40Agent,
  'theory_of_constraints': TheoryOfConstraintsAgent,
  'lean_six_sigma': LeanSixSigmaAgent,
  'bmad_strategic_planning': BMADPlanningAgent,
}

export function getAgent(campaignType: CampaignType): ConsultingAgent {
  const AgentClass = AGENT_REGISTRY[campaignType]
  if (!AgentClass) {
    throw new Error(`No agent registered for campaign type: ${campaignType}`)
  }
  return new AgentClass()
}
```

4. **Add UI Options**: Update campaign creation UI to include new methodology

5. **Create Reporting Templates**: Design PDF templates specific to methodology

## Future Enhancements

### Agent Marketplace
- Third-party consultant-created agents
- Custom methodology support
- Agent versioning and updates

### Hybrid Agents
- Multi-methodology campaigns
- Sequential agent handoffs
- Parallel agent analysis with cross-methodology synthesis

### Agent Customization
- Consultant-specific questioning preferences
- Company-specific knowledge augmentation
- Industry-vertical specializations

### AI Model Selection
- Different models for different agents
- Cost/quality tradeoffs per methodology
- Agent performance optimization

## Migration Path

### Phase 1: Current State
- Single agent (Industry 4.0)
- Hardcoded campaign type
- Monolithic interview logic

### Phase 2: Agent Abstraction (In Progress)
- Extract agent interface
- Modularize Industry 4.0 agent
- Create agent selection logic

### Phase 3: Multi-Agent System
- Add TOC agent
- Add Lean Six Sigma agent
- Implement agent registry

### Phase 4: Extensibility Framework
- Agent creation SDK
- Knowledge base management
- Custom agent deployment

---

**Key Takeaway**: FlowForge is a multi-disciplinary consulting platform. All architecture decisions should support methodology flexibility and agent modularity.
