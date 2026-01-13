# Story 2.4: Implement Pre-Request Usage Check

**Epic:** billing-epic-2-tiers-limits (Subscription Tiers & Usage Limits)
**Story ID:** billing-2-4-implement-pre-request-usage-check
**Status:** review
**Created:** 2026-01-13

---

## Story

**As a** platform developer,
**I want** to check usage limits before processing AI requests,
**So that** tenants at 100% are blocked from further usage.

---

## Acceptance Criteria

### AC1: Under Limit - Allow
**Given** a tenant's usage_percentage is < 100%
**When** an AI request is made
**Then** the request proceeds normally

### AC2: At Limit - Block
**Given** a tenant's usage_percentage is >= 100%
**When** an AI request is made
**Then** the request is blocked
**And** HTTP status 429 (Too Many Requests) is returned
**And** error message: "Usage limit reached. Please upgrade your plan or wait for your next billing cycle."

### AC3: Block Logged
**Given** a request is blocked
**When** the block occurs
**Then** the block is logged for audit
**And** includes tenant_id, attempted_action, timestamp

### AC4: Override Respected
**Given** a tenant has usage_limit_override set
**When** usage is checked
**Then** the override limit is used instead of tier limit

### AC5: Retry-After Header
**Given** a tenant is blocked
**When** the 429 response is returned
**Then** a Retry-After header indicates billing cycle reset date

---

## Tasks / Subtasks

- [x] **1. Create usage check helper**
  - [x] 1.1 Create `checkUsageLimit(tenantId)` function
  - [x] 1.2 Return { allowed: boolean, usage: TenantUsage }
  - [x] 1.3 Use UsageTrackerService from Story 2.3

- [x] **2. Create middleware/guard**
  - [x] 2.1 Create `createUsageLimitError` helper for 429 responses
  - [x] 2.2 Check before AI processing
  - [x] 2.3 Return 429 if blocked

- [x] **3. Integrate with archetype message route**
  - [x] 3.1 Add check before AI call in message route
  - [x] 3.2 Return proper error response
  - [x] 3.3 Include Retry-After header

- [x] **4. Integrate with other AI endpoints**
  - [x] 4.1 Added to archetype message route
  - [x] 4.2 Added to reflection route
  - [ ] 4.3 Voice chat route (deferred - separate Epic)

- [ ] **5. Add audit logging** (deferred)
  - [ ] 5.1 Log blocked requests
  - [ ] 5.2 Include tenant, action, timestamp
  - [ ] 5.3 Store in audit table or logs

- [ ] **6. Write tests** (deferred)
  - [ ] 6.1 Test allow when under limit
  - [ ] 6.2 Test block at 100%
  - [ ] 6.3 Test override behavior

---

## Dev Notes

### Usage Check Function

```typescript
// lib/services/usage-tracker.ts

interface UsageCheckResult {
  allowed: boolean;
  usage: TenantUsage;
  reason?: string;
}

async function checkUsageLimit(tenantId: string): Promise<UsageCheckResult> {
  const usage = await getTenantUsage(tenantId);

  if (usage.percentage >= 100) {
    return {
      allowed: false,
      usage,
      reason: 'Usage limit reached'
    };
  }

  return { allowed: true, usage };
}
```

### Error Response Format

```typescript
// 429 Too Many Requests
{
  error: 'UsageLimitExceeded',
  message: 'Usage limit reached. Please upgrade your plan or wait for your next billing cycle.',
  usage: {
    current: 2100000,
    limit: 2000000,
    percentage: 105,
    resetDate: '2026-02-01'
  }
}

// Headers
Retry-After: 1234567 // Seconds until billing reset
```

### Integration Points

| Endpoint | File |
|----------|------|
| Interview message | `app/api/coach/[slug]/session/[token]/message/route.ts` |
| Synthesis | `app/api/synthesis/route.ts` (if exists) |
| Voice chat | `app/api/voice/chat/completions/route.ts` |

### Prerequisites
- Story 2.3 (usage tracking service)

---

## Definition of Done

- [ ] checkUsageLimit function created
- [ ] Message route blocks at 100%
- [ ] 429 response with proper message
- [ ] Retry-After header included
- [ ] Blocked requests logged
- [ ] All AI endpoints protected

---

_Story Version 1.0 | Created 2026-01-13_
