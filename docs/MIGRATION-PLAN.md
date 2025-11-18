# Multi-Tenancy Migration Plan

**Date**: 2025-11-18
**Status**: Ready for Execution
**Risk Level**: Medium (schema changes, data backfill required)

---

## Overview

This migration transforms the system from user-level organizations to campaign-level company profiles, supporting two distinct user types:

- **Consultants**: Manage multiple client companies, billed per campaign
- **Companies**: Manage their own organization, buy campaign packages

---

## Migration Files (Execution Order)

### 1. `20251118001_create_company_profiles.sql`
**Purpose**: Create company_profiles table

**Changes**:
- Creates `company_profiles` table with company information
- Adds RLS policies for company access control
- Consultants can create many, company users create one

**Risk**: Low - New table, no dependencies

---

### 2. `20251118002_create_stakeholder_profiles.sql`
**Purpose**: Create reusable stakeholder profiles

**Changes**:
- Creates `stakeholder_profiles` table
- Links stakeholders to companies (not campaigns)
- Enforces email uniqueness per company
- Adds RLS policies for stakeholder management

**Risk**: Low - New table, depends on company_profiles

---

### 3. `20251118003_enhance_user_profiles.sql`
**Purpose**: Add user type and company link to user_profiles

**Changes**:
- Adds `user_type` column ('consultant' | 'company')
- Adds `company_profile_id` column (for company users only)
- Makes `organization_id` nullable (deprecated)

**Risk**: Low - Additive changes only, backward compatible

---

### 4. `20251118004_update_campaigns.sql`
**Purpose**: Link campaigns to company profiles

**Changes**:
- Adds `company_profile_id` to campaigns table
- Removes `organization_id` column
- Updates RLS policies to use company-based access

**Risk**: Medium - Removes column, updates RLS (backfill handles data)

---

### 5. `20251118005_rename_to_campaign_assignments.sql`
**Purpose**: Rename stakeholder_sessions to campaign_assignments

**Changes**:
- Renames `stakeholder_sessions` → `campaign_assignments`
- Adds `stakeholder_profile_id` reference
- Updates RLS policies for facilitator + token access
- Preserves existing columns for backward compatibility

**Risk**: Medium - Table rename, updates RLS policies

---

### 6. `20251118006_cleanup_organization_functions.sql`
**Purpose**: Remove old organization-based logic

**Changes**:
- Removes `handle_new_user()` trigger (old organization auto-creation)
- Removes `current_user_organization_id()` function
- Removes `user_has_permission()` function
- Adds simplified `handle_new_user_simple()` trigger (no organization)

**Risk**: Low - Cleanup only, new trigger handles signup

---

### 7. `20251118007_backfill_existing_data.sql`
**Purpose**: Migrate existing data to new structure

**Changes**:
- Creates company_profiles from existing campaign.company_name
- Links campaigns to new company_profiles
- Creates stakeholder_profiles from existing campaign_assignments
- Links campaign_assignments to stakeholder_profiles

**Risk**: Medium - Data migration, idempotent (safe to re-run)

---

## Pre-Migration Checklist

- [ ] Database backup completed
- [ ] All migrations reviewed and approved
- [ ] Development environment tested
- [ ] Rollback plan documented

---

## Execution Steps

### Option 1: Supabase CLI (Recommended)
```bash
# Apply all migrations
supabase db push

# Or apply individually for testing:
supabase db push --file supabase/migrations/20251118001_create_company_profiles.sql
# ... repeat for each migration
```

### Option 2: Supabase Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Run each migration file in order (001 through 007)
3. Verify success after each migration

### Option 3: MCP Tool
```typescript
// Use Supabase MCP to apply migrations
mcp__supabase__apply_migration({
  project_id: "your-project-id",
  name: "create_company_profiles",
  query: "-- contents of migration file --"
})
```

---

## Post-Migration Verification

### 1. Check Table Creation
```sql
-- Should return 7 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles',
    'company_profiles',
    'stakeholder_profiles',
    'campaigns',
    'campaign_assignments'
  );
```

### 2. Verify Data Migration
```sql
-- All campaigns should have company_profile_id
SELECT COUNT(*) FROM campaigns WHERE company_profile_id IS NULL;
-- Expected: 0

-- All assignments should have stakeholder_profile_id
SELECT COUNT(*) FROM campaign_assignments WHERE stakeholder_profile_id IS NULL;
-- Expected: 0

-- Check counts
SELECT
  (SELECT COUNT(*) FROM company_profiles) as companies,
  (SELECT COUNT(*) FROM stakeholder_profiles) as stakeholders,
  (SELECT COUNT(*) FROM campaigns) as campaigns,
  (SELECT COUNT(*) FROM campaign_assignments) as assignments;
```

### 3. Test RLS Policies
```sql
-- Test as a user (set role)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- Should see only their companies
SELECT * FROM company_profiles;

-- Should see only their campaigns
SELECT * FROM campaigns;
```

---

## Rollback Plan

If issues occur, rollback by:

### 1. Restore from Backup
```bash
# Restore entire database from pre-migration backup
supabase db restore backup-timestamp
```

### 2. Or Manual Rollback (reverse order)
```sql
-- 1. Rename table back
ALTER TABLE campaign_assignments RENAME TO stakeholder_sessions;

-- 2. Restore organization_id to campaigns
ALTER TABLE campaigns ADD COLUMN organization_id UUID;

-- 3. Drop new tables
DROP TABLE stakeholder_profiles CASCADE;
DROP TABLE company_profiles CASCADE;

-- 4. Revert user_profiles
ALTER TABLE user_profiles DROP COLUMN user_type;
ALTER TABLE user_profiles DROP COLUMN company_profile_id;

-- 5. Restore old trigger (if needed)
-- ... restore handle_new_user() from git history
```

---

## Known Limitations

### During Migration:
- Existing stakeholders will have profiles created automatically
- Default industry set to "Manufacturing" (can be updated manually)
- Default market_scope set to "national" (can be updated manually)

### After Migration:
- Old columns preserved for compatibility:
  - `campaign_assignments.stakeholder_name` (deprecated, use profile)
  - `campaign_assignments.stakeholder_email` (deprecated, use profile)
  - `user_profiles.organization_id` (deprecated, use company_profile_id)

---

## Next Steps After Migration

1. **Update Application Code**:
   - Update signup flow to choose user_type
   - Build company profile management UI
   - Build stakeholder profile management UI
   - Update campaign creation flow

2. **Test Flows**:
   - Consultant signup → create company → add stakeholders → create campaign
   - Company signup → manage stakeholders → create campaign
   - Stakeholder access via token

3. **Deploy Code Changes**:
   - Update API routes
   - Update dashboard queries
   - Update interview agent
   - Update synthesis agent

---

## Support

If issues occur during migration:
1. Check Supabase logs for error details
2. Run verification queries to identify specific issues
3. Rollback if necessary
4. Review migration files for conflicts

---

**Status**: ✅ Ready for execution
**Estimated Downtime**: 2-5 minutes
**Reversibility**: High (backup + rollback plan)
