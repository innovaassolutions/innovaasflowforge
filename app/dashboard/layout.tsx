'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Menu } from 'lucide-react'

interface UserProfile {
  full_name: string
  email: string
  role: string
  user_type: 'consultant' | 'company' | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    checkUser(client)
  }, [])

  async function checkUser(client: SupabaseClient<Database>) {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Fetch user profile
    const { data: profile } = await client
      .from('user_profiles')
      .select('full_name, email, role, user_type')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserProfile(profile as UserProfile)
    }

    setLoading(false)
  }

  async function handleLogout() {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ctp-base flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-ctp-peach border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctp-base flex">
      {/* Mobile hamburger menu - only visible on mobile */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-ctp-text hover:bg-ctp-surface0 rounded-lg transition-colors bg-ctp-mantle border border-ctp-surface0"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <DashboardSidebar
        userProfile={userProfile}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area - offset by narrow sidebar width on desktop */}
      <div className="flex-1 lg:ml-16">
        {children}
      </div>
    </div>
  )
}
