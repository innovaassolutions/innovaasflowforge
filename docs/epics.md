# Epic: Methodology Configuration System

**Epic ID:** METHODOLOGY-CONFIG
**Date:** 2026-01-05
**Status:** Ready for Development
**Tech Spec:** [tech-spec.md](./tech-spec.md)

---

## Epic Summary

Enable dynamic interview methodology configuration for coaches, consultants, and schools. Replace hardcoded TypeScript constitutions with database-stored methodology configurations that can be created, customized, and selected by tenants.

## Business Value

- **Coaches** can use proprietary leadership frameworks without code changes
- **Consultants** can offer custom assessment methodologies to clients
- **Schools** can tailor wellbeing surveys to their specific needs
- **Platform** becomes more flexible and scalable for new verticals

## Epic Scope

### In Scope
- Methodologies database table with JSONB configuration
- CRUD API for methodology management
- Dynamic system prompt generation
- Methodology selection in campaign/session flows
- System default methodologies (existing constitutions)
- Tenant-based access control (RLS)

### Out of Scope
- Visual methodology builder UI (Phase 2)
- Version history/changelog
- Cross-tenant methodology sharing
- Import/export functionality

---

## Stories

### Story 1: Database Foundation
**File:** [story-methodology-1.md](./sprint-artifacts/story-methodology-1.md)
**Priority:** P0 - Critical Path
**Estimate:** Medium

Create the `methodologies` table with proper schema, indexes, and RLS policies.

**Acceptance Criteria:**
- [ ] Migration creates methodologies table with JSONB config column
- [ ] RLS policies enforce tenant isolation
- [ ] System defaults have is_system_default=true
- [ ] Database types regenerated

---

### Story 2: TypeScript Types & Validation
**File:** [story-methodology-2.md](./sprint-artifacts/story-methodology-2.md)
**Priority:** P0 - Critical Path
**Estimate:** Small

Create TypeScript interfaces and Zod validation schemas for methodology configuration.

**Acceptance Criteria:**
- [ ] MethodologyConfig interface matches database JSONB structure
- [ ] Zod schemas validate all methodology components
- [ ] Schema handles optional fields gracefully
- [ ] Validation errors are descriptive

---

### Story 3: API Layer
**File:** [story-methodology-3.md](./sprint-artifacts/story-methodology-3.md)
**Priority:** P0 - Critical Path
**Estimate:** Medium

Create REST API endpoints for methodology CRUD operations.

**Acceptance Criteria:**
- [ ] GET /api/methodologies returns tenant's methodologies
- [ ] POST /api/methodologies creates new methodology
- [ ] GET/PUT/DELETE /api/methodologies/[id] work correctly
- [ ] Clone endpoint creates tenant copy of system default
- [ ] Authentication enforced on all endpoints

---

### Story 4: Dynamic Prompt Generation
**File:** [story-methodology-4.md](./sprint-artifacts/story-methodology-4.md)
**Priority:** P1 - High
**Estimate:** Medium

Create prompt generator that converts database methodology config to Claude system prompts.

**Acceptance Criteria:**
- [ ] generateSystemPrompt() accepts MethodologyConfig
- [ ] Output matches format of existing archetype prompt
- [ ] All phases, questions, and rules included
- [ ] Template supports variable substitution

---

### Story 5: UI Integration
**File:** [story-methodology-5.md](./sprint-artifacts/story-methodology-5.md)
**Priority:** P1 - High
**Estimate:** Medium

Add methodology selection to coach invite flow and create methodology list page.

**Acceptance Criteria:**
- [ ] MethodologySelector component shows available methodologies
- [ ] Coach invite page includes methodology selection
- [ ] Dashboard shows methodology management page
- [ ] Follows existing UI patterns (shadcn/ui)

---

## Dependencies

```
Story 1 (Database) ─┬─> Story 2 (Types) ─┬─> Story 3 (API)
                    │                    │
                    └────────────────────┴─> Story 4 (Prompts) ─> Story 5 (UI)
```

## Definition of Done

- [ ] All stories completed and tested
- [ ] Database migration applied to production
- [ ] System default methodologies seeded
- [ ] Interview flow works with database methodology
- [ ] Coaches can select methodology when inviting clients
- [ ] RLS policies verified with multi-tenant test
- [ ] Documentation updated (CLAUDE.md)
