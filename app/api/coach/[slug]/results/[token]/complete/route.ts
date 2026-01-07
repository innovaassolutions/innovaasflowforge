/**
 * Complete Results API
 *
 * Generates PDF and sends email with results to participant.
 * Called when participant completes (either after reflection or on declining to reflect).
 *
 * Story: 1.3 Email & PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'
import { render } from '@react-email/render'
import type { ArchetypeResultsPDFData } from '@/lib/pdf/archetype-results-pdf'
import { ArchetypeResultsEmail } from '@/lib/email/templates/archetype-results-email'
import { ARCHETYPES, type Archetype } from '@/lib/agents/archetype-constitution'
import type { TenantProfile } from '@/lib/supabase/server'

/**
 * Validates that a logo URL is accessible and compatible with react-pdf.
 * react-pdf does NOT support SVG - only PNG, JPG, and base64.
 */
async function validateLogoUrl(logoUrl: string | undefined): Promise<string | null> {
  if (!logoUrl) return null

  try {
    // Check if URL is valid and accessible with a HEAD request
    const response = await fetch(logoUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (!response.ok) {
      console.warn(`Logo URL returned ${response.status}: ${logoUrl}`)
      return null
    }

    // Check content type is a supported image format (NOT SVG)
    const contentType = response.headers.get('content-type')
    if (contentType) {
      // react-pdf supports PNG, JPEG - NOT SVG
      if (contentType.includes('svg')) {
        console.warn(`Logo is SVG (not supported by react-pdf): ${logoUrl}`)
        return null
      }
      if (!contentType.startsWith('image/')) {
        console.warn(`Logo URL is not an image (${contentType}): ${logoUrl}`)
        return null
      }
    }

    return logoUrl
  } catch (error) {
    console.warn(`Failed to validate logo URL: ${logoUrl}`, error)
    return null
  }
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ArchetypeResultsData {
  default_archetype: Archetype
  authentic_archetype: Archetype
  is_aligned: boolean
  scores: {
    default: Record<Archetype, number>
    authentic: Record<Archetype, number>
    friction: Record<Archetype, number>
  }
  completed_at: string
}

export interface CompleteResponse {
  success: boolean
  message?: string
  emailId?: string
  error?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
): Promise<NextResponse<CompleteResponse>> {
  try {
    const { slug, token } = await params
    const supabase = getServiceClient()

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Coach not found' },
        { status: 404 }
      )
    }

    // Get coaching session
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, client_name, client_email, client_status, reflection_status, reflection_messages, completed_at, metadata, email_sent_at')
      .eq('access_token', token)
      .eq('tenant_id', tenant.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if assessment is completed
    if (session.client_status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Assessment not yet completed' },
        { status: 400 }
      )
    }

    // Check if email was already sent
    if (session.email_sent_at) {
      return NextResponse.json(
        { success: false, error: 'Results email already sent' },
        { status: 400 }
      )
    }

    // Extract archetype results from metadata
    const metadata = session.metadata as { archetype_results?: ArchetypeResultsData } | null
    const archetypeResults = metadata?.archetype_results

    if (!archetypeResults) {
      return NextResponse.json(
        { success: false, error: 'Results not yet processed' },
        { status: 400 }
      )
    }

    // Debug: Log archetype results
    console.log('📊 Archetype results:', {
      default_archetype: archetypeResults.default_archetype,
      authentic_archetype: archetypeResults.authentic_archetype,
      is_aligned: archetypeResults.is_aligned,
      has_scores: !!archetypeResults.scores
    })

    // Debug: Log tenant brand config (using 'tenant' before it's cast to TenantProfile)
    console.log('🎨 Tenant brand config:', {
      has_brand_config: !!(tenant as any).brand_config,
      has_colors: !!(tenant as any).brand_config?.colors,
      colors: (tenant as any).brand_config?.colors
    })

    // Validate archetype keys exist in ARCHETYPES
    if (!ARCHETYPES[archetypeResults.default_archetype]) {
      console.error('❌ Invalid default_archetype key:', archetypeResults.default_archetype)
      return NextResponse.json(
        { success: false, error: `Invalid archetype: ${archetypeResults.default_archetype}` },
        { status: 400 }
      )
    }
    if (!ARCHETYPES[archetypeResults.authentic_archetype]) {
      console.error('❌ Invalid authentic_archetype key:', archetypeResults.authentic_archetype)
      return NextResponse.json(
        { success: false, error: `Invalid archetype: ${archetypeResults.authentic_archetype}` },
        { status: 400 }
      )
    }

    // Build enriched results
    const primaryArchetypeData = ARCHETYPES[archetypeResults.default_archetype]
    const authenticArchetypeData = ARCHETYPES[archetypeResults.authentic_archetype]
    const hasTension = !archetypeResults.is_aligned

    const tensionPattern = hasTension ? {
      has_tension: true,
      description: `Your default response under pressure (${primaryArchetypeData.name}) differs from what energizes you when grounded (${authenticArchetypeData.name}). This tension is common and often reflects adaptive strategies you've developed.`,
      triggers: [
        ...primaryArchetypeData.overuse_signals.slice(0, 2),
        'When stressed, you may over-rely on familiar patterns that don\'t serve your deeper needs'
      ]
    } : {
      has_tension: false
    }

    // Format generated date
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Cast tenant to TenantProfile type
    const tenantProfile = tenant as unknown as TenantProfile

    // Validate logo URL before PDF generation
    // react-pdf doesn't support SVG - will fall back to text if logo is invalid
    const logoUrl = tenantProfile.brand_config?.logo?.url
    console.log('🔍 Logo URL from tenant:', logoUrl || 'none')
    const validatedLogoUrl = await validateLogoUrl(logoUrl)
    if (logoUrl && !validatedLogoUrl) {
      console.log('⚠️ Logo validation failed, falling back to text:', logoUrl)
    }

    // Prepare PDF data
    const pdfData: ArchetypeResultsPDFData = {
      session: {
        id: session.id,
        client_name: session.client_name,
        client_email: session.client_email,
        client_status: session.client_status,
        reflection_status: session.reflection_status || 'pending',
        completed_at: session.completed_at
      },
      results: {
        primary_archetype: {
          ...primaryArchetypeData,
          key: archetypeResults.default_archetype
        },
        authentic_archetype: {
          ...authenticArchetypeData,
          key: archetypeResults.authentic_archetype
        },
        tension_pattern: tensionPattern,
        scores: archetypeResults.scores
      },
      tenant: tenantProfile,
      reflectionMessages: session.reflection_messages as Array<{ role: 'user' | 'assistant'; content: string }> | undefined,
      generatedDate,
      validatedLogoUrl
    }

    // Generate PDF buffer
    console.log('📄 Generating PDF for:', session.client_name)
    console.log('📋 PDF Data structure:', {
      session: {
        id: pdfData.session.id,
        client_name: pdfData.session.client_name,
        client_email: pdfData.session.client_email,
        client_status: pdfData.session.client_status,
        reflection_status: pdfData.session.reflection_status
      },
      results: {
        primary_archetype: {
          name: pdfData.results.primary_archetype?.name,
          key: pdfData.results.primary_archetype?.key,
          has_core_traits: !!pdfData.results.primary_archetype?.core_traits?.length,
          has_when_grounded: !!pdfData.results.primary_archetype?.when_grounded,
          has_under_pressure: !!pdfData.results.primary_archetype?.under_pressure,
          has_overuse_signals: !!pdfData.results.primary_archetype?.overuse_signals?.length
        },
        authentic_archetype: {
          name: pdfData.results.authentic_archetype?.name,
          key: pdfData.results.authentic_archetype?.key,
          has_core_traits: !!pdfData.results.authentic_archetype?.core_traits?.length
        },
        tension_pattern: {
          has_tension: pdfData.results.tension_pattern?.has_tension,
          has_description: !!pdfData.results.tension_pattern?.description,
          has_triggers: !!pdfData.results.tension_pattern?.triggers?.length
        }
      },
      tenant: {
        display_name: pdfData.tenant?.display_name,
        has_brand_config: !!pdfData.tenant?.brand_config,
        has_colors: !!pdfData.tenant?.brand_config?.colors
      },
      hasReflectionMessages: !!pdfData.reflectionMessages?.length,
      generatedDate: pdfData.generatedDate,
      validatedLogoUrl: pdfData.validatedLogoUrl
    })

    // Generate PDF using Pages Router API (works better with react-pdf on Vercel)
    // See: https://github.com/diegomura/react-pdf/issues/2460
    // Note: We MUST use the public URL (not VERCEL_URL) because Vercel Authentication
    // blocks direct deployment URL access. The public domain bypasses SSO protection.
    const internalBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://innovaas.co'
    let pdfBuffer: Buffer
    try {
      const pdfApiUrl = `${internalBaseUrl}/flowforge/api/generate-archetype-pdf`

      console.log('📤 Calling Pages Router PDF API at:', pdfApiUrl)

      // Log pdfData size to check for issues
      const pdfDataJson = JSON.stringify(pdfData)
      console.log('📊 PDF data size:', pdfDataJson.length, 'bytes')

      const pdfResponse = await fetch(pdfApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: pdfDataJson,
        signal: AbortSignal.timeout(30000), // 30 second timeout for PDF generation
      })

      console.log('📥 PDF API response status:', pdfResponse.status)

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text().catch(() => 'Failed to read response')
        console.error('❌ PDF API error response:', errorText.substring(0, 500))
        throw new Error(`PDF API returned ${pdfResponse.status}: ${errorText.substring(0, 200)}`)
      }

      const pdfResult = await pdfResponse.json()

      if (!pdfResult.success || !pdfResult.pdfBase64) {
        throw new Error(pdfResult.error || 'PDF API returned invalid response')
      }

      pdfBuffer = Buffer.from(pdfResult.pdfBase64, 'base64')
      console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    } catch (pdfError: any) {
      console.error('❌ PDF generation error:', {
        message: pdfError?.message || 'Unknown error',
        stack: pdfError?.stack,
        name: pdfError?.name,
        logoUrl: validatedLogoUrl,
        clientName: session.client_name
      })
      return NextResponse.json(
        { success: false, error: 'Failed to generate PDF' },
        { status: 500 }
      )
    }

    // Build results URL using the public-facing URL (not internal Vercel URL)
    const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://innovaas.co'
    const resultsUrl = `${publicBaseUrl}/flowforge/coach/${slug}/results/${token}`

    // Get coach email from tenant config
    const emailConfig = tenantProfile.email_config as {
      replyTo?: string
      senderName?: string
      emailFooter?: string
    } | null
    const brandConfig = tenantProfile.brand_config

    // Get coach's actual email for reply-to (from user profile linked to tenant)
    const { data: coachUser } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', tenantProfile.user_id)
      .single()

    const coachEmail = emailConfig?.replyTo || coachUser?.email || ''

    // Send email with PDF attachment
    console.log('📧 Sending results email to:', session.client_email)
    try {
      const senderName = emailConfig?.senderName || tenantProfile.display_name
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      const fromAddress = `${senderName} <${fromEmail}>`

      // Pre-render email to HTML to avoid bundling issues on Vercel
      // (similar to react-pdf bundling issues)
      const emailHtml = await render(ArchetypeResultsEmail({
        participantName: session.client_name,
        coachName: tenantProfile.display_name,
        coachEmail: coachEmail,
        resultsUrl: resultsUrl,
        archetypeName: primaryArchetypeData.name,
        hasTension: hasTension,
        brandConfig: {
          logo: brandConfig.logo,
          colors: {
            primary: brandConfig.colors?.primary,
            secondary: brandConfig.colors?.secondary,
            background: brandConfig.colors?.background,
            text: brandConfig.colors?.text,
            textMuted: brandConfig.colors?.textMuted,
          },
          tagline: brandConfig.tagline,
          completionMessage: brandConfig.completionMessage,
        },
        emailConfig: {
          senderName: emailConfig?.senderName,
          emailFooter: emailConfig?.emailFooter,
        },
        // TODO: Add booking config when that feature is implemented
        bookingConfig: undefined
      }))

      console.log('📧 Email HTML rendered, length:', emailHtml.length)

      const emailResult = await resend.emails.send({
        from: fromAddress,
        to: session.client_email,
        replyTo: coachEmail || undefined,
        subject: `Your Leadership Archetype Results from ${tenantProfile.display_name}`,
        attachments: [
          {
            filename: 'leadership-archetype-results.pdf',
            content: pdfBuffer
          }
        ],
        html: emailHtml
      })

      if (emailResult.error) {
        console.error('Email send error:', JSON.stringify(emailResult.error, null, 2))
        // Provide helpful error message for common Resend issues
        let errorMessage = 'Failed to send email'
        const errorDetails = emailResult.error as any
        const errorMsg = errorDetails?.message || ''
        console.error('Email error message:', errorMsg)

        if (errorMsg.includes('can only send to') || errorMsg.includes('not verified')) {
          errorMessage = 'Email domain not verified. Configure RESEND_FROM_EMAIL with a verified domain.'
        } else if (errorMsg.includes('API key')) {
          errorMessage = 'Invalid Resend API key.'
        } else if (errorMsg) {
          // Include actual error in response for debugging
          errorMessage = `Email error: ${errorMsg}`
        }
        return NextResponse.json({
          success: false,
          error: errorMessage,
        }, { status: 500 })
      }

      console.log('✅ Results email sent successfully')
      console.log('Email ID:', emailResult.data?.id)

      // Update session with timestamps and reflection status
      const now = new Date().toISOString()
      const { error: updateError } = await supabase
        .from('coaching_sessions')
        .update({
          email_sent_at: now,
          pdf_generated_at: now,
          reflection_status: session.reflection_status === 'pending' ? 'declined' : session.reflection_status
        } as any)
        .eq('id', session.id)

      if (updateError) {
        console.error('Failed to update session timestamps:', updateError)
        // Don't fail the request, email was sent successfully
      }

      return NextResponse.json({
        success: true,
        message: 'Results email sent successfully',
        emailId: emailResult.data?.id
      })

    } catch (emailError: any) {
      console.error('Email send exception:', emailError?.message || emailError)
      console.error('Email error stack:', emailError?.stack)
      let errorMessage = 'Failed to send email'
      const errMsg = emailError?.message || ''
      if (errMsg.includes('can only send to') || errMsg.includes('not verified')) {
        errorMessage = 'Email domain not verified. Configure RESEND_FROM_EMAIL with a verified domain.'
      } else if (errMsg.includes('API key')) {
        errorMessage = 'Invalid Resend API key. Check RESEND_API_KEY environment variable.'
      } else if (errMsg) {
        // Include actual error for debugging
        errorMessage = `Email exception: ${errMsg}`
      }
      return NextResponse.json({
        success: false,
        error: errorMessage,
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Complete API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
