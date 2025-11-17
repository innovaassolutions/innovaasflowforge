-- =====================================================
-- CREATE MISSING USER PROFILES FOR EXISTING USERS
-- Fixes issue where users signed up before multi-tenancy migration
-- =====================================================

-- Create user profiles and organizations for any auth.users without a profile
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  org_slug TEXT;
  org_name TEXT;
BEGIN
  FOR user_record IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.id
    WHERE up.id IS NULL
  LOOP
    -- Extract organization name from user metadata or use email domain
    org_name := COALESCE(
      user_record.raw_user_meta_data->>'organization_name',
      split_part(user_record.email, '@', 1) || ' Organization'
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
      name,
      slug,
      plan,
      subscription_status
    ) VALUES (
      org_name,
      org_slug,
      'free',
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
      user_record.id,
      new_org_id,
      COALESCE(
        user_record.raw_user_meta_data->>'full_name',
        split_part(user_record.email, '@', 1)
      ),
      user_record.email,
      'owner',
      'active'
    );

    RAISE NOTICE 'Created organization "%" and user profile for user %', org_name, user_record.email;
  END LOOP;
END $$;

-- Verify the migration worked
DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_count FROM auth.users;
  SELECT COUNT(*) INTO profiles_count FROM user_profiles;

  RAISE NOTICE 'Total auth.users: %, Total user_profiles: %', users_count, profiles_count;

  IF users_count != profiles_count THEN
    RAISE WARNING 'Mismatch: % users vs % profiles', users_count, profiles_count;
  ELSE
    RAISE NOTICE 'Success: All users have profiles';
  END IF;
END $$;
