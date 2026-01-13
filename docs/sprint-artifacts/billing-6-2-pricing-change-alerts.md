# Story 6.2: Pricing Change Alerts

**Epic:** billing-epic-6-pricing-sync (Automated Pricing Sync - Growth)
**Story ID:** billing-6-2-pricing-change-alerts
**Status:** drafted
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** to be alerted when AI pricing changes,
**So that** I can review and adjust my pricing tiers if needed.

---

## Acceptance Criteria

### AC1: Email Alert on Change
**Given** the pricing sync detects a rate change
**When** the new rate is saved
**Then** an email is sent to platform admins

### AC2: Alert Content
**Given** a pricing alert email is sent
**When** admin receives it
**Then** it includes:
- Provider name
- Model name
- Old input/output rates
- New input/output rates
- Percentage change
- Link to pricing dashboard

### AC3: Dashboard Notification
**Given** a pricing change is detected
**When** admin views the billing dashboard
**Then** a notification/alert appears
**And** shows which models changed

### AC4: No Alert on No Change
**Given** no rate changes are detected
**When** the sync completes
**Then** no alerts are sent (silent success)

### AC5: Alert History
**Given** the admin views pricing settings
**When** they look at change history
**Then** they see a log of all pricing changes

---

## Tasks / Subtasks

- [ ] **1. Create alert email template**
  - [ ] 1.1 Create pricing change email template
  - [ ] 1.2 Include all required information
  - [ ] 1.3 Add call-to-action button

- [ ] **2. Implement email sending**
  - [ ] 2.1 Identify admin email addresses
  - [ ] 2.2 Use Resend integration
  - [ ] 2.3 Send on pricing change

- [ ] **3. Create dashboard notification**
  - [ ] 3.1 Add notification component
  - [ ] 3.2 Show on admin dashboard
  - [ ] 3.3 Clear after acknowledgment

- [ ] **4. Create pricing change log**
  - [ ] 4.1 Log all changes with timestamp
  - [ ] 4.2 Store old and new values
  - [ ] 4.3 Display in pricing settings

- [ ] **5. Integrate with pricing sync**
  - [ ] 5.1 Trigger alert after sync
  - [ ] 5.2 Only if changes detected
  - [ ] 5.3 Batch multiple changes into one alert

---

## Dev Notes

### Alert Email Template

```
Subject: FlowForge: AI Pricing Change Detected

Hi Admin,

Our pricing sync has detected the following changes:

ANTHROPIC - Claude Sonnet 4
┌─────────────────┬───────────┬───────────┬──────────┐
│                 │ Old Rate  │ New Rate  │ Change   │
├─────────────────┼───────────┼───────────┼──────────┤
│ Input (per 1M)  │ $3.00     │ $2.50     │ -16.7%   │
│ Output (per 1M) │ $15.00    │ $12.50    │ -16.7%   │
└─────────────────┴───────────┴───────────┴──────────┘

Action Required:
Review your pricing tiers to ensure margins remain healthy.

[View Pricing Dashboard]

This is an automated alert from FlowForge.
```

### Change Log Table

```sql
-- Add to model_pricing or create separate table
CREATE TABLE pricing_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_pricing_id UUID REFERENCES model_pricing(id),
  model_id TEXT NOT NULL,
  old_input_rate DECIMAL(10,4),
  old_output_rate DECIMAL(10,4),
  new_input_rate DECIMAL(10,4),
  new_output_rate DECIMAL(10,4),
  detected_at TIMESTAMPTZ DEFAULT now(),
  alerted_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES user_profiles(id),
  acknowledged_at TIMESTAMPTZ
);
```

### Dashboard Notification

```tsx
// Show when unacknowledged pricing changes exist
function PricingChangeAlert({ changes }) {
  return (
    <Alert variant="warning">
      <AlertTitle>Pricing Changes Detected</AlertTitle>
      <AlertDescription>
        {changes.length} model(s) have updated pricing.
        <Link href="/dashboard/admin/settings/pricing">Review changes</Link>
      </AlertDescription>
    </Alert>
  );
}
```

### Prerequisites
- Story 6.1 (pricing sync service)

---

## Definition of Done

- [ ] Email template created
- [ ] Alerts sent on pricing change
- [ ] Dashboard notification works
- [ ] No alerts on no change
- [ ] Change history visible

---

_Story Version 1.0 | Created 2026-01-13_
