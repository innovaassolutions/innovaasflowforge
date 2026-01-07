/**
 * Coach Continue API
 *
 * Looks up an existing coaching session by email for a given tenant.
 * Returns the session token if found.
 *
 * Story: Continue session flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for database operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ContinueRequest {
  email: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body: ContinueRequest = await request.json()

    // Validate input
    if (!body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const email = body.email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    // Verify tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, is_active')
      .eq('slug', slug)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Coach not found' },
        { status: 404 }
      )
    }

    // Look up session by email for this tenant
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, access_token, client_status, access_expires_at')
      .eq('tenant_id', tenant.id)
      .eq('client_email', email)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({
        success: false,
        notFound: true,
        message: 'No session found for this email',
      })
    }

    // Check if session has expired
    if (session.access_expires_at) {
      const expiresAt = new Date(session.access_expires_at)
      if (expiresAt < new Date()) {
        // Extend the session by 30 more days
        await supabase
          .from('coaching_sessions')
          .update({
            access_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', session.id)
      }
    }

    return NextResponse.json({
      success: true,
      sessionToken: session.access_token,
      status: session.client_status,
    })
  } catch (error) {
    console.error('Continue lookup error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
