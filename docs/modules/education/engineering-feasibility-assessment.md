# FlowForge Education Module: Engineering Feasibility Assessment

> Technical Review of Anonymity Architecture Integration
> Generated: 2025-12-29
> Status: Assessment Complete
> Reviewer: BMad Engineering Analysis

---

## Executive Summary

The Education Module's technical anonymity architecture has been reviewed against the existing FlowForge platform database schema and codebase. This assessment identifies integration points, gaps, and required development work.

**Overall Assessment: FEASIBLE with significant new development required**

| Category | Status | Notes |
|----------|--------|-------|
| Database Schema | 🟡 Requires new tables | Schools table missing; 3 new education tables needed |
| Authentication Flow | 🟢 Compatible | Access code pattern aligns with existing access_token |
| Agent Architecture | 🟢 Compatible | Can extend existing agent session patterns |
| Synthesis Pipeline | 🟢 Compatible | Existing synthesis patterns applicable |
| Multi-tenancy | 🟡 Needs consideration | Schools as organizations vs. new entity type |

---

## Part 1: Existing Platform Architecture Summary

### Current Database Structure

```
organizations (tenant entity)
    └── user_profiles (facilitators/admins)
    └── campaigns
            └── campaign_assignments (stakeholder → campaign links)
                    └── agent_sessions (AI conversations)
                    └── session_documents (uploads)
            └── synthesis (cross-interview analysis)
            └── campaign_reports
```

### Current Identity Model (Industry Assessment)

| Field | Storage Location | Purpose |
|-------|------------------|---------|
| stakeholder_name | campaign_assignments | Direct identification |
| stakeholder_email | campaign_assignments | Contact and access |
| stakeholder_role | campaign_assignments | Role-based analysis |
| access_token | campaign_assignments | Anonymous session access |

**Key Difference**: Current model stores PII directly. Education module requires pseudonymous tokens with zero PII storage.

---

## Part 2: Integration Gap Analysis

### Gap 1: Schools Table (CRITICAL)

**Issue**: Technical architecture references `schools(id)` but no schools table exists.

**Current State**: Platform uses `organizations` as tenant entity.

**Decision Required**:

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Schools = Organizations** | Schools are a type of organization | Simpler model; reuse existing RLS | Conflates B2B consulting clients with B2B schools |
| **B: Schools as Separate Entity** | New `schools` table under organizations | Clean separation; school-specific fields | More complexity; additional joins |
| **C: Schools as Sub-Organizations** | Schools belong to an org (e.g., school group) | Supports multi-school groups | Over-engineering for MVP |

**Recommendation**: Option B (Schools as Separate Entity) for MVP, with consideration for Option C in future.

### Gap 2: Education-Specific Tables

**Required New Tables**:

1. `schools` - School entity with education-specific fields
2. `education_access_codes` - One-time access codes per cohort
3. `education_participant_tokens` - Pseudonymous participant identifiers
4. `education_safeguarding_alerts` - Break-glass event tracking

### Gap 3: Campaign Type Extension

**Current**: `campaign_type` accepts string values ('industry_4.0', 'digital_transformation', etc.)

**Required**: Add 'education_pilot', 'education_annual' as valid types with type-specific configuration.

### Gap 4: Agent Session Linkage

**Current**: `agent_sessions.stakeholder_session_id` references campaign_assignments

**Education Model**: Agent sessions should reference `education_participant_tokens.id` for pseudonymous operation

**Options**:
| Option | Description |
|--------|-------------|
| A: Add `participant_token_id` to agent_sessions | Nullable FK; use for education campaigns |
| B: Create `education_agent_sessions` table | Separate table for education interviews |

**Recommendation**: Option A - keeps agent patterns unified.

---

## Part 3: Proposed Schema Integration

### New Table: `schools`

```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- School identification
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- Short identifier (e.g., 'ACS', 'TCS')

    -- School details
    country TEXT NOT NULL,
    city TEXT,
    curriculum TEXT, -- 'IB', 'British', 'American', 'Bilingual', etc.
    student_count_range TEXT, -- '<500', '500-1500', '1500+'
    fee_tier TEXT, -- For pricing tier determination

    -- Contacts
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_role TEXT,

    -- Safeguarding configuration
    safeguarding_lead_name TEXT,
    safeguarding_lead_contact TEXT,
    safeguarding_protocol TEXT, -- 'standard', 'two_key'

    -- Status
    status TEXT NOT NULL DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_schools_organization ON schools(organization_id);
CREATE INDEX idx_schools_code ON schools(code);
CREATE INDEX idx_schools_country ON schools(country);
```

### Modified Table: `campaigns`

```sql
-- Add education-specific fields (nullable for non-education campaigns)
ALTER TABLE campaigns
    ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    ADD COLUMN education_config JSONB; -- modules, cohorts, anonymity settings

CREATE INDEX idx_campaigns_school ON campaigns(school_id);
```

### Modified Table: `agent_sessions`

```sql
-- Add education participant reference (nullable)
ALTER TABLE agent_sessions
    ADD COLUMN participant_token_id UUID REFERENCES education_participant_tokens(id) ON DELETE SET NULL;

CREATE INDEX idx_agent_sessions_participant_token ON agent_sessions(participant_token_id);
```

### New Tables (as specified in technical-anonymity-architecture.md)

Tables `education_access_codes`, `education_participant_tokens`, and `education_safeguarding_alerts` can be implemented as specified with minor adjustments:

1. All reference `schools(id)` - will work once schools table created
2. All reference `campaigns(id)` - existing table, compatible
3. Add RLS policies mirroring existing organization-scoped patterns

---

## Part 4: Authentication Flow Compatibility

### Current Access Token Pattern

```typescript
// Existing: stakeholder accesses via URL with token
GET /session/[access_token]
→ Lookup campaign_assignments.access_token
→ Return session data including stakeholder identity
```

### Education Access Code Pattern

```typescript
// Proposed: participant enters one-time code
POST /api/education/redeem-code
→ Validate education_access_codes.code
→ Generate pseudonymous token
→ Create education_participant_tokens record
→ Return token for session use

GET /session/education/[participant_token]
→ Lookup education_participant_tokens.token
→ Return session WITHOUT identity data
```

**Compatibility Assessment**: ✅ Compatible
- Different URL pattern avoids conflict
- Can use same session components with conditional identity display
- Agent sessions work identically once participant context established

---

## Part 5: Agent Architecture Compatibility

### Current Agent Pattern

```typescript
// lib/agents/assessment-agent.ts
interface AgentContext {
    stakeholder_session_id: string;
    stakeholder_name: string;      // ❌ Not available in education
    stakeholder_role: string;
    campaign_id: string;
    // ...
}
```

### Education Agent Adaptation

```typescript
// lib/agents/education-interview-agent.ts
interface EducationAgentContext {
    participant_token: string;
    participant_type: 'student' | 'teacher' | 'parent' | 'leadership';
    cohort_metadata: {
        year_band?: string;
        division?: string;
    };
    campaign_id: string;
    school_id: string;
    module: string;
    // NO identity fields
}
```

**Compatibility Assessment**: ✅ Compatible
- Can create `education-interview-agent.ts` alongside existing agents
- Different system prompt focused on trust-first questioning
- Safeguarding detection integrated into response processing

---

## Part 6: Synthesis Pipeline Compatibility

### Current Synthesis Pattern

```typescript
// Aggregates by stakeholder role across campaign
synthesis.source_session_ids → stakeholder_sessions → responses
```

### Education Synthesis Adaptation

```typescript
// Aggregates by participant_type and cohort across campaign
synthesis.source_token_ids → education_participant_tokens → responses
```

**Required Changes**:
1. Add `source_token_ids` column to synthesis table (nullable)
2. Synthesis agent configuration for education-specific triangulation
3. Minimum cohort size enforcement before generating reports

**Compatibility Assessment**: ✅ Compatible with minor extension

---

## Part 7: RLS Policy Strategy

Education tables require organization-scoped access via campaign → school → organization chain:

```sql
-- Example: education_access_codes RLS
CREATE POLICY "Users can view access codes in their organization"
    ON education_access_codes FOR SELECT
    USING (
        school_id IN (
            SELECT id FROM schools
            WHERE organization_id = auth.current_user_organization_id()
        )
    );
```

**Compatibility Assessment**: ✅ Compatible - follows existing RLS patterns

---

## Part 8: Migration Sequence

### Phase 1: Core Schema (Pre-Pilot)

```
Migration Order:
1. 20251230_create_schools_table.sql
2. 20251230_add_education_campaign_fields.sql
3. 20251230_create_education_access_codes.sql
4. 20251230_create_education_participant_tokens.sql
5. 20251230_create_education_safeguarding_alerts.sql
6. 20251230_extend_agent_sessions.sql
7. 20251230_education_rls_policies.sql
```

### Phase 2: Agent Development (Pre-Pilot)

```
1. Create lib/agents/education-interview-agent.ts
2. Create lib/agents/education-synthesis-agent.ts
3. Create app/api/education/redeem-code/route.ts
4. Create app/session/education/[token]/page.tsx
5. Extend safeguarding detection in agent response processing
```

### Phase 3: Admin Interface (Pre-Pilot)

```
1. School management UI
2. Access code generation UI
3. Safeguarding alert dashboard
4. Education campaign configuration
```

---

## Part 9: Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Token-identity mapping leak | HIGH | School-held escrow; FlowForge never stores mapping |
| Safeguarding alert delay | HIGH | Real-time detection; multiple notification channels |
| Re-identification via patterns | MEDIUM | Minimum cohort sizes; differential privacy in synthesis |
| Access code theft/sharing | MEDIUM | One-time use; expiration; school distribution |
| Database schema migration failures | LOW | Incremental migrations; rollback scripts |

---

## Part 10: Recommended Next Steps

### Immediate (Before Pilot)

1. **Architecture Decision**: Confirm schools as separate entity vs. organization subtype
2. **Schema Migration**: Create all required tables in development
3. **Agent Development**: Build education interview agent with safeguarding
4. **Access Flow**: Implement code redemption and token generation
5. **Safeguarding**: Build alert system and school notification channel

### Post-Pilot

1. Two-key unmasking implementation (optional enhanced security)
2. Longitudinal token persistence across campaigns
3. Advanced synthesis with differential privacy
4. School admin portal for escrow management

---

## Appendix: Development Estimates

| Component | Complexity | Notes |
|-----------|------------|-------|
| Database migrations | Low | Straightforward schema additions |
| Access code/token flow | Medium | New authentication pattern |
| Education interview agent | Medium | New agent with trust-first prompting |
| Safeguarding detection | High | Real-time AI analysis + alerting |
| Session UI adaptation | Low | Conditional display based on campaign type |
| School admin interface | Medium | New CRUD screens |
| Synthesis adaptation | Medium | New aggregation patterns |

---

*Assessment prepared for engineering team review.*
*Recommend technical discussion before pilot commitment.*
