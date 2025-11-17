-- =====================================================
-- AUTO-CREATE ORGANIZATION AND USER PROFILE ON SIGNUP
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
  org_name TEXT;
BEGIN
  -- Extract organization name from user metadata (from signup form)
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'organization_name',
    'My Organization'
  );

  -- Generate slug from organization name
  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  org_slug := trim(both '-' from org_slug);

  -- Ensure unique slug by appending random string if needed
  IF EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) THEN
    org_slug := org_slug || '-' || substr(md5(random()::text), 1, 8);
  END IF;

  -- Create new organization for this user
  INSERT INTO organizations (
    id,
    name,
    slug,
    plan,
    subscription_status
  ) VALUES (
    uuid_generate_v4(),
    org_name,
    org_slug,
    'free', -- Default to free plan
    'active'
  ) RETURNING id INTO new_org_id;

  -- Create user profile linked to the organization
  INSERT INTO user_profiles (
    id,
    organization_id,
    full_name,
    email,
    role,
    status
  ) VALUES (
    NEW.id,
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'owner', -- First user is always owner
    'active'
  );

  RETURN NEW;
END;
$$;

-- Trigger to run function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- HELPER FUNCTION: Get user's organization ID
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM user_profiles
  WHERE id = user_id
  LIMIT 1;
$$;

-- =====================================================
-- HELPER FUNCTION: Check if user has role
-- =====================================================

CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role = required_role
  FROM user_profiles
  WHERE id = user_id
  LIMIT 1;
$$;

-- =====================================================
-- HELPER FUNCTION: Check if user has any of the roles
-- =====================================================

CREATE OR REPLACE FUNCTION public.user_has_any_role(user_id UUID, required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role = ANY(required_roles)
  FROM user_profiles
  WHERE id = user_id
  LIMIT 1;
$$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates organization and user profile when a new user signs up';
COMMENT ON FUNCTION public.get_user_organization_id(UUID) IS 'Returns the organization ID for a given user';
COMMENT ON FUNCTION public.user_has_role(UUID, TEXT) IS 'Checks if a user has a specific role';
COMMENT ON FUNCTION public.user_has_any_role(UUID, TEXT[]) IS 'Checks if a user has any of the specified roles';
