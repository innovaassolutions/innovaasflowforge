/**
 * ReflectionChoice Component
 *
 * "Want to go deeper?" choice UI that appears on the results page.
 * Allows participants to start a reflection conversation or gracefully exit.
 *
 * Story: 1.2 Reflection Flow, 1.4 Polish & Integration
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BookingConfig {
  enabled: boolean
  url: string
  buttonText?: string
  showOnResults?: boolean
  showInEmail?: boolean
}

type ReflectionStatus = 'none' | 'pending' | 'accepted' | 'completed' | 'declined'

interface ReflectionChoiceProps {
  slug: string
  token: string
  reflectionStatus: ReflectionStatus | string
  bookingConfig?: BookingConfig
  onStatusChange?: (newStatus: ReflectionStatus) => void
}

export function ReflectionChoice({
  slug,
  token,
  reflectionStatus,
  bookingConfig,
  onStatusChange
}: ReflectionChoiceProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle "No thanks" graceful exit - redirect to thank you page
  function handleDecline() {
    setIsLoading(true)
    // Navigate to thank you page which handles PDF download and booking CTA
    router.push(`/coach/${slug}/results/${token}/thank-you`)
  }

  // If reflection is already completed, show completion message
  if (reflectionStatus === 'completed') {
    return (
      <section
        className="rounded-xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--brand-bg-muted)',
          border: '1px solid var(--brand-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2
            className="text-xl font-bold"
            style={{
              color: 'var(--brand-secondary, var(--brand-text))',
              fontFamily: 'var(--brand-font-heading)',
            }}
          >
            Reflection Complete
          </h2>
        </div>
        <p style={{ color: 'var(--brand-text)' }}>
          Thank you for taking the time to reflect on your results. Your insights have been saved.
        </p>
        <Link
          href={`/coach/${slug}/results/${token}/reflect`}
          className="inline-block mt-4 text-sm underline"
          style={{ color: 'var(--brand-text-muted)' }}
        >
          View reflection conversation
        </Link>

        {/* Booking CTA */}
        {bookingConfig?.enabled && bookingConfig?.showOnResults !== false && (
          <div
            className="mt-6 p-4 rounded-lg text-center"
            style={{
              backgroundColor: 'var(--brand-bg)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <p className="mb-3 font-medium" style={{ color: 'var(--brand-text)' }}>
              Ready to explore your results further?
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
              {bookingConfig.buttonText || 'Book a Session'}
            </a>
          </div>
        )}
      </section>
    )
  }

  // If user previously declined, show options for PDF download and reflection
  if (reflectionStatus === 'declined') {
    return (
      <section
        className="rounded-xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--brand-bg-muted)',
          border: '1px solid var(--brand-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2
            className="text-xl font-bold"
            style={{
              color: 'var(--brand-secondary, var(--brand-text))',
              fontFamily: 'var(--brand-font-heading)',
            }}
          >
            Assessment Complete
          </h2>
        </div>
        <p className="mb-4" style={{ color: 'var(--brand-text)' }}>
          Your results are available to download or you can still go deeper if you&apos;d like.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/coach/${slug}/results/${token}/thank-you`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--brand-bg)',
              color: 'var(--brand-text)',
              border: '1px solid var(--brand-border)',
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download PDF
          </Link>
          <Link
            href={`/coach/${slug}/results/${token}/reflect`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--brand-primary)',
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Add a reflection
          </Link>
        </div>

        {/* Booking CTA */}
        {bookingConfig?.enabled && bookingConfig?.showOnResults !== false && (
          <div
            className="mt-6 p-4 rounded-lg text-center"
            style={{
              backgroundColor: 'var(--brand-bg)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <p className="mb-3 font-medium" style={{ color: 'var(--brand-text)' }}>
              Ready to explore your results further?
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
              {bookingConfig.buttonText || 'Book a Session'}
            </a>
          </div>
        )}
      </section>
    )
  }

  // If reflection is in progress, show continue button
  if (reflectionStatus === 'accepted') {
    return (
      <section
        className="rounded-xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--brand-bg-muted)',
          border: '1px solid var(--brand-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2
            className="text-xl font-bold"
            style={{
              color: 'var(--brand-secondary, var(--brand-text))',
              fontFamily: 'var(--brand-font-heading)',
            }}
          >
            Reflection In Progress
          </h2>
        </div>
        <p className="mb-4" style={{ color: 'var(--brand-text)' }}>
          You started a reflection conversation. Continue where you left off.
        </p>
        <Link
          href={`/coach/${slug}/results/${token}/reflect`}
          className="inline-block px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: 'white',
          }}
        >
          Continue Reflection
        </Link>
      </section>
    )
  }

  // Default: offer the choice to go deeper
  return (
    <section
      className="rounded-xl p-6 sm:p-8"
      style={{
        backgroundColor: 'var(--brand-bg-muted)',
        border: '1px solid var(--brand-border)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{
            color: 'var(--brand-text)',
            fontFamily: 'var(--brand-font-heading)',
          }}
        >
          Want to go deeper?
        </h2>
        <p style={{ color: 'var(--brand-text-muted)' }}>
          Take a few minutes to reflect on your results with guided questions.
          Your insights will be saved and can help inform your coaching conversation.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-center text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#DC2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      {/* Choice Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/coach/${slug}/results/${token}/reflect`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--brand-primary)',
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Yes, let&apos;s go deeper
        </Link>
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--brand-bg)',
            color: 'var(--brand-text)',
            border: '1px solid var(--brand-border)',
          }}
        >
          {isLoading ? (
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
              Sending results...
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              I&apos;m good for now
            </>
          )}
        </button>
      </div>

      {/* Note */}
      <p
        className="text-center text-xs mt-4"
        style={{ color: 'var(--brand-text-muted)' }}
      >
        Choosing "I'm good for now" will send your results to your email.
        You can return anytime to add reflections.
      </p>
    </section>
  )
}
