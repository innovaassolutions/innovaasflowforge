# Billing & Cost Tracking - Product Requirements Document

**Author:** Todd
**Date:** 2026-01-13
**Version:** 1.0
**Status:** Draft

---

## Executive Summary

Implement a comprehensive billing and cost tracking system that calculates real AI costs per model, per tenant, and per user - enabling accurate margin analysis and usage-based billing. This feature transforms raw token counts into actionable financial data that validates pricing models and ensures platform profitability.

### What Makes This Special

This is the **unit economics engine** for FlowForge. While competitors track "tokens used," this system answers the business-critical questions:
- "What's my actual cost per coaching session?"
- "Is Tenant X profitable at their current pricing tier?"
- "What's my margin when a user runs 50 archetype interviews?"

The system is designed **multi-provider from day one**, supporting Anthropic, OpenAI, Google, and future AI providers with configurable pricing that updates as vendor rates change.

---

## Project Classification

**Technical Type:** SaaS B2B Platform Feature
**Domain:** Financial/Billing Systems
**Complexity:** Medium-High (multi-provider pricing, margin calculations, tenant billing)

### Domain Context

This feature intersects billing/financial systems with AI operations. Key domain considerations:
- **Pricing volatility**: AI provider rates change periodically (Anthropic, OpenAI, Google)
- **Multi-currency**: All major providers bill in USD
- **Usage metering**: Tokens are the billing unit, but input vs output have different rates
- **SaaS compliance**: Usage limits and enforcement must be transparent to users

---

## Success Criteria

### Core Success Metrics

1. **Cost Accuracy**
   - Calculated costs match actual provider invoices within 1% variance
   - Costs computed to-the-cent using real-time provider pricing

2. **Margin Visibility**
   - Platform admins can see profit margin per tenant, per session, per billing period
   - Dashboard shows cost vs. revenue breakdown by tenant tier

3. **Usage Enforcement**
   - 75% warning delivered to users approaching limits
   - 90% soft warning with clear notification
   - 100% lockout enforced with zero unauthorized overages
   - Admin override capability functional

4. **Multi-Provider Support**
   - Anthropic, OpenAI, and Google pricing supported from launch
   - New providers can be added via configuration (no code changes)

5. **Pricing Freshness**
   - Provider pricing auto-fetched and database updated when rates change
   - System reflects pricing changes within 24 hours of provider announcement

### Business Metrics

- **Unprofitable tenant identification**: Flag tenants with negative margin
- **Tier optimization**: Data to recommend tier upgrades for heavy users
- **Cost forecasting**: Project monthly AI costs based on current run rate

---

## Product Scope

### MVP - Minimum Viable Product

**Goal:** Calculate and display real AI costs; enforce usage limits

1. **Separate Input/Output Token Tracking**
   - Modify usage_events to store input_tokens and output_tokens separately
   - Update all AI agent calls to log both values

2. **Model Pricing Configuration Table**
   - Database table: `model_pricing` with provider, model, input_rate, output_rate, effective_date
   - Seed with current Anthropic, OpenAI, Google rates
   - Admin UI to view/update pricing

3. **Cost Calculation at Write Time**
   - Calculate `cost_cents` when logging usage events
   - Formula: `(input_tokens * input_rate) + (output_tokens * output_rate)`

4. **Package/Tier Definition**
   - Database table: `subscription_tiers` (Starter, Pro, Enterprise)
   - Define usage limits per tier (tokens, sessions, or both)
   - Link tenants to tiers

5. **Usage Limit Enforcement**
   - Check usage before AI calls
   - Block at 100% with clear error message
   - Admin override flag per tenant

6. **Warning Notifications**
   - 75% threshold: In-app notification
   - 90% threshold: In-app + email notification
   - Track notification delivery to avoid spam

7. **Enhanced Admin Dashboard**
   - Cost column shows actual calculated costs
   - Filter by tenant, model, date range
   - Show margin (requires revenue data)

### Growth Features (Post-MVP)

1. **Automated Pricing Sync**
   - Scheduled job to check provider APIs for pricing changes
   - Auto-update model_pricing table
   - Alert admins when pricing changes detected

2. **Revenue Integration**
   - Import tenant subscription revenue (Stripe webhook or manual)
   - Calculate real margin = revenue - AI costs - platform overhead

3. **Usage Top-Up**
   - Allow tenants to purchase additional usage mid-cycle
   - Self-service top-up flow with payment

4. **Tenant-Facing Usage Dashboard**
   - Let tenants see their own usage and remaining allowance
   - Usage history and trends

5. **Cost Forecasting**
   - Predict end-of-month costs based on current usage velocity
   - Alert if projected costs exceed budget

6. **Per-Session Cost Attribution**
   - Roll up all AI calls within a session to show session-level cost
   - Enable "cost per archetype interview" reporting

### Vision (Future)

1. **Dynamic Pricing Tiers**
   - Adjust tier pricing based on actual AI cost trends
   - Automated margin protection

2. **Usage-Based Billing (Pure)**
   - Bill tenants per token or per session instead of flat subscription
   - Stripe metered billing integration

3. **Multi-Currency Support**
   - Display costs in tenant's local currency
   - Handle exchange rate conversion

4. **AI Provider Cost Optimization**
   - Route requests to cheapest provider meeting quality threshold
   - A/B test models for cost vs. quality tradeoffs

5. **Self-Hosted Enterprise**
   - Support open-source model deployments (Ollama, vLLM)
   - Track compute costs instead of API costs

---

## SaaS B2B Specific Requirements

### Multi-Tenancy Architecture

- Cost and usage data isolated per tenant via existing RLS policies
- Tenant-level aggregations for billing and reporting
- Platform admin has cross-tenant visibility
- Each tenant sees only their own usage data

### Permissions & Roles

| Role | Capabilities |
|------|--------------|
| **Platform Admin** | View all tenant costs, manage pricing, override limits, view margins |
| **Tenant Admin** | View own usage, see remaining allowance, manage top-ups |
| **Tenant User** | See usage warnings when approaching limits |

---

## User Experience Principles

### Design Philosophy

- **Transparency**: Users should never be surprised by limits or costs
- **Progressive disclosure**: Show simple usage %, drill down to details on demand
- **Non-punitive warnings**: Help users succeed, don't just block them

### Key Interactions

1. **Usage Warning Flow**
   - Unobtrusive banner at 75% ("You've used 75% of your monthly allowance")
   - More prominent alert at 90% with action options
   - Clear lockout message at 100% with upgrade/top-up path

2. **Admin Cost Review**
   - Glanceable summary cards (total cost, total margin, top spenders)
   - Drill-down to tenant, session, or model level
   - Export capabilities for accounting

---

## Functional Requirements

### Cost Calculation & Tracking

- **FR1:** System calculates AI costs in cents using provider-specific input and output token rates
- **FR2:** System stores input_tokens and output_tokens separately for each usage event
- **FR3:** System calculates cost at the time of usage event creation (not retroactively)
- **FR4:** System supports cost calculation for multiple AI providers (Anthropic, OpenAI, Google)
- **FR5:** System attributes costs to the correct tenant based on the session context
- **FR6:** System tracks which AI model was used for each usage event

### Model Pricing Management

- **FR7:** Platform admins can view all configured model pricing rates
- **FR8:** Platform admins can add new model pricing configurations
- **FR9:** Platform admins can update existing model pricing rates
- **FR10:** System maintains pricing history with effective dates
- **FR11:** System fetches current pricing from provider APIs on a scheduled basis
- **FR12:** System auto-updates pricing configuration when provider rates change
- **FR13:** System alerts platform admins when pricing changes are detected

### Subscription Tiers & Packages

- **FR14:** Platform admins can define subscription tiers (Starter, Pro, Enterprise)
- **FR15:** Platform admins can configure usage limits per tier (tokens and/or sessions)
- **FR16:** Platform admins can assign tenants to subscription tiers
- **FR17:** Platform admins can modify a tenant's tier assignment
- **FR18:** System enforces that no SaaS tier has unlimited usage

### Usage Monitoring & Limits

- **FR19:** System tracks cumulative usage per tenant per billing period
- **FR20:** System calculates usage percentage against tenant's tier allowance
- **FR21:** System checks usage limits before processing AI requests
- **FR22:** System blocks AI requests when tenant reaches 100% of usage allowance
- **FR23:** System displays clear error message explaining the block reason
- **FR24:** Platform admins can override usage limits for specific tenants
- **FR25:** System respects admin override flag when checking limits

### Notifications & Warnings

- **FR26:** System triggers in-app notification when tenant reaches 75% usage
- **FR27:** System triggers in-app notification when tenant reaches 90% usage
- **FR28:** System sends email notification when tenant reaches 90% usage
- **FR29:** System tracks notification delivery to prevent duplicate sends
- **FR30:** Tenant admins can view their notification history

### Revenue & Margin Tracking

- **FR31:** Platform admins can record tenant subscription revenue amounts
- **FR32:** System calculates margin as revenue minus AI costs per tenant
- **FR33:** System identifies tenants with negative or low margin
- **FR34:** System displays margin data alongside cost data in admin views

### Admin Dashboard & Reporting

- **FR35:** Platform admins can view total platform AI costs for any date range
- **FR36:** Platform admins can view costs broken down by AI provider
- **FR37:** Platform admins can view costs broken down by model
- **FR38:** Platform admins can view costs broken down by tenant
- **FR39:** Platform admins can view costs broken down by event type
- **FR40:** Platform admins can filter dashboard by date range
- **FR41:** Platform admins can export usage and cost data
- **FR42:** Dashboard displays cost trends over time

### Tenant Usage Visibility

- **FR43:** Tenant admins can view their current usage percentage
- **FR44:** Tenant admins can view their usage history
- **FR45:** Tenant admins can view their remaining allowance
- **FR46:** Tenant users see usage warnings when approaching limits

### Usage Top-Up (Growth)

- **FR47:** Tenant admins can purchase additional usage allowance
- **FR48:** System adds purchased allowance to current billing period
- **FR49:** Top-up purchase flow integrates with payment processing

---

## Non-Functional Requirements

### Performance

- **NFR1:** Cost calculation must add less than 50ms latency to usage event logging
- **NFR2:** Usage limit check must complete in under 100ms
- **NFR3:** Admin dashboard must load within 2 seconds for up to 100,000 usage events
- **NFR4:** Pricing sync job must complete within 5 minutes

### Security

- **NFR5:** Tenant cost data must be isolated via RLS (no cross-tenant data leakage)
- **NFR6:** Only platform admins can view cross-tenant cost data
- **NFR7:** Pricing configuration changes must be audit-logged
- **NFR8:** API keys for provider pricing endpoints must be stored securely (environment variables)

### Scalability

- **NFR9:** System must handle 10,000+ usage events per day without degradation
- **NFR10:** Cost aggregations must remain performant with 1M+ historical events
- **NFR11:** Database indexes must support efficient tenant-scoped queries

### Integration

- **NFR12:** System must integrate with Anthropic API for pricing data
- **NFR13:** System must integrate with OpenAI API for pricing data
- **NFR14:** System must integrate with Google AI API for pricing data
- **NFR15:** System must support future Stripe integration for revenue tracking
- **NFR16:** Email notifications must use existing Resend integration

---

## Implementation Planning

### Recommended Epic Breakdown

Based on the functional requirements, BMad Master recommends the following epic structure:

| Epic | Focus | Key FRs |
|------|-------|---------|
| **Epic 1: Foundation** | Schema changes, pricing table, cost calculation | FR1-6, FR7-10 |
| **Epic 2: Tiers & Limits** | Subscription tiers, usage tracking, enforcement | FR14-25 |
| **Epic 3: Notifications** | Warning system, email integration | FR26-30 |
| **Epic 4: Admin Dashboard** | Enhanced dashboard with costs and margins | FR35-42, FR31-34 |
| **Epic 5: Tenant Visibility** | Tenant-facing usage dashboard | FR43-46 |
| **Epic 6: Pricing Sync** | Automated provider pricing updates | FR11-13 |

**Next Step:** Run `workflow epics-stories` to create detailed story breakdown.

---

## References

- **AI Token Cost Analysis:** docs/ai-token-cost-analysis.md
- **Strategic Vision:** docs/strategic-vision.md
- **Pricing Strategy:** docs/pricingagents.md
- **Current Usage Schema:** supabase/migrations/20260106_003_create_usage_events.sql

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow create-epics-and-stories`
2. **Architecture Review** - Run: `workflow architecture` (if schema changes need validation)
3. **Implementation** - Run: `workflow dev-story` per story

---

## Summary

This PRD defines the **Billing & Cost Tracking** feature for FlowForge - a comprehensive system that:

- **Calculates real AI costs** using multi-provider pricing (Anthropic, OpenAI, Google)
- **Enforces usage limits** with progressive warnings (75% → 90% → 100% lockout)
- **Enables margin analysis** to validate pricing tiers and identify unprofitable tenants
- **Auto-syncs pricing** from provider APIs to maintain accuracy

The feature transforms FlowForge from tracking "tokens used" to answering "are we profitable?" - the critical question for sustainable SaaS growth.

---

_Created through collaborative discovery between Todd and BMad Master._
_PRD Version 1.0 | 2026-01-13_
