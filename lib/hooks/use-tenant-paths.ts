'use client'

/**
 * Client-side Hook for Tenant Path Generation
 *
 * Provides a hook for client components to generate paths that work
 * correctly on both custom domains and system domains.
 */

import { useCallback, useMemo } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { buildTenantPath } from '@/lib/utils/tenant-paths'

/**
 * Hook to generate tenant-aware paths in client components.
 *
 * @returns Object with:
 *   - buildPath: Function to generate a path for the current tenant
 *   - isCustomDomain: Whether the current domain is a custom domain
 *
 * @example
 * const { buildPath } = useTenantPaths()
 *
 * // In a Link component
 * <Link href={buildPath('/register')}>Register</Link>
 *
 * // In router.push
 * router.push(buildPath('/session/abc123'))
 */
export function useTenantPaths() {
  const { tenant } = useTenant()

  // Get hostname - safely handles SSR (falls back to system domain behavior)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'flowforge.innovaas.co'

  // Check if we're on a custom domain
  const isOnCustomDomain = useMemo(() => {
    return !isSystemDomainHostname(hostname)
  }, [hostname])

  // Build a path for the current tenant context
  const buildPath = useCallback(
    (relativePath: string): string => {
      return buildTenantPath(relativePath, tenant.slug, tenant.tenant_type, hostname)
    },
    [tenant.slug, tenant.tenant_type, hostname]
  )

  return {
    buildPath,
    isCustomDomain: isOnCustomDomain,
    hostname,
  }
}

/**
 * Check if hostname is a system domain.
 * Duplicated here to avoid importing server-only module.
 */
function isSystemDomainHostname(hostname: string): boolean {
  const SYSTEM_DOMAINS = [
    'innovaas.co',
    'www.innovaas.co',
    'flowforge.innovaas.co',
    'localhost',
  ]

  const SYSTEM_DOMAIN_SUFFIXES = ['.vercel.app', '.localhost']

  const normalizedHost = hostname.split(':')[0].toLowerCase()

  // Check exact matches
  if (SYSTEM_DOMAINS.some((d) => normalizedHost === d || normalizedHost.endsWith(`.${d}`))) {
    return true
  }

  // Check suffix matches (for Vercel preview deployments)
  if (SYSTEM_DOMAIN_SUFFIXES.some((suffix) => normalizedHost.endsWith(suffix))) {
    return true
  }

  return false
}
