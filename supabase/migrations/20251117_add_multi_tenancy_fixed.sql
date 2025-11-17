-- =====================================================
-- MULTI-TENANCY MIGRATION (FIXED)
-- Adds organizations, user profiles, and tenant isolation
-- =====================================================

-- =====================================================
-- ORGANIZATIONS TABLE
-- The top-level tenant entity
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Organization details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  domain TEXT, -- Optional custom domain

  -- Subscription/billing
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'professional', 'enterprise'
  subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  subscription_ends_at TIMESTAMPTZ,

  -- Limits and quotas
  max_campaigns INTEGER DEFAULT 5,
  max_stakeholders_per_campaign INTEGER DEFAULT 20,
  max_storage_gb INTEGER DEFAULT 10,

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#F25C05',
  secondary_color TEXT DEFAULT '#1D9BA3',

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_status ON organizations(subscription_status);

-- =====================================================
-- USER PROFILES TABLE
-- Links auth.users to organizations with roles
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- User information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,

  -- Role and permissions
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  permissions JSONB DEFAULT '{}'::jsonb, -- Granular permissions

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'invited'

  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- =====================================================
-- ADD ORGANIZATION_ID TO EXISTING TABLES
-- =====================================================

-- Add organization_id to campaigns
ALTER TABLE campaigns
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_campaigns_organization ON campaigns(organization_id);

-- Add created_by user tracking to campaigns
ALTER TABLE campaigns
  ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- =====================================================
-- MIGRATION: CREATE DEFAULT ORGANIZATION FOR EXISTING DATA
-- This allows existing data to remain accessible
-- =====================================================

-- Create a default organization for any existing data
INSERT INTO organizations (id, name, slug, plan)
VALUES (
  'b7d0e6a0-0000-0000-0000-000000000001',
  'Innovaas Solutions',
  'innovaas',
  'enterprise'
) ON CONFLICT (id) DO NOTHING;

-- Update existing campaigns to belong to default organization
UPDATE campaigns
SET organization_id = 'b7d0e6a0-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after migration
ALTER TABLE campaigns
  ALTER COLUMN organization_id SET NOT NULL;

-- =====================================================
-- HELPER FUNCTIONS FOR MULTI-TENANCY
-- Created in public schema (not auth schema) for permissions
-- =====================================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM user_profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Check if user has permission in their organization
CREATE OR REPLACE FUNCTION public.user_has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role TEXT;
  has_perm BOOLEAN;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = auth.uid();

  -- Owners and admins have all permissions
  IF user_role IN ('owner', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- Check granular permissions
  SELECT (permissions->permission_name)::boolean INTO has_perm
  FROM user_profiles
  WHERE id = auth.uid();

  RETURN COALESCE(has_perm, FALSE);
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Update existing policies and add new ones
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Organizations policies
-- Users can view their own organization
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Only owners can update organization
CREATE POLICY "Organization owners can update"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND role = 'owner'
    )
  );

-- User profiles policies
-- Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
  ON user_profiles FOR SELECT
  USING (
    organization_id = public.current_user_organization_id()
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can manage all profiles in their organization
CREATE POLICY "Admins can manage organization profiles"
  ON user_profiles FOR ALL
  USING (
    organization_id = public.current_user_organization_id()
    AND public.user_has_permission('manage_users')
  );

-- =====================================================
-- UPDATE EXISTING RLS POLICIES FOR CAMPAIGNS
-- Drop old policies and create new tenant-scoped ones
-- =====================================================

-- Drop existing broad policies on campaigns if any
DROP POLICY IF EXISTS "Service role has full access" ON campaigns;

-- Campaigns: Users can view campaigns in their organization
CREATE POLICY "Users can view campaigns in their organization"
  ON campaigns FOR SELECT
  USING (
    organization_id = public.current_user_organization_id()
  );

-- Campaigns: Users can create campaigns in their organization
CREATE POLICY "Users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    organization_id = public.current_user_organization_id()
  );

-- Campaigns: Users can update campaigns they created or have permission
CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  USING (
    organization_id = public.current_user_organization_id()
    AND (created_by = auth.uid() OR public.user_has_permission('manage_campaigns'))
  );

-- Campaigns: Admins can delete campaigns
CREATE POLICY "Admins can delete campaigns"
  ON campaigns FOR DELETE
  USING (
    organization_id = public.current_user_organization_id()
    AND public.user_has_permission('manage_campaigns')
  );

-- =====================================================
-- UPDATE RLS POLICIES FOR RELATED TABLES
-- All data inherits organization context from campaign
-- =====================================================

-- Stakeholder Sessions: Accessible via campaign's organization
DROP POLICY IF EXISTS "Stakeholders can view their own sessions" ON stakeholder_sessions;

CREATE POLICY "Users can view sessions in their organization"
  ON stakeholder_sessions FOR SELECT
  USING (
    -- Authenticated users from same org
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
    -- OR stakeholder accessing via access token (anonymous)
    OR access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
  );

CREATE POLICY "Users can manage sessions in their organization"
  ON stakeholder_sessions FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
  );

-- Agent Sessions: Accessible via stakeholder session's campaign
CREATE POLICY "Users can view agent sessions in their organization"
  ON agent_sessions FOR SELECT
  USING (
    stakeholder_session_id IN (
      SELECT ss.id FROM stakeholder_sessions ss
      JOIN campaigns c ON ss.campaign_id = c.id
      WHERE c.organization_id = public.current_user_organization_id()
    )
  );

CREATE POLICY "Users can manage agent sessions in their organization"
  ON agent_sessions FOR ALL
  USING (
    stakeholder_session_id IN (
      SELECT ss.id FROM stakeholder_sessions ss
      JOIN campaigns c ON ss.campaign_id = c.id
      WHERE c.organization_id = public.current_user_organization_id()
    )
  );

-- Session Documents: Accessible via stakeholder session's campaign
CREATE POLICY "Users can view documents in their organization"
  ON session_documents FOR SELECT
  USING (
    stakeholder_session_id IN (
      SELECT ss.id FROM stakeholder_sessions ss
      JOIN campaigns c ON ss.campaign_id = c.id
      WHERE c.organization_id = public.current_user_organization_id()
    )
  );

CREATE POLICY "Users can manage documents in their organization"
  ON session_documents FOR ALL
  USING (
    stakeholder_session_id IN (
      SELECT ss.id FROM stakeholder_sessions ss
      JOIN campaigns c ON ss.campaign_id = c.id
      WHERE c.organization_id = public.current_user_organization_id()
    )
  );

-- Document Chunks: Accessible via session document's campaign
CREATE POLICY "Users can view document chunks in their organization"
  ON document_chunks FOR SELECT
  USING (
    session_document_id IN (
      SELECT sd.id FROM session_documents sd
      JOIN stakeholder_sessions ss ON sd.stakeholder_session_id = ss.id
      JOIN campaigns c ON ss.campaign_id = c.id
      WHERE c.organization_id = public.current_user_organization_id()
    )
  );

CREATE POLICY "Users can manage document chunks in their organization"
  ON document_chunks FOR ALL
  USING (
    session_document_id IN (
      SELECT sd.id FROM session_documents sd
      JOIN stakeholder_sessions ss ON sd.stakeholder_session_id = ss.id
      JOIN campaigns c ON ss.campaign_id = c.id
      WHERE c.organization_id = public.current_user_organization_id()
    )
  );

-- Synthesis: Accessible via campaign
CREATE POLICY "Users can view synthesis in their organization"
  ON synthesis FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
  );

CREATE POLICY "Users can manage synthesis in their organization"
  ON synthesis FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
  );

-- =====================================================
-- ADD CAMPAIGN_SYNTHESIS TABLE (if not exists)
-- Used by the synthesis agent
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_synthesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Synthesis data
  synthesis_data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one synthesis per campaign
  UNIQUE(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_synthesis_campaign ON campaign_synthesis(campaign_id);

-- Enable RLS
ALTER TABLE campaign_synthesis ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_synthesis
CREATE POLICY "Users can view synthesis in their organization"
  ON campaign_synthesis FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
  );

CREATE POLICY "Users can manage synthesis in their organization"
  ON campaign_synthesis FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_synthesis_updated_at BEFORE UPDATE ON campaign_synthesis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ADD STAKEHOLDERS TABLE
-- Simplified stakeholder management
-- =====================================================
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Stakeholder details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT,

  -- Session tracking
  session_id UUID REFERENCES stakeholder_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'invited', -- 'invited', 'in_progress', 'completed'

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Ensure unique email per campaign
  UNIQUE(campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_stakeholders_campaign ON stakeholders(campaign_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_email ON stakeholders(email);
CREATE INDEX IF NOT EXISTS idx_stakeholders_status ON stakeholders(status);
CREATE INDEX IF NOT EXISTS idx_stakeholders_session ON stakeholders(session_id);

-- Enable RLS
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;

-- RLS policies for stakeholders
CREATE POLICY "Users can view stakeholders in their organization"
  ON stakeholders FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
  );

CREATE POLICY "Users can manage stakeholders in their organization"
  ON stakeholders FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE organization_id = public.current_user_organization_id()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE organizations IS 'Multi-tenant organizations (top-level tenant entity)';
COMMENT ON TABLE user_profiles IS 'User profiles linked to auth.users with organization membership';
COMMENT ON TABLE stakeholders IS 'Stakeholders participating in campaigns';
COMMENT ON TABLE campaign_synthesis IS 'Synthesized assessment data per campaign';

COMMENT ON COLUMN campaigns.organization_id IS 'Organization that owns this campaign';
COMMENT ON COLUMN campaigns.created_by IS 'User who created this campaign';
