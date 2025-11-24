import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

interface CreateCompanyProfileRequest {
  companyName: string
  industry: string
  description?: string
  website?: string
  marketScope: 'local' | 'regional' | 'national' | 'international'
  employeeCountRange?: string
  annualRevenueRange?: string
  headquartersLocation?: string
}

/**
 * POST /api/company-profiles
 * Create a new company profile
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCompanyProfileRequest = await request.json()

    // Validate required fields
    if (!body.companyName || !body.industry || !body.marketScope) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, industry, marketScope' },
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

    // Create company profile
    const { data: companyProfile, error: companyError } = await supabase
      .from('company_profiles')
      .insert({
        company_name: body.companyName,
        industry: body.industry,
        description: body.description,
        website: body.website,
        market_scope: body.marketScope,
        employee_count_range: body.employeeCountRange,
        annual_revenue_range: body.annualRevenueRange,
        headquarters_location: body.headquartersLocation,
        created_by: user.id
      } as any)
      .select()
      .single()

    if (companyError) {
      console.error('Company profile creation error:', companyError)
      return NextResponse.json(
        { error: 'Failed to create company profile', details: companyError.message },
        { status: 500 }
      )
    }

    // If user is a 'company' type user, link them to this company profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type, company_profile_id')
      .eq('id', user.id)
      .single()

    if (userProfile?.user_type === 'company' && !userProfile.company_profile_id) {
      await supabase
        .from('user_profiles')
        .update({ company_profile_id: companyProfile.id } as any)
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      companyProfile
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
 * GET /api/company-profiles
 * Get all company profiles for the authenticated user
 * - Consultants see all companies they created
 * - Company users see their own company
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
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single() as any

    const isAdmin = userProfile?.user_type === 'admin'

    // Admins can see ALL companies (bypass RLS)
    // Regular users see companies based on RLS policies
    const { data: companies, error } = isAdmin
      ? await supabaseAdmin
          .from('company_profiles')
          .select('*')
          .order('created_at', { ascending: false })
      : await supabase
          .from('company_profiles')
          .select('*')
          .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies', details: error.message },
        { status: 500 }
      )
    }

    console.log(`[Companies GET] User ${user.email} (${isAdmin ? 'admin' : 'user'}) fetched ${companies?.length || 0} companies`)

    return NextResponse.json({ companies }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
