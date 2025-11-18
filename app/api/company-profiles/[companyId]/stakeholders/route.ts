import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

interface CreateStakeholderProfileRequest {
  fullName: string
  email: string
  roleType: 'managing_director' | 'it_operations' | 'production_manager' |
           'purchasing_manager' | 'planning_scheduler' | 'engineering_maintenance'
  title?: string
  department?: string
}

interface RouteContext {
  params: {
    companyId: string
  }
}

/**
 * POST /api/company-profiles/[companyId]/stakeholders
 * Create a new stakeholder profile for a company
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId } = params
    const body: CreateStakeholderProfileRequest = await request.json()

    // Validate required fields
    if (!body.fullName || !body.email || !body.roleType) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email, roleType' },
        { status: 400 }
      )
    }

    // Get authenticated user
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

    // Create stakeholder profile
    const { data: stakeholder, error: stakeholderError } = await supabase
      .from('stakeholder_profiles')
      .insert({
        company_profile_id: companyId,
        full_name: body.fullName,
        email: body.email,
        role_type: body.roleType,
        title: body.title,
        department: body.department,
        created_by: user.id
      } as any)
      .select()
      .single()

    if (stakeholderError) {
      console.error('Stakeholder profile creation error:', stakeholderError)
      return NextResponse.json(
        { error: 'Failed to create stakeholder profile', details: stakeholderError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      stakeholder
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/company-profiles/[companyId]/stakeholders
 * Get all stakeholder profiles for a company
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId } = params

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

    // Get all stakeholders for this company (RLS will filter appropriately)
    const { data: stakeholders, error } = await supabase
      .from('stakeholder_profiles')
      .select('*')
      .eq('company_profile_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching stakeholders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stakeholders', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ stakeholders }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
