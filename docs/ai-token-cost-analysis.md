# AI Token Cost Analysis - Innovaas FlowForge

> Last Updated: 2025-12-06
> Purpose: Cost planning for AI-powered assessment platform at scale

## Token Pricing (Anthropic Claude 3.5 Sonnet)

**Current rates:**
- **Input tokens:** $3.00 per million tokens
- **Output tokens:** $15.00 per million tokens

**Token conversion:**
- 1 token ≈ 4 characters (English text)
- 1 page (single-spaced) ≈ 500 words ≈ 2,000 characters ≈ **500 tokens**

---

## Cost Breakdown Per Campaign

### Phase 1: Interview Conduct (Per Stakeholder)

**Typical interview:**
- 15 questions, back-and-forth conversation
- Total conversation: ~3,000 input tokens + 1,500 output tokens

**Cost per interview:**
- Input: 3,000 × ($3 / 1M) = $0.009
- Output: 1,500 × ($15 / 1M) = $0.0225
- **Total: ~$0.03 per stakeholder interview**

### Phase 2: Synthesis (One-time per campaign)

This is where documents come in:

**Input to synthesis:**
- Interview transcripts: ~3,000 tokens per stakeholder
- Documents: Varies wildly

**Small campaign (5 stakeholders):**
- Transcripts: 5 × 3,000 = 15,000 tokens
- Documents: 2 docs × 10 pages × 5 people = 100 pages = 50,000 tokens
- Output (assessment): ~5,000 tokens
- **Cost:** (65,000 × $3 + 5,000 × $15) / 1M = **$0.27**

**Medium campaign (15 stakeholders):**
- Transcripts: 15 × 3,000 = 45,000 tokens
- Documents: 3 docs × 15 pages × 15 people = 675 pages = 337,500 tokens
- Output: ~5,000 tokens
- **Cost:** (382,500 × $3 + 5,000 × $15) / 1M = **$1.22**

**Large campaign (50 stakeholders):**
- Transcripts: 50 × 3,000 = 150,000 tokens
- Documents: 5 docs × 20 pages × 50 people = 5,000 pages = 2,500,000 tokens
- Output: ~5,000 tokens
- **Cost:** (2,650,000 × $3 + 5,000 × $15) / 1M = **$8.03**

**Worst case (200 stakeholders, heavy docs):**
- Transcripts: 200 × 3,000 = 600,000 tokens
- Documents: 10 docs × 50 pages × 200 people = 100,000 pages = 50,000,000 tokens
- Output: ~5,000 tokens
- **Cost:** (50,600,000 × $3 + 5,000 × $15) / 1M = **$151.88**

---

## Total Campaign Cost Scenarios

| Scenario | Stakeholders | Interview Cost | Synthesis Cost | **Total per Campaign** |
|----------|--------------|----------------|----------------|------------------------|
| **Small** | 5 | $0.15 | $0.27 | **$0.42** |
| **Medium** | 15 | $0.45 | $1.22 | **$1.67** |
| **Large** | 50 | $1.50 | $8.03 | **$9.53** |
| **Enterprise** | 200 | $6.00 | $151.88 | **$157.88** |

---

## At Scale: 1,000 Consultants Running Campaigns

**Assumptions:**
- Average 20 stakeholders per campaign
- 3 documents × 15 pages per stakeholder (moderate)
- Each consultant runs 2 campaigns/month

**Per campaign cost (20 stakeholders):**
- Interviews: 20 × $0.03 = $0.60
- Documents: 20 × 3 × 15 pages = 900 pages = 450,000 tokens
- Transcripts: 20 × 3,000 = 60,000 tokens
- Synthesis: (510,000 × $3 + 5,000 × $15) / 1M = $1.61
- **Total: ~$2.21 per campaign**

**Monthly at scale:**
- 1,000 consultants × 2 campaigns = 2,000 campaigns/month
- **2,000 × $2.21 = $4,420/month**
- **Annual: ~$53,000/year**

---

## Strategies to Control Costs

### 1. Smart Document Processing (Recommended)

Don't process ALL documents blindly:

**Document relevance filtering:**
```typescript
// Before synthesis, scan document titles/first page
const relevantDocs = await filterRelevantDocuments(uploadedDocs)
// Only include docs that mention: strategy, technology, process, digital, etc.
```

**Token budgeting:**
```typescript
const MAX_DOCUMENT_TOKENS = 100,000 // Cap per campaign
const processedDocs = await smartChunk(documents, MAX_DOCUMENT_TOKENS)
```

**Savings:** 50-70% reduction in document costs

### 2. Tiered Document Processing

**Basic tier:** No document processing (consultant reviews manually)
**Professional tier:** Up to 50 pages total
**Enterprise tier:** Up to 500 pages total

Charge accordingly in your pricing model.

### 3. Document Summarization Pipeline

Instead of sending full docs to synthesis:
- Use cheaper model (Claude Haiku: $0.25/M input) to summarize first
- Send summaries to synthesis, not full text
- **Cost reduction:** 80-90% on document processing

**Example:**
- 50-page doc = 25,000 tokens × $3/M = $0.075
- Summarize to 2 pages = 1,000 tokens
- Synthesis uses 1,000 tokens × $3/M = $0.003
- **Savings: $0.072 per document (96% reduction)**

### 4. Usage Limits + Alerts

```typescript
// Track costs per campaign in database
if (estimatedCost > $50) {
  alertConsultant("Document volume high - recommend manual review")
  requireApproval()
}
```

---

## Recommended Approach

**Hybrid Model with Cost Controls:**

1. **Interview transcripts:** Always include (fixed cost)
2. **Documents:** Smart processing with limits
   - Summarize docs >10 pages using Claude Haiku
   - Cap total document tokens at 200,000 per campaign (~100 pages)
   - Consultants can manually review additional docs
3. **Cost visibility:** Show estimated cost before synthesis runs
4. **Pricing tiers:** Pass costs to customers in tiered pricing

**Realistic costs with this approach:**
- Small campaign (5 stakeholders): **$0.50**
- Medium campaign (15 stakeholders): **$1.80**
- Large campaign (50 stakeholders): **$6.00**
- 1,000 consultants × 2 campaigns/month: **$3,600/month** (~$43k/year)

---

## Business Model Recommendations

**Charge per stakeholder:**
- $10-15 per stakeholder for basic tier
- $20-30 per stakeholder for professional (with doc processing)
- $50+ per stakeholder for enterprise

**Your costs:** $0.10-0.30 per stakeholder (AI only)
**Margin:** 95-98% gross margin on AI costs

**Example:** Medium campaign (15 stakeholders) at $20/stakeholder
- **Revenue:** $300
- **AI cost:** ~$1.80
- **Gross margin:** $298.20 (99.4%)

Your real costs will be infrastructure (Supabase, Vercel), not AI.

---

## Bottom Line at Massive Scale

**Worst case scenario:**
- 10,000 campaigns/month with heavy document usage
- **~$22,000/month** in AI costs
- **But** you'd be doing $2M-3M in revenue at that scale

**Should you worry?** Not really - AI costs are negligible compared to potential revenue. Your bigger concerns should be:
1. Customer acquisition
2. Consultant onboarding
3. Platform reliability

**Recommended:** Build hybrid approach with smart limits. Monitor costs. Adjust as you scale.

---

## Cost Tracking Implementation

**Database schema additions:**
```sql
ALTER TABLE campaigns ADD COLUMN ai_cost_estimate DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE campaigns ADD COLUMN ai_cost_actual DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE campaigns ADD COLUMN token_count_input INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN token_count_output INTEGER DEFAULT 0;
```

**Track costs in real-time:**
```typescript
// After each AI call
await trackAICost({
  campaign_id,
  operation: 'synthesis',
  input_tokens: usage.input_tokens,
  output_tokens: usage.output_tokens,
  cost: calculateCost(usage)
})
```

**Show consultants before synthesis:**
```typescript
const estimate = await estimateSynthesisCost(campaignId)
// Display: "Estimated AI cost: $2.35 (15 stakeholders, 450 pages documents)"
```

---

## Alternative Model Pricing (For Comparison)

| Model | Input (per 1M) | Output (per 1M) | Use Case |
|-------|----------------|-----------------|----------|
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | Primary synthesis |
| **Claude 3.5 Haiku** | $0.25 | $1.25 | Document summarization |
| **OpenAI GPT-4 Turbo** | $10.00 | $30.00 | More expensive |
| **OpenAI GPT-3.5 Turbo** | $0.50 | $1.50 | Cheaper alternative |

**Why Claude 3.5 Sonnet:**
- Best balance of quality and cost
- 200K context window (handles large document loads)
- Superior analysis capabilities for consulting work
- Excellent at structured output (JSON assessments)

---

## Monthly Cost Projections

### Year 1 (Growing)
- **Month 1:** 10 consultants × 1 campaign = $22
- **Month 3:** 50 consultants × 1.5 campaigns = $165
- **Month 6:** 200 consultants × 2 campaigns = $880
- **Month 12:** 500 consultants × 2 campaigns = $2,200

### Year 2 (Scaling)
- 1,000 consultants × 2 campaigns/month = **$4,400/month**
- Annual AI cost: **~$53,000**

### Year 3 (Enterprise)
- 3,000 consultants × 2.5 campaigns/month = **$16,500/month**
- Annual AI cost: **~$198,000**

**Revenue at Year 3 scale:**
- 3,000 consultants × 2.5 campaigns × 15 stakeholders × $25/stakeholder
- **$2.8M monthly revenue**
- AI cost: 0.6% of revenue

---

**Conclusion:** AI costs are manageable and scale predictably. Focus on customer value, not cost optimization (yet).
