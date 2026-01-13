# Epic Technical Specification: Foundation - Schema & Cost Calculation

Date: 2026-01-13
Author: Todd
Epic ID: billing-epic-1-foundation
Status: Draft

---

## Overview

This epic establishes the data foundation for the Billing & Cost Tracking feature by modifying the existing `usage_events` schema to store input and output tokens separately, creating a new `model_pricing` table for multi-provider rate configuration, and implementing a cost calculation service that computes `cost_cents` at write time. This foundational work enables accurate AI cost tracking across Anthropic, OpenAI, and Google providers, forming the basis for all subsequent billing, margin analysis, and usage enforcement features.

The implementation follows the architecture decisions documented in `architecture-billing-cost-tracking.md`, specifically the "calculate cost at write time" pattern which ensures accurate historical costs even when provider rates change.

## Objectives and Scope

### In Scope

- **Schema Modifications:**
  - Add `input_tokens` and `output_tokens` columns to `usage_events` table
  - Backfill existing data (set input_tokens = tokens_used, output_tokens = 0)
  - Add CHECK constraints for non-negative token values
  - Create index for billing aggregation queries

- **New Database Table:**
  - Create `model_pricing` table with provider, model_id, input/output rates, effective_date
  - Seed data for Anthropic (Claude models), OpenAI (GPT models), Google (Gemini models)
  - RLS policies for admin-only modification, authenticated read

- **Cost Calculation Service:**
  - `lib/services/cost-calculator.ts` with caching (5-minute TTL)
  - Formula: `cost_cents = (input_tokens * input_rate + output_tokens * output_rate) / 1M * 100`
  - Fallback behavior for unknown models (return 0, log warning)

- **AI Agent Integration:**
  - Update all AI agent calls to capture separate input/output tokens
  - Modify `logUsageEvent()` to use cost calculator
  - Update `archetype-interview-agent.ts`, `synthesis-agent.ts`, and other agents

### Out of Scope

- Subscription tier management (Epic 2)
- Usage limit enforcement (Epic 2)
- Notification system (Epic 3)
- Admin dashboard UI enhancements (Epic 4)
- Tenant-facing usage visibility (Epic 5)
- Automated pricing sync from provider APIs (Epic 6)

## System Architecture Alignment

This epic aligns with the architecture addendum (`architecture-billing-cost-tracking.md`):

| Architecture Component | Implementation |
|------------------------|----------------|
| `model_pricing` table | Section 1.1 - Exact schema as specified |
| `usage_events` modification | Section 1.4 - Add input/output columns |
| `CostCalculatorService` | Section 2.1 - Interface and caching strategy |
| Integration pattern | Section 3.1 - Pre/post AI call logging |

**Key Architecture Decisions Applied:**
1. **Calculate cost at write time** - Ensures historical accuracy
2. **Separate input/output tokens** - Different rates per direction
3. **In-memory pricing cache (5-min TTL)** - Reduces DB queries per AI request
4. **Provider API keys in environment** - Security best practice

---

## Detailed Design

### Services and Modules

| Service/Module | Responsibility | Inputs | Outputs |
|----------------|----------------|--------|---------|
| `CostCalculatorService` | Calculate cost in cents for token usage | modelId, inputTokens, outputTokens | costCents (integer) |
| `getModelPricing()` | Retrieve current pricing for a model | modelId | ModelPricing or null |
| `refreshPricingCache()` | Invalidate and reload pricing cache | - | void |
| `logUsageEvent()` (modified) | Log AI usage with cost calculation | tenantId, eventType, tokens, model | UsageEvent |

**Service Location:** `lib/services/cost-calculator.ts`

```typescript
// Cost Calculator Service Interface
interface CostCalculatorService {
  calculateCost(modelId: string, inputTokens: number, outputTokens: number): Promise<number>;
  getModelPricing(modelId: string): Promise<ModelPricing | null>;
  refreshPricingCache(): Promise<void>;
}

interface ModelPricing {
  id: string;
  provider: string;
  modelId: string;
  displayName: string;
  inputRatePerMillion: number;  // USD per 1M input tokens
  outputRatePerMillion: number; // USD per 1M output tokens
  effectiveDate: Date;
  isActive: boolean;
}
```

### Data Models and Contracts

#### Model Pricing Table

```sql
CREATE TABLE model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,                    -- 'anthropic', 'openai', 'google'
  model_id TEXT NOT NULL,                    -- 'claude-sonnet-4-20250514'
  display_name TEXT,                         -- 'Claude Sonnet 4'
  input_rate_per_million DECIMAL(10,4) NOT NULL,   -- USD per 1M input tokens
  output_rate_per_million DECIMAL(10,4) NOT NULL,  -- USD per 1M output tokens
  effective_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (provider, model_id, effective_date)
);

-- Index for pricing lookups
CREATE INDEX idx_model_pricing_lookup ON model_pricing (model_id, is_active, effective_date DESC);
```

**Seed Data:**

| Provider | Model ID | Display Name | Input Rate | Output Rate |
|----------|----------|--------------|------------|-------------|
| anthropic | claude-sonnet-4-20250514 | Claude Sonnet 4 | $3.00 | $15.00 |
| anthropic | claude-opus-4-5-20251101 | Claude Opus 4.5 | $15.00 | $75.00 |
| anthropic | claude-3-5-haiku-20241022 | Claude 3.5 Haiku | $0.80 | $4.00 |
| openai | gpt-4-turbo | GPT-4 Turbo | $10.00 | $30.00 |
| openai | gpt-4o | GPT-4o | $5.00 | $15.00 |
| openai | gpt-3.5-turbo | GPT-3.5 Turbo | $0.50 | $1.50 |
| google | gemini-1.5-pro | Gemini 1.5 Pro | $7.00 | $21.00 |
| google | gemini-1.5-flash | Gemini 1.5 Flash | $0.35 | $1.05 |

#### Usage Events Table Modification

```sql
ALTER TABLE usage_events
  ADD COLUMN input_tokens INTEGER DEFAULT 0,
  ADD COLUMN output_tokens INTEGER DEFAULT 0;

-- Backfill existing data (assume all were output tokens)
UPDATE usage_events
SET input_tokens = 0, output_tokens = tokens_used
WHERE input_tokens IS NULL;

-- Add constraints
ALTER TABLE usage_events
  ADD CONSTRAINT positive_tokens CHECK (input_tokens >= 0 AND output_tokens >= 0);

-- Index for billing aggregations
CREATE INDEX idx_usage_events_billing
  ON usage_events (tenant_id, created_at DESC)
  WHERE tenant_id IS NOT NULL;
```

### APIs and Interfaces

No new REST API endpoints in this epic. The cost calculation is internal.

**Modified Internal Functions:**

| Function | Location | Changes |
|----------|----------|---------|
| `logUsageEvent()` | `lib/usage/log-usage.ts` | Add cost calculation before insert |
| `getAgentResponse()` | `lib/agents/*.ts` | Return separate input/output tokens |

### Workflows and Sequencing

**Cost Calculation Flow:**

```
1. AI Agent processes request
   ↓
2. Anthropic/OpenAI API returns response with usage
   - response.usage.input_tokens
   - response.usage.output_tokens
   ↓
3. Agent extracts tokens and model info
   ↓
4. logUsageEvent() called with:
   - tenantId, eventType, inputTokens, outputTokens, modelUsed
   ↓
5. CostCalculator.calculateCost(modelId, inputTokens, outputTokens)
   - Check cache for pricing (TTL: 5 min)
   - If cache miss, query model_pricing table
   - Apply formula: (input * inputRate + output * outputRate) / 1M * 100
   - Return integer cents (rounded up)
   ↓
6. Insert usage_event with:
   - input_tokens, output_tokens, cost_cents, model_used
```

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Source |
|-------------|--------|--------|
| Cost calculation latency | < 50ms | NFR1 |
| Pricing cache hit rate | > 95% | Architecture Decision 4 |
| Database query for cache miss | < 10ms | Index on model_pricing |

**Implementation:**
- In-memory Map cache with 5-minute TTL
- Cache key: `modelId`
- Cache refresh on miss or expiry

### Security

| Requirement | Implementation | Source |
|-------------|----------------|--------|
| RLS on model_pricing | Admin-only write, authenticated read | NFR5-6 |
| Audit logging | Use `updated_at` timestamps | NFR7 |
| No secrets in DB | Provider keys in env vars | NFR8 |

```sql
-- RLS Policies for model_pricing
ALTER TABLE model_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage pricing"
  ON model_pricing FOR ALL
  USING (auth.jwt() ->> 'user_type' = 'admin');

CREATE POLICY "All authenticated users can read pricing"
  ON model_pricing FOR SELECT
  TO authenticated
  USING (true);
```

### Reliability/Availability

| Scenario | Behavior |
|----------|----------|
| Cache unavailable | Fallback to direct DB query |
| Model not in pricing table | Return cost_cents = 0, log warning |
| Database unavailable | Log event without cost (null), alert ops |

### Observability

| Signal | Type | Description |
|--------|------|-------------|
| `cost_calculation_latency_ms` | Histogram | Time to calculate cost |
| `pricing_cache_hit` | Counter | Cache hits vs misses |
| `unknown_model_warning` | Log | Model not found in pricing table |
| `cost_cents_calculated` | Metric | Total cost calculated per minute |

---

## Dependencies and Integrations

### Internal Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@supabase/supabase-js` | ^2.x | Database access |
| `next` | 15.x | API routes |
| `typescript` | ^5.x | Type safety |

### External Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Anthropic API | Get usage tokens from response | Existing |
| OpenAI API | Get usage tokens from response | Existing |
| Google AI API | Get usage tokens from response | Existing |

### Files to Modify

| File | Change |
|------|--------|
| `lib/usage/log-usage.ts` | Integrate cost calculator |
| `lib/agents/archetype-interview-agent.ts` | Extract input/output tokens |
| `lib/agents/synthesis-agent.ts` | Extract input/output tokens |
| `lib/agents/reflection-agent.ts` | Extract input/output tokens |
| `app/api/coach/[slug]/session/[token]/message/route.ts` | Pass tokens to logger |

---

## Acceptance Criteria (Authoritative)

1. **AC1:** Given the migrations are applied, when I query `usage_events`, then columns `input_tokens` and `output_tokens` exist and existing data has `input_tokens = 0, output_tokens = tokens_used`

2. **AC2:** Given the migrations are applied, when I query `model_pricing`, then seed data exists for Anthropic (3 models), OpenAI (3 models), and Google (2 models) with correct rates

3. **AC3:** Given `model_pricing` contains "claude-sonnet-4-20250514" at $3/$15 rates, when `calculateCost("claude-sonnet-4-20250514", 1000, 500)` is called, then the result is `1` cent (0.003 + 0.0075 = 0.0105 USD = ~1 cent)

4. **AC4:** Given a model not in `model_pricing`, when `calculateCost("unknown-model", 1000, 1000)` is called, then result is `0` and a warning is logged

5. **AC5:** Given an archetype interview completes, when the usage event is logged, then `input_tokens`, `output_tokens`, and `cost_cents` are all populated with correct values

6. **AC6:** Given the pricing cache is populated, when the same model is queried within 5 minutes, then no database query is made (cache hit)

7. **AC7:** Given RLS is enabled on `model_pricing`, when a non-admin user attempts to INSERT/UPDATE, then the operation is rejected

8. **AC8:** Given a tenant user, when they query their `usage_events`, then `cost_cents` values are visible and correctly calculated

---

## Traceability Mapping

| AC | Spec Section | Component/API | Test Idea |
|----|--------------|---------------|-----------|
| AC1 | Data Models - usage_events | Migration SQL | Verify columns exist, backfill correct |
| AC2 | Data Models - model_pricing | Migration SQL, Seed | Verify 8 models with correct rates |
| AC3 | Services - CostCalculatorService | calculateCost() | Unit test with known inputs |
| AC4 | Services - CostCalculatorService | calculateCost() | Unit test unknown model fallback |
| AC5 | Workflows - Cost Calculation Flow | archetype-interview-agent | Integration test end-to-end |
| AC6 | NFR Performance | CostCalculatorService cache | Unit test cache behavior |
| AC7 | NFR Security | RLS policies | Integration test with anon user |
| AC8 | NFR Security | RLS policies | Integration test tenant isolation |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **R1:** Anthropic API response format changes | Cost calculation breaks | Monitor API versioning, add response validation |
| **R2:** Pricing rates change mid-billing-period | Historical costs inconsistent | Architecture decision: calculate at write time |
| **R3:** High-volume logging impacts performance | Increased latency | Cache pricing, async logging if needed |

### Assumptions

| Assumption | Validation |
|------------|------------|
| **A1:** All AI agents return usage in response.usage format | Verified in existing codebase |
| **A2:** Pricing seed data is accurate as of 2026-01-13 | Verify against provider pricing pages |
| **A3:** Existing `usage_events` table has `tokens_used` column | Verified in migration 20260106_003 |

### Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| **Q1:** Should we track cache API calls separately from completion calls? | Todd | Open |
| **Q2:** How to handle token counts for streaming responses? | Dev | Open - verify Anthropic SDK behavior |

---

## Test Strategy Summary

### Unit Tests

| Test Suite | Coverage |
|------------|----------|
| `cost-calculator.test.ts` | calculateCost(), getModelPricing(), cache behavior |
| Migration tests | Schema changes, constraints, backfill |

### Integration Tests

| Test Scenario | Components |
|---------------|------------|
| End-to-end interview with cost | Agent → Logger → DB → Query |
| RLS policy enforcement | Non-admin insert/update rejection |
| Tenant isolation | Multi-tenant cost visibility |

### Test Data

- Use test pricing rates (not production) in test environment
- Create test tenant with known usage for verification
- Mock Anthropic responses with known token counts

---

_Tech Spec Version 1.0 | 2026-01-13_
