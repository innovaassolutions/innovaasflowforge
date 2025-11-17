'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Github } from 'lucide-react'

export default function SocialAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const handleSocialLogin = async (provider: 'google' | 'github' | 'azure') => {
    setLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        alert(`Authentication failed: ${error.message}`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleSocialLogin('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-mocha-surface0 text-mocha-text border border-mocha-overlay0 rounded-lg
                   hover:bg-mocha-surface1 hover:border-mocha-overlay1 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed">
        {loading === 'google' ? (
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-orange border-r-transparent" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span className="font-medium">Continue with Google</span>
      </button>

      <button
        onClick={() => handleSocialLogin('azure')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-mocha-surface0 text-mocha-text border border-mocha-overlay0 rounded-lg
                   hover:bg-mocha-surface1 hover:border-mocha-overlay1 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed">
        {loading === 'azure' ? (
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-orange border-r-transparent" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623"
            />
          </svg>
        )}
        <span className="font-medium">Continue with Microsoft</span>
      </button>

      <button
        onClick={() => handleSocialLogin('github')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-mocha-surface0 text-mocha-text border border-mocha-overlay0 rounded-lg
                   hover:bg-mocha-surface1 hover:border-mocha-overlay1 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed">
        {loading === 'github' ? (
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-orange border-r-transparent" />
        ) : (
          <Github className="w-5 h-5" />
        )}
        <span className="font-medium">Continue with GitHub</span>
      </button>
    </div>
  )
}
