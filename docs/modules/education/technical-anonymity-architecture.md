# FlowForge Education: Technical Anonymity Architecture

> Priority Document
> Generated: 2025-12-29
> Status: Draft - Technical Specification
> Related: 14-day-pilot-architecture.md, flow-forge-anonymity-master-plan.md

---

## Executive Summary

This document specifies the technical implementation of FlowForge's anonymity system for the education vertical. The architecture must deliver on the trust promises made to all stakeholders: students, teachers, parents, and school leadership.

**Core Technical Principle:**
> Separate identity from input through cryptographic and structural layers - not just policy promises.

---

## Part 1: Identity Model Overview

### Two-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER A: DEFAULT MODE                        │
│                     Pseudonymous Operation                       │
├─────────────────────────────────────────────────────────────────┤
│  - Persistent pseudonymous token per participant                 │
│  - Minimal metadata: role, year band, division                   │
│  - NO names, emails, national IDs stored in FlowForge           │
│  - Leadership sees patterns by cohort + token                    │
│  - Enables: high candour + longitudinal tracking                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ONLY when imminent harm threshold triggered
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER B: BREAK-GLASS MODE                    │
│                     Identity Escrow                              │
├─────────────────────────────────────────────────────────────────┤
│  - School-held key (recommended)                                 │
│  - FlowForge alerts school with token                           │
│  - School unmasks internally under safeguarding protocol         │
│  - Strict governance: two authorized roles required              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Access & Authentication

### School-Issued Access Codes (Recommended for MVP)

```
┌──────────────────────────────────────────────────────────────────┐
│                    ACCESS CODE FLOW                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. School generates access codes per cohort/role                │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ Example: PILOT-STU-Y10-A7X9K                         │     │
│     │          PILOT-TCH-SEC-B3M2P                         │     │
│     │          PILOT-PAR-Y10-C8N4Q                         │     │
│     └─────────────────────────────────────────────────────┘     │
│                              │                                    │
│  2. Codes distributed via school channels                        │
│     (email, SMS, printed slip - school's choice)                 │
│                              │                                    │
│  3. Participant enters code at FlowForge                         │
│                              │                                    │
│  4. Code validated → Expires after first use                     │
│                              │                                    │
│  5. FlowForge generates persistent pseudonymous token            │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ Token: ff_edu_a1b2c3d4e5f6g7h8                       │     │
│     │ Stored: token + role + year_band + campaign_id       │     │
│     │ NOT stored: name, email, ID, access_code             │     │
│     └─────────────────────────────────────────────────────┘     │
│                              │                                    │
│  6. Token persists for longitudinal tracking                     │
│     (same participant across multiple campaigns)                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Database Schema: Access Codes

```sql
-- School-generated access codes
CREATE TABLE education_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    school_id UUID NOT NULL REFERENCES schools(id),

    -- Code properties
    code VARCHAR(20) NOT NULL UNIQUE,
    code_type VARCHAR(20) NOT NULL, -- 'student', 'teacher', 'parent', 'leadership'
    cohort_metadata JSONB, -- { year_band: '10', division: 'secondary' }

    -- Lifecycle
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'used', 'expired', 'revoked'
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,

    -- Audit (but NOT identity)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- school admin who generated
);

-- Index for fast lookup
CREATE INDEX idx_access_codes_code ON education_access_codes(code) WHERE status = 'active';
CREATE INDEX idx_access_codes_campaign ON education_access_codes(campaign_id);
```

### Database Schema: Pseudonymous Tokens

```sql
-- Pseudonymous participant tokens (NO IDENTITY DATA)
CREATE TABLE education_participant_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The pseudonymous token (public identifier)
    token VARCHAR(50) NOT NULL UNIQUE,

    -- Campaign association
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    school_id UUID NOT NULL REFERENCES schools(id),

    -- Minimal metadata (for aggregation, NOT identification)
    participant_type VARCHAR(20) NOT NULL, -- 'student', 'teacher', 'parent', 'leadership'
    cohort_metadata JSONB, -- { year_band: '10', division: 'secondary', role_category: 'classroom_teacher' }

    -- Session tracking
    first_session_at TIMESTAMPTZ DEFAULT NOW(),
    last_session_at TIMESTAMPTZ,
    session_count INTEGER DEFAULT 0,

    -- NO identity fields: no name, no email, no external_id

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_participant_tokens_campaign ON education_participant_tokens(campaign_id);
CREATE INDEX idx_participant_tokens_school ON education_participant_tokens(school_id);
CREATE INDEX idx_participant_tokens_type ON education_participant_tokens(participant_type);
```

---

## Part 3: Token Generation

### Token Format

```typescript
// Token generation utility
function generateParticipantToken(): string {
  const prefix = 'ff_edu_';
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `${prefix}${randomPart}`;
  // Example: ff_edu_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
}
```

### Token Properties

| Property | Specification |
|----------|---------------|
| Format | `ff_edu_` + 32 hex characters |
| Uniqueness | Globally unique across all campaigns |
| Persistence | Survives across multiple campaigns for longitudinal tracking |
| Reversibility | Cannot be reversed to identity (one-way assignment) |
| Storage | FlowForge stores token only; school stores token→identity mapping |

### Code-to-Token Flow

```typescript
interface AccessCodeRedemption {
  code: string;
  campaign_id: string;
}

interface TokenAssignment {
  token: string;
  participant_type: 'student' | 'teacher' | 'parent' | 'leadership';
  cohort_metadata: {
    year_band?: string;
    division?: string;
    role_category?: string;
  };
}

async function redeemAccessCode(input: AccessCodeRedemption): Promise<TokenAssignment> {
  // 1. Validate code exists and is active
  const accessCode = await db.education_access_codes.findFirst({
    where: {
      code: input.code,
      campaign_id: input.campaign_id,
      status: 'active',
      expires_at: { gt: new Date() }
    }
  });

  if (!accessCode) {
    throw new Error('Invalid or expired access code');
  }

  // 2. Mark code as used (one-time use)
  await db.education_access_codes.update({
    where: { id: accessCode.id },
    data: { status: 'used', used_at: new Date() }
  });

  // 3. Generate pseudonymous token
  const token = generateParticipantToken();

  // 4. Create participant token record (NO IDENTITY)
  const participant = await db.education_participant_tokens.create({
    data: {
      token,
      campaign_id: input.campaign_id,
      school_id: accessCode.school_id,
      participant_type: accessCode.code_type,
      cohort_metadata: accessCode.cohort_metadata
    }
  });

  // 5. Return token for session use
  return {
    token: participant.token,
    participant_type: participant.participant_type,
    cohort_metadata: participant.cohort_metadata
  };
}
```

---

## Part 4: School-Side Identity Escrow

### Recommended Model: School-Held Key

FlowForge **never stores** the token→identity mapping. The school maintains this separately.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCHOOL SYSTEM                                 │
│  (School's own database or secure spreadsheet)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  access_code    │  token              │  identity        │   │
│  ├─────────────────┼─────────────────────┼──────────────────┤   │
│  │  PILOT-STU-A7X9K│  ff_edu_a1b2c3d4... │  John Smith, Y10 │   │
│  │  PILOT-STU-B3M2P│  ff_edu_e5f6g7h8... │  Jane Doe, Y10   │   │
│  │  PILOT-TCH-C8N4Q│  ff_edu_i9j0k1l2... │  Mr. Chen, Math  │   │
│  └─────────────────┴─────────────────────┴──────────────────┘   │
│                                                                  │
│  This mapping is NEVER sent to FlowForge.                       │
│  School controls unmasking under their safeguarding protocol.   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FLOWFORGE SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  token              │  type    │  cohort   │  responses  │   │
│  ├─────────────────────┼──────────┼───────────┼─────────────┤   │
│  │  ff_edu_a1b2c3d4... │  student │  Y10      │  [...]      │   │
│  │  ff_edu_e5f6g7h8... │  student │  Y10      │  [...]      │   │
│  │  ff_edu_i9j0k1l2... │  teacher │  secondary│  [...]      │   │
│  └─────────────────────┴──────────┴───────────┴─────────────┘   │
│                                                                  │
│  FlowForge sees: token + type + cohort + responses              │
│  FlowForge CANNOT see: name, email, identity                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### School Escrow Generation Script

Provide schools with a tool to generate their escrow mapping:

```typescript
// School-side utility (runs in school's environment, NOT FlowForge)
interface EscrowRecord {
  access_code: string;
  participant_name: string;
  participant_id: string; // school's internal ID
  participant_type: string;
  cohort: string;
  token?: string; // filled after redemption
}

function generateSchoolEscrowTemplate(
  participants: Array<{ name: string; id: string; type: string; cohort: string }>,
  campaign_prefix: string
): EscrowRecord[] {
  return participants.map((p, index) => ({
    access_code: `${campaign_prefix}-${p.type.substring(0,3).toUpperCase()}-${generateShortCode()}`,
    participant_name: p.name,
    participant_id: p.id,
    participant_type: p.type,
    cohort: p.cohort,
    token: undefined // school fills this after participant redeems code
  }));
}

// School exports this as CSV/Excel and maintains securely
// School NEVER sends this to FlowForge
```

---

## Part 5: Break-Glass Protocol

### Trigger Conditions

Break-glass is triggered ONLY when a response indicates imminent harm:

```typescript
const BREAK_GLASS_TRIGGERS = [
  // Self-harm indicators
  'I am thinking about hurting myself',
  'I don\'t want to be here anymore',
  'I have a plan to hurt myself',

  // Harm to others
  'I am thinking about hurting someone',
  'Someone is hurting me',
  'I know someone who is being hurt',

  // Explicit requests
  'I need someone to contact me',
  'I have immediate safety concerns',
  'This is an emergency'
];

interface SafeguardingAlert {
  campaign_id: string;
  token: string; // pseudonymous, but school can unmask
  participant_type: string;
  trigger_type: string;
  trigger_content: string; // the concerning response
  detected_at: Date;
  alert_sent_at: Date;
  school_contact: string; // designated safeguarding lead
}
```

### Break-Glass Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BREAK-GLASS FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Response triggers safeguarding threshold                     │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ "I don't want to be here anymore"                    │     │
│     └─────────────────────────────────────────────────────┘     │
│                              │                                   │
│  2. FlowForge AI flags response                                 │
│                              │                                   │
│  3. Alert generated with TOKEN (not identity)                   │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ SAFEGUARDING ALERT                                   │     │
│     │ Campaign: 14-Day Pilot                               │     │
│     │ Token: ff_edu_a1b2c3d4...                           │     │
│     │ Type: Student, Year 10                               │     │
│     │ Trigger: Self-harm indicator                         │     │
│     │ Content: "I don't want to be here anymore"          │     │
│     └─────────────────────────────────────────────────────┘     │
│                              │                                   │
│  4. Alert sent to designated Safeguarding Lead                  │
│     (via secure channel - not email)                            │
│                              │                                   │
│  5. School uses their escrow to unmask: token → identity        │
│                              │                                   │
│  6. School follows existing safeguarding protocol               │
│                              │                                   │
│  7. FlowForge logs: alert_sent_at, school_acknowledged_at       │
│     FlowForge does NOT log: unmasked identity                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema: Safeguarding Alerts

```sql
-- Safeguarding alerts (break-glass events)
CREATE TABLE education_safeguarding_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Context
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    school_id UUID NOT NULL REFERENCES schools(id),
    participant_token VARCHAR(50) NOT NULL, -- pseudonymous
    participant_type VARCHAR(20) NOT NULL,

    -- Trigger details
    trigger_type VARCHAR(50) NOT NULL, -- 'self_harm', 'harm_to_others', 'explicit_request'
    trigger_content TEXT NOT NULL, -- the concerning response
    trigger_confidence DECIMAL(3,2), -- AI confidence score

    -- Alert lifecycle
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    alert_sent_at TIMESTAMPTZ,
    alert_channel VARCHAR(50), -- 'secure_portal', 'sms', 'phone'
    school_contact_role VARCHAR(100), -- 'Safeguarding Lead', 'Deputy Head'

    -- Acknowledgment (school confirms receipt)
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(100), -- role, not name

    -- Resolution (school confirms action taken)
    resolved_at TIMESTAMPTZ,
    resolution_type VARCHAR(50), -- 'intervention_initiated', 'false_positive', 'escalated'

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()

    -- NOTE: We do NOT store unmasked identity
    -- That happens in school's system only
);

-- Indexes
CREATE INDEX idx_safeguarding_alerts_campaign ON education_safeguarding_alerts(campaign_id);
CREATE INDEX idx_safeguarding_alerts_school ON education_safeguarding_alerts(school_id);
CREATE INDEX idx_safeguarding_alerts_unacknowledged ON education_safeguarding_alerts(school_id)
    WHERE acknowledged_at IS NULL;
```

### Two-Key Unmasking (Enhanced Governance)

For schools requiring additional governance:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TWO-KEY UNMASKING                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Identity mapping is split-encrypted:                           │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  KEY A          │    │  KEY B          │                    │
│  │  Safeguarding   │    │  Principal /    │                    │
│  │  Lead           │    │  Board Rep      │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      │                                          │
│                      ▼                                          │
│           ┌─────────────────────┐                              │
│           │  BOTH KEYS REQUIRED │                              │
│           │  to decrypt identity│                              │
│           └─────────────────────┘                              │
│                                                                  │
│  Prevents:                                                      │
│  - "Curiosity" unmasking by single administrator               │
│  - Unauthorized identity access                                 │
│  - Trust violations                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Data Minimization

### What FlowForge Stores

| Data Type | Stored | Purpose |
|-----------|--------|---------|
| Pseudonymous token | Yes | Session continuity, longitudinal tracking |
| Participant type | Yes | Aggregation (student/teacher/parent) |
| Cohort metadata | Yes | Pattern analysis (year band, division) |
| Responses | Yes | Analysis and synthesis |
| Timestamps | Yes | Session tracking |

### What FlowForge NEVER Stores

| Data Type | Stored | Reason |
|-----------|--------|--------|
| Name | Never | Not needed for analysis |
| Email | Never | Not needed for analysis |
| National ID | Never | Not needed for analysis |
| School ID number | Never | Not needed for analysis |
| Access code → identity mapping | Never | School responsibility |
| Unmasked identity from break-glass | Never | School responsibility |

### Data Retention

```typescript
const DATA_RETENTION_POLICY = {
  // Active campaign data
  campaign_active: 'indefinite', // while campaign exists

  // Post-campaign
  responses_anonymized: '3_years', // for longitudinal analysis
  participant_tokens: '3_years', // for pattern tracking

  // Purge
  access_codes: '30_days_after_campaign_end',
  safeguarding_alerts: '7_years', // regulatory requirement

  // Never retained
  identity_data: 'never_collected'
};
```

---

## Part 7: Privacy by Design Checklist

### Technical Controls

- [ ] No email/SSO authentication for participants
- [ ] Access codes are one-time use
- [ ] Tokens are cryptographically random (not derived from identity)
- [ ] Token→identity mapping never transmitted to FlowForge
- [ ] Break-glass alerts use tokens, not identity
- [ ] Minimum cohort size for reporting (prevent re-identification)
- [ ] Differential privacy applied to synthesis outputs

### Operational Controls

- [ ] School maintains escrow separately
- [ ] School controls unmasking authority
- [ ] Two-key unmasking available for enhanced governance
- [ ] Audit logs for all break-glass events
- [ ] School acknowledgment required for alerts

### Reporting Controls

- [ ] No individual-level reports
- [ ] Cohort-level minimum thresholds
- [ ] Patterns, not people
- [ ] No raw response export (only synthesized insights)

---

## Part 8: Integration with FlowForge Platform

### Education Campaign Type

```typescript
// Extend existing campaign_type enum
type CampaignType =
  | 'industry_4_0_readiness'
  | 'education_pilot'           // 14-day pilot
  | 'education_annual';         // annual subscription

// Education-specific campaign configuration
interface EducationCampaignConfig {
  campaign_type: 'education_pilot' | 'education_annual';
  school_id: string;

  // Module selection
  modules: Array<'student_wellbeing' | 'teaching_learning' | 'parent_confidence' | /* other modules */>;

  // Cohort configuration
  cohorts: {
    students: { year_bands: string[]; sample_size?: number };
    teachers: { divisions: string[]; sample_size?: number };
    parents: { year_bands: string[]; sample_size?: number };
    leadership: { roles: string[] };
  };

  // Anonymity configuration
  anonymity: {
    access_code_prefix: string;
    escrow_model: 'school_held' | 'two_key';
    break_glass_contacts: Array<{ role: string; secure_channel: string }>;
  };

  // Pilot timing
  pilot_start: Date;
  pilot_end: Date;
  readout_scheduled: Date;
}
```

### Agent Configuration

```typescript
// Education interview agent configuration
interface EducationInterviewAgentConfig {
  participant_type: 'student' | 'teacher' | 'parent' | 'leadership';
  module: string;

  // Trust-aware prompting
  trust_framing: {
    anonymity_statement: string;
    patterns_not_people: boolean;
    consequence_firewall: string[];
  };

  // Safeguarding
  safeguarding: {
    enabled: boolean;
    trigger_keywords: string[];
    escalation_flow: 'flag_for_review' | 'immediate_alert';
  };
}
```

---

## Part 9: Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| FlowForge admin identifies participant | No identity stored; can only see tokens |
| School admin curiosity-unmasks | Two-key unmasking option; audit logs |
| Response pattern re-identification | Minimum cohort sizes; differential privacy |
| Data breach exposes identity | No identity to expose in FlowForge |
| Break-glass abuse | Strict trigger conditions; audit trail |

### Compliance

| Regulation | Approach |
|------------|----------|
| PDPA (Singapore) | No personal data collected by FlowForge |
| GDPR (if applicable) | Data minimization; purpose limitation |
| FERPA (US schools) | No student records transmitted |
| School safeguarding | Break-glass protocol maintains duty of care |

---

## Appendix: Implementation Sequence

### Phase 1: MVP (Pilot Launch)

1. [ ] Access code generation system
2. [ ] Token generation and assignment
3. [ ] Basic participant_tokens table
4. [ ] School escrow template generator
5. [ ] Basic break-glass alerting

### Phase 2: Enhanced Security

1. [ ] Two-key unmasking option
2. [ ] Differential privacy in synthesis
3. [ ] Minimum cohort size enforcement
4. [ ] Enhanced audit logging

### Phase 3: Scale

1. [ ] Multi-campaign token persistence (longitudinal)
2. [ ] Cross-campaign pattern analysis
3. [ ] Automated safeguarding AI flagging
4. [ ] School admin portal for escrow management

---

*Document specifies technical implementation of anonymity architecture for FlowForge Education vertical.*
*Must be implemented before pilot launch.*
