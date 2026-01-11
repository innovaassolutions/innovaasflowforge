'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRequired, setIsRequired] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if password change is required
    const passwordChangeRequired = user.user_metadata?.password_change_required === true
    setIsRequired(passwordChangeRequired)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
        data: {
          password_change_required: false,
        },
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError('Failed to update password')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Password Updated</h1>
          <p className="text-muted-foreground mb-4">
            Your password has been changed successfully. Redirecting to dashboard...
          </p>
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/icon-orb.svg"
            alt="FlowForge"
            width={60}
            height={60}
            className="mx-auto mb-4"
            unoptimized
          />
          <h1 className="text-2xl font-bold text-foreground">
            {isRequired ? 'Change Your Password' : 'Update Password'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRequired
              ? 'You must change your temporary password before continuing.'
              : 'Enter your new password below.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground py-3 rounded-lg
                         font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Update Password
                </>
              )}
            </button>
          </form>

          {!isRequired && (
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-3 text-muted-foreground hover:text-foreground text-sm py-2 transition-colors">
              Cancel and return to dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
