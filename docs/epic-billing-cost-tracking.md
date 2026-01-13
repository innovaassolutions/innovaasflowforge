# Billing & Cost Tracking - Epic Breakdown

**Author:** Todd
**Date:** 2026-01-13
**PRD Reference:** [PRD-billing-cost-tracking.md](./PRD-billing-cost-tracking.md)
**Status:** Initial Version (Pre-Architecture)

---

## Overview

This document breaks down the Billing & Cost Tracking feature into implementable epics and stories. Each story is sized for single dev agent completion with detailed acceptance criteria.

**Living Document Notice:** This is the initial version. It will be updated after Architecture workflow adds technical details to stories.

### Epic Summary

| Epic | Title | Stories | Key FRs |
|------|-------|---------|---------|
| 1 | Foundation: Schema & Cost Calculation | 4 | FR1-6, FR7-10 |
| 2 | Subscription Tiers & Limits | 5 | FR14-25 |
| 3 | Usage Notifications | 3 | FR26-30 |
| 4 | Admin Dashboard Enhancement | 4 | FR31-42 |
| 5 | Tenant Usage Visibility | 3 | FR43-46 |
| 6 | Automated Pricing Sync (Growth) | 2 | FR11-13 |

**Total:** 6 Epics, 21 Stories

---

## Functional Requirements Inventory

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

## FR Coverage Map

| Epic | Functional Requirements Covered |
|------|--------------------------------|
| Epic 1: Foundation | FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10 |
| Epic 2: Tiers & Limits | FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25 |
| Epic 3: Notifications | FR26, FR27, FR28, FR29, FR30 |
| Epic 4: Admin Dashboard | FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR42 |
| Epic 5: Tenant Visibility | FR43, FR44, FR45, FR46 |
| Epic 6: Pricing Sync | FR11, FR12, FR13 |

**Coverage:** All 49 FRs mapped to epics.

---

## Epic 1: Foundation - Schema & Cost Calculation

**Goal:** Establish the data foundation for cost tracking by modifying the usage_events schema, creating a model pricing table, and implementing cost calculation at write time.

**Value:** Enables accurate AI cost tracking for every usage event, forming the basis for all billing and margin analysis.

**Covers:** FR1-6 (Cost Calculation), FR7-10 (Pricing Management basics)

---

### Story 1.1: Modify Usage Events Schema

**As a** platform developer,
**I want** the usage_events table to store input and output tokens separately,
**So that** costs can be calculated accurately based on provider-specific input/output rates.

**Acceptance Criteria:**

**Given** the existing usage_events table with a single tokens_used column
**When** the migration runs
**Then** the table has new columns: input_tokens (INTEGER), output_tokens (INTEGER)
**And** the existing tokens_used column is retained for backward compatibility
**And** all existing rows have input_tokens = tokens_used, output_tokens = 0
**And** the cost_cents column (existing) will be populated by calculation

**Prerequisites:** None (first story)

**Technical Notes:**
- Migration file: `20260113_xxx_add_input_output_tokens.sql`
- Add CHECK constraint: input_tokens >= 0, output_tokens >= 0
- Add index on (tenant_id, created_at) if not exists for billing queries
- Update RLS policies if needed

---

### Story 1.2: Create Model Pricing Table

**As a** platform admin,
**I want** a database table to store AI model pricing rates,
**So that** the system can calculate costs using accurate, up-to-date pricing.

**Acceptance Criteria:**

**Given** no model_pricing table exists
**When** the migration runs
**Then** a model_pricing table is created with columns:
  - id (UUID, primary key)
  - provider (TEXT NOT NULL) - e.g., 'anthropic', 'openai', 'google'
  - model_id (TEXT NOT NULL) - e.g., 'claude-sonnet-4-20250514'
  - display_name (TEXT) - human-readable name
  - input_rate_per_million (DECIMAL(10,4) NOT NULL) - cost per 1M input tokens
  - output_rate_per_million (DECIMAL(10,4) NOT NULL) - cost per 1M output tokens
  - effective_date (TIMESTAMPTZ NOT NULL DEFAULT now())
  - is_active (BOOLEAN DEFAULT true)
  - created_at, updated_at timestamps

**And** a unique constraint on (provider, model_id, effective_date)
**And** seed data includes current pricing for:
  - Anthropic: claude-sonnet-4-20250514 ($3.00/$15.00), claude-opus-4-5-20251101 ($15.00/$75.00), claude-haiku ($0.25/$1.25)
  - OpenAI: gpt-4-turbo ($10.00/$30.00), gpt-4o ($5.00/$15.00), gpt-3.5-turbo ($0.50/$1.50)
  - Google: gemini-1.5-pro ($7.00/$21.00), gemini-1.5-flash ($0.35/$1.05)

**Prerequisites:** None

**Technical Notes:**
- Migration file: `20260113_xxx_create_model_pricing.sql`
- Include RLS policy: only platform admins can modify
- Consider versioning via effective_date for pricing history
- Add helper function: `get_model_pricing(model_id TEXT)` returns current active rate

---

### Story 1.3: Implement Cost Calculation Service

**As a** platform developer,
**I want** a service that calculates cost in cents given token counts and model,
**So that** every usage event has accurate cost attribution.

**Acceptance Criteria:**

**Given** input_tokens, output_tokens, and model_id
**When** calculateCost() is called
**Then** the service:
  - Looks up the active pricing for the model_id
  - Calculates: `cost_cents = (input_tokens * input_rate / 1,000,000) + (output_tokens * output_rate / 1,000,000)`
  - Converts to cents (multiply by 100 if rates are in dollars)
  - Returns integer cents value (rounded)

**And** if model_id not found in pricing table, returns 0 and logs warning
**And** calculation completes in < 10ms

**Given** a usage event is being logged
**When** the logUsageEvent function is called
**Then** it calculates cost_cents before inserting
**And** stores input_tokens and output_tokens separately
**And** the event is saved with accurate cost attribution

**Prerequisites:** Story 1.1, Story 1.2

**Technical Notes:**
- Create `lib/services/cost-calculator.ts`
- Update `logUsageEvent()` in message route to use new service
- Cache pricing lookups in memory (refresh every 5 minutes)
- Handle edge case: model not in pricing table (log warning, cost = 0)

---

### Story 1.4: Update AI Agent Calls to Log Separate Tokens

**As a** platform developer,
**I want** all AI agent calls to log input and output tokens separately,
**So that** cost calculation is accurate for every event.

**Acceptance Criteria:**

**Given** the archetype-interview-agent processes a message
**When** it returns usage data
**Then** the response includes separate input_tokens and output_tokens (not combined)
**And** the calling route logs both values to usage_events

**Given** any other AI agent (synthesis, reflection, etc.) processes a request
**When** usage is logged
**Then** input_tokens and output_tokens are captured separately

**And** all existing agent call sites are updated:
  - archetype-interview-agent.ts
  - synthesis-agent.ts (if exists)
  - reflection-agent.ts (if exists)
  - Any voice/ElevenLabs integrations

**Prerequisites:** Story 1.1, Story 1.3

**Technical Notes:**
- Audit all files calling Anthropic/OpenAI APIs
- Update AgentResponse interface to have input_tokens, output_tokens (not just total)
- Anthropic API response.usage already has input_tokens and output_tokens
- Remove any code that combines them before logging

---

## Epic 2: Subscription Tiers & Usage Limits

**Goal:** Implement subscription tier management and usage limit enforcement so tenants are constrained by their package allowances.

**Value:** Protects platform economics by ensuring tenants cannot exceed their paid allowances without consequence.

**Covers:** FR14-25

---

### Story 2.1: Create Subscription Tiers Table

**As a** platform admin,
**I want** a database table to define subscription tiers with usage limits,
**So that** tenants can be assigned appropriate packages.

**Acceptance Criteria:**

**Given** no subscription_tiers table exists
**When** the migration runs
**Then** a subscription_tiers table is created with:
  - id (UUID, primary key)
  - name (TEXT NOT NULL UNIQUE) - 'starter', 'pro', 'enterprise'
  - display_name (TEXT) - 'Starter', 'Pro', 'Enterprise'
  - monthly_token_limit (BIGINT) - NULL means check session limit instead
  - monthly_session_limit (INTEGER) - NULL means check token limit instead
  - price_cents_monthly (INTEGER) - subscription price for margin calc
  - is_active (BOOLEAN DEFAULT true)
  - created_at, updated_at

**And** CHECK constraint ensures at least one limit is set (no unlimited)
**And** seed data includes:
  - Starter: 500,000 tokens/month OR 50 sessions, $29/month
  - Pro: 2,000,000 tokens/month OR 200 sessions, $99/month
  - Enterprise: 10,000,000 tokens/month OR 1000 sessions, $499/month

**Prerequisites:** None (can run parallel to Epic 1)

**Technical Notes:**
- Migration file: `20260113_xxx_create_subscription_tiers.sql`
- Consider which limit type applies (tokens vs sessions) - might need limit_type enum
- For MVP, use tokens as primary limit

---

### Story 2.2: Add Tier Assignment to Tenant Profiles

**As a** platform admin,
**I want** to assign subscription tiers to tenant profiles,
**So that** each tenant has defined usage limits.

**Acceptance Criteria:**

**Given** the tenant_profiles table exists
**When** the migration runs
**Then** a new column tier_id (UUID REFERENCES subscription_tiers) is added
**And** a new column usage_limit_override (BIGINT NULL) allows admin override
**And** existing tenants default to 'starter' tier
**And** a new column billing_period_start (DATE) tracks current billing cycle

**Given** a platform admin views a tenant in the admin dashboard
**When** they view tenant details
**Then** the current tier is displayed
**And** they can change the tier assignment
**And** they can set/remove usage_limit_override

**Prerequisites:** Story 2.1

**Technical Notes:**
- Migration: `20260113_xxx_add_tier_to_tenant_profiles.sql`
- Add foreign key with ON DELETE SET NULL
- Create admin API endpoint: PATCH /api/admin/tenants/[id]/tier

---

### Story 2.3: Implement Usage Tracking Per Billing Period

**As a** platform developer,
**I want** to track cumulative token usage per tenant per billing period,
**So that** the system can calculate usage percentage.

**Acceptance Criteria:**

**Given** a tenant has a billing_period_start date
**When** the system queries their usage
**Then** it sums all usage_events.input_tokens + output_tokens since billing_period_start
**And** returns the total as current_usage

**Given** the tenant's tier has a monthly_token_limit of 2,000,000
**When** their current_usage is 1,500,000
**Then** usage_percentage = 75%

**And** a helper function `getTenantUsage(tenantId)` returns:
  - current_usage (tokens)
  - limit (from tier or override)
  - percentage
  - billing_period_start
  - billing_period_end (calculated)

**Prerequisites:** Story 2.2

**Technical Notes:**
- Create `lib/services/usage-tracker.ts`
- Use efficient query with index on (tenant_id, created_at)
- Cache results for 1 minute to avoid repeated queries
- Consider materialized view for high-volume scenarios

---

### Story 2.4: Implement Pre-Request Usage Check

**As a** platform developer,
**I want** to check usage limits before processing AI requests,
**So that** tenants at 100% are blocked from further usage.

**Acceptance Criteria:**

**Given** a tenant's usage_percentage is < 100%
**When** an AI request is made
**Then** the request proceeds normally

**Given** a tenant's usage_percentage is >= 100%
**When** an AI request is made
**Then** the request is blocked
**And** a clear error response is returned: "Usage limit reached. Please upgrade your plan or wait for your next billing cycle."
**And** HTTP status 429 (Too Many Requests) is returned
**And** the block is logged for audit

**Given** a tenant has usage_limit_override set (admin override)
**When** usage is checked
**Then** the override limit is used instead of tier limit

**Prerequisites:** Story 2.3

**Technical Notes:**
- Create middleware or helper: `checkUsageLimit(tenantId)`
- Integrate into archetype message route before AI call
- Integrate into any other AI-consuming endpoints
- Consider adding Retry-After header indicating billing cycle reset

---

### Story 2.5: Admin UI for Tier Management

**As a** platform admin,
**I want** to view and manage subscription tiers in the admin dashboard,
**So that** I can configure pricing and limits.

**Acceptance Criteria:**

**Given** the admin is on the admin dashboard
**When** they navigate to Settings > Subscription Tiers
**Then** they see a list of all tiers with: name, token limit, session limit, price

**Given** the admin clicks "Edit" on a tier
**When** they modify limits or pricing
**Then** changes are saved and reflected immediately

**Given** the admin views a tenant's detail page
**When** they look at the subscription section
**Then** they see current tier, usage percentage, and option to change tier
**And** they can set/clear usage_limit_override

**Prerequisites:** Story 2.1, Story 2.2

**Technical Notes:**
- Add page: `app/dashboard/admin/settings/tiers/page.tsx`
- Add API: GET/PUT /api/admin/tiers
- Reuse existing admin layout patterns
- Follow Pearl Vibrant design system

---

## Epic 3: Usage Notifications

**Goal:** Implement progressive warning notifications (75%, 90%) to help tenants manage their usage before lockout.

**Value:** Improves user experience by giving advance warning, reducing surprise lockouts and support tickets.

**Covers:** FR26-30

---

### Story 3.1: Create Notification Tracking Table

**As a** platform developer,
**I want** to track which notifications have been sent to which tenants,
**So that** we don't spam users with duplicate warnings.

**Acceptance Criteria:**

**Given** no usage_notifications table exists
**When** the migration runs
**Then** a table is created with:
  - id (UUID)
  - tenant_id (UUID REFERENCES tenant_profiles)
  - notification_type (TEXT) - '75_percent', '90_percent', '100_percent'
  - billing_period (DATE) - to track per-period
  - sent_at (TIMESTAMPTZ)
  - delivery_method (TEXT) - 'in_app', 'email', 'both'
  - acknowledged_at (TIMESTAMPTZ NULL)

**And** unique constraint on (tenant_id, notification_type, billing_period)

**Prerequisites:** None

**Technical Notes:**
- Migration: `20260113_xxx_create_usage_notifications.sql`
- This prevents sending same notification twice in same billing period

---

### Story 3.2: Implement 75% and 90% Warning Triggers

**As a** tenant user,
**I want** to receive warnings when approaching my usage limit,
**So that** I can take action before being locked out.

**Acceptance Criteria:**

**Given** a tenant's usage crosses 75% threshold
**When** the next usage event is logged
**Then** an in-app notification is created (if not already sent this period)
**And** the notification appears as a banner in the tenant dashboard
**And** the notification is recorded in usage_notifications

**Given** a tenant's usage crosses 90% threshold
**When** the next usage event is logged
**Then** an in-app notification is created
**And** an email is sent to the tenant admin email
**And** both deliveries are recorded

**Given** a notification was already sent for this threshold this billing period
**When** usage is checked again
**Then** no duplicate notification is sent

**Prerequisites:** Story 2.3, Story 3.1

**Technical Notes:**
- Create `lib/services/notification-service.ts`
- Check thresholds after each usage event log
- Use existing Resend integration for email
- Email template: simple warning with usage stats and upgrade CTA

---

### Story 3.3: Tenant Notification History View

**As a** tenant admin,
**I want** to view my notification history,
**So that** I can see past warnings and understand my usage patterns.

**Acceptance Criteria:**

**Given** the tenant admin is on their dashboard
**When** they navigate to Settings > Notifications (or similar)
**Then** they see a list of past usage notifications
**And** each shows: type, date, delivery method

**And** they can dismiss/acknowledge notifications
**And** acknowledged notifications are visually distinct

**Prerequisites:** Story 3.1, Story 3.2

**Technical Notes:**
- Add section to tenant settings or usage page
- API: GET /api/tenant/notifications
- Simple list view, follow design system

---

## Epic 4: Admin Dashboard Enhancement

**Goal:** Enhance the admin billing dashboard to show real costs, margins, and provide better filtering/export capabilities.

**Value:** Gives platform admins full visibility into unit economics and profitability.

**Covers:** FR31-42

---

### Story 4.1: Display Calculated Costs in Dashboard

**As a** platform admin,
**I want** the billing dashboard to show real calculated costs (not $0.00),
**So that** I can understand actual AI spend.

**Acceptance Criteria:**

**Given** usage events have cost_cents populated (from Epic 1)
**When** the admin views the billing dashboard
**Then** all cost displays show actual calculated values
**And** costs are formatted as currency ($X.XX)
**And** the "By Model" tab shows cost per model accurately
**And** the "By Tenant" tab shows cost per tenant accurately

**Prerequisites:** Epic 1 complete (costs being calculated)

**Technical Notes:**
- Dashboard already has infrastructure (`app/dashboard/admin/billing/page.tsx`)
- Should "just work" once cost_cents is populated
- Verify aggregation queries sum cost_cents correctly

---

### Story 4.2: Add Revenue and Margin Tracking

**As a** platform admin,
**I want** to record tenant revenue and see margin calculations,
**So that** I can identify unprofitable tenants.

**Acceptance Criteria:**

**Given** a tenant has a subscription tier with price_cents_monthly
**When** the admin views tenant billing details
**Then** they see:
  - Monthly revenue: $X.XX (from tier price)
  - AI costs: $X.XX (sum of cost_cents for period)
  - Margin: $X.XX (revenue - costs)
  - Margin %: X% (margin / revenue)

**Given** a tenant's margin is negative
**When** displayed in the tenant list
**Then** it is highlighted in red/warning color
**And** a "Low Margin" badge appears

**Given** the admin views the overview dashboard
**When** looking at tenant summary
**Then** they see a list sorted by margin (lowest first for attention)

**Prerequisites:** Story 2.1, Story 4.1

**Technical Notes:**
- Revenue comes from tier assignment (price_cents_monthly)
- May need manual revenue override for custom deals
- Add margin calculation to billing API response
- Update dashboard to display margin column

---

### Story 4.3: Add Cost Trend Visualization

**As a** platform admin,
**I want** to see cost trends over time,
**So that** I can identify growth patterns and anomalies.

**Acceptance Criteria:**

**Given** the admin views the billing dashboard
**When** they select a date range
**Then** a line chart shows daily/weekly/monthly cost trends
**And** they can toggle between total cost, by provider, by tenant

**And** the chart uses the existing Recharts library
**And** follows Pearl Vibrant color scheme

**Prerequisites:** Story 4.1

**Technical Notes:**
- Add new tab or section to billing dashboard
- Aggregate by day for date ranges < 30 days, by week for < 90 days, by month for longer
- Consider using existing chart patterns from other dashboards

---

### Story 4.4: Implement Export Functionality

**As a** platform admin,
**I want** to export usage and cost data,
**So that** I can analyze it externally or share with accounting.

**Acceptance Criteria:**

**Given** the admin is on the billing dashboard
**When** they click "Export"
**Then** a modal appears with options:
  - Format: CSV (default), JSON
  - Date range: pre-filled with current filter
  - Data: All events, By tenant, By model

**When** they confirm export
**Then** a file downloads with the requested data
**And** the file includes: date, tenant, model, input_tokens, output_tokens, cost_cents

**Prerequisites:** None (uses existing data)

**Technical Notes:**
- API endpoint: GET /api/admin/billing/export?format=csv&start=X&end=Y
- Use streaming for large exports
- Follow existing export patterns if any exist

---

## Epic 5: Tenant Usage Visibility

**Goal:** Give tenants visibility into their own usage so they can self-manage and avoid surprises.

**Value:** Reduces support burden, improves tenant satisfaction, enables self-service.

**Covers:** FR43-46

---

### Story 5.1: Tenant Usage Dashboard Component

**As a** tenant admin,
**I want** to see my current usage and remaining allowance,
**So that** I can manage my consumption.

**Acceptance Criteria:**

**Given** the tenant admin is on their dashboard
**When** they view the usage section
**Then** they see:
  - Current usage: X tokens (Y% of limit)
  - Remaining: Z tokens
  - Visual progress bar showing percentage
  - Billing period: Jan 1 - Jan 31
  - Days remaining: N days

**And** the progress bar changes color at thresholds:
  - Green: 0-74%
  - Yellow: 75-89%
  - Red: 90-100%

**Prerequisites:** Story 2.3

**Technical Notes:**
- Add usage component to tenant dashboard
- API: GET /api/tenant/usage
- Follow Pearl Vibrant design system
- Reuse progress bar patterns

---

### Story 5.2: Tenant Usage History View

**As a** tenant admin,
**I want** to see my usage history,
**So that** I can understand consumption patterns.

**Acceptance Criteria:**

**Given** the tenant admin clicks "View History" or navigates to usage details
**When** the page loads
**Then** they see:
  - Daily usage chart (last 30 days)
  - List of recent usage events (last 50)
  - Each event shows: date, type, tokens used

**And** they can filter by date range
**And** they can see which sessions consumed the most tokens

**Prerequisites:** Story 5.1

**Technical Notes:**
- Add page: `app/dashboard/settings/usage/page.tsx` or similar
- Reuse chart components
- Ensure RLS filters to only show tenant's own data

---

### Story 5.3: In-App Usage Warning Banner

**As a** tenant user,
**I want** to see a warning banner when approaching my limit,
**So that** I'm aware before getting locked out.

**Acceptance Criteria:**

**Given** a tenant user is using the platform
**When** their usage is 75-89%
**Then** a yellow warning banner appears: "You've used X% of your monthly allowance. [View Usage]"

**When** their usage is 90-99%
**Then** an orange warning banner appears: "Warning: You've used X% of your monthly allowance. Consider upgrading. [Upgrade] [View Usage]"

**When** their usage is 100%
**Then** a red banner appears: "Usage limit reached. Your sessions are paused until [date] or you upgrade. [Upgrade]"

**And** banners are dismissible but reappear on next session if still applicable
**And** banners don't block UI - they're informational

**Prerequisites:** Story 3.2

**Technical Notes:**
- Add banner component to main layout for tenant users
- Check usage on page load (cached, not every request)
- Store dismissal in localStorage, reset on threshold change

---

## Epic 6: Automated Pricing Sync (Growth)

**Goal:** Automatically keep model pricing up-to-date by fetching from provider APIs.

**Value:** Ensures accurate cost calculation without manual intervention when providers change rates.

**Covers:** FR11-13

**Note:** This is a Growth feature - implement after MVP is stable.

---

### Story 6.1: Implement Provider Pricing API Integration

**As a** platform developer,
**I want** to fetch current pricing from AI provider APIs,
**So that** the system stays accurate without manual updates.

**Acceptance Criteria:**

**Given** the pricing sync job runs
**When** it queries Anthropic's pricing endpoint
**Then** it retrieves current rates for all Claude models
**And** compares against stored rates
**And** if different, creates new pricing record with new effective_date

**Given** OpenAI and Google pricing endpoints are available
**When** they are queried
**Then** rates are retrieved and compared similarly

**Given** a provider's API is unavailable
**When** the job runs
**Then** it logs a warning and retries later
**And** existing pricing remains unchanged

**Prerequisites:** Story 1.2

**Technical Notes:**
- Research actual API endpoints (may need web scraping for some providers)
- Anthropic: Check if pricing API exists
- OpenAI: models endpoint may include pricing
- Google: Vertex AI pricing
- Fallback to manual if APIs not available

---

### Story 6.2: Pricing Change Alerts

**As a** platform admin,
**I want** to be alerted when AI pricing changes,
**So that** I can review and adjust my pricing tiers if needed.

**Acceptance Criteria:**

**Given** the pricing sync detects a rate change
**When** the new rate is saved
**Then** an email is sent to platform admins
**And** the email includes: provider, model, old rate, new rate, % change
**And** a notification appears in admin dashboard

**Given** no rate changes are detected
**When** the sync completes
**Then** no alerts are sent (silent success)

**Prerequisites:** Story 6.1

**Technical Notes:**
- Use existing Resend integration
- Store admin notification preferences
- Consider Slack/webhook integration for ops alerting

---

## FR Coverage Matrix

| FR | Description | Epic | Story |
|----|-------------|------|-------|
| FR1 | Calculate costs using provider rates | 1 | 1.3 |
| FR2 | Store input/output tokens separately | 1 | 1.1 |
| FR3 | Calculate cost at event creation | 1 | 1.3 |
| FR4 | Support multiple providers | 1 | 1.2, 1.3 |
| FR5 | Attribute costs to correct tenant | 1 | 1.3, 1.4 |
| FR6 | Track model used | 1 | 1.4 |
| FR7 | View pricing rates | 1 | 1.2 |
| FR8 | Add pricing configurations | 1 | 1.2 |
| FR9 | Update pricing rates | 1 | 1.2 |
| FR10 | Maintain pricing history | 1 | 1.2 |
| FR11 | Fetch pricing from APIs | 6 | 6.1 |
| FR12 | Auto-update pricing | 6 | 6.1 |
| FR13 | Alert on pricing changes | 6 | 6.2 |
| FR14 | Define subscription tiers | 2 | 2.1 |
| FR15 | Configure usage limits per tier | 2 | 2.1 |
| FR16 | Assign tenants to tiers | 2 | 2.2 |
| FR17 | Modify tier assignment | 2 | 2.2, 2.5 |
| FR18 | Enforce no unlimited tiers | 2 | 2.1 |
| FR19 | Track cumulative usage | 2 | 2.3 |
| FR20 | Calculate usage percentage | 2 | 2.3 |
| FR21 | Check limits before AI requests | 2 | 2.4 |
| FR22 | Block at 100% | 2 | 2.4 |
| FR23 | Display block reason | 2 | 2.4 |
| FR24 | Admin override limits | 2 | 2.2, 2.4 |
| FR25 | Respect override flag | 2 | 2.4 |
| FR26 | 75% in-app notification | 3 | 3.2 |
| FR27 | 90% in-app notification | 3 | 3.2 |
| FR28 | 90% email notification | 3 | 3.2 |
| FR29 | Track notification delivery | 3 | 3.1 |
| FR30 | View notification history | 3 | 3.3 |
| FR31 | Record tenant revenue | 4 | 4.2 |
| FR32 | Calculate margin | 4 | 4.2 |
| FR33 | Identify low margin tenants | 4 | 4.2 |
| FR34 | Display margin in admin views | 4 | 4.2 |
| FR35 | View total costs by date range | 4 | 4.1 |
| FR36 | View costs by provider | 4 | 4.1 |
| FR37 | View costs by model | 4 | 4.1 |
| FR38 | View costs by tenant | 4 | 4.1 |
| FR39 | View costs by event type | 4 | 4.1 |
| FR40 | Filter by date range | 4 | 4.1 |
| FR41 | Export data | 4 | 4.4 |
| FR42 | Display cost trends | 4 | 4.3 |
| FR43 | Tenant view usage percentage | 5 | 5.1 |
| FR44 | Tenant view usage history | 5 | 5.2 |
| FR45 | Tenant view remaining allowance | 5 | 5.1 |
| FR46 | Tenant see usage warnings | 5 | 5.3 |
| FR47 | Purchase additional usage | - | Deferred (Growth) |
| FR48 | Add purchased allowance | - | Deferred (Growth) |
| FR49 | Top-up payment integration | - | Deferred (Growth) |

**Note:** FR47-49 (Usage Top-Up) are Growth features and deferred to a future epic.

---

## Summary

This epic breakdown provides **6 Epics with 21 Stories** covering all MVP functional requirements. The Growth features (Automated Pricing Sync) are included but clearly marked as post-MVP.

### Recommended Implementation Order

1. **Epic 1: Foundation** - Must be first (schema + cost calculation)
2. **Epic 2: Tiers & Limits** - Enables billing enforcement
3. **Epic 4: Admin Dashboard** - Provides visibility into what's working
4. **Epic 3: Notifications** - Improves UX before lockouts happen
5. **Epic 5: Tenant Visibility** - Self-service for tenants
6. **Epic 6: Pricing Sync** - Automation (Growth phase)

### Next Steps

1. **Architecture Review** (optional) - Validate schema decisions
2. **Sprint Planning** - Run `workflow sprint-planning` to create sprint-status.yaml
3. **Story Implementation** - Run `workflow dev-story` for each story

---

_This document will be updated after Architecture workflow adds technical decisions._
_Epic Breakdown Version 1.0 | 2026-01-13_
