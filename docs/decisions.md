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

## Future Decisions

Additional decisions will be documented here as the project evolves.

---

**Decision Log Maintained By:** Product Owner (Todd)
**Last Review:** 2025-12-05
