# Story 2.2: Add Tier Assignment to Tenant Profiles

**Epic:** billing-epic-2-tiers-limits (Subscription Tiers & Usage Limits)
**Story ID:** billing-2-2-add-tier-assignment-tenant-profiles
**Status:** review
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** to assign subscription tiers to tenant profiles,
**So that** each tenant has defined usage limits.

---

## Acceptance Criteria

### AC1: New Columns Added
**Given** the tenant_profiles table exists
**When** the migration runs
**Then** new columns are added:
- `tier_id` (UUID REFERENCES subscription_tiers) - assigned tier
- `usage_limit_override` (BIGINT NULL) - admin override
- `billing_period_start` (DATE) - current billing cycle start

### AC2: Default Tier Assignment
**Given** existing tenants have no tier_id
**When** the migration completes
**Then** all existing tenants default to 'starter' tier

### AC3: Admin Can View Tier
**Given** a platform admin views a tenant in admin dashboard
**When** they view tenant details
**Then** the current tier is displayed

### AC4: Admin Can Change Tier
**Given** a platform admin is on tenant detail page
**When** they change the tier assignment
**Then** the new tier is saved immediately
**And** usage limits update accordingly

### AC5: Admin Override
**Given** a tenant needs special treatment
**When** admin sets usage_limit_override
**Then** that value is used instead of tier limit
**And** admin can clear override to revert to tier limit

---

## Tasks / Subtasks

- [x] **1. Create migration**
  - [x] 1.1 Add tier_id column with FK to subscription_tiers
  - [x] 1.2 Add usage_limit_override column
  - [x] 1.3 Add billing_period_start column
  - [x] 1.4 Set default tier for existing tenants

- [x] **2. Create admin API endpoint**
  - [x] 2.1 Create PATCH `/api/admin/tenants/[id]/tier`
  - [x] 2.2 Accept tier_id and usage_limit_override
  - [x] 2.3 Validate admin authorization
  - [x] 2.4 Return updated tenant

- [ ] **3. Update admin UI** (deferred to Story 2.5)
  - [ ] 3.1 Add tier display to tenant detail page
  - [ ] 3.2 Add tier selector dropdown
  - [ ] 3.3 Add override input field
  - [ ] 3.4 Handle save/update

- [x] **4. Regenerate types**
  - [x] 4.1 Update database types (using inline interfaces)
  - [x] 4.2 Verify TenantProfile includes new fields (via API response)

---

## Dev Notes

### Migration SQL

```sql
ALTER TABLE tenant_profiles
  ADD COLUMN tier_id UUID REFERENCES subscription_tiers(id) ON DELETE SET NULL,
  ADD COLUMN usage_limit_override BIGINT,
  ADD COLUMN billing_period_start DATE DEFAULT CURRENT_DATE;

-- Set default tier (starter) for existing tenants
UPDATE tenant_profiles
SET tier_id = (SELECT id FROM subscription_tiers WHERE name = 'starter')
WHERE tier_id IS NULL;
```

### API Endpoint

```typescript
// PATCH /api/admin/tenants/[id]/tier
interface UpdateTierRequest {
  tierId: string;
  usageLimitOverride?: number | null;
}

// Response: Updated TenantProfile
```

### Prerequisites
- Story 2.1 (subscription_tiers table exists)

---

## Definition of Done

- [ ] Migration adds all columns
- [ ] Existing tenants assigned starter tier
- [ ] Admin API endpoint works
- [ ] Admin UI shows and updates tier
- [ ] Override functionality works

---

_Story Version 1.0 | Created 2026-01-13_
