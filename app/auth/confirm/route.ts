import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /auth/confirm?token_hash=...&type=signup
 *
 * Handles email confirmation links sent via Resend.
 * Verifies the OTP token and redirects to the dashboard.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as 'signup' | 'email' | null
  const origin = requestUrl.origin

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_link`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })

  if (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
  }

  // Redirect to dashboard — the user is now confirmed and logged in
  return NextResponse.redirect(`${origin}/dashboard`)
}
