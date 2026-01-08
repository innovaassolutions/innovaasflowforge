/**
 * Admin Activity API
 *
 * Returns login history with pagination and filtering.
 * Admin-only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface LoginHistoryRecord {
  id: string
  user_id: string
  login_at: string
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  auth_method: string | null
  success: boolean
  failure_reason: string | null
  created_at: string
}

interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  user_type: string | null
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const userId = searchParams.get('userId')
    const deviceType = searchParams.get('deviceType')
    const success = searchParams.get('success')
    const search = searchParams.get('search')

    // Build query
    let query = supabaseAdmin
      .from('login_history')
      .select('*', { count: 'exact' })
      .order('login_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (deviceType) {
      query = query.eq('device_type', deviceType)
    }
    if (success !== null && success !== undefined) {
      query = query.eq('success', success === 'true')
    }

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching login history:', error)
      return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 })
    }

    const logins = data as LoginHistoryRecord[] | null

    // Fetch user details for each login
    const userIds = [...new Set(logins?.map((l) => l.user_id) || [])]
    const { data: usersData } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name, user_type')
      .in('id', userIds)

    const users = usersData as UserProfile[] | null
    const userMap = new Map(users?.map((u) => [u.id, u]) || [])

    // Enrich logins with user info
    const enrichedLogins = logins?.map((login) => {
      const userInfo = userMap.get(login.user_id)
      return {
        ...login,
        user_email: userInfo?.email || 'Unknown',
        user_name: userInfo?.full_name || 'Unknown',
        user_type: userInfo?.user_type || 'Unknown',
      }
    })

    // Filter by search if provided (after enrichment)
    let filteredLogins = enrichedLogins
    if (search) {
      const searchLower = search.toLowerCase()
      filteredLogins = enrichedLogins?.filter(
        (l) =>
          l.user_email?.toLowerCase().includes(searchLower) ||
          l.user_name?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      logins: filteredLogins,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin activity error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
