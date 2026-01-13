# Story 3.1: Create Notification Tracking Table

**Epic:** billing-epic-3-notifications (Usage Notifications)
**Story ID:** billing-3-1-create-notification-tracking-table
**Status:** drafted
**Created:** 2026-01-13

---

## Story

**As a** platform developer,
**I want** to track which notifications have been sent to which tenants,
**So that** we don't spam users with duplicate warnings.

---

## Acceptance Criteria

### AC1: Table Created
**Given** no usage_notifications table exists
**When** the migration runs
**Then** a table is created with:
- `id` (UUID)
- `tenant_id` (UUID REFERENCES tenant_profiles)
- `notification_type` (TEXT) - '75_percent', '90_percent', '100_percent'
- `billing_period` (DATE) - to track per-period
- `sent_at` (TIMESTAMPTZ)
- `delivery_method` (TEXT) - 'in_app', 'email', 'both'
- `acknowledged_at` (TIMESTAMPTZ NULL)

### AC2: Unique Constraint
**Given** the table exists
**When** attempting to insert duplicate (tenant_id, notification_type, billing_period)
**Then** the insert is rejected
**And** this prevents duplicate notifications in same billing period

### AC3: RLS Policies
**Given** RLS is enabled
**When** a tenant queries
**Then** they only see their own notifications
**And** platform admins can see all notifications

---

## Tasks / Subtasks

- [ ] **1. Create migration**
  - [ ] 1.1 Create `supabase/migrations/20260113_004_create_usage_notifications.sql`
  - [ ] 1.2 Define table schema
  - [ ] 1.3 Add unique constraint
  - [ ] 1.4 Add foreign key to tenant_profiles

- [ ] **2. Configure RLS**
  - [ ] 2.1 Enable RLS
  - [ ] 2.2 Tenant can read own notifications
  - [ ] 2.3 Admin can read all
  - [ ] 2.4 System can insert (service role)

- [ ] **3. Regenerate types**
  - [ ] 3.1 Update TypeScript types
  - [ ] 3.2 Verify UsageNotification type

---

## Dev Notes

### Migration SQL

```sql
CREATE TABLE usage_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,  -- '75_percent', '90_percent', '100_percent'
  billing_period DATE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivery_method TEXT NOT NULL,     -- 'in_app', 'email', 'both'
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (tenant_id, notification_type, billing_period)
);

-- RLS
ALTER TABLE usage_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own notifications"
  ON usage_notifications FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all notifications"
  ON usage_notifications FOR SELECT
  USING (auth.jwt() ->> 'user_type' = 'admin');
```

### Notification Types

| Type | Trigger | Delivery |
|------|---------|----------|
| 75_percent | Usage >= 75% | In-app only |
| 90_percent | Usage >= 90% | In-app + email |
| 100_percent | Usage >= 100% | In-app + email |

### Prerequisites
- None

---

## Definition of Done

- [ ] Migration created and applied
- [ ] Unique constraint prevents duplicates
- [ ] RLS policies configured
- [ ] TypeScript types regenerated

---

_Story Version 1.0 | Created 2026-01-13_
