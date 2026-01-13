# Story 3.3: Tenant Notification History View

**Epic:** billing-epic-3-notifications (Usage Notifications)
**Story ID:** billing-3-3-tenant-notification-history
**Status:** drafted
**Created:** 2026-01-13

---

## Story

**As a** tenant admin,
**I want** to view my notification history,
**So that** I can see past warnings and understand my usage patterns.

---

## Acceptance Criteria

### AC1: Notification List
**Given** the tenant admin is on their dashboard
**When** they navigate to Settings > Notifications
**Then** they see a list of past usage notifications

### AC2: Notification Details
**Given** the notification list is displayed
**When** viewing each notification
**Then** it shows:
- Type (75%, 90%, 100%)
- Date sent
- Delivery method (in-app, email, both)
- Acknowledged status

### AC3: Acknowledge Notification
**Given** an unacknowledged notification
**When** tenant clicks "Dismiss" or "Acknowledge"
**Then** the notification is marked as acknowledged
**And** it appears visually distinct (grayed out)

### AC4: Filter by Period
**Given** the notification list
**When** tenant has notifications from multiple periods
**Then** they can filter by billing period

---

## Tasks / Subtasks

- [ ] **1. Create Notifications Page**
  - [ ] 1.1 Create `app/dashboard/settings/notifications/page.tsx`
  - [ ] 1.2 Fetch notifications for tenant
  - [ ] 1.3 Display in list format

- [ ] **2. Create Notification List Component**
  - [ ] 2.1 Create NotificationList component
  - [ ] 2.2 Show type, date, method, status
  - [ ] 2.3 Visual distinction for acknowledged

- [ ] **3. Create API Endpoints**
  - [ ] 3.1 GET `/api/tenant/notifications` - list
  - [ ] 3.2 PATCH `/api/tenant/notifications/[id]/acknowledge`

- [ ] **4. Implement acknowledge**
  - [ ] 4.1 Update acknowledged_at timestamp
  - [ ] 4.2 Refresh list after acknowledge

- [ ] **5. Style and polish**
  - [ ] 5.1 Follow Pearl Vibrant design
  - [ ] 5.2 Add empty state
  - [ ] 5.3 Add loading state

---

## Dev Notes

### Page Layout

```
Settings > Notifications
┌─────────────────────────────────────────────────────┐
│ Usage Notifications                                 │
├─────────────────────────────────────────────────────┤
│ Filter: [All Periods ▼]                            │
├─────────────────────────────────────────────────────┤
│ 🟡 90% Warning                                     │
│ Jan 15, 2026 • Email + In-app        [Acknowledge] │
├─────────────────────────────────────────────────────┤
│ 🟢 75% Warning                          ✓ Viewed   │
│ Jan 10, 2026 • In-app                              │
└─────────────────────────────────────────────────────┘
```

### API Response

```typescript
interface NotificationResponse {
  id: string;
  type: '75_percent' | '90_percent' | '100_percent';
  sentAt: string;
  deliveryMethod: 'in_app' | 'email' | 'both';
  acknowledgedAt: string | null;
  billingPeriod: string;
}
```

### Prerequisites
- Story 3.1 (notification table)
- Story 3.2 (notifications being sent)

---

## Definition of Done

- [ ] Notifications page created
- [ ] Shows notification history
- [ ] Acknowledge functionality works
- [ ] Filter by period works
- [ ] Follows design system

---

_Story Version 1.0 | Created 2026-01-13_
