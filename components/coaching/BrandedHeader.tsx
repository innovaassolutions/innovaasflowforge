'use client'

/**
 * BrandedHeader Component
 *
 * Displays the coach's branding in the header area including:
 * - Logo with configurable dimensions
 * - Optional tagline
 * - Brand colors applied via CSS variables
 *
 * Story: 3-2-branding-infrastructure
 */

import Image from 'next/image'
import { useTenant } from '@/lib/contexts/tenant-context'

interface BrandedHeaderProps {
  /** Show minimal header (logo only) */
  minimal?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * BrandedHeader displays the tenant's logo and tagline
 *
 * Uses CSS custom properties injected by the branded layout
 * for colors and fonts.
 *
 * @example
 * <BrandedHeader />
 * <BrandedHeader minimal />
 */
export function BrandedHeader({ minimal = false, className = '' }: BrandedHeaderProps) {
  const { tenant } = useTenant()
  const { brand_config } = tenant

  const logo = brand_config.logo
  const tagline = brand_config.tagline
  const showPoweredBy = brand_config.showPoweredBy ?? true

  return (
    <header
      className={`w-full bg-[var(--brand-bg)] border-b border-[var(--brand-border)] ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col items-center gap-2">
          {/* Logo */}
          {logo?.url ? (
            <Image
              src={logo.url}
              alt={logo.alt || tenant.display_name}
              width={logo.width || 200}
              height={60}
              className="h-12 sm:h-16 w-auto object-contain"
              style={{ maxWidth: logo.width ? `${logo.width}px` : '200px' }}
              unoptimized
            />
          ) : (
            /* Text fallback if no logo */
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{
                color: 'var(--brand-primary)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              {tenant.display_name}
            </h1>
          )}

          {/* Tagline */}
          {!minimal && tagline && (
            <p
              className="text-sm sm:text-base text-center max-w-md"
              style={{
                color: 'var(--brand-text-muted)',
                fontFamily: 'var(--brand-font-body)',
              }}
            >
              {tagline}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * BrandedFooter Component
 *
 * Optional footer for branded pages with coach info
 */
export function BrandedFooter({ className = '' }: { className?: string }) {
  const { tenant } = useTenant()
  const showPoweredBy = tenant.brand_config.showPoweredBy ?? true

  return (
    <footer
      className={`w-full border-t border-[var(--brand-border)] bg-[var(--brand-bg-subtle)] ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-sm"
            style={{
              color: 'var(--brand-text-muted)',
              fontFamily: 'var(--brand-font-body)',
            }}
          >
            &copy; {new Date().getFullYear()} {tenant.display_name}
          </p>

          {showPoweredBy && (
            <p className="text-xs text-[var(--brand-text-muted)]">
              Assessment platform by{' '}
              <a
                href="https://www.innovaas.co/flowforge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-primary)] hover:underline"
              >
                Innovaas FlowForge
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}

export default BrandedHeader
