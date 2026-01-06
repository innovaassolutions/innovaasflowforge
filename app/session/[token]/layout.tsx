/**
 * Branded Session Layout
 *
 * Server component that fetches tenant profile by session token and applies
 * brand theming via CSS custom properties. Wraps all /session/[token]/ pages.
 *
 * Falls back to default FlowForge branding if no tenant is associated.
 */

import { getTenantBySessionToken } from '@/lib/supabase/server'
import { generateBrandCss, getGoogleFontsUrl } from '@/lib/theme/brand-theme'
import { TenantProvider } from '@/lib/contexts/tenant-context'

interface SessionLayoutProps {
  children: React.ReactNode
  params: Promise<{ token: string }>
}

/**
 * Branded layout for session pages
 *
 * This layout:
 * 1. Fetches tenant profile by session token (via campaign)
 * 2. If tenant exists, injects brand CSS custom properties
 * 3. Falls back to default styling if no tenant (legacy campaigns)
 */
export default async function SessionLayout({ children, params }: SessionLayoutProps) {
  const { token } = await params

  // Try to fetch tenant by session token
  const tenant = await getTenantBySessionToken(token)

  // If no tenant, just render children with default styling
  if (!tenant) {
    return <>{children}</>
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

      {/* Provide tenant context and render with brand styles */}
      <TenantProvider tenant={tenant}>
        <div
          style={{
            // Apply brand colors as fallback for CSS variables
            ['--brand-primary' as string]: tenant.brand_config.colors.primary,
            ['--brand-bg' as string]: tenant.brand_config.colors.background,
          }}
        >
          {children}
        </div>
      </TenantProvider>
    </>
  )
}
