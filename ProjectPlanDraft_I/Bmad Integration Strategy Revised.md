# Flow Forge + BMAD Integration: Custom Operational Excellence Agents

## Executive Summary - REVISED

The true power of BMAD for Innovaas Flow Forge isn't in using existing CIS workflows—it's in leveraging **BMad Builder (BMB)** to create **domain-expert agents** that embody operational management methodologies like Theory of Constraints, Lean Six Sigma, and manufacturing best practices.

These agents must combine:
1. **Domain Expertise**: Built-in knowledge of operational excellence frameworks
2. **Socratic Questioning**: Interactive discovery to gather real-time context from users
3. **Analytical Synthesis**: Combine domain knowledge + user context → actionable recommendations

**Core Principle**: The agent doesn't just ask questions—it thinks like an operations consultant, combining theoretical frameworks with on-the-ground reality.

---

## 1. The Custom Agent Philosophy

### 1.1 Beyond Generic Facilitation

**Problem with Generic Agents** (like CIS):
- They facilitate brainstorming but lack domain expertise
- Questions are process-driven, not insight-driven
- No built-in operational excellence frameworks
- Can't provide methodology-specific recommendations

**Flow Forge Custom Agents Should**:
- Embody specific methodologies (TOC, Lean, Six Sigma)
- Ask questions that reveal root causes and constraints
- Apply analytical frameworks during the conversation
- Generate recommendations grounded in best practices
- Learn from user's domain knowledge in real-time

### 1.2 The "Expert Consultant" Model

```
Traditional Consultant Engagement:
1. Initial Discovery → Generic questions
2. Data Gathering → More detailed questions
3. Analysis → Apply methodology frameworks
4. Recommendations → Based on data + expertise
5. Implementation Planning → Actionable steps

Flow Forge Agent Engagement:
1. Context Understanding → Socratic questioning
2. Real-time Analysis → Apply TOC/Lean/Six Sigma during conversation
3. Constraint Identification → Use methodology-specific diagnostics
4. Synthesis → Combine user context + domain expertise
5. Automated Process Generation → Translate to Flow Forge workflows
```

---

## 2. Custom Agent Architecture Using BMB

### 2.1 Agent Types We Need to Build

#### Agent 1: TOC (Theory of Constraints) Diagnostic Agent

**Domain Expertise Built-In**:
- The Five Focusing Steps (Identify → Exploit → Subordinate → Elevate → Repeat)
- Throughput Accounting principles
- Drum-Buffer-Rope scheduling concepts
- Critical Chain Project Management
- Constraint identification methodologies

**Socratic Questioning Examples**:
```
Agent: "Let's identify your system constraint. In your production line, 
        which station has the most work-in-process inventory queued 
        before it?"

User: "Usually Station 3 - welding. We often have 20-30 units waiting."

Agent: "Interesting. What happens when Station 3 is down for maintenance? 
        Do upstream stations keep producing?"

User: "Yes, they keep running. Management wants to maximize utilization."

Agent: [INTERNAL ANALYSIS]
       - Constraint identified: Station 3 (welding)
       - Problem: Overproduction upstream (waste, not throughput)
       - Root cause: Local optimization vs. system optimization
       [/INTERNAL ANALYSIS]
       
Agent: "This suggests a classic TOC scenario. Station 3 is your constraint, 
        but upstream stations are creating excess WIP by optimizing local 
        efficiency instead of system throughput. 
        
        Let me ask: What is the average time a unit spends waiting before 
        Station 3 vs. actually being welded?"

User: "Waiting is about 4 hours, welding takes 15 minutes."

Agent: [CALCULATING]
       - Non-value-added time: 93.8% (4hr wait / 4.25hr total)
       - Opportunity: Reduce WIP, implement buffer management
       - Recommendation: Drum-Buffer-Rope with Station 3 as drum
       [/CALCULATING]
```

**Output**:
- Process definition: Material release schedule tied to constraint capacity
- KPIs: Throughput, WIP levels, constraint utilization, buffer penetration
- Recommendations: Specific TOC implementation steps

#### Agent 2: Lean Waste Elimination Agent

**Domain Expertise Built-In**:
- 8 Wastes of Lean (DOWNTIME: Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra processing)
- Value Stream Mapping principles
- 5S methodology
- Kaizen (continuous improvement)
- Takt time and flow optimization

**Socratic Questioning with Lean Lens**:
```
Agent: "Walk me through how a typical order flows from receipt to shipment. 
        I'm particularly interested in any handoffs between departments."

User: [Describes process]

Agent: "You mentioned the order sits in the 'pending approval queue' for 
        2-3 days. During that time, what is preventing it from being 
        approved?"

User: "The manager is busy and only reviews approvals twice a week."

Agent: [LEAN ANALYSIS]
       - Waste identified: WAITING (2-3 days)
       - Type: Process waste due to batch processing
       - Root cause: Artificial batching for convenience
       - Value-added ratio: Low
       [/LEAN ANALYSIS]
       
Agent: "This is a classic 'Waiting' waste. Let's quantify the impact. 
        How many orders per week, and what's your average order value?"

User: "About 50 orders/week, averaging $10,000 each."

Agent: [CALCULATING IMPACT]
       - Cash tied up: $500,000/week × 2.5 days = $178,571 constantly locked
       - Opportunity cost: At 5% annual cost of capital = $8,929/year
       - Customer impact: Lead time perception
       [/CALCULATING]
       
Agent: "Here's what I'm seeing: This single approval step is tying up 
        ~$180K in working capital at any given time. From a Lean 
        perspective, this is pure 'Waiting' waste.
        
        Question: What criteria does the manager use to approve/reject? 
        Could we automate or establish thresholds?"
```

**Output**:
- Value Stream Map: Current state with waste quantified
- Future State Map: Optimized flow with waste removed
- Process Definition: Automated approval rules, escalation logic
- KPIs: Lead time, process cycle efficiency, waste reduction metrics

#### Agent 3: Six Sigma Process Variation Agent

**Domain Expertise Built-In**:
- DMAIC methodology (Define, Measure, Analyze, Improve, Control)
- Statistical process control concepts
- Common cause vs. special cause variation
- Process capability (Cp, Cpk)
- Root cause analysis techniques (5 Whys, Fishbone)

**Socratic Questioning with Statistical Rigor**:
```
Agent: "You mentioned quality issues. Let's be specific. Over the last 
        month, what percentage of units passed first-time quality 
        inspection?"

User: "We average about 85% first-pass yield."

Agent: "And the 15% that fail - are they consistent failures or random?"

User: "It varies. Some days we're at 95%, other days 70%."

Agent: [SIX SIGMA ANALYSIS]
       - High variation in FPY suggests special causes
       - Not consistent common cause variation
       - Need to identify controllable variables
       [/SIX SIGMA ANALYSIS]
       
Agent: "That variability pattern suggests special causes rather than 
        inherent process capability issues. Let's drill into those 
        low-performing days.
        
        When you have a 70% FPY day, can you identify any common factors? 
        Different shift? Different suppliers? Equipment condition?"

User: "Now that you mention it, it's usually the night shift, and often 
       on Mondays after weekend shutdown."

Agent: [ROOT CAUSE HYPOTHESIS]
       - Potential causes:
         * Training differential (shift-specific)
         * Startup procedure issues (Monday effect)
         * Equipment calibration drift over weekend
       [/ROOT CAUSE HYPOTHESIS]
       
Agent: "Let's test these hypotheses. I'll need some data:
        1. FPY by shift over last 3 months
        2. FPY for first batch each Monday vs. subsequent batches
        3. Any preventive maintenance logs for weekend periods
        
        But we can start designing a monitoring process now. Would you 
        be able to capture machine settings at start of each shift?"
```

**Output**:
- DMAIC project charter in Flow Forge
- Data collection process definitions
- Statistical control charts as KPIs
- Root cause analysis documentation
- Improvement hypotheses to test

#### Agent 4: OEE (Overall Equipment Effectiveness) Optimization Agent

**Domain Expertise Built-In**:
- OEE calculation: Availability × Performance × Quality
- Six Big Losses framework
- MTBF/MTTR analysis
- TPM (Total Productive Maintenance) principles
- Pareto analysis for prioritization

**Integrated Questioning Approach**:
```
Agent: "Let's establish your current OEE baseline. Starting with 
        Availability: In a standard 8-hour shift, how much time is 
        your equipment typically running vs. stopped?"

User: "Planned production is 7.5 hours (30 min for breaks/meetings), 
       and we average about 6.5 hours of actual runtime."

Agent: [CALCULATING AVAILABILITY]
       Availability = 6.5 / 7.5 = 86.7%
       Downtime = 1.0 hour/shift = 12.5% planned time lost
       [/CALCULATING]
       
Agent: "86.7% availability. That 1 hour of downtime per shift - what 
        causes it? Can you break it down?"

User: "Roughly: 20 min changeovers, 15 min minor stoppages, 15 min 
       breakdowns, 10 min waiting for materials."

Agent: [OEE LOSS CATEGORIZATION - Six Big Losses]
       1. Changeovers (20 min) → Setup/Adjustment Loss
       2. Minor stoppages (15 min) → Idling/Minor Stops Loss
       3. Breakdowns (15 min) → Equipment Failure Loss
       4. Material wait (10 min) → Logistics/Scheduling Loss
       
       Priority areas (Pareto principle):
       - Setup/Adjustment: 33% of losses → SMED opportunity
       - Idling/Minor stops: 25% of losses → Root cause analysis
       [/OEE LOSS CATEGORIZATION]
       
Agent: "Changeovers are your biggest opportunity - 20 minutes per shift. 
        How many product changeovers per shift on average?"

User: "Usually 2-3 times per shift."

Agent: "So 40-60 minutes total in changeovers. Let's apply SMED 
        (Single-Minute Exchange of Dies) methodology. 
        
        Walk me through a typical changeover. What activities happen 
        while the machine is stopped that could potentially be done 
        while it's still running?"

User: [Describes changeover steps]

Agent: [SMED ANALYSIS]
       - Internal activities (machine stopped): X, Y, Z
       - External activities (can be done while running): A, B, C
       - Quick wins: Pre-stage tools, parallel activities
       - Target: 10-minute changeovers (50% reduction)
       [/SMED ANALYSIS]
```

**Output**:
- OEE calculation process in Flow Forge
- Real-time OEE dashboard with breakdown (A × P × Q)
- Six Big Losses tracking
- Prioritized improvement projects
- SMED implementation plan for changeover reduction

---

## 3. Multi-Agent Orchestration for Complex Analysis

### 3.1 Sequential Agent Workflow

**Scenario**: Client wants to "improve production throughput"

```
Flow Forge Orchestration:
┌─────────────────────────────────────────────────────┐
│  User Input: "Increase throughput by 20%"          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Agent 1: Initial Diagnostic Agent                  │
│  Purpose: Understand current state, identify focus  │
│  Questions: Process flow, bottlenecks, metrics      │
│  Output: Problem characterization → Route to next   │
└──────────────────┬──────────────────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌─────────────────┐    ┌─────────────────┐
│  Agent 2: TOC   │    │  Agent 3: OEE   │
│  (if constraint │ OR │  (if equipment  │
│   identified)   │    │   focused)      │
└─────────┬───────┘    └─────────┬───────┘
          ↓                      ↓
          └──────────┬───────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  Agent 4: Lean Waste Analysis                       │
│  Purpose: Identify non-value-added activities       │
│  Output: Prioritized waste elimination opportunities│
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Agent 5: Implementation Planning Agent             │
│  Purpose: Synthesize all analyses → Action plan     │
│  Output: Phased improvement roadmap                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Flow Forge Process Generation                      │
│  - Monitoring processes (KPIs, dashboards)          │
│  - Improvement execution workflows                  │
│  - Change management procedures                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 Parallel Agent "Expert Panel"

**Use BMAD Party Mode**: Multiple agents collaborate simultaneously

```
Complex Problem: "Reducing product defects while increasing throughput"

Party Mode Agents:
┌──────────────────────────────────────────────────────────┐
│  Agent: TOC Specialist                                    │
│  Focus: "Is quality issue related to constraint?"        │
│  Analysis: Checking if defects cluster at bottleneck     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Agent: Six Sigma Quality                                │
│  Focus: "What's the process capability and variation?"   │
│  Analysis: Statistical patterns in defect data           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Agent: Lean Flow Expert                                 │
│  Focus: "Are defects caused by rushed/batched work?"     │
│  Analysis: Correlation between batch size and quality    │
└──────────────────────────────────────────────────────────┘

↓ SYNTHESIS ↓

┌──────────────────────────────────────────────────────────┐
│  Master Agent: Operations Strategist                     │
│  Synthesizes insights from all specialists               │
│  Identifies where recommendations align/conflict         │
│  Produces unified improvement strategy                   │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Agent Design Specifications (Using BMB)

### 4.1 Agent Definition Template

Each custom agent needs:

#### A. Metadata & Identity
```yaml
agent:
  id: "flow-forge:agents:toc-diagnostic"
  name: "TOC Diagnostic Agent"
  version: "1.0"
  role: "Theory of Constraints Consultant"
  domain: "Operations Management - Constraint Identification"
```

#### B. Domain Expertise (Knowledge Base)
```yaml
expertise:
  methodologies:
    - theory_of_constraints:
        five_focusing_steps:
          - identify: "Find the system constraint"
          - exploit: "Get the most out of the constraint"
          - subordinate: "Align everything else to constraint"
          - elevate: "Increase constraint capacity"
          - repeat: "Find the next constraint"
        
        throughput_accounting:
          - throughput: "Rate of generating money through sales"
          - inventory: "Money invested in things to sell"
          - operating_expense: "Money spent turning inventory into throughput"
        
        common_patterns:
          - market_constraint: "Sales limited by demand"
          - resource_constraint: "Production limited by capacity"
          - policy_constraint: "Limited by rules/procedures"
          - paradigm_constraint: "Limited by beliefs/assumptions"
  
  diagnostic_questions:
    constraint_identification:
      - "Where does WIP accumulate most?"
      - "Which resource has highest utilization?"
      - "What would you expand if you had unlimited budget?"
      - "What do expeditors focus on most?"
    
    constraint_validation:
      - "If this resource stopped, how long until line stops?"
      - "If this resource ran 24/7, would throughput increase?"
      - "What prevents this resource from producing more?"
```

#### C. Socratic Question Framework
```yaml
questioning_approach:
  philosophy: |
    Use the Socratic method to guide the user to insights rather than 
    lecturing. Questions should:
    1. Reveal assumptions
    2. Probe implications
    3. Question viewpoints
    4. Expose contradictions
    5. Test hypotheses
  
  question_patterns:
    revealing_assumptions:
      - "What are you assuming about [X]?"
      - "Why do you think [X] happens?"
      - "What would need to be true for [X] to work?"
    
    probing_implications:
      - "If we did [X], what would happen to [Y]?"
      - "What's the downstream effect of [X]?"
      - "How does [X] impact [Y]?"
    
    testing_hypotheses:
      - "How could we verify that [X] is the real cause?"
      - "What data would disprove your hypothesis?"
      - "What experiment could we run?"

  adaptive_depth:
    - surface_level: "Gather basic facts"
    - diagnostic_level: "Identify patterns and causes"
    - analytical_level: "Test hypotheses and quantify"
    - prescriptive_level: "Recommend specific actions"
```

#### D. Analysis & Synthesis Logic
```yaml
analysis_framework:
  real_time_processing:
    - listen: "Capture user responses"
    - categorize: "Map to domain concepts (constraint types, waste categories, etc.)"
    - analyze: "Apply methodology frameworks"
    - hypothesize: "Form improvement hypotheses"
    - validate: "Design questions to test hypotheses"
  
  synthesis_triggers:
    - sufficient_data_collected
    - contradiction_detected
    - user_requests_recommendation
    - session_timeout_approaching
  
  output_generation:
    - diagnostic_summary: "What we learned"
    - root_causes: "Why problems exist"
    - quantified_opportunities: "Size of impact"
    - recommendations: "Specific actions with rationale"
    - process_definitions: "Flow Forge workflows"
    - kpis: "Metrics to track"
```

#### E. Integration with Flow Forge
```yaml
flow_forge_integration:
  input_requirements:
    - industry_vertical: "manufacturing | service | healthcare | etc."
    - process_type: "production | supply_chain | quality | maintenance"
    - current_metrics: "baseline performance data"
    - user_role: "plant_manager | engineer | operator | executive"
  
  output_formats:
    - process_definition:
        format: "Flow Forge JSON schema"
        includes: ["activities", "decision_points", "data_sources", "kpis"]
    
    - diagnostic_report:
        format: "Markdown with structured data"
        includes: ["findings", "root_causes", "recommendations", "action_plan"]
    
    - kpi_dashboard_config:
        format: "Dashboard JSON"
        includes: ["metric_definitions", "calculations", "thresholds", "visualizations"]
```

### 4.2 Building Agents with BMB

**Step-by-Step Process**:

1. **Use BMB's `create-agent` Workflow**
   ```
   Load BMad Builder agent in IDE
   Run: *create-agent
   
   Follow prompts:
   - Agent name: "TOC Diagnostic Agent"
   - Agent type: "Full module agent" (integrated into Flow Forge module)
   - Domain: "Theory of Constraints operations consulting"
   - Expertise areas: [TOC, constraint identification, throughput analysis]
   - Communication style: "Socratic questioner, analytical consultant"
   ```

2. **Define Agent Persona**
   ```yaml
   persona:
     identity: |
       I am a Theory of Constraints consultant with 20+ years experience
       helping manufacturers identify and exploit system constraints.
       I use Socratic questioning to guide clients to breakthrough insights
       rather than imposing solutions.
     
     communication_style:
       - tone: "Professional yet accessible"
       - approach: "Question-driven discovery"
       - language_level: "Adapt to user (technical vs. executive)"
       - thinking_visible: true  # Show analytical reasoning
     
     behavioral_principles:
       - "Listen more than tell"
       - "Validate assumptions with data"
       - "Quantify opportunities before recommending"
       - "Respect user's domain knowledge"
       - "Combine theory with practical constraints"
   ```

3. **Create Custom Workflows**
   ```
   Using BMB's `create-workflow`:
   
   Workflow: toc-diagnostic-session
   Steps:
   1. Context gathering (industry, process type, goals)
   2. Current state mapping (process flow, pain points)
   3. Constraint identification (Socratic questioning)
   4. Constraint validation (hypothesis testing)
   5. Impact quantification (throughput, WIP, lead time)
   6. Exploitation recommendations (quick wins)
   7. Subordination analysis (upstream/downstream alignment)
   8. Elevation options (capacity expansion if needed)
   9. Flow Forge process generation
   10. KPI definition and monitoring setup
   ```

4. **Integrate Domain Knowledge**
   ```
   Create knowledge base files in agent directory:
   
   /flow-forge-agents/
     /toc-diagnostic/
       /knowledge/
         - toc-principles.md
         - constraint-types.md
         - case-studies.md
         - calculation-formulas.md
       /templates/
         - diagnostic-report-template.md
         - process-definition-template.json
       agent.yaml
       workflows/
         - toc-diagnostic-session.xml
   ```

---

## 5. Knowledge Capture & Learning Loop

### 5.1 Real-Time Domain Knowledge Acquisition

**Critical Requirement**: Agents must capture user's domain expertise during sessions

```typescript
interface DomainKnowledgeCapture {
  sessionId: string;
  tenantId: string;
  
  // Structured knowledge extraction
  industryTerminology: {
    term: string;
    definition: string;
    context: string;
    source: 'user' | 'agent' | 'inferred';
  }[];
  
  processSpecificities: {
    processName: string;
    steps: string[];
    constraints: string[];
    metrics: string[];
    userInsights: string[];
  }[];
  
  causeEffectRelationships: {
    cause: string;
    effect: string;
    confidence: number;
    userValidated: boolean;
  }[];
  
  // User corrections to agent assumptions
  agentAssumptionCorrections: {
    agentAssumed: string;
    userCorrected: string;
    context: string;
  }[];
}
```

**Example - Agent Learning in Real-Time**:

```
Agent: "In manufacturing, the constraint is typically the resource with 
        highest utilization. Is that true in your facility?"

User: "Not really. Our highest utilization is packaging at 95%, but that's 
       not our constraint. It's actually Quality Inspection - they're only 
       at 70% utilization but create the biggest bottleneck."

Agent: [KNOWLEDGE CAPTURE]
       Domain-specific insight captured:
       - Industry: Food manufacturing (based on packaging mention)
       - Constraint type: Quality Inspection (not typical bottleneck)
       - Reason: Batch release process (inferred, need to validate)
       - User correction: High utilization ≠ constraint in this context
       
       Update mental model:
       - In regulated industries, quality gates can be constraints
       - Utilization % alone insufficient for constraint identification
       [/KNOWLEDGE CAPTURE]
       
Agent: "Fascinating - that's unusual but makes sense in regulated 
        environments. Quality Inspection as a constraint suggests 
        batch release procedures or testing cycles. 
        
        Help me understand: Is Quality Inspection a time-based constraint 
        (testing takes long) or a capacity constraint (not enough inspectors)?"

User: "It's time-based. We batch products into lots for efficiency, and 
       each lot requires 24 hours of stability testing before release."

Agent: [KNOWLEDGE CAPTURE - DEEPER]
       Root cause identified:
       - Constraint: 24-hour stability testing (policy constraint)
       - Batch size: Unknown (need to ask)
       - Opportunity: Reduce batch size or parallel testing
       
       Industry knowledge: Food/Pharma regulatory testing
       Store for future sessions: Policy constraints common in regulated industries
       [/KNOWLEDGE CAPTURE]
```

**Storage in Supabase**:
```sql
CREATE TABLE agent_session_knowledge (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES agent_sessions(id),
  tenant_id UUID NOT NULL,
  knowledge_type TEXT, -- 'terminology', 'process', 'cause_effect', 'correction'
  knowledge_data JSONB,
  confidence_score FLOAT,
  validated BOOLEAN,
  embedding VECTOR(1536), -- for RAG retrieval
  created_at TIMESTAMP
);

-- Enable RAG: Future sessions can retrieve relevant past learnings
CREATE INDEX ON agent_session_knowledge USING ivfflat (embedding vector_cosine_ops);
```

### 5.2 Agent Self-Improvement via RAG

**Concept**: Each agent improves by learning from past successful sessions

```
When TOC Agent starts new session:
1. Retrieve similar past sessions (RAG based on initial context)
2. Load domain-specific knowledge captured in those sessions
3. Reference successful questioning patterns
4. Avoid previously identified dead-ends
5. Apply user-validated hypotheses

Example:
Agent queries RAG: "Similar manufacturing constraint scenarios"
Retrieves: 3 past sessions where Quality Inspection was constraint
Learns: In 2/3 cases, root cause was batching policy
Adapts questioning: Asks about batch sizes earlier in conversation
```

**Implementation**:
```typescript
interface AgentRAGContext {
  // Before starting session
  async loadContextualKnowledge(sessionContext: SessionContext): Promise<PriorKnowledge> {
    const similarSessions = await searchSimilarSessions(
      sessionContext.industry,
      sessionContext.problemType,
      sessionContext.processType
    );
    
    const domainKnowledge = await extractDomainKnowledge(similarSessions);
    const successfulPatterns = await identifySuccessfulPatterns(similarSessions);
    
    return {
      terminology: domainKnowledge.terms,
      commonCauses: domainKnowledge.causeEffect,
      effectiveQuestions: successfulPatterns.questions,
      pitfalls: successfulPatterns.avoidedMistakes
    };
  }
}
```

---

## 6. Revised Implementation Roadmap

### Phase 1: Foundation - Custom Agent Creation (Months 1-3)

**Month 1: BMB Mastery & First Agent**
- [ ] Install BMAD (BMB module) in development environment
- [ ] Study BMB's `create-agent` and `create-workflow` capabilities
- [ ] Design first agent: **TOC Diagnostic Agent**
  - Define domain expertise (TOC principles, formulas, patterns)
  - Create Socratic question framework
  - Build 10-step diagnostic workflow
- [ ] Test agent internally with real manufacturing scenario
- [ ] Iterate based on quality of insights generated

**Month 2: Multi-Agent System**
- [ ] Build **Lean Waste Elimination Agent**
- [ ] Build **Six Sigma Process Variation Agent**
- [ ] Build **OEE Optimization Agent**
- [ ] Create agent orchestration logic (sequential and parallel modes)
- [ ] Test multi-agent collaboration on complex scenario

**Month 3: Flow Forge Integration**
- [ ] Design data transformation layer: Agent outputs → Flow Forge processes
- [ ] Build agent session management (multi-tenant isolation)
- [ ] Create conversational UI in Flow Forge for agent interactions
- [ ] Implement session transcript storage with embeddings (RAG foundation)

**Success Criteria**:
- 4 operational excellence agents functional
- Agents can conduct 30-45 minute diagnostic sessions
- Agent outputs generate valid Flow Forge process definitions
- Multi-tenant session isolation verified

---

### Phase 2: Knowledge Capture & Learning (Months 4-6)

**Month 4: Real-Time Knowledge Extraction**
- [ ] Implement structured knowledge capture during agent sessions
- [ ] Build domain terminology extraction and storage
- [ ] Create cause-effect relationship tracking
- [ ] Design user correction capture mechanism

**Month 5: RAG-Based Agent Learning**
- [ ] Integrate session knowledge with pgvector
- [ ] Build RAG retrieval: Load prior knowledge before new sessions
- [ ] Implement agent self-improvement metrics
- [ ] Create knowledge quality scoring system

**Month 6: Industry Verticalization**
- [ ] Customize agents for specific industries:
  - Manufacturing (discrete & process)
  - Healthcare operations
  - Service delivery
  - Supply chain & logistics
- [ ] Build industry-specific question libraries
- [ ] Create industry template processes

**Success Criteria**:
- Agents capture 20+ domain insights per session
- RAG retrieval surfaces relevant past knowledge 80%+ accuracy
- Agents show measurable improvement (better questions, faster diagnosis)
- 3 industry verticals with customized agents

---

### Phase 3: Advanced Analytics & Synthesis (Months 7-9)

**Month 7: Quantitative Analysis Integration**
- [ ] Build calculation engines for each methodology:
  - TOC: Throughput, WIP, cycle time calculations
  - Lean: Takt time, OEE, value-added ratio
  - Six Sigma: Process capability, control limits
- [ ] Integrate with Flow Forge data sources (MQTT, databases)
- [ ] Create real-time metric dashboards

**Month 8: Multi-Agent Synthesis**
- [ ] Build "Master Operations Strategist" agent
- [ ] Implement conflict resolution when agents disagree
- [ ] Create unified recommendation synthesis
- [ ] Design phased improvement roadmap generation

**Month 9: Continuous Improvement Loop**
- [ ] Build process monitoring agents (post-implementation)
- [ ] Create improvement tracking workflows
- [ ] Implement before/after analysis
- [ ] Design agent learning from outcomes (did recommendations work?)

**Success Criteria**:
- Agents provide quantified recommendations (e.g., "20% throughput increase")
- Multi-agent synthesis produces superior insights vs. single agent
- Continuous improvement loop demonstrates measurable results
- Client satisfaction >85% with agent recommendations

---

### Phase 4: Production Scale & Ecosystem (Months 10-12)

**Month 10: Enterprise Features**
- [ ] Build multi-user collaboration in agent sessions
- [ ] Create report generation from agent sessions
- [ ] Implement role-based access (who can run which agents)
- [ ] Add scheduling for periodic agent-driven reviews

**Month 11: Agent Marketplace Preparation**
- [ ] Document agent creation process for customers
- [ ] Build agent sharing/export functionality
- [ ] Create agent customization interface (no-code editing)
- [ ] Design agent certification/validation process

**Month 12: Ecosystem & Community**
- [ ] Launch agent library/marketplace
- [ ] Create community contribution guidelines
- [ ] Build agent performance leaderboard
- [ ] Host webinars on agent-driven operational excellence

**Success Criteria**:
- 10+ custom agents in production across different domains
- Customers can create and share their own agents
- Agent marketplace has 5+ contributed agents
- Case studies demonstrating ROI from agent-driven improvement

---

## 7. Technical Deep Dive: Agent Architecture

### 7.1 Agent State Machine

```typescript
enum AgentState {
  INITIALIZING = 'initializing',
  GATHERING_CONTEXT = 'gathering_context',
  DIAGNOSTIC_QUESTIONING = 'diagnostic_questioning',
  ANALYZING = 'analyzing',
  HYPOTHESIS_TESTING = 'hypothesis_testing',
  SYNTHESIZING = 'synthesizing',
  RECOMMENDING = 'recommending',
  GENERATING_ARTIFACTS = 'generating_artifacts',
  COMPLETED = 'completed'
}

interface AgentSession {
  sessionId: string;
  agentId: string;
  tenantId: string;
  currentState: AgentState;
  
  // Conversation tracking
  conversationHistory: Message[];
  
  // Knowledge accumulation
  gatheredFacts: Fact[];
  identifiedPatterns: Pattern[];
  formedHypotheses: Hypothesis[];
  validatedFindings: Finding[];
  
  // Analysis artifacts
  diagnosticSummary: DiagnosticSummary;
  rootCauseAnalysis: RootCause[];
  recommendations: Recommendation[];
  
  // Flow Forge outputs
  generatedProcesses: ProcessDefinition[];
  generatedKPIs: KPIDefinition[];
  
  // Metadata
  startTime: Date;
  lastActivity: Date;
  estimatedCompletion: Date;
}
```

### 7.2 Socratic Questioning Engine

```typescript
class SocraticQuestioningEngine {
  private domainKnowledge: DomainKnowledge;
  private questionLibrary: QuestionLibrary;
  private sessionContext: SessionContext;
  
  async generateNextQuestion(
    currentState: AgentState,
    conversationHistory: Message[],
    gatheredFacts: Fact[]
  ): Promise<Question> {
    
    // 1. Analyze what we know
    const knowledgeGaps = this.identifyKnowledgeGaps(gatheredFacts);
    const hypotheses = this.formHypotheses(gatheredFacts);
    
    // 2. Determine question purpose
    const questionPurpose = this.determineQuestionPurpose(
      currentState,
      knowledgeGaps,
      hypotheses
    );
    
    // 3. Select question type
    const questionType = this.selectQuestionType(questionPurpose);
    // Types: clarifying, probing, reflective, hypothetical, challenging
    
    // 4. Generate question
    const question = await this.generateQuestion(
      questionType,
      questionPurpose,
      this.sessionContext,
      this.domainKnowledge
    );
    
    // 5. Add context and reasoning (visible to user if helpful)
    question.reasoning = this.explainQuestionRationale(question);
    
    return question;
  }
  
  private identifyKnowledgeGaps(gatheredFacts: Fact[]): KnowledgeGap[] {
    // What do we still need to know to make recommendations?
    const required = this.domainKnowledge.requiredDataPoints;
    const gathered = gatheredFacts.map(f => f.dataPoint);
    
    return required.filter(r => !gathered.includes(r)).map(gap => ({
      dataPoint: gap,
      importance: this.assessImportance(gap),
      alternatives: this.findAlternatives(gap)
    }));
  }
  
  private formHypotheses(gatheredFacts: Fact[]): Hypothesis[] {
    // Based on patterns in facts, what might be true?
    const patterns = this.patternMatcher.findPatterns(gatheredFacts);
    
    return patterns.map(pattern => ({
      statement: this.generateHypothesisStatement(pattern),
      confidence: this.calculateConfidence(pattern),
      testingQuestions: this.generateTestingQuestions(pattern),
      implications: this.deriveImplications(pattern)
    }));
  }
}
```

### 7.3 Domain Knowledge Integration

```typescript
interface DomainKnowledge {
  methodology: {
    name: string; // "Theory of Constraints"
    principles: Principle[];
    frameworks: Framework[];
    calculations: Calculation[];
    patterns: Pattern[];
  };
  
  diagnosticFramework: {
    requiredDataPoints: DataPoint[];
    optionalDataPoints: DataPoint[];
    decisionTrees: DecisionTree[];
    rootCauseCategories: Category[];
  };
  
  questioningStrategy: {
    initialContextQuestions: Question[];
    diagnosticQuestions: QuestionTemplate[];
    validationQuestions: QuestionTemplate[];
    quantificationQuestions: QuestionTemplate[];
  };
  
  recommendations: {
    interventionTypes: InterventionType[];
    implementationPatterns: ImplementationPattern[];
    successMetrics: SuccessMetric[];
  };
}

// Example: TOC Domain Knowledge
const tocDomainKnowledge: DomainKnowledge = {
  methodology: {
    name: "Theory of Constraints",
    principles: [
      {
        id: "toc-principle-1",
        name: "System thinking",
        description: "Optimize the system, not local efficiencies",
        implications: [
          "High utilization of non-constraints can harm throughput",
          "Focus improvement efforts on the constraint",
          "Protect the constraint from disruptions"
        ]
      },
      // ... more principles
    ],
    frameworks: [
      {
        id: "five-focusing-steps",
        name: "Five Focusing Steps",
        steps: [
          { order: 1, name: "IDENTIFY", description: "Find the constraint", questions: [...] },
          { order: 2, name: "EXPLOIT", description: "Get the most from constraint", questions: [...] },
          // ... more steps
        ]
      }
    ],
    calculations: [
      {
        id: "throughput",
        formula: "Revenue - Truly Variable Costs",
        units: "$/period",
        interpretation: "Rate of generating money through sales"
      },
      {
        id: "inventory-turns",
        formula: "Throughput / Inventory",
        units: "turns/year",
        interpretation: "How efficiently inventory converts to throughput"
      }
    ],
    patterns: [
      {
        id: "drum-buffer-rope",
        name: "DBR Scheduling",
        applicability: "Resource constraint",
        description: "Schedule constraint (drum), protect with buffer, release based on consumption (rope)",
        indicators: ["WIP accumulation before constraint", "Downstream starvation"]
      }
    ]
  },
  
  diagnosticFramework: {
    requiredDataPoints: [
      { id: "process-flow", description: "End-to-end process steps", type: "qualitative" },
      { id: "wip-levels", description: "Work-in-process by station", type: "quantitative" },
      { id: "throughput-rate", description: "Output per period", type: "quantitative" },
      { id: "resource-utilization", description: "% busy by resource", type: "quantitative" }
    ],
    
    decisionTrees: [
      {
        id: "constraint-identification",
        rootQuestion: "Where does WIP accumulate?",
        branches: [
          {
            answer: "Station X",
            followUp: "What's utilization of Station X?",
            branches: [
              { answer: ">90%", conclusion: "Likely resource constraint at Station X" },
              { answer: "<70%", conclusion: "Not capacity issue, investigate policy/procedure" }
            ]
          }
        ]
      }
    ]
  }
};
```

---

## 8. Example Agent Interaction (Complete Session)

### Scenario: Manufacturing Client - Production Throughput Issue

**Context**:
- Industry: Automotive components manufacturing
- Problem: Can't meet customer demand
- Goal: Increase throughput 25%

**Session Transcript**:

```
=== Agent: TOC Diagnostic Agent Initialized ===
State: GATHERING_CONTEXT

Agent: I'm here to help you identify and address your throughput constraint 
       using Theory of Constraints methodology. Before we dive into 
       diagnostics, let me understand your production environment.
       
       Can you describe your product flow from raw materials to finished goods? 
       Just the major steps - we'll drill into details as needed.

User: We make automotive brake components. Raw steel comes in, goes through:
      1. Cutting/stamping
      2. CNC machining
      3. Heat treatment
      4. Grinding/finishing
      5. Quality inspection
      6. Packaging

Agent: [ANALYSIS]
       Process type: Discrete manufacturing, 6-step linear flow
       Industry: Automotive (likely high precision requirements)
       [/ANALYSIS]
       
       Six distinct steps. Now let's identify where constraints might exist.
       
       Question: When you walk the production floor, where do you typically 
       see the most work-in-process inventory waiting?

User: Usually before Heat Treatment. We often have 2-3 days of parts queued up.

=== State Transition: GATHERING_CONTEXT → DIAGNOSTIC_QUESTIONING ===

Agent: [HYPOTHESIS FORMING]
       Potential constraint: Heat Treatment (WIP accumulation indicator)
       Need to validate with utilization and throughput data
       [/HYPOTHESIS]
       
       WIP accumulation before Heat Treatment is a strong constraint indicator.
       Let's validate this hypothesis.
       
       Question: What's the approximate utilization of your Heat Treatment 
       furnaces? By utilization I mean: of the available production time, 
       what percentage are they actually running?

User: They run pretty much 24/7, maybe 95% utilization. We only stop for 
      maintenance.

Agent: [VALIDATION]
       95% utilization + WIP accumulation = Confirmed resource constraint
       Heat Treatment is the bottleneck
       [/VALIDATION]
       
       That confirms it - Heat Treatment is your system constraint. 95% 
       utilization means it's operating at practical capacity, and the 
       WIP accumulation proves upstream processes can produce faster than 
       Heat Treatment can consume.
       
       This is actually good news - having a clear constraint makes 
       improvement focused and predictable.
       
       Now let's quantify the opportunity. Question: What's your current 
       daily throughput, and what would you need to meet customer demand?

User: We're producing about 800 units/day. Demand is 1,000 units/day, so 
      we're 200 units short.

Agent: [CALCULATING THROUGHPUT GAP]
       Current: 800 units/day
       Required: 1,000 units/day
       Gap: 200 units/day (25% increase needed)
       
       Constraint analysis:
       - Heat Treatment is at 95% utilization
       - To increase throughput 25%, need Heat Treatment capacity +25%
       - Options: Exploit (improve efficiency), Elevate (add capacity)
       [/CALCULATING]

=== State Transition: DIAGNOSTIC_QUESTIONING → HYPOTHESIS_TESTING ===

Agent: You need a 25% throughput increase, which means Heat Treatment must 
       process 25% more parts. Since it's already at 95% utilization, 
       adding 25% more capacity means we need it at roughly 120% of current 
       capacity.
       
       Before we jump to adding more furnaces (expensive), let's explore 
       exploitation opportunities - getting more from the existing constraint.
       
       Question: Walk me through what happens during a Heat Treatment cycle. 
       How long does it take, and what are the component parts of that time?

User: Each batch takes about 4 hours total:
      - 30 min to load parts
      - 3 hours actual heat treatment
      - 30 min to unload and let cool

Agent: [EXPLOITATION ANALYSIS]
       Total cycle: 4 hours
       - Load: 30 min (12.5%)
       - Treatment: 3 hours (75%)
       - Unload/cool: 30 min (12.5%)
       
       Non-productive time: 1 hour (25% of cycle)
       Opportunity: If load/unload improved, capacity gain possible
       [/EXPLOITATION ANALYSIS]
       
       Interesting - 25% of the cycle time is load/unload. That's your 
       exploitation opportunity.
       
       Question: Currently, do you wait for parts to cool before unloading, 
       or could you unload hot parts into a cooling area to start the next 
       batch immediately?

User: We could unload hot into cooling racks, but we've never done it that way. 
      We wait for safety reasons and because it's "always been done this way."

Agent: [ROOT CAUSE IDENTIFIED]
       Constraint: Heat Treatment capacity
       Root cause: Policy/procedure constraint (cooling in furnace)
       Type: Artificial constraint (can be eliminated without capital)
       
       Opportunity calculation:
       - Current cycle: 4 hours
       - Improved cycle: 3.5 hours (immediate unload, cool externally)
       - Capacity gain: 4 / 3.5 = 1.14 (14% improvement)
       - Still need: 25% - 14% = 11% more capacity
       [/ROOT CAUSE ANALYSIS]
       
       This is a perfect TOC scenario - a policy constraint disguised as a 
       capacity constraint. By unloading immediately and cooling externally, 
       you gain 14% capacity without buying equipment.
       
       But you still need 11% more capacity for the 25% total increase. 
       Let's explore the load time.
       
       Question: The 30 minutes to load - what's involved? Is it manual 
       placement, or could parts be pre-staged in racks that drop into 
       the furnace?

User: Right now we hand-load each part. Pre-staging in quick-change racks 
      might work but we'd need to invest in the rack system.

Agent: [EXPLOITATION VS. ELEVATION DECISION]
       Option 1: Immediate (Exploit)
       - External cooling: +14% capacity
       - Cost: ~$5,000 (cooling racks)
       - Time: 2 weeks
       
       Option 2: Short-term (Exploit)
       - Quick-change rack system: Reduce load time 30 min → 10 min
       - Additional capacity gain: 10% 
       - Cumulative: 14% + 10% = 24% (nearly meets 25% goal!)
       - Cost: ~$30,000 (rack system)
       - Time: 6 weeks
       
       Option 3: Long-term (Elevate)
       - Add second furnace: +100% capacity (overkill)
       - Cost: $500,000+
       - Time: 6 months
       
       Recommendation: Options 1 + 2 (exploit first, elevate only if needed)
       [/DECISION ANALYSIS]

=== State Transition: HYPOTHESIS_TESTING → SYNTHESIZING ===

Agent: Here's what I'm seeing:
       
       **Root Cause**: Your constraint is Heat Treatment, but it's artificially 
       constrained by policies (cooling in furnace, manual loading).
       
       **Opportunity**: By exploiting the constraint before elevating:
       1. External cooling: +14% capacity ($5K, 2 weeks)
       2. Quick-change racks: +10% capacity ($30K, 6 weeks)
       3. Total: 24% capacity gain for $35K vs. $500K+ for new furnace
       
       **TOC Principle Applied**: Exploit before you elevate - get the most 
       from existing assets before capital investment.

=== State Transition: SYNTHESIZING → RECOMMENDING ===

Agent: My recommendations, in priority order:
       
       **Phase 1: Immediate (Week 1-2)** - Exploit
       - Implement external cooling stations
       - Expected gain: 14% throughput
       - Cost: $5,000
       - Risk: Low (reversible)
       
       **Phase 2: Near-term (Week 3-8)** - Continue Exploitation
       - Design and install quick-change rack system
       - Expected gain: Additional 10% (24% total)
       - Cost: $30,000
       - Risk: Medium (requires engineering)
       
       **Phase 3: Subordinate (Week 9-12)** - Align Upstream/Downstream
       - Adjust production schedules: Don't let upstream processes create 
         more WIP than Heat Treatment can handle
       - Implement simple pull system (only release batches when Heat 
         Treatment ready)
       - Expected benefit: Reduced WIP, better flow, quality improvement
       - Cost: Minimal (scheduling changes only)
       
       **Phase 4: Monitor (Ongoing)** - Prevent Constraint Migration
       - If throughput reaches 1,000 units/day, the constraint will move
       - Most likely: CNC Machining becomes new constraint
       - Be ready to start Five Focusing Steps again
       
       **Decision Point**: If exploitation doesn't reach 25%, then consider 
       adding second furnace (elevation), but I'm confident we can get there 
       with exploitation alone.

=== State Transition: RECOMMENDING → GENERATING_ARTIFACTS ===

Agent: I'm now generating the implementation artifacts for Flow Forge:
       
       ✓ Process Definition: Heat Treatment Throughput Improvement
       ✓ KPI Dashboard: Throughput, WIP levels, Cycle Time
       ✓ Monitoring Workflows: Track daily throughput by constraint
       ✓ Project Plan: Phased implementation with milestones
       ✓ Diagnostic Report: Full analysis and recommendations
       
       These will be available in your Flow Forge tenant. 
       
       Would you like me to explain any part of the analysis in more detail, 
       or shall we dive into implementation planning?

User: This is excellent. Can you help me make the business case to management? 
      What's the financial impact?

Agent: [BUSINESS CASE CALCULATION]
       
       Current State:
       - Throughput: 800 units/day × 250 work days = 200,000 units/year
       - Lost sales: 200 units/day × 250 days = 50,000 units/year
       
       Assume:
       - Revenue per unit: $50
       - Profit margin: 30%
       
       Lost opportunity: 50,000 units × $50 × 30% = $750,000 profit/year
       
       Exploitation Investment:
       - Phase 1: $5,000
       - Phase 2: $30,000
       - Total: $35,000
       
       ROI:
       - Payback period: $35,000 / ($750,000/12) = 0.56 months (~17 days)
       - First year ROI: ($750,000 - $35,000) / $35,000 = 2,043%
       
       vs. Elevation (New Furnace):
       - Cost: $500,000
       - Payback: 8 months
       - First year ROI: 50%
       
       Business Case: Exploitation approach achieves same throughput goal 
       at 7% of the capital cost with 40x faster payback.
       [/BUSINESS CASE]

=== State Transition: GENERATING_ARTIFACTS → COMPLETED ===

Agent: I've added the financial analysis to your diagnostic report.
       
       Summary:
       - Problem: 25% throughput shortfall due to Heat Treatment constraint
       - Root Cause: Policy constraint (in-furnace cooling, manual loading)
       - Solution: Exploit constraint before elevating
       - Investment: $35,000
       - Benefit: $750,000/year
       - Payback: 17 days
       
       All artifacts are ready in Flow Forge. Next steps:
       1. Review diagnostic report with management
       2. Approve Phase 1 (external cooling)
       3. Begin implementation using Flow Forge project tracking
       
       Session complete. Thank you for the detailed insights about your 
       process - this helped me provide targeted recommendations.

User: Thank you! This was incredibly helpful.

=== SESSION ENDED ===
Artifacts generated:
- Diagnostic Report (15 pages)
- Flow Forge Process: "Heat Treatment Throughput Improvement"
- KPI Dashboard: Real-time constraint monitoring
- Business Case Presentation (5 slides)
- Implementation Project Plan (12 weeks, 3 phases)

Domain Knowledge Captured:
- Industry: Automotive components (brake parts)
- Constraint type: Policy constraint (cooling, loading procedures)
- Successful pattern: External cooling + quick-change racks
- User insight: Safety concern was perceived, not actual
```

---

## 9. Success Metrics for Agent-Driven Flow Forge

### 9.1 Agent Performance Metrics

**Quality of Insights**:
- Constraint identification accuracy: Target >90%
- Root cause hit rate: Target >85%
- Recommendation relevance score (user-rated): Target >4.5/5
- Implementation success rate: Target >70% (recommendations actually deliver results)

**Efficiency**:
- Average session duration: Target 30-45 minutes (vs. 4-8 hours consultant-led)
- Questions to insight ratio: Target <30 questions to actionable recommendation
- User satisfaction with process: Target >85%

**Learning & Improvement**:
- Agent accuracy improvement over time: Target +5% per quarter
- Knowledge base growth: Target +50 domain insights per month
- Reusability of past insights: Target 60% of new sessions benefit from RAG

### 9.2 Business Impact Metrics

**Client Outcomes**:
- Average throughput improvement: Target +20% within 90 days
- Average cost savings: Target $100K+ per engagement
- Process definition time reduction: Target 70% (consultant: 40hrs → agent: 12hrs)

**Platform Adoption**:
- Agent sessions per tenant: Target 3+ per month
- Agent-generated processes deployed: Target 80% deployment rate
- Client renewal rate: Target >90% (agent value drives retention)

**ROI for Innovaas**:
- Cost to deliver agent session: Target <$50 (vs. $5,000 consultant session)
- Gross margin improvement: Target +30% (agent vs. human delivery)
- Scalability: Target 1,000 concurrent agent sessions (vs. 10 consultants)

---

## 10. Conclusion - The Path Forward

### Why This Approach is Superior

**Traditional Process Analysis Platforms**:
- Static templates
- No domain expertise
- Manual consultant required
- Expensive and slow

**Flow Forge with Generic BMAD Agents (Original Plan)**:
- Better than static, but...
- Generic facilitation without deep methodology knowledge
- Can't provide expert-level recommendations
- Still requires interpretation

**Flow Forge with Custom Operational Excellence Agents (This Plan)**:
- ✅ **Domain Expert Knowledge**: Agents embody TOC, Lean, Six Sigma
- ✅ **Socratic Discovery**: Gather context through intelligent questioning
- ✅ **Real-Time Analysis**: Apply frameworks during conversation
- ✅ **Learning System**: Improve from every session via RAG
- ✅ **Scalable Expertise**: Deliver consultant-quality insights at software scale

### The Differentiator

> "Innovaas Flow Forge: The only process analysis platform with AI agents that think like operational excellence consultants, combining Theory of Constraints, Lean Six Sigma, and manufacturing best practices with Socratic questioning to guide you from problem to optimized, executable solution."

### Next Steps

1. **This Week**: Install BMAD (BMB module), study agent creation workflows
2. **Next Week**: Design first custom agent (TOC Diagnostic Agent) - full specification
3. **Month 1**: Build and test TOC agent with real manufacturing scenario
4. **Month 2**: Build Lean and Six Sigma agents, test multi-agent orchestration
5. **Month 3**: Integrate with Flow Forge, multi-tenant session management

### Critical Success Factors

1. **Agent Quality > Agent Quantity**: Build fewer agents that are truly expert-level
2. **Domain Knowledge Depth**: Invest in comprehensive methodology frameworks
3. **Socratic Excellence**: Question design is the key to valuable insights
4. **Real-Time Learning**: Capture and leverage domain knowledge from every session
5. **Measure Outcomes**: Track whether recommendations actually improve operations

---

**Document Version**: 2.0 - Custom Agent Focus  
**Date**: November 14, 2025  
**Focus**: BMB-based custom operational excellence agents with domain expertise + Socratic questioning
