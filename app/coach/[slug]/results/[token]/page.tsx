'use client'

/**
 * Archetype Results Page
 *
 * Displays leadership archetype results after assessment completion.
 * Respects tenant's results_disclosure setting (full/teaser/none).
 * Uses tenant branding via CSS custom properties.
 *
 * Story: 1.1 Results Page Foundation
 * Updated: 3-5 Results Disclosure
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Mail, Calendar, Sparkles } from 'lucide-react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { ArchetypeResults } from '@/components/coaching/ArchetypeResults'
import { TensionPatternCard } from '@/components/coaching/TensionPatternCard'
import { ReflectionChoice } from '@/components/coaching/ReflectionChoice'
import type { ResultsResponse, ResultsDisclosure } from '@/app/api/coach/[slug]/results/[token]/route'
import type { EnhancedResults } from '@/lib/agents/enhancement-agent'
import type { Archetype } from '@/lib/agents/archetype-constitution'

export default function ResultsPage() {
  const params = useParams()
  const { tenant } = useTenant()

  const slug = params?.slug as string
  const token = params?.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ResultsResponse | null>(null)
  const [reflectionStatus, setReflectionStatus] = useState<'none' | 'pending' | 'accepted' | 'completed' | 'declined'>('pending')

  useEffect(() => {
    loadResults()
  }, [token])

  async function loadResults() {
    try {
      setLoading(true)
      const response = await fetch(`/api/coach/${slug}/results/${token}`)
      const result: ResultsResponse = await response.json()

      if (result.success) {
        setData(result)
        const status = result.session?.reflection_status as 'none' | 'pending' | 'accepted' | 'completed' | 'declined' | undefined
        setReflectionStatus(status || 'pending')
      } else {
        setError(result.error || 'Failed to load results')
      }
    } catch (err) {
      setError('Error loading results')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--brand-bg)' }}
      >
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"
            style={{ borderColor: 'var(--brand-primary)', borderRightColor: 'transparent' }}
          />
          <p className="mt-4" style={{ color: 'var(--brand-text-muted)' }}>
            Loading your results...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--brand-bg)' }}
      >
        <div
          className="rounded-xl p-8 max-w-md text-center"
          style={{
            backgroundColor: 'var(--brand-bg-subtle)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <svg
            className="mx-auto h-12 w-12"
            style={{ color: 'var(--brand-primary)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2
            className="mt-4 text-xl font-semibold"
            style={{ color: 'var(--brand-text)' }}
          >
            {error}
          </h2>
          <p className="mt-2" style={{ color: 'var(--brand-text-muted)' }}>
            Please contact {tenant.display_name} for assistance.
          </p>
        </div>
      </div>
    )
  }

  if (!data?.session) return null

  const { session, disclosure = 'full' } = data
  const contactEmail = data.tenant?.contact_email

  // ============================================================================
  // DISCLOSURE: NONE - Thank You Only
  // ============================================================================
  if (disclosure === 'none') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <ResultsHeader session={session} tenant={tenant} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className="rounded-xl p-8 sm:p-12 text-center"
            style={{
              backgroundColor: 'var(--brand-bg-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            {/* Success Icon */}
            <div
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{
                color: 'var(--brand-text)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Assessment Complete!
            </h1>

            <p
              className="text-lg mb-6"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              Thank you for completing your Leadership Archetype Assessment, {session.client_name}.
            </p>

            <p style={{ color: 'var(--brand-text)' }}>
              {tenant.display_name} has received your results and will be in touch to discuss your leadership patterns and next steps.
            </p>

            {/* Contact CTA */}
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--brand-border)' }}>
              <p className="text-sm mb-4" style={{ color: 'var(--brand-text-muted)' }}>
                Questions? Reach out directly:
              </p>
              <ContactButtons contactEmail={contactEmail} tenant={tenant} />
            </div>
          </div>
        </main>
        <ResultsFooter tenant={tenant} />
      </div>
    )
  }

  // ============================================================================
  // DISCLOSURE: TEASER - Archetype Names Only
  // ============================================================================
  if (disclosure === 'teaser') {
    const results = data.results
    if (!results) return null

    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <ResultsHeader session={session} tenant={tenant} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{
                color: 'var(--brand-text)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Your Leadership Archetypes
            </h1>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              Based on your responses, we&apos;ve identified your leadership patterns.
            </p>
          </div>

          {/* Archetype Names */}
          <div
            className="rounded-xl p-8 text-center"
            style={{
              backgroundColor: 'var(--brand-bg-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--brand-text-muted)' }}>
                  Your Primary Archetype
                </p>
                <p
                  className="text-2xl sm:text-3xl font-bold"
                  style={{
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--brand-font-heading)',
                  }}
                >
                  {results.primary_archetype.name}
                </p>
              </div>

              {results.tension_pattern.has_tension && (
                <>
                  <div
                    className="flex items-center justify-center gap-2 py-2"
                    style={{ color: 'var(--brand-text-muted)' }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">Tension Pattern Detected</span>
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--brand-text-muted)' }}>
                      Your Authentic Archetype
                    </p>
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{
                        color: 'var(--brand-secondary, var(--brand-primary))',
                        fontFamily: 'var(--brand-font-heading)',
                      }}
                    >
                      {results.authentic_archetype.name}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Want to Learn More CTA */}
          <div
            className="rounded-xl p-8 text-center"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-3"
              style={{ fontFamily: 'var(--brand-font-heading)' }}
            >
              Want to Learn More?
            </h2>
            <p className="mb-6 opacity-90">
              Discover the full details of your archetype patterns, what they mean for your leadership, and how to leverage them effectively.
            </p>
            <ContactButtons contactEmail={contactEmail} tenant={tenant} variant="light" />
          </div>
        </main>
        <ResultsFooter tenant={tenant} />
      </div>
    )
  }

  // ============================================================================
  // DISCLOSURE: FULL - Complete Results (default)
  // ============================================================================
  const results = data.results
  const enhancedResults = data.enhancedResults
  if (!results) return null
  const isEnhanced = !!enhancedResults

  // For full disclosure, archetype data is complete
  // Type assertion since API guarantees full data for 'full' disclosure
  type ArchetypeData = {
    key: Archetype
    name: string
    core_traits: string[]
    under_pressure: string
    when_grounded: string
    overuse_signals: string[]
  }

  const fullResults = results as {
    primary_archetype: ArchetypeData
    authentic_archetype: ArchetypeData
    tension_pattern: {
      has_tension: boolean
      description?: string
      triggers?: string[]
    }
    scores?: Record<string, unknown>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              {tenant.brand_config.logo?.url ? (
                <Image
                  src={tenant.brand_config.logo.url}
                  alt={tenant.brand_config.logo.alt || tenant.display_name}
                  width={240}
                  height={96}
                  className="h-20 sm:h-24 w-auto object-contain"
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
            <div className="text-right">
              <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                Results for
              </p>
              <p
                className="font-medium"
                style={{ color: 'var(--brand-text)' }}
              >
                {session.client_name}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{
              color: 'var(--brand-text)',
              fontFamily: 'var(--brand-font-heading)',
            }}
          >
            Your Leadership Archetype
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            {isEnhanced
              ? 'Personalized insights based on your assessment and reflection conversation.'
              : 'Based on your responses, here\'s what we discovered about your natural leadership patterns.'}
          </p>
        </div>

        {/* Reflection Themes (if enhanced) */}
        {isEnhanced && enhancedResults.reflectionThemes && enhancedResults.reflectionThemes.length > 0 && (
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--brand-bg-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <h3
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              Key Themes from Your Reflection
            </h3>
            <div className="flex flex-wrap gap-2">
              {enhancedResults.reflectionThemes.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                    opacity: 0.9,
                  }}
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Primary Archetype */}
        <ArchetypeResults
          archetype={fullResults.primary_archetype}
          label="Your Primary Archetype"
          description="This is how you naturally respond when pressure is high and things feel messy."
          personalizedNarrative={enhancedResults?.personalizedDefaultNarrative}
        />

        {/* Tension Pattern (if exists) */}
        {fullResults.tension_pattern.has_tension && (
          <TensionPatternCard
            tensionPattern={fullResults.tension_pattern}
            primaryArchetype={fullResults.primary_archetype.name}
            authenticArchetype={fullResults.authentic_archetype.name}
            personalizedInsights={enhancedResults?.personalizedTensionInsights}
          />
        )}

        {/* Authentic Archetype (only show if different) */}
        {fullResults.tension_pattern.has_tension && (
          <ArchetypeResults
            archetype={fullResults.authentic_archetype}
            label="Your Authentic Archetype"
            description="This is the leadership style that feels most sustainable and energizing when you're at your best."
            personalizedNarrative={enhancedResults?.personalizedAuthenticNarrative}
          />
        )}

        {/* Moving Forward Section */}
        <section
          className="rounded-xl p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--brand-bg-subtle)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <h2
            className="text-2xl font-bold mb-4"
            style={{
              color: 'var(--brand-text)',
              fontFamily: 'var(--brand-font-heading)',
            }}
          >
            Moving Forward
          </h2>
          <div className="space-y-4" style={{ color: 'var(--brand-text)' }}>
            {/* Personalized Guidance (if enhanced) */}
            {isEnhanced && enhancedResults.personalizedGuidance ? (
              <div
                className="p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  borderLeftColor: 'var(--brand-primary)',
                }}
              >
                <p className="leading-relaxed">
                  {enhancedResults.personalizedGuidance}
                </p>
              </div>
            ) : (
              <p>
                Understanding your leadership archetype is the first step toward leading with greater intention and sustainability.
              </p>
            )}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                  }}
                >
                  1
                </div>
                <div>
                  <p className="font-medium">Recognize your patterns</p>
                  <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                    Notice when you default to {fullResults.primary_archetype.name} energy under pressure. These patterns developed for good reasons.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                  }}
                >
                  2
                </div>
                <div>
                  <p className="font-medium">
                    {fullResults.tension_pattern.has_tension
                      ? 'Bridge the gap'
                      : 'Strengthen your strengths'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                    {fullResults.tension_pattern.has_tension
                      ? `Work on accessing your ${fullResults.authentic_archetype.name} energy even when stressed.`
                      : `Your natural alignment is a gift. Focus on sustainable ways to leverage your ${fullResults.primary_archetype.name} strengths.`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                  }}
                >
                  3
                </div>
                <div>
                  <p className="font-medium">Continue the conversation</p>
                  <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                    {tenant.display_name} can help you explore these patterns further and develop strategies for sustainable leadership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reflection Choice */}
        <ReflectionChoice
          slug={slug}
          token={token}
          reflectionStatus={reflectionStatus}
          bookingConfig={tenant.brand_config.booking}
          onStatusChange={setReflectionStatus}
        />

        {/* Footer */}
        <ResultsFooter tenant={tenant} />
      </main>
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

interface ResultsHeaderProps {
  session: {
    client_name: string
  }
  tenant: {
    display_name: string
    brand_config: {
      logo?: { url: string; alt?: string }
    }
  }
}

function ResultsHeader({ session, tenant }: ResultsHeaderProps) {
  return (
    <header
      className="border-b"
      style={{
        backgroundColor: 'var(--brand-bg)',
        borderColor: 'var(--brand-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenant.brand_config.logo?.url ? (
              <Image
                src={tenant.brand_config.logo.url}
                alt={tenant.brand_config.logo.alt || tenant.display_name}
                width={240}
                height={96}
                className="h-20 sm:h-24 w-auto object-contain"
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
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
              Results for
            </p>
            <p className="font-medium" style={{ color: 'var(--brand-text)' }}>
              {session.client_name}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

interface ResultsFooterProps {
  tenant: {
    brand_config: {
      showPoweredBy?: boolean
    }
  }
}

function ResultsFooter({ tenant }: ResultsFooterProps) {
  return (
    <footer className="text-center py-8">
      <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
        Your results are confidential and available to you via this link.
      </p>
      {tenant.brand_config.showPoweredBy && (
        <p className="text-xs mt-2" style={{ color: 'var(--brand-text-muted)' }}>
          Powered by Innovaas FlowForge
        </p>
      )}
    </footer>
  )
}

interface ContactButtonsProps {
  contactEmail?: string
  tenant: {
    display_name: string
    brand_config: {
      booking?: {
        url?: string
      }
    }
  }
  variant?: 'default' | 'light'
}

function ContactButtons({ contactEmail, tenant, variant = 'default' }: ContactButtonsProps) {
  const bookingUrl = tenant.brand_config.booking?.url

  const buttonStyle = variant === 'light'
    ? {
        backgroundColor: 'white',
        color: 'var(--brand-primary)',
      }
    : {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
      }

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {contactEmail && (
        <a
          href={`mailto:${contactEmail}?subject=Leadership%20Archetype%20Assessment`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
          style={buttonStyle}
        >
          <Mail className="w-5 h-5" />
          Email {tenant.display_name.split(' ')[0]}
        </a>
      )}
      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
          style={buttonStyle}
        >
          <Calendar className="w-5 h-5" />
          Schedule a Call
        </a>
      )}
      {!contactEmail && !bookingUrl && (
        <p className="text-sm" style={{ color: variant === 'light' ? 'white' : 'var(--brand-text-muted)' }}>
          Contact your coach for more details.
        </p>
      )}
    </div>
  )
}
