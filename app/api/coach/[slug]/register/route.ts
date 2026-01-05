/**
 * Coach Registration API
 *
 * Creates a coaching_session for a new client registration.
 * Generates a unique session token for assessment access.
 *
 * Story: 3-3-registration-sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

// Create service role client for database operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface RegisterRequest {
  name: string
  email: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body: RegisterRequest = await request.json()

    // Validate input
    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const name = body.name.trim()
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

    // Verify tenant exists and is active
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, display_name, is_active, enabled_assessments')
      .eq('slug', slug)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Coach not found' },
        { status: 404 }
      )
    }

    if (!tenant.is_active) {
      return NextResponse.json(
        { success: false, error: 'This coach is not currently accepting registrations' },
        { status: 403 }
      )
    }

    // Check if client already exists for this tenant
    const { data: existingSession } = await supabase
      .from('coaching_sessions')
      .select('id, access_token, client_status')
      .eq('tenant_id', tenant.id)
      .eq('client_email', email)
      .single()

    if (existingSession) {
      // Return existing session token
      return NextResponse.json({
        success: true,
        sessionToken: existingSession.access_token,
        isExisting: true,
        message: 'Welcome back! You already have a session.',
      })
    }

    // Generate unique session token
    const sessionToken = randomBytes(32).toString('base64url')

    // Create new coaching session
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .insert({
        tenant_id: tenant.id,
        client_name: name,
        client_email: email,
        client_status: 'registered',
        access_token: sessionToken,
        access_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        metadata: {
          registered_at: new Date().toISOString(),
          registration_source: 'self_registration',
          assessment_type: 'archetype',
        },
      })
      .select('id, access_token')
      .single()

    if (sessionError) {
      console.error('Error creating coaching session:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionToken: session.access_token,
      isExisting: false,
      message: 'Registration successful',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
