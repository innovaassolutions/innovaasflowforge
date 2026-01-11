import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { randomBytes } from 'crypto'

interface CreateUserInput {
  email: string
  fullName: string
  userType: 'consultant' | 'company' | 'admin' | 'coach'
  sendWelcomeEmail?: boolean
  // Tenant profile fields (for consultant, coach, company)
  displayName?: string
  slug?: string
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

    // Check if current user is a platform admin (user_type = 'admin')
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile || currentProfile.user_type !== 'admin') {
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

    // Check if this is a tenant type (needs profile setup)
    const isTenantType = ['consultant', 'coach', 'company'].includes(body.userType)

    // Validate tenant profile fields for consultant, coach, and company
    if (isTenantType) {
      const typeLabel = body.userType === 'company' ? 'schools' : `${body.userType}s`

      if (!body.displayName?.trim()) {
        return NextResponse.json(
          { error: `Display name is required for ${typeLabel}` },
          { status: 400 }
        )
      }
      if (!body.slug?.trim()) {
        return NextResponse.json(
          { error: `URL slug is required for ${typeLabel}` },
          { status: 400 }
        )
      }

      // Validate slug format (lowercase, alphanumeric with hyphens)
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugRegex.test(body.slug)) {
        return NextResponse.json(
          { error: 'Slug must be lowercase letters, numbers, and hyphens only' },
          { status: 400 }
        )
      }

      // Check if slug is already taken
      const { data: existingTenant } = await supabaseAdmin
        .from('tenant_profiles')
        .select('id')
        .eq('slug', body.slug)
        .single()

      if (existingTenant) {
        return NextResponse.json(
          { error: 'This URL slug is already taken. Please choose a different one.' },
          { status: 400 }
        )
      }
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
        password_change_required: true, // Force password change on first login
      },
    })

    if (createError) {
      console.error('User creation error:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    // Update user_profiles table with the correct user_type
    // The trigger creates the profile, but we need to update user_type
    // Using type assertion to bypass strict TypeScript checking
    const { error: profileUpdateError } = await (supabaseAdmin
      .from('user_profiles') as any)
      .update({ user_type: body.userType || 'consultant' })
      .eq('id', newUser.user.id)

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError)
      // Don't fail - user was created, just log the error
    }

    // Create tenant_profile for consultant, coach, and company/school
    let tenantId: string | null = null
    if (isTenantType) {
      const { data: tenant, error: tenantError } = await (supabaseAdmin
        .from('tenant_profiles') as any)
        .insert({
          user_id: newUser.user.id,
          slug: body.slug,
          display_name: body.displayName,
          is_active: true,
          brand_config: {
            colors: {
              primary: '#F25C05',
              secondary: '#1D9BA3',
              background: '#FFFEFB',
              text: '#171614',
              textMuted: '#71706B',
              border: '#E6E2D6',
              bgSubtle: '#FAF8F3'
            },
            fonts: {
              heading: 'Inter, sans-serif',
              body: 'Inter, sans-serif'
            }
          }
        })
        .select('id')
        .single()

      if (tenantError) {
        console.error('Tenant creation error:', tenantError)
        // Log but don't fail - user was created
      } else if (tenant) {
        tenantId = tenant.id
        console.log(`✅ Tenant profile created for ${body.userType}: ${body.slug}`)
      }
    }

    // Send welcome email with credentials
    if (body.sendWelcomeEmail !== false) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const loginUrl = `${baseUrl}/auth/login`

      try {
        await resend.emails.send({
          from: 'FlowForge <admin@innovaas.co>',
          to: body.email,
          subject: 'Welcome to FlowForge - Your Account Details',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to FlowForge</title>
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
                      Welcome, ${body.fullName}!
                    </h2>

                    <p style="color: #71706B; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                      Your FlowForge account has been created. Use the credentials below to sign in to the platform.
                    </p>

                    <!-- Credentials Box -->
                    <div style="background-color: #FFFEFB; border: 1px solid #E6E2D6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding-bottom: 16px;">
                            <p style="color: #71706B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px;">Email Address</p>
                            <p style="color: #171614; font-size: 15px; font-weight: 500; margin: 0;">${body.email}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px solid #E6E2D6; padding-top: 16px;">
                            <p style="color: #71706B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px;">Temporary Password</p>
                            <code style="color: #171614; font-size: 15px; font-weight: 600; margin: 0; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; background-color: #F2EFE7; padding: 10px 14px; border-radius: 6px; display: inline-block; letter-spacing: 1px;">${temporaryPassword}</code>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Security Notice -->
                    <div style="background-color: #FEF5EE; border-left: 4px solid #F25C05; border-radius: 0 8px 8px 0; padding: 16px; margin: 24px 0;">
                      <p style="color: #171614; font-size: 13px; font-weight: 600; margin: 0 0 4px;">Security Reminder</p>
                      <p style="color: #71706B; font-size: 13px; line-height: 1.5; margin: 0;">
                        Please change your password after your first login to keep your account secure.
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
        ...(isTenantType && {
          tenantId,
          slug: body.slug,
          displayName: body.displayName,
        }),
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

    // Check if current user is a platform admin (user_type = 'admin')
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile || currentProfile.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all users from user_profiles
    const { data: users, error: fetchError } = await (supabaseAdmin
      .from('user_profiles') as any)
      .select('id, email, full_name, role, user_type, created_at, last_seen_at')
      .order('created_at', { ascending: false }) as { data: Array<{
        id: string
        email: string
        full_name: string
        role: string
        user_type: string | null
        created_at: string
        last_seen_at: string | null
      }> | null, error: any }

    if (fetchError) {
      console.error('Fetch users error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Fetch tenant profiles for consultant, coach, and company users
    const tenantUserIds = (users || [])
      .filter(u => ['consultant', 'coach', 'company'].includes(u.user_type || ''))
      .map(u => u.id)

    let tenantMap: Record<string, { slug: string; display_name: string }> = {}

    if (tenantUserIds.length > 0) {
      const { data: tenants } = await (supabaseAdmin
        .from('tenant_profiles') as any)
        .select('user_id, slug, display_name')
        .in('user_id', tenantUserIds) as { data: Array<{
          user_id: string
          slug: string
          display_name: string
        }> | null }

      if (tenants) {
        tenantMap = tenants.reduce((acc, t) => {
          acc[t.user_id] = { slug: t.slug, display_name: t.display_name }
          return acc
        }, {} as Record<string, { slug: string; display_name: string }>)
      }
    }

    // Merge tenant info into users
    const usersWithTenant = (users || []).map(user => ({
      ...user,
      tenant_slug: tenantMap[user.id]?.slug || null,
      tenant_display_name: tenantMap[user.id]?.display_name || null,
    }))

    return NextResponse.json({
      success: true,
      users: usersWithTenant,
    })

  } catch (error) {
    console.error('Admin list users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
