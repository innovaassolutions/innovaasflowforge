# White-Label Branding Architecture

> Version: 1.0.0
> Last Updated: 2025-01-05
> Status: Planning

## Overview

This document outlines the white-label branding architecture for FlowForge, enabling coaches like Mark Nickerson (Leading with Meaning) to provide branded experiences for their clients while FlowForge remains the underlying SaaS platform.

---

## Database Schema

### New Table: `coach_profiles`

```sql
CREATE TABLE coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,  -- 'leadingwithmeaning', 'marknickerson'
  display_name TEXT NOT NULL, -- 'Leading with Meaning'

  -- Contact
  email TEXT NOT NULL,
  website_url TEXT,

  -- Branding Configuration
  brand_config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Assessment Types Enabled
  enabled_assessments TEXT[] DEFAULT ARRAY['archetype'],

  -- Subscription/Tier
  tier TEXT DEFAULT 'standard', -- 'standard', 'professional', 'enterprise'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE UNIQUE INDEX idx_coach_profiles_slug ON coach_profiles(slug);
CREATE INDEX idx_coach_profiles_user ON coach_profiles(user_id);
```

### `brand_config` JSONB Structure

```typescript
interface BrandConfig {
  // Visual Identity
  logo: {
    url: string;           // Full logo URL (Supabase Storage)
    alt: string;           // Alt text
    width?: number;        // Display width in pixels
    height?: number;       // Display height in pixels
  };
  favicon?: string;        // Optional favicon URL

  // Color Palette
  colors: {
    primary: string;       // Main brand color (buttons, links)
    primaryHover: string;  // Hover state
    secondary: string;     // Accent color
    background: string;    // Page background
    backgroundSubtle: string; // Card/input backgrounds
    text: string;          // Primary text
    textMuted: string;     // Secondary text
    border: string;        // Border color
    success: string;       // Success states
    error: string;         // Error states
  };

  // Typography
  fonts: {
    heading: string;       // Google Font name or system font
    body: string;          // Google Font name or system font
  };

  // Content
  tagline?: string;        // Optional tagline under logo
  welcomeMessage?: string; // Custom welcome text for sessions
  completionMessage?: string; // Custom completion text

  // Footer/Attribution
  showPoweredBy: boolean;  // Show "Powered by FlowForge"
  customFooter?: string;   // Optional custom footer text

  // Advanced (Enterprise tier)
  customCss?: string;      // Additional CSS overrides
}
```

### Example: Mark Nickerson's Brand Config

```json
{
  "logo": {
    "url": "https://supabase.co/.../leadingwithmeaning-logo.png",
    "alt": "Leading with Meaning",
    "width": 200
  },
  "colors": {
    "primary": "#2D5A7B",
    "primaryHover": "#1E4A6B",
    "secondary": "#8B9D83",
    "background": "#FAFAFA",
    "backgroundSubtle": "#F5F5F5",
    "text": "#1A1A1A",
    "textMuted": "#666666",
    "border": "#E0E0E0",
    "success": "#4CAF50",
    "error": "#F44336"
  },
  "fonts": {
    "heading": "Playfair Display",
    "body": "Open Sans"
  },
  "tagline": "Discover Your Leadership Archetype",
  "welcomeMessage": "Welcome to your Leadership Archetypes Discovery session. This conversation will help you understand your natural leadership style and how you respond under pressure.",
  "completionMessage": "Thank you for completing your Leadership Archetypes Discovery. Mark will review your results and reach out to discuss your personalized insights.",
  "showPoweredBy": true
}
```

---

## Linking Architecture

### Relationship Chain

```
coach_profiles (coach)
    ↓
campaigns (assessment instance)
    ↓
stakeholder_sessions (client session)
    ↓
agent_sessions (AI conversation)
```

### Modified `campaigns` Table

```sql
ALTER TABLE campaigns
  ADD COLUMN coach_profile_id UUID REFERENCES coach_profiles(id),
  ADD COLUMN assessment_type TEXT DEFAULT 'industry_4.0';
  -- assessment_type: 'industry_4.0', 'archetype', 'education', etc.
```

### Session Access Flow

1. Client clicks link from Mark's website
2. URL: `/coach/leadingwithmeaning/session/[token]`
3. Middleware extracts `slug` → looks up `coach_profiles`
4. Page loads with Mark's `brand_config`
5. Session proceeds with FlowForge AI backend

---

## URL Routing Strategy

### Phase 1: Path-Based (MVP)

```
/coach/[slug]/session/[token]     - Client session
/coach/[slug]/dashboard           - Coach dashboard (authenticated)
/coach/[slug]/campaigns           - Campaign management
/coach/[slug]/clients             - Client list
```

**Implementation:**
- Next.js dynamic routes: `app/coach/[slug]/...`
- Middleware validates slug against `coach_profiles`
- Brand config loaded via server component

### Phase 2: Subdomain (Future)

```
[slug].flowforge.app/session/[token]
```

**Implementation:**
- Wildcard SSL certificate
- Middleware extracts subdomain
- Same routing logic, different entry point

---

## UI Theming System

### CSS Custom Properties Approach

```tsx
// lib/theme/brand-theme.ts
export function generateBrandCss(brand: BrandConfig): string {
  return `
    :root {
      --brand-primary: ${brand.colors.primary};
      --brand-primary-hover: ${brand.colors.primaryHover};
      --brand-secondary: ${brand.colors.secondary};
      --brand-bg: ${brand.colors.background};
      --brand-bg-subtle: ${brand.colors.backgroundSubtle};
      --brand-text: ${brand.colors.text};
      --brand-text-muted: ${brand.colors.textMuted};
      --brand-border: ${brand.colors.border};
      --brand-success: ${brand.colors.success};
      --brand-error: ${brand.colors.error};
      --brand-font-heading: '${brand.fonts.heading}', serif;
      --brand-font-body: '${brand.fonts.body}', sans-serif;
    }
  `;
}
```

### Tailwind Integration

```javascript
// tailwind.config.js (extended)
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-hover': 'var(--brand-primary-hover)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-bg': 'var(--brand-bg)',
        'brand-bg-subtle': 'var(--brand-bg-subtle)',
        'brand-text': 'var(--brand-text)',
        'brand-text-muted': 'var(--brand-text-muted)',
        'brand-border': 'var(--brand-border)',
      },
      fontFamily: {
        'brand-heading': 'var(--brand-font-heading)',
        'brand-body': 'var(--brand-font-body)',
      }
    }
  }
}
```

### Session Page Structure

```tsx
// app/coach/[slug]/session/[token]/page.tsx
export default async function CoachSessionPage({
  params
}: {
  params: { slug: string; token: string }
}) {
  const coach = await getCoachBySlug(params.slug);
  const session = await getSessionByToken(params.token);

  if (!coach || !session) {
    return <NotFound />;
  }

  return (
    <>
      {/* Inject brand CSS */}
      <style dangerouslySetInnerHTML={{
        __html: generateBrandCss(coach.brand_config)
      }} />

      {/* Load custom fonts */}
      <GoogleFontsLoader fonts={[
        coach.brand_config.fonts.heading,
        coach.brand_config.fonts.body
      ]} />

      {/* Branded session interface */}
      <BrandedSessionLayout coach={coach}>
        <ArchetypeInterviewChat
          session={session}
          coach={coach}
        />
      </BrandedSessionLayout>
    </>
  );
}
```

---

## "Powered by FlowForge" Policy

### Standard Tier
- "Powered by FlowForge" shown in footer
- Small, non-intrusive text link
- Required for standard accounts

### Professional Tier
- "Powered by FlowForge" optional
- Can be hidden via `showPoweredBy: false`

### Enterprise Tier
- Full white-label (no FlowForge branding)
- Custom domain support
- Custom CSS injection

---

## Coach Dashboard Integration

### Location Options

**Option A: Integrated into Coach Portal**
```
/coach/[slug]/dashboard
/coach/[slug]/campaigns
/coach/[slug]/clients
/coach/[slug]/settings
```

**Option B: Separate Coach App**
```
/dashboard/coach/[coach_id]
```

**Recommendation: Option A** - Keeps everything under the coach's branded space.

### Dashboard Features

1. **Campaigns** - Create and manage assessment campaigns
2. **Clients** - View client list, session status, results
3. **Reports** - Generate and download PDF reports
4. **Settings** - Brand configuration, integrations
5. **Analytics** - Session completion rates, archetype distributions

---

## Implementation Phases

### Phase 1: MVP for Mark Nickerson

1. Create `coach_profiles` migration
2. Seed Mark's profile with brand config
3. Build `/coach/[slug]/session/[token]` route
4. Implement CSS variable theming
5. Create archetype interview agent
6. Basic completion flow with results

### Phase 2: Coach Self-Service

1. Coach registration flow
2. Brand config editor UI
3. Logo upload to Supabase Storage
4. Color picker with preview
5. Campaign creation interface

### Phase 3: Advanced Features

1. Custom domain support
2. Advanced analytics
3. Team member access
4. API integrations
5. Bulk client import

---

## Security Considerations

1. **Slug validation** - Only allow alphanumeric and hyphens
2. **Token expiry** - Session tokens expire after use
3. **RLS policies** - Coaches can only access their own data
4. **Asset isolation** - Brand assets stored in coach-specific buckets
5. **Rate limiting** - Prevent abuse of public session endpoints

---

## Migration Path from Existing Sessions

The existing `stakeholder_sessions` and `campaigns` tables will work with this architecture:

1. Add `coach_profile_id` to `campaigns`
2. Mark's campaigns linked to his coach profile
3. Existing session flow unchanged
4. New branded routes as additional entry points

---

## File Structure

```
app/
├── coach/
│   └── [slug]/
│       ├── layout.tsx          # Branded layout wrapper
│       ├── session/
│       │   └── [token]/
│       │       └── page.tsx    # Branded session page
│       └── dashboard/
│           └── page.tsx        # Coach dashboard
├── api/
│   └── coach/
│       └── [slug]/
│           ├── session/
│           │   └── route.ts    # Session API
│           └── results/
│               └── route.ts    # Results API

lib/
├── theme/
│   ├── brand-theme.ts          # CSS generation
│   └── fonts.ts                # Font loading
├── coaches/
│   ├── get-coach.ts            # Coach profile fetching
│   └── validate-slug.ts        # Slug validation
└── agents/
    └── archetype-interview-agent.ts  # Archetype AI agent
```

---

## Summary

This architecture enables:

1. **Mark's branded experience** via `/coach/leadingwithmeaning/session/[token]`
2. **Seamless client journey** from Mark's website to assessment
3. **FlowForge as SaaS backbone** with scalable multi-coach support
4. **Progressive enhancement** from path-based to subdomain to custom domains
5. **Single codebase** serving multiple branded experiences

The MVP focuses on Mark's specific needs while building a foundation for additional coaches and assessment types.
