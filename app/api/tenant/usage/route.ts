/**
 * Tenant Usage API
 *
 * Returns current usage data for the authenticated tenant.
 * Used by tenant dashboards to display usage metrics.
 *
 * Story: billing-5-1-tenant-usage-dashboard-component
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantUsage, formatUsageDisplay } from '@/lib/services/usage-tracker'

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tenant ID
    const { data: tenant } = await (supabase
      .from('tenant_profiles') as any)
      .select('id, subscription_tier')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!tenant) {
      return NextResponse.json({ error: 'No tenant profile found' }, { status: 404 })
    }

    // Get usage data from tracker service
    const usage = await getTenantUsage(tenant.id)

    if (!usage) {
      return NextResponse.json({ error: 'Failed to retrieve usage data' }, { status: 500 })
    }

    // Format for display
    const display = formatUsageDisplay(usage)

    // Return formatted response matching story requirements
    return NextResponse.json({
      currentUsage: usage.currentUsage,
      limit: usage.limit,
      remaining: Math.max(0, usage.limit - usage.currentUsage),
      percentage: usage.percentage,
      billingPeriod: {
        start: usage.billingPeriodStart.toISOString().split('T')[0],
        end: usage.billingPeriodEnd.toISOString().split('T')[0],
      },
      daysRemaining: usage.daysRemaining,
      tier: {
        name: usage.tierName || 'starter',
        displayName: usage.tierName
          ? usage.tierName.charAt(0).toUpperCase() + usage.tierName.slice(1)
          : 'Starter',
      },
      isOverLimit: usage.isOverLimit,
      hasOverride: usage.hasOverride,
      display: {
        usage: display.usageText,
        percentage: display.percentageText,
        status: display.statusText,
        statusColor: display.statusColor,
      },
    })
  } catch (error) {
    console.error('Tenant usage API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
