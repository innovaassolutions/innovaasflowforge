# Innovaasflowforge - Technical Specification

**Author:** Todd
**Date:** 2026-01-05
**Project Level:** Quick-Flow (Brownfield)
**Change Type:** Feature Implementation
**Development Context:** Adding methodology configuration system to existing multi-tenant platform

---

## Context

### Available Documents

- **CLAUDE.md** - Project context and development guidelines
- **Supabase Migrations** - Database schema including tenant_profiles, campaigns, participant_sessions
- **Existing Agent Architecture** - Constitution pattern established in lib/agents/

### Project Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Next.js | 15.5.7 | App Router |
| TypeScript | 5.x | Strict mode |
| React | 18.3.1 | |
| Supabase | 2.39.0 | PostgreSQL backend |
| Anthropic SDK | 0.27.0 | Claude API |
| TailwindCSS | 3.4.1 | With shadcn/ui components |
| Zustand | 4.4.7 | State management |

### Existing Codebase Structure

**Agent Architecture (Constitution Pattern):**
- `lib/agents/archetype-constitution.ts` - Leadership Archetypes methodology (coaching)
- `lib/agents/archetype-interview-agent.ts` - Uses constitution for AI interviews
- `lib/agents/education-constitutions.ts` - Education wellbeing methodology
- `lib/agents/education-interview-agent.ts` - Education-specific agent
- `lib/agents/assessment-agent.ts` - Industry 4.0 assessment (original)

**Key Patterns Identified:**
1. **Constitution files** define: questions, scoring, tone, phases, system prompts
2. **Interview agents** use constitutions to conduct AI-facilitated sessions
3. **Tenant profiles** link users to their tenant configuration
4. **Campaigns** have `assessment_type` to distinguish methodology type

---

## The Change

### Problem Statement

Currently, interview methodologies are hardcoded in TypeScript files. Each methodology (Industry 4.0, Leadership Archetypes, Education Wellbeing) requires code changes to add, modify, or customize. This prevents:

1. **Coaches** from using their own proprietary frameworks and questions
2. **Consultants** from offering custom assessment methodologies
3. **Schools** from tailoring wellbeing surveys to their specific needs
4. **Rapid iteration** on question sets without deployments

The platform needs a dynamic methodology configuration system where tenants can create, configure, and select interview methodologies without code changes.

### Proposed Solution

Implement a **Methodology Configuration System** that:

1. **Stores methodologies in the database** - Structured JSONB for constitution content
2. **Links methodologies to tenants** - Each consultant/coach/school can have custom methodologies
3. **Provides a methodology selection UI** - When creating campaigns or inviting clients
4. **Generates dynamic system prompts** - From stored configuration
5. **Maintains existing hardcoded methodologies** - As system defaults that can be cloned

### Scope

**In Scope:**

1. Database schema for `methodologies` table with JSONB configuration
2. API routes for CRUD operations on methodologies
3. Dynamic system prompt generation from stored methodology
4. Methodology selection in campaign/session creation flow
5. Default system methodologies (Industry 4.0, Archetypes, Education)
6. RLS policies for tenant-based access control
7. Migration of existing constitution structure to database format

**Out of Scope:**

- Visual methodology builder UI (Phase 2)
- Real-time methodology preview during editing
- Version history/changelog for methodologies
- AI-assisted methodology generation
- Cross-tenant methodology marketplace/sharing
- Import/export of methodologies (future)

---

## Implementation Details

### Source Tree Changes

| Path | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260106_005_create_methodologies.sql` | CREATE | Methodologies table, indexes, RLS |
| `types/methodology.ts` | CREATE | TypeScript interfaces for methodology structure |
| `lib/methodology/schema.ts` | CREATE | Zod schemas for validation |
| `lib/methodology/prompt-generator.ts` | CREATE | Dynamic system prompt generation |
| `lib/methodology/defaults.ts` | CREATE | Default methodologies (extracted from constitutions) |
| `app/api/methodologies/route.ts` | CREATE | List/Create methodologies API |
| `app/api/methodologies/[id]/route.ts` | CREATE | Get/Update/Delete methodology API |
| `app/dashboard/methodologies/page.tsx` | CREATE | Methodology management page |
| `components/MethodologySelector.tsx` | CREATE | Dropdown for methodology selection |
| `lib/agents/dynamic-interview-agent.ts` | CREATE | Agent using database methodologies |
| `lib/agents/archetype-interview-agent.ts` | MODIFY | Add fallback to dynamic agent |
| `app/dashboard/coaching/invite/page.tsx` | MODIFY | Add methodology selection |

### Technical Approach

**1. Database Schema (PostgreSQL/Supabase):**

\`\`\`sql
CREATE TABLE methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('coaching', 'consulting', 'education', 'custom')),
  is_system_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Constitution structure (JSONB)
  config JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  UNIQUE (tenant_id, slug)
);
\`\`\`

**2. Constitution JSONB Structure:**

\`\`\`typescript
interface MethodologyConfig {
  version: string  // "1.0"

  role: {
    identity: string
    stance: string
    you_are: string[]
    you_are_not: string[]
    internal_feeling: string
  }

  tone: {
    qualities: string[]
    good_examples: string[]
    bad_examples: string[]
  }

  phases: Array<{
    id: string
    name: string
    order: number
    transition_prompt: string
  }>

  questions: Array<{
    id: string
    phase_id: string
    order: number
    stem: string
    selection_type: 'single' | 'ranked' | 'open'
    scored: boolean
    options?: Array<{
      key: string
      category: string
      text: string
      score_weight?: number
    }>
    follow_up_prompts?: string[]
  }>

  scoring?: {
    categories: Record<string, {
      name: string
      description: string
    }>
    calculation: 'sum' | 'average' | 'weighted'
  }

  closing: {
    summarize_themes: boolean
    template: string
  }

  rules: Array<{
    name: string
    description: string
    examples?: string[]
  }>
}
\`\`\`

**3. Dynamic System Prompt Generation:**

The `prompt-generator.ts` module will convert stored methodology config into Claude-compatible system prompts, following the pattern established in `archetype-constitution.ts:generateArchetypeSystemPrompt()`.

**4. API Design:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/methodologies` | GET | List methodologies for current tenant |
| `/api/methodologies` | POST | Create new methodology |
| `/api/methodologies/[id]` | GET | Get methodology by ID |
| `/api/methodologies/[id]` | PUT | Update methodology |
| `/api/methodologies/[id]` | DELETE | Soft delete (set is_active=false) |
| `/api/methodologies/defaults` | GET | List system default methodologies |
| `/api/methodologies/clone/[id]` | POST | Clone methodology for customization |

### Existing Patterns to Follow

From `archetype-constitution.ts`:
- Export typed interfaces for all structures
- Separate concerns: types, questions, scoring, prompts
- Use template literals for multi-line prompt construction
- Include version field for future migrations

From `archetype-interview-agent.ts`:
- Accept tenant context in function parameters
- Return structured response with state and message
- Use conversation history for context continuity

From API routes (`app/api/admin/users/route.ts`):
- Check auth with `createClient()` and `getUser()`
- Validate user type/permissions before operations
- Use `supabaseAdmin` for service-role operations
- Return consistent JSON response structure

### Integration Points

1. **Campaigns table** - Add `methodology_id` column referencing `methodologies.id`
2. **Participant sessions** - Store methodology snapshot at session start
3. **Interview agents** - Accept methodology config instead of hardcoded constitution
4. **Report generation** - Use methodology categories for scoring display
5. **Voice agent** - Dynamic variables for methodology-specific prompts

---

## Development Context

### Relevant Existing Code

| Location | Reference |
|----------|-----------|
| `lib/agents/archetype-constitution.ts` | Full constitution structure to extract |
| `lib/agents/archetype-interview-agent.ts:generateArchetypeSystemPrompt()` | Prompt generation pattern |
| `app/api/admin/users/route.ts` | API auth pattern, tenant profile creation |
| `supabase/migrations/20260106_004_update_campaigns_for_coaching.sql` | Campaign schema updates |
| `components/DashboardSidebar.tsx` | Role-based navigation pattern |

### Dependencies

**Framework/Libraries:**
- Supabase PostgreSQL (existing) - JSONB storage
- Zod 3.x (to add) - Runtime validation of methodology config
- TypeScript 5.x (existing) - Type safety

**Internal Modules:**
- `lib/supabase/server.ts` - `createClient()`, `supabaseAdmin`
- `lib/agents/*` - Existing agent infrastructure
- `types/database.ts` - Database type generation

### Configuration Changes

1. **Database Types** - Regenerate after migration: `supabase gen types typescript`
2. **package.json** - Add `zod` if not present (currently not in deps)

### Existing Conventions (Brownfield)

- **Code Style:** TypeScript strict, single quotes, no semicolons in some files (mixed)
- **API Routes:** App Router route handlers with NextRequest/NextResponse
- **Database:** Supabase with RLS, service role for admin operations
- **Components:** Functional React with Tailwind, shadcn/ui patterns
- **State:** Zustand for global state, React useState for local

### Test Framework & Standards

- No formal test suite currently in place
- Will establish patterns with this feature:
  - Zod schema validation tests
  - API route integration tests with mock Supabase

---

## Implementation Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20.x |
| Framework | Next.js | 15.5.7 |
| Language | TypeScript | 5.x |
| Database | Supabase (PostgreSQL) | Latest |
| Validation | Zod | 3.x (to add) |
| AI | Anthropic Claude | claude-sonnet-4-20250514 |
| UI | TailwindCSS + shadcn/ui | 3.4.1 |

---

## Technical Details

### Methodology Loading Strategy

1. **System defaults** - Loaded once at app startup, cached
2. **Tenant methodologies** - Loaded on-demand when tenant accesses dashboard
3. **Session methodology** - Snapshot copied to session at creation time (prevents mid-session changes)

### JSONB Schema Validation

Use Zod for runtime validation:
\`\`\`typescript
const MethodologyConfigSchema = z.object({
  version: z.string(),
  role: z.object({
    identity: z.string(),
    stance: z.string(),
    you_are: z.array(z.string()),
    you_are_not: z.array(z.string()),
    internal_feeling: z.string()
  }),
  // ... full schema
})
\`\`\`

### Migration from Hardcoded Constitutions

1. Extract existing constitution from `archetype-constitution.ts`
2. Transform to JSONB format matching schema
3. Insert as system default methodology with `is_system_default=true`
4. Update agents to check for database methodology first, fallback to hardcoded

### Security Considerations

- RLS policies ensure tenants can only access their own methodologies
- System defaults visible to all but not editable
- Clone operation creates tenant-owned copy
- Admin users can view/manage all methodologies

---

## Development Setup

\`\`\`bash
# 1. Ensure dependencies
npm install zod

# 2. Run migration
supabase migration new create_methodologies
# Copy migration SQL to file
supabase db push

# 3. Regenerate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# 4. Start dev server
npm run dev
\`\`\`

---

## Implementation Guide

### Setup Steps

1. Create feature branch: `git checkout -b feature/methodology-config`
2. Verify Supabase CLI connected
3. Review existing constitution files for extraction

### Implementation Steps

**Story 1: Database Foundation**
1. Write migration `20260106_005_create_methodologies.sql`
2. Create TypeScript types in `types/methodology.ts`
3. Create Zod schemas in `lib/methodology/schema.ts`
4. Run migration and regenerate types

**Story 2: API Layer**
1. Create `/api/methodologies` route handler
2. Create `/api/methodologies/[id]` route handler
3. Add RLS policies for tenant isolation
4. Test with Postman/curl

**Story 3: Default Methodologies**
1. Extract archetypes constitution to JSON format
2. Create `lib/methodology/defaults.ts` with system defaults
3. Create seed script to insert system defaults
4. Verify defaults load correctly

**Story 4: Dynamic Agent Integration**
1. Create `lib/methodology/prompt-generator.ts`
2. Create `lib/agents/dynamic-interview-agent.ts`
3. Modify existing agents to support dynamic loading
4. Test interview flow with database methodology

**Story 5: UI Integration**
1. Create `MethodologySelector.tsx` component
2. Add methodology selection to invite flow
3. Create methodology list page for tenant dashboard
4. Add navigation item for coaches/consultants

### Testing Strategy

- **Unit Tests:** Zod schema validation, prompt generation
- **Integration Tests:** API routes with mock auth
- **Manual Testing:** Full interview flow with dynamic methodology
- **Edge Cases:** Missing methodology, invalid config, concurrent edits

### Acceptance Criteria

1. **Database:** Methodologies table exists with proper indexes and RLS
2. **API:** CRUD operations work for authenticated tenant users
3. **Defaults:** System methodologies (Archetypes, Education, Industry 4.0) available
4. **Dynamic Agent:** Interview works with database-stored methodology
5. **UI:** Coaches can select methodology when inviting clients
6. **Security:** Tenants cannot access other tenants' methodologies

---

## Developer Resources

### File Paths Reference

\`\`\`
supabase/
  migrations/
    20260106_005_create_methodologies.sql

types/
  methodology.ts

lib/
  methodology/
    schema.ts
    prompt-generator.ts
    defaults.ts
  agents/
    dynamic-interview-agent.ts

app/
  api/
    methodologies/
      route.ts
      [id]/route.ts
      defaults/route.ts
      clone/[id]/route.ts
  dashboard/
    methodologies/
      page.tsx

components/
  MethodologySelector.tsx
\`\`\`

### Key Code Locations

| Purpose | Location |
|---------|----------|
| Constitution structure example | `lib/agents/archetype-constitution.ts:77-145` |
| System prompt generation | `lib/agents/archetype-constitution.ts:772-856` |
| Interview agent pattern | `lib/agents/archetype-interview-agent.ts:48-100` |
| API auth pattern | `app/api/admin/users/route.ts:35-60` |
| RLS policy examples | `supabase/migrations/20260106_004_update_campaigns_for_coaching.sql:53-60` |

### Testing Locations

- Unit tests: `__tests__/lib/methodology/` (to create)
- Integration tests: `__tests__/api/methodologies/` (to create)
- E2E: Manual testing via dashboard

### Documentation to Update

- `CLAUDE.md` - Add methodology system to Architecture section
- `docs/knowledge/` - Add methodology configuration guide
- `README.md` - Update features list

---

## UX/UI Considerations

**UI Components Affected:**
- New: Methodology list page in dashboard
- New: MethodologySelector dropdown component
- Modify: Coach invite flow to include methodology selection
- Modify: Campaign creation to include methodology selection

**UX Flow Changes:**
- Coach invites client -> Select methodology -> Generate invite link
- Consultant creates campaign -> Select methodology -> Invite stakeholders

**Visual Patterns:**
- Follow existing shadcn/ui Select component styling
- Use card layout for methodology list (like Companies page)
- Category pills/badges for methodology type

**Accessibility:**
- Keyboard navigation for methodology selection
- Screen reader labels for methodology descriptions
- Focus management in modal workflows

---

## Testing Approach

**Framework:** Manual testing initially, Jest setup for future

**Test Strategy:**
1. Zod schema validation for all methodology configs
2. API route testing with authenticated requests
3. Integration testing with Supabase local
4. E2E testing of interview flow with dynamic methodology

**Coverage Focus:**
- All CRUD operations
- RLS policy enforcement
- Prompt generation accuracy
- Error handling for invalid configs

---

## Deployment Strategy

### Deployment Steps

1. Merge PR to main branch
2. Migration runs automatically via Supabase
3. Seed system default methodologies
4. Verify in staging environment
5. Deploy to production
6. Monitor for errors

### Rollback Plan

1. Revert migration if schema issues: `supabase db reset`
2. Existing hardcoded agents remain functional as fallback
3. Feature flag approach: check `methodologies` table exists before using

### Monitoring

- Supabase logs for database errors
- API response times for methodology loading
- Error rates in interview agent
- User feedback on methodology selection UX
