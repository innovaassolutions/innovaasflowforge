'use client'

/**
 * Coach Continue Page
 *
 * Allows returning clients to look up their existing session by email.
 * Direct lookup - shows session link immediately if found.
 *
 * Story: Continue session flow
 */

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BrandedHeader, BrandedFooter } from '@/components/coaching/BrandedHeader'
import { useTenant } from '@/lib/contexts/tenant-context'
import Link from 'next/link'

interface FormErrors {
  email?: string
  submit?: string
}

export default function ContinuePage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const slug = params?.slug as string

  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})
    setNotFound(false)

    try {
      const response = await fetch(`/api/coach/${slug}/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      })

      const data = await response.json()

      if (data.success && data.sessionToken) {
        // Redirect to the session
        router.push(`/coach/${slug}/session/${data.sessionToken}`)
      } else if (data.notFound) {
        setNotFound(true)
      } else {
        setErrors({ submit: data.error || 'Something went wrong. Please try again.' })
      }
    } catch {
      setErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not found state
  if (notFound) {
    return (
      <>
        <BrandedHeader minimal />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div
            className="max-w-md w-full p-8 rounded-xl text-center"
            style={{
              backgroundColor: 'var(--brand-bg-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            {/* Not Found Illustration */}
            <div className="mb-6">
              <svg
                className="mx-auto w-24 h-24"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="48" cy="48" r="40" fill="var(--brand-primary)" fillOpacity="0.1" />
                <circle cx="48" cy="48" r="28" fill="var(--brand-primary)" fillOpacity="0.15" />
                <path
                  d="M48 32V52M48 60V64"
                  stroke="var(--brand-primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-2"
              style={{
                color: 'var(--brand-text)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              No Session Found
            </h1>

            <p
              className="mb-6"
              style={{
                color: 'var(--brand-text-muted)',
                fontFamily: 'var(--brand-font-body)',
              }}
            >
              We couldn't find a session for <strong>{email}</strong>. Would you like to register instead?
            </p>

            <div className="space-y-3">
              <Link
                href={`/coach/${slug}/register`}
                className="block w-full py-3 px-6 rounded-lg font-semibold transition-colors text-center"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white',
                }}
              >
                Register Now
              </Link>

              <button
                onClick={() => {
                  setNotFound(false)
                  setEmail('')
                }}
                className="block w-full py-3 px-6 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--brand-primary)',
                  border: '1px solid var(--brand-primary)',
                }}
              >
                Try Another Email
              </button>
            </div>
          </div>
        </main>

        <BrandedFooter />
      </>
    )
  }

  // Email lookup form
  return (
    <>
      <BrandedHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{
                color: 'var(--brand-primary)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Continue Your Journey
            </h1>
            <p
              className="text-sm sm:text-base"
              style={{
                color: 'var(--brand-text-muted)',
                fontFamily: 'var(--brand-font-body)',
              }}
            >
              Enter your email to access your existing assessment.
            </p>
          </div>

          {/* Lookup Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-xl"
            style={{
              backgroundColor: 'var(--brand-bg-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            {/* Email Field */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--brand-text)' }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  border: `1px solid ${errors.email ? '#ef4444' : 'var(--brand-border)'}`,
                  color: 'var(--brand-text)',
                }}
                disabled={isSubmitting}
                autoFocus
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                }}
              >
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                  Looking up...
                </span>
              ) : (
                'Find My Session'
              )}
            </button>

            {/* Register Link */}
            <p
              className="mt-4 text-sm text-center"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              Don't have an account?{' '}
              <Link
                href={`/coach/${slug}/register`}
                className="font-medium"
                style={{ color: 'var(--brand-primary)' }}
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </main>

      <BrandedFooter />
    </>
  )
}
