# FlowForge Education Module: Architecture Decision Records

> Technical decisions for the Education vertical implementation
> Created: 2025-12-29
> Status: Active

---

## ADR-001: Schools as Separate Entity

**Date:** 2025-12-29
**Status:** Approved
**Deciders:** Todd Abraham

### Context

The education module requires a `schools` entity to be referenced by:
- `education_access_codes.school_id`
- `education_participant_tokens.school_id`
- `education_safeguarding_alerts.school_id`
- `campaigns.school_id` (for education campaigns)

The existing FlowForge platform uses `organizations` as the primary tenant entity. We need to determine how schools fit into this model.

### Decision

**Schools will be implemented as a separate entity linked to organizations.**

```
organizations (consulting firms, school groups)
    └── schools (individual schools)
            └── campaigns (education assessments)
                    └── education_participant_tokens
                    └── education_access_codes
```

### Rationale

1. **Clean Separation**: Schools have fundamentally different attributes than consulting organizations:
   - Curriculum type (IB, British, American)
   - Student count ranges
   - Safeguarding protocols and contacts
   - Fee tier for pricing

2. **Multi-School Support**: A single organization (e.g., a school group like Cognita, Nord Anglia) may manage multiple schools. This model supports that from day one.

3. **Consultant Model**: A consulting firm (Innovaas) can serve multiple schools as an organization, with each school as a separate entity.

4. **Future Flexibility**: If direct school sign-up is added later, schools can be promoted to organizations or linked directly.

### Consequences

**Positive:**
- School-specific fields are first-class (curriculum, safeguarding contacts)
- Multi-school groups supported natively
- Cleaner RLS policies (organization → school → campaign chain)
- No conflation of B2B consulting clients with B2B schools

**Negative:**
- Additional join required in some queries
- New table to maintain
- Schools need to be created before education campaigns

### Implementation

```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL,
    curriculum TEXT,
    student_count_range TEXT,
    safeguarding_lead_contact TEXT,
    -- ... additional fields
);
```

---

## ADR-002: Pseudonymous Token Architecture

**Date:** 2025-12-29
**Status:** Approved
**Deciders:** Todd Abraham

### Context

The education module requires a fundamentally different identity model than existing industry assessments:
- Current model: Store stakeholder name, email, role directly
- Education model: Store only pseudonymous tokens; school holds identity mapping

### Decision

**Implement a two-layer identity model with school-held escrow.**

Layer A (Default): Pseudonymous tokens only
- `ff_edu_` + 32 hex characters
- No PII stored in FlowForge
- Cohort metadata only (year_band, division, participant_type)

Layer B (Break-Glass): School-held identity escrow
- School maintains token→identity mapping externally
- FlowForge alerts school with token only
- School unmasks internally under safeguarding protocol

### Rationale

1. **Trust Architecture**: Students, teachers, and parents will only be candid if they believe their identity is protected. Technical guarantees (not just policy promises) are required.

2. **Safeguarding Compliance**: Schools retain duty of care through break-glass protocol while participants remain pseudonymous during normal operation.

3. **Legal Separation**: FlowForge cannot be compelled to reveal identity it doesn't possess.

### Consequences

**Positive:**
- Maximum trust unlock for participants
- School retains control over unmasking
- FlowForge liability reduced
- PDPA/GDPR compliant by design

**Negative:**
- Cannot do individual follow-up without school cooperation
- Longitudinal tracking requires token persistence logic
- School must maintain secure escrow process

---

## ADR-003: Agent Session Linkage Strategy

**Date:** 2025-12-29
**Status:** Approved
**Deciders:** Todd Abraham

### Context

Existing `agent_sessions` table references `stakeholder_session_id` (campaign_assignments). Education module needs to link agent sessions to pseudonymous participant tokens instead.

### Decision

**Extend existing agent_sessions table with nullable `participant_token_id`.**

```sql
ALTER TABLE agent_sessions
    ADD COLUMN participant_token_id UUID
    REFERENCES education_participant_tokens(id);
```

### Rationale

1. **Unified Agent Patterns**: Keep all agent conversations in one table for consistent querying, analytics, and maintenance.

2. **Conditional Linkage**:
   - Industry campaigns: use `stakeholder_session_id`
   - Education campaigns: use `participant_token_id`

3. **Simpler Migration**: No need for parallel table; additive change only.

### Consequences

**Positive:**
- Existing agent infrastructure reusable
- Single table for all agent analytics
- Simpler RLS policies

**Negative:**
- Table has optional columns (acceptable trade-off)
- Query logic must check campaign type

---

## ADR-004: Safeguarding Alert Channel

**Date:** 2025-12-29
**Status:** Proposed (Needs Implementation Decision)
**Deciders:** Pending

### Context

When break-glass is triggered, the school's safeguarding lead must be notified immediately. The alert must NOT go through standard email (insecure, may be missed).

### Options Under Consideration

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Secure portal notification | School logs in to see alerts | May miss real-time alerts |
| B | SMS to safeguarding lead | Immediate; hard to ignore | SMS security concerns; international numbers |
| C | WhatsApp Business API | Encrypted; widely used | Integration complexity |
| D | Webhook to school system | Integrates with existing tools | Requires school IT setup |

### Decision

**Pending** - To be decided before pilot launch.

Recommendation: Start with **Option A + B** (portal as primary, SMS as backup notification that alert exists).

---

## Migration Checklist

Based on approved decisions, the following migrations have been created:

- [x] `20251229_001_create_schools_table.sql` - Schools entity with safeguarding config
- [x] `20251229_002_add_education_campaign_fields.sql` - Campaign extensions for education
- [x] `20251229_003_create_education_access_codes.sql` - One-time access codes with redemption
- [x] `20251229_004_create_education_participant_tokens.sql` - Pseudonymous tokens (NO PII)
- [x] `20251229_005_create_education_safeguarding_alerts.sql` - Break-glass event tracking
- [x] `20251229_006_extend_agent_sessions.sql` - Education session context
- [x] `20251229_007_education_rls_policies.sql` - Comprehensive security policies

**Status:** All migrations created 2025-12-29

---

## Next Development Phase

With database schema complete, the following development is required:

### API Routes
- [x] `POST /api/education/schools` - School CRUD (GET, POST)
- [x] `GET/PATCH/DELETE /api/education/schools/[id]` - Individual school operations
- [x] `POST /api/education/access-codes/generate` - Bulk code generation
- [x] `POST /api/education/redeem-code` - Code redemption → token
- [x] `GET /api/education/session/[token]` - Session access
- [x] `POST /api/education/session/[token]/messages` - Send interview messages
- [x] `GET/PATCH /api/education/safeguarding/alerts` - Alert dashboard & acknowledgment

**Status:** All API routes created 2025-12-29

### Agent Development
- [x] `lib/agents/education-interview-agent.ts` - Trust-first interview agent
- [x] `lib/agents/education-synthesis-agent.ts` - Cross-stakeholder synthesis
- [x] Safeguarding detection integration (patterns + confidence scoring)

**Status:** All agents created 2025-12-29

### UI Components
- [ ] School management screens
- [ ] Access code generation UI
- [ ] Education session interface (pseudonymous)
- [ ] Safeguarding alert dashboard

---

*Decision records maintained as education module development progresses.*
