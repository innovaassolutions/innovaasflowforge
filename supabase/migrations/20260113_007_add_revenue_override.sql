-- Add revenue override column to tenant_profiles
-- Story: billing-4-2-add-revenue-margin-tracking
-- Allows admins to set custom revenue for tenants with special deals

ALTER TABLE tenant_profiles
ADD COLUMN IF NOT EXISTS revenue_override_cents INTEGER DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN tenant_profiles.revenue_override_cents IS
  'Custom monthly revenue in cents. If NULL, uses subscription tier price_cents_monthly.';
