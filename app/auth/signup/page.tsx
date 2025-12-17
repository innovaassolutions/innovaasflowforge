import Link from 'next/link'
import Image from 'next/image'
import { ShieldAlert } from 'lucide-react'

// Disable static generation for auth pages
export const dynamic = 'force-dynamic'

/**
 * SIGNUP DISABLED
 *
 * Self-registration is currently disabled. New users must be created by an administrator.
 * The original signup functionality is preserved below (commented out) for future reference.
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-card rounded-xl p-8 shadow-lg border border-border
                        md:p-12">
          <div className="flex flex-col items-center gap-8
                          md:flex-row md:items-center md:gap-12">
            {/* Message Content */}
            <div className="flex-1 flex flex-col items-center text-center
                            md:items-start md:text-left">
              {/* Icon */}
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-muted-foreground" />
              </div>

              {/* Message */}
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Registration by Invitation Only
              </h1>
              <p className="text-muted-foreground mb-6">
                New accounts are created by your organization administrator.
                If you need access, please contact your administrator.
              </p>

              {/* Divider */}
              <div className="w-full border-t border-border my-6"></div>

              {/* Already have account */}
              <p className="text-muted-foreground text-sm mb-4">
                Already have an account?
              </p>
              <Link
                href="/auth/login"
                className="w-full bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors text-center block
                           md:w-auto">
                Sign In
              </Link>
            </div>

            {/* Illustration */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center">
              <Image
                src="/illustrations/welcome-greeter.png"
                alt="Welcome"
                width={280}
                height={280}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =============================================================================
 * ORIGINAL SIGNUP FUNCTIONALITY (PRESERVED FOR FUTURE REFERENCE)
 * =============================================================================
 *
 * To re-enable self-registration:
 * 1. Uncomment the code below
 * 2. Replace the current SignupPage component with SignupPageOriginal
 * 3. Remove or comment out the disabled version above
 *

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import SocialAuthButtons from '@/components/social-auth-buttons'
import { Building2, Users } from 'lucide-react'

function SignupPageOriginal() {
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

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
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

  // ... rest of original component JSX
}

*/
