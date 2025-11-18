'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { Building2, BarChart3, Users, Plus } from 'lucide-react'

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
  user_type: 'consultant' | 'company' | null
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
      .select('full_name, email, role, user_type')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserProfile(profile as UserProfile)
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
    <div className="min-h-screen bg-ctp-base">
      {/* Header */}
      <header className="bg-ctp-mantle border-b border-ctp-surface0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-ctp-peach to-ctp-teal bg-clip-text text-transparent">
                FlowForge Dashboard
              </h1>
              <p className="text-ctp-subtext1 mt-1">
                Multi-Disciplinary Consulting Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/companies"
                className="px-4 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded-lg text-ctp-text hover:bg-ctp-surface1 transition-colors flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Companies
              </Link>

              <Link
                href="/dashboard/campaigns/new"
                className="bg-gradient-to-r from-ctp-peach to-ctp-teal text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Campaign
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-ctp-surface0 hover:bg-ctp-surface1 px-4 py-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-full flex items-center justify-center text-white font-semibold">
                    {userProfile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-ctp-text">
                      {userProfile?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-ctp-subtext1">
                      {userProfile?.user_type || userProfile?.role || 'member'}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-ctp-surface0 border border-ctp-surface1 rounded-lg shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b border-ctp-surface1">
                      <p className="text-sm font-medium text-ctp-text">
                        {userProfile?.full_name}
                      </p>
                      <p className="text-xs text-ctp-subtext1">
                        {userProfile?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-ctp-text hover:bg-ctp-surface1 transition-colors">
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/companies"
            className="bg-ctp-surface0 border border-ctp-surface1 rounded-lg p-6 hover:border-ctp-peach transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ctp-peach/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-ctp-peach" />
              </div>
              <div>
                <p className="text-sm text-ctp-subtext0">Manage</p>
                <h3 className="text-xl font-semibold text-ctp-text">Companies</h3>
              </div>
            </div>
          </Link>

          <div className="bg-ctp-surface0 border border-ctp-surface1 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ctp-teal/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-ctp-teal" />
              </div>
              <div>
                <p className="text-sm text-ctp-subtext0">Total</p>
                <h3 className="text-xl font-semibold text-ctp-text">{campaigns.length} Campaigns</h3>
              </div>
            </div>
          </div>

          <div className="bg-ctp-surface0 border border-ctp-surface1 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ctp-green/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-ctp-green" />
              </div>
              <div>
                <p className="text-sm text-ctp-subtext0">Active</p>
                <h3 className="text-xl font-semibold text-ctp-text">
                  {campaigns.filter(c => c.status === 'active').length} Running
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-ctp-peach border-r-transparent"></div>
            <p className="text-ctp-subtext1 mt-4">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="bg-ctp-surface0 border border-ctp-red/20 rounded-lg p-8 text-center">
            <p className="text-ctp-red">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-ctp-surface0 rounded-lg p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-ctp-overlay0" />
            <h3 className="mt-4 text-lg font-semibold text-ctp-text">
              No campaigns yet
            </h3>
            <p className="mt-2 text-ctp-subtext1">
              Get started by creating your first assessment campaign.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/companies"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ctp-surface0 border border-ctp-surface1 rounded-lg text-ctp-text hover:bg-ctp-surface1 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Manage Companies
              </Link>
              <Link
                href="/dashboard/campaigns/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-ctp-peach to-ctp-teal text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Create Your First Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-ctp-text">
                Your Campaigns
              </h2>
            </div>
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/dashboard/campaigns/${campaign.id}`}
                className="block bg-ctp-surface0 hover:bg-ctp-surface1 border border-ctp-surface1 rounded-lg p-6 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-ctp-text">
                      {campaign.name}
                    </h3>
                    <p className="text-ctp-subtext1 mt-1">
                      {campaign.company_name}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-ctp-subtext0">
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
                          ? 'bg-ctp-green/20 text-ctp-green'
                          : campaign.status === 'completed'
                          ? 'bg-ctp-blue/20 text-ctp-blue'
                          : 'bg-ctp-overlay0/20 text-ctp-overlay0'
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
