import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

/**
 * POST /api/external/testimonial-session
 * 
 * Creates a new testimonial interview session for a customer.
 * Called by NovaCRM when a project is marked complete.
 * 
 * Request body:
 * {
 *   "project_id": "string",
 *   "contact_name": "string",
 *   "contact_email": "string",
 *   "contact_title": "string",
 *   "company_name": "string",
 *   "callback_url": "string"
 * }
 * 
 * Response:
 * {
 *   "session_url": "string",
 *   "session_id": "string"
 * }
 */

interface CreateTestimonialSessionRequest {
  project_id: string
  contact_name: string
  contact_email: string
  contact_title: string
  company_name: string
  callback_url: string
}

/**
 * Generate a cryptographically secure access token
 */
function generateAccessToken(): string {
  return 'ts-' + randomBytes(32).toString('base64url')
}

/**
 * Get or create the customer_success campaign
 */
async function getOrCreateCustomerSuccessCampaign(): Promise<string> {
  // Check if customer_success campaign exists
  const { data: existingCampaign } = await (supabaseAdmin
    .from('campaigns') as any)
    .select('id')
    .eq('name', 'Customer Success Testimonials')
    .eq('campaign_type', 'custom')
    .single()

  if (existingCampaign?.id) {
    return existingCampaign.id
  }

  // Create the campaign if it doesn't exist
  const { data: newCampaign, error: createError } = await (supabaseAdmin
    .from('campaigns') as any)
    .insert({
      name: 'Customer Success Testimonials',
      description: 'Automated testimonial collection from completed projects',
      campaign_type: 'custom',
      status: 'active',
      facilitator_name: 'Customer Success',
      facilitator_email: 'success@innovaas.io',
      company_name: 'Innovaas',
      metadata: {
        type: 'customer_success',
        auto_created: true
      }
    })
    .select('id')
    .single()

  if (createError) {
    console.error('Failed to create customer_success campaign:', createError)
    throw new Error('Failed to create testimonial campaign')
  }

  return newCampaign.id
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key (optional - can add API key auth later)
    // const apiKey = request.headers.get('X-API-Key')
    // if (!apiKey || apiKey !== process.env.NOVACRM_API_KEY) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body: CreateTestimonialSessionRequest = await request.json()

    // Validate required fields
    const requiredFields = ['project_id', 'contact_name', 'contact_email', 'contact_title', 'company_name', 'callback_url']
    for (const field of requiredFields) {
      if (!body[field as keyof CreateTestimonialSessionRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    console.log('📝 Creating testimonial session for:', {
      project_id: body.project_id,
      contact_name: body.contact_name,
      company_name: body.company_name
    })

    // Get or create the customer_success campaign
    const campaignId = await getOrCreateCustomerSuccessCampaign()

    // Generate access token
    const accessToken = generateAccessToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

    // Create stakeholder session (using campaign_assignments table)
    const { data: session, error: sessionError } = await (supabaseAdmin
      .from('campaign_assignments') as any)
      .insert({
        campaign_id: campaignId,
        stakeholder_name: body.contact_name,
        stakeholder_email: body.contact_email,
        stakeholder_title: body.contact_title,
        stakeholder_role: 'managing_director', // Default role for testimonials
        status: 'invited',
        access_token: accessToken,
        access_expires_at: expiresAt.toISOString(),
        progress_percentage: 0,
        current_question_index: 0,
        has_uploaded_documents: false,
        metadata: {
          type: 'testimonial',
          project_id: body.project_id,
          company_name: body.company_name,
          callback_url: body.callback_url,
          created_via: 'external_api'
        }
      })
      .select('id')
      .single()

    if (sessionError) {
      console.error('Failed to create session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session', details: sessionError.message },
        { status: 500 }
      )
    }

    // Build session URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowforge.innovaas.io'
    const sessionUrl = `${baseUrl}/testimonial/${accessToken}`

    console.log('✅ Testimonial session created:', {
      session_id: session.id,
      session_url: sessionUrl
    })

    return NextResponse.json({
      session_url: sessionUrl,
      session_id: session.id
    })

  } catch (error) {
    console.error('Error creating testimonial session:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
