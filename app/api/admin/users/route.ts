import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { randomBytes } from 'crypto'

interface CreateUserInput {
  email: string
  fullName: string
  userType: 'consultant' | 'company'
  sendWelcomeEmail?: boolean
}

/**
 * Generate a secure temporary password
 */
function generateTemporaryPassword(): string {
  // Generate a 12-character password with letters, numbers, and symbols
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  const bytes = randomBytes(12)
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is authenticated and is an admin
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if current user is an admin
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body: CreateUserInput = await request.json()

    // Validate required fields
    if (!body.email || !body.fullName) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
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

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()

    // Create user with Supabase Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: body.fullName,
        user_type: body.userType || 'consultant',
      },
    })

    if (createError) {
      console.error('User creation error:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    // Send welcome email with credentials
    if (body.sendWelcomeEmail !== false) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const loginUrl = `${baseUrl}${basePath}/auth/login`

      try {
        await resend.emails.send({
          from: 'FlowForge <onboarding@resend.dev>',
          to: body.email,
          subject: 'Welcome to FlowForge - Your Account Details',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Welcome to FlowForge</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #FFFEFB; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <!-- Header -->
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #F25C05; font-size: 28px; margin: 0;">FlowForge</h1>
                    <p style="color: #71706B; font-size: 14px; margin: 8px 0 0;">Assessment Platform</p>
                  </div>

                  <!-- Content Card -->
                  <div style="background-color: #FAF8F3; border: 1px solid #E6E2D6; border-radius: 12px; padding: 32px;">
                    <h2 style="color: #171614; font-size: 24px; margin: 0 0 16px;">
                      Welcome, ${body.fullName}!
                    </h2>

                    <p style="color: #71706B; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      Your FlowForge account has been created. Use the credentials below to sign in.
                    </p>

                    <!-- Credentials Box -->
                    <div style="background-color: #FFFEFB; border: 1px solid #E6E2D6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                      <div style="margin-bottom: 16px;">
                        <p style="color: #71706B; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Email</p>
                        <p style="color: #171614; font-size: 16px; font-weight: 500; margin: 0;">${body.email}</p>
                      </div>
                      <div>
                        <p style="color: #71706B; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Temporary Password</p>
                        <p style="color: #171614; font-size: 16px; font-weight: 500; margin: 0; font-family: monospace; background-color: #F2EFE7; padding: 8px 12px; border-radius: 4px; display: inline-block;">${temporaryPassword}</p>
                      </div>
                    </div>

                    <!-- Security Notice -->
                    <div style="background-color: #FEF5EE; border-left: 4px solid #F25C05; border-radius: 0 8px 8px 0; padding: 16px; margin: 24px 0;">
                      <p style="color: #171614; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Security Reminder</p>
                      <p style="color: #71706B; font-size: 14px; margin: 0;">
                        Please change your password after your first login for security purposes.
                      </p>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 32px 0 0;">
                      <a href="${loginUrl}" style="background-color: #F25C05; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">
                        Sign In to FlowForge
                      </a>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E6E2D6;">
                    <p style="color: #71706B; font-size: 12px; margin: 0;">
                      Powered by Innovaas FlowForge
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `
        })
        console.log(`✅ Welcome email sent to ${body.email}`)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the request if email fails - user is still created
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        fullName: body.fullName,
        userType: body.userType || 'consultant',
      },
      emailSent: body.sendWelcomeEmail !== false,
    })

  } catch (error) {
    console.error('Admin user creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the requesting user is authenticated and is an admin
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if current user is an admin
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all users from user_profiles
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name, role, user_type, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch users error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    })

  } catch (error) {
    console.error('Admin list users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
