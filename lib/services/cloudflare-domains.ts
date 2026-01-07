/**
 * Cloudflare Custom Domains Service
 *
 * Manages custom hostnames via Cloudflare for SaaS API.
 * Enables tenants to use their own subdomains (e.g., assessment.example.com)
 * instead of the default innovaas.co URLs.
 *
 * Spec: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/
 *
 * API Reference: https://developers.cloudflare.com/api/operations/custom-hostname-for-a-zone-create-custom-hostname
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CloudflareHostnameResult {
  success: boolean
  hostnameId?: string
  status?: CloudflareHostnameStatus
  error?: string
  verificationErrors?: string[]
}

export interface CloudflareHostnameDetails {
  id: string
  hostname: string
  status: CloudflareHostnameStatus
  ssl: {
    status: string
    method: string
    type: string
    validationErrors?: Array<{ message: string }>
  }
  verificationErrors?: Array<{ message: string }>
  ownershipVerification?: {
    type: string
    name: string
    value: string
  }
  ownershipVerificationHttp?: {
    httpUrl: string
    httpBody: string
  }
  createdAt: string
}

export type CloudflareHostnameStatus =
  | 'pending'
  | 'active'
  | 'moved'
  | 'deleted'
  | 'pending_deletion'
  | 'blocked'

// Internal API response types
interface CloudflareApiResponse<T> {
  success: boolean
  result?: T
  errors?: Array<{ code: number; message: string }>
  messages?: Array<{ code: number; message: string }>
}

interface CloudflareCustomHostname {
  id: string
  hostname: string
  status: CloudflareHostnameStatus
  ssl: {
    status: string
    method: string
    type: string
    validation_errors?: Array<{ message: string }>
  }
  verification_errors?: Array<{ message: string }>
  ownership_verification?: {
    type: string
    name: string
    value: string
  }
  ownership_verification_http?: {
    http_url: string
    http_body: string
  }
  created_at: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

function getCloudflareConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const cnameTarget = process.env.CLOUDFLARE_CNAME_TARGET

  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is not set')
  }
  if (!zoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID environment variable is not set')
  }
  if (!cnameTarget) {
    throw new Error('CLOUDFLARE_CNAME_TARGET environment variable is not set')
  }

  return { apiToken, zoneId, cnameTarget }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Add a custom hostname to Cloudflare for SaaS.
 *
 * Creates a new custom hostname entry and initiates SSL certificate provisioning.
 * The tenant must then add a CNAME record pointing to the provided target.
 *
 * @param hostname - The custom hostname (e.g., "assessment.example.com")
 * @returns Result with hostname ID and initial status
 *
 * @example
 * const result = await addCustomHostname("assessment.leadingwithmeaning.com")
 * if (result.success) {
 *   // Store result.hostnameId in database
 *   // Show DNS instructions to user
 * }
 */
export async function addCustomHostname(
  hostname: string
): Promise<CloudflareHostnameResult> {
  try {
    const { apiToken, zoneId } = getCloudflareConfig()

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostname,
          ssl: {
            method: 'http', // HTTP validation (automatic)
            type: 'dv', // Domain Validation certificate
            settings: {
              min_tls_version: '1.2',
            },
          },
        }),
      }
    )

    const data: CloudflareApiResponse<CloudflareCustomHostname> =
      await response.json()

    if (!data.success || !data.result) {
      const errorMessage =
        data.errors?.[0]?.message || 'Failed to add custom hostname'
      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
      hostnameId: data.result.id,
      status: data.result.status,
    }
  } catch (error) {
    console.error('Cloudflare addCustomHostname error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get the current status of a custom hostname.
 *
 * Use this to poll for verification status after the tenant adds their DNS record.
 *
 * @param hostnameId - The Cloudflare hostname ID
 * @returns Detailed hostname status including SSL and verification info
 *
 * @example
 * const details = await getHostnameStatus("abc123")
 * if (details.status === "active") {
 *   // Domain is verified and SSL is active
 * }
 */
export async function getHostnameStatus(
  hostnameId: string
): Promise<CloudflareHostnameDetails | null> {
  try {
    const { apiToken, zoneId } = getCloudflareConfig()

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${hostnameId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data: CloudflareApiResponse<CloudflareCustomHostname> =
      await response.json()

    if (!data.success || !data.result) {
      console.error('Cloudflare getHostnameStatus error:', data.errors)
      return null
    }

    const result = data.result

    return {
      id: result.id,
      hostname: result.hostname,
      status: result.status,
      ssl: {
        status: result.ssl.status,
        method: result.ssl.method,
        type: result.ssl.type,
        validationErrors: result.ssl.validation_errors,
      },
      verificationErrors: result.verification_errors,
      ownershipVerification: result.ownership_verification
        ? {
            type: result.ownership_verification.type,
            name: result.ownership_verification.name,
            value: result.ownership_verification.value,
          }
        : undefined,
      ownershipVerificationHttp: result.ownership_verification_http
        ? {
            httpUrl: result.ownership_verification_http.http_url,
            httpBody: result.ownership_verification_http.http_body,
          }
        : undefined,
      createdAt: result.created_at,
    }
  } catch (error) {
    console.error('Cloudflare getHostnameStatus error:', error)
    return null
  }
}

/**
 * Delete a custom hostname from Cloudflare.
 *
 * Removes the hostname and invalidates SSL certificates.
 * Should be called when a tenant removes their custom domain.
 *
 * @param hostnameId - The Cloudflare hostname ID to delete
 * @returns Success status
 *
 * @example
 * const result = await deleteCustomHostname("abc123")
 * if (result.success) {
 *   // Clear custom_domain from tenant_profiles
 * }
 */
export async function deleteCustomHostname(
  hostnameId: string
): Promise<CloudflareHostnameResult> {
  try {
    const { apiToken, zoneId } = getCloudflareConfig()

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${hostnameId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data: CloudflareApiResponse<{ id: string }> = await response.json()

    if (!data.success) {
      const errorMessage =
        data.errors?.[0]?.message || 'Failed to delete custom hostname'
      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
      status: 'deleted',
    }
  } catch (error) {
    console.error('Cloudflare deleteCustomHostname error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Check if a hostname already exists in Cloudflare.
 *
 * Used to verify uniqueness before adding a new custom hostname.
 *
 * @param hostname - The hostname to check
 * @returns True if hostname exists, false otherwise
 */
export async function hostnameExists(hostname: string): Promise<boolean> {
  try {
    const { apiToken, zoneId } = getCloudflareConfig()

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data: CloudflareApiResponse<CloudflareCustomHostname[]> =
      await response.json()

    if (!data.success) {
      console.error('Cloudflare hostnameExists error:', data.errors)
      return false
    }

    return (data.result?.length ?? 0) > 0
  } catch (error) {
    console.error('Cloudflare hostnameExists error:', error)
    return false
  }
}

/**
 * Get the CNAME target that tenants should point their DNS to.
 *
 * @returns The Cloudflare CNAME target from environment config
 */
export function getCnameTarget(): string {
  const { cnameTarget } = getCloudflareConfig()
  return cnameTarget
}

/**
 * Map Cloudflare status to a user-friendly verification status.
 *
 * @param status - Cloudflare hostname status
 * @returns User-friendly status string
 */
export function getVerificationStatusLabel(
  status: CloudflareHostnameStatus
): 'pending' | 'verified' | 'failed' {
  switch (status) {
    case 'active':
      return 'verified'
    case 'pending':
    case 'moved':
      return 'pending'
    case 'deleted':
    case 'pending_deletion':
    case 'blocked':
      return 'failed'
    default:
      return 'pending'
  }
}
