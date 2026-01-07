'use client'

/**
 * Archetype Results Page
 *
 * Displays leadership archetype results after assessment completion.
 * Includes primary archetype, tension pattern (if any), and moving forward sections.
 * Uses tenant branding via CSS custom properties.
 *
 * Story: 1.1 Results Page Foundation
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useTenant } from '@/lib/contexts/tenant-context'
import { ArchetypeResults } from '@/components/coaching/ArchetypeResults'
import { TensionPatternCard } from '@/components/coaching/TensionPatternCard'
import { ReflectionChoice } from '@/components/coaching/ReflectionChoice'
import type { ResultsResponse } from '@/app/api/coach/[slug]/results/[token]/route'

export default function ResultsPage() {
  const params = useParams()
  const { tenant } = useTenant()

  const slug = params.slug as string
  const token = params.token as string

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
      const response = await fetch(`/flowforge/api/coach/${slug}/results/${token}`)
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

  if (!data?.results || !data?.session) return null

  const { results, session } = data

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
            Based on your responses, here&apos;s what we discovered about your natural leadership patterns.
          </p>
        </div>

        {/* Primary Archetype */}
        <ArchetypeResults
          archetype={results.primary_archetype}
          label="Your Primary Archetype"
          description="This is how you naturally respond when pressure is high and things feel messy."
        />

        {/* Tension Pattern (if exists) */}
        {results.tension_pattern.has_tension && (
          <TensionPatternCard
            tensionPattern={results.tension_pattern}
            primaryArchetype={results.primary_archetype.name}
            authenticArchetype={results.authentic_archetype.name}
          />
        )}

        {/* Authentic Archetype (only show if different) */}
        {results.tension_pattern.has_tension && (
          <ArchetypeResults
            archetype={results.authentic_archetype}
            label="Your Authentic Archetype"
            description="This is the leadership style that feels most sustainable and energizing when you're at your best."
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
            <p>
              Understanding your leadership archetype is the first step toward leading with greater intention and sustainability.
            </p>
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
                    Notice when you default to {results.primary_archetype.name} energy under pressure. These patterns developed for good reasons.
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
                    {results.tension_pattern.has_tension
                      ? 'Bridge the gap'
                      : 'Strengthen your strengths'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                    {results.tension_pattern.has_tension
                      ? `Work on accessing your ${results.authentic_archetype.name} energy even when stressed.`
                      : `Your natural alignment is a gift. Focus on sustainable ways to leverage your ${results.primary_archetype.name} strengths.`}
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
        <footer className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
            Your results are confidential and available to you via this link.
          </p>
          {tenant.brand_config.showPoweredBy && (
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              Powered by Innovaas FlowForge
            </p>
          )}
        </footer>
      </main>
    </div>
  )
}
