# Story 2.5: Admin UI for Tier Management

**Epic:** billing-epic-2-tiers-limits (Subscription Tiers & Usage Limits)
**Story ID:** billing-2-5-admin-ui-tier-management
**Status:** in_progress
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** to view and manage subscription tiers in the admin dashboard,
**So that** I can configure pricing and limits.

---

## Acceptance Criteria

### AC1: Tier List Page
**Given** the admin is on the admin dashboard
**When** they navigate to Settings > Subscription Tiers
**Then** they see a list of all tiers with:
- Name
- Token limit
- Session limit
- Monthly price
- Active status

### AC2: Edit Tier
**Given** the admin clicks "Edit" on a tier
**When** they modify limits or pricing
**Then** changes are saved and reflected immediately

### AC3: Tenant Tier Display
**Given** the admin views a tenant's detail page
**When** they look at the subscription section
**Then** they see:
- Current tier name
- Usage percentage
- Token usage (current/limit)

### AC4: Tenant Tier Change
**Given** the admin is on tenant detail page
**When** they click change tier
**Then** a dropdown shows available tiers
**And** selecting one updates immediately

### AC5: Override Management
**Given** the admin is on tenant detail page
**When** they set/clear usage_limit_override
**Then** the override value is saved
**And** usage display reflects the override

---

## Tasks / Subtasks

- [ ] **1. Create Tier List Page**
  - [ ] 1.1 Create `app/dashboard/admin/settings/tiers/page.tsx`
  - [ ] 1.2 Fetch all tiers from API
  - [ ] 1.3 Display in data table
  - [ ] 1.4 Follow Pearl Vibrant design system

- [ ] **2. Create Tier Edit Modal**
  - [ ] 2.1 Create edit modal component
  - [ ] 2.2 Form with limit/price fields
  - [ ] 2.3 Save changes via API
  - [ ] 2.4 Show success/error feedback

- [ ] **3. Create Tier API Endpoints**
  - [ ] 3.1 GET `/api/admin/tiers` - list all
  - [ ] 3.2 PUT `/api/admin/tiers/[id]` - update tier
  - [ ] 3.3 Validate admin authorization

- [ ] **4. Update Tenant Detail Page**
  - [ ] 4.1 Add subscription section
  - [ ] 4.2 Show current tier and usage
  - [ ] 4.3 Add tier change dropdown
  - [ ] 4.4 Add override input

- [ ] **5. Style and polish**
  - [ ] 5.1 Apply consistent styling
  - [ ] 5.2 Add loading states
  - [ ] 5.3 Handle errors gracefully

---

## Dev Notes

### Page Layout

```
Settings > Subscription Tiers
┌─────────────────────────────────────────────────────┐
│ Subscription Tiers                          [+Add] │
├─────────────────────────────────────────────────────┤
│ Name       │ Token Limit │ Price   │ Status │ Edit │
│────────────┼─────────────┼─────────┼────────┼──────│
│ Starter    │ 500,000     │ $29/mo  │ Active │ [✎] │
│ Pro        │ 2,000,000   │ $99/mo  │ Active │ [✎] │
│ Enterprise │ 10,000,000  │ $499/mo │ Active │ [✎] │
└─────────────────────────────────────────────────────┘
```

### Tenant Subscription Section

```
Subscription
┌─────────────────────────────────────────────────────┐
│ Current Tier: Pro ▼                                │
│                                                     │
│ Usage: 1,500,000 / 2,000,000 tokens (75%)         │
│ [████████████████████░░░░░░░]                      │
│                                                     │
│ Override Limit: [________] tokens                  │
│ □ Enable override                                  │
└─────────────────────────────────────────────────────┘
```

### Prerequisites
- Story 2.1 (subscription_tiers table)
- Story 2.2 (tier assignment on tenant_profiles)

---

## Definition of Done

- [ ] Tier list page created
- [ ] Edit modal works
- [ ] Tenant detail shows tier info
- [ ] Tier change works
- [ ] Override management works
- [ ] Follows design system

---

_Story Version 1.0 | Created 2026-01-13_
