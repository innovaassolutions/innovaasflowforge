/**
 * Admin Subscription Tier Detail API
 *
 * PUT /api/admin/tiers/[id]
 * Updates a specific subscription tier's configuration.
 *
 * Story: billing-2-5-admin-ui-tier-management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/tiers/[id]
 * Update a subscription tier
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: tierId } = await context.params

    // Verify admin user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      monthlyTokenLimit,
      monthlySessionLimit,
      priceCentsMonthly,
      isActive,
    } = body

    // Build update object (only include fields that were provided)
    const updateData: Record<string, unknown> = {}

    if (monthlyTokenLimit !== undefined) {
      updateData.monthly_token_limit = monthlyTokenLimit
    }
    if (monthlySessionLimit !== undefined) {
      updateData.monthly_session_limit = monthlySessionLimit
    }
    if (priceCentsMonthly !== undefined) {
      updateData.price_cents_monthly = priceCentsMonthly
    }
    if (isActive !== undefined) {
      updateData.is_active = isActive
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update the tier
    const { data: tier, error } = await (supabaseAdmin
      .from('subscription_tiers') as any)
      .update(updateData)
      .eq('id', tierId)
      .select('id, name, display_name, monthly_token_limit, monthly_session_limit, price_cents_monthly, is_active')
      .single()

    if (error) {
      console.error('Error updating tier:', error)
      return NextResponse.json(
        { error: 'Failed to update tier' },
        { status: 500 }
      )
    }

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    return NextResponse.json({
      tier: {
        id: tier.id,
        name: tier.name,
        displayName: tier.display_name,
        monthlyTokenLimit: tier.monthly_token_limit,
        monthlySessionLimit: tier.monthly_session_limit,
        priceCentsMonthly: tier.price_cents_monthly,
        isActive: tier.is_active,
      },
    })
  } catch (error) {
    console.error('Admin tier update error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/admin/tiers/[id]
 * Get a single subscription tier
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: tierId } = await context.params

    // Verify admin user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the tier
    const { data: tier, error } = await (supabaseAdmin
      .from('subscription_tiers') as any)
      .select('id, name, display_name, monthly_token_limit, monthly_session_limit, price_cents_monthly, is_active')
      .eq('id', tierId)
      .single()

    if (error || !tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    return NextResponse.json({
      tier: {
        id: tier.id,
        name: tier.name,
        displayName: tier.display_name,
        monthlyTokenLimit: tier.monthly_token_limit,
        monthlySessionLimit: tier.monthly_session_limit,
        priceCentsMonthly: tier.price_cents_monthly,
        isActive: tier.is_active,
      },
    })
  } catch (error) {
    console.error('Admin tier fetch error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
