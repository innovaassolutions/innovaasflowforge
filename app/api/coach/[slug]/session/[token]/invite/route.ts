/**
 * Coaching Session Invite API - POST
 *
 * Sends an invitation email to an existing coaching client.
 *
 * Story: 3-3-registration-sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'
import { CoachingInvitationEmail } from '@/lib/email/templates/coaching-invitation'
import type { Database } from '@/types/database'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { slug, token } = await params

    // Authenticate the user
    const authHeader = request.headers.get('Authorization')
    const authToken = authHeader?.replace('Bearer ', '')

    if (!authToken) {
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
            Authorization: `Bearer ${authToken}`,
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

    // Use service client for database operations
    const serviceClient = getServiceClient()

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await serviceClient
      .from('tenant_profiles')
      .select('id, user_id, display_name, brand_config, email_config')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      )
    }

    // Verify the authenticated user owns this tenant
    if (tenant.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you do not own this coach profile' },
        { status: 403 }
      )
    }

    // Get the coaching session by token
    const { data: session, error: sessionError } = await (serviceClient
      .from('coaching_sessions') as any)
      .select('id, client_name, client_email, client_status, access_token')
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Generate the session URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const sessionUrl = `${baseUrl}/flowforge/coach/${slug}/session/${token}`

    // Get coach email from user profile
    const coachEmail = (tenant.email_config as any)?.replyTo || user.email || ''

    // Parse brand config
    const brandConfig = tenant.brand_config as {
      logo?: { url: string; alt?: string }
      colors?: {
        primary?: string
        background?: string
        text?: string
        textMuted?: string
      }
      tagline?: string
      welcomeMessage?: string
    }

    const emailConfig = tenant.email_config as {
      senderName?: string
      emailFooter?: string
    } | null

    // Send the invitation email
    try {
      const senderName = emailConfig?.senderName || tenant.display_name
      // Use verified domain email if configured, otherwise fall back to Resend test domain
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      const fromAddress = `${senderName} <${fromEmail}>`

      console.log(`📧 Sending invite email from: ${fromAddress} to: ${session.client_email}`)

      const result = await resend.emails.send({
        from: fromAddress,
        to: session.client_email,
        replyTo: coachEmail,
        subject: `${tenant.display_name} has invited you to complete your Leadership Archetype Assessment`,
        react: CoachingInvitationEmail({
          participantName: session.client_name,
          coachName: tenant.display_name,
          coachEmail: coachEmail,
          sessionUrl: sessionUrl,
          brandConfig: {
            logo: brandConfig?.logo,
            colors: {
              primary: brandConfig?.colors?.primary,
              background: brandConfig?.colors?.background,
              text: brandConfig?.colors?.text,
              textMuted: brandConfig?.colors?.textMuted,
            },
            tagline: brandConfig?.tagline,
            welcomeMessage: brandConfig?.welcomeMessage,
          },
          emailConfig: {
            senderName: emailConfig?.senderName,
            emailFooter: emailConfig?.emailFooter,
          },
        }),
      })

      if (result.error) {
        console.error('Email send error:', result.error)
        // Provide helpful error message for common Resend issues
        let errorMessage = 'Failed to send email'
        const errorDetails = result.error as any
        if (errorDetails?.message?.includes('can only send to') ||
            errorDetails?.message?.includes('not verified')) {
          errorMessage = 'Email domain not verified. Using test mode (onboarding@resend.dev) only allows sending to the Resend account owner email. Configure RESEND_FROM_EMAIL with a verified domain for production use.'
        }
        return NextResponse.json({
          success: false,
          error: errorMessage,
          details: result.error,
        }, { status: 500 })
      }

      console.log(`✅ Invitation email sent to ${session.client_email}`)
      console.log(`Email ID: ${result.data?.id}`)

      return NextResponse.json({
        success: true,
        message: 'Invitation sent successfully',
        emailId: result.data?.id,
      })

    } catch (emailError: any) {
      console.error('Email send exception:', emailError)
      let errorMessage = 'Failed to send email'
      if (emailError?.message?.includes('can only send to') ||
          emailError?.message?.includes('not verified')) {
        errorMessage = 'Email domain not verified. Configure RESEND_FROM_EMAIL with a verified domain.'
      } else if (emailError?.message?.includes('API key')) {
        errorMessage = 'Invalid Resend API key. Check RESEND_API_KEY environment variable.'
      }
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: emailError.message,
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Invite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
