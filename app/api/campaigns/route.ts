import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { randomBytes } from 'crypto'

interface StakeholderInput {
  stakeholderProfileId?: string // Existing profile
  fullName?: string // For new profiles
  email?: string // For new profiles
  position?: string
  department?: string
  dailyTaskDescription?: string
  roleType?: 'managing_director' | 'it_operations' | 'production_manager' |
           'purchasing_manager' | 'planning_scheduler' | 'engineering_maintenance'
}

interface CreateCampaignRequest {
  name: string
  companyProfileId: string // Required: which company is this campaign for
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
    if (!body.name || !body.companyProfileId || !body.facilitatorName || !body.facilitatorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: name, companyProfileId, facilitatorName, facilitatorEmail' },
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

    // Verify user has access to this company profile
    const { data: companyProfile, error: companyError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', body.companyProfileId)
      .single()

    if (companyError || !companyProfile) {
      console.error('❌ Company profile error:', {
        error: companyError,
        companyProfileId: body.companyProfileId
      })
      return NextResponse.json(
        {
          error: 'Company profile not found or you do not have access to it',
          details: companyError?.message
        },
        { status: 404 }
      )
    }

    console.log('✅ Company profile found:', {
      companyId: companyProfile.id,
      companyName: companyProfile.company_name
    })

    // Create campaign linked to company profile
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        campaign_type: 'industry_4_0_readiness',
        company_name: companyProfile.company_name, // Keep for backward compatibility
        company_profile_id: body.companyProfileId,
        facilitator_name: body.facilitatorName,
        facilitator_email: body.facilitatorEmail,
        description: body.description,
        status: 'active',
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

    // Process stakeholders: create profiles if needed, then create assignments
    const emailResults: { success: string[]; failed: string[] } = {
      success: [],
      failed: []
    }

    for (const stakeholder of body.stakeholders) {
      let stakeholderProfileId = stakeholder.stakeholderProfileId

      // If no profile ID provided, create a new stakeholder profile
      if (!stakeholderProfileId) {
        if (!stakeholder.fullName || !stakeholder.email) {
          console.error('Missing stakeholder data for new profile')
          emailResults.failed.push(stakeholder.email || 'unknown')
          continue
        }

        const { data: newProfile, error: profileError } = await supabase
          .from('stakeholder_profiles')
          .insert({
            company_profile_id: body.companyProfileId,
            full_name: stakeholder.fullName,
            email: stakeholder.email,
            role_type: stakeholder.roleType,
            title: stakeholder.position,
            department: stakeholder.department,
            created_by: user.id
          } as any)
          .select()
          .single()

        if (profileError) {
          console.error(`Profile creation error for ${stakeholder.email}:`, profileError)
          emailResults.failed.push(stakeholder.email)
          continue
        }

        stakeholderProfileId = newProfile.id
        console.log(`✅ Created stakeholder profile: ${newProfile.full_name}`)
      }

      // Create campaign assignment
      const accessToken = generateAccessToken()

      const { error: assignmentError } = await supabase
        .from('campaign_assignments')
        .insert({
          campaign_id: campaign.id,
          stakeholder_profile_id: stakeholderProfileId,
          // Keep legacy fields for backward compatibility
          stakeholder_name: stakeholder.fullName,
          stakeholder_email: stakeholder.email,
          stakeholder_role: stakeholder.roleType,
          stakeholder_title: stakeholder.position,
          access_token: accessToken,
          status: 'invited'
        } as any)
        .select()
        .single()

      if (assignmentError) {
        console.error(`Assignment creation error for ${stakeholder.email}:`, assignmentError)
        emailResults.failed.push(stakeholder.email || 'unknown')
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
          to: stakeholder.email!,
          subject: `${body.facilitatorName} has invited you to participate in ${companyProfile.company_name}'s ${body.name}`,
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
                      ${body.facilitatorName} has invited you to participate in <strong>${companyProfile.company_name}'s ${body.name}</strong>.
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
                      Or copy and paste this link: ${accessLink}
                    </p>

                    <p style="color: #a6adc8; font-size: 14px; line-height: 1.6; margin: 16px 0;">
                      Your honest feedback is valuable and will help shape the digital transformation roadmap for ${companyProfile.company_name}.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `
        })

        console.log('✅ Email sent:', result)
        emailResults.success.push(stakeholder.email!)
      } catch (emailError) {
        console.error(`Email send error for ${stakeholder.email}:`, emailError)
        emailResults.failed.push(stakeholder.email!)
      }
    }

    return NextResponse.json({
      success: true,
      campaign,
      emailResults
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/campaigns
 * Get all campaigns for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all campaigns created by this user (works for both consultant and company users)
    // RLS policies will handle access control
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ campaigns }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
