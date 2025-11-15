# Dynamic Context Discovery Framework for Flow Forge Agents

## Philosophy: Learn, Don't Assume

**Core Principle**: Agents start with **methodology expertise** (TOC, Lean, Six Sigma) but **zero domain assumptions**. The agent learns the user's specific vertical, industry nuances, and terminology through intelligent questioning in the first 5-10 minutes of interaction.

### Why This Approach?

**Problems with Pre-Built Taxonomies**:
- ❌ Can never cover all possible industry variations
- ❌ Users often span multiple categories (e.g., "We're pharma, but also do contract manufacturing")
- ❌ Industry terms vary by company, region, regulatory environment
- ❌ Assumes we know the user's context better than they do
- ❌ Becomes a maintenance nightmare as industries evolve

**Benefits of Dynamic Learning**:
- ✅ Adapts to any vertical without pre-programming
- ✅ Captures company-specific terminology and nuances
- ✅ Builds trust through curiosity rather than assumptions
- ✅ Creates reusable knowledge base from real conversations
- ✅ Agents improve with every session

---

## 1. Session Initialization: Context Discovery Phase

### 1.1 Multi-Dimensional Context Selection

When a user starts an agent session, they choose from **broad categories**, then the agent learns the specifics.

#### Initial Context Selection Interface

```typescript
interface SessionInitialization {
  // Step 1: High-level selection (user chooses)
  primaryContext: {
    industryCategory: 'manufacturing' | 'healthcare' | 'financial_services' | 
                     'technology' | 'retail' | 'logistics' | 'professional_services' | 
                     'government' | 'education' | 'other';
    
    functionalArea: 'operations' | 'sales' | 'supply_chain' | 'quality' | 
                   'finance' | 'customer_service' | 'product_development' | 
                   'human_resources' | 'other';
    
    organizationalLevel: 'strategic' | 'tactical' | 'operational';
    
    problemFocus: 'throughput' | 'cost_reduction' | 'quality' | 'cycle_time' | 
                  'customer_satisfaction' | 'efficiency' | 'other';
  };
  
  // Step 2: Agent learns the rest through conversation
  learnedContext: {
    specificIndustry?: string;           // e.g., "pharmaceutical manufacturing"
    industrySubtype?: string;            // e.g., "sterile injectables"
    regulatoryEnvironment?: string[];    // e.g., ["FDA", "EU GMP"]
    companySize?: string;                // e.g., "500 employees, 3 production sites"
    customTerminology?: TerminologyMap; // Learned during conversation
    specificConstraints?: string[];      // Learned during conversation
    previousSolutions?: string[];        // What they've tried before
  };
}
```

#### Example: User Selection UI

```
┌─────────────────────────────────────────────────────────┐
│  Start New Process Analysis Session                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  What industry best describes your operation?           │
│  [ Manufacturing ]  [ Healthcare ]  [ Technology ]      │
│  [ Financial ]  [ Retail ]  [ Other... ]                │
│                                                          │
│  Which functional area needs improvement?               │
│  [ Operations ]  [ Sales ]  [ Quality ]                 │
│  [ Supply Chain ]  [ Other... ]                         │
│                                                          │
│  What's your primary goal?                              │
│  [ Increase Throughput ]  [ Reduce Costs ]              │
│  [ Improve Quality ]  [ Reduce Cycle Time ]             │
│  [ Other... ]                                           │
│                                                          │
│  [ Begin Session ] ← Agent will learn the details       │
└─────────────────────────────────────────────────────────┘
```

---

### 1.2 Context Discovery Workflow

Once the user provides high-level context, the agent enters **Context Discovery Mode** - a structured 5-10 minute conversation designed to learn the specifics.

#### Discovery Conversation Pattern

```typescript
interface ContextDiscoveryWorkflow {
  phase1_IndustrySpecifics: {
    goal: "Understand the specific industry vertical and its nuances";
    questions: [
      {
        id: "cd-01",
        text: "You mentioned you're in {industryCategory}. Can you be more specific? For example, within manufacturing, are you in discrete manufacturing, process manufacturing, pharmaceuticals, food & beverage, or something else?",
        purpose: "Narrow down sub-industry",
        knowledge_captured: "specificIndustry"
      },
      {
        id: "cd-02",
        text: "What makes your specific type of {specificIndustry} unique? Are there regulatory requirements, technical complexities, or industry-specific challenges I should understand?",
        purpose: "Learn vertical nuances",
        knowledge_captured: ["regulatoryEnvironment", "specificConstraints"]
      }
    ];
  };
  
  phase2_TerminologyAlignment: {
    goal: "Learn how the user/company talks about their processes";
    questions: [
      {
        id: "cd-03",
        text: "In your operation, what do you call the work that's waiting to be processed? Do you use terms like 'work-in-process', 'pipeline', 'queue', 'backlog', or something else?",
        purpose: "Map generic term 'WIP' to user's terminology",
        knowledge_captured: "terminology.wip"
      },
      {
        id: "cd-04",
        text: "How do you measure output in your area? Is it units per day, deals closed, patients treated, cases resolved, or something different?",
        purpose: "Map generic term 'throughput' to user's metrics",
        knowledge_captured: "terminology.throughput"
      }
    ];
  };
  
  phase3_ProcessUnderstanding: {
    goal: "Understand the specific process or system being analyzed";
    questions: [
      {
        id: "cd-05",
        text: "Describe the process or system we're analyzing. Walk me through it at a high level - what are the major steps from start to finish?",
        purpose: "Get process overview",
        knowledge_captured: "processSteps"
      },
      {
        id: "cd-06",
        text: "In your industry, what are the typical constraints or bottlenecks companies face? Have you experienced any of these, or is your situation different?",
        purpose: "Understand common patterns AND unique situations",
        knowledge_captured: "typicalConstraints"
      }
    ];
  };
  
  phase4_ContextValidation: {
    goal: "Confirm understanding and set expectations";
    questions: [
      {
        id: "cd-07",
        text: "Let me confirm what I understand: You're in {specificIndustry}, focusing on {functionalArea}, and your goal is to {problemFocus}. Your process involves {processSteps}, and you measure success by {keyMetrics}. Is that accurate?",
        purpose: "Validation and correction opportunity",
        knowledge_captured: "contextValidation"
      },
      {
        id: "cd-08",
        text: "Perfect. Now, as I ask questions using Theory of Constraints methodology, I'll adapt to your industry's terminology. If I use a term that doesn't fit your world, please correct me - that helps me learn and helps you get better insights. Ready to dive into the diagnostic?",
        purpose: "Set collaborative tone, encourage corrections",
        knowledge_captured: "readyToBegin"
      }
    ];
  };
}
```

---

### 1.3 Adaptive Questioning Based on Initial Context

The agent adjusts its discovery questions based on the user's initial selections.

#### Context-Sensitive Discovery Logic

```typescript
class ContextDiscoveryEngine {
  
  generateDiscoveryQuestions(initialContext: PrimaryContext): Question[] {
    const questions: Question[] = [];
    
    // Always ask about specific industry
    questions.push(this.industrySpecificQuestion(initialContext.industryCategory));
    
    // Adjust terminology questions based on industry
    if (initialContext.industryCategory === 'manufacturing') {
      questions.push({
        text: "In your manufacturing operation, how do you track work-in-process inventory? What systems or methods do you use?",
        purpose: "Understand WIP visibility and measurement"
      });
    } else if (initialContext.industryCategory === 'healthcare') {
      questions.push({
        text: "In your healthcare setting, how do you track patient flow or case progression? What metrics do you use?",
        purpose: "Understand patient flow tracking"
      });
    } else if (initialContext.functionalArea === 'sales') {
      questions.push({
        text: "In your sales process, how do you track deals in your pipeline? What stages do they go through?",
        purpose: "Understand sales pipeline structure"
      });
    }
    
    // Ask about regulatory environment if applicable
    if (this.isHighlyRegulated(initialContext.industryCategory)) {
      questions.push({
        text: "What regulatory requirements or compliance standards apply to your operation? (e.g., FDA, ISO, SOX, HIPAA, etc.)",
        purpose: "Identify regulatory constraints"
      });
    }
    
    // Ask about previous improvement attempts
    questions.push({
      text: "Have you tried any improvement initiatives before? What approaches have you used (Lean, Six Sigma, process automation, etc.) and what were the results?",
      purpose: "Learn from past attempts, avoid repetition"
    });
    
    return questions;
  }
  
  private isHighlyRegulated(industry: string): boolean {
    const highlyRegulated = ['healthcare', 'financial_services', 'pharma'];
    return highlyRegulated.includes(industry);
  }
  
  private industrySpecificQuestion(category: string): Question {
    const specificityPrompts = {
      manufacturing: "Within manufacturing, are you in discrete (assembly), process (continuous), pharma, food & beverage, or another specialization?",
      healthcare: "Within healthcare, are you in hospital operations, outpatient care, diagnostics, pharmaceuticals, or another area?",
      technology: "Within technology, are you in software development, IT operations, SaaS delivery, hardware manufacturing, or another area?",
      financial_services: "Within financial services, are you in banking, insurance, investment management, payments, or another sector?",
      retail: "Within retail, are you in brick-and-mortar, e-commerce, omnichannel, or wholesale distribution?",
      logistics: "Within logistics, are you in transportation, warehousing, freight forwarding, or last-mile delivery?",
      professional_services: "Within professional services, are you in consulting, legal, accounting, marketing, or another practice area?"
    };
    
    return {
      text: specificityPrompts[category] || "Tell me more specifically about your industry or sector.",
      purpose: "Narrow down to specific sub-industry"
    };
  }
}
```

---

### 1.4 Real-Time Context Building

As the agent converses, it continuously builds and refines the context model.

#### Context Model Evolution

```typescript
interface DynamicContext {
  // Core identifiers (user-selected)
  industryCategory: string;
  functionalArea: string;
  organizationalLevel: string;
  problemFocus: string;
  
  // Learned through conversation (evolves in real-time)
  learned: {
    specificIndustry: {
      value: string;
      confidence: number;      // 0-1, increases with validation
      source: 'user_stated' | 'inferred' | 'corrected';
      timestamp: Date;
    };
    
    terminology: {
      // Generic term → User's term
      constraint: { userTerm: string; example: string; confidence: number };
      throughput: { userTerm: string; unit: string; confidence: number };
      wip: { userTerm: string; example: string; confidence: number };
      cycle_time: { userTerm: string; unit: string; confidence: number };
      quality: { userTerm: string; metric: string; confidence: number };
      efficiency: { userTerm: string; calculation: string; confidence: number };
    };
    
    processCharacteristics: {
      processType: 'linear' | 'branching' | 'cyclical' | 'network';
      majorSteps: string[];
      keyHandoffs: string[];
      dataAvailability: 'extensive' | 'moderate' | 'limited' | 'none';
    };
    
    constraints: {
      regulatory: string[];
      technical: string[];
      organizational: string[];
      market: string[];
    };
    
    metrics: {
      current: { name: string; value: string; unit: string }[];
      desired: { name: string; target: string; unit: string }[];
    };
    
    previousExperience: {
      methodologiesUsed: string[];
      successfulApproaches: string[];
      failedApproaches: string[];
      lessonsLearned: string[];
    };
    
    // Industry-specific nuances discovered
    uniqueNuances: {
      description: string;
      implication: string;
      agentAdaptation: string;
    }[];
  };
  
  // Confidence score (how well do we understand this user's context?)
  overallConfidence: number; // 0-1
  
  // Ready to proceed with methodology application?
  readyForDiagnostic: boolean;
}
```

---

### 1.5 Example: Context Discovery in Action

#### Scenario: Pharma Manufacturing with Nuances

```
User Selections:
- Industry: Manufacturing
- Functional Area: Operations
- Problem Focus: Throughput

════════════════════════════════════════════════════════════

Agent: Thanks for selecting Manufacturing Operations with a focus on throughput. 
       Let me understand your specific situation so I can tailor my analysis.
       
       Within manufacturing, are you in discrete (assembly), process 
       (continuous), pharmaceutical, food & beverage, or another specialization?

User: We're in pharmaceutical manufacturing, specifically sterile injectables.

Agent: [CONTEXT UPDATE]
       specificIndustry: "pharmaceutical manufacturing - sterile injectables"
       confidence: 0.9
       [/CONTEXT UPDATE]
       
       Sterile injectables - that's a highly regulated, complex environment. 
       What makes your operation unique within this space? Are there specific 
       regulatory requirements, technical complexities, or challenges I should 
       understand?

User: Yes, we're FDA regulated, so every batch requires stability testing before 
      release. We also do contract manufacturing, so we're constantly switching 
      between different products, which means a lot of clean room changeovers. 
      And because we're sterile, we have to follow Annex 1 protocols.

Agent: [CONTEXT UPDATE]
       regulatoryEnvironment: ["FDA", "EU GMP Annex 1"]
       specificConstraints: [
         "Batch stability testing required",
         "Contract manufacturing (frequent product changes)",
         "Clean room changeover protocols",
         "Sterile processing requirements"
       ]
       uniqueNuances: [
         {
           description: "Contract manufacturing model",
           implication: "High changeover frequency unlike typical pharma",
           agentAdaptation: "Focus on changeover time reduction, not just constraint capacity"
         },
         {
           description: "Stability testing as release gate",
           implication: "Potential policy constraint (testing time)",
           agentAdaptation: "Investigate if testing is actual constraint vs. perceived"
         }
       ]
       confidence: 0.95
       [/CONTEXT UPDATE]
       
       Excellent - this context is very helpful. Contract manufacturing with 
       frequent changeovers is different from typical pharma where you'd run 
       the same product for long campaigns. That changes the constraint dynamics.
       
       In your operation, what do you call the batches that have been produced 
       but are waiting for stability testing and release? Do you track this as 
       "work-in-process," "batches pending release," or something else?

User: We call it "QC hold" - quality control hold. It's tracked separately from 
      production WIP.

Agent: [TERMINOLOGY UPDATE]
       wip: {
         userTerm: "QC hold",
         example: "batches in quality control waiting for test results",
         confidence: 1.0,
         note: "Distinct from production WIP"
       }
       [/TERMINOLOGY UPDATE]
       
       Perfect - I'll use "QC hold" when referring to batches awaiting release. 
       
       How do you measure throughput? Is it batches per month, units per month, 
       or something else? And what's your current throughput vs. what you need?

User: We measure in batches per month. Right now we're doing about 40 batches/month, 
      but our contracts require us to hit 50 batches/month consistently.

Agent: [METRICS UPDATE]
       throughput: {
         userTerm: "batches per month",
         unit: "batches/month",
         current: 40,
         target: 50,
         gap: 10,
         gapPercentage: 25
       }
       [/METRICS UPDATE]
       
       So you need a 25% throughput increase. Let me confirm what I understand:
       
       - You're in pharmaceutical manufacturing, specifically sterile injectables
       - FDA regulated with EU GMP Annex 1 compliance
       - Contract manufacturing model = frequent product changeovers
       - Batches must pass stability testing before release (QC hold)
       - Current throughput: 40 batches/month
       - Target throughput: 50 batches/month (25% increase needed)
       
       Is that accurate?

User: Yes, that's exactly right.

Agent: [CONTEXT VALIDATION]
       overallConfidence: 0.95
       readyForDiagnostic: true
       [/CONTEXT VALIDATION]
       
       Perfect. Now I'll apply Theory of Constraints methodology to identify 
       your limiting factor. Given your contract manufacturing model, the 
       constraint might be different than typical pharma - could be changeover 
       time, production capacity, or even the stability testing process.
       
       As we go through this, I'll adapt to your terminology. If I slip into 
       generic manufacturing terms instead of pharma-specific language, please 
       correct me - it helps me learn.
       
       Let's start with constraint identification. In your production process, 
       from raw materials to QC hold, where do you typically see the biggest 
       accumulation of batches waiting?

[Now proceeding to TOC diagnostic with full context...]
```

---

## 2. Context-Aware Methodology Application

Once context is established, the agent applies methodology frameworks with domain-specific adaptations.

### 2.1 Terminology Translation Layer

```typescript
class TerminologyTranslator {
  private context: DynamicContext;
  
  translate(genericTerm: string, sentenceContext?: string): string {
    // Use learned terminology if available
    const learnedTerminology = this.context.learned.terminology[genericTerm];
    
    if (learnedTerminology && learnedTerminology.confidence > 0.7) {
      return learnedTerminology.userTerm;
    }
    
    // Otherwise, use industry-appropriate default
    const industryDefaults = this.getIndustryDefaults(
      this.context.industryCategory,
      this.context.functionalArea
    );
    
    return industryDefaults[genericTerm] || genericTerm;
  }
  
  private getIndustryDefaults(industry: string, functionalArea: string): Record<string, string> {
    // Basic fallbacks if we haven't learned user's specific terms
    const defaults = {
      manufacturing_operations: {
        constraint: "bottleneck",
        throughput: "production rate",
        wip: "work-in-process",
        cycle_time: "lead time",
        quality: "first-pass yield",
        efficiency: "OEE"
      },
      healthcare_operations: {
        constraint: "limiting factor",
        throughput: "patient flow rate",
        wip: "patient queue",
        cycle_time: "length of stay",
        quality: "patient safety metrics",
        efficiency: "bed utilization"
      },
      sales: {
        constraint: "blocker",
        throughput: "deals closed per period",
        wip: "sales pipeline",
        cycle_time: "sales cycle length",
        quality: "win rate",
        efficiency: "conversion rate"
      }
    };
    
    const key = `${industry}_${functionalArea}`;
    return defaults[key] || defaults.manufacturing_operations; // Safe default
  }
  
  // Generate contextualized questions
  generateQuestion(templateQuestion: string): string {
    let contextualizedQuestion = templateQuestion;
    
    // Replace generic terms with user's terminology
    const replacements = {
      '{throughput}': this.translate('throughput'),
      '{wip}': this.translate('wip'),
      '{constraint}': this.translate('constraint'),
      '{cycle_time}': this.translate('cycle_time'),
      '{quality_metric}': this.translate('quality'),
      '{efficiency_metric}': this.translate('efficiency')
    };
    
    Object.entries(replacements).forEach(([placeholder, translation]) => {
      contextualizedQuestion = contextualizedQuestion.replace(
        new RegExp(placeholder, 'g'),
        translation
      );
    });
    
    return contextualizedQuestion;
  }
}

// Example usage
const translator = new TerminologyTranslator(userContext);

// Generic question template
const template = "Where does {wip} accumulate most in your process?";

// Manufacturing context: "Where does work-in-process accumulate most in your process?"
// Healthcare context: "Where does the patient queue build up most in your process?"
// Pharma (learned): "Where do batches in QC hold accumulate most in your process?"
const contextualQuestion = translator.generateQuestion(template);
```

---

### 2.2 Constraint Pattern Adaptation

The agent adapts its constraint identification patterns based on learned context.

```typescript
interface ConstraintPattern {
  id: string;
  name: string;
  description: string;
  applicableContexts: ContextMatcher[];
  indicators: string[];
  validationQuestions: string[];
  typicalInterventions: string[];
}

class ConstraintPatternMatcher {
  private patterns: ConstraintPattern[];
  private context: DynamicContext;
  
  identifyApplicablePatterns(): ConstraintPattern[] {
    return this.patterns.filter(pattern => 
      this.matchesContext(pattern, this.context)
    );
  }
  
  private matchesContext(pattern: ConstraintPattern, context: DynamicContext): boolean {
    return pattern.applicableContexts.some(matcher => 
      matcher.industryCategory === context.industryCategory &&
      (!matcher.specificIndustry || matcher.specificIndustry === context.learned.specificIndustry.value) &&
      (!matcher.functionalArea || matcher.functionalArea === context.functionalArea)
    );
  }
}

// Example: Pharma-specific constraint patterns
const pharmaConstraintPatterns: ConstraintPattern[] = [
  {
    id: "pharma-stability-testing",
    name: "Stability Testing as Policy Constraint",
    description: "Batch release delayed by mandatory stability testing requirements",
    applicableContexts: [
      {
        industryCategory: "manufacturing",
        specificIndustry: "pharmaceutical",
        functionalArea: "operations"
      }
    ],
    indicators: [
      "High QC hold inventory",
      "Long time from production complete to market release",
      "Testing lab mentioned as bottleneck"
    ],
    validationQuestions: [
      "How long does stability testing take for a typical batch?",
      "Are all batches tested, or is there sampling?",
      "Can testing be done in parallel with production, or must it wait?",
      "What's the test failure rate? (If low, might be unnecessary constraint)"
    ],
    typicalInterventions: [
      "Investigate regulatory requirements - is full stability testing always required?",
      "Parallel testing (start next batch while testing previous)",
      "Risk-based testing approach (if regulatory allows)",
      "Additional testing capacity (if genuine constraint)"
    ]
  },
  {
    id: "pharma-clean-room-changeover",
    name: "Clean Room Changeover Constraint",
    description: "Frequent product changes require extensive cleaning/validation",
    applicableContexts: [
      {
        industryCategory: "manufacturing",
        specificIndustry: "pharmaceutical - sterile",
        functionalArea: "operations",
        nuance: "contract_manufacturing" // Learned from conversation
      }
    ],
    indicators: [
      "Frequent product changes mentioned",
      "Clean room changeover time significant",
      "Contract manufacturing model (multiple clients/products)"
    ],
    validationQuestions: [
      "How long does a typical clean room changeover take?",
      "How many changeovers per month?",
      "What are the steps in the changeover process?",
      "What drives the changeover time - cleaning, testing, documentation?"
    ],
    typicalInterventions: [
      "Campaign sizing optimization (batch similar products together)",
      "Changeover time reduction (SMED methodology)",
      "Parallel activities during changeover",
      "Product sequencing to minimize cleaning requirements"
    ]
  }
];
```

---

## 3. Nuance Capture and Reuse

Critical: **Every learned nuance must be stored** for future sessions and agent improvement.

### 3.1 Nuance Storage Schema

```typescript
interface CapturedNuance {
  id: string;
  sessionId: string;
  tenantId: string;
  
  // Context where this nuance was discovered
  context: {
    industryCategory: string;
    specificIndustry: string;
    functionalArea: string;
    organizationalLevel: string;
  };
  
  // The nuance itself
  nuance: {
    type: 'terminology' | 'constraint_type' | 'process_characteristic' | 
          'regulatory_requirement' | 'industry_practice' | 'metric_definition';
    
    description: string;
    example: string;
    
    // What was the generic assumption vs. actual reality?
    genericAssumption?: string;
    actualReality: string;
    
    // How should the agent adapt?
    agentAdaptation: string;
  };
  
  // Validation and confidence
  validatedBy: 'user_stated' | 'user_corrected' | 'observation';
  confidence: number;
  timesObserved: number;
  
  // Reusability
  applicableToOthers: boolean; // Can this apply to other users in similar context?
  embedding: number[]; // For RAG retrieval
  
  createdAt: Date;
  lastObserved: Date;
}

// Database storage
CREATE TABLE captured_nuances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  context JSONB NOT NULL,
  nuance JSONB NOT NULL,
  
  validated_by TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  times_observed INT DEFAULT 1,
  
  applicable_to_others BOOLEAN DEFAULT false,
  embedding VECTOR(1536),
  
  created_at TIMESTAMP DEFAULT NOW(),
  last_observed TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON captured_nuances (tenant_id, context->>'specificIndustry');
CREATE INDEX ON captured_nuances USING ivfflat (embedding vector_cosine_ops);
```

---

### 3.2 RAG-Powered Context Loading

When a new user starts a session with similar context, the agent can **load relevant nuances from past sessions**.

```typescript
class ContextRAGLoader {
  
  async loadRelevantNuances(newSessionContext: PrimaryContext): Promise<CapturedNuance[]> {
    // 1. Create embedding of new session context
    const contextEmbedding = await this.embedContext(newSessionContext);
    
    // 2. Search for similar past sessions (semantic similarity)
    const similarNuances = await this.db.query(`
      SELECT *
      FROM captured_nuances
      WHERE applicable_to_others = true
        AND confidence > 0.7
        AND context->>'industryCategory' = $1
      ORDER BY embedding <-> $2
      LIMIT 10
    `, [newSessionContext.industryCategory, contextEmbedding]);
    
    // 3. Filter to most relevant
    const relevantNuances = similarNuances.filter(n => 
      this.isContextuallyRelevant(n.context, newSessionContext)
    );
    
    return relevantNuances;
  }
  
  integrateNuancesIntoSession(
    nuances: CapturedNuance[],
    session: AgentSession
  ): void {
    // Pre-load terminology
    nuances.filter(n => n.nuance.type === 'terminology').forEach(n => {
      session.context.learned.terminology[n.nuance.genericAssumption] = {
        userTerm: n.nuance.actualReality,
        confidence: n.confidence * 0.8, // Lower confidence since it's from another session
        source: 'inferred_from_similar_context'
      };
    });
    
    // Pre-load constraint patterns
    nuances.filter(n => n.nuance.type === 'constraint_type').forEach(n => {
      session.context.learned.typicalConstraints.push(n.nuance.description);
    });
    
    // Note: Agent should VALIDATE these with user, not assume they're correct
    session.inferredKnowledge = {
      source: 'similar_past_sessions',
      confidence: 'low_to_medium',
      mustValidate: true,
      nuances: nuances
    };
  }
}

// Example: Agent uses inferred knowledge but validates
Agent: "I've worked with a few other companies in pharmaceutical manufacturing, 
       and they often use the term 'QC hold' for batches awaiting test results. 
       Is that what you call it, or do you use different terminology?"

// vs. assuming:
Agent: "Where do your batches in QC hold accumulate?" ❌ (might be wrong term)
```

---

## 4. Continuous Context Refinement

Throughout the diagnostic conversation, the agent continues to refine and validate its understanding.

### 4.1 Inline Context Corrections

```typescript
class ContextCorrectionHandler {
  
  handleUserCorrection(
    userResponse: string,
    agentQuestion: string,
    session: AgentSession
  ): ContextUpdate {
    // Detect correction patterns
    const correctionIndicators = [
      "actually", "no,", "not exactly", "we call it", 
      "in our case", "for us", "we use"
    ];
    
    const hasCorrection = correctionIndicators.some(indicator => 
      userResponse.toLowerCase().includes(indicator)
    );
    
    if (hasCorrection) {
      // Extract what was corrected
      const correction = this.extractCorrection(userResponse, agentQuestion);
      
      // Update context
      this.updateContext(session.context, correction);
      
      // Store as captured nuance
      this.storeNuance({
        type: 'user_correction',
        genericAssumption: correction.agentUsed,
        actualReality: correction.userPrefers,
        context: session.context.primaryContext,
        agentAdaptation: `Use "${correction.userPrefers}" instead of "${correction.agentUsed}"`
      });
      
      // Agent acknowledges and adapts
      return {
        acknowledgeCorrection: true,
        newTerm: correction.userPrefers,
        message: `Got it - I'll use "${correction.userPrefers}" from now on.`
      };
    }
    
    return null;
  }
}

// Example in conversation
Agent: "How many units per day do you produce?"

User: "We don't measure in units, we measure in batches. We do about 2 batches per day."

Agent: [CORRECTION DETECTED]
       genericTerm: "units per day"
       userTerm: "batches per day"
       [CONTEXT UPDATE]
       
       "Got it - I'll use 'batches' instead of 'units' from now on. So you're 
        currently producing about 2 batches per day?"
```

---

## 5. Implementation Summary

### Key Principles

1. **Start Generic, Learn Specifics**
   - Agent has methodology expertise (TOC, Lean, Six Sigma)
   - Zero assumptions about user's domain
   - First 5-10 minutes: Context discovery
   
2. **Learn Through Conversation**
   - Structured discovery questions
   - Real-time terminology mapping
   - Continuous validation and correction
   
3. **Store and Reuse**
   - Every nuance captured and stored
   - RAG-powered loading for similar contexts
   - Always validate inferred knowledge with user
   
4. **Adapt Dynamically**
   - Translate all questions to user's terminology
   - Apply methodology patterns appropriate to context
   - Show reasoning when adapting

### Next Steps

Week 1: Build context discovery workflow
Week 2: Implement terminology translator
Week 3: Create nuance capture and storage
Week 4: Integrate RAG for context loading

This approach makes Flow Forge agents **truly universal** - they work in any domain because they learn the domain from the user, rather than pretending to know it in advance.

---

**Document Version**: 3.0 - Dynamic Context Discovery
**Date**: November 14, 2025  
**Core Innovation**: Domain-agnostic agents that learn vertical nuances through conversation
