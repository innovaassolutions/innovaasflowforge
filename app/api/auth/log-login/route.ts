/**
 * Log Login API
 *
 * Records user login events with device/browser metadata for admin monitoring.
 * Called after successful authentication from login page or auth callback.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { UAParser } from 'ua-parser-js'

interface LogLoginRequest {
  userId?: string
  authMethod?: 'password' | 'magic_link' | 'oauth_google' | 'oauth_github'
  success?: boolean
  failureReason?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get request body
    const body: LogLoginRequest = await request.json().catch(() => ({}))

    // Use authenticated user or provided userId
    const userId = user?.id || body.userId

    if (!userId) {
      return NextResponse.json({ error: 'No user ID available' }, { status: 400 })
    }

    // Get client information from headers
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0].trim() || realIp || null

    // Parse user agent for device/browser/OS info
    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const browser = parser.getBrowser()
    const os = parser.getOS()

    // Determine device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown'
    if (device.type === 'mobile') {
      deviceType = 'mobile'
    } else if (device.type === 'tablet') {
      deviceType = 'tablet'
    } else if (!device.type) {
      // No device type usually means desktop
      deviceType = 'desktop'
    }

    // Insert login record using admin client (bypasses RLS)
    const { error } = await (supabaseAdmin.from('login_history') as any).insert({
      user_id: userId,
      ip_address: ip,
      user_agent: userAgent,
      device_type: deviceType,
      browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : null,
      os: os.name ? `${os.name} ${os.version || ''}`.trim() : null,
      auth_method: body.authMethod || 'password',
      success: body.success ?? true,
      failure_reason: body.failureReason || null,
    })

    if (error) {
      console.error('Failed to log login:', error)
      // Don't fail the request - logging should be non-blocking
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login tracking error:', error)
    // Don't fail - this is a non-critical operation
    return NextResponse.json({ success: false, error: 'Internal error' })
  }
}
