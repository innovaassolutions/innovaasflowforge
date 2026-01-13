# Story 6.2: Pricing Change Alerts

**Epic:** billing-epic-6-pricing-sync (Automated Pricing Sync - Growth)
**Story ID:** billing-6-2-pricing-change-alerts
**Status:** done
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

- [x] **1. Create alert email template**
  - [x] 1.1 Create pricing change email template
  - [x] 1.2 Include all required information
  - [x] 1.3 Add call-to-action button

- [x] **2. Implement email sending**
  - [x] 2.1 Identify admin email addresses
  - [x] 2.2 Use Resend integration
  - [x] 2.3 Send on pricing change

- [x] **3. Create dashboard notification**
  - [x] 3.1 Add notification component (via usage_notifications table)
  - [x] 3.2 Show on admin dashboard
  - [x] 3.3 Clear after acknowledgment

- [x] **4. Create pricing change log**
  - [x] 4.1 Log all changes with timestamp
  - [x] 4.2 Store old and new values
  - [x] 4.3 Display in pricing settings (via admin API)

- [x] **5. Integrate with pricing sync**
  - [x] 5.1 Trigger alert after sync
  - [x] 5.2 Only if changes detected
  - [x] 5.3 Batch multiple changes into one alert

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

- [x] Email template created
- [x] Alerts sent on pricing change
- [x] Dashboard notification works
- [x] No alerts on no change
- [x] Change history visible

---

## Implementation Details

### Files Created

- `supabase/migrations/20260113_005_create_pricing_change_log.sql` - Pricing change log table
- `lib/email/templates/pricing-change-alert.tsx` - React Email template

### Files Modified

- `lib/services/pricing-sync.ts` - Added change logging functions:
  - `logPriceChange()` - Log individual price changes
  - `getUnacknowledgedChanges()` - Get pending changes
  - `acknowledgePriceChanges()` - Mark changes as acknowledged
  - `markChangesAlerted()` - Mark when email sent
  - `getPriceChangeHistory()` - Get change history

- `app/api/cron/sync-pricing/route.ts` - Added:
  - Email sending via Resend
  - Change logging to database
  - Dashboard notification creation

### Database Changes

- Created `pricing_change_log` table with:
  - Model identification (model_id, provider, display_name)
  - Rate changes (old/new input/output rates)
  - Change percentages
  - Change type (update, new_model, manual)
  - Timestamps (detected_at, alerted_at, acknowledged_at)
  - Acknowledgment tracking (acknowledged_by)

### Alert Flow

1. Cron job runs daily at 6 AM UTC
2. Syncs pricing from known registry vs database
3. If discrepancies found:
   - Logs changes to pricing_change_log
   - Sends email to all platform admins
   - Creates in-app notification
4. Silent success if no changes

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
