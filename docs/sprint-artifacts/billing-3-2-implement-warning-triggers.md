# Story 3.2: Implement 75% and 90% Warning Triggers

**Epic:** billing-epic-3-notifications (Usage Notifications)
**Story ID:** billing-3-2-implement-warning-triggers
**Status:** drafted
**Created:** 2026-01-13

---

## Story

**As a** tenant user,
**I want** to receive warnings when approaching my usage limit,
**So that** I can take action before being locked out.

---

## Acceptance Criteria

### AC1: 75% Threshold - In-App
**Given** a tenant's usage crosses 75% threshold
**When** the next usage event is logged
**Then** an in-app notification is created (if not already sent this period)
**And** the notification is recorded in usage_notifications

### AC2: 90% Threshold - In-App + Email
**Given** a tenant's usage crosses 90% threshold
**When** the next usage event is logged
**Then** an in-app notification is created
**And** an email is sent to the tenant admin email
**And** both deliveries are recorded

### AC3: No Duplicate Notifications
**Given** a notification was already sent for this threshold this billing period
**When** usage is checked again
**Then** no duplicate notification is sent

### AC4: Notification Banner Display
**Given** a 75% notification exists for tenant
**When** tenant visits dashboard
**Then** a yellow warning banner appears: "You've used 75% of your monthly allowance"

### AC5: Email Content
**Given** a 90% email is sent
**Then** email includes:
- Current usage percentage
- Remaining tokens
- Days until reset
- Upgrade CTA link

---

## Tasks / Subtasks

- [ ] **1. Create NotificationService**
  - [ ] 1.1 Create `lib/services/notification-service.ts`
  - [ ] 1.2 Implement `checkAndSendNotifications(tenantId, usage)`
  - [ ] 1.3 Implement `hasNotificationBeenSent(tenantId, type, period)`

- [ ] **2. Implement threshold checks**
  - [ ] 2.1 Check if 75% threshold crossed
  - [ ] 2.2 Check if 90% threshold crossed
  - [ ] 2.3 Check existing notifications before sending

- [ ] **3. Create in-app notifications**
  - [ ] 3.1 Insert into usage_notifications table
  - [ ] 3.2 Set delivery_method appropriately

- [ ] **4. Implement email sending**
  - [ ] 4.1 Create email template for usage warning
  - [ ] 4.2 Use existing Resend integration
  - [ ] 4.3 Send at 90% threshold

- [ ] **5. Integrate with usage logging**
  - [ ] 5.1 Call notification check after each usage event
  - [ ] 5.2 Pass current usage to service

- [ ] **6. Test notification flow**
  - [ ] 6.1 Test 75% triggers in-app only
  - [ ] 6.2 Test 90% triggers in-app + email
  - [ ] 6.3 Test no duplicates

---

## Dev Notes

### NotificationService

```typescript
// lib/services/notification-service.ts

async function checkAndSendNotifications(
  tenantId: string,
  usage: TenantUsage
): Promise<void> {
  const { percentage, billingPeriodStart } = usage;

  if (percentage >= 90) {
    await sendNotification(tenantId, '90_percent', 'both', billingPeriodStart);
  } else if (percentage >= 75) {
    await sendNotification(tenantId, '75_percent', 'in_app', billingPeriodStart);
  }
}

async function sendNotification(
  tenantId: string,
  type: string,
  method: 'in_app' | 'email' | 'both',
  billingPeriod: Date
): Promise<void> {
  // Check if already sent
  const existing = await checkExisting(tenantId, type, billingPeriod);
  if (existing) return;

  // Record notification
  await recordNotification(tenantId, type, method, billingPeriod);

  // Send email if needed
  if (method === 'email' || method === 'both') {
    await sendUsageWarningEmail(tenantId, type);
  }
}
```

### Email Template

```
Subject: FlowForge: You've used 90% of your monthly allowance

Hi [Name],

You've used 90% of your monthly AI usage allowance.

Current Usage: 1,800,000 tokens
Remaining: 200,000 tokens
Resets: February 1, 2026

To avoid interruption, consider upgrading your plan:
[Upgrade Now]

- The FlowForge Team
```

### Prerequisites
- Story 2.3 (usage tracking)
- Story 3.1 (notification table)

---

## Definition of Done

- [ ] NotificationService created
- [ ] 75% triggers in-app notification
- [ ] 90% triggers in-app + email
- [ ] No duplicate notifications
- [ ] Email uses Resend integration
- [ ] Integrated with usage logging

---

_Story Version 1.0 | Created 2026-01-13_
