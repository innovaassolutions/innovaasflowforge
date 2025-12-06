# Product Decisions Log

**Project:** Innovaas FlowForge
**Created:** 2025-12-05
**Last Updated:** 2025-12-05

---

## Purpose

This log documents strategic product, technical, and architectural decisions made throughout the project lifecycle. Each decision includes context, alternatives considered, rationale, and consequences to provide future teams with understanding of why choices were made.

---

## Decision Format

Each decision entry includes:
- **Date:** When the decision was made
- **ID:** Unique identifier (DEC-XXX)
- **Status:** Proposed, Accepted, Rejected, Superseded
- **Category:** Technical, Product, Business, Process
- **Stakeholders:** Who was involved in the decision

---

## Decisions

### DEC-001: Multi-Methodology Assessment Platform Architecture (DEFERRED)

**Date:** 2025-12-05
**Status:** Deferred
**Category:** Technical / Strategic Architecture
**Stakeholders:** Todd (Product Owner), BMad Master (Technical Advisor)

#### Decision

Defer implementation of multi-methodology assessment platform architecture until after current four UX enhancements are complete and Epic 1 (Client Assessment Report Generation System) is fully deployed and stable.

#### Context

During sprint change management analysis (correct-course workflow), strategic question raised: "How do we add new frameworks or management methodologies like Lean Six Sigma or Theory of Constraints to the system in a modular fashion so that it's easy to add and edit these methods as we go along?"

**Current State:**
- System hard-coded to Industry 4.0 / Smart Industry Readiness Index (SIRI) framework
- Interview questions specific to digital transformation readiness
- Synthesis analysis uses SIRI-inspired dimensional scoring
- Reports use terminology and visualizations specific to Industry 4.0
- Stakeholder roles defined for manufacturing/technology assessment

**Desired Future State:**
- Pluggable methodology system allowing multiple assessment frameworks
- Framework selection during campaign creation
- Support for:
  - Industry 4.0 (current)
  - Lean Six Sigma
  - Theory of Constraints
  - Future methodologies as needed
- Framework-specific components:
  - Stakeholder role definitions
  - Question banks and interview focus areas
  - Synthesis dimensions and scoring algorithms
  - Report visualizations and terminology
  - Recommendation generation logic

#### Architectural Implications

**Database Schema Changes:**
```sql
-- New tables required
CREATE TABLE assessment_frameworks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  version TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB -- Framework-specific configuration
);

CREATE TABLE framework_dimensions (
  id UUID PRIMARY KEY,
  framework_id UUID REFERENCES assessment_frameworks(id),
  name TEXT NOT NULL,
  description TEXT,
  weight DECIMAL,
  scoring_criteria JSONB
);

CREATE TABLE framework_stakeholder_roles (
  id UUID PRIMARY KEY,
  framework_id UUID REFERENCES assessment_frameworks(id),
  role_name TEXT NOT NULL,
  role_description TEXT,
  focus_areas JSONB,
  question_templates JSONB
);

-- Modify existing tables
ALTER TABLE campaigns ADD COLUMN framework_id UUID REFERENCES assessment_frameworks(id);
ALTER TABLE stakeholder_sessions ADD COLUMN framework_role_id UUID REFERENCES framework_stakeholder_roles(id);
```

**AI Agent Impact:**
- **Interview Agent:** Framework-specific question banks, role-specific prompts
- **Synthesis Agent:** Framework-agnostic analysis OR framework-specific scoring algorithms
- **Report Generator:** Framework-specific templates, visualizations, terminology

**UI/UX Changes:**
- Campaign creation: Framework selection step
- Stakeholder invitation: Role mapping per selected framework
- Report generation: Framework-specific visualizations and content

**Code Architecture:**
- Framework abstraction layer/interface
- Strategy pattern for framework-specific behavior
- Configuration-driven question/analysis logic
- Template system for reports

#### Alternatives Considered

**Alternative 1: Immediate Implementation**
- **Pros:**
  - Enables multi-methodology support sooner
  - Prevents technical debt from hard-coded framework
  - Positions platform for broader market
- **Cons:**
  - Delays current Epic 1 completion
  - Significant refactoring of existing code
  - Requires extensive testing of framework abstraction
  - High risk of introducing bugs to stable system

**Alternative 2: Hybrid - Partial Abstraction Now**
- **Pros:**
  - Some groundwork laid for future modularity
  - Reduces future refactoring effort
- **Cons:**
  - Still delays current priorities
  - May result in incomplete abstraction requiring rework
  - Unclear what subset to abstract without full design

**Alternative 3: Defer Until Post-Epic 1 (SELECTED)**
- **Pros:**
  - Epic 1 (report generation) completes on schedule
  - Current four UX enhancements addressed promptly
  - Framework modularity receives proper architectural design
  - Stable system foundation before major refactoring
  - Industry 4.0 sufficient for near-term (3-6 months)
- **Cons:**
  - Additional refactoring effort later
  - Potential technical debt accumulation
  - Cannot immediately support new methodologies

#### Rationale

Selected Alternative 3 (Defer) for the following reasons:

1. **Current Priority:** Epic 1 completion and four critical UX enhancements take precedence
2. **Market Validation:** Industry 4.0 framework sufficient to validate platform value with initial customers
3. **Proper Planning:** Framework modularity warrants dedicated architecture design session, not rushed implementation
4. **Risk Management:** Major refactoring should occur on stable, tested foundation
5. **Resource Efficiency:** Completing current work prevents context-switching and maintains momentum

**Timeline Assessment:**
- Industry 4.0 framework meets needs for next 3-6 months
- Framework modularity planning can begin after Epic 1 deployment
- Implementation can be scheduled based on customer demand for additional methodologies

#### Consequences

**Positive:**
- ✅ Epic 1 (report generation system) completes without delay
- ✅ Four critical UX enhancements addressed systematically
- ✅ Framework modularity receives proper architectural planning
- ✅ Stable platform foundation established before major refactoring
- ✅ Customer feedback incorporated into framework design
- ✅ Clear prioritization: current needs → future scalability

**Negative:**
- ⚠️ Hard-coded Industry 4.0 framework accumulates technical debt
- ⚠️ Cannot immediately support Lean Six Sigma, Theory of Constraints, or other methodologies
- ⚠️ Future refactoring required to extract framework abstraction
- ⚠️ Potential rework of existing interview questions, synthesis logic, and reports

**Mitigation Strategies:**
- Document framework-specific code clearly for future extraction
- Design new features with modularity in mind where feasible
- Plan architecture workshop immediately after Epic 1 completion
- Gather customer requirements for additional methodologies during current deployments

#### Implementation Plan (When Revisited)

**Pre-Planning Phase:**
1. Gather requirements for 2-3 target methodologies (Lean Six Sigma, Theory of Constraints)
2. Research framework-specific assessment patterns and best practices
3. Interview subject matter experts for each methodology

**Architecture Design Phase:**
4. Design database schema for framework abstraction
5. Define framework configuration format (JSONB structure)
6. Create framework interface/contract
7. Design question bank system
8. Design scoring algorithm abstraction
9. Design report template system

**Implementation Phase:**
10. Extract Industry 4.0 as first framework instance
11. Refactor interview agent for framework abstraction
12. Refactor synthesis agent for framework-agnostic analysis
13. Create framework selection UI in campaign creation
14. Migrate existing campaigns to explicit framework reference
15. Implement second framework (Lean Six Sigma or TOC) to validate abstraction
16. Test framework switching and multi-framework campaigns

**Testing Phase:**
17. Test each framework independently
18. Test framework switching mid-campaign (if supported)
19. Validate data migration for existing campaigns
20. Performance testing with multiple frameworks

**Estimated Effort:** 2-3 weeks architectural design + 3-4 weeks implementation + 1 week testing = **6-8 weeks total**

#### Success Criteria

When framework modularity is eventually implemented, success is defined as:
- ✅ Support for at least 3 distinct assessment methodologies (Industry 4.0, Lean Six Sigma, Theory of Constraints)
- ✅ Framework selection during campaign creation
- ✅ Framework-specific stakeholder roles and questions
- ✅ Framework-specific synthesis dimensions and scoring
- ✅ Framework-specific report visualizations and terminology
- ✅ Ability to add new frameworks without code changes (configuration-driven)
- ✅ Existing campaigns and data unaffected by refactoring
- ✅ No performance degradation from abstraction layer

#### Related Decisions

- DEC-002: (Future) Selection of second methodology to implement
- DEC-003: (Future) Framework configuration format and schema design

#### References

- Sprint Change Proposal: docs/sprint-change-proposal-2025-12-05.md
- Correct-Course Workflow Session: 2025-12-05

---

### DEC-002: Knowledge Base & Benchmarking System with RAG Architecture (HIGH PRIORITY)

**Date:** 2025-12-06
**Status:** Accepted
**Category:** Technical / Strategic Product
**Stakeholders:** Todd (Product Owner), BMad Master (Technical Advisor)
**Priority:** High - Implement post-Epic 1

#### Decision

Implement a comprehensive Knowledge Base and Benchmarking System using RAG (Retrieval Augmented Generation) architecture with vector embeddings to enable cross-campaign intelligence, historical insights, and industry benchmarking capabilities.

#### Context

**Strategic Business Need:**

The platform must evolve beyond isolated campaign assessments to build institutional knowledge over time. This knowledge base is fundamental to:

1. **Credibility & Accuracy:** Providing benchmark data strengthens scoring credibility
2. **Consultant Value:** Historical intelligence enables evidence-based recommendations
3. **Competitive Differentiation:** Proprietary benchmark database becomes moat
4. **Cross-Industry Insights:** Learning transfers across sectors and methodologies

**Current Limitation:**

Each campaign operates in isolation with no memory or learning from previous assessments:
- Consultants cannot reference similar past campaigns
- No industry benchmarking data available
- Recommendations based solely on current campaign context
- No accumulation of "what works" evidence across implementations

**User Needs Identified:**

1. **Benchmark Scoring:** "This healthcare system scores 45% - how does that compare to similar organizations?"
2. **Evidence-Based Recommendations:** "What digital transformation strategies worked for other manufacturing companies?"
3. **Success Pattern Recognition:** "Show me examples of successful IoT implementations in logistics"
4. **Industry Intelligence:** "What are common technology challenges in retail?"
5. **Consultant Research:** Quick access to relevant historical campaign data when advising new clients

#### Architectural Design

**Technology Stack:**

- **Vector Database:** Supabase pgvector extension (already available in Supabase PostgreSQL)
- **Embeddings Model:** OpenAI `text-embedding-3-small` ($0.02 per 1M tokens)
- **Vector Dimensions:** 1536 dimensions (OpenAI standard)
- **Similarity Search:** Cosine similarity with configurable threshold (0.7-0.8)

**Database Schema:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Campaign embeddings for semantic search
CREATE TABLE campaign_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Metadata
  company_name TEXT NOT NULL,
  company_industry TEXT NOT NULL,
  company_size TEXT, -- Small, Medium, Large, Enterprise
  company_region TEXT, -- Geographic region
  framework_slug TEXT NOT NULL, -- e.g., 'industry-4.0', 'lean-six-sigma'

  -- Assessment results
  overall_score DECIMAL(5,2),
  pillar_scores JSONB, -- Dimensional scores
  key_themes TEXT[],

  -- Searchable content (for embeddings)
  executive_summary TEXT,
  key_challenges TEXT,
  recommendations_summary TEXT,
  success_factors TEXT,

  -- Vector embeddings
  embedding vector(1536), -- OpenAI embedding

  -- Privacy & permissions
  is_public BOOLEAN DEFAULT false, -- Allow in global benchmarks
  organization_id UUID REFERENCES organizations(id), -- For org-level insights

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_knowledge_base_embedding ON campaign_knowledge_base
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_knowledge_base_industry ON campaign_knowledge_base(company_industry);
CREATE INDEX idx_knowledge_base_framework ON campaign_knowledge_base(framework_slug);
CREATE INDEX idx_knowledge_base_score ON campaign_knowledge_base(overall_score);

-- Recommendation embeddings for pattern matching
CREATE TABLE recommendation_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),

  -- Recommendation details
  recommendation_title TEXT NOT NULL,
  recommendation_text TEXT NOT NULL,
  recommendation_category TEXT, -- Technology, Process, Organization
  priority TEXT, -- High, Medium, Low

  -- Context
  company_industry TEXT,
  problem_addressed TEXT,
  outcome_achieved TEXT, -- If follow-up data available

  -- Vector embedding
  embedding vector(1536),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendation_embedding ON recommendation_knowledge_base
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Success stories for consultant research
CREATE TABLE success_story_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),

  -- Story details
  title TEXT NOT NULL, -- e.g., "IoT Sensor Network Implementation"
  description TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  technology_used TEXT[],
  challenges_overcome TEXT,
  results_achieved TEXT,
  lessons_learned TEXT,

  -- Vector embedding
  embedding vector(1536),

  -- Metadata
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_success_story_embedding ON success_story_knowledge_base
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**Vector Search Functions:**

```sql
-- Find similar campaigns
CREATE OR REPLACE FUNCTION match_similar_campaigns(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 10,
  filter_industry text DEFAULT NULL,
  filter_framework text DEFAULT NULL
)
RETURNS TABLE (
  campaign_id uuid,
  company_name text,
  company_industry text,
  overall_score decimal,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.campaign_id,
    kb.company_name,
    kb.company_industry,
    kb.overall_score,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM campaign_knowledge_base kb
  WHERE
    (filter_industry IS NULL OR kb.company_industry = filter_industry)
    AND (filter_framework IS NULL OR kb.framework_slug = filter_framework)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Find relevant recommendations
CREATE OR REPLACE FUNCTION match_recommendations(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.70,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  recommendation_id uuid,
  recommendation_title text,
  recommendation_text text,
  company_industry text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rb.id,
    rb.recommendation_title,
    rb.recommendation_text,
    rb.company_industry,
    1 - (rb.embedding <=> query_embedding) as similarity
  FROM recommendation_knowledge_base rb
  WHERE 1 - (rb.embedding <=> query_embedding) > match_threshold
  ORDER BY rb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### Key Features to Implement

**1. Automatic Knowledge Base Population**

After each campaign synthesis:
- Extract key information (summary, challenges, recommendations)
- Generate embeddings using OpenAI API
- Store in knowledge base tables
- Index for semantic search

**2. Industry Benchmarking Dashboard**

Consultant-facing analytics:
- Average scores by industry
- Common challenges by sector
- Percentile ranking for current campaign
- Trend analysis over time

**3. Intelligent Recommendation Engine**

During synthesis, augment AI with historical data:
- "Similar companies faced X challenge and successfully used Y approach"
- Evidence-based recommendations with attribution
- Pattern recognition across campaigns

**4. Consultant Research Tool**

Search interface for consultants:
- "Show me healthcare IoT implementations"
- "What worked for retail digital transformation?"
- Semantic search across all campaign data
- Filter by industry, company size, framework

**5. Privacy & Permissions**

- **Organization-level insights:** Consultants see their org's campaigns
- **Public benchmarks:** Anonymized aggregate data (opt-in)
- **Private campaigns:** Excluded from global knowledge base
- **Sensitive data filtering:** PII removal before indexing

#### Implementation Phases

**Phase 1: Infrastructure Setup (1-2 weeks)**
- Enable pgvector extension in Supabase
- Create knowledge base schema and tables
- Build embedding generation pipeline
- Create vector search functions

**Phase 2: Automatic Indexing (2 weeks)**
- Hook into synthesis completion
- Extract and summarize key information
- Generate embeddings via OpenAI API
- Store in knowledge base
- Backfill existing campaigns

**Phase 3: Benchmarking Features (2 weeks)**
- Build industry benchmarking queries
- Create consultant dashboard with benchmark data
- Percentile scoring visualization
- Trend charts over time

**Phase 4: Enhanced Synthesis (2-3 weeks)**
- Modify synthesis agent to query knowledge base
- Retrieve similar campaigns and recommendations
- Augment synthesis prompt with historical insights
- Test quality improvements

**Phase 5: Consultant Research Tool (2 weeks)**
- Build search interface
- Semantic search with filters
- Result ranking and relevance
- Export and sharing capabilities

**Total Estimated Effort:** 9-11 weeks

#### Cost Analysis

**Embedding Generation:**
- Average campaign summary: ~2,000 tokens
- Cost per campaign: 2,000 × ($0.02 / 1M) = $0.00004
- 10,000 campaigns: **$0.40 total**

**Storage:**
- Vector: 1536 dimensions × 4 bytes = 6KB per campaign
- 10,000 campaigns: 60MB vector storage
- Supabase cost: **Negligible**

**Search Operations:**
- Free with pgvector (runs in Supabase PostgreSQL)
- No per-query costs

**Synthesis Enhancement:**
- Additional ~10K input tokens per synthesis (similar campaign data)
- Cost increase: ~$0.03 per synthesis
- **Total impact: Minimal (~$30/month at 1000 campaigns)**

**Conclusion:** Very cost-effective for significant value add.

#### Success Criteria

When knowledge base is implemented, success is defined as:
- ✅ All campaigns automatically indexed in knowledge base
- ✅ Industry benchmarking data available to consultants
- ✅ Semantic search returns relevant historical campaigns
- ✅ Synthesis includes evidence-based recommendations from knowledge base
- ✅ Consultants can research past implementations
- ✅ Privacy controls prevent unauthorized data access
- ✅ <500ms average search latency
- ✅ >80% consultant satisfaction with research tool

#### Consequences

**Positive:**
- ✅ Platform builds proprietary benchmark database (competitive moat)
- ✅ Scoring credibility increases with historical context
- ✅ Recommendations backed by evidence from similar cases
- ✅ Consultants empowered with historical intelligence
- ✅ Cross-campaign learning improves platform value over time
- ✅ Enables future features: predictive analytics, trend detection
- ✅ Supports multi-methodology framework (each framework builds its own knowledge base)

**Negative:**
- ⚠️ Additional complexity in data pipeline
- ⚠️ Privacy considerations require careful implementation
- ⚠️ Vector database management adds operational overhead
- ⚠️ Quality dependent on volume (requires critical mass of campaigns)
- ⚠️ Embedding costs (though minimal)

**Mitigation Strategies:**
- Implement privacy controls from day one
- Start with organization-level insights, expand to public benchmarks gradually
- Build monitoring for embedding generation and search performance
- Provide opt-out mechanisms for sensitive campaigns

#### Related Decisions

- DEC-001: Multi-Methodology Framework - Each framework will have separate knowledge base
- DEC-003: (Future) Privacy and data sharing policies for knowledge base
- DEC-004: (Future) Consultant research tool UX design

#### References

- Token Cost Analysis: docs/ai-token-cost-analysis.md
- RAG Architecture Discussion: 2025-12-06
- Sprint Change Proposal: docs/sprint-change-proposal-2025-12-05.md

---

### DEC-003: Consultant Observations & Documentation (ACCEPTED - In Progress)

**Date:** 2025-12-06
**Status:** Accepted (Implementation in Story 1.4)
**Category:** Product Feature
**Stakeholders:** Todd (Product Owner)

#### Decision

Consultants can add observations and upload supporting documentation on campaigns as part of final report submission.

#### Implementation Status

**Already Designed (Story 1.4):**
- `campaign_reports.consultant_observations` field (TEXT) - Markdown supported
- `campaign_reports.supporting_documents` field (JSONB array) - Stores uploaded files
- Upload interface in Report Generation Panel
- Display on public report page

**Pending Implementation:**
- Document upload UI (Story 1.4)
- Supabase Storage integration (Story 1.4)
- Markdown download includes observations (Story 1.4)

#### Success Criteria

- ✅ Consultants can add text observations to reports
- ✅ Consultants can upload supporting documents (PDF, DOCX, XLSX, PNG, JPG)
- ✅ Observations display on client-facing report page
- ✅ Documents available as downloadable links
- ✅ Markdown export includes observations

#### References

- Epic 1 Documentation: docs/epics.md
- Story 1.4: Document Upload & Enhancements

---

## Future Decisions

Additional decisions will be documented here as the project evolves.

**Upcoming Decisions:**
- DEC-004: Consultant research tool UX design
- DEC-005: Knowledge base privacy and data sharing policies
- DEC-006: Cross-methodology benchmarking approach

---

**Decision Log Maintained By:** Product Owner (Todd)
**Last Review:** 2025-12-06
