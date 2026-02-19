import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getResendClient, buildFromAddress } from '@/lib/resend'
import { render } from '@react-email/render'
import { SignupConfirmationEmail } from '@/lib/email/templates/signup-confirmation'

interface SignupInput {
  email: string
  password: string
  fullName: string
  accountType: 'coach' | 'consultant' | 'company'
}

/**
 * POST /api/auth/signup
 *
 * Handles self-registration:
 * 1. Creates the user via Supabase Admin API (unconfirmed)
 * 2. Ensures user_profiles and tenant_profiles exist (safety net for trigger failures)
 * 3. Generates a confirmation link via generateLink()
 * 4. Sends a branded confirmation email via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const body: SignupInput = await request.json()

    // Validate required fields
    if (!body.email || !body.password || !body.fullName || !body.accountType) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate account type
    if (!['coach', 'consultant', 'company'].includes(body.accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      )
    }

    // Create the user (unconfirmed — they must click the email link)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: false,
      user_metadata: {
        full_name: body.fullName,
        user_type: body.accountType,
      },
    })

    if (createError) {
      console.error('Signup user creation error:', createError)

      if (createError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    const userId = newUser.user.id

    // ---------------------------------------------------------------
    // Ensure user_profiles exists (safety net if trigger failed)
    // ---------------------------------------------------------------
    const { data: existingProfile } = await (supabaseAdmin
      .from('user_profiles') as any)
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      console.log(`Trigger did not create user_profiles for ${body.email} — creating manually`)

      // Create an organization first
      const orgSlug = body.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).substring(2, 8)

      const { data: org } = await (supabaseAdmin
        .from('organizations') as any)
        .insert({
          name: 'My Organization',
          slug: orgSlug,
          plan: 'free',
          subscription_status: 'active',
        })
        .select('id')
        .single()

      await (supabaseAdmin
        .from('user_profiles') as any)
        .insert({
          id: userId,
          organization_id: org?.id,
          full_name: body.fullName,
          email: body.email,
          role: 'owner',
          status: 'active',
          user_type: body.accountType,
        })
    }

    // ---------------------------------------------------------------
    // Ensure tenant_profiles exists (safety net if trigger failed)
    // ---------------------------------------------------------------
    const { data: existingTenant } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!existingTenant) {
      console.log(`Trigger did not create tenant_profiles for ${body.email} — creating manually`)

      const tenantType = body.accountType === 'company' ? 'school' : body.accountType
      let tenantSlug = body.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      if (tenantSlug.length < 3) {
        tenantSlug += '-' + Math.random().toString(36).substring(2, 8)
      }

      // Ensure slug uniqueness
      const { data: slugExists } = await (supabaseAdmin
        .from('tenant_profiles') as any)
        .select('id')
        .eq('slug', tenantSlug)
        .single()

      if (slugExists) {
        tenantSlug += '-' + Math.random().toString(36).substring(2, 8)
      }

      const enabledAssessments =
        tenantType === 'coach' ? ['archetype'] :
        tenantType === 'school' ? ['education'] :
        ['industry4']

      await (supabaseAdmin
        .from('tenant_profiles') as any)
        .insert({
          user_id: userId,
          slug: tenantSlug,
          display_name: body.fullName,
          tenant_type: tenantType,
          brand_config: {
            logo: null,
            colors: {
              primary: '#F25C05',
              primaryHover: '#DC5204',
              secondary: '#1D9BA3',
              background: '#FFFEFB',
              backgroundSubtle: '#FAF8F3',
              text: '#171614',
              textMuted: '#71706B',
              border: '#E6E2D6',
            },
            fonts: { heading: 'Inter', body: 'Inter' },
            showPoweredBy: true,
          },
          email_config: {
            replyTo: body.email,
            senderName: body.fullName,
          },
          enabled_assessments: enabledAssessments,
          subscription_tier: 'starter',
          is_active: true,
        })
    }

    // ---------------------------------------------------------------
    // Generate confirmation link and send email
    // ---------------------------------------------------------------
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: body.email,
      password: body.password,
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    })

    if (linkError || !linkData) {
      console.error('Generate link error:', linkError)
      return NextResponse.json(
        { error: 'Account created but confirmation email could not be sent. Please try logging in or contact support.' },
        { status: 500 }
      )
    }

    const confirmationUrl = `${baseUrl}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=signup`

    // Send branded confirmation email via Resend
    try {
      const resend = getResendClient()
      const emailHtml = await render(
        SignupConfirmationEmail({
          fullName: body.fullName,
          email: body.email,
          confirmationUrl,
          accountType: body.accountType,
        })
      )

      await resend.emails.send({
        from: buildFromAddress('FlowForge'),
        to: body.email,
        subject: 'Confirm your FlowForge account',
        html: emailHtml,
      })

      console.log(`Confirmation email sent to ${body.email}`)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to confirm.',
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
