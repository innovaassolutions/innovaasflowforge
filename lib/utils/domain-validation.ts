/**
 * Domain Validation Utility
 *
 * Validates custom domain inputs for the white-label feature.
 * Ensures domains are valid subdomains (not apex domains) and properly formatted.
 *
 * Spec: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DomainValidationResult {
  valid: boolean
  error?: string
  normalized?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Reserved TLDs and domains that cannot be used as custom domains
const RESERVED_DOMAINS = [
  'innovaas.co',
  'flowforge.innovaas.co',
  'localhost',
  'vercel.app',
  'vercel.com',
]

// Valid TLD pattern (simplified - covers most common TLDs)
const TLD_PATTERN = /^[a-z]{2,63}$/

// Subdomain label pattern (each part between dots)
const LABEL_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Validates a custom domain string.
 *
 * Rules:
 * - Must be a subdomain (at least 3 labels: sub.domain.tld)
 * - No apex domains allowed (domain.tld)
 * - Must be lowercase alphanumeric with hyphens
 * - Cannot be a reserved domain
 * - No trailing dots or slashes
 *
 * @param domain - The domain string to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * validateCustomDomain("assessment.leadingwithmeaning.com")
 * // Returns: { valid: true, normalized: "assessment.leadingwithmeaning.com" }
 *
 * validateCustomDomain("leadingwithmeaning.com")
 * // Returns: { valid: false, error: "Must be a subdomain (e.g., assessment.example.com), not an apex domain" }
 */
export function validateCustomDomain(domain: string): DomainValidationResult {
  // Normalize: lowercase, trim whitespace, remove protocol and trailing slashes
  let normalized = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .replace(/\.+$/, '')

  // Check for empty input
  if (!normalized) {
    return {
      valid: false,
      error: 'Domain cannot be empty',
    }
  }

  // Check for invalid characters
  if (!/^[a-z0-9.-]+$/.test(normalized)) {
    return {
      valid: false,
      error: 'Domain can only contain letters, numbers, hyphens, and dots',
    }
  }

  // Split into labels
  const labels = normalized.split('.')

  // Check minimum labels (must be subdomain: sub.domain.tld = 3 labels)
  if (labels.length < 3) {
    return {
      valid: false,
      error: 'Must be a subdomain (e.g., assessment.example.com), not an apex domain',
    }
  }

  // Validate each label
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]

    // Check label length
    if (label.length === 0) {
      return {
        valid: false,
        error: 'Domain contains empty labels (consecutive dots)',
      }
    }

    if (label.length > 63) {
      return {
        valid: false,
        error: `Domain label "${label}" exceeds 63 character limit`,
      }
    }

    // Check label format (alphanumeric, hyphens in middle)
    if (!LABEL_PATTERN.test(label)) {
      return {
        valid: false,
        error: `Invalid domain label "${label}". Labels must start and end with alphanumeric characters`,
      }
    }
  }

  // Check TLD
  const tld = labels[labels.length - 1]
  if (!TLD_PATTERN.test(tld)) {
    return {
      valid: false,
      error: `Invalid top-level domain "${tld}"`,
    }
  }

  // Check total length (max 253 characters per RFC 1035)
  if (normalized.length > 253) {
    return {
      valid: false,
      error: 'Domain exceeds maximum length of 253 characters',
    }
  }

  // Check reserved domains
  for (const reserved of RESERVED_DOMAINS) {
    if (normalized === reserved || normalized.endsWith(`.${reserved}`)) {
      return {
        valid: false,
        error: `Cannot use ${reserved} or its subdomains as a custom domain`,
      }
    }
  }

  return {
    valid: true,
    normalized,
  }
}

/**
 * Extracts the apex domain from a full domain string.
 *
 * @param domain - Full domain (e.g., "assessment.leadingwithmeaning.com")
 * @returns Apex domain (e.g., "leadingwithmeaning.com")
 *
 * @example
 * getApexDomain("assessment.leadingwithmeaning.com")
 * // Returns: "leadingwithmeaning.com"
 */
export function getApexDomain(domain: string): string {
  const labels = domain.toLowerCase().trim().split('.')
  if (labels.length < 2) return domain
  return labels.slice(-2).join('.')
}

/**
 * Extracts the subdomain part from a full domain string.
 *
 * @param domain - Full domain (e.g., "assessment.leadingwithmeaning.com")
 * @returns Subdomain part (e.g., "assessment")
 *
 * @example
 * getSubdomain("assessment.leadingwithmeaning.com")
 * // Returns: "assessment"
 */
export function getSubdomain(domain: string): string | null {
  const labels = domain.toLowerCase().trim().split('.')
  if (labels.length < 3) return null
  return labels.slice(0, -2).join('.')
}

/**
 * Generates DNS instruction text for a custom domain.
 *
 * @param domain - The custom domain being configured
 * @param cnameTarget - The CNAME target from Cloudflare
 * @returns Formatted DNS instructions string
 */
export function generateDnsInstructions(domain: string, cnameTarget: string): string {
  const subdomain = getSubdomain(domain) || domain.split('.')[0]
  const apex = getApexDomain(domain)

  return `To activate your custom domain, add this DNS record at your domain registrar:

Type: CNAME
Name: ${subdomain}
Target: ${cnameTarget}

If you're configuring DNS for ${apex}, log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add the CNAME record above.

Note: DNS changes can take up to 24 hours to propagate, though they typically take effect within minutes.`
}
