'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Disable static generation (page requires auth)
export const dynamic = 'force-dynamic'

interface Campaign {
  id: string
  name: string
  company_name: string
  facilitator_name: string
  status: string
  created_at: string
}

interface UserProfile {
  full_name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    checkUser(client)
    fetchCampaigns(client)
  }, [])

  async function checkUser(client: SupabaseClient<Database>) {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    setUser(user)

    // Fetch user profile
    const { data: profile } = await client
      .from('user_profiles')
      .select('full_name, email, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserProfile(profile)
    }
  }

  async function handleLogout() {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  async function fetchCampaigns(client?: SupabaseClient<Database>) {
    try {
      setLoading(true)

      const supabaseClient = client || supabase

      if (!supabaseClient) {
        setError('Supabase client not initialized')
        return
      }

      // Get the session token
      const { data: { session } } = await supabaseClient.auth.getSession()

      if (!session) {
        setError('Not authenticated')
        router.push('/auth/login')
        return
      }

      // Fetch campaigns with authentication
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCampaigns(data.campaigns)
      } else {
        setError(data.error || 'Failed to load campaigns')

        // If unauthorized, redirect to login
        if (response.status === 401) {
          router.push('/auth/login')
        }
      }
    } catch (err) {
      setError('Error loading campaigns')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mocha-base">
      {/* Header */}
      <header className="bg-mocha-mantle border-b border-mocha-surface0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-brand-teal bg-clip-text text-transparent">
                Flow Forge Dashboard
              </h1>
              <p className="text-mocha-subtext1 mt-1">
                AI-Assisted Business Consulting Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/campaigns/new"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Create Campaign
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-mocha-surface0 hover:bg-mocha-surface1 px-4 py-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-brand-orange to-brand-teal rounded-full flex items-center justify-center text-white font-semibold">
                    {userProfile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-mocha-text">
                      {userProfile?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-mocha-subtext1">
                      {userProfile?.role || 'member'}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-mocha-surface0 border border-mocha-surface1 rounded-lg shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b border-mocha-surface1">
                      <p className="text-sm font-medium text-mocha-text">
                        {userProfile?.full_name}
                      </p>
                      <p className="text-xs text-mocha-subtext1">
                        {userProfile?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-mocha-text hover:bg-mocha-surface1 transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-r-transparent"></div>
            <p className="text-mocha-subtext1 mt-4">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="bg-mocha-surface0 border border-red-500/20 rounded-lg p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-mocha-surface0 rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-mocha-overlay0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-mocha-text">
              No campaigns yet
            </h3>
            <p className="mt-2 text-mocha-subtext1">
              Get started by creating your first assessment campaign.
            </p>
            <Link
              href="/dashboard/campaigns/new"
              className="mt-6 inline-block bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-mocha-text mb-6">
              Your Campaigns
            </h2>
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/dashboard/campaigns/${campaign.id}`}
                className="block bg-mocha-surface0 hover:bg-mocha-surface1 border border-mocha-surface1 rounded-lg p-6 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-mocha-text">
                      {campaign.name}
                    </h3>
                    <p className="text-mocha-subtext1 mt-1">
                      {campaign.company_name}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-mocha-subtext0">
                      <span>Facilitator: {campaign.facilitator_name}</span>
                      <span>•</span>
                      <span>
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : campaign.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-mocha-overlay0/20 text-mocha-overlay0'
                      }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
