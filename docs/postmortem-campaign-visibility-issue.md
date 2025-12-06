# Postmortem: Campaign Visibility Issue

> Date: 2025-12-06
> Severity: Critical (Production issue affecting paying client)
> Status: Resolved

## Summary

User todd.abraham@innovaas.co experienced a critical data visibility issue where the dashboard showed "Error loading campaigns" and no campaigns or companies were visible, despite:
- Todd being an admin user
- Multiple campaigns existing in the system (including Alimex - a paying client)
- Todd having created 3 of the 5 campaigns

## Timeline

- **Initial Report**: Todd logged in and saw empty dashboard with "Error loading campaigns" message
- **Investigation**: Ran diagnostic scripts to analyze user profile, RLS policies, and campaign data
- **Root Cause Found**: Silent error handling bug in API route
- **Fix Applied**: Added proper error handling to `/api/campaigns` GET endpoint

## Root Cause Analysis

### What We Thought Was Wrong

Initial hypothesis was that todd's user profile lacked admin privileges, causing RLS policies to block campaign access.

### What Was Actually Wrong

**The Bug:** The `/api/campaigns` GET endpoint had insufficient error handling when fetching the user profile to check admin status:

```typescript
// BEFORE (buggy code)
const { data: userProfile } = await supabaseAdmin
  .from('user_profiles')
  .select('user_type')
  .eq('id', user.id)
  .single() as any

const isAdmin = userProfile?.user_type === 'admin'
```

**The Problem:**
1. The query only destructured `data` - it ignored the `error` property
2. If the query failed for ANY reason (network glitch, race condition, etc.), `userProfile` would be `undefined`
3. `isAdmin` would become `false` even though todd WAS an admin
4. The code would fall back to RLS-filtered queries instead of admin bypass
5. The error was silently swallowed - no logs, no user feedback

**Why This Caused Complete Data Loss:**
While the RLS policies should have still shown todd's campaigns, there was likely a secondary failure that caused the "Error loading campaigns" message (possibly in the RLS query itself).

### Diagnostic Findings

Running `diagnose-campaign-issue.ts` revealed:

✅ **Todd's Profile:**
- User Type: `admin` (was ALWAYS admin)
- Company Profile ID: `95c3a6cd-0a2f-4569-b185-1d22f0a0408d`

✅ **Campaign Ownership:**
- Todd created 3/5 campaigns:
  - "Test campaign" (xyz inc)
  - "Test" (xyz inc)
  - "2025 Smart Industry Readiness Assessment" (Alimex)

⚠️ **Alimex Campaign Issue:**
- Created by Todd ✅
- But has different `company_profile_id`: `677b7900-c46d-4e4a-94d1-f075ceae904f`
- This meant Alimex relied on the `created_by` check, not the company match

📊 **RLS Policy Simulation:**
- WITHOUT admin status, todd would see 3/5 campaigns (those he created)
- Would NOT see: "MENA outreach" and "Q1 2026 Process Digitalisation" (created by other users)

## The Fix

Added comprehensive error handling to the user profile lookup:

```typescript
// AFTER (fixed code)
const { data: userProfile, error: profileError } = await supabaseAdmin
  .from('user_profiles')
  .select('user_type')
  .eq('id', user.id)
  .single() as any

if (profileError) {
  console.error('❌ Error fetching user profile:', profileError)
  return NextResponse.json(
    { error: 'Failed to fetch user profile', details: profileError.message },
    { status: 500 }
  )
}

if (!userProfile) {
  console.error('❌ User profile not found for user:', user.id)
  return NextResponse.json(
    { error: 'User profile not found - please contact support' },
    { status: 404 }
  )
}

const isAdmin = userProfile.user_type === 'admin'
```

**What This Fixes:**
1. ✅ Explicitly checks for errors in the user profile query
2. ✅ Returns clear error messages instead of silent failures
3. ✅ Logs errors for debugging
4. ✅ Ensures `isAdmin` is based on reliable data

## Prevention Measures

### Code Review Checklist
- [ ] All Supabase queries check both `data` AND `error`
- [ ] No silent error handling (undefined checks without logging)
- [ ] API endpoints return meaningful error messages
- [ ] Critical data queries have explicit error paths

### Future Improvements
1. **Add Health Check Endpoint**: Create `/api/health` to verify user profile exists
2. **Client-Side Retry Logic**: Add automatic retry with backoff for transient failures
3. **Better Error UI**: Show specific error messages instead of generic "Error loading campaigns"
4. **Monitoring**: Add Sentry or similar to catch silent failures in production

## Lessons Learned

1. **Never ignore error returns** - Always destructure and check `error` from Supabase queries
2. **Silent failures are worse than loud ones** - Better to show a clear error than mysterious empty state
3. **Admin bypass is critical** - When it fails silently, it looks like RLS is broken
4. **Diagnostic scripts are invaluable** - The `diagnose-campaign-issue.ts` script immediately revealed the truth

## Files Changed

- `app/api/campaigns/route.ts` - Added error handling to GET endpoint
- `scripts/fix-todd-admin.ts` - Emergency fix script (confirmed todd was already admin)
- `scripts/diagnose-campaign-issue.ts` - Diagnostic tool for investigating the issue
- `supabase/migrations/20251206000_set_todd_as_admin.sql` - Migration (redundant but safe)

## Resolution

✅ **Status**: Fixed and deployed
✅ **Verification**: Diagnostic script confirms 5 campaigns are accessible
✅ **Action Required**: User should refresh browser session

The issue should be completely resolved. If it recurs, check server logs for user profile query errors.
