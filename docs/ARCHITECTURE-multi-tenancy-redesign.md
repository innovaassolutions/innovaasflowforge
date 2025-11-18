# Multi-Tenancy Architecture Redesign v2

**Date**: 2025-11-18
**Status**: Planning → Implementation
**Priority**: CRITICAL

## Business Model & User Types

### Monetization Strategy
- **Consultants**: Billed per campaign (they bill their clients)
- **Companies**: Buy campaign packages

### User Journey

```
Login → User Type?
├── CONSULTANT
│   ├── Create/manage MULTIPLE company profiles (for different clients)
│   ├── Each company has stakeholder profiles
│   ├── Create campaigns for any company they manage
│   └── Billed per campaign run
│
└── COMPANY
    ├── Linked to ONE company profile (their own organization)
    ├── Manage stakeholder profiles (employees)
    ├── Create campaigns for their divisions
    └── Buy campaign packages
```

---

## Complete Schema Design

### 1. USER_PROFILES (Enhanced)

**Purpose**: Track user type and billing context

```sql
-- Already exists, enhance with user_type
ALTER TABLE user_profiles
  ADD COLUMN user_type TEXT CHECK (user_type IN ('consultant', 'company')),
  ADD COLUMN company_profile_id UUID REFERENCES company_profiles(id);

-- For COMPANY users: company_profile_id links to their organization
-- For CONSULTANT users: company_profile_id is NULL (they create many via created_by)

CREATE INDEX idx_user_profiles_company_profile_id ON user_profiles(company_profile_id);

COMMENT ON COLUMN user_profiles.user_type IS 'Consultant (billed per campaign) or Company (campaign packages)';
COMMENT ON COLUMN user_profiles.company_profile_id IS 'For company users only - their organization. NULL for consultants.';
```

### 2. COMPANY_PROFILES

**Purpose**: Client companies (managed by consultants OR owned by company users)

```sql
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company Information
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  website TEXT,
  market_scope TEXT CHECK (market_scope IN ('local', 'regional', 'national', 'international')),

  -- Additional Context
  employee_count_range TEXT,
  annual_revenue_range TEXT,
  headquarters_location TEXT,

  -- Ownership
  created_by UUID NOT NULL REFERENCES auth.users(id),
  -- For consultants: they create many company profiles
  -- For company users: they create ONE (their own)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_profiles_created_by ON company_profiles(created_by);
```

### 3. STAKEHOLDER_PROFILES (NEW)

**Purpose**: Reusable stakeholder profiles belonging to companies

```sql
CREATE TABLE stakeholder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company Association
  company_profile_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,

  -- Stakeholder Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role_type TEXT CHECK (role_type IN (
    'managing_director',
    'it_operations',
    'production_manager',
    'purchasing_manager',
    'planning_scheduler',
    'engineering_maintenance'
  )),
  title TEXT,
  department TEXT,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id), -- Facilitator who created this profile
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(company_profile_id, email) -- Each email unique within a company
);

CREATE INDEX idx_stakeholder_profiles_company ON stakeholder_profiles(company_profile_id);
CREATE INDEX idx_stakeholder_profiles_email ON stakeholder_profiles(email);

COMMENT ON TABLE stakeholder_profiles IS 'Reusable stakeholder profiles - can be assigned to multiple campaigns';
```

### 4. CAMPAIGNS (Updated)

**Purpose**: Assessment campaigns for a specific company

```sql
-- Remove organization_id (if exists), add company_profile_id
ALTER TABLE campaigns
  DROP COLUMN IF EXISTS organization_id,
  ADD COLUMN company_profile_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;

CREATE INDEX idx_campaigns_company_profile ON campaigns(company_profile_id);

COMMENT ON COLUMN campaigns.company_profile_id IS 'Which company this campaign is for';
COMMENT ON COLUMN campaigns.created_by IS 'Facilitator (consultant or company user) who created this campaign';
```

### 5. CAMPAIGN_ASSIGNMENTS (Rename stakeholder_sessions)

**Purpose**: Links stakeholders to campaigns + tracks interview sessions

```sql
-- Option A: Rename existing table
ALTER TABLE stakeholder_sessions RENAME TO campaign_assignments;

-- Option B: Keep stakeholder_sessions name but add profile link
-- (I recommend Option A for clarity, but either works)

-- Add stakeholder_profile_id reference
ALTER TABLE campaign_assignments
  ADD COLUMN stakeholder_profile_id UUID REFERENCES stakeholder_profiles(id) ON DELETE CASCADE;

-- Keep existing columns:
-- - campaign_id (which campaign)
-- - access_token (unique access for this assignment)
-- - status (invited, in_progress, completed)
-- - interview_data (JSONB session data)
-- - transcript (interview content)
-- - stakeholder_name, stakeholder_email, stakeholder_role (deprecated, use profile)

-- Eventually migrate to use stakeholder_profile_id and deprecate individual fields
CREATE INDEX idx_campaign_assignments_stakeholder_profile ON campaign_assignments(stakeholder_profile_id);
CREATE INDEX idx_campaign_assignments_campaign ON campaign_assignments(campaign_id);

COMMENT ON TABLE campaign_assignments IS 'Join table + session tracking: stakeholders assigned to campaigns with unique access tokens';
```

---

## Data Flow Examples

### Example 1: Consultant User

```
1. Signup: user_type = 'consultant'
2. Create company profile: "Acme Manufacturing"
   - company_profiles.created_by = consultant_user_id
3. Add stakeholder profiles:
   - John Doe, john@acme.com, IT Operations
   - Jane Smith, jane@acme.com, Production Manager
4. Create Campaign: "Q1 2025 Readiness Assessment"
   - campaigns.company_profile_id = acme_id
   - campaigns.created_by = consultant_user_id
5. Assign stakeholders to campaign:
   - campaign_assignments: john_profile_id → campaign_id, access_token_1
   - campaign_assignments: jane_profile_id → campaign_id, access_token_2
6. Send emails with access tokens
7. Later: Create another campaign "Q2 2025 Follow-up"
   - Assign SAME john_profile_id → new_campaign_id, access_token_3
```

### Example 2: Company User

```
1. Signup: user_type = 'company'
2. Create company profile: "TechCorp Industries"
   - company_profiles.created_by = company_user_id
   - user_profiles.company_profile_id = techcorp_id (linked)
3. Add stakeholder profiles (employees):
   - Bob Williams, bob@techcorp.com, Managing Director
   - Alice Chen, alice@techcorp.com, Engineering
4. Create Campaign: "Division A Assessment"
   - campaigns.company_profile_id = techcorp_id
   - campaigns.created_by = company_user_id
5. Assign stakeholders to campaign:
   - campaign_assignments: bob_profile_id → campaign_id, access_token_1
   - campaign_assignments: alice_profile_id → campaign_id, access_token_2
```

---

## RLS Policies

### company_profiles
```sql
-- Consultants can manage companies they created
-- Company users can manage their ONE company
CREATE POLICY "Users can manage their company profiles" ON company_profiles
  FOR ALL USING (
    created_by = auth.uid()
    OR
    id IN (SELECT company_profile_id FROM user_profiles WHERE id = auth.uid())
  );
```

### stakeholder_profiles
```sql
-- Users can manage stakeholders for companies they control
CREATE POLICY "Users can manage stakeholder profiles for their companies" ON stakeholder_profiles
  FOR ALL USING (
    company_profile_id IN (
      SELECT id FROM company_profiles WHERE created_by = auth.uid()
      UNION
      SELECT company_profile_id FROM user_profiles WHERE id = auth.uid()
    )
  );
```

### campaigns
```sql
-- Users can manage campaigns for companies they control
CREATE POLICY "Users can manage campaigns for their companies" ON campaigns
  FOR ALL USING (
    created_by = auth.uid()
    OR
    company_profile_id IN (
      SELECT company_profile_id FROM user_profiles WHERE id = auth.uid()
    )
  );
```

### campaign_assignments
```sql
-- Facilitators can manage assignments for their campaigns
-- Stakeholders can view their own assignments via access_token
CREATE POLICY "Facilitators can manage campaign assignments" ON campaign_assignments
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Stakeholders can access sessions with valid token" ON campaign_assignments
  FOR SELECT USING (access_token IS NOT NULL);
```

---

## Migration Strategy

### Phase 1: Create New Tables
1. ✅ Enhance user_profiles (add user_type, company_profile_id)
2. ✅ Create company_profiles table
3. ✅ Create stakeholder_profiles table
4. ✅ Update campaigns (add company_profile_id)
5. ✅ Add stakeholder_profile_id to stakeholder_sessions

### Phase 2: Data Migration
1. Backfill existing data (if any)
2. Create stakeholder_profiles from existing stakeholder_sessions
3. Link campaign_assignments to stakeholder_profiles

### Phase 3: Update Application Code
1. ✅ Signup flow: Choose user_type
2. ✅ Company profile management UI
3. ✅ Stakeholder profile management UI
4. ✅ Campaign creation: Link to company, assign stakeholder profiles
5. ✅ Update interview agent: Load company + stakeholder context

### Phase 4: Billing Integration
1. Track campaign_count per user
2. Implement billing logic based on user_type
3. Campaign package management for company users

---

## API Changes

### Signup Endpoint (NEW)
```typescript
POST /api/auth/signup
{
  email: string,
  password: string,
  fullName: string,
  userType: 'consultant' | 'company',

  // If userType = 'company', also create their company profile:
  company?: {
    name: string,
    industry: string,
    // ... other fields
  }
}
```

### Company Profiles Endpoint (NEW)
```typescript
// Create company profile (consultants create many, company users create one)
POST /api/company-profiles
{
  companyName: string,
  industry: string,
  description?: string,
  website?: string,
  marketScope: 'local' | 'regional' | 'national' | 'international',
  // ... other fields
}

// List companies (consultants see many, company users see one)
GET /api/company-profiles
```

### Stakeholder Profiles Endpoint (NEW)
```typescript
// Create stakeholder profile
POST /api/company-profiles/:companyId/stakeholders
{
  fullName: string,
  email: string,
  roleType: string,
  title?: string,
  department?: string
}

// List stakeholders for a company
GET /api/company-profiles/:companyId/stakeholders
```

### Campaign Creation Endpoint (UPDATED)
```typescript
POST /api/campaigns
{
  name: string,
  companyProfileId: string, // Which company this campaign is for
  description?: string,
  facilitatorName: string,
  facilitatorEmail: string,

  // Assign existing stakeholder profiles OR create new ones
  stakeholderAssignments: [
    {
      stakeholderProfileId?: string, // Existing profile
      // OR create new profile inline:
      newProfile?: {
        fullName: string,
        email: string,
        roleType: string,
        title?: string
      }
    }
  ]
}
```

---

## Benefits

1. **Flexible Business Model**: Supports both consultant and company user types
2. **Reusable Stakeholders**: Same stakeholder can participate in multiple campaigns
3. **Proper Data Isolation**: Company boundaries clearly defined
4. **Billing Ready**: User type enables differential pricing
5. **Scalable**: Consultants can manage unlimited clients, companies can run unlimited campaigns

---

## Next Steps

1. ✅ Review and approve architecture
2. Create migrations
3. Update auth/signup flow
4. Build company profile management UI
5. Build stakeholder profile management UI
6. Update campaign creation flow
7. Test end-to-end with both user types

---

**Ready to proceed with implementation?**
