import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * POST /api/education/redeem-code
 * Redeem an access code and receive a persistent participant token
 * This is a PUBLIC endpoint - no authentication required
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, campaign_id } = body

    if (!code || !campaign_id) {
      return NextResponse.json(
        { error: 'Code and campaign_id are required' },
        { status: 400 }
      )
    }

    // Normalize code (uppercase, trim)
    const normalizedCode = code.trim().toUpperCase()

    // Call the database function to redeem the code
    const { data, error } = await supabaseAdmin.rpc('redeem_access_code', {
      input_code: normalizedCode,
      input_campaign_id: campaign_id
    })

    if (error) {
      console.error('Code redemption error:', error)

      // Parse specific error messages
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Invalid access code. Please check and try again.' },
          { status: 404 }
        )
      }
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { error: 'This access code has expired. Please contact your school administrator.' },
          { status: 410 }
        )
      }
      if (error.message.includes('already been used')) {
        return NextResponse.json(
          { error: 'This access code has already been used.' },
          { status: 409 }
        )
      }
      if (error.message.includes('does not match')) {
        return NextResponse.json(
          { error: 'This code is not valid for this assessment.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to redeem access code' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      )
    }

    // Get token details for response
    // Note: Using type assertion as education tables not yet in generated types
    const { data: tokenDetails } = await supabaseAdmin
      .from('education_participant_tokens' as any)
      .select(`
        token,
        participant_type,
        cohort_metadata,
        school_id,
        campaign_id,
        schools:school_id(name)
      `)
      .eq('id', data)
      .single()

    if (!tokenDetails) {
      return NextResponse.json(
        { error: 'Token created but could not be retrieved' },
        { status: 500 }
      )
    }

    // Return the participant token
    // This token is used for all subsequent session access
    return NextResponse.json({
      success: true,
      token: tokenDetails.token,
      participant_type: tokenDetails.participant_type,
      cohort_metadata: tokenDetails.cohort_metadata,
      message: getWelcomeMessage(tokenDetails.participant_type)
    })

  } catch (error) {
    console.error('Code redemption error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get a friendly welcome message based on participant type
 */
function getWelcomeMessage(participantType: string): string {
  const messages: Record<string, string> = {
    student: 'Welcome! Your responses are completely anonymous. No one at school will know what you say.',
    teacher: 'Welcome! Your insights will help improve our school. Your responses are confidential.',
    parent: 'Welcome! Thank you for taking time to share your perspective. Your responses are confidential.',
    leadership: 'Welcome! Your strategic insights are valuable. Let\'s explore your perspective on school improvement.'
  }
  return messages[participantType] || 'Welcome! Thank you for participating.'
}
