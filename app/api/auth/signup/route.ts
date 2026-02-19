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
 * 2. Generates a confirmation link via generateLink()
 * 3. Sends a branded confirmation email via Resend
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

      // Return user-friendly messages for common errors
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

    // Generate a confirmation link (does NOT send Supabase's built-in email)
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
      // User was created but link failed — they can use "Resend confirmation" later
      return NextResponse.json(
        { error: 'Account created but confirmation email could not be sent. Please try logging in or contact support.' },
        { status: 500 }
      )
    }

    // Build the confirmation URL using the token hash from the generated link
    // The generated link points to Supabase's domain — we need to redirect through our app
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
      // Don't fail — user is created, they can request a new link
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
