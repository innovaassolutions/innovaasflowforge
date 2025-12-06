'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { Building2, BarChart3, Users, Plus, Trash2 } from 'lucide-react'
import { apiUrl } from '@/lib/api-url'

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

export default function DashboardPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [companiesCount, setCompaniesCount] = useState(0)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    checkUser(client)
    fetchCampaigns(client)
    fetchCompaniesCount(client)
  }, [])

  async function checkUser(client: SupabaseClient<Database>) {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }
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
      const response = await fetch(apiUrl('api/campaigns'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        if (data.campaigns) {
          setCampaigns(data.campaigns)
        } else if (data.error) {
          setError(data.error)
        }
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

  async function fetchCompaniesCount(client?: SupabaseClient<Database>) {
    try {
      const supabaseClient = client || supabase

      if (!supabaseClient) return

      const { data: { session } } = await supabaseClient.auth.getSession()

      if (!session) return

      const response = await fetch(apiUrl('api/company-profiles'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.companies) {
        setCompaniesCount(data.companies.length || 0)
      }
    } catch (err) {
      console.error('Error fetching companies count:', err)
    }
  }

  async function handleDeleteCampaign(campaignId: string) {
    if (!supabase) return

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Not authenticated')
        return
      }

      const response = await fetch(apiUrl(`api/campaigns/${campaignId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Remove campaign from list
        setCampaigns(campaigns.filter(c => c.id !== campaignId))
        setShowDeleteConfirm(false)
        setDeletingCampaignId(null)
      } else {
        setError(data.error || 'Failed to delete campaign')
      }
    } catch (err) {
      setError('Error deleting campaign')
      console.error(err)
    }
  }

  function confirmDelete(campaignId: string) {
    setDeletingCampaignId(campaignId)
    setShowDeleteConfirm(true)
  }

  return (
    <div className="min-h-screen bg-mocha-base">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingCampaignId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-mocha-surface0 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-mocha-text mb-4">
              Delete Campaign?
            </h3>
            <p className="text-mocha-subtext1 mb-6">
              Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated stakeholder sessions and data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingCampaignId(null)
                }}
                className="px-4 py-2 bg-mocha-surface1 hover:bg-mocha-surface2 text-mocha-text rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCampaign(deletingCampaignId)}
                className="px-4 py-2 bg-mocha-red hover:bg-mocha-red/80 text-white rounded-lg transition-colors"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-mocha-mantle border-b border-mocha-surface0 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-mocha-text">Dashboard</h1>
            <p className="text-mocha-subtext1 mt-1 text-sm">
              Manage your campaigns and companies
            </p>
          </div>
          <Link
            href="/dashboard/campaigns/new"
            className="bg-gradient-to-r from-mocha-peach to-mocha-teal text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/companies"
            className="relative bg-mocha-surface0 border-2 border-mocha-surface1 rounded-xl p-6 hover:border-brand-orange hover:shadow-2xl hover:shadow-brand-orange/40 transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-orange-dark rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-brand-orange/50">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-mocha-subtext0 font-medium">Total</p>
                <h3 className="text-2xl font-bold text-mocha-text group-hover:text-brand-orange transition-colors">{companiesCount} Companies</h3>
              </div>
            </div>
          </Link>

          <div className="relative bg-mocha-surface0 border-2 border-mocha-surface1 rounded-xl p-6 hover:border-brand-teal hover:shadow-2xl hover:shadow-brand-teal/40 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-teal to-brand-teal-dark rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-brand-teal/50">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-mocha-subtext0 font-medium">Total</p>
                <h3 className="text-2xl font-bold text-mocha-text group-hover:text-brand-teal transition-colors">{campaigns.length} Campaigns</h3>
              </div>
            </div>
          </div>

          <div className="relative bg-mocha-surface0 border-2 border-mocha-surface1 rounded-xl p-6 hover:border-mocha-green hover:shadow-2xl hover:shadow-mocha-green/40 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-mocha-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-mocha-green to-mocha-green/80 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-mocha-green/50">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-mocha-subtext0 font-medium">Active</p>
                <h3 className="text-2xl font-bold text-mocha-text group-hover:text-mocha-green transition-colors">
                  {campaigns.filter(c => c.status === 'active').length} Running
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-r-transparent"></div>
            <p className="text-mocha-subtext1 mt-4">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="bg-mocha-surface0 border border-mocha-red/20 rounded-lg p-8 text-center">
            <p className="text-mocha-red">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-mocha-surface0 rounded-lg p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-mocha-overlay0" />
            <h3 className="mt-4 text-lg font-semibold text-mocha-text">
              No campaigns yet
            </h3>
            <p className="mt-2 text-mocha-subtext1">
              Get started by creating your first assessment campaign.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/companies"
                className="inline-flex items-center gap-2 px-6 py-3 bg-mocha-surface0 border border-mocha-surface1 rounded-lg text-mocha-text hover:bg-mocha-surface1 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Manage Companies
              </Link>
              <Link
                href="/dashboard/campaigns/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-mocha-peach to-mocha-teal text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Create Your First Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-mocha-text">
                Your Campaigns
              </h2>
            </div>
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-6 transition-colors">
                <div className="flex justify-between items-start">
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="flex-1 hover:opacity-80 transition-opacity">
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
                  </Link>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-mocha-green/20 text-mocha-green'
                          : campaign.status === 'completed'
                          ? 'bg-mocha-blue/20 text-mocha-blue'
                          : 'bg-mocha-overlay0/20 text-mocha-overlay0'
                      }`}>
                      {campaign.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        confirmDelete(campaign.id)
                      }}
                      className="p-2 text-mocha-subtext0 hover:text-mocha-red hover:bg-mocha-red/10 rounded-lg transition-colors"
                      title="Delete campaign">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
