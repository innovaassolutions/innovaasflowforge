/**
 * Coach Landing Page
 *
 * Displays the coach's branded landing page with welcome message
 * and options to register or access an assessment.
 *
 * Story: 3-2-branding-infrastructure
 */

import { BrandedHeader, BrandedFooter } from '@/components/coaching/BrandedHeader'
import { getTenantBySlug } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { buildTenantPath } from '@/lib/utils/tenant-paths'

interface CoachPageProps {
  params: Promise<{ slug: string }>
}

export default async function CoachPage({ params }: CoachPageProps) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)

  // Get hostname for custom domain detection
  const headersList = await headers()
  const hostname = headersList.get('host') || 'flowforge.innovaas.co'

  if (!tenant) {
    notFound()
  }

  const welcomeMessage =
    tenant.brand_config.welcomeMessage ||
    `Welcome to ${tenant.display_name}'s assessment platform.`

  return (
    <>
      <BrandedHeader />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{
                color: 'var(--brand-primary)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Welcome
            </h1>
            <p
              className="text-lg"
              style={{
                color: 'var(--brand-text-muted)',
                fontFamily: 'var(--brand-font-body)',
              }}
            >
              {welcomeMessage}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Register Card */}
            <Link
              href={buildTenantPath('/register', slug, tenant.tenant_type, hostname)}
              className="block p-6 rounded-xl border transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--brand-bg-subtle)',
                borderColor: 'var(--brand-border)',
              }}
            >
              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: 'var(--brand-text)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                New Here?
              </h2>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--brand-text-muted)' }}
              >
                Register to begin your assessment journey.
              </p>
              <span
                className="inline-flex items-center text-sm font-medium"
                style={{ color: 'var(--brand-primary)' }}
              >
                Get Started
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </Link>

            {/* Continue Card */}
            <Link
              href={buildTenantPath('/continue', slug, tenant.tenant_type, hostname)}
              className="block p-6 rounded-xl border transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--brand-bg-subtle)',
                borderColor: 'var(--brand-border)',
              }}
            >
              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: 'var(--brand-text)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                Already Registered?
              </h2>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--brand-text-muted)' }}
              >
                Continue your existing assessment.
              </p>
              <span
                className="inline-flex items-center text-sm font-medium"
                style={{ color: 'var(--brand-primary)' }}
              >
                Continue
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </main>

      <BrandedFooter />
    </>
  )
}
