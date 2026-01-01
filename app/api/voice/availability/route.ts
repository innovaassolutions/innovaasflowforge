import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkVoiceAvailability } from '@/lib/services/voice-availability'

/**
 * GET /api/voice/availability
 * Check if voice mode is available for the current user in a given vertical
 *
 * Query params:
 * - vertical: string (required) - The vertical key (e.g., 'education', 'assessment')
 * - organizationId: string (required) - The organization ID
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verticalKey =
      request.nextUrl.searchParams.get('vertical') || 'education'
    const organizationId = request.nextUrl.searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const availability = await checkVoiceAvailability({
      userId: user.id,
      organizationId,
      verticalKey,
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Voice availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check voice availability' },
      { status: 500 }
    )
  }
}
