import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

interface StakeholderInput {
  fullName: string
  email: string
  position: string
  department: string
  dailyTaskDescription: string
  roleType: 'managing_director' | 'it_operations' | 'production_manager' |
           'purchasing_manager' | 'planning_scheduler' | 'engineering_maintenance'
}

interface CreateCampaignRequest {
  name: string
  companyName: string
  facilitatorName: string
  facilitatorEmail: string
  description?: string
  stakeholders: StakeholderInput[]
}

/**
 * Generate a cryptographically secure access token
 */
function generateAccessToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * POST /api/campaigns
 * Create a new campaign and send invitation emails to stakeholders
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCampaignRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.companyName || !body.facilitatorName || !body.facilitatorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: name, companyName, facilitatorName, facilitatorEmail' },
        { status: 400 }
      )
    }

    if (!body.stakeholders || body.stakeholders.length === 0) {
      return NextResponse.json(
        { error: 'At least one stakeholder is required' },
        { status: 400 }
      )
    }

    // Get the authenticated user from the Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - missing authentication token' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth error:', {
        error: authError,
        hasUser: !!user,
        tokenPrefix: token?.substring(0, 20)
      })
      return NextResponse.json(
        { error: 'Unauthorized - invalid or expired token', details: authError?.message },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', {
      userId: user.id,
      email: user.email
    })

    // Get user's organization from user_profiles
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single() as { data: { organization_id: string; full_name: string } | null; error: any }

    if (profileError || !userProfile) {
      console.error('❌ User profile error:', {
        error: profileError,
        userId: user.id,
        hasProfile: !!userProfile
      })
      return NextResponse.json(
        {
          error: 'User profile not found. Please sign out and sign in again to complete your profile setup.',
          details: profileError?.message
        },
        { status: 404 }
      )
    }

    console.log('✅ User profile found:', {
      organizationId: userProfile.organization_id,
      fullName: userProfile.full_name
    })

    // Create campaign with organization_id and created_by
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        name: body.name,
        campaign_type: 'industry_4_0_readiness',
        company_name: body.companyName,
        facilitator_name: body.facilitatorName,
        facilitator_email: body.facilitatorEmail,
        description: body.description,
        status: 'active',
        organization_id: userProfile.organization_id,
        created_by: user.id
      } as any)
      .select()
      .single() as any

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      return NextResponse.json(
        { error: 'Failed to create campaign', details: campaignError.message },
        { status: 500 }
      )
    }

    // Create stakeholder sessions and send emails
    const emailResults: { success: string[]; failed: string[] } = {
      success: [],
      failed: []
    }

    for (const stakeholder of body.stakeholders) {
      const accessToken = generateAccessToken()

      // Create stakeholder session
      const { error: sessionError } = await supabaseAdmin
        .from('stakeholder_sessions')
        .insert({
          campaign_id: campaign.id,
          stakeholder_name: stakeholder.fullName,
          stakeholder_email: stakeholder.email,
          stakeholder_role: stakeholder.roleType,
          stakeholder_title: stakeholder.position,
          access_token: accessToken,
          status: 'invited'
        } as any)
        .select()
        .single()

      if (sessionError) {
        console.error(`Session creation error for ${stakeholder.email}:`, sessionError)
        emailResults.failed.push(stakeholder.email)
        continue
      }

      // Generate access link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const accessLink = `${baseUrl}/session/${accessToken}`

      // Send invitation email
      try {
        console.log(`Sending email to ${stakeholder.email}...`)
        console.log(`Access link: ${accessLink}`)

        const result = await resend.emails.send({
          from: 'Flow Forge <onboarding@resend.dev>',
          to: stakeholder.email,
          subject: `${body.facilitatorName} has invited you to participate in ${body.companyName}'s ${body.name}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Your Input is Requested</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #1e1e2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <!-- Header -->
                  <div style="background-color: #181825; border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
                    <h2 style="color: #F25C05; margin: 0;">Flow Forge</h2>
                  </div>

                  <!-- Content -->
                  <div style="background-color: #313244; border-radius: 0 0 12px 12px; padding: 32px 40px;">
                    <h1 style="color: #F25C05; font-size: 28px; margin: 0 0 24px;">Your Input is Requested</h1>

                    <p style="color: #cdd6f4; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                      Hi <strong>${stakeholder.fullName}</strong>,
                    </p>

                    <p style="color: #cdd6f4; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                      ${body.facilitatorName} has invited you to participate in <strong>${body.companyName}'s ${body.name}</strong>.
                    </p>

                    <div style="background-color: #45475a; border-left: 4px solid #F25C05; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
                      <p style="color: #bac2de; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Your Role</p>
                      <p style="color: #F25C05; font-size: 18px; font-weight: 700; margin: 0 0 16px;">${stakeholder.position}</p>
                      <p style="color: #bac2de; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Estimated Time</p>
                      <p style="color: #F25C05; font-size: 18px; font-weight: 700; margin: 0;">20-30 minutes</p>
                    </div>

                    <p style="color: #cdd6f4; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                      This AI-guided interview will help us understand your perspective on:
                    </p>

                    <ul style="color: #cdd6f4; font-size: 16px; line-height: 1.6; margin: 16px 0; padding-left: 20px;">
                      <li style="margin: 8px 0;">Current technology infrastructure and systems</li>
                      <li style="margin: 8px 0;">Data integration challenges and opportunities</li>
                      <li style="margin: 8px 0;">Operational bottlenecks and inefficiencies</li>
                      <li style="margin: 8px 0;">Opportunities for digital transformation</li>
                    </ul>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${accessLink}" style="background-color: #F25C05; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">Start Your Interview</a>
                    </div>

                    <p style="color: #a6adc8; font-size: 14px; text-align: center; margin: 16px 0;">
                      Or copy and paste this URL into your browser:<br>
                      <a href="${accessLink}" style="color: #1D9BA3; text-decoration: underline; word-break: break-all;">${accessLink}</a>
                    </p>
                  </div>

                  <!-- Footer -->
                  <div style="border-top: 1px solid #45475a; margin-top: 32px; padding-top: 24px; text-align: center;">
                    <p style="color: #6c7086; font-size: 12px; margin: 8px 0;">
                      Powered by Innovaas Flow Forge
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `
        })

        console.log(`✅ Email sent successfully to ${stakeholder.email}`)
        console.log(`Full Resend response:`, JSON.stringify(result, null, 2))
        emailResults.success.push(stakeholder.email)
      } catch (emailError: any) {
        console.error(`❌ Email send error for ${stakeholder.email}:`)
        console.error(`Error type: ${emailError?.constructor?.name}`)
        console.error(`Error message: ${emailError?.message}`)
        console.error(`Error details:`, JSON.stringify(emailError, null, 2))
        emailResults.failed.push(stakeholder.email)
      }
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        companyName: campaign.company_name,
        status: campaign.status
      },
      emailResults,
      message: `Campaign created. Emails sent: ${emailResults.success.length}/${body.stakeholders.length}`
    })

  } catch (error) {
    console.error('Campaign creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/campaigns
 * List all campaigns (optionally filtered by facilitator email)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const facilitatorEmail = searchParams.get('facilitatorEmail')

    let query = supabaseAdmin
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (facilitatorEmail) {
      query = query.eq('facilitator_email', facilitatorEmail)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Campaign fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaigns
    })

  } catch (error) {
    console.error('Campaign fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
