'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Menu } from 'lucide-react'
import Image from 'next/image'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center px-4 fixed top-0 left-0 right-0 z-40">
        {/* Mobile hamburger menu */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors mr-3"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* App Logo - positioned on far left */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg shrink-0">
            FF
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-foreground">Innovaas FlowForge</h1>
            <p className="text-xs text-muted-foreground">Assessment Platform</p>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <DashboardSidebar
          userProfile={userProfile}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area - offset by narrow sidebar width on desktop */}
        <div className="flex-1 lg:ml-16 flex flex-col min-h-[calc(100vh-4rem)]">
          <div className="flex-1">
            {children}
          </div>

          {/* Footer */}
          <footer className="border-t border-border py-6 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-3">
                <p className="text-sm text-muted-foreground">
                  FlowForge version 1.0.0 · by
                </p>
                <img
                  src="/flowforge/designguide/innovaas_orange_and_white_transparent_bkgrnd_2559x594.png"
                  alt="Innovaas"
                  className="h-7 w-auto"
                />
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
