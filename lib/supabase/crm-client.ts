import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// CRM Supabase client for analytics and lead capture
// This connects to the separate CRM database instead of the FlowForge database

let crmClient: ReturnType<typeof createSupabaseClient> | null = null

export function createCRMClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_CRM_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_CRM_SUPABASE_ANON_KEY!
    )
  }

  // Client-side: reuse singleton
  if (!crmClient) {
    crmClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_CRM_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_CRM_SUPABASE_ANON_KEY!
    )
  }
  return crmClient
}
