/**
 * Mark Declined API
 *
 * Lightweight endpoint to update reflection status to 'declined' without
 * sending email or generating PDF. Called from thank you page.
 *
 * Story: 1.3 Email & PDF (modified - email shelved)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
): Promise<NextResponse> {
  try {
    const { slug, token } = await params
    const supabase = getServiceClient()

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Coach not found' },
        { status: 404 }
      )
    }

    // Update session reflection status to declined
    const { error: updateError } = await supabase
      .from('coaching_sessions')
      .update({
        reflection_status: 'declined'
      } as any)
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .eq('reflection_status', 'pending') // Only update if currently pending

    if (updateError) {
      console.error('Failed to update reflection status:', updateError)
      // Don't fail - this is a non-critical update
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Mark declined API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
