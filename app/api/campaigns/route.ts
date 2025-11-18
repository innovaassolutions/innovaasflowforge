import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase/server'
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
    const stakeholderAssignments: Array<{
      stakeholder_name: string
      stakeholder_email: string
      access_token: string
      access_link: string
    }> = []

    for (const stakeholder of body.stakeholders) {
      let stakeholderProfileId = stakeholder.stakeholderProfileId
      let stakeholderName = ''
      let stakeholderEmail = ''
      let stakeholderRole = ''
      let stakeholderTitle = ''

      // If profile ID provided, fetch the existing profile data (use admin client)
      if (stakeholderProfileId) {
        const { data: existingProfile, error: fetchError } = (await supabaseAdmin
          .from('stakeholder_profiles')
          .select('full_name, email, role_type, title')
          .eq('id', stakeholderProfileId)
          .single()) as any

        if (fetchError || !existingProfile) {
          console.error(`Error fetching stakeholder profile ${stakeholderProfileId}:`, fetchError)
          continue
        }

        stakeholderName = existingProfile.full_name
        stakeholderEmail = existingProfile.email
        stakeholderRole = existingProfile.role_type
        stakeholderTitle = existingProfile.title || ''
      } else {
        // Create a new stakeholder profile (use admin client to bypass RLS)
        if (!stakeholder.fullName || !stakeholder.email) {
          console.error('Missing stakeholder data for new profile')
          continue
        }

        const { data: newProfile, error: profileError } = (await supabaseAdmin
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
          .single()) as any

        if (profileError) {
          console.error(`Profile creation error for ${stakeholder.email}:`, profileError)
          continue
        }

        stakeholderProfileId = newProfile.id
        stakeholderName = newProfile.full_name
        stakeholderEmail = newProfile.email
        stakeholderRole = newProfile.role_type
        stakeholderTitle = newProfile.title || ''
        console.log(`✅ Created stakeholder profile: ${newProfile.full_name}`)
      }

      // Create campaign assignment (use admin client to bypass RLS)
      const accessToken = generateAccessToken()

      const { error: assignmentError } = await supabaseAdmin
        .from('campaign_assignments')
        .insert({
          campaign_id: campaign.id,
          stakeholder_profile_id: stakeholderProfileId,
          // Keep legacy fields for backward compatibility
          stakeholder_name: stakeholderName,
          stakeholder_email: stakeholderEmail,
          stakeholder_role: stakeholderRole,
          stakeholder_title: stakeholderTitle,
          access_token: accessToken,
          status: 'invited'
        } as any)
        .select()
        .single()

      if (assignmentError) {
        console.error(`Assignment creation error for ${stakeholderEmail}:`, assignmentError)
        continue
      }

      // Generate access link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const accessLink = `${baseUrl}/session/${accessToken}`

      // Store assignment info for response (no email sending)
      stakeholderAssignments.push({
        stakeholder_name: stakeholderName,
        stakeholder_email: stakeholderEmail,
        access_token: accessToken,
        access_link: accessLink
      })

      console.log(`✅ Created assignment for ${stakeholderName} (${stakeholderEmail})`)
    }

    return NextResponse.json({
      success: true,
      campaign,
      stakeholderAssignments
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
