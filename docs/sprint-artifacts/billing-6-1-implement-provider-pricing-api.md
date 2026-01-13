# Story 6.1: Implement Provider Pricing API Integration

**Epic:** billing-epic-6-pricing-sync (Automated Pricing Sync - Growth)
**Story ID:** billing-6-1-implement-provider-pricing-api
**Status:** done
**Created:** 2026-01-13

---

## Story

**As a** platform developer,
**I want** to fetch current pricing from AI provider APIs,
**So that** the system stays accurate without manual updates.

---

## Acceptance Criteria

### AC1: Anthropic Pricing Fetch
**Given** the pricing sync job runs
**When** it queries Anthropic's pricing
**Then** it retrieves current rates for all Claude models
**And** compares against stored rates
**And** if different, creates new pricing record

### AC2: OpenAI Pricing Fetch
**Given** the pricing sync job runs
**When** it queries OpenAI's pricing
**Then** it retrieves current rates for GPT models
**And** updates model_pricing if changed

### AC3: Google Pricing Fetch
**Given** the pricing sync job runs
**When** it queries Google's pricing
**Then** it retrieves current rates for Gemini models
**And** updates model_pricing if changed

### AC4: Error Handling
**Given** a provider's API is unavailable
**When** the job runs
**Then** it logs a warning and retries later
**And** existing pricing remains unchanged

### AC5: Scheduled Execution
**Given** the pricing sync is configured
**When** scheduled
**Then** it runs daily at a configured time
**And** logs results for audit

---

## Tasks / Subtasks

- [x] **1. Research provider APIs**
  - [x] 1.1 Check Anthropic pricing API availability - No public API
  - [x] 1.2 Check OpenAI pricing API availability - No public API
  - [x] 1.3 Check Google/Vertex pricing API availability - No public API
  - [x] 1.4 Document fallback strategies - Use known pricing + admin alerts

- [x] **2. Create pricing fetch service**
  - [x] 2.1 Create `lib/services/pricing-sync.ts`
  - [x] 2.2 Implement known pricing registry with sources
  - [x] 2.3 Handle comparison and discrepancy detection

- [x] **3. Implement price comparison**
  - [x] 3.1 Compare known vs stored rates
  - [x] 3.2 Detect changes (threshold: 0.01)
  - [x] 3.3 Create new pricing record via `updateModelPricing()`

- [x] **4. Create scheduled job**
  - [x] 4.1 Create Vercel cron job `/api/cron/sync-pricing`
  - [x] 4.2 Schedule for daily at 6 AM UTC via vercel.json
  - [x] 4.3 Add logging and monitoring

- [x] **5. Add error handling**
  - [x] 5.1 Graceful handling of API failures
  - [x] 5.2 Alert admins via usage_notifications
  - [x] 5.3 Never delete existing pricing on error

---

## Dev Notes

### Pricing Sync Service

```typescript
// lib/services/pricing-sync.ts

interface PricingUpdate {
  provider: string;
  modelId: string;
  inputRate: number;
  outputRate: number;
  changed: boolean;
}

async function syncPricing(): Promise<PricingUpdate[]> {
  const updates: PricingUpdate[] = [];

  // Fetch from each provider
  updates.push(...await fetchAnthropicPricing());
  updates.push(...await fetchOpenAIPricing());
  updates.push(...await fetchGooglePricing());

  // Apply updates
  for (const update of updates.filter(u => u.changed)) {
    await createPricingRecord(update);
  }

  return updates;
}
```

### Provider API Research Notes

**Anthropic:**
- No official public pricing API as of 2026
- Options: Web scraping, manual monitoring, third-party services
- Fallback: Manual update with admin alert

**OpenAI:**
- Models endpoint may include pricing
- Check: `https://api.openai.com/v1/models`
- May need to parse pricing page

**Google:**
- Vertex AI has pricing API
- Check: `https://cloudbilling.googleapis.com/v1/...`
- May require billing API access

### Cron Job Configuration

```typescript
// vercel.json or Supabase cron
{
  "crons": [
    {
      "path": "/api/cron/sync-pricing",
      "schedule": "0 6 * * *"  // Daily at 6 AM UTC
    }
  ]
}
```

### Note
This is a Growth feature. If provider APIs don't exist, implement with manual update + admin notification instead of automated sync.

### Prerequisites
- Story 1.2 (model_pricing table)

---

## Definition of Done

- [x] Provider API research complete - No public APIs available
- [x] Pricing fetch service created - Known pricing registry approach
- [x] Price comparison works - Detects discrepancies > 0.01
- [x] Scheduled job configured - Vercel cron daily at 6 AM UTC
- [x] Error handling robust - Never deletes pricing, logs errors
- [x] Fallback strategy documented - Admin notifications + manual update

---

## Implementation Details

### Files Created

- `lib/services/pricing-sync.ts` - Pricing sync service with:
  - `KNOWN_PRICING` registry with all model prices and sources
  - `syncProviderPricing()` - Sync for single provider
  - `syncAllPricing()` - Sync for all providers
  - `updateModelPricing()` - Update individual model
  - `getPricingVerificationStatus()` - Check stale pricing

- `app/api/cron/sync-pricing/route.ts` - Vercel cron endpoint
- `app/api/admin/pricing/route.ts` - Admin management API
- `vercel.json` - Cron job configuration

### Architecture Decision

Since no AI providers offer public pricing APIs, we implemented a **Known Pricing Registry** approach:

1. Maintain hardcoded pricing from provider documentation
2. Compare against database values daily
3. Alert admins when discrepancies are detected
4. Admin manually updates after verifying with provider

### API Endpoints

- `GET /api/admin/pricing` - View pricing status
- `POST /api/admin/pricing` - Manual sync or add missing models
- `PATCH /api/admin/pricing` - Update model pricing
- `GET /api/cron/sync-pricing` - Cron job (daily 6 AM UTC)

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
