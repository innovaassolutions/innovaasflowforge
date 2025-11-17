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

/**
 * Generate a cryptographically secure access token
 */
function generateAccessToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * POST /api/campaigns/[id]/stakeholders
 * Add new stakeholders to an existing campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const body = await request.json()

    if (!body.stakeholders || body.stakeholders.length === 0) {
      return NextResponse.json(
        { error: 'At least one stakeholder is required' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single() as any

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Create stakeholder sessions and send emails
    const emailResults: { success: string[]; failed: string[] } = {
      success: [],
      failed: []
    }

    const newStakeholderIds: string[] = []

    for (const stakeholder of body.stakeholders as StakeholderInput[]) {
      const accessToken = generateAccessToken()

      // Create stakeholder session
      const { data: newSession, error: sessionError } = await supabaseAdmin
        .from('stakeholder_sessions')
        .insert({
          campaign_id: campaignId,
          stakeholder_name: stakeholder.fullName,
          stakeholder_email: stakeholder.email,
          stakeholder_role: stakeholder.roleType,
          stakeholder_title: stakeholder.position,
          access_token: accessToken,
          status: 'invited'
        } as any)
        .select()
        .single() as any

      if (sessionError) {
        console.error(`Session creation error for ${stakeholder.email}:`, sessionError)
        emailResults.failed.push(stakeholder.email)
        continue
      }

      newStakeholderIds.push(newSession.id)

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
          subject: `${campaign.facilitator_name} has invited you to participate in ${campaign.company_name}'s ${campaign.name}`,
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
                      ${campaign.facilitator_name} has invited you to participate in <strong>${campaign.company_name}'s ${campaign.name}</strong>.
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
        console.log(`Email ID: ${result.data?.id}`)
        emailResults.success.push(stakeholder.email)
      } catch (emailError: any) {
        console.error(`❌ Email send error for ${stakeholder.email}:`, emailError)
        emailResults.failed.push(stakeholder.email)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${newStakeholderIds.length} stakeholder(s)`,
      stakeholderIds: newStakeholderIds,
      emailResults
    })

  } catch (error) {
    console.error('Add stakeholders error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
