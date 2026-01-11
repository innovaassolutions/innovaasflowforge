# OAuth Production Configuration Guide

> Date: 2026-01-11 (Updated)
> For: FlowForge at flowforge.innovaas.co subdomain

## Architecture Overview

**User Access:**
- Users visit: `https://flowforge.innovaas.co`
- Content served directly from Vercel deployment
- No basePath or proxy configuration needed

**Technical Setup:**
- FlowForge app deployed to dedicated subdomain `flowforge.innovaas.co`
- All OAuth callbacks use the subdomain directly
- Clean URL structure without `/flowforge` prefix

## Configuration Steps

### Step 1: Vercel Environment Variables

**Location:** Vercel Dashboard → `innovaasflowforge` project → Settings → Environment Variables

**Add this variable:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://flowforge.innovaas.co` | Production |

**Important Notes:**
- Use `https://` (not `http://`)
- Use `flowforge.innovaas.co` subdomain
- NO trailing slash

### Step 2: Supabase Authentication Configuration

**Location:** Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://flowforge.innovaas.co
```

**Redirect URLs (add ALL of these):**
```
https://flowforge.innovaas.co/auth/callback
https://flowforge.innovaas.co/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

**Why we need localhost URLs:**
- Keep them for local development
- When you run `npm run dev` locally, you still want OAuth to work

### Step 3: Supabase OAuth Provider Settings

**Location:** Supabase Dashboard → Authentication → Providers

For **each provider** (Google, Microsoft, GitHub):

1. **Authorized Redirect URIs** should include:
   ```
   https://flowforge.innovaas.co/auth/v1/callback
   https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback
   http://localhost:3000/auth/v1/callback
   ```

2. **Authorized JavaScript Origins** (if applicable):
   ```
   https://flowforge.innovaas.co
   http://localhost:3000
   ```

### Step 4: Redeploy on Vercel

After setting environment variables:

**Option A: Manual Redeploy**
1. Go to Vercel Dashboard → Deployments
2. Click "..." menu on latest deployment
3. Click "Redeploy"

**Option B: Auto-deploy via Git**
1. Push any change to your GitHub repo
2. Vercel will auto-deploy with new env vars

### Step 5: Clear Browser Cache & Test

1. **Hard refresh browser:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear cookies:** DevTools → Application → Clear site data
3. **Test OAuth flow:**
   - Go to `https://flowforge.innovaas.co`
   - Click "Sign in with Google"
   - Should redirect to Google, then back to `https://flowforge.innovaas.co/auth/callback`
   - Should NOT see `localhost:3000` anywhere

## Verification Checklist

After configuration:

- [ ] Vercel env var `NEXT_PUBLIC_APP_URL` set to `https://flowforge.innovaas.co`
- [ ] Supabase Site URL set to `https://flowforge.innovaas.co`
- [ ] Supabase Redirect URLs include subdomain
- [ ] Google OAuth redirect URIs include subdomain
- [ ] Microsoft OAuth redirect URIs include subdomain
- [ ] GitHub OAuth redirect URIs include subdomain
- [ ] Vercel redeployed with new environment variables
- [ ] Browser cache cleared
- [ ] OAuth login tested and working

## Common Issues

### Issue: Still redirecting to localhost

**Cause:** Vercel environment variable not set or deployment hasn't picked it up

**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Verify `NEXT_PUBLIC_APP_URL` is set for Production
3. Trigger a new deployment
4. Hard refresh browser

### Issue: OAuth callback fails with 401/403

**Cause:** Redirect URL not authorized in OAuth provider settings

**Fix:**
1. Go to Google/Microsoft/GitHub OAuth app settings
2. Add `https://flowforge.innovaas.co/auth/v1/callback` to authorized redirects
3. Try again

### Issue: After OAuth, user sees "Error loading campaigns"

**Cause:** User profile not found or admin check failing (separate issue - see postmortem doc)

**Fix:**
1. Check server logs for profile lookup errors
2. Verify user exists in `user_profiles` table
3. Run diagnostic script: `npx tsx scripts/diagnose-campaign-issue.ts`

## Architecture Diagram

```
User Browser
    ↓
https://flowforge.innovaas.co/auth/login
    ↓ (OAuth redirect)
Google/Microsoft/GitHub
    ↓ (callback)
https://flowforge.innovaas.co/auth/callback
    ↓ (Supabase auth completes)
User authenticated & redirected to dashboard
```

## Environment Variables Reference

**Development (.env.local):**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_APP_URL=https://flowforge.innovaas.co
```

**Why they're different:**
- Local dev runs on `localhost:3000`
- Production runs at `flowforge.innovaas.co` subdomain

## Migration Note

As of January 2026, FlowForge moved from a basePath configuration (`www.innovaas.co/flowforge`) to a dedicated subdomain (`flowforge.innovaas.co`). This simplifies OAuth configuration as:

- No proxy layer required
- No basePath in URLs
- Direct Vercel deployment
- Cleaner custom domain support

See `docs/migration-basepath-removal.md` for full migration details.

---

*Reference: See `docs/postmortem-campaign-visibility-issue.md` for related data access issues*
