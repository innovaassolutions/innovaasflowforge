'use client'

/**
 * How to Read Your Results - Intro Page
 *
 * Displays contextual information before clients view their archetype results.
 * Content copied verbatim from docs/leadingwithmeaning/How to Read Your Results.md
 * Uses tenant branding via CSS custom properties.
 */

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTenantPaths } from '@/lib/hooks/use-tenant-paths'

export default function ResultsIntroPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const { buildPath } = useTenantPaths()

  const token = params?.token as string

  function handleViewResults() {
    router.push(buildPath(`/results/${token}`))
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--brand-bg)' }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          backgroundColor: 'var(--brand-bg)',
          borderColor: 'var(--brand-border)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            {tenant.brand_config.logo?.url ? (
              <Image
                src={tenant.brand_config.logo.url}
                alt={tenant.brand_config.logo.alt || tenant.display_name}
                width={240}
                height={96}
                className="h-16 sm:h-20 w-auto object-contain"
                unoptimized
              />
            ) : (
              <h1
                className="text-xl font-bold"
                style={{
                  color: 'var(--brand-primary)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                {tenant.display_name}
              </h1>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div
          className="rounded-xl p-6 sm:p-10"
          style={{
            backgroundColor: 'var(--brand-bg-subtle)',
            border: '1px solid var(--brand-border)',
          }}
        >
          {/* Title */}
          <h1
            className="text-2xl sm:text-3xl font-bold text-center mb-8"
            style={{
              color: 'var(--brand-text)',
              fontFamily: 'var(--brand-font-heading)',
            }}
          >
            How to Read Your Results
          </h1>

          {/* Content - Verbatim from docs/leadingwithmeaning/How to Read Your Results.md */}
          <div
            className="space-y-6 leading-relaxed"
            style={{ color: 'var(--brand-text)' }}
          >
            <p>
              Before you look at your results, here is the most important thing to understand:
            </p>

            <p>
              This assessment does not measure your personality, potential, or leadership ability.
              It identifies <strong>patterns</strong> in how capable leaders adapt when pressure increases.
            </p>

            {/* Why You See Two Archetypes */}
            <div className="pt-4">
              <h2
                className="text-xl font-semibold mb-3"
                style={{
                  color: 'var(--brand-primary)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                Why You See Two Archetypes
              </h2>
              <p>
                Your results include two leadership archetypes because most leaders do not lead the same way in all conditions.
              </p>
            </div>

            {/* Your Default Archetype Under Pressure */}
            <div
              className="p-5 rounded-lg"
              style={{
                backgroundColor: 'var(--brand-bg)',
                border: '1px solid var(--brand-border)',
              }}
            >
              <h3
                className="font-semibold mb-2"
                style={{ color: 'var(--brand-text)' }}
              >
                Your Default Archetype Under Pressure
              </h3>
              <p style={{ color: 'var(--brand-text-muted)' }}>
                This reflects what you instinctively rely on when things feel tense, overloaded, or high-stakes. It is a learned, protective response that developed because it worked. This archetype is not a flaw. It is often the reason you are trusted. Over time, though, leaning on it too heavily can become exhausting.
              </p>
            </div>

            {/* Your Authentic Archetype When Grounded */}
            <div
              className="p-5 rounded-lg"
              style={{
                backgroundColor: 'var(--brand-bg)',
                border: '1px solid var(--brand-border)',
              }}
            >
              <h3
                className="font-semibold mb-2"
                style={{ color: 'var(--brand-text)' }}
              >
                Your Authentic Archetype When Grounded
              </h3>
              <p style={{ color: 'var(--brand-text-muted)' }}>
                This reflects how leadership feels when you are steady, supported, and not operating in constant reaction mode. It points to the style of leadership that feels more natural, sustainable, and energizing for you. This is not something you need to become. It is usually already present, but harder to access under pressure.
              </p>
            </div>

            {/* What the Pairing Means */}
            <div className="pt-2">
              <h2
                className="text-xl font-semibold mb-3"
                style={{
                  color: 'var(--brand-primary)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                What the Pairing Means
              </h2>
              <p>
                For many leaders, these two archetypes are different. That does not mean anything is wrong. It usually means you are coping effectively, but not sustainably.
              </p>
              <p className="mt-3">
                The pairing highlights where energy is being spent unnecessarily and where leadership may be working harder than it needs to.
              </p>
            </div>

            {/* How to Approach Your Results */}
            <div className="pt-2">
              <h2
                className="text-xl font-semibold mb-3"
                style={{
                  color: 'var(--brand-primary)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                How to Approach Your Results
              </h2>
              <p className="mb-4">As you review what follows:</p>
              <ul className="space-y-3 ml-1">
                <li className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                  <span>
                    Treat these as patterns, not labels – the names are to put language on the pattern.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                  <span>
                    Look for resonance, not precision – we are all a mix of all of these archetypes. The goal here is to describe usual patterns not one-offs.
                  </span>
                </li>
              </ul>
            </div>

            {/* Closing */}
            <p className="pt-4">
              The value is not in the category itself, but in what it helps you notice. After you read your results, I will share some next steps.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-10 text-center">
            <button
              onClick={handleViewResults}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
              }}
            >
              Review Your Results
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8">
        {tenant.brand_config.showPoweredBy && (
          <p className="text-xs" style={{ color: 'var(--brand-text-muted)' }}>
            Powered by Innovaas FlowForge
          </p>
        )}
      </footer>
    </div>
  )
}
