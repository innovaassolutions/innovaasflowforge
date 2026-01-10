/**
 * Vercel Domains Service
 *
 * Manages custom domains via Vercel's Domains API for multi-tenant SaaS.
 * Works alongside Cloudflare for SaaS to enable tenant custom domains.
 *
 * When a tenant configures a custom domain:
 * 1. Cloudflare for SaaS handles SSL and CDN
 * 2. Vercel must recognize the domain for proper routing
 *
 * API Reference: https://vercel.com/docs/rest-api/endpoints/projects#add-a-domain-to-a-project
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VercelDomainResult {
  success: boolean
  domain?: string
  verified?: boolean
  error?: string
  verificationRecord?: {
    type: string
    name: string
    value: string
  }
}

export interface VercelDomainDetails {
  name: string
  verified: boolean
  gitBranch?: string | null
  redirect?: string | null
  redirectStatusCode?: number | null
  createdAt: number
  updatedAt: number
}

// Internal API response types
interface VercelApiError {
  code: string
  message: string
}

interface VercelDomainResponse {
  name: string
  apexName: string
  projectId: string
  redirect?: string | null
  redirectStatusCode?: number | null
  gitBranch?: string | null
  updatedAt: number
  createdAt: number
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
}

// ============================================================================
// CONFIGURATION
// ============================================================================

function getVercelConfig() {
  const apiToken = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!apiToken) {
    throw new Error('VERCEL_API_TOKEN environment variable is not set')
  }
  if (!projectId) {
    throw new Error('VERCEL_PROJECT_ID environment variable is not set')
  }
  // teamId is optional for personal accounts

  return { apiToken, projectId, teamId }
}

/**
 * Check if Vercel domain integration is configured.
 * If not configured, domain operations will be skipped gracefully.
 */
export function isVercelDomainConfigured(): boolean {
  return !!(
    process.env.VERCEL_API_TOKEN &&
    process.env.VERCEL_PROJECT_ID
  )
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Add a custom domain to the Vercel project.
 *
 * This registers the domain with Vercel so it knows to accept requests
 * for this hostname. Vercel automatically issues an SSL certificate.
 *
 * @param domain - The custom domain (e.g., "assessment.example.com")
 * @returns Result with domain info and verification status
 *
 * @example
 * const result = await addDomainToVercel("assessment.leadingwithmeaning.com")
 * if (result.success) {
 *   if (!result.verified) {
 *     // Domain needs TXT record verification (already in use by another account)
 *   }
 * }
 */
export async function addDomainToVercel(
  domain: string
): Promise<VercelDomainResult> {
  try {
    const { apiToken, projectId, teamId } = getVercelConfig()

    // Build URL with optional teamId
    let url = `https://api.vercel.com/v10/projects/${projectId}/domains`
    if (teamId) {
      url += `?teamId=${teamId}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
      }),
    })

    const data = await response.json()

    // Check for errors
    if (!response.ok) {
      const error = data.error as VercelApiError | undefined

      // Handle specific error cases
      if (error?.code === 'domain_already_in_use') {
        // Domain exists in another Vercel account - needs verification
        return {
          success: false,
          error: 'Domain is already in use on Vercel. Owner verification required.',
          domain,
        }
      }

      if (error?.code === 'domain_already_exists') {
        // Domain already added to this project - that's fine
        return {
          success: true,
          domain,
          verified: true,
        }
      }

      return {
        success: false,
        error: error?.message || `Failed to add domain to Vercel (${response.status})`,
      }
    }

    const result = data as VercelDomainResponse

    // Check if verification is needed
    if (result.verification && result.verification.length > 0) {
      const verification = result.verification[0]
      return {
        success: true,
        domain: result.name,
        verified: false,
        verificationRecord: {
          type: verification.type,
          name: verification.domain,
          value: verification.value,
        },
      }
    }

    return {
      success: true,
      domain: result.name,
      verified: result.verified,
    }
  } catch (error) {
    console.error('Vercel addDomainToVercel error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get the current status of a domain on Vercel.
 *
 * @param domain - The domain name to check
 * @returns Domain details or null if not found
 */
export async function getDomainStatus(
  domain: string
): Promise<VercelDomainDetails | null> {
  try {
    const { apiToken, projectId, teamId } = getVercelConfig()

    let url = `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`
    if (teamId) {
      url += `?teamId=${teamId}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      console.error('Vercel getDomainStatus error:', response.status)
      return null
    }

    const result: VercelDomainResponse = await response.json()

    return {
      name: result.name,
      verified: result.verified,
      gitBranch: result.gitBranch,
      redirect: result.redirect,
      redirectStatusCode: result.redirectStatusCode,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }
  } catch (error) {
    console.error('Vercel getDomainStatus error:', error)
    return null
  }
}

/**
 * Remove a custom domain from the Vercel project.
 *
 * @param domain - The domain to remove
 * @returns Success status
 */
export async function removeDomainFromVercel(
  domain: string
): Promise<VercelDomainResult> {
  try {
    const { apiToken, projectId, teamId } = getVercelConfig()

    let url = `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`
    if (teamId) {
      url += `?teamId=${teamId}`
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      const error = data.error as VercelApiError | undefined

      // 404 means domain wasn't there - that's fine for delete
      if (response.status === 404) {
        return {
          success: true,
          domain,
        }
      }

      return {
        success: false,
        error: error?.message || `Failed to remove domain from Vercel (${response.status})`,
      }
    }

    return {
      success: true,
      domain,
    }
  } catch (error) {
    console.error('Vercel removeDomainFromVercel error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Verify domain ownership on Vercel.
 *
 * Call this after the tenant has added the required TXT record.
 *
 * @param domain - The domain to verify
 * @returns Verification result
 */
export async function verifyDomain(
  domain: string
): Promise<VercelDomainResult> {
  try {
    const { apiToken, projectId, teamId } = getVercelConfig()

    let url = `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}/verify`
    if (teamId) {
      url += `?teamId=${teamId}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data.error as VercelApiError | undefined
      return {
        success: false,
        error: error?.message || `Failed to verify domain (${response.status})`,
      }
    }

    const result = data as VercelDomainResponse

    return {
      success: true,
      domain: result.name,
      verified: result.verified,
    }
  } catch (error) {
    console.error('Vercel verifyDomain error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
