# OAuth Production Configuration Guide

> Date: 2025-12-06
> For: FlowForge proxied through www.innovaas.co/flowforge

## Architecture Overview

**User Access:**
- Users visit: `https://www.innovaas.co/flowforge`
- URL stays: `https://www.innovaas.co/flowforge/*` (never changes)
- Content proxied from: `https://innovaasflowforge.vercel.app`

**Technical Setup:**
- Main website (`www.innovaas.co`) proxies `/flowforge` path to FlowForge app
- FlowForge app has `basePath: '/flowforge'` configured in `next.config.js`
- All OAuth callbacks MUST use the custom domain, not the Vercel URL

## Current Problem

OAuth redirect is trying to go to `http://localhost:3000` instead of `https://www.innovaas.co/flowforge`

## Configuration Steps

### Step 1: Vercel Environment Variables

**Location:** Vercel Dashboard → `innovaasflowforge` project → Settings → Environment Variables

**Add this variable:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://www.innovaas.co/flowforge` | Production |

**Important Notes:**
- ✅ Include `/flowforge` in the URL (matches your basePath)
- ✅ Use `https://` (not `http://`)
- ✅ Use `www.innovaas.co` (not the Vercel URL)
- ✅ NO trailing slash

### Step 2: Supabase Authentication Configuration

**Location:** Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://www.innovaas.co/flowforge
```

**Redirect URLs (add ALL of these):**
```
https://www.innovaas.co/flowforge/auth/callback
https://www.innovaas.co/flowforge/*
http://localhost:3000/auth/callback
http://localhost:3000/*
```

**Why we need localhost URLs:**
- Keep them for local development
- When you run `npm run dev` locally, you still want OAuth to work

### Step 3: Supabase OAuth Provider Settings

**Location:** Supabase Dashboard → Authentication → Providers

For **each provider** (Google, Microsoft, GitHub):

1. **Authorized Redirect URIs** should include:
   ```
   https://www.innovaas.co/flowforge/auth/v1/callback
   https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback
   http://localhost:3000/auth/v1/callback
   ```

2. **Authorized JavaScript Origins** (if applicable):
   ```
   https://www.innovaas.co
   https://innovaasflowforge.vercel.app
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
   - Go to `https://www.innovaas.co/flowforge`
   - Click "Sign in with Google"
   - Should redirect to Google, then back to `https://www.innovaas.co/flowforge/auth/callback`
   - Should NOT see `localhost:3000` anywhere

## Verification Checklist

After configuration:

- [ ] Vercel env var `NEXT_PUBLIC_APP_URL` set to `https://www.innovaas.co/flowforge`
- [ ] Supabase Site URL set to `https://www.innovaas.co/flowforge`
- [ ] Supabase Redirect URLs include custom domain
- [ ] Google OAuth redirect URIs include custom domain
- [ ] Microsoft OAuth redirect URIs include custom domain
- [ ] GitHub OAuth redirect URIs include custom domain
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
2. Add `https://www.innovaas.co/flowforge/auth/v1/callback` to authorized redirects
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
https://www.innovaas.co/flowforge/auth/login
    ↓ (proxy via main website)
https://innovaasflowforge.vercel.app/flowforge/auth/login
    ↓ (OAuth redirect)
Google/Microsoft/GitHub
    ↓ (callback)
https://www.innovaas.co/flowforge/auth/callback
    ↓ (proxy via main website)
https://innovaasflowforge.vercel.app/flowforge/auth/callback
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
NEXT_PUBLIC_APP_URL=https://www.innovaas.co/flowforge
```

**Why they're different:**
- Local dev runs on `localhost:3000` without basePath
- Production runs through proxy at `www.innovaas.co/flowforge` with basePath

## Next Steps

1. Follow Steps 1-5 above
2. Test OAuth login with Google
3. If working, test Microsoft and GitHub
4. Document any additional issues that come up
5. Update this guide as needed

---

*Reference: See `docs/postmortem-campaign-visibility-issue.md` for related data access issues*
