# Authentication & User Management System

> Technical Documentation for FlowForge User Administration
> Last Updated: 2025-12-17

## Overview

FlowForge implements an **admin-controlled user management system** where users are created manually by administrators rather than through public self-registration. This approach provides:

- Controlled access to the platform
- Automatic secure password generation
- Forced password change on first login
- Email notifications via Resend

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      Admin Dashboard                             │
│                 /dashboard/admin/users                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Routes                                    │
│  POST   /api/admin/users      → Create user                     │
│  PUT    /api/admin/users/[id] → Update user                     │
│  DELETE /api/admin/users/[id] → Delete user                     │
│  POST   /api/admin/users/[id] → Resend credentials              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│    Supabase Auth      │   │       Resend          │
│  (User Management)    │   │   (Email Delivery)    │
└───────────────────────┘   └───────────────────────┘
```

---

## 1. Manual User Creation (Admin Only)

### Admin Dashboard Interface

**Location**: `app/dashboard/admin/users/page.tsx`

The admin dashboard provides a full CRUD interface for user management:

- **View all users** with name, email, type, and creation date
- **Create new users** via modal dialog
- **Edit existing users** (name, email, user type)
- **Delete users** with confirmation
- **Resend credentials** to reset password and send new email

### Create User Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | Yes | User's display name |
| Email Address | Yes | Login email (must be unique) |
| User Type | Yes | `consultant`, `company`, or `admin` |
| Send Welcome Email | No | Checkbox, defaults to checked |

### API Endpoint

**POST** `/api/admin/users`

**Location**: `app/api/admin/users/route.ts`

**Request Body**:
```typescript
{
  email: string        // Required
  fullName: string     // Required
  userType: 'consultant' | 'company' | 'admin'  // Required
  sendWelcomeEmail?: boolean  // Optional, defaults to true
}
```

**Response** (Success - 201):
```typescript
{
  success: true,
  user: {
    id: string,
    email: string,
    fullName: string,
    userType: string
  },
  emailSent: boolean
}
```

### Authorization

The endpoint enforces admin-only access:

```typescript
// 1. Check authentication
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// 2. Verify admin role
const { data: profile } = await supabase
  .from('user_profiles')
  .select('user_type')
  .eq('id', user.id)
  .single()

if (profile?.user_type !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 2. Automatic Password Generation

### Password Generation Function

**Location**: `app/api/admin/users/route.ts` (lines 17-26)

```typescript
import { randomBytes } from 'crypto'

function generateTemporaryPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  const bytes = randomBytes(12)
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}
```

### Password Characteristics

| Property | Value |
|----------|-------|
| Length | 12 characters |
| Character Set | a-z, A-Z, 0-9, !@#$% |
| Entropy Source | Node.js `crypto.randomBytes()` |
| Security Level | Cryptographically secure |

### User Creation with Password

```typescript
const temporaryPassword = generateTemporaryPassword()

const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
  email: body.email,
  password: temporaryPassword,
  email_confirm: true,  // Auto-confirm email
  user_metadata: {
    full_name: body.fullName,
    user_type: body.userType,
    password_change_required: true,  // Force change on first login
  },
})
```

---

## 3. First-Login Password Change

### Detection Mechanism

When a user is created, their metadata includes:
```typescript
user_metadata: {
  password_change_required: true
}
```

### Dashboard Layout Guard

**Location**: `app/dashboard/layout.tsx` (lines 44-48)

The dashboard layout checks this flag and redirects if needed:

```typescript
// Check if password change is required
if (user.user_metadata?.password_change_required === true) {
  router.push('/auth/change-password')
  return
}
```

### Password Change Page

**Location**: `app/auth/change-password/page.tsx`

**Features**:

| Feature | Required Mode | Optional Mode |
|---------|---------------|---------------|
| Heading | "Change Your Password" | "Update Password" |
| Skip Button | Hidden | Visible |
| Cancel Link | Hidden | "Cancel and return to dashboard" |

**Validation Rules**:
- Minimum 8 characters
- New password and confirmation must match

### Password Update Flow

```typescript
const { error: updateError } = await supabase.auth.updateUser({
  password: formData.newPassword,
  data: {
    password_change_required: false,  // Clear the flag
  },
})

if (!updateError) {
  router.push('/dashboard')
}
```

### Flow Diagram

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  User Login  │ ──▶ │ Dashboard Load  │ ──▶ │ Check Metadata   │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                      │
                     ┌────────────────────────────────┴────────┐
                     │                                         │
                     ▼                                         ▼
        password_change_required                    password_change_required
              = true                                      = false
                     │                                         │
                     ▼                                         ▼
        ┌────────────────────────┐              ┌──────────────────────┐
        │ Redirect to            │              │ Allow access to      │
        │ /auth/change-password  │              │ Dashboard            │
        └───────────┬────────────┘              └──────────────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │ User changes password  │
        │ Flag set to false      │
        └───────────┬────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │ Redirect to Dashboard  │
        └────────────────────────┘
```

---

## 4. Email Notification System (Resend)

### Resend Configuration

**Location**: `lib/resend.ts`

```typescript
import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// Backward compatibility export
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResendClient() as any)[prop]
  }
})
```

**Environment Variable**: `RESEND_API_KEY`

**Package**: `resend@^6.4.2`

### Email Types

#### 1. Welcome Email (New User)

**Trigger**: User creation with `sendWelcomeEmail: true`

**Location**: `app/api/admin/users/route.ts` (lines 114-202)

```typescript
await resend.emails.send({
  from: 'FlowForge <admin@innovaas.co>',
  to: body.email,
  subject: 'Welcome to FlowForge - Your Account Details',
  html: `...`
})
```

**Email Contents**:
- FlowForge logo header
- Welcome message with user's name
- Credentials box with email and temporary password
- Security reminder to change password
- "Sign In to FlowForge" CTA button
- Footer with branding

#### 2. Credential Reset Email

**Trigger**: Admin clicks "Resend Credentials" button

**Location**: `app/api/admin/users/[id]/route.ts` (lines 245-354)

**Endpoint**: POST `/api/admin/users/[id]`

```typescript
// Generate new password
const temporaryPassword = generateTemporaryPassword()

// Update user with new password
await supabaseAdmin.auth.admin.updateUserById(id, {
  password: temporaryPassword,
  user_metadata: {
    ...user.user.user_metadata,
    password_change_required: true,  // Re-enable forced change
  },
})

// Send email
await resend.emails.send({
  from: 'FlowForge <admin@innovaas.co>',
  to: email,
  subject: 'FlowForge - Your New Login Credentials',
  html: `...`
})
```

#### 3. Stakeholder Invitation Email

**Trigger**: Adding stakeholder to a campaign

**Location**: `app/api/campaigns/[id]/stakeholders/route.ts`

```typescript
await resend.emails.send({
  from: 'Flow Forge <onboarding@resend.dev>',
  to: stakeholder.email,
  subject: `${campaign.facilitator_name} has invited you to participate...`,
  html: `...`
})
```

**Email Contents**:
- Personalized greeting
- Campaign and facilitator information
- Role and estimated time
- Interview topics overview
- "Start Your Interview" CTA button
- Token-based access URL

### Email Template Styling

All emails follow the Pearl Vibrant design system:

| Element | Color |
|---------|-------|
| Background | `#FFFEFB` |
| Card Background | `#FAF8F3` |
| Orange Accent | `#F25C05` |
| Border | `#E6E2D6` |
| Primary Text | `#171614` |
| Muted Text | `#71706B` |

---

## 5. Database Schema

### User Profiles Table

**Migration**: `supabase/migrations/20251118003_enhance_user_profiles.sql`

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT
    CHECK (user_type IN ('consultant', 'company', 'admin')),
  ADD COLUMN IF NOT EXISTS company_profile_id UUID
    REFERENCES company_profiles(id) ON DELETE SET NULL;
```

### User Metadata (Supabase Auth)

Stored in `auth.users.user_metadata`:

```typescript
{
  full_name: string,
  user_type: 'consultant' | 'company' | 'admin',
  password_change_required: boolean
}
```

---

## 6. Security Considerations

### Password Security

- **Entropy**: 12-character passwords with ~72 possible characters = ~74 bits of entropy
- **Generation**: Cryptographically secure via `crypto.randomBytes()`
- **Storage**: Hashed by Supabase Auth (bcrypt)
- **Forced Change**: Required on first login

### Access Control

- **Admin Operations**: All user CRUD requires `user_type = 'admin'`
- **Self-Deletion Prevention**: Users cannot delete their own accounts
- **Email Confirmation**: Auto-confirmed during creation (admin-verified)

### Token Security

- **Stakeholder Tokens**: 32-byte (256-bit) cryptographic tokens
- **URL-Safe**: Base64url encoding for safe URL transmission

---

## 7. File Reference

| Purpose | File Path |
|---------|-----------|
| Admin Users API | `app/api/admin/users/route.ts` |
| User Update/Delete/Resend API | `app/api/admin/users/[id]/route.ts` |
| Admin Dashboard UI | `app/dashboard/admin/users/page.tsx` |
| Dashboard Layout (Guard) | `app/dashboard/layout.tsx` |
| Password Change Page | `app/auth/change-password/page.tsx` |
| Login Page | `app/auth/login/page.tsx` |
| Resend Client | `lib/resend.ts` |
| Stakeholder Invitations | `app/api/campaigns/[id]/stakeholders/route.ts` |
| Email Template Component | `emails/stakeholder-invitation.tsx` |

---

## 8. Environment Variables

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API authentication |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin operations |

---

## 9. Common Operations

### Create a New User (Admin)

1. Navigate to `/dashboard/admin/users`
2. Click "Add User" button
3. Fill in name, email, and user type
4. Ensure "Send welcome email" is checked
5. Click "Create User"

### Reset User Password (Admin)

1. Navigate to `/dashboard/admin/users`
2. Find the user in the list
3. Click the mail icon (Resend Credentials)
4. Confirm the action
5. User receives new credentials email

### User First Login

1. User receives welcome email with temporary password
2. User logs in at `/auth/login`
3. System redirects to `/auth/change-password`
4. User sets new password (min 8 characters)
5. System redirects to dashboard

---

*Documentation generated for FlowForge authentication system*
