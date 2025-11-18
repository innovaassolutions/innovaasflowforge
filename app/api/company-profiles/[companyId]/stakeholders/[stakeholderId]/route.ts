import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

interface UpdateStakeholderProfileRequest {
  fullName: string
  email: string
  roleType: 'managing_director' | 'it_operations' | 'production_manager' |
           'purchasing_manager' | 'planning_scheduler' | 'engineering_maintenance'
  title?: string
  department?: string
}

interface RouteContext {
  params: Promise<{
    companyId: string
    stakeholderId: string
  }>
}

/**
 * GET /api/company-profiles/[companyId]/stakeholders/[stakeholderId]
 * Get a specific stakeholder profile
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, stakeholderId } = await params

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

    // Verify user has access to this company
    const { data: companyProfile, error: companyError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found or you do not have access to it' },
        { status: 404 }
      )
    }

    // Get stakeholder profile
    const { data: stakeholder, error: stakeholderError } = await supabase
      .from('stakeholder_profiles')
      .select('*')
      .eq('id', stakeholderId)
      .eq('company_profile_id', companyId)
      .single()

    if (stakeholderError || !stakeholder) {
      return NextResponse.json(
        { error: 'Stakeholder profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ stakeholder }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/company-profiles/[companyId]/stakeholders/[stakeholderId]
 * Update a stakeholder profile
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, stakeholderId } = await params
    const body: UpdateStakeholderProfileRequest = await request.json()

    // Validate required fields
    if (!body.fullName || !body.email || !body.roleType) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email, roleType' },
        { status: 400 }
      )
    }

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

    // Verify user has access to this company
    const { data: companyProfile, error: companyError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found or you do not have access to it' },
        { status: 404 }
      )
    }

    // Verify stakeholder exists and belongs to this company
    const { data: existingStakeholder, error: checkError } = await supabase
      .from('stakeholder_profiles')
      .select('*')
      .eq('id', stakeholderId)
      .eq('company_profile_id', companyId)
      .single()

    if (checkError || !existingStakeholder) {
      return NextResponse.json(
        { error: 'Stakeholder profile not found' },
        { status: 404 }
      )
    }

    // Update stakeholder profile
    const { data: stakeholder, error: updateError } = await supabase
      .from('stakeholder_profiles')
      .update({
        full_name: body.fullName,
        email: body.email,
        role_type: body.roleType,
        title: body.title,
        department: body.department,
      } as any)
      .eq('id', stakeholderId)
      .select()
      .single()

    if (updateError) {
      console.error('Stakeholder profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update stakeholder profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      stakeholder
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/company-profiles/[companyId]/stakeholders/[stakeholderId]
 * Delete a stakeholder profile
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, stakeholderId } = await params

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

    // Verify user has access to this company
    const { data: companyProfile, error: companyError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found or you do not have access to it' },
        { status: 404 }
      )
    }

    // Verify stakeholder exists and belongs to this company
    const { data: existingStakeholder, error: checkError } = await supabase
      .from('stakeholder_profiles')
      .select('*')
      .eq('id', stakeholderId)
      .eq('company_profile_id', companyId)
      .single()

    if (checkError || !existingStakeholder) {
      return NextResponse.json(
        { error: 'Stakeholder profile not found' },
        { status: 404 }
      )
    }

    // Delete stakeholder profile
    const { error: deleteError } = await supabase
      .from('stakeholder_profiles')
      .delete()
      .eq('id', stakeholderId)

    if (deleteError) {
      console.error('Stakeholder profile deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete stakeholder profile', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Stakeholder profile deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
