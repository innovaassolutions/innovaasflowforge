/**
 * Tenant Lookup Service
 *
 * Provides fast domain-to-tenant lookup for middleware routing.
 * Used to detect custom domains and route requests to the correct tenant.
 *
 * Spec: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface TenantLookupResult {
  found: boolean
  slug?: string
  tenantId?: string
  tenantType?: 'coach' | 'consultant' | 'school'
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Domains that should NOT be treated as custom domains
const SYSTEM_DOMAINS = [
  'innovaas.co',
  'www.innovaas.co',
  'flowforge.innovaas.co',
  'localhost',
  'localhost:3000',
  'vercel.app',
]

// Check if domain ends with any of these (for Vercel preview deployments)
const SYSTEM_DOMAIN_SUFFIXES = [
  '.vercel.app',
  '.localhost',
]

// ============================================================================
// SUPABASE CLIENT FOR MIDDLEWARE
// ============================================================================

// Create a lightweight Supabase client for middleware use
// Uses service role key to bypass RLS
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration for tenant lookup')
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Check if a hostname is a system domain (not a custom domain).
 *
 * @param hostname - The hostname to check
 * @returns True if this is a system domain, false if it could be a custom domain
 */
export function isSystemDomain(hostname: string): boolean {
  // Normalize hostname (remove port if present)
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

/**
 * Look up a tenant by custom domain.
 *
 * @param domain - The custom domain to look up
 * @returns Tenant info if found, or not found result
 *
 * @example
 * const result = await lookupTenantByDomain("assessment.leadingwithmeaning.com")
 * if (result.found) {
 *   // Rewrite URL to internal path using result.slug
 * }
 */
export async function lookupTenantByDomain(domain: string): Promise<TenantLookupResult> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { found: false }
  }

  try {
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('id, slug, tenant_type')
      .eq('custom_domain', domain.toLowerCase())
      .eq('domain_verified', true)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { found: false }
    }

    return {
      found: true,
      tenantId: data.id,
      slug: data.slug,
      tenantType: data.tenant_type as 'coach' | 'consultant' | 'school',
    }
  } catch (err) {
    console.error('Error looking up tenant by domain:', err)
    return { found: false }
  }
}

/**
 * Determine the internal path prefix for a tenant type.
 *
 * @param tenantType - The type of tenant
 * @returns The URL path prefix for this tenant type
 */
export function getTenantPathPrefix(tenantType: 'coach' | 'consultant' | 'school'): string {
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
 * Build the internal URL path for a custom domain request.
 *
 * Maps clean external paths to internal paths with tenant slug.
 *
 * @param externalPath - The path from the custom domain request
 * @param slug - The tenant's URL slug
 * @param tenantType - The type of tenant
 * @param basePath - The Next.js basePath (e.g., '/flowforge')
 * @returns The internal path to rewrite to
 *
 * @example
 * buildInternalPath('/results/abc123', 'leadingwithmeaning', 'coach', '/flowforge')
 * // Returns: '/flowforge/coach/leadingwithmeaning/results/abc123'
 */
export function buildInternalPath(
  externalPath: string,
  slug: string,
  tenantType: 'coach' | 'consultant' | 'school',
  basePath: string = ''
): string {
  const prefix = getTenantPathPrefix(tenantType)
  const cleanPath = externalPath === '/' ? '' : externalPath

  // Build internal path: basePath + /tenantType/slug + externalPath
  return `${basePath}/${prefix}/${slug}${cleanPath}`
}

/**
 * Check if a path should be rewritten for custom domains.
 *
 * Some paths should pass through without rewriting (API routes, static files, etc.)
 *
 * @param path - The request path
 * @returns True if this path should be rewritten
 */
export function shouldRewritePath(path: string): boolean {
  // Don't rewrite API routes
  if (path.startsWith('/api/')) {
    return false
  }

  // Don't rewrite static files
  if (path.startsWith('/_next/')) {
    return false
  }

  // Don't rewrite auth routes
  if (path.startsWith('/auth/')) {
    return false
  }

  // Don't rewrite dashboard routes (they shouldn't be accessible via custom domain)
  if (path.startsWith('/dashboard')) {
    return false
  }

  // Rewrite everything else
  return true
}
