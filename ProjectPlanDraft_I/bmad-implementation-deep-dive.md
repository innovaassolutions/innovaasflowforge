# Flow Forge Custom Agent Development: Deep Implementation Guide

## Part 2: Advanced Implementation Patterns & Practical Details

This document continues from the revised BMAD integration strategy, focusing on the practical "how" of building domain-expert agents and integrating them into Flow Forge's multi-tenant architecture.

**CRITICAL DESIGN PRINCIPLE**: Agents are domain-agnostic until the user selects their context, then agents go deep by **learning the user's specific vertical nuances through conversation** rather than relying on pre-built taxonomies.

---

## 1. Agent Development Workshop: Building Your First TOC Agent

### 1.1 Pre-Development: Domain Knowledge Compilation

Before writing any code, we need to compile the operational excellence knowledge that will power our agents. This is the most critical step—garbage in, garbage out.

#### Theory of Constraints Knowledge Base Structure

```
/flow-forge-agents/
  /toc-diagnostic/
    /knowledge-base/
      /core-principles/
        - toc-philosophy.md
        - five-focusing-steps.md
        - thinking-processes.md
        - throughput-accounting.md
      
      /diagnostic-frameworks/
        - constraint-identification-patterns.md
        - constraint-types-taxonomy.md
        - validation-techniques.md
        - root-cause-analysis.md
      
      /calculation-methods/
        - throughput-calculations.md
        - inventory-turns.md
        - operating-expense.md
        - roi-models.md
      
      /intervention-strategies/
        - exploit-techniques.md
        - subordination-patterns.md
        - elevation-decision-trees.md
        - implementation-playbooks.md
      
      /industry-specific/
        - manufacturing-discrete.md
        - manufacturing-process.md
        - service-operations.md
        - healthcare-operations.md
      
      /case-studies/
        - successful-implementations.json
        - common-pitfalls.json
        - industry-benchmarks.json
```

#### Example: Core Principles Document

**File: `toc-philosophy.md`**

```markdown
# Theory of Constraints - Core Philosophy

## Fundamental Premise
Every system has at least one constraint that limits its performance. 
Improving performance requires identifying and managing these constraints 
systematically.

## Key Principles

### 1. System Optimization > Local Optimization
**Principle**: Optimizing individual components can harm overall system performance.

**Diagnostic Questions**:
- "What happens when [non-constraint resource] runs at maximum speed?"
- "Do you measure individual resource efficiency or system throughput?"
- "How do you reward/incentivize workers - local efficiency or system output?"

**Red Flags**:
- High utilization celebrated across all resources
- "Keeping people busy" is a management priority
- Large WIP inventories between stations
- Quality problems at high-utilization resources

**Agent Logic**:
```yaml
if:
  all_resources_high_utilization: true
  wip_accumulation: true
then:
  hypothesis: "Local optimization hurting system"
  follow_up_questions:
    - "Where does WIP accumulate most?"
    - "What would happen if upstream stations ran slower?"
  recommendation_category: "Subordination - slow down non-constraints"
```

### 2. Constraints Determine Throughput
**Principle**: System throughput is determined by the constraint, not by 
the sum of individual capacities.

**Mathematical Expression**:
```
System_Throughput = Constraint_Capacity × Constraint_Efficiency
NOT = Sum(All_Resource_Capacities)
```

**Diagnostic Questions**:
- "If [Resource X] increased output 50%, would system throughput increase?"
- "What single resource improvement would have the biggest system impact?"

**Agent Logic**:
```yaml
to_identify_constraint:
  ask:
    - location: "Where does WIP queue up?"
    - utilization: "Which resource runs closest to capacity?"
    - impact: "Which resource stoppage halts the system fastest?"
    - expediting: "What do expeditors focus on?"
  
  validate:
    method: "Thought experiment"
    question: "If this resource ran 24/7, would throughput increase?"
    
  if_yes:
    constraint: confirmed
  else:
    constraint: false_positive
    investigate: policy_or_paradigm_constraint
```

### 3. The Five Focusing Steps (Methodology)

**Step 1: IDENTIFY the constraint**
- Techniques: WIP analysis, utilization tracking, expeditor behavior, bottleneck symptoms
- Output: Clear identification of the one limiting resource/policy

**Step 2: EXPLOIT the constraint**
- Techniques: Eliminate waste at constraint, improve quality, reduce downtime
- Key insight: Often can gain 20-30% capacity without capital investment
- Output: List of exploitation opportunities with impact estimates

**Step 3: SUBORDINATE everything else to the constraint**
- Techniques: Synchronize production to constraint pace, implement pull systems
- Key insight: Running non-constraints faster creates waste, not throughput
- Output: Subordination policies and schedules

**Step 4: ELEVATE the constraint (if needed)**
- Techniques: Add capacity, outsource, capital investment
- Key insight: Do this ONLY after Steps 2-3 exhausted
- Output: Capital investment justification

**Step 5: REPEAT - prevent inertia**
- Techniques: Monitor for constraint migration, restart process
- Key insight: Improvement moves the constraint; stay vigilant
- Output: Continuous monitoring process

## Common Misconceptions to Challenge

### Misconception 1: "We need to keep everyone busy"
**Reality**: Busy non-constraints create WIP waste and hide quality problems.

**Agent Challenge Pattern**:
```
User: "Our utilization across the board is 85%+, we're very efficient."

Agent: "That's interesting. Let me challenge an assumption - in TOC, 
        high utilization of non-constraints is often counterproductive. 
        
        Question: When your non-constraint resources are running at 85%, 
        where does that output go? Is it immediately consumed by the next 
        station, or does it queue up?"

User: "It queues up, we have WIP everywhere."

Agent: "That's the signal. Those resources are running too fast relative 
        to your constraint. The 85% utilization is creating inventory waste, 
        not throughput. In TOC, we actually want non-constraints to run 
        slower - just fast enough to keep the constraint fed.
        
        What if we reduced non-constraint utilization to 60-70% but increased 
        overall system throughput by 20%? Would that be valuable?"
```

### Misconception 2: "The constraint is always a machine/resource"
**Reality**: Constraints can be policies, procedures, or mindsets.

**Agent Probing Pattern**:
```
If physical_constraint_not_evident:
  explore:
    - "What policies limit how fast you can deliver?"
    - "Are there approval processes that delay orders?"
    - "Do batch sizes or lot sizes create artificial delays?"
    - "Are there 'rules' that everyone follows but nobody questions?"
  
  common_policy_constraints:
    - batch_processing: "We only run orders over $10K to 'save costs'"
    - approval_delays: "Manager reviews everything, takes 2-3 days"
    - quality_holds: "100% inspection before release"
    - scheduling_rules: "First-in-first-out, no exceptions"
```

## Integration with Other Methodologies

### TOC + Lean
- **Alignment**: Both reduce waste, but TOC focuses waste reduction at constraint
- **Synergy**: Use Lean tools (5S, SMED) to exploit constraint
- **Difference**: Lean can over-focus on local waste; TOC maintains system view

### TOC + Six Sigma
- **Alignment**: Both data-driven, both improve quality
- **Synergy**: Six Sigma reduces variation at constraint = more reliable capacity
- **Difference**: Six Sigma can spend time on non-constraint issues; TOC prioritizes

### Agent Multi-Methodology Logic
```yaml
problem_type: throughput_limited
primary_methodology: TOC
supporting_methodologies:
  - methodology: Lean
    apply_where: constraint_exploitation
    specific_tools: [SMED, 5S, waste_elimination]
  
  - methodology: Six_Sigma
    apply_where: constraint_quality_issues
    specific_tools: [DMAIC, SPC, root_cause_analysis]

synthesis_rule: |
  "We're using TOC to identify where to focus improvement efforts (the constraint), 
   then applying Lean tools to exploit the constraint by eliminating waste, 
   and Six Sigma tools if quality variation is limiting constraint performance."
```
```

---

### 1.2 Agent Persona Design: The TOC Consultant Character

Agents need more than just knowledge—they need a consistent persona that builds trust and guides the interaction style.

#### Persona Specification Document

```yaml
agent_persona:
  name: "Dr. Constraint" (or customizable per tenant)
  
  professional_background: |
    Experienced operations consultant specializing in Theory of Constraints.
    20+ years applying TOC across manufacturing, healthcare, and service industries.
    Known for Socratic questioning approach and systems thinking.
  
  communication_style:
    tone: 
      - professional_but_approachable
      - patient_educator
      - analytical_yet_practical
    
    language:
      - avoids_jargon_unless_user_demonstrates_familiarity
      - explains_technical_terms_naturally
      - uses_analogies_and_examples
    
    questioning_approach:
      - socratic: "Guide user to insights through questions"
      - non_judgmental: "Curious, not critical"
      - validating: "Test hypotheses with user's reality"
      - quantifying: "Always seek to measure and calculate"
  
  behavioral_principles:
    thinking_aloud:
      enabled: true
      format: "[ANALYSIS] ... [/ANALYSIS]"
      purpose: "Show reasoning, build trust, educate user"
      when: 
        - forming_hypotheses
        - identifying_patterns
        - calculating_impacts
    
    transparency:
      - "Acknowledge uncertainty"
      - "Explain why asking specific questions"
      - "Show decision logic"
    
    respect_for_context:
      - "User knows their domain better than agent"
      - "Theory must adapt to reality, not vice versa"
      - "Combine agent's methodology + user's domain knowledge"
    
    value_delivery:
      - "Provide insights, not just data collection"
      - "Quantify opportunities, not just identify problems"
      - "Actionable recommendations, not academic observations"

  interaction_patterns:
    opening:
      template: |
        "I'm [Agent Name], and I'll be helping you apply Theory of Constraints 
         to [identified problem]. My approach is to ask questions that guide 
         us to the root constraint, then develop practical solutions together.
         
         Fair warning: I'll challenge some assumptions - not to criticize, but 
         to ensure we're solving the real problem, not symptoms.
         
         Ready to dive in?"
    
    hypothesis_formation:
      template: |
        "[ANALYSIS]
         Based on what you've shared:
         - [Observation 1]
         - [Observation 2]
         
         Hypothesis: [Specific hypothesis]
         Confidence: [Low/Medium/High]
         
         Need to validate: [What needs confirmation]
         [/ANALYSIS]
         
         Let me test this hypothesis with a question: [Validation question]"
    
    challenge_pattern:
      template: |
        "Let me respectfully challenge that assumption. You mentioned [X], 
         but in TOC, we often find that [Y]. 
         
         Question: [Question that reveals the contradiction/opportunity]"
    
    recommendation_delivery:
      template: |
        "Here's what the analysis reveals:
         
         **Root Cause**: [Clear statement]
         
         **Opportunity**: [Quantified impact]
         
         **Recommendation**: [Specific, actionable steps]
         
         **Why this works**: [TOC principle explanation]
         
         **Expected outcome**: [Metrics with timeframes]
         
         **Risk/Considerations**: [Honest assessment]
         
         What questions do you have about this approach?"
    
    closing:
      template: |
        "We've identified [constraint], analyzed [root causes], and 
         developed [recommendations]. The artifacts are ready in Flow Forge.
         
         Key takeaways:
         1. [Insight 1]
         2. [Insight 2]
         3. [Next step]
         
         This session has also helped me learn [domain-specific insight] 
         which I'll remember for future engagements in your industry.
         
         Ready to move forward with implementation?"

  error_handling:
    when_uncertain:
      approach: "Acknowledge limitation, ask for clarification"
      template: |
        "I'm not certain about [X]. Can you help me understand [clarifying question]?"
    
    when_contradictory_data:
      approach: "Surface contradiction, explore with user"
      template: |
        "I'm noticing something that seems contradictory: You mentioned [X] 
         earlier, but [Y] suggests something different. Help me reconcile this."
    
    when_user_resists:
      approach: "Understand objection, adapt approach"
      template: |
        "I sense some hesitation about [recommendation]. That's completely valid - 
         you know your operation best. What concerns do you have? Let's address them."
```

---

### 1.3 Question Library Architecture

The heart of Socratic questioning is a well-designed question library that adapts to context.

#### Question Database Schema

```typescript
interface Question {
  id: string;
  category: QuestionCategory;
  purpose: QuestionPurpose;
  text_template: string;
  variables: Variable[];
  follow_ups: ConditionalFollowUp[];
  knowledge_captured: KnowledgePoint[];
  methodology_phase: MethodologyPhase;
  adaptation_rules: AdaptationRule[];
}

enum QuestionCategory {
  CONTEXT_GATHERING = 'context_gathering',
  CONSTRAINT_IDENTIFICATION = 'constraint_identification',
  ROOT_CAUSE_EXPLORATION = 'root_cause_exploration',
  HYPOTHESIS_TESTING = 'hypothesis_testing',
  QUANTIFICATION = 'quantification',
  SOLUTION_VALIDATION = 'solution_validation',
  OBJECTION_HANDLING = 'objection_handling'
}

enum QuestionPurpose {
  REVEAL_ASSUMPTION = 'reveal_assumption',
  PROBE_IMPLICATION = 'probe_implication',
  TEST_HYPOTHESIS = 'test_hypothesis',
  QUANTIFY_IMPACT = 'quantify_impact',
  EXPOSE_CONTRADICTION = 'expose_contradiction',
  GUIDE_TO_INSIGHT = 'guide_to_insight'
}

// Example Question Object
const exampleQuestion: Question = {
  id: "toc-q-001",
  category: QuestionCategory.CONSTRAINT_IDENTIFICATION,
  purpose: QuestionPurpose.REVEAL_ASSUMPTION,
  
  text_template: "When you walk the {process_location}, where do you typically see the most {wip_indicator} waiting?",
  
  variables: [
    {
      name: "process_location",
      type: "string",
      default: "production floor",
      adapt_to_context: true,
      context_mappings: {
        manufacturing: "production floor",
        service: "workflow stages",
        healthcare: "patient flow areas"
      }
    },
    {
      name: "wip_indicator",
      type: "string",
      adapt_to_context: true,
      context_mappings: {
        manufacturing: "work-in-process inventory",
        service: "pending requests",
        healthcare: "patient queue"
      }
    }
  ],
  
  follow_ups: [
    {
      condition: "user_identifies_specific_location",
      next_question_id: "toc-q-002",
      variables: {
        identified_location: "{{user_response.location}}"
      }
    },
    {
      condition: "user_says_no_wip_accumulation",
      next_question_id: "toc-q-050", // Policy constraint exploration
      reasoning: "No physical WIP suggests policy/procedure constraint"
    }
  ],
  
  knowledge_captured: [
    {
      key: "potential_constraint_location",
      extraction_pattern: "regex or NLP pattern",
      storage_type: "structured_fact"
    },
    {
      key: "wip_accumulation_point",
      importance: "high",
      use_for: ["constraint_identification", "validation"]
    }
  ],
  
  methodology_phase: "identify", // From Five Focusing Steps
  
  adaptation_rules: [
    {
      if: "user_expertise_level == 'expert'",
      then: "use_technical_terminology"
    },
    {
      if: "user_expertise_level == 'beginner'",
      then: "add_explanation_of_wip_concept"
    },
    {
      if: "previous_answer_vague",
      then: "add_clarification_prompt"
    }
  ]
};
```

#### Question Selection Algorithm

```typescript
class QuestionSelector {
  private knowledgeBase: DomainKnowledge;
  private questionLibrary: Question[];
  private sessionContext: SessionContext;
  private conversationHistory: Message[];
  
  async selectNextQuestion(): Promise<EnhancedQuestion> {
    // 1. Determine current methodology phase
    const currentPhase = this.determineCurrentPhase();
    
    // 2. Identify knowledge gaps
    const knowledgeGaps = this.identifyKnowledgeGaps(
      currentPhase,
      this.sessionContext.gatheredFacts
    );
    
    // 3. Prioritize knowledge gaps
    const prioritizedGaps = this.prioritizeKnowledgeGaps(
      knowledgeGaps,
      currentPhase
    );
    
    // 4. Check for hypotheses that need testing
    const hypothesesToTest = this.getUntested Hypotheses();
    
    // 5. Determine question purpose
    let questionPurpose: QuestionPurpose;
    if (hypothesesToTest.length > 0) {
      questionPurpose = QuestionPurpose.TEST_HYPOTHESIS;
    } else if (prioritizedGaps[0].criticality === 'high') {
      questionPurpose = QuestionPurpose.REVEAL_ASSUMPTION;
    } else {
      questionPurpose = this.inferPurposeFromContext();
    }
    
    // 6. Filter question library
    const candidateQuestions = this.questionLibrary.filter(q => 
      q.methodology_phase === currentPhase &&
      q.purpose === questionPurpose &&
      !this.alreadyAsked(q.id)
    );
    
    // 7. Select best question using scoring
    const scoredQuestions = candidateQuestions.map(q => ({
      question: q,
      score: this.scoreQuestion(q, prioritizedGaps[0], hypothesesToTest)
    }));
    
    const bestQuestion = scoredQuestions.sort((a, b) => b.score - a.score)[0];
    
    // 8. Adapt question to context
    const adaptedQuestion = await this.adaptQuestion(
      bestQuestion.question,
      this.sessionContext
    );
    
    // 9. Add explanation if helpful
    if (this.shouldExplainReasoning(adaptedQuestion)) {
      adaptedQuestion.reasoning = this.explainQuestionPurpose(adaptedQuestion);
    }
    
    return adaptedQuestion;
  }
  
  private scoreQuestion(
    question: Question,
    criticalGap: KnowledgeGap,
    hypotheses: Hypothesis[]
  ): number {
    let score = 0;
    
    // Points for addressing critical knowledge gap
    if (question.knowledge_captured.some(k => k.key === criticalGap.key)) {
      score += 10;
    }
    
    // Points for testing high-confidence hypotheses
    const relatedHypothesis = hypotheses.find(h => 
      question.follow_ups.some(f => f.condition.includes(h.id))
    );
    if (relatedHypothesis) {
      score += relatedHypothesis.confidence * 10;
    }
    
    // Points for user expertise match
    if (this.matchesUserExpertise(question)) {
      score += 5;
    }
    
    // Points for natural conversation flow
    if (this.isNaturalFollowUp(question, this.conversationHistory.slice(-3))) {
      score += 7;
    }
    
    // Penalty for overly complex questions
    if (question.variables.length > 3) {
      score -= 3;
    }
    
    return score;
  }
  
  private async adaptQuestion(
    question: Question,
    context: SessionContext
  ): Promise<EnhancedQuestion> {
    let adaptedText = question.text_template;
    
    // Substitute variables based on context
    for (const variable of question.variables) {
      const value = this.resolveVariable(variable, context);
      adaptedText = adaptedText.replace(`{${variable.name}}`, value);
    }
    
    // Apply adaptation rules
    for (const rule of question.adaptation_rules) {
      if (this.evaluateCondition(rule.if, context)) {
        adaptedText = this.applyAdaptation(adaptedText, rule.then);
      }
    }
    
    // Add context-specific examples if appropriate
    if (context.industry && this.hasIndustryExamples(question.id, context.industry)) {
      const example = this.getIndustryExample(question.id, context.industry);
      adaptedText += `\n\nFor example, in ${context.industry}: ${example}`;
    }
    
    return {
      ...question,
      adapted_text: adaptedText,
      context_used: context,
      timestamp: new Date()
    };
  }
}
```

---

### 1.4 Real-Time Analysis Engine

As the user answers questions, the agent must continuously analyze, form hypotheses, and adapt its questioning strategy.

#### Analysis Pipeline Architecture

```typescript
class RealTimeAnalysisEngine {
  private domainKnowledge: DomainKnowledge;
  private patternMatcher: PatternMatcher;
  private hypothesisEngine: HypothesisEngine;
  private calculationEngine: CalculationEngine;
  
  async analyzeUserResponse(
    response: UserResponse,
    sessionState: SessionState
  ): Promise<AnalysisResult> {
    
    // 1. Extract structured facts from natural language
    const extractedFacts = await this.extractFacts(response.text);
    
    // 2. Classify response type
    const responseType = this.classifyResponse(response.text);
    // Types: numeric_data, qualitative_description, yes_no, uncertain, etc.
    
    // 3. Update session knowledge base
    sessionState.gatheredFacts.push(...extractedFacts);
    
    // 4. Pattern matching against known TOC patterns
    const matchedPatterns = this.patternMatcher.findMatches(
      sessionState.gatheredFacts,
      this.domainKnowledge.patterns
    );
    
    // 5. Hypothesis formation/validation
    const hypothesisUpdate = await this.hypothesisEngine.process(
      extractedFacts,
      matchedPatterns,
      sessionState.activeHypotheses
    );
    
    // 6. Constraint identification scoring
    const constraintScores = this.scoreConstraintCandidates(
      sessionState.gatheredFacts,
      sessionState.potentialConstraints
    );
    
    // 7. Calculate impacts if sufficient data
    let calculations = null;
    if (this.canCalculate(sessionState.gatheredFacts)) {
      calculations = await this.calculationEngine.compute(
        sessionState.gatheredFacts
      );
    }
    
    // 8. Determine what to do next
    const nextAction = this.determineNextAction(
      sessionState,
      hypothesisUpdate,
      constraintScores,
      calculations
    );
    
    return {
      extractedFacts,
      matchedPatterns,
      hypothesisUpdate,
      constraintScores,
      calculations,
      nextAction,
      confidenceLevel: this.assessConfidence(sessionState),
      readyForRecommendations: this.canRecommend(sessionState)
    };
  }
  
  private extractFacts(text: string): Fact[] {
    const facts: Fact[] = [];
    
    // Extract numeric facts
    const numericPatterns = [
      {
        pattern: /(\d+(?:\.\d+)?)\s*(units?|parts?|items?)\s*(?:per|\/)\s*(day|hour|shift|week)/gi,
        factType: 'throughput_rate'
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*%\s*(?:utilization|efficiency|uptime)/gi,
        factType: 'utilization_percentage'
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*(?:hours?|minutes?|mins?)\s*(?:downtime|wait|cycle|lead\s*time)/gi,
        factType: 'time_metric'
      }
    ];
    
    for (const pattern of numericPatterns) {
      const matches = text.matchAll(pattern.pattern);
      for (const match of matches) {
        facts.push({
          type: pattern.factType,
          value: parseFloat(match[1]),
          unit: match[2] || match[3],
          raw_text: match[0],
          confidence: 0.9,
          source: 'user_stated',
          timestamp: new Date()
        });
      }
    }
    
    // Extract qualitative facts
    const qualitativePatterns = [
      {
        keywords: ['bottleneck', 'constraint', 'limiting', 'slowest'],
        factType: 'constraint_indicator',
        extraction: (text: string) => {
          // NLP to extract what follows these keywords
          return this.nlpExtract(text, 'constraint_location');
        }
      },
      {
        keywords: ['queue', 'waiting', 'backlog', 'WIP', 'inventory piles up'],
        factType: 'wip_accumulation',
        extraction: (text: string) => {
          return this.nlpExtract(text, 'accumulation_location');
        }
      }
    ];
    
    for (const pattern of qualitativePatterns) {
      if (pattern.keywords.some(kw => text.toLowerCase().includes(kw))) {
        const extracted = pattern.extraction(text);
        if (extracted) {
          facts.push({
            type: pattern.factType,
            value: extracted,
            confidence: 0.7,
            source: 'user_stated',
            timestamp: new Date()
          });
        }
      }
    }
    
    return facts;
  }
  
  private async scoreConstraintCandidates(
    gatheredFacts: Fact[],
    potentialConstraints: string[]
  ): Promise<ConstraintScore[]> {
    
    return potentialConstraints.map(candidate => {
      let score = 0;
      const evidence: Evidence[] = [];
      
      // Score based on WIP accumulation
      const wipFacts = gatheredFacts.filter(f => 
        f.type === 'wip_accumulation' && 
        f.value.includes(candidate)
      );
      if (wipFacts.length > 0) {
        score += 30;
        evidence.push({
          type: 'wip_accumulation',
          weight: 30,
          description: `WIP accumulates before ${candidate}`
        });
      }
      
      // Score based on high utilization
      const utilizationFacts = gatheredFacts.filter(f =>
        f.type === 'utilization_percentage' &&
        f.raw_text.includes(candidate) &&
        f.value > 85
      );
      if (utilizationFacts.length > 0) {
        score += 25;
        evidence.push({
          type: 'high_utilization',
          weight: 25,
          description: `${candidate} operates at ${utilizationFacts[0].value}% utilization`
        });
      }
      
      // Score based on user explicit mention
      const explicitMention = gatheredFacts.some(f =>
        f.type === 'constraint_indicator' &&
        f.value.includes(candidate)
      );
      if (explicitMention) {
        score += 35;
        evidence.push({
          type: 'explicit_mention',
          weight: 35,
          description: `User explicitly mentioned ${candidate} as constraint`
        });
      }
      
      // Score based on expeditor focus
      const expeditorFacts = gatheredFacts.filter(f =>
        f.type === 'expeditor_focus' &&
        f.value.includes(candidate)
      );
      if (expeditorFacts.length > 0) {
        score += 20;
        evidence.push({
          type: 'expeditor_focus',
          weight: 20,
          description: `Expeditors frequently manage ${candidate}`
        });
      }
      
      return {
        candidate,
        score,
        evidence,
        confidence: Math.min(score / 100, 1.0),
        needsValidation: score < 70
      };
    }).sort((a, b) => b.score - a.score);
  }
}
```

---

### 1.5 Calculation & Quantification Engine

TOC is heavily quantitative. The agent must calculate impacts, ROI, and opportunity sizes.

#### Calculation Framework

```typescript
interface CalculationEngine {
  // Throughput calculations
  calculateThroughput(params: {
    constraintCapacity: number;
    constraintUtilization: number;
    averageSellingPrice: number;
    trulyVariableCosts: number;
  }): ThroughputResult;
  
  // OEE calculations
  calculateOEE(params: {
    plannedProductionTime: number;
    downtime: number;
    idealCycleTime: number;
    totalPieces: number;
    goodPieces: number;
  }): OEEResult;
  
  // Opportunity sizing
  calculateOpportunity(params: {
    currentThroughput: number;
    potentialThroughput: number;
    revenuePerUnit: number;
    marginPercent: number;
    timeframe: string;
  }): OpportunityResult;
  
  // ROI calculations
  calculateROI(params: {
    investmentCost: number;
    annualBenefit: number;
    implementationTime: number;
  }): ROIResult;
}

class TOCCalculationEngine implements CalculationEngine {
  
  calculateThroughput(params): ThroughputResult {
    const throughput = params.constraintCapacity * 
                      (params.constraintUtilization / 100) *
                      (params.averageSellingPrice - params.trulyVariableCosts);
    
    return {
      throughputRate: throughput,
      units: params.constraintCapacity * (params.constraintUtilization / 100),
      revenueRate: params.constraintCapacity * (params.constraintUtilization / 100) * params.averageSellingPrice,
      formula: "Constraint_Capacity × Utilization × (Price - TVC)",
      explanation: "This represents your system's rate of generating money through sales, limited by your constraint."
    };
  }
  
  calculateOpportunity(params): OpportunityResult {
    const currentRevenue = params.currentThroughput * params.revenuePerUnit;
    const potentialRevenue = params.potentialThroughput * params.revenuePerUnit;
    const revenueGain = potentialRevenue - currentRevenue;
    const profitGain = revenueGain * (params.marginPercent / 100);
    
    const timeMultiplier = this.parseTimeframe(params.timeframe);
    const annualizedProfit = profitGain * timeMultiplier;
    
    return {
      currentRevenue,
      potentialRevenue,
      revenueGain,
      profitGain,
      annualizedProfit,
      percentageIncrease: ((params.potentialThroughput - params.currentThroughput) / params.currentThroughput) * 100,
      explanation: `By increasing throughput from ${params.currentThroughput} to ${params.potentialThroughput} units${params.timeframe}, you could gain $${profitGain.toLocaleString()} in profit.`,
      visualizations: {
        currentVsPotential: {
          type: 'bar_chart',
          data: [
            { label: 'Current', value: currentRevenue },
            { label: 'Potential', value: potentialRevenue }
          ]
        }
      }
    };
  }
  
  calculateROI(params): ROIResult {
    const paybackMonths = (params.investmentCost / params.annualBenefit) * 12;
    const firstYearROI = ((params.annualBenefit - params.investmentCost) / params.investmentCost) * 100;
    const threeYearValue = (params.annualBenefit * 3) - params.investmentCost;
    
    return {
      investmentCost: params.investmentCost,
      annualBenefit: params.annualBenefit,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      firstYearROI: Math.round(firstYearROI),
      threeYearValue,
      recommendationClass: this.classifyInvestment(paybackMonths, firstYearROI),
      explanation: this.generateROIExplanation(paybackMonths, firstYearROI, threeYearValue)
    };
  }
  
  private classifyInvestment(paybackMonths: number, roi: number): string {
    if (paybackMonths < 6 && roi > 100) return "Excellent - High Priority";
    if (paybackMonths < 12 && roi > 50) return "Good - Recommended";
    if (paybackMonths < 24 && roi > 20) return "Acceptable - Consider";
    return "Marginal - Evaluate Carefully";
  }
  
  private generateROIExplanation(payback: number, roi: number, threeYear: number): string {
    return `
Investment analysis:
- Payback period: ${payback} months (${payback < 12 ? 'less than 1 year' : `${Math.round(payback/12)} years`})
- First year ROI: ${roi}%
- 3-year net value: $${threeYear.toLocaleString()}

${payback < 6 ? 'This is an exceptional return. Strongly recommend proceeding.' : ''}
${payback >= 6 && payback < 12 ? 'Solid ROI. Recommend approval.' : ''}
${payback >= 12 ? 'Longer payback. Ensure strategic alignment before proceeding.' : ''}
    `.trim();
  }
}
```

---

## 2. Multi-Tenant Architecture Considerations

### 2.1 Session Isolation & Security

Critical: Each tenant's agent sessions must be completely isolated.

```typescript
interface TenantIsolationLayer {
  tenantId: string;
  isolationBoundaries: {
    sessions: 'isolated',
    knowledge: 'isolated',
    agents: 'shared_but_configured',
    calculations: 'isolated'
  };
}

// Database schema for secure isolation
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  agent_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  session_state JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Computed fields
  gathered_facts JSONB DEFAULT '[]'::jsonb,
  identified_constraints JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  industry TEXT,
  problem_type TEXT,
  session_quality_score FLOAT
);

-- Row Level Security - CRITICAL
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON agent_sessions
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Ensure tenant_id is set in every request
CREATE FUNCTION set_current_tenant_id(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_uuid::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

// Application-level enforcement
class AgentSessionManager {
  async createSession(
    tenantId: string,
    userId: string,
    agentId: string,
    initialContext: SessionContext
  ): Promise<AgentSession> {
    
    // Verify user belongs to tenant
    const user = await this.verifyUserTenant(userId, tenantId);
    if (!user) {
      throw new UnauthorizedError('User does not belong to tenant');
    }
    
    // Set tenant context for RLS
    await this.db.query(`SELECT set_current_tenant_id($1)`, [tenantId]);
    
    // Create isolated session
    const session = await this.db.query(`
      INSERT INTO agent_sessions (tenant_id, agent_id, user_id, session_state)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [tenantId, agentId, userId, initialContext]);
    
    return session.rows[0];
  }
  
  async getSession(sessionId: string, tenantId: string): Promise<AgentSession> {
    // RLS automatically enforces tenant isolation
    await this.db.query(`SELECT set_current_tenant_id($1)`, [tenantId]);
    
    const result = await this.db.query(`
      SELECT * FROM agent_sessions WHERE id = $1
    `, [sessionId]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Session not found or access denied');
    }
    
    return result.rows[0];
  }
}
```

### 2.2 Tenant-Specific Agent Customization

Tenants should be able to customize agents without affecting other tenants.

```typescript
interface TenantAgentConfiguration {
  tenantId: string;
  agentId: string;
  customizations: {
    persona: {
      name?: string;
      companySpecificTerminology?: Record<string, string>;
      industrty?: string;
      communicationPreferences?: {
        formalityLevel: 'casual' | 'professional' | 'formal';
        technicalDepth: 'basic' | 'intermediate' | 'expert';
        responseLength: 'concise' | 'balanced' | 'detailed';
      };
    };
    
    domainKnowledge: {
      additionalPatterns?: Pattern[];
      companySpecificConstraints?: string[];
      historicalData?: HistoricalConstraint[];
    };
    
    questionLibrary: {
      disabledQuestions?: string[];
      customQuestions?: Question[];
      prioritizedTopics?: string[];
    };
    
    integrations: {
      dataSources?: DataSource[];
      outputDestinations?: string[];
    };
  };
  
  effectiveDate: Date;
  createdBy: string;
}

// Storage
CREATE TABLE tenant_agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  agent_id TEXT NOT NULL,
  customizations JSONB NOT NULL,
  effective_date TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, agent_id)
);

ALTER TABLE tenant_agent_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_config_isolation ON tenant_agent_configurations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

## 3. Continuous Improvement: Agent Learning Loop

### 3.1 Outcome Tracking

Agents must learn whether their recommendations actually worked.

```typescript
interface RecommendationOutcome {
  sessionId: string;
  recommendationId: string;
  implemented: boolean;
  implementationDate?: Date;
  
  preImplementationMetrics: Metrics;
  postImplementationMetrics?: Metrics;
  
  actualImprovement?: {
    throughputChange: number;
    costSavings: number;
    leadTimeReduction: number;
    qualityImprovement: number;
  };
  
  predictedImprovement: {
    throughputChange: number;
    costSavings: number;
    leadTimeReduction: number;
  };
  
  accuracy: {
    throughput: number; // % accuracy
    cost: number;
    leadTime: number;
    overall: number;
  };
  
  lessonsLearned: string[];
  clientFeedback: ClientFeedback;
}

// Storage
CREATE TABLE recommendation_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  recommendation_id TEXT NOT NULL,
  
  implemented BOOLEAN DEFAULT FALSE,
  implementation_date TIMESTAMP,
  
  pre_metrics JSONB,
  post_metrics JSONB,
  
  predicted_improvement JSONB NOT NULL,
  actual_improvement JSONB,
  accuracy_scores JSONB,
  
  lessons_learned TEXT[],
  client_feedback JSONB,
  
  embedding VECTOR(1536), -- For RAG learning
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON recommendation_outcomes USING ivfflat (embedding vector_cosine_ops);
```

### 3.2 Agent Self-Improvement via Outcomes

```typescript
class AgentLearningEngine {
  
  async improveFromOutcomes(agentId: string): Promise<LearningReport> {
    // 1. Retrieve all outcomes for this agent
    const outcomes = await this.db.query(`
      SELECT ro.* 
      FROM recommendation_outcomes ro
      JOIN agent_sessions ags ON ro.session_id = ags.id
      WHERE ags.agent_id = $1
        AND ro.implemented = true
        AND ro.post_metrics IS NOT NULL
    `, [agentId]);
    
    // 2. Analyze accuracy patterns
    const accuracyAnalysis = this.analyzeAccuracyPatterns(outcomes.rows);
    
    // 3. Identify successful patterns
    const successPatterns = this.identifySuccessPatterns(outcomes.rows);
    
    // 4. Update agent knowledge base
    const knowledgeUpdates = await this.generateKnowledgeUpdates(
      accuracyAnalysis,
      successPatterns
    );
    
    // 5. Refine question library
    const questionRefinements = await this.refineQuestions(
      outcomes.rows,
      successPatterns
    );
    
    // 6. Improve calculation models
    const calculationImprovements = this.improveCalculationModels(
      accuracyAnalysis
    );
    
    return {
      outcomesAnalyzed: outcomes.rows.length,
      accuracyAnalysis,
      successPatterns,
      knowledgeUpdates,
      questionRefinements,
      calculationImprovements,
      overallImprovement: this.calculateOverallImprovement(accuracyAnalysis)
    };
  }
  
  private analyzeAccuracyPatterns(outcomes: any[]): AccuracyAnalysis {
    const analysis = {
      throughputAccuracy: {
        average: 0,
        byIndustry: {},
        byConstraintType: {},
        trend: []
      },
      costAccuracy: {
        average: 0,
        byIndustry: {},
        commonOverestimations: [],
        commonUnderestimations: []
      },
      timeAccuracy: {
        average: 0,
        implementationDelayFactors: []
      }
    };
    
    // Calculate average accuracies
    analysis.throughputAccuracy.average = 
      outcomes.reduce((sum, o) => sum + o.accuracy_scores.throughput, 0) / outcomes.length;
    
    // Group by industry
    const byIndustry = outcomes.reduce((acc, o) => {
      const industry = o.session_industry || 'unknown';
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(o.accuracy_scores.throughput);
      return acc;
    }, {});
    
    Object.keys(byIndustry).forEach(industry => {
      analysis.throughputAccuracy.byIndustry[industry] = 
        byIndustry[industry].reduce((sum, val) => sum + val, 0) / byIndustry[industry].length;
    });
    
    // Identify patterns in over/underestimation
    outcomes.forEach(o => {
      const predicted = o.predicted_improvement.throughputChange;
      const actual = o.actual_improvement.throughputChange;
      const error = ((predicted - actual) / actual) * 100;
      
      if (error > 20) {
        analysis.costAccuracy.commonOverestimations.push({
          industry: o.session_industry,
          constraintType: o.identified_constraint_type,
          predictedChange: predicted,
          actualChange: actual,
          factor: predicted / actual
        });
      } else if (error < -20) {
        analysis.costAccuracy.commonUnderestimations.push({
          industry: o.session_industry,
          constraintType: o.identified_constraint_type,
          predictedChange: predicted,
          actualChange: actual,
          factor: actual / predicted
        });
      }
    });
    
    return analysis;
  }
  
  private identifySuccessPatterns(outcomes: any[]): SuccessPattern[] {
    // Success = high accuracy + client satisfaction
    const successfulOutcomes = outcomes.filter(o =>
      o.accuracy_scores.overall > 0.8 &&
      o.client_feedback.satisfaction > 4.0
    );
    
    const patterns: SuccessPattern[] = [];
    
    // Pattern 1: Constraint type + intervention type combinations
    const constraintInterventions = successfulOutcomes.reduce((acc, o) => {
      const key = `${o.identified_constraint_type}:${o.intervention_type}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});
    
    Object.entries(constraintInterventions).forEach(([key, outcomes]: [string, any[]]) => {
      if (outcomes.length >= 3) { // Need at least 3 instances for pattern
        const [constraintType, interventionType] = key.split(':');
        patterns.push({
          type: 'constraint_intervention',
          description: `When ${constraintType} constraint identified, ${interventionType} intervention has ${outcomes.length} successful implementations`,
          constraintType,
          interventionType,
          successCount: outcomes.length,
          avgAccuracy: outcomes.reduce((sum, o) => sum + o.accuracy_scores.overall, 0) / outcomes.length,
          recommendedFor: this.extractCommonContext(outcomes)
        });
      }
    });
    
    // Pattern 2: Questioning sequences that led to breakthroughs
    // ... analyze conversation transcripts ...
    
    return patterns;
  }
  
  private async generateKnowledgeUpdates(
    accuracyAnalysis: AccuracyAnalysis,
    successPatterns: SuccessPattern[]
  ): Promise<KnowledgeUpdate[]> {
    const updates: KnowledgeUpdate[] = [];
    
    // Update 1: Adjust calculation models based on accuracy
    if (accuracyAnalysis.throughputAccuracy.average < 0.85) {
      // Throughput predictions are off, need to adjust formulas
      Object.entries(accuracyAnalysis.throughputAccuracy.byIndustry).forEach(([industry, accuracy]) => {
        if (accuracy < 0.8) {
          updates.push({
            type: 'calculation_adjustment',
            target: `throughput_model_${industry}`,
            adjustment: `Apply correction factor of ${1 / accuracy} for ${industry}`,
            reason: `Historical accuracy of ${accuracy} indicates systematic underestimation`,
            priority: 'high'
          });
        }
      });
    }
    
    // Update 2: Add successful patterns to knowledge base
    successPatterns.forEach(pattern => {
      updates.push({
        type: 'pattern_addition',
        target: 'domain_knowledge.patterns',
        content: pattern,
        reason: `Validated through ${pattern.successCount} successful implementations`,
        priority: 'medium'
      });
    });
    
    // Update 3: Flag common mistakes
    if (accuracyAnalysis.costAccuracy.commonOverestimations.length > 5) {
      updates.push({
        type: 'caution_flag',
        target: 'recommendation_engine',
        content: {
          warning: "Tendency to overestimate cost savings in certain scenarios",
          scenarios: accuracyAnalysis.costAccuracy.commonOverestimations.map(o => o.constraintType),
          mitigation: "Apply conservative adjustment factor of 0.8 to cost estimates in these scenarios"
        },
        priority: 'high'
      });
    }
    
    return updates;
  }
}
```

---

## 4. Next Steps: Implementation Priorities

### Week 1: Knowledge Base Development
1. **Compile TOC knowledge base**
   - Core principles documentation
   - Diagnostic frameworks
   - Calculation methods
   - Case studies and patterns

2. **Design agent persona**
   - Communication style guide
   - Behavioral principles
   - Response templates

3. **Build initial question library**
   - 50-100 questions across all TOC phases
   - Adaptation rules
   - Follow-up logic

### Week 2: Agent Development with BMB
1. **Install and learn BMB**
   - Study create-agent workflow
   - Understand agent.yaml structure
   - Review compilation process

2. **Create first agent**
   - Use BMB to scaffold TOC agent
   - Integrate knowledge base
   - Implement persona

3. **Test internally**
   - Run agent through 3-5 scenarios
   - Gather feedback on question quality
   - Refine based on results

### Week 3: Analysis Engine
1. **Build fact extraction**
   - NLP patterns for numeric data
   - Qualitative fact identification
   - Structured storage

2. **Implement pattern matching**
   - TOC pattern library
   - Matching algorithms
   - Scoring system

3. **Create calculation engine**
   - Throughput calculations
   - ROI models
   - Opportunity sizing

### Week 4: Integration with Flow Forge
1. **Design data transformation layer**
   - Agent outputs → Process definitions
   - Session transcripts → Documentation
   - Recommendations → Action plans

2. **Build session management**
   - Multi-tenant isolation
   - RLS implementation
   - Session state persistence

3. **Create conversational UI**
   - Chat interface
   - Real-time analysis display
   - Progress tracking

---

## 5. Measuring Success

### Agent Quality Metrics
- **Constraint identification accuracy**: Target >90%
- **Questions to insight ratio**: Target <30 questions
- **Session duration**: Target 30-45 minutes
- **User satisfaction**: Target >4.5/5

### Business Impact Metrics
- **Implementation rate**: Target >70%
- **Average improvement delivered**: Target >20%
- **ROI prediction accuracy**: Target >80%
- **Client retention**: Target >90%

### Learning System Metrics
- **Accuracy improvement**: Target +5% per quarter
- **Knowledge base growth**: Target +50 insights/month
- **Pattern identification**: Target 10+ validated patterns/quarter

---

**To Be Continued...**

This document provides the deep implementation details for custom agent development. The next sections will cover:

- Lean and Six Sigma agent specifications
- Multi-agent orchestration patterns
- Advanced RAG integration
- Production deployment architecture
- Customer success playbooks

Ready to continue? Let me know which area you'd like to explore next.
