'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Disable static generation for auth pages
export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            organization_name: formData.organizationName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Show success message
      alert('Account created successfully! Please check your email to verify your account.')

      // Redirect to login
      router.push('/auth/login')
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-mocha-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-mocha-surface0 rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-mocha-text mb-2">
              Create Account
            </h1>
            <p className="text-mocha-subtext1">
              Start your digital transformation journey
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-mocha-text mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-mocha-surface1 border border-mocha-surface2 rounded-lg text-mocha-text placeholder-mocha-subtext0 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-mocha-text mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-mocha-surface1 border border-mocha-surface2 rounded-lg text-mocha-text placeholder-mocha-subtext0 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-mocha-text mb-2">
                Organization Name
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-mocha-surface1 border border-mocha-surface2 rounded-lg text-mocha-text placeholder-mocha-subtext0 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-mocha-text mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-mocha-surface1 border border-mocha-surface2 rounded-lg text-mocha-text placeholder-mocha-subtext0 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="••••••••"
              />
              <p className="text-xs text-mocha-subtext0 mt-1">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-mocha-text mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-mocha-surface1 border border-mocha-surface2 rounded-lg text-mocha-text placeholder-mocha-subtext0 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-orange to-brand-teal hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-mocha-subtext1 text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-brand-orange hover:text-brand-teal transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
