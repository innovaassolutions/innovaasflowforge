# Migration: Removing basePath and Moving to Subdomain

> Date: 2026-01-11
> Status: Completed

## Summary

FlowForge has migrated from a basePath-based URL structure to a dedicated subdomain:

| Before | After |
|--------|-------|
| `www.innovaas.co/flowforge/*` | `flowforge.innovaas.co/*` |

## Why This Change Was Made

### The Problem

The original setup used Next.js `basePath: '/flowforge'` to serve the app under the main Innovaas website. This worked for the main app but caused critical issues for **custom domain routing**:

1. **Custom domains couldn't work properly** - When a tenant's custom domain (e.g., `archetypequiz.leadingwithmeaning.com`) made a request to `/`, Vercel returned 404 because all routes were under `/flowforge/*`

2. **Middleware couldn't intercept requests** - The basePath configuration meant Vercel rejected requests outside `/flowforge/*` before middleware could run

3. **Complex rewrite rules** - Attempts to fix this with `vercel.json` rewrites created fragile configurations that broke asset loading

### The Solution

Moving to a dedicated subdomain (`flowforge.innovaas.co`) eliminates basePath entirely, allowing:
- Clean custom domain routing via middleware
- Standard Next.js URL structure (`/auth/login` instead of `/flowforge/auth/login`)
- Proper asset loading on all domains

## What Changed

### Code Changes

1. **next.config.js** - Removed `basePath: '/flowforge'`

2. **All internal links** - Updated from `/flowforge/*` to `/*`
   - 41 files modified
   - Example: `/flowforge/dashboard` → `/dashboard`

3. **External URLs** - Updated to new subdomain
   - Example: `www.innovaas.co/flowforge` → `flowforge.innovaas.co`

4. **Asset URLs** - Updated icon and image paths
   - `https://www.innovaas.co/icon-orb.svg` → `/icon-orb.svg`
   - `/flowforge/brand/*` → `/brand/*`

5. **GlobalHeader component** - Added custom domain detection to hide FlowForge branding on tenant domains

6. **Deleted vercel.json** - No longer needed for routing workarounds

### Database Changes

Updated `tenant_profiles.brand_config` to fix logo paths:
```sql
UPDATE tenant_profiles
SET brand_config = jsonb_set(
  brand_config,
  '{logo,url}',
  to_jsonb(replace(brand_config->'logo'->>'url', '/flowforge/', '/'))
)
WHERE brand_config->'logo'->>'url' LIKE '%/flowforge/%';
```

## Required External Configuration

### 1. DNS Configuration

Add CNAME record for the new subdomain:

| Type | Name | Value |
|------|------|-------|
| CNAME | flowforge | cname.vercel-dns.com |

### 2. Vercel Domain Configuration

Add `flowforge.innovaas.co` as a domain in Vercel project settings:
- Go to **Vercel Dashboard → Project → Settings → Domains**
- Add `flowforge.innovaas.co`

### 3. Supabase Auth Configuration

Update authentication URLs in Supabase Dashboard:
- Go to **Authentication → URL Configuration**
- **Site URL**: `https://flowforge.innovaas.co`
- **Redirect URLs**: Add `https://flowforge.innovaas.co/**`

### 4. Main Website Redirect (innovaas.co)

Update the main Innovaas website to redirect old URLs to the new subdomain.

**If using Vercel**, add to `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/flowforge/:path*",
      "destination": "https://flowforge.innovaas.co/:path*",
      "permanent": true
    }
  ]
}
```

**If using other hosting**, configure a 301 redirect from:
- `www.innovaas.co/flowforge/*` → `flowforge.innovaas.co/*`

### 5. OAuth Provider Updates (if applicable)

Update redirect URLs in any OAuth providers (Google, etc.):
- Old: `https://www.innovaas.co/flowforge/auth/callback`
- New: `https://flowforge.innovaas.co/auth/callback`

### 6. ElevenLabs Voice Agent Configuration

If using voice features, update the Custom LLM URL in ElevenLabs:
- Old: `https://innovaas.co/flowforge/api/voice/chat/completions`
- New: `https://flowforge.innovaas.co/api/voice/chat/completions`

## URL Mapping Reference

| Old URL | New URL |
|---------|---------|
| `www.innovaas.co/flowforge` | `flowforge.innovaas.co` |
| `www.innovaas.co/flowforge/auth/login` | `flowforge.innovaas.co/auth/login` |
| `www.innovaas.co/flowforge/dashboard` | `flowforge.innovaas.co/dashboard` |
| `www.innovaas.co/flowforge/coach/[slug]` | `flowforge.innovaas.co/coach/[slug]` |
| `www.innovaas.co/flowforge/api/*` | `flowforge.innovaas.co/api/*` |

## Custom Domain Routing

Custom domains (e.g., `archetypequiz.leadingwithmeaning.com`) now work correctly:

1. Request arrives at custom domain
2. Middleware detects non-system domain
3. Looks up tenant by domain in `tenant_profiles.custom_domain`
4. Rewrites internally to `/coach/[slug]/*`
5. Tenant's branded page renders without FlowForge chrome

## Rollback Plan

If issues arise, to rollback:

1. Restore `basePath: '/flowforge'` in `next.config.js`
2. Revert all `/flowforge` path references
3. Re-add `vercel.json` routing rules
4. Update Supabase Site URL back to old value

Note: Custom domain routing will not work with basePath restored.

## Related Commits

- `feat: Remove basePath, use flowforge.innovaas.co subdomain`
- `fix: Update asset URLs after basePath removal`
- `fix: Hide GlobalHeader on custom domains`

## Questions?

Contact the development team if you encounter issues with:
- 404 errors on any FlowForge pages
- Broken images or assets
- Authentication redirect loops
- Custom domain not loading tenant branding
