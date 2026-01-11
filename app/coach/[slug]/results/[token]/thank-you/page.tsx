'use client'

/**
 * Thank You Page
 *
 * Displayed after participant clicks "I'm good for now" on results page.
 * Offers PDF download and CTA to schedule review session with coach.
 *
 * Story: 1.3 Email & PDF (modified - email shelved, PDF download only)
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTenant } from '@/lib/contexts/tenant-context'

interface SessionData {
  client_name: string
  client_email: string
  client_status: string
}

export default function ThankYouPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()

  const slug = params?.slug as string
  const token = params?.token as string

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  useEffect(() => {
    loadSession()
    markAsDeclined()
  }, [token])

  async function loadSession() {
    try {
      const response = await fetch(`/api/coach/${slug}/results/${token}`)
      const result = await response.json()

      if (result.success) {
        setSession({
          client_name: result.session.client_name,
          client_email: result.session.client_email,
          client_status: result.session.client_status
        })
      } else {
        setError(result.error || 'Failed to load session')
      }
    } catch (err) {
      setError('Error loading session')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Update reflection status to declined
  async function markAsDeclined() {
    try {
      // Just update status via a lightweight call - no email
      await fetch(`/api/coach/${slug}/results/${token}/mark-declined`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err) {
      // Non-critical - don't show error to user
      console.error('Failed to mark as declined:', err)
    }
  }

  async function handleDownloadPDF() {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/coach/${slug}/results/${token}/download-pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the PDF blob
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${session?.client_name || 'leadership'}-archetype-results.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setDownloadSuccess(true)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloading(false)
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
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // Error state - redirect to results
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
          <Link
            href={`/coach/${slug}/results/${token}`}
            className="inline-block mt-4 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
            }}
          >
            Return to Results
          </Link>
        </div>
      </div>
    )
  }

  const bookingConfig = tenant.brand_config?.booking

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
          <div className="flex items-center justify-center">
            {tenant.brand_config.logo?.url ? (
              <Image
                src={tenant.brand_config.logo.url}
                alt={tenant.brand_config.logo.alt || tenant.display_name}
                width={200}
                height={80}
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: 'var(--brand-bg-muted)' }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              color: 'var(--brand-text)',
              fontFamily: 'var(--brand-font-heading)',
            }}
          >
            Thank You, {session?.client_name}!
          </h1>
          <p
            className="text-lg"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            Your Leadership Archetype assessment is complete.
          </p>
        </div>

        {/* PDF Download Card */}
        <div
          className="rounded-xl p-6 sm:p-8 mb-6"
          style={{
            backgroundColor: 'var(--brand-bg-subtle)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-bg-muted)' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--brand-primary)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: 'var(--brand-text)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                Download Your Results
              </h2>
              <p className="mb-4" style={{ color: 'var(--brand-text-muted)' }}>
                Get a beautifully designed PDF with your complete Leadership Archetype results,
                including insights and recommendations.
              </p>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white',
                }}
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating PDF...
                  </>
                ) : downloadSuccess ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Download Again
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              {downloadSuccess && (
                <p className="mt-2 text-sm" style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}>
                  Your PDF has been downloaded successfully.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking CTA Card */}
        {bookingConfig?.enabled && bookingConfig?.url && (
          <div
            className="rounded-xl p-6 sm:p-8 text-center"
            style={{
              backgroundColor: 'var(--brand-bg-muted)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
              style={{ backgroundColor: 'var(--brand-bg)' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{
                color: 'var(--brand-text)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Ready to Explore Your Results?
            </h2>
            <p className="mb-4" style={{ color: 'var(--brand-text-muted)' }}>
              Schedule a session with {tenant.display_name} to dive deeper into your
              leadership patterns and develop strategies for growth.
            </p>
            <a
              href={bookingConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--brand-secondary, var(--brand-primary))',
                color: 'white',
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {bookingConfig.buttonText || 'Schedule a Review Session'}
            </a>
          </div>
        )}

        {/* Return to Results Link */}
        <div className="text-center mt-8">
          <Link
            href={`/coach/${slug}/results/${token}`}
            className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to Your Results
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 mt-8">
          <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
            Your results are confidential and available via your unique link.
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
