-- =====================================================
-- BACKFILL USER PROFILES FOR EXISTING USERS
-- Creates user_profiles for any auth.users without one
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  org_slug TEXT;
  org_name TEXT;
BEGIN
  -- Loop through all users who don't have a profile
  FOR user_record IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.id
    WHERE up.id IS NULL
  LOOP
    RAISE NOTICE 'Creating profile for user: %', user_record.email;

    -- Extract or generate organization name
    org_name := COALESCE(
      user_record.raw_user_meta_data->>'organization_name',
      split_part(user_record.email, '@', 1) || '''s Organization'
    );

    -- Generate slug from organization name or email
    org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
    org_slug := trim(both '-' from org_slug);

    -- Ensure unique slug
    WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
      org_slug := org_slug || '-' || substr(md5(random()::text), 1, 8);
    END LOOP;

    -- Create organization for this user
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
      'enterprise', -- Grant enterprise plan to existing users
      'active'
    ) RETURNING id INTO new_org_id;

    RAISE NOTICE 'Created organization: % (ID: %)', org_name, new_org_id;

    -- Create user profile
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
        user_record.raw_user_meta_data->>'name',
        split_part(user_record.email, '@', 1)
      ),
      user_record.email,
      'owner', -- Make them owner of their org
      'active'
    );

    RAISE NOTICE 'Created user profile for: %', user_record.email;

    -- Update any campaigns created by this user to belong to their org
    UPDATE campaigns
    SET organization_id = new_org_id
    WHERE created_by = user_record.id
      AND organization_id = 'b7d0e6a0-0000-0000-0000-000000000001'; -- Only update default org campaigns

    RAISE NOTICE 'Updated campaigns for user: %', user_record.email;

  END LOOP;
END $$;

-- Display results
DO $$
DECLARE
  profile_count INTEGER;
  org_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM user_profiles;
  SELECT COUNT(*) INTO org_count FROM organizations;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Backfill complete!';
  RAISE NOTICE 'Total user profiles: %', profile_count;
  RAISE NOTICE 'Total organizations: %', org_count;
  RAISE NOTICE '==============================================';
END $$;
