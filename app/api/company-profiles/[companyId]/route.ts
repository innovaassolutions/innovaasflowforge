import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

interface UpdateCompanyProfileRequest {
  companyName: string
  industry: string
  description?: string
  website?: string
  marketScope: 'local' | 'regional' | 'national' | 'international'
  employeeCountRange?: string
  annualRevenueRange?: string
  headquartersLocation?: string
}

interface RouteContext {
  params: {
    companyId: string
  }
}

/**
 * GET /api/company-profiles/[companyId]
 * Get a specific company profile
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

    // Get company profile (RLS will enforce access control)
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

    return NextResponse.json({ companyProfile }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/company-profiles/[companyId]
 * Update a company profile
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId } = params
    const body: UpdateCompanyProfileRequest = await request.json()

    // Validate required fields
    if (!body.companyName || !body.industry || !body.marketScope) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, industry, marketScope' },
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

    // Verify user has access to this company (RLS will also enforce this)
    const { data: existingCompany, error: checkError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', companyId)
      .single()

    if (checkError || !existingCompany) {
      return NextResponse.json(
        { error: 'Company profile not found or you do not have access to it' },
        { status: 404 }
      )
    }

    // Update company profile
    const { data: companyProfile, error: updateError } = await supabase
      .from('company_profiles')
      .update({
        company_name: body.companyName,
        industry: body.industry,
        description: body.description,
        website: body.website,
        market_scope: body.marketScope,
        employee_count_range: body.employeeCountRange,
        annual_revenue_range: body.annualRevenueRange,
        headquarters_location: body.headquartersLocation,
      } as any)
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Company profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update company profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      companyProfile
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
 * DELETE /api/company-profiles/[companyId]
 * Delete a company profile
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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
    const { data: existingCompany, error: checkError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', companyId)
      .single()

    if (checkError || !existingCompany) {
      return NextResponse.json(
        { error: 'Company profile not found or you do not have access to it' },
        { status: 404 }
      )
    }

    // Delete company profile (cascading delete will handle stakeholders and campaigns)
    const { error: deleteError } = await supabase
      .from('company_profiles')
      .delete()
      .eq('id', companyId)

    if (deleteError) {
      console.error('Company profile deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete company profile', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Company profile deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
