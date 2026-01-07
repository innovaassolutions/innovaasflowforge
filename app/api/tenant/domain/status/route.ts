import { NextRequest, NextResponse } from 'next/server'
import { createClient, getSupabaseAdmin, getTenantForUser } from '@/lib/supabase/server'
import {
  getHostnameStatus,
  getCnameTarget,
  getVerificationStatusLabel,
} from '@/lib/services/cloudflare-domains'
import { getSubdomain, getApexDomain } from '@/lib/utils/domain-validation'

// ============================================================================
// GET /api/tenant/domain/status - Check domain verification status
// ============================================================================

/**
 * Check the current verification status of the custom domain.
 *
 * This endpoint:
 * 1. Gets tenant's current domain configuration
 * 2. Queries Cloudflare for real-time status
 * 3. Updates database if status changed to 'active'
 * 4. Returns status with DNS instructions if still pending
 *
 * Used by the UI for polling verification progress.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'not_authenticated', message: 'Please sign in to continue' },
        { status: 401 }
      )
    }

    // 2. Get tenant profile for user
    const tenant = await getTenantForUser(user.id)

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'not_authorized', message: 'You do not have a tenant profile' },
        { status: 403 }
      )
    }

    // 3. If no domain configured
    if (!tenant.custom_domain) {
      return NextResponse.json({
        configured: false,
        domain: null,
        status: null,
      })
    }

    // Cast to access extended fields
    const tenantExtended = tenant as typeof tenant & {
      domain_verified?: boolean
      cloudflare_hostname_id?: string
      domain_verification_started_at?: string
    }

    // 4. If already verified in our database, return success
    if (tenantExtended.domain_verified) {
      return NextResponse.json({
        configured: true,
        domain: tenant.custom_domain,
        status: 'verified',
        verified_at: tenantExtended.domain_verification_started_at,
        url: `https://${tenant.custom_domain}`,
      })
    }

    // 5. Check Cloudflare for current status
    const hostnameId = tenantExtended.cloudflare_hostname_id

    if (!hostnameId) {
      // No hostname ID - configuration may have failed
      return NextResponse.json({
        configured: true,
        domain: tenant.custom_domain,
        status: 'failed',
        error: 'Domain configuration incomplete. Please try removing and re-adding the domain.',
      })
    }

    const cfDetails = await getHostnameStatus(hostnameId)

    if (!cfDetails) {
      return NextResponse.json({
        configured: true,
        domain: tenant.custom_domain,
        status: 'failed',
        error: 'Unable to check domain status. The configuration may have been removed.',
      })
    }

    // 6. Map Cloudflare status to our status
    const verificationStatus = getVerificationStatusLabel(cfDetails.status)

    // 7. If Cloudflare says active, update our database
    if (verificationStatus === 'verified') {
      const supabaseAdmin = getSupabaseAdmin()
      await (supabaseAdmin
        .from('tenant_profiles') as any)
        .update({
          domain_verified: true,
        })
        .eq('id', tenant.id)

      return NextResponse.json({
        configured: true,
        domain: tenant.custom_domain,
        status: 'verified',
        url: `https://${tenant.custom_domain}`,
      })
    }

    // 8. Check for timeout (>24 hours since verification started)
    if (tenantExtended.domain_verification_started_at) {
      const startedAt = new Date(tenantExtended.domain_verification_started_at)
      const hoursElapsed = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60)

      if (hoursElapsed > 24) {
        return NextResponse.json({
          configured: true,
          domain: tenant.custom_domain,
          status: 'failed',
          error:
            'DNS verification timed out after 24 hours. Please check your CNAME record and try again.',
          dns_instructions: buildDnsInstructions(tenant.custom_domain),
        })
      }
    }

    // 9. Check for Cloudflare verification errors
    if (
      cfDetails.verificationErrors &&
      cfDetails.verificationErrors.length > 0
    ) {
      const errorMessages = cfDetails.verificationErrors
        .map((e) => e.message)
        .join('; ')

      return NextResponse.json({
        configured: true,
        domain: tenant.custom_domain,
        status: 'pending',
        cloudflare_status: cfDetails.status,
        verification_errors: errorMessages,
        dns_instructions: buildDnsInstructions(tenant.custom_domain),
        started_at: tenantExtended.domain_verification_started_at,
      })
    }

    // 10. Check SSL validation errors
    if (
      cfDetails.ssl.validationErrors &&
      cfDetails.ssl.validationErrors.length > 0
    ) {
      const sslErrors = cfDetails.ssl.validationErrors
        .map((e) => e.message)
        .join('; ')

      return NextResponse.json({
        configured: true,
        domain: tenant.custom_domain,
        status: 'pending',
        cloudflare_status: cfDetails.status,
        ssl_status: cfDetails.ssl.status,
        ssl_errors: sslErrors,
        dns_instructions: buildDnsInstructions(tenant.custom_domain),
        started_at: tenantExtended.domain_verification_started_at,
      })
    }

    // 11. Still pending, return with DNS instructions
    return NextResponse.json({
      configured: true,
      domain: tenant.custom_domain,
      status: 'pending',
      cloudflare_status: cfDetails.status,
      ssl_status: cfDetails.ssl.status,
      dns_instructions: buildDnsInstructions(tenant.custom_domain),
      started_at: tenantExtended.domain_verification_started_at,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/tenant/domain/status:', error)
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function buildDnsInstructions(domain: string) {
  const cnameTarget = getCnameTarget()
  const subdomain = getSubdomain(domain) || domain.split('.')[0]
  const apex = getApexDomain(domain)

  return {
    record_type: 'CNAME',
    host: subdomain,
    target: cnameTarget,
    apex_domain: apex,
    message: `Add a CNAME record pointing '${subdomain}' to '${cnameTarget}' in your DNS settings for ${apex}`,
  }
}
