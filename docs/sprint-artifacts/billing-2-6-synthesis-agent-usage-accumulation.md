# Story 2.6: Synthesis Agent Usage Accumulation

**Epic:** billing-epic-2-tiers-limits (Subscription Tiers & Usage Limits)
**Story ID:** billing-2-6-synthesis-agent-usage-accumulation
**Status:** done
**Created:** 2026-01-13
**Origin:** Deferred from Epic 1 implementation

---

## Story

**As a** platform developer,
**I want** the synthesis agent to accumulate token usage across all internal AI calls,
**So that** consultant tenants are billed accurately for complete synthesis operations.

---

## Background

The synthesis agent (used in the consultant/industry 4.0 assessment path) makes **multiple internal AI calls** during a single synthesis operation:
- Technology dimension analysis
- Process dimension analysis
- Organization dimension analysis
- Overall synthesis generation
- Potentially additional calls for recommendations

Epic 1 Story 1.4 updated single-call agents but did not fully address multi-call agents like synthesis.

---

## Acceptance Criteria

### AC1: Token Accumulation
**Given** a synthesis agent makes 5 internal AI calls
**When** the synthesis completes
**Then** total input_tokens = sum of all 5 calls' input tokens
**And** total output_tokens = sum of all 5 calls' output tokens

### AC2: Cost Calculation
**Given** accumulated tokens from a synthesis operation
**When** the usage event is logged
**Then** cost_cents reflects the total accumulated cost
**And** uses the correct model pricing for each call

### AC3: Tenant Attribution
**Given** a synthesis is triggered for a consultant's campaign
**When** usage is logged
**Then** the usage event is attributed to the correct consultant tenant
**And** uses the campaign's organization_id or company_profile_id

### AC4: Single Usage Event
**Given** a synthesis operation with multiple internal calls
**When** logging completes
**Then** a single consolidated usage event is created
**And** event_type = 'synthesis'
**And** metadata includes breakdown of individual calls (optional)

### AC5: Error Handling
**Given** a synthesis operation fails partway through
**When** some AI calls completed before failure
**Then** usage for completed calls is still logged
**And** partial cost is attributed correctly

---

## Tasks / Subtasks

- [x] **1. Audit synthesis-agent.ts**
  - [x] 1.1 Identify all AI call points in synthesis flow
  - [x] 1.2 Document current token capture behavior
  - [x] 1.3 Map call flow and data dependencies

- [x] **2. Create usage accumulator**
  - [x] 2.1 Create `UsageAccumulator` class or helper
  - [x] 2.2 Track input/output tokens per call
  - [x] 2.3 Sum totals at completion

- [x] **3. Update synthesis agent**
  - [x] 3.1 Wrap each AI call with usage capture
  - [x] 3.2 Pass accumulator through call chain
  - [x] 3.3 Log consolidated usage on completion

- [x] **4. Handle tenant attribution**
  - [x] 4.1 Determine tenant from campaign context
  - [x] 4.2 Pass tenant_id through synthesis flow
  - [x] 4.3 Ensure correct attribution in usage event

- [x] **5. Add error handling**
  - [x] 5.1 Log partial usage on failure
  - [x] 5.2 Mark event as partial if incomplete

- [ ] **6. Test end-to-end**
  - [ ] 6.1 Run synthesis with logging enabled
  - [ ] 6.2 Verify accumulated totals match sum of calls
  - [ ] 6.3 Verify cost calculation correct

---

## Dev Notes

### Usage Accumulator Pattern

```typescript
// lib/services/usage-accumulator.ts

interface UsageCall {
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  callType: string;  // 'technology_analysis', 'process_analysis', etc.
}

class UsageAccumulator {
  private calls: UsageCall[] = [];
  private tenantId: string;
  private eventType: string;

  constructor(tenantId: string, eventType: string) {
    this.tenantId = tenantId;
    this.eventType = eventType;
  }

  addCall(call: UsageCall): void {
    this.calls.push(call);
  }

  getTotals(): {
    inputTokens: number;
    outputTokens: number;
    costCents: number;
  } {
    return {
      inputTokens: this.calls.reduce((sum, c) => sum + c.inputTokens, 0),
      outputTokens: this.calls.reduce((sum, c) => sum + c.outputTokens, 0),
      costCents: this.calls.reduce((sum, c) => sum + c.costCents, 0),
    };
  }

  async logConsolidated(): Promise<void> {
    const totals = this.getTotals();
    await logUsageEvent({
      tenantId: this.tenantId,
      eventType: this.eventType,
      inputTokens: totals.inputTokens,
      outputTokens: totals.outputTokens,
      costCents: totals.costCents,
      metadata: { calls: this.calls },  // Optional breakdown
    });
  }
}
```

### Synthesis Agent Integration

```typescript
// In synthesis-agent.ts

async function runSynthesis(campaignId: string): Promise<SynthesisResult> {
  const campaign = await getCampaign(campaignId);
  const tenantId = campaign.company_profile_id;  // Consultant's tenant

  const accumulator = new UsageAccumulator(tenantId, 'synthesis');

  // Technology analysis
  const techResult = await analyzeWithTracking(
    accumulator,
    'technology_analysis',
    techPrompt
  );

  // Process analysis
  const processResult = await analyzeWithTracking(
    accumulator,
    'process_analysis',
    processPrompt
  );

  // ... more calls ...

  // Log consolidated usage
  await accumulator.logConsolidated();

  return synthesisResult;
}

async function analyzeWithTracking(
  accumulator: UsageAccumulator,
  callType: string,
  prompt: string
): Promise<AnalysisResult> {
  const response = await anthropic.messages.create({...});

  const costCents = await calculateCost(
    response.model,
    response.usage.input_tokens,
    response.usage.output_tokens
  );

  accumulator.addCall({
    modelUsed: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    costCents,
    callType,
  });

  return parseResponse(response);
}
```

### Files to Modify

| File | Change |
|------|--------|
| `lib/agents/synthesis-agent.ts` | Add usage accumulation |
| `lib/services/usage-accumulator.ts` | New file |
| `lib/usage/log-usage.ts` | Support metadata field |

### Prerequisites
- Story 1.3 (cost calculation service)
- Story 1.4 (agent token logging basics)
- Story 2.1 (subscription tiers - for tenant context)

---

## Definition of Done

- [x] UsageAccumulator helper created
- [x] Synthesis agent tracks all internal calls
- [x] Consolidated usage event logged
- [x] Correct tenant attribution
- [x] Partial logging on failure
- [ ] End-to-end test passes (requires production run)

---

_Story Version 1.0 | Created 2026-01-13_
_Origin: Deferred work identified during Epic 1 implementation_
