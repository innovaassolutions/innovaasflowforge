# Story 6.1: Implement Provider Pricing API Integration

**Epic:** billing-epic-6-pricing-sync (Automated Pricing Sync - Growth)
**Story ID:** billing-6-1-implement-provider-pricing-api
**Status:** drafted
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

- [ ] **1. Research provider APIs**
  - [ ] 1.1 Check Anthropic pricing API availability
  - [ ] 1.2 Check OpenAI pricing API availability
  - [ ] 1.3 Check Google/Vertex pricing API availability
  - [ ] 1.4 Document fallback strategies

- [ ] **2. Create pricing fetch service**
  - [ ] 2.1 Create `lib/services/pricing-sync.ts`
  - [ ] 2.2 Implement provider-specific fetchers
  - [ ] 2.3 Handle API responses

- [ ] **3. Implement price comparison**
  - [ ] 3.1 Compare fetched vs stored rates
  - [ ] 3.2 Detect changes (threshold: 0.01)
  - [ ] 3.3 Create new pricing record if changed

- [ ] **4. Create scheduled job**
  - [ ] 4.1 Create Vercel cron job or Supabase function
  - [ ] 4.2 Schedule for daily execution
  - [ ] 4.3 Add logging and monitoring

- [ ] **5. Add error handling**
  - [ ] 5.1 Retry logic for transient failures
  - [ ] 5.2 Alert on persistent failures
  - [ ] 5.3 Never delete existing pricing on error

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

- [ ] Provider API research complete
- [ ] Pricing fetch service created
- [ ] Price comparison works
- [ ] Scheduled job configured
- [ ] Error handling robust
- [ ] Fallback strategy documented

---

_Story Version 1.0 | Created 2026-01-13_
