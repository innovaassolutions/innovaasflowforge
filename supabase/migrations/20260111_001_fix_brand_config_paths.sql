-- ============================================================================
-- Migration: Fix brand_config paths after basePath removal
-- Description: Update brand_config JSON to remove /flowforge prefix from paths
-- Date: 2026-01-11
-- ============================================================================

-- Update any tenant_profiles with /flowforge/ in their brand_config logo URL
UPDATE tenant_profiles
SET brand_config = jsonb_set(
  brand_config,
  '{logo,url}',
  to_jsonb(replace(brand_config->'logo'->>'url', '/flowforge/', '/'))
)
WHERE brand_config->'logo'->>'url' LIKE '%/flowforge/%';

-- Log what was updated (for verification)
DO $$
DECLARE
  updated_count integer;
BEGIN
  SELECT count(*) INTO updated_count
  FROM tenant_profiles
  WHERE brand_config->'logo'->>'url' LIKE '%/flowforge/%';

  IF updated_count > 0 THEN
    RAISE NOTICE 'Updated % tenant profiles with /flowforge/ paths', updated_count;
  ELSE
    RAISE NOTICE 'No tenant profiles needed path updates';
  END IF;
END $$;
