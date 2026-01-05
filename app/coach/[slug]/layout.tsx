/**
 * Branded Coach Layout
 *
 * Server component that fetches tenant profile by slug and applies
 * brand theming via CSS custom properties. Wraps all /coach/[slug]/ pages.
 *
 * Story: 3-2-branding-infrastructure
 */

import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/supabase/server'
import { generateBrandCss, getGoogleFontsUrl } from '@/lib/theme/brand-theme'
import { TenantProvider } from '@/lib/contexts/tenant-context'

interface CoachLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

/**
 * Dynamic metadata based on tenant profile
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)

  if (!tenant) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: tenant.display_name,
    description: tenant.brand_config.tagline || `Assessment by ${tenant.display_name}`,
  }
}

/**
 * Branded layout for coach pages
 *
 * This layout:
 * 1. Fetches tenant profile by slug
 * 2. Returns 404 if tenant not found or inactive
 * 3. Injects brand CSS custom properties
 * 4. Loads custom Google Fonts if configured
 * 5. Provides tenant context to children
 */
export default async function CoachLayout({ children, params }: CoachLayoutProps) {
  const { slug } = await params

  // Fetch tenant by slug
  const tenant = await getTenantBySlug(slug)

  // Return 404 if tenant not found or inactive
  if (!tenant) {
    notFound()
  }

  // Generate brand CSS
  const brandCss = generateBrandCss(tenant.brand_config)
  const fontsUrl = getGoogleFontsUrl(tenant.brand_config)

  return (
    <>
      {/* Inject brand CSS custom properties */}
      <style dangerouslySetInnerHTML={{ __html: brandCss }} />

      {/* Load custom Google Fonts if needed */}
      {fontsUrl && (
        <link rel="stylesheet" href={fontsUrl} crossOrigin="anonymous" />
      )}

      {/* Branded page wrapper */}
      <TenantProvider tenant={tenant}>
        <div
          className="min-h-screen flex flex-col"
          style={{
            backgroundColor: 'var(--brand-bg)',
            color: 'var(--brand-text)',
            fontFamily: 'var(--brand-font-body)',
          }}
        >
          {children}
        </div>
      </TenantProvider>
    </>
  )
}
