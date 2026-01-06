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
  companyProfileId?: string // Optional: only required for industry4 assessment type
  assessmentType?: 'industry4' | 'archetype' | 'education' | 'custom' // Assessment type
  facilitatorName: string
  facilitatorEmail: string
  description?: string
  stakeholders: StakeholderInput[]
  // For non-company campaigns (coaches/institutions), simple participants
  participants?: Array<{
    name: string
    email: string
  }>
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

    // Determine assessment type (default to industry4 for backward compatibility)
    const assessmentType = body.assessmentType || 'industry4'

    // Validate required fields
    if (!body.name || !body.facilitatorName || !body.facilitatorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: name, facilitatorName, facilitatorEmail' },
        { status: 400 }
      )
    }

    // Company is only required for industry4 assessment type
    if (assessmentType === 'industry4' && !body.companyProfileId) {
      return NextResponse.json(
        { error: 'Company profile is required for Industry 4.0 assessments' },
        { status: 400 }
      )
    }

    // Validate participants - either stakeholders (company-based) or participants (simple)
    const hasStakeholders = body.stakeholders && body.stakeholders.length > 0
    const hasParticipants = body.participants && body.participants.length > 0

    if (!hasStakeholders && !hasParticipants) {
      return NextResponse.json(
        { error: 'At least one participant or stakeholder is required' },
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

    // Fetch user's tenant_id from their tenant_profile
    const { data: tenantProfile } = (await supabaseAdmin
      .from('tenant_profiles')
      .select('id, display_name')
      .eq('user_id', user.id)
      .single()) as any

    // tenant_id is optional - some legacy users may not have tenant profiles
    const tenantId = tenantProfile?.id || null
    console.log('📋 Tenant profile:', tenantId ? `Found (${tenantProfile?.display_name})` : 'Not found (legacy user)')

    // Company profile validation - only required for industry4 assessment type
    let companyProfile: { id: string; company_name: string } | null = null

    if (assessmentType === 'industry4') {
      // Verify user has access to this company profile
      const { data: company, error: companyError } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', body.companyProfileId)
        .single()

      if (companyError || !company) {
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

      companyProfile = { id: company.id, company_name: company.company_name }
      console.log('✅ Company profile found:', {
        companyId: companyProfile!.id,
        companyName: companyProfile!.company_name
      })
    }

    // Create campaign with tenant association
    const campaignData: Record<string, any> = {
      name: body.name,
      campaign_type: 'industry_4_0_readiness', // Legacy field
      assessment_type: assessmentType,
      facilitator_name: body.facilitatorName,
      facilitator_email: body.facilitatorEmail,
      description: body.description,
      status: 'active',
      created_by: user.id,
      tenant_id: tenantId, // Link to tenant for branding and filtering
    }

    // Add company fields only for industry4 assessments
    if (companyProfile) {
      campaignData.company_name = companyProfile.company_name // Backward compatibility
      campaignData.company_profile_id = body.companyProfileId
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single() as any

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      return NextResponse.json(
        { error: 'Failed to create campaign', details: campaignError.message },
        { status: 500 }
      )
    }

    // Process participants: either stakeholders (company-based) or simple participants
    const participantAssignments: Array<{
      stakeholder_name: string
      stakeholder_email: string
      access_token: string
      access_link: string
    }> = []

    // Helper to generate access link
    const generateAccessLink = (token: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      return `${baseUrl}${basePath}/session/${token}`
    }

    // Process simple participants (non-company campaigns: coaches, institutions)
    if (hasParticipants && body.participants) {
      console.log(`📋 Processing ${body.participants.length} simple participants`)

      for (const participant of body.participants) {
        if (!participant.name || !participant.email) {
          console.error('Missing participant data:', participant)
          continue
        }

        const accessToken = generateAccessToken()

        // Create campaign assignment without stakeholder profile
        const { data: assignmentData, error: assignmentError } = (await supabaseAdmin
          .from('campaign_assignments')
          .insert({
            campaign_id: campaign.id,
            stakeholder_name: participant.name,
            stakeholder_email: participant.email,
            access_token: accessToken,
            status: 'invited'
          } as any)
          .select()
          .single()) as any

        if (assignmentError) {
          console.error(`❌ Assignment creation FAILED for ${participant.email}:`, assignmentError)
          continue
        }

        participantAssignments.push({
          stakeholder_name: participant.name,
          stakeholder_email: participant.email,
          access_token: accessToken,
          access_link: generateAccessLink(accessToken)
        })

        console.log(`✅ Created assignment for ${participant.name} (${participant.email})`)
      }
    }

    // Process stakeholders (company-based campaigns: industry4)
    if (hasStakeholders && body.stakeholders) {
      console.log(`📋 Processing ${body.stakeholders.length} stakeholders`)

    for (const stakeholder of body.stakeholders) {
      let stakeholderProfileId = stakeholder.stakeholderProfileId
      let stakeholderName = ''
      let stakeholderEmail = ''
      let stakeholderRole = ''
      let stakeholderTitle = ''

      // If profile ID provided, fetch the existing profile data (use admin client)
      if (stakeholderProfileId) {
        console.log(`🔍 Fetching stakeholder profile: ${stakeholderProfileId}`)
        const { data: existingProfile, error: fetchError } = (await supabaseAdmin
          .from('stakeholder_profiles')
          .select('full_name, email, role_type, title, company_profile_id')
          .eq('id', stakeholderProfileId)
          .single()) as any

        if (fetchError || !existingProfile) {
          console.error(`❌ Error fetching stakeholder profile ${stakeholderProfileId}:`, JSON.stringify(fetchError, null, 2))
          console.error(`❌ Profile data:`, existingProfile)
          console.error(`❌ Service role key set:`, !!process.env.SUPABASE_SERVICE_ROLE_KEY)
          console.error(`❌ Service role key length:`, process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
          continue
        }

        // SECURITY CHECK: Verify stakeholder belongs to the same company
        if (existingProfile.company_profile_id !== body.companyProfileId) {
          console.error(`Security violation: Stakeholder ${stakeholderProfileId} belongs to different company`)
          continue
        }

        console.log(`✅ Successfully fetched stakeholder: ${existingProfile.full_name}`)
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

      console.log(`🔨 Creating assignment for ${stakeholderName}:`, {
        campaign_id: campaign.id,
        stakeholder_profile_id: stakeholderProfileId,
        stakeholder_email: stakeholderEmail,
        stakeholder_role: stakeholderRole
      })

      const { data: assignmentData, error: assignmentError } = (await supabaseAdmin
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
        .single()) as any

      if (assignmentError) {
        console.error(`❌ Assignment creation FAILED for ${stakeholderEmail}:`, {
          error: assignmentError,
          code: assignmentError.code,
          message: assignmentError.message,
          details: assignmentError.details,
          hint: assignmentError.hint
        })
        continue
      }

      if (!assignmentData) {
        console.error(`❌ Assignment created but no data returned for ${stakeholderEmail}`)
        continue
      }

      console.log(`✅ Assignment created successfully:`, assignmentData.id)

      // Store assignment info for response (no email sending)
      participantAssignments.push({
        stakeholder_name: stakeholderName,
        stakeholder_email: stakeholderEmail,
        access_token: accessToken,
        access_link: generateAccessLink(accessToken)
      })

      console.log(`✅ Created assignment for ${stakeholderName} (${stakeholderEmail})`)
    }
    } // End stakeholder processing block

    return NextResponse.json({
      success: true,
      campaign,
      participantAssignments
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

    // Check if user is an admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single() as any

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: profileError.message },
        { status: 500 }
      )
    }

    if (!userProfile) {
      console.error('❌ User profile not found for user:', user.id)
      return NextResponse.json(
        { error: 'User profile not found - please contact support' },
        { status: 404 }
      )
    }

    const isAdmin = userProfile.user_type === 'admin'

    // Admins can see ALL campaigns (bypass RLS)
    // Regular users see campaigns based on RLS policies
    const { data: campaigns, error } = isAdmin
      ? await supabaseAdmin
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })
      : await supabase
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

    console.log(`[Campaigns GET] User ${user.email} (${isAdmin ? 'admin' : 'user'}) fetched ${campaigns?.length || 0} campaigns`)

    return NextResponse.json({ campaigns }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
