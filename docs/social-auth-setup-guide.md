# Social Authentication Setup Guide

> Complete guide for configuring Google, Microsoft, and GitHub OAuth providers in Supabase

## Overview

FlowForge supports three social authentication providers:
- **Google** - OAuth 2.0 via Google Cloud Console
- **Microsoft** - OAuth 2.0 via Azure Active Directory
- **GitHub** - OAuth 2.0 via GitHub Developer Settings

**Status**: Social auth buttons are implemented in the UI. This guide will walk you through completing the OAuth provider configuration.

---

## Prerequisites

Before starting, ensure you have:
- ✅ Admin access to your Supabase project
- ✅ Access to Google Cloud Console (for Google OAuth)
- ✅ Access to Azure Portal (for Microsoft OAuth)
- ✅ GitHub account (for GitHub OAuth)

---

## Step 1: Configure Redirect URLs in Supabase

**These URLs tell OAuth providers where to send users after authentication.**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication > URL Configuration**
3. Add the following URLs:

### Redirect URLs
Add your production domain:
```
https://innovaasflowforge.vercel.app/**
```

### Site URL (optional but recommended)
Update from `http://localhost:3000` to:
```
https://innovaasflowforge.vercel.app
```

4. Click **Save**

---

## Step 2: Get Your Supabase Callback URL

You'll need this URL for all three OAuth provider configurations.

**Your Supabase callback URL is:**
```
https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback
```

> **Finding your callback URL**: Go to Supabase Dashboard > Settings > API. Your callback URL is: `https://[PROJECT-REF].supabase.co/auth/v1/callback`

---

## Step 3: Configure Google OAuth

### 3.1 Create OAuth Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing project
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**

### 3.2 Configure OAuth Consent Screen (if first time)

If prompted to configure consent screen:
1. Click **Configure Consent Screen**
2. Select **External** user type
3. Fill in required fields:
   - **App name**: FlowForge
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue** through all steps

### 3.3 Create OAuth Client ID

1. **Application type**: Web application
2. **Name**: FlowForge Production
3. **Authorized JavaScript origins** (optional):
   ```
   https://innovaasflowforge.vercel.app
   ```
4. **Authorized redirect URIs**:
   ```
   https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback
   ```
5. Click **Create**
6. **Copy the Client ID and Client Secret** - you'll need these next

### 3.4 Enable Google Provider in Supabase

1. Go to Supabase Dashboard > **Authentication > Providers**
2. Find **Google** in the list
3. Toggle to **Enable**
4. Paste your credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. Click **Save**

**Google OAuth is now configured!** ✅

---

## Step 4: Configure Microsoft (Azure) OAuth

### 4.1 Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory**
3. Click **App registrations** in left sidebar
4. Click **New registration**

### 4.2 Configure App Registration

1. **Name**: FlowForge
2. **Supported account types**:
   - Select "Accounts in any organizational directory and personal Microsoft accounts"
3. **Redirect URI**:
   - Platform: **Web**
   - URI: `https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback`
4. Click **Register**

### 4.3 Get Application (Client) ID

After registration, you'll see the **Overview** page:
1. **Copy the Application (client) ID** - you'll need this for Supabase

### 4.4 Create Client Secret

1. In left sidebar, click **Certificates & secrets**
2. Click **New client secret**
3. **Description**: FlowForge Production
4. **Expires**: Choose expiration (recommended: 24 months)
5. Click **Add**
6. **Copy the Value immediately** - it won't be shown again!

### 4.5 Enable Azure Provider in Supabase

1. Go to Supabase Dashboard > **Authentication > Providers**
2. Find **Azure** in the list
3. Toggle to **Enable**
4. Paste your credentials:
   - **Application (client) ID**: (from Azure Portal)
   - **Client Secret**: (the Value you copied)
5. Click **Save**

**Microsoft OAuth is now configured!** ✅

---

## Step 5: Configure GitHub OAuth

### 5.1 Create OAuth App in GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** in left sidebar
3. Click **New OAuth App**

### 5.2 Configure OAuth App

1. **Application name**: FlowForge
2. **Homepage URL**:
   ```
   https://innovaasflowforge.vercel.app
   ```
3. **Application description** (optional):
   ```
   AI-powered Digital Transformation Readiness Assessment Platform
   ```
4. **Authorization callback URL**:
   ```
   https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback
   ```
5. Click **Register application**

### 5.3 Get Client Credentials

After registration:
1. **Copy the Client ID** - shown on the app page
2. Click **Generate a new client secret**
3. **Copy the Client Secret** - it won't be shown again!

### 5.4 Enable GitHub Provider in Supabase

1. Go to Supabase Dashboard > **Authentication > Providers**
2. Find **GitHub** in the list
3. Toggle to **Enable**
4. Paste your credentials:
   - **Client ID**: (from GitHub)
   - **Client Secret**: (from GitHub)
5. Click **Save**

**GitHub OAuth is now configured!** ✅

---

## Step 6: Test Social Authentication

Once all providers are configured, test each one:

### Testing Checklist

1. **Google Login**:
   - Go to `https://innovaasflowforge.vercel.app/auth/login`
   - Click "Continue with Google"
   - Select Google account
   - Should redirect to dashboard after authentication

2. **Microsoft Login**:
   - Click "Continue with Microsoft"
   - Enter Microsoft credentials
   - Should redirect to dashboard after authentication

3. **GitHub Login**:
   - Click "Continue with GitHub"
   - Authorize the application
   - Should redirect to dashboard after authentication

### Common Issues & Solutions

**Issue**: "Redirect URI mismatch"
- **Solution**: Verify the callback URL exactly matches in both the provider settings and Supabase

**Issue**: "OAuth provider not enabled"
- **Solution**: Ensure provider is toggled to "Enabled" in Supabase dashboard

**Issue**: "Invalid client credentials"
- **Solution**: Double-check Client ID and Client Secret are copied correctly

---

## Security Best Practices

1. **Client Secrets**:
   - Store securely - never commit to version control
   - Rotate periodically (every 6-12 months)
   - Use different secrets for development/production

2. **Redirect URLs**:
   - Only whitelist your actual domains
   - Use HTTPS in production (never HTTP)
   - Be specific with redirect URLs

3. **Scopes**:
   - Only request necessary permissions
   - Supabase handles basic profile scopes by default

---

## Additional Configuration (Optional)

### Add Development URLs (for local testing)

If you want to test OAuth locally:

1. Add to Supabase Redirect URLs:
   ```
   http://localhost:3000/**
   ```

2. Add localhost callback to each OAuth provider:
   ```
   https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback
   ```
   (Same URL - Supabase handles the redirect to localhost)

### Customize OAuth Scopes

By default, Supabase requests basic profile information. To customize:

1. Go to Supabase Dashboard > **Authentication > Providers**
2. Click on the provider
3. Add custom scopes in the **Scopes** field

---

## Reference Information

### File Locations
- Social auth button component: `components/social-auth-buttons.tsx`
- Login page: `app/auth/login/page.tsx`
- Signup page: `app/auth/signup/page.tsx`
- Auth callback handler: `app/auth/callback/route.ts`

### Supabase Project Details
- Project URL: `https://tlynzgbxrnujphaatagu.supabase.co`
- Callback URL: `https://tlynzgbxrnujphaatagu.supabase.co/auth/v1/callback`

### Production Domain
- Vercel URL: `https://innovaasflowforge.vercel.app`

---

## Completion Checklist

Mark tasks as complete when finished:

- [ ] Step 1: Redirect URLs configured in Supabase
- [ ] Step 2: Callback URL identified
- [ ] Step 3: Google OAuth configured
  - [ ] OAuth client created in Google Cloud Console
  - [ ] Credentials added to Supabase
  - [ ] Tested Google login
- [ ] Step 4: Microsoft OAuth configured
  - [ ] App registration created in Azure Portal
  - [ ] Client secret generated
  - [ ] Credentials added to Supabase
  - [ ] Tested Microsoft login
- [ ] Step 5: GitHub OAuth configured
  - [ ] OAuth app created in GitHub
  - [ ] Client secret generated
  - [ ] Credentials added to Supabase
  - [ ] Tested GitHub login
- [ ] Step 6: All social auth providers tested successfully

---

## Support & Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**Last Updated**: November 17, 2025
**Status**: Configuration pending - UI implementation complete
