/**
 * Admin Tenant Usage Reset API
 *
 * POST /api/admin/tenants/[id]/reset-usage
 * Resets a tenant's usage by advancing their billing period start to today.
 * This effectively zeroes out their usage counter without deleting historical data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { invalidateUsageCache } from '@/lib/services/usage-tracker'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
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

    if (!profile || profile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = await context.params

    // Verify the tenant exists
    const { data: tenant, error: tenantError } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .select('id, display_name, billing_period_start')
      .eq('id', id)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const previousStart = tenant.billing_period_start
    const newStart = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Update billing_period_start to today
    const { error: updateError } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .update({
        billing_period_start: newStart,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Usage reset error:', updateError)
      return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 })
    }

    // Invalidate the usage cache for this tenant
    invalidateUsageCache(id)

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        displayName: tenant.display_name,
        previousBillingStart: previousStart,
        newBillingStart: newStart,
      },
    })
  } catch (error) {
    console.error('Admin usage reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
