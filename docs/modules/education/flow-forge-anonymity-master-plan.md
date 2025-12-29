# Flow Forge: Anonymous Feedback System
## Master Implementation Plan

---

## Executive Summary

This document consolidates the architectural foundations and practical implementation guidance for Flow Forge's anonymous feedback system. The core challenge: enable students, staff, and parents to provide candid input while protecting anonymity, meeting duty-of-care obligations, and building genuine trust.

**Guiding Principle:** Separate identity from input through cryptographic and structural layers—not just policy promises.

---

## Part 1: Core Architecture

### The Two-Layer Identity Model

Flow Forge implements **anonymity by default with safeguarded escalation**:

#### Layer A — Default Mode: Pseudonymous

- Users authenticate once (school-issued token or SSO)
- FF stores only a **persistent pseudonymous ID** (random token)
- Minimal metadata retained: year band, division, role type (student/parent/staff)
- **No names, emails, or national IDs stored**
- Leadership sees patterns by cohort and token without knowing who it is

This enables: high candour + longitudinal pattern tracking (same token across time).

#### Layer B — Break-Glass Mode: Identity Escrow

When a response hits a **pre-defined imminent harm threshold**, identity can be revealed under strict governance.

**Implementation Options (choose one):**

| Option | Description | Trust Level | Operational Burden |
|--------|-------------|-------------|-------------------|
| **School-held key** (recommended) | School keeps `token → identity` mapping; FF only stores token. On trigger, FF alerts school with token; school unmasks internally. | High | Low |
| **Two-key unmasking** | Identity encrypted; requires two authorized roles to decrypt (e.g., Principal + Safeguarding Lead). Prevents "curiosity" unmasking. | Highest | Medium |
| **Third-party escrow** | FF or partner holds mapping; discloses only under documented safeguarding trigger. | Highest | High |

---

## Part 2: Cryptographic Foundations

| Mechanism | Purpose |
|-----------|---------|
| **Anonymous tokens** | Unique identifiers that can't be traced back to individuals |
| **Differential privacy** | Applied during synthesis to prevent reverse identification |
| **Zero-knowledge proofs** | Verify participation without revealing identity |
| **Secure multi-party computation** | Enable analysis without exposing individual data |
| **One-way hashing** | Convert eligibility data (e.g., partial ID) into non-reversible tokens |

**Key Principle:** Even administrators cannot identify respondents through system access.

---

## Part 3: Eligibility Verification

**Goal:** Confirm "you belong here" without enabling re-identification.

### Recommended: School-Issued Access Codes (MVP)

1. School generates one-time access codes per cohort/role
2. Codes expire after use
3. FF assigns persistent pseudonymous token after first use
4. No names, emails, or IDs stored

**Benefits:** Scalable, trusted, clean separation of concerns.

### Alternative: Partial-ID Hash

1. User enters last 3–4 digits of ID + role + year band
2. FF hashes this with a school-specific salt
3. FF **never stores raw digits**
4. Resulting hash becomes pseudonymous token

**Critical:** Never store raw ID fragments. Never allow reverse lookup. This is proof of membership, not identity.

---

## Part 4: User Experience Flow

### Minimal-Friction Onboarding

```
┌─────────────────────────────────────────────────────────┐
│  1. Access via school link or QR                        │
│  2. Enter school-issued access code (or SSO)            │
│  3. FF assigns persistent pseudonymous token            │
│  4. Complete assessment/pulse                           │
│  5. Optional: If safety concern, self-identify or       │
│     trigger break-glass review                          │
└─────────────────────────────────────────────────────────┘
```

### Safety Escalation Triggers

Only when user indicates:
- "I'm at risk / someone else is at risk"
- "I need someone to contact me"
- "I have immediate safety concerns"

Then they can **optionally self-identify** or trigger safeguarding review.

---

## Part 5: Trust Building Strategy

### Radical Transparency

- Publish system architecture publicly
- Commission independent security audits
- Show users exactly what data flows where
- Open source key components where feasible

### User Verification

- Tools for users to confirm data processed correctly
- Allow testing with non-sensitive data to build confidence

### Governance Structure

| Element | Description |
|---------|-------------|
| **Multi-stakeholder board** | Representatives from students, staff, parents |
| **External oversight** | Third-party organization partnership |
| **Administrator separation** | Technical proof that admins cannot identify respondents |
| **Public commitment** | Clear policies with defined consequences for violation |

---

## Part 6: School-Specific Considerations

### Stakeholder Groups & Concerns

| Group | Primary Concern |
|-------|-----------------|
| **Students** | Fear of retaliation; power imbalance with teachers/admin |
| **Staff** | Contract vulnerability; peer judgment; admin scrutiny |
| **Parents** | School relationship; child's standing; confidentiality |

### Singapore Context

- MOE takes student safety/bullying/violence seriously
- Existing monitoring and intervention frameworks in place
- Historical context: severe incidents (e.g., River Valley High School) mean schools will ask about dangerous signals
- Break-glass protocol directly addresses duty-of-care requirements

### Small Population Risk

Schools have small populations where response patterns can identify individuals. Mitigations:
- Aggregate reporting only (never individual responses)
- Minimum threshold for displaying cohort data
- Differential privacy in synthesis
- Pattern obfuscation techniques

---

## Part 7: Product Positioning

### What Flow Forge IS

- Early signal detection
- Wellbeing risk gradients
- Safeguarding escalation when necessary
- Pattern visibility for institutional improvement

### What Flow Forge is NOT

- Student tracking system
- Surveillance tool
- Accountability theatre
- Behaviour control mechanism

**Critical framing:** "We need longitudinal tokens for patterns. We do not need names for patterns."

---

## Part 8: Why Profiles Break Trust

If users know a profile exists:
- Anonymity is psychologically broken
- "Confidential" becomes meaningless
- Wellbeing signals collapse
- Candor disappears

**Result:** Pretty dashboards with no reality. Cannot detect:
- Bullying patterns
- Peer pressure dynamics
- Fear or distress signals

This defeats the Student Wellbeing Module entirely.

**The only reason we need "profiles" is legitimacy, not identity.** Once legitimacy is established (via access codes or partial-ID hash), identity becomes a liability.

---

## Part 9: Implementation Roadmap

### Phase 1: Foundation
- [ ] Define specific feedback topics (affects anonymization requirements)
- [ ] Assess population sizes for each stakeholder group
- [ ] Select eligibility verification approach (access codes vs partial-ID hash)
- [ ] Draft governance structure and policies

### Phase 2: Build
- [ ] Implement pseudonymous token system
- [ ] Build break-glass escalation protocol
- [ ] Create minimal-friction UX flow
- [ ] Develop aggregation and privacy layers

### Phase 3: Trust
- [ ] Identify external oversight partners
- [ ] Commission independent security audit
- [ ] Prepare public architecture documentation
- [ ] Create user verification tools

### Phase 4: Launch
- [ ] Pilot with single school/cohort
- [ ] Gather feedback on trust and usability
- [ ] Refine based on pilot learnings
- [ ] Scale to broader deployment

---

## Appendix: Key Decisions Summary

| Decision Point | Recommendation | Rationale |
|----------------|----------------|-----------|
| Identity storage | Pseudonymous tokens only | Trust + legal protection |
| Eligibility verification | School-issued access codes | Cleanest separation, scalable |
| Escrow mechanism | School-held key | Balances trust with operational simplicity |
| Break-glass governance | Two authorized roles required | Prevents casual unmasking |
| Reporting granularity | Cohort-level minimum | Prevents re-identification |

---

*Consolidated from: Anonymous Feedback System Notes + FF Identity & Profiles Discussion*
*For: Flow Forge Project*
