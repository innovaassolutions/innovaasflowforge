import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { randomBytes } from 'crypto'

interface UpdateUserInput {
  email?: string
  fullName?: string
  userType?: 'consultant' | 'company' | 'admin'
}

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * Verify the requesting user is an admin
 */
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', currentUser.id)
    .single()

  if (!currentProfile || currentProfile.user_type !== 'admin') {
    return { error: 'Forbidden - Admin access required', status: 403 }
  }

  return { currentUser, currentProfile }
}

/**
 * Generate a secure temporary password
 */
function generateTemporaryPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  const bytes = randomBytes(12)
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}

/**
 * PUT /api/admin/users/[id]
 * Update a user (admin only)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdmin()
    if ('error' in adminCheck) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params
    const body: UpdateUserInput = await request.json()

    // Validate at least one field to update
    if (!body.email && !body.fullName && !body.userType) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Update auth user if email or name changed
    if (body.email || body.fullName) {
      const updateData: { email?: string; user_metadata?: { full_name?: string; user_type?: string } } = {}

      if (body.email) {
        updateData.email = body.email
      }

      if (body.fullName || body.userType) {
        updateData.user_metadata = {}
        if (body.fullName) updateData.user_metadata.full_name = body.fullName
        if (body.userType) updateData.user_metadata.user_type = body.userType
      }

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)

      if (authError) {
        console.error('Auth update error:', authError)
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        )
      }
    }

    // Update user_profiles table
    const profileUpdate: Record<string, string> = {}
    if (body.email) profileUpdate.email = body.email
    if (body.fullName) profileUpdate.full_name = body.fullName
    if (body.userType) profileUpdate.user_type = body.userType

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await (supabaseAdmin
        .from('user_profiles') as any)
        .update(profileUpdate)
        .eq('id', id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        // Don't fail completely - auth was updated
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    })

  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (admin only)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdmin()
    if ('error' in adminCheck) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params

    // Prevent deleting yourself
    if (adminCheck.currentUser.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete the user from auth (this will cascade to user_profiles via trigger/RLS)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (deleteError) {
      console.error('User deletion error:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      )
    }

    // Also delete from user_profiles (in case cascade doesn't work)
    await (supabaseAdmin
      .from('user_profiles') as any)
      .delete()
      .eq('id', id)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })

  } catch (error) {
    console.error('Admin user deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users/[id]
 * Resend welcome email with new password (admin only)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdmin()
    if ('error' in adminCheck) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params

    // Get user details
    const { data: user, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(id)

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get profile for full name
    const { data: profile } = await (supabaseAdmin
      .from('user_profiles') as any)
      .select('full_name')
      .eq('id', id)
      .single()

    const fullName = profile?.full_name || user.user.user_metadata?.full_name || 'User'
    const email = user.user.email

    if (!email) {
      return NextResponse.json(
        { error: 'User has no email address' },
        { status: 400 }
      )
    }

    // Generate new temporary password
    const temporaryPassword = generateTemporaryPassword()

    // Update user's password and set password_change_required flag
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: temporaryPassword,
      user_metadata: {
        ...user.user.user_metadata,
        password_change_required: true,
      },
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 400 }
      )
    }

    // Send welcome email with new credentials
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const loginUrl = `${baseUrl}${basePath}/auth/login`

    try {
      await resend.emails.send({
        from: 'FlowForge <admin@innovaas.co>',
        to: email,
        subject: 'FlowForge - Your New Login Credentials',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>FlowForge - New Credentials</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #FFFEFB; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- Header with Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <img src="https://flowforge.innovaas.co/icon-orb.svg" alt="FlowForge" width="60" height="60" style="margin-bottom: 16px;">
                  <h1 style="color: #171614; font-size: 24px; font-weight: 700; margin: 0;">FlowForge</h1>
                  <p style="color: #71706B; font-size: 14px; margin: 8px 0 0;">Assessment Platform</p>
                </div>

                <!-- Content Card -->
                <div style="background-color: #FAF8F3; border: 1px solid #E6E2D6; border-radius: 12px; padding: 32px;">
                  <h2 style="color: #171614; font-size: 22px; font-weight: 600; margin: 0 0 16px;">
                    Hi ${fullName},
                  </h2>

                  <p style="color: #71706B; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                    Your login credentials have been reset. Use the new credentials below to sign in to FlowForge.
                  </p>

                  <!-- Credentials Box -->
                  <div style="background-color: #FFFEFB; border: 1px solid #E6E2D6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <p style="color: #71706B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px;">Email Address</p>
                          <p style="color: #171614; font-size: 15px; font-weight: 500; margin: 0;">${email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #E6E2D6; padding-top: 16px;">
                          <p style="color: #71706B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px;">New Password</p>
                          <code style="color: #171614; font-size: 15px; font-weight: 600; margin: 0; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; background-color: #F2EFE7; padding: 10px 14px; border-radius: 6px; display: inline-block; letter-spacing: 1px;">${temporaryPassword}</code>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Security Notice -->
                  <div style="background-color: #FEF5EE; border-left: 4px solid #F25C05; border-radius: 0 8px 8px 0; padding: 16px; margin: 24px 0;">
                    <p style="color: #171614; font-size: 13px; font-weight: 600; margin: 0 0 4px;">Security Reminder</p>
                    <p style="color: #71706B; font-size: 13px; line-height: 1.5; margin: 0;">
                      Please change your password after signing in to keep your account secure.
                    </p>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 32px 0 0;">
                    <a href="${loginUrl}" style="background-color: #F25C05; border-radius: 8px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 36px; box-shadow: 0 2px 4px rgba(242, 92, 5, 0.2);">
                      Sign In to FlowForge
                    </a>
                  </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E6E2D6;">
                  <p style="color: #71706B; font-size: 12px; margin: 0;">
                    FlowForge Assessment Platform
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      })
      console.log(`✅ Credential reset email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send credential reset email:', emailError)
      return NextResponse.json(
        { error: 'Password reset but failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'New credentials sent to user',
    })

  } catch (error) {
    console.error('Admin resend email error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
