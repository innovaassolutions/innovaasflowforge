import { NextRequest, NextResponse } from 'next/server'
import { createClient, getSupabaseAdmin, getTenantForUser } from '@/lib/supabase/server'
import {
  addCustomHostname,
  deleteCustomHostname,
  getCnameTarget,
  hostnameExists,
} from '@/lib/services/cloudflare-domains'
import {
  addDomainToVercel,
  removeDomainFromVercel,
  isVercelDomainConfigured,
} from '@/lib/services/vercel-domains'
import {
  validateCustomDomain,
  getSubdomain,
  getApexDomain,
} from '@/lib/utils/domain-validation'

// ============================================================================
// POST /api/tenant/domain - Configure custom domain
// ============================================================================

interface ConfigureDomainRequest {
  domain: string
}

/**
 * Configure a custom domain for the authenticated tenant.
 *
 * 1. Validates domain format (must be subdomain)
 * 2. Checks domain is not already claimed
 * 3. Adds hostname to Cloudflare for SaaS
 * 4. Updates tenant_profiles with pending verification
 * 5. Returns DNS instructions
 */
export async function POST(request: NextRequest) {
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

    // 3. Parse and validate domain
    const body: ConfigureDomainRequest = await request.json()
    const validation = validateCustomDomain(body.domain)

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'invalid_domain', message: validation.error },
        { status: 400 }
      )
    }

    const domain = validation.normalized!

    // 4. Check domain is not already claimed by another tenant
    const supabaseAdmin = getSupabaseAdmin()
    const { data: existingTenant } = await supabaseAdmin
      .from('tenant_profiles')
      .select('id, slug')
      .eq('custom_domain', domain)
      .neq('id', tenant.id)
      .single()

    if (existingTenant) {
      return NextResponse.json(
        {
          success: false,
          error: 'domain_taken',
          message: 'This domain is already in use by another tenant',
        },
        { status: 409 }
      )
    }

    // 5. Check if domain already exists in Cloudflare (from previous attempt)
    const existsInCloudflare = await hostnameExists(domain)

    // 6. Add to Cloudflare for SaaS (only if not already there)
    // Cast to access extended fields not in base TenantProfile type
    const tenantExtended = tenant as typeof tenant & { cloudflare_hostname_id?: string }
    let hostnameId = tenantExtended.cloudflare_hostname_id

    if (!existsInCloudflare) {
      const cfResult = await addCustomHostname(domain)

      if (!cfResult.success) {
        console.error('Cloudflare error:', cfResult.error)
        return NextResponse.json(
          {
            success: false,
            error: 'cloudflare_error',
            message: 'Failed to configure domain with Cloudflare. Please try again.',
          },
          { status: 502 }
        )
      }

      hostnameId = cfResult.hostnameId
    }

    // 6b. Add to Vercel so it recognizes the hostname
    // This is essential for multi-tenant custom domains to work
    if (isVercelDomainConfigured()) {
      const vercelResult = await addDomainToVercel(domain)

      if (!vercelResult.success) {
        console.error('Vercel domain error:', vercelResult.error)
        // Don't fail the request - Cloudflare is configured, Vercel can be retried
        // The domain might work if Vercel is already configured via dashboard
      } else {
        console.log(`Domain ${domain} added to Vercel (verified: ${vercelResult.verified})`)
      }
    } else {
      console.log('Vercel domain integration not configured - skipping Vercel domain registration')
    }

    // 7. Update tenant profile in database
    const { error: updateError } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .update({
        custom_domain: domain,
        domain_verified: false,
        cloudflare_hostname_id: hostnameId,
        domain_verification_started_at: new Date().toISOString(),
      })
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'database_error',
          message: 'Failed to save domain configuration. Please try again.',
        },
        { status: 500 }
      )
    }

    // 8. Return success with DNS instructions
    const cnameTarget = getCnameTarget()
    const subdomain = getSubdomain(domain) || domain.split('.')[0]
    const apex = getApexDomain(domain)

    return NextResponse.json({
      success: true,
      domain,
      status: 'pending',
      dns_instructions: {
        record_type: 'CNAME',
        host: subdomain,
        target: cnameTarget,
        apex_domain: apex,
        message: `Add a CNAME record pointing '${subdomain}' to '${cnameTarget}' in your DNS settings for ${apex}`,
      },
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/tenant/domain:', error)
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/tenant/domain - Remove custom domain
// ============================================================================

/**
 * Remove the custom domain configuration for the authenticated tenant.
 *
 * 1. Authenticates user and gets tenant
 * 2. Deletes hostname from Cloudflare
 * 3. Clears domain fields in database
 */
export async function DELETE(request: NextRequest) {
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

    // 3. If no domain configured, nothing to do
    if (!tenant.custom_domain) {
      return NextResponse.json({
        success: true,
        message: 'No custom domain configured',
      })
    }

    // 4. Delete from Cloudflare (if hostname ID exists)
    const hostnameId = (tenant as any).cloudflare_hostname_id as string | undefined

    if (hostnameId) {
      const cfResult = await deleteCustomHostname(hostnameId)

      if (!cfResult.success) {
        console.error('Cloudflare delete error:', cfResult.error)
        // Continue anyway - domain might have been manually deleted
      }
    }

    // 4b. Remove from Vercel
    if (isVercelDomainConfigured() && tenant.custom_domain) {
      const vercelResult = await removeDomainFromVercel(tenant.custom_domain)

      if (!vercelResult.success) {
        console.error('Vercel remove error:', vercelResult.error)
        // Continue anyway - domain might have been manually removed
      } else {
        console.log(`Domain ${tenant.custom_domain} removed from Vercel`)
      }
    }

    // 5. Clear domain fields in database
    const supabaseAdmin = getSupabaseAdmin()
    const { error: updateError } = await (supabaseAdmin
      .from('tenant_profiles') as any)
      .update({
        custom_domain: null,
        domain_verified: false,
        cloudflare_hostname_id: null,
        domain_verification_started_at: null,
      })
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'database_error',
          message: 'Failed to remove domain configuration. Please try again.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Custom domain removed successfully',
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/tenant/domain:', error)
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET /api/tenant/domain - Get current domain configuration
// ============================================================================

/**
 * Get the current custom domain configuration for the authenticated tenant.
 * Used by the UI to display current state.
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

    // 4. Return current configuration
    const domainVerified = (tenant as any).domain_verified as boolean | undefined

    if (domainVerified) {
      return NextResponse.json({
        configured: true,
        domain: tenant.custom_domain,
        status: 'verified',
        url: `https://${tenant.custom_domain}`,
      })
    }

    // 5. Still pending - include DNS instructions
    const cnameTarget = getCnameTarget()
    const subdomain = getSubdomain(tenant.custom_domain) || tenant.custom_domain.split('.')[0]
    const apex = getApexDomain(tenant.custom_domain)

    return NextResponse.json({
      configured: true,
      domain: tenant.custom_domain,
      status: 'pending',
      started_at: (tenant as any).domain_verification_started_at,
      dns_instructions: {
        record_type: 'CNAME',
        host: subdomain,
        target: cnameTarget,
        apex_domain: apex,
        message: `Add a CNAME record pointing '${subdomain}' to '${cnameTarget}' in your DNS settings for ${apex}`,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/tenant/domain:', error)
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
