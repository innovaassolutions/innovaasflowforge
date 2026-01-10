import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import {
  isSystemDomain,
  lookupTenantByDomain,
  buildInternalPath,
  shouldRewritePath,
} from '@/lib/services/tenant-lookup'

// The Next.js basePath from next.config.js
const BASE_PATH = '/flowforge'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // ============================================================================
  // CUSTOM DOMAIN ROUTING
  // ============================================================================

  // Check if this is a custom domain (not innovaas.co, localhost, or vercel.app)
  if (!isSystemDomain(hostname) && shouldRewritePath(pathname)) {
    // Look up tenant by custom domain
    const tenant = await lookupTenantByDomain(hostname)

    if (tenant.found && tenant.slug && tenant.tenantType) {
      // Build the internal path WITHOUT basePath - Next.js adds it automatically
      // when basePath is configured in next.config.js
      const internalPath = buildInternalPath(
        pathname,
        tenant.slug,
        tenant.tenantType,
        '' // Don't include basePath - Next.js handles it
      )

      // Clone the URL and update the pathname
      const url = request.nextUrl.clone()
      url.pathname = internalPath

      // Rewrite to internal path while keeping external URL unchanged
      return NextResponse.rewrite(url)
    } else {
      // Custom domain not found or not verified - redirect to main site
      return NextResponse.redirect(new URL('https://innovaas.co'))
    }
  }

  // ============================================================================
  // STANDARD AUTH HANDLING (for non-custom-domain requests)
  // ============================================================================

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - this is critical for maintaining auth
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - reports/* (public token-based report access)
     * - session/* (public token-based stakeholder sessions)
     * - api/voice/* (ElevenLabs voice API routes - use their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|reports|session|api/voice|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
