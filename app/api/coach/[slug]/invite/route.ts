/**
 * Coaching Invitation API
 *
 * Allows authenticated coaches to send invitation emails to clients
 * for their archetype assessment.
 *
 * Story: 3-3-registration-sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin, getTenantBySlug, TenantProfile } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { CoachingInvitationEmail } from '@/lib/email/templates/coaching-invitation'
import { randomBytes } from 'crypto'
import type { Database } from '@/types/database'

interface InviteRequest {
  clientName: string
  clientEmail: string
}

/**
 * Generate a cryptographically secure access token
 */
function generateAccessToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * POST /api/coach/[slug]/invite
 * Send an invitation email to a client for archetype assessment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body: InviteRequest = await request.json()

    // Validate required fields
    if (!body.clientName || !body.clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, clientEmail' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.clientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get the tenant by slug
    const tenant = await getTenantBySlug(slug)
    if (!tenant) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      )
    }

    // Authenticate the user
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - missing authentication token' },
        { status: 401 }
      )
    }

    // Create a Supabase client with the user's JWT token
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or expired token' },
        { status: 401 }
      )
    }

    // Verify the authenticated user owns this tenant
    if (tenant.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you do not own this coach profile' },
        { status: 403 }
      )
    }

    // Generate access token for the session
    const accessToken = generateAccessToken()

    // Create the participant session using the view (which triggers INSERT rule)
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('participant_sessions')
      .insert({
        tenant_id: tenant.id,
        stakeholder_name: body.clientName,
        stakeholder_email: body.clientEmail,
        access_token: accessToken,
        status: 'invited',
        client_status: 'invited',
      } as any)
      .select()
      .single()

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session', details: sessionError.message },
        { status: 500 }
      )
    }

    // Generate the session URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const sessionUrl = `${baseUrl}/coach/${slug}/session/${accessToken}`

    // Get coach email from user profile or tenant config
    const coachEmail = tenant.email_config?.replyTo || user.email || ''

    // Send the invitation email using the branded template
    try {
      const senderName = tenant.email_config?.senderName || tenant.display_name
      const fromAddress = `${senderName} <onboarding@resend.dev>`

      const result = await resend.emails.send({
        from: fromAddress,
        to: body.clientEmail,
        replyTo: coachEmail,
        subject: `${tenant.display_name} has invited you to complete your Leadership Archetype Assessment`,
        react: CoachingInvitationEmail({
          participantName: body.clientName,
          coachName: tenant.display_name,
          coachEmail: coachEmail,
          sessionUrl: sessionUrl,
          brandConfig: {
            logo: tenant.brand_config.logo,
            colors: {
              primary: tenant.brand_config.colors.primary,
              background: tenant.brand_config.colors.background,
              text: tenant.brand_config.colors.text,
              textMuted: tenant.brand_config.colors.textMuted,
            },
            tagline: tenant.brand_config.tagline,
            welcomeMessage: tenant.brand_config.welcomeMessage,
          },
          emailConfig: {
            senderName: tenant.email_config?.senderName,
            emailFooter: tenant.email_config?.emailFooter,
          },
        }),
      })

      if (result.error) {
        console.error('Email send error:', result.error)
        // Session was created, but email failed - update status and return partial success
        await (supabaseAdmin
          .from('campaign_assignments') as any)
          .update({ status: 'email_failed' })
          .eq('id', (session as any).id)

        return NextResponse.json({
          success: true,
          warning: 'Session created but email failed to send',
          session: {
            id: (session as any).id,
            accessToken,
            sessionUrl,
          },
          emailError: result.error,
        })
      }

      console.log(`✅ Invitation email sent to ${body.clientEmail}`)
      console.log(`Email ID: ${result.data?.id}`)

      return NextResponse.json({
        success: true,
        message: 'Invitation sent successfully',
        session: {
          id: (session as any).id,
          accessToken,
          sessionUrl,
        },
        emailId: result.data?.id,
      })

    } catch (emailError: any) {
      console.error('Email send exception:', emailError)

      // Session was created, but email failed
      await (supabaseAdmin
        .from('campaign_assignments') as any)
        .update({ status: 'email_failed' })
        .eq('id', (session as any).id)

      return NextResponse.json({
        success: true,
        warning: 'Session created but email failed to send',
        session: {
          id: (session as any).id,
          accessToken,
          sessionUrl,
        },
        emailError: emailError.message,
      })
    }

  } catch (error) {
    console.error('Invite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
