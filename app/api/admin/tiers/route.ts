/**
 * Admin Subscription Tiers API
 *
 * GET /api/admin/tiers
 * Returns all available subscription tiers for admin selection.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface SubscriptionTier {
  id: string
  name: string
  display_name: string | null
  monthly_token_limit: number | null
  monthly_session_limit: number | null
  price_cents_monthly: number
  is_active: boolean
}

/**
 * GET /api/admin/tiers
 * List all subscription tiers
 */
export async function GET() {
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

    if (profile?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all active tiers
    const { data: tiers, error } = await (supabaseAdmin
      .from('subscription_tiers') as any)
      .select('id, name, display_name, monthly_token_limit, monthly_session_limit, price_cents_monthly, is_active')
      .eq('is_active', true)
      .order('price_cents_monthly', { ascending: true }) as { data: SubscriptionTier[] | null; error: any }

    if (error || !tiers) {
      console.error('Error fetching tiers:', error)
      return NextResponse.json({ error: 'Failed to fetch tiers' }, { status: 500 })
    }

    return NextResponse.json({
      tiers: tiers.map((tier: SubscriptionTier) => ({
        id: tier.id,
        name: tier.name,
        displayName: tier.display_name,
        monthlyTokenLimit: tier.monthly_token_limit,
        monthlySessionLimit: tier.monthly_session_limit,
        priceCentsMonthly: tier.price_cents_monthly,
        isActive: tier.is_active,
      })),
    })
  } catch (error) {
    console.error('Admin tiers error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
