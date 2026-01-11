'use client'

/**
 * Coach Registration Page
 *
 * Allows prospective clients to register for an assessment.
 * Creates a participant_session and provides next steps.
 *
 * Story: 3-3-registration-sessions
 */

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BrandedHeader, BrandedFooter } from '@/components/coaching/BrandedHeader'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTenantPaths } from '@/lib/hooks/use-tenant-paths'

interface FormData {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
  submit?: string
}

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const { buildPath } = useTenantPaths()

  const [formData, setFormData] = useState<FormData>({ name: '', email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const slug = params?.slug as string

  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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

    try {
      const response = await fetch(`/api/coach/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setSessionToken(data.sessionToken)
      } else {
        setErrors({ submit: data.error || 'Registration failed. Please try again.' })
      }
    } catch {
      setErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleStartAssessment() {
    if (sessionToken) {
      router.push(buildPath(`/session/${sessionToken}`))
    }
  }

  // Success state
  if (isSuccess) {
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
            {/* Success Illustration */}
            <div className="mb-6">
              <svg
                className="mx-auto w-32 h-32"
                viewBox="0 0 128 128"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background circles for depth */}
                <circle cx="64" cy="64" r="56" fill="var(--brand-primary)" fillOpacity="0.08" />
                <circle cx="64" cy="64" r="44" fill="var(--brand-primary)" fillOpacity="0.12" />

                {/* Main circle with gradient effect */}
                <circle cx="64" cy="64" r="32" fill="var(--brand-primary)" fillOpacity="0.15" />
                <circle cx="64" cy="64" r="28" fill="var(--brand-primary)" />

                {/* Checkmark */}
                <path
                  d="M52 64L60 72L76 56"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Decorative sparkles */}
                <circle cx="100" cy="40" r="3" fill="var(--brand-primary)" fillOpacity="0.6" />
                <circle cx="28" cy="48" r="2" fill="var(--brand-primary)" fillOpacity="0.5" />
                <circle cx="36" cy="88" r="2.5" fill="var(--brand-primary)" fillOpacity="0.4" />
                <circle cx="92" cy="80" r="2" fill="var(--brand-primary)" fillOpacity="0.5" />

                {/* Small accent stars */}
                <path d="M108 60L110 64L114 62L110 66L108 70L106 66L102 62L106 64L108 60Z" fill="var(--brand-primary)" fillOpacity="0.4" />
                <path d="M20 68L22 72L26 70L22 74L20 78L18 74L14 70L18 72L20 68Z" fill="var(--brand-primary)" fillOpacity="0.3" />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-2"
              style={{
                color: 'var(--brand-text)',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Registration Complete!
            </h1>

            <p
              className="mb-6"
              style={{
                color: 'var(--brand-text-muted)',
                fontFamily: 'var(--brand-font-body)',
              }}
            >
              Thank you, {formData.name}. You're all set to begin your leadership
              archetype discovery.
            </p>

            <button
              onClick={handleStartAssessment}
              className="w-full py-3 px-6 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
              }}
            >
              Start Assessment Now
            </button>

            <p
              className="mt-4 text-sm"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              You can also access your session later using your email address.
            </p>
          </div>
        </main>

        <BrandedFooter />
      </>
    )
  }

  // Registration form
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
              Begin Your Journey
            </h1>
            <p
              className="text-sm sm:text-base"
              style={{
                color: 'var(--brand-text-muted)',
                fontFamily: 'var(--brand-font-body)',
              }}
            >
              Register to discover your leadership archetype with {tenant.display_name}.
            </p>
          </div>

          {/* Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-xl"
            style={{
              backgroundColor: 'var(--brand-bg-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            {/* Name Field */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--brand-text)' }}
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  border: `1px solid ${errors.name ? '#ef4444' : 'var(--brand-border)'}`,
                  color: 'var(--brand-text)',
                }}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  border: `1px solid ${errors.email ? '#ef4444' : 'var(--brand-border)'}`,
                  color: 'var(--brand-text)',
                }}
                disabled={isSubmitting}
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
                  Registering...
                </span>
              ) : (
                'Register & Continue'
              )}
            </button>

            {/* Privacy Note */}
            <p
              className="mt-4 text-xs text-center"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              Your information is confidential and will only be shared with {tenant.display_name}.
            </p>
          </form>
        </div>
      </main>

      <BrandedFooter />
    </>
  )
}
