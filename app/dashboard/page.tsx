'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { Building2, BarChart3, Users, Plus, Trash2 } from 'lucide-react'
import { apiUrl } from '@/lib/api-url'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-background">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingCampaignId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-8 max-w-md w-full border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Delete Campaign?
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated stakeholder sessions and data.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingCampaignId(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteCampaign(deletingCampaignId)}
              >
                Delete Campaign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your campaigns and companies
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/companies"
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Building2 className="w-10 h-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Stakeholders</p>
                <h3 className="text-4xl font-bold text-foreground">{companiesCount}</h3>
              </div>
            </div>
          </Link>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-10 h-10 text-success" />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Completed</p>
                <h3 className="text-4xl font-bold text-success">0</h3>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-brand-teal" />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">In Progress</p>
                <h3 className="text-4xl font-bold text-brand-teal">{campaigns.filter(c => c.status === 'active').length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No campaigns yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              Get started by creating your first assessment campaign.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" asChild>
                <Link href="/dashboard/companies">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Companies
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/campaigns/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Your Campaigns
              </h2>
            </div>
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-card border border-border rounded-lg p-6 transition-colors">
                <div className="flex justify-between items-start">
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="flex-1 hover:opacity-80 transition-opacity">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {campaign.name}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {campaign.company_name}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>Facilitator: {campaign.facilitator_name}</span>
                        <span>•</span>
                        <span suppressHydrationWarning>
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-[hsl(var(--accent-subtle))] text-primary'
                          : campaign.status === 'completed'
                          ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success))]'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                      {campaign.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        confirmDelete(campaign.id)
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
