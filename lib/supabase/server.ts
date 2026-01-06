import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Server-side Supabase client with user auth context (for RLS)
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client for privileged operations (bypasses RLS)
// NOTE: This is a function to avoid evaluating env vars during build time
let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!adminClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }

    console.log('🔧 Initializing Supabase Admin Client')
    console.log('📍 URL:', supabaseUrl)
    console.log('🔑 Service Role Key:', serviceRoleKey.substring(0, 20) + '...')

    adminClient = createSupabaseClient<Database>(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return adminClient
}

// Backward compatibility export
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseClient<Database>>, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop]
  }
})

// ============================================================================
// TENANT PROFILE QUERIES
// ============================================================================

export interface TenantProfile {
  id: string
  user_id: string
  slug: string
  display_name: string
  tenant_type: 'coach' | 'consultant' | 'school'
  brand_config: {
    logo?: { url: string; alt: string; width?: number }
    colors: {
      primary: string
      primaryHover: string
      secondary: string
      background: string
      backgroundSubtle: string
      text: string
      textMuted: string
      border: string
    }
    fonts: {
      heading: string
      body: string
    }
    tagline?: string
    welcomeMessage?: string
    completionMessage?: string
    showPoweredBy: boolean
  }
  email_config: {
    replyTo?: string
    senderName?: string
    emailFooter?: string
  }
  enabled_assessments: string[]
  subscription_tier: 'starter' | 'professional' | 'enterprise'
  is_active: boolean
  custom_domain?: string
  created_at: string
  updated_at: string
}

/**
 * Get a tenant profile by its URL slug
 * Used for loading branding on public pages like /coach/[slug]/
 */
export async function getTenantBySlug(slug: string): Promise<TenantProfile | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    console.error('Error fetching tenant by slug:', error?.message)
    return null
  }

  return data as unknown as TenantProfile
}

/**
 * Get a tenant profile by its custom domain
 * Used in middleware for custom domain routing
 */
export async function getTenantByDomain(domain: string): Promise<TenantProfile | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    // This is expected for non-custom-domain requests
    return null
  }

  return data as unknown as TenantProfile
}

/**
 * Get a tenant profile by its ID
 * Used for internal operations where ID is known
 */
export async function getTenantById(id: string): Promise<TenantProfile | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching tenant by ID:', error?.message)
    return null
  }

  return data as unknown as TenantProfile
}

/**
 * Get the tenant profile for the current authenticated user
 * Used in dashboard to show coach's own tenant
 */
export async function getTenantForUser(userId: string): Promise<TenantProfile | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // User may not have a tenant profile (e.g., regular consultant)
    return null
  }

  return data as unknown as TenantProfile
}

/**
 * Get the tenant profile for a session by its access token
 * Looks up: session → campaign → tenant_id → tenant_profile
 * Used for applying branding to session pages
 */
export async function getTenantBySessionToken(accessToken: string): Promise<TenantProfile | null> {
  const supabase = getSupabaseAdmin()

  // First, get the campaign assignment by access token
  const { data: assignment, error: assignmentError } = (await supabase
    .from('campaign_assignments')
    .select('campaign_id')
    .eq('access_token', accessToken)
    .single()) as { data: { campaign_id: string } | null, error: any }

  if (assignmentError || !assignment) {
    console.error('Error fetching assignment by token:', assignmentError?.message)
    return null
  }

  // Get the campaign with tenant_id
  const { data: campaign, error: campaignError } = (await supabase
    .from('campaigns')
    .select('tenant_id')
    .eq('id', assignment.campaign_id)
    .single()) as { data: { tenant_id: string | null } | null, error: any }

  if (campaignError || !campaign || !campaign.tenant_id) {
    // Campaign may not have a tenant (legacy campaigns)
    return null
  }

  // Fetch the tenant profile
  return getTenantById(campaign.tenant_id)
}
