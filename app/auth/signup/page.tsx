'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import SocialAuthButtons from '@/components/social-auth-buttons'
import { Building2, Users } from 'lucide-react'

// Disable static generation for auth pages
export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'consultant' as 'consultant' | 'company',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)

  // Initialize Supabase client in browser only
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return

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
            user_type: formData.userType,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Show success message
      setSuccess(true)
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

  function setUserType(type: 'consultant' | 'company') {
    setFormData({
      ...formData,
      userType: type,
    })
  }

  return (
    <div className="min-h-screen bg-ctp-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-ctp-surface0 rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ctp-text mb-2">
              Create Account
            </h1>
            <p className="text-ctp-subtext1">
              Join FlowForge - Multi-Disciplinary Consulting Platform
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-ctp-red/10 border border-ctp-red rounded-lg p-4">
              <p className="text-ctp-red text-sm">{error}</p>
            </div>
          )}

          <SocialAuthButtons />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ctp-overlay0"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-ctp-surface0 text-ctp-subtext1">
                Or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-ctp-text mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('consultant')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.userType === 'consultant'
                      ? 'border-brand-orange bg-brand-orange/20 text-ctp-text shadow-lg shadow-brand-orange/30 ring-2 ring-brand-orange/50'
                      : 'border-ctp-surface1 bg-ctp-base text-ctp-subtext0 hover:border-ctp-surface2 hover:bg-ctp-surface0'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className={`w-6 h-6 ${formData.userType === 'consultant' ? 'text-brand-orange' : ''}`} />
                    <span className="font-medium text-sm">Consultant</span>
                    <span className="text-xs text-ctp-subtext0">
                      Manage multiple clients
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('company')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.userType === 'company'
                      ? 'border-brand-teal bg-brand-teal/20 text-ctp-text shadow-lg shadow-brand-teal/30 ring-2 ring-brand-teal/50'
                      : 'border-ctp-surface1 bg-ctp-base text-ctp-subtext0 hover:border-ctp-surface2 hover:bg-ctp-surface0'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className={`w-6 h-6 ${formData.userType === 'company' ? 'text-brand-teal' : ''}`} />
                    <span className="font-medium text-sm">Company</span>
                    <span className="text-xs text-ctp-subtext0">
                      Manage my organization
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-ctp-text mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-white placeholder-ctp-overlay0 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ctp-text mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-white placeholder-ctp-overlay0 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ctp-text mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-white placeholder-ctp-overlay0 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                placeholder="••••••••"
              />
              <p className="text-xs text-ctp-subtext0 mt-1">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-ctp-text mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-white placeholder-ctp-overlay0 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ctp-peach to-ctp-teal hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ctp-subtext1 text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-ctp-peach hover:text-ctp-teal transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-ctp-surface0 rounded-lg p-8 max-w-md w-full border border-ctp-surface1 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-teal rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl font-bold text-ctp-text mb-2">
                Account Created Successfully!
              </h3>
              <p className="text-ctp-subtext1 mb-6">
                Please check your email to verify your account before signing in.
              </p>

              {/* Action Button */}
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-brand-orange to-brand-teal hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity">
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
