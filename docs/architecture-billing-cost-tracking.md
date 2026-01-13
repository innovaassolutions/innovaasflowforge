# Billing & Cost Tracking - Architecture Addendum

**Author:** Todd
**Date:** 2026-01-13
**PRD Reference:** [PRD-billing-cost-tracking.md](./PRD-billing-cost-tracking.md)
**Epic Reference:** [epic-billing-cost-tracking.md](./epic-billing-cost-tracking.md)
**Status:** Approved for Implementation

---

## Overview

This document defines the technical architecture decisions for the Billing & Cost Tracking feature. It extends the existing FlowForge architecture with new database tables, services, and integrations.

---

## 1. Database Schema

### 1.1 New Table: `model_pricing`

Stores AI model pricing rates for cost calculation.

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

-- RLS: Only platform admins can modify
ALTER TABLE model_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage pricing"
  ON model_pricing FOR ALL
  USING (auth.jwt() ->> 'user_type' = 'admin');

CREATE POLICY "All authenticated users can read pricing"
  ON model_pricing FOR SELECT
  TO authenticated
  USING (true);
```

**Seed Data:**
| Provider | Model ID | Input Rate | Output Rate |
|----------|----------|------------|-------------|
| anthropic | claude-sonnet-4-20250514 | 3.00 | 15.00 |
| anthropic | claude-opus-4-5-20251101 | 15.00 | 75.00 |
| anthropic | claude-3-5-haiku-20241022 | 0.80 | 4.00 |
| openai | gpt-4-turbo | 10.00 | 30.00 |
| openai | gpt-4o | 5.00 | 15.00 |
| openai | gpt-3.5-turbo | 0.50 | 1.50 |
| google | gemini-1.5-pro | 7.00 | 21.00 |
| google | gemini-1.5-flash | 0.35 | 1.05 |

---

### 1.2 New Table: `subscription_tiers`

Defines available subscription packages with usage limits.

```sql
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,                 -- 'starter', 'pro', 'enterprise'
  display_name TEXT NOT NULL,                -- 'Starter', 'Pro', 'Enterprise'
  monthly_token_limit BIGINT NOT NULL,       -- Token limit (no unlimited)
  monthly_session_limit INTEGER,             -- Optional session limit
  price_cents_monthly INTEGER NOT NULL,      -- Subscription price for margin calc
  features JSONB DEFAULT '{}',               -- Feature flags per tier
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT no_unlimited_tokens CHECK (monthly_token_limit > 0)
);

-- RLS: Public read, admin write
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tiers"
  ON subscription_tiers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tiers"
  ON subscription_tiers FOR ALL
  USING (auth.jwt() ->> 'user_type' = 'admin');
```

**Seed Data:**
| Name | Display | Token Limit | Session Limit | Price |
|------|---------|-------------|---------------|-------|
| starter | Starter | 500,000 | 50 | $29 |
| pro | Pro | 2,000,000 | 200 | $99 |
| enterprise | Enterprise | 10,000,000 | 1,000 | $499 |

---

### 1.3 Modify Table: `tenant_profiles`

Add tier assignment and billing fields.

```sql
ALTER TABLE tenant_profiles
  ADD COLUMN tier_id UUID REFERENCES subscription_tiers(id),
  ADD COLUMN usage_limit_override BIGINT,        -- Admin override (NULL = use tier)
  ADD COLUMN billing_period_start DATE DEFAULT date_trunc('month', now()),
  ADD COLUMN monthly_revenue_cents INTEGER;      -- For margin calculation
```

**Default:** Existing tenants assigned to 'starter' tier.

---

### 1.4 Modify Table: `usage_events`

Separate input/output tokens for accurate cost calculation.

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

---

### 1.5 New Table: `usage_notifications`

Tracks notification delivery to prevent duplicates.

```sql
CREATE TABLE usage_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id),
  notification_type TEXT NOT NULL,           -- '75_percent', '90_percent', '100_percent'
  billing_period DATE NOT NULL,              -- Which period this applies to
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivery_method TEXT NOT NULL,             -- 'in_app', 'email', 'both'
  acknowledged_at TIMESTAMPTZ,

  UNIQUE (tenant_id, notification_type, billing_period)
);

-- RLS: Tenant can read their own
ALTER TABLE usage_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants read own notifications"
  ON usage_notifications FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
  ));
```

---

## 2. Service Layer

### 2.1 Cost Calculator Service

**Location:** `lib/services/cost-calculator.ts`

```typescript
interface CostCalculatorService {
  // Calculate cost in cents for given token counts
  calculateCost(modelId: string, inputTokens: number, outputTokens: number): Promise<number>;

  // Get current pricing for a model
  getModelPricing(modelId: string): Promise<ModelPricing | null>;

  // Refresh pricing cache
  refreshPricingCache(): Promise<void>;
}
```

**Implementation Notes:**
- Cache pricing in memory with 5-minute TTL
- Fallback to default Anthropic pricing if model not found
- Log warnings for unknown models
- Return cents as integer (round up fractional cents)

**Cost Formula:**
```
cost_cents = Math.ceil(
  (input_tokens * input_rate_per_million / 1_000_000 * 100) +
  (output_tokens * output_rate_per_million / 1_000_000 * 100)
)
```

---

### 2.2 Usage Tracker Service

**Location:** `lib/services/usage-tracker.ts`

```typescript
interface UsageTrackerService {
  // Get tenant's current usage for billing period
  getTenantUsage(tenantId: string): Promise<TenantUsage>;

  // Check if tenant can make an AI request
  canMakeRequest(tenantId: string): Promise<UsageCheckResult>;

  // Get usage percentage
  getUsagePercentage(tenantId: string): Promise<number>;
}

interface TenantUsage {
  currentTokens: number;
  limit: number;
  percentage: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  daysRemaining: number;
  hasOverride: boolean;
}

interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  percentage: number;
  remaining: number;
}
```

**Implementation Notes:**
- Query usage_events with tenant_id and date range filter
- Cache results for 1 minute to reduce DB load
- Respect usage_limit_override if set
- Return clear reason when blocked

---

### 2.3 Notification Service

**Location:** `lib/services/notification-service.ts`

```typescript
interface NotificationService {
  // Check and send threshold notifications
  checkAndNotify(tenantId: string, percentage: number): Promise<void>;

  // Get notification history
  getNotificationHistory(tenantId: string): Promise<Notification[]>;
}
```

**Threshold Actions:**
| Percentage | Action |
|------------|--------|
| 75% | In-app notification only |
| 90% | In-app + Email (Resend) |
| 100% | In-app + Block AI requests |

**Implementation Notes:**
- Check usage_notifications table before sending
- Use existing Resend integration for email
- Store notification with billing_period to reset monthly

---

## 3. Integration Points

### 3.1 AI Agent Integration

**Files to Modify:**
- `app/api/coach/[slug]/session/[token]/message/route.ts`
- `lib/agents/archetype-interview-agent.ts`
- Any other AI-consuming routes

**Changes:**
1. Before AI call: `usageTracker.canMakeRequest(tenantId)`
2. After AI call: Log usage with separate input/output tokens
3. After logging: `notificationService.checkAndNotify(tenantId, percentage)`

**Example Integration:**
```typescript
// Before AI call
const usageCheck = await usageTracker.canMakeRequest(tenantId);
if (!usageCheck.allowed) {
  return NextResponse.json(
    { error: usageCheck.reason },
    { status: 429, headers: { 'Retry-After': getSecondsUntilReset() } }
  );
}

// After AI call
const cost = await costCalculator.calculateCost(
  model,
  response.usage.input_tokens,
  response.usage.output_tokens
);

await logUsageEvent(supabase, tenantId, 'llm_request', {
  input_tokens: response.usage.input_tokens,
  output_tokens: response.usage.output_tokens,
  cost_cents: cost,
  model_used: model
});

// Check notifications
const percentage = await usageTracker.getUsagePercentage(tenantId);
await notificationService.checkAndNotify(tenantId, percentage);
```

---

### 3.2 Admin Dashboard Integration

**Files to Modify:**
- `app/dashboard/admin/billing/page.tsx`
- `app/api/admin/billing/route.ts`

**Changes:**
1. Cost column now shows real `cost_cents` values
2. Add margin calculation: `revenue - costs`
3. Add tier management UI
4. Add export functionality

---

### 3.3 Tenant Dashboard Integration

**New Files:**
- `app/dashboard/settings/usage/page.tsx`
- `components/usage/UsageBanner.tsx`
- `components/usage/UsageProgress.tsx`

**Changes:**
1. Add usage widget to tenant dashboard
2. Add warning banner to layout when approaching limits
3. Add usage history view

---

## 4. API Endpoints

### 4.1 New Admin Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/pricing` | List all model pricing |
| POST | `/api/admin/pricing` | Add pricing configuration |
| PUT | `/api/admin/pricing/[id]` | Update pricing |
| GET | `/api/admin/tiers` | List subscription tiers |
| PUT | `/api/admin/tiers/[id]` | Update tier limits/pricing |
| PATCH | `/api/admin/tenants/[id]/tier` | Assign tenant to tier |
| PATCH | `/api/admin/tenants/[id]/override` | Set usage override |
| GET | `/api/admin/billing/export` | Export usage data |

### 4.2 New Tenant Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenant/usage` | Get current usage stats |
| GET | `/api/tenant/usage/history` | Get usage history |
| GET | `/api/tenant/notifications` | Get notification history |
| POST | `/api/tenant/notifications/[id]/acknowledge` | Dismiss notification |

---

## 5. Key Technical Decisions

### Decision 1: Calculate Cost at Write Time

**Decision:** Calculate and store `cost_cents` when logging usage events, not on read.

**Rationale:**
- Faster dashboard queries (no join to pricing table)
- Accurate historical costs (pricing changes don't affect past events)
- Simpler aggregation queries

**Trade-off:** Pricing changes don't retroactively affect past costs (acceptable - matches how billing works).

---

### Decision 2: Token Limits Over Session Limits

**Decision:** Use token limits as the primary constraint, session limits as secondary.

**Rationale:**
- Tokens directly correlate to AI costs
- Sessions vary wildly in token usage
- Easier to explain to users ("you have X tokens remaining")

**Implementation:** Check token limit first, session limit as additional constraint if defined.

---

### Decision 3: Soft Block at 100%

**Decision:** Block new AI requests but don't interrupt active sessions.

**Rationale:**
- Better UX - don't cut off mid-conversation
- Only check at request start, not mid-session
- Admin override allows exceptions

**Implementation:** Check limit before `anthropic.messages.create()`, not during streaming.

---

### Decision 4: In-Memory Pricing Cache

**Decision:** Cache model pricing in memory with 5-minute TTL.

**Rationale:**
- Pricing changes infrequently
- Reduces DB queries per AI request
- Acceptable latency for pricing updates

**Implementation:** Node.js Map with timestamp, refresh on cache miss or TTL expiry.

---

### Decision 5: Monthly Billing Periods

**Decision:** Use calendar months for billing periods.

**Rationale:**
- Simple to understand
- Aligns with typical SaaS billing
- Easy to implement with `date_trunc('month', now())`

**Implementation:** `billing_period_start` defaults to first of current month.

---

## 6. Migration Plan

### Phase 1: Schema (Story 1.1, 1.2, 2.1, 2.2)
1. Create `model_pricing` table with seed data
2. Create `subscription_tiers` table with seed data
3. Add columns to `tenant_profiles`
4. Add columns to `usage_events`
5. Create `usage_notifications` table

### Phase 2: Services (Story 1.3, 2.3)
1. Implement `CostCalculatorService`
2. Implement `UsageTrackerService`
3. Update `logUsageEvent` to use cost calculator

### Phase 3: Enforcement (Story 2.4)
1. Add usage check to AI routes
2. Return 429 when blocked
3. Log enforcement events

### Phase 4: UI (Epic 3, 4, 5)
1. Update admin dashboard
2. Add tenant usage components
3. Implement notifications

---

## 7. Performance Considerations

### Query Optimization

**Usage Aggregation Query:**
```sql
SELECT
  COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
  COALESCE(SUM(cost_cents), 0) as total_cost
FROM usage_events
WHERE tenant_id = $1
  AND created_at >= $2  -- billing_period_start
  AND created_at < $3;  -- billing_period_end
```

**Required Index:** `idx_usage_events_billing` (created above)

### Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|---------------|-----|--------------|
| Model Pricing | Memory | 5 min | On update + TTL |
| Tenant Usage | Memory | 1 min | On new event + TTL |
| Tier Info | Memory | 10 min | On update + TTL |

---

## 8. Security Considerations

1. **RLS Enforcement:** All new tables have RLS policies
2. **Admin Verification:** Tier/pricing management requires `user_type = 'admin'`
3. **Tenant Isolation:** Tenants can only see their own usage and notifications
4. **Audit Trail:** Pricing changes are timestamped in `model_pricing` table
5. **No Secrets in DB:** Provider API keys remain in environment variables

---

## Summary

This architecture addendum defines:

- **5 schema changes** (2 new tables, 3 table modifications)
- **3 new services** (CostCalculator, UsageTracker, NotificationService)
- **10+ new API endpoints** for admin and tenant operations
- **5 key technical decisions** with rationale

The architecture integrates with existing FlowForge patterns and maintains backward compatibility with current usage tracking.

---

_Architecture Addendum Version 1.0 | 2026-01-13_
