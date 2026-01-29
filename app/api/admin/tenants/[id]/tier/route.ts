/**
 * Admin Tenant Tier Management API
 *
 * PATCH /api/admin/tenants/[id]/tier
 * Updates a tenant's subscription tier and/or usage limit override.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface UpdateTierRequest {
  tierId: string
  usageLimitOverride?: number | null
}

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * Verify the requesting user is an admin
 */
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (!profile || profile.user_type !== 'admin') {
    return { error: 'Forbidden - Admin access required', status: 403 }
  }

  return { user, profile }
}

/**
 * PATCH /api/admin/tenants/[id]/tier
 * Update a tenant's tier assignment
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdmin()
    if ('error' in adminCheck) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params
    const body: UpdateTierRequest = await request.json()

    // Verify the tier exists (if tierId is provided and not null)
    if (body.tierId) {
      const { data: tier, error: tierError } = await supabaseAdmin
        .from('subscription_tiers')
        .select('id, name, display_name, monthly_token_limit')
        .eq('id', body.tierId)
        .single()

      if (tierError || !tier) {
        return NextResponse.json(
          { error: 'Invalid tier ID' },
          { status: 400 }
        )
      }
    }

    // Verify the tenant exists
    const { data: existingTenant, error: tenantError } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .select('id, display_name')
      .eq('id', id)
      .single()

    if (tenantError || !existingTenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      tier_id: body.tierId || null,
      updated_at: new Date().toISOString(),
    }

    // Handle usage_limit_override (can be null to clear, or a number)
    if (body.usageLimitOverride !== undefined) {
      updateData.usage_limit_override = body.usageLimitOverride
    }

    // Update the tenant
    const { data: updatedTenant, error: updateError } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .update(updateData)
      .eq('id', id)
      .select(`
        id, display_name, tier_id, usage_limit_override, billing_period_start,
        subscription_tiers(id, name, display_name, monthly_token_limit)
      `)
      .single()

    if (updateError) {
      console.error('Tenant tier update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tenant tier' },
        { status: 500 }
      )
    }

    // Calculate effective limit
    const effectiveLimit = updatedTenant.usage_limit_override
      ?? updatedTenant.subscription_tiers?.monthly_token_limit
      ?? null

    return NextResponse.json({
      success: true,
      tenant: {
        id: updatedTenant.id,
        displayName: updatedTenant.display_name,
        tier: {
          id: updatedTenant.subscription_tiers?.id,
          name: updatedTenant.subscription_tiers?.name,
          displayName: updatedTenant.subscription_tiers?.display_name,
          monthlyTokenLimit: updatedTenant.subscription_tiers?.monthly_token_limit,
        },
        usageLimitOverride: updatedTenant.usage_limit_override,
        effectiveLimit,
        billingPeriodStart: updatedTenant.billing_period_start,
      },
    })
  } catch (error) {
    console.error('Admin tenant tier update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/tenants/[id]/tier
 * Get a tenant's current tier information
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdmin()
    if ('error' in adminCheck) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params

    // Fetch tenant with tier info
    const { data: tenant, error: tenantError } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .select(`
        id, display_name, tier_id, usage_limit_override, billing_period_start,
        subscription_tiers(id, name, display_name, monthly_token_limit, monthly_session_limit)
      `)
      .eq('id', id)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Calculate effective limit
    const effectiveLimit = tenant.usage_limit_override
      ?? tenant.subscription_tiers?.monthly_token_limit
      ?? null

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        displayName: tenant.display_name,
        tier: tenant.subscription_tiers
          ? {
              id: tenant.subscription_tiers.id,
              name: tenant.subscription_tiers.name,
              displayName: tenant.subscription_tiers.display_name,
              monthlyTokenLimit: tenant.subscription_tiers.monthly_token_limit,
              monthlySessionLimit: tenant.subscription_tiers.monthly_session_limit,
            }
          : null,
        usageLimitOverride: tenant.usage_limit_override,
        effectiveLimit,
        billingPeriodStart: tenant.billing_period_start,
      },
    })
  } catch (error) {
    console.error('Admin tenant tier fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
