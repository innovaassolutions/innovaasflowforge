/**
 * Tenant Path Utilities
 *
 * Generates correct paths for tenant pages based on whether
 * the user is accessing via a custom domain or system domain.
 *
 * On custom domains (e.g., archetypequiz.leadingwithmeaning.com):
 *   - Paths are relative: /register, /continue, /session/abc123
 *   - Middleware rewrites these to internal paths
 *
 * On system domains (e.g., flowforge.innovaas.co):
 *   - Paths include tenant prefix: /coach/leadingwithmeaning/register
 *   - Direct routing to internal paths
 */

import { isSystemDomain } from '@/lib/services/tenant-lookup'

/**
 * Build a path for a tenant page that works on both custom and system domains.
 *
 * @param relativePath - The path relative to the tenant root (e.g., "/register", "/session/abc123")
 * @param slug - The tenant's URL slug
 * @param tenantType - The type of tenant (coach, consultant, school)
 * @param hostname - The current hostname (from window.location.hostname or headers)
 * @returns The correct path for the current domain context
 *
 * @example
 * // On custom domain (archetypequiz.leadingwithmeaning.com)
 * buildTenantPath('/register', 'leadingwithmeaning', 'coach', 'archetypequiz.leadingwithmeaning.com')
 * // Returns: '/register'
 *
 * // On system domain (flowforge.innovaas.co)
 * buildTenantPath('/register', 'leadingwithmeaning', 'coach', 'flowforge.innovaas.co')
 * // Returns: '/coach/leadingwithmeaning/register'
 */
export function buildTenantPath(
  relativePath: string,
  slug: string,
  tenantType: 'coach' | 'consultant' | 'school',
  hostname: string
): string {
  // Ensure path starts with /
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`

  // If on a custom domain, use relative paths (middleware handles rewriting)
  if (!isSystemDomain(hostname)) {
    return cleanPath
  }

  // On system domain, use full internal path
  const tenantPrefix = getTenantPrefix(tenantType)
  return `/${tenantPrefix}/${slug}${cleanPath}`
}

/**
 * Get the URL prefix for a tenant type.
 */
function getTenantPrefix(tenantType: 'coach' | 'consultant' | 'school'): string {
  switch (tenantType) {
    case 'coach':
      return 'coach'
    case 'consultant':
      return 'consultant'
    case 'school':
      return 'institution'
    default:
      return 'coach'
  }
}

/**
 * Check if the current request is from a custom domain.
 * For use in server components via headers().
 *
 * @param hostname - The hostname from request headers
 * @returns true if this is a custom domain, false if system domain
 */
export function isCustomDomain(hostname: string): boolean {
  return !isSystemDomain(hostname)
}
