'use client'

/**
 * Coaching Campaigns Page
 *
 * Allows coaches to view and manage their assessment campaigns.
 * Campaigns help organize clients into groups with specific settings.
 *
 * Story: 3-4-dashboard-pipeline (AC #6)
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  BarChart3,
  Plus,
  Trash2,
  ArrowLeft,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface Campaign {
  id: string
  name: string
  description: string | null
  status: string
  results_disclosure: 'full' | 'teaser' | 'none'
  created_at: string
  client_count?: number
}

interface TenantProfile {
  id: string
  slug: string
  display_name: string
}

export default function CoachingCampaignsPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [tenant, setTenant] = useState<TenantProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    loadData(client)
  }, [])

  async function loadData(client: SupabaseClient<Database>) {
    try {
      setLoading(true)

      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get coach's tenant profile
      const { data: tenantData, error: tenantError } = await client
        .from('tenant_profiles')
        .select('id, slug, display_name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as { data: TenantProfile | null; error: Error | null }

      if (tenantError || !tenantData) {
        setError('You do not have an active coaching profile.')
        setLoading(false)
        return
      }

      setTenant(tenantData)

      // Fetch coaching campaigns (assessment_type = 'archetype')
      const { data: campaignsData, error: campaignsError } = await client
        .from('campaigns')
        .select('id, name, description, status, results_disclosure, created_at')
        .eq('tenant_id', tenantData.id)
        .eq('assessment_type', 'archetype')
        .order('created_at', { ascending: false }) as { data: Campaign[] | null; error: Error | null }

      if (campaignsError) {
        setError(`Failed to load campaigns: ${campaignsError.message}`)
        console.error('Campaigns error:', campaignsError)
      } else {
        setCampaigns(campaignsData || [])
      }
    } catch (err) {
      setError('Error loading data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteCampaign(campaignId: string) {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)

      if (error) {
        setError(`Failed to delete campaign: ${error.message}`)
      } else {
        setCampaigns(campaigns.filter(c => c.id !== campaignId))
        setShowDeleteConfirm(false)
        setDeletingCampaignId(null)
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

  function getDisclosureLabel(disclosure: string) {
    switch (disclosure) {
      case 'full':
        return 'Full Results'
      case 'teaser':
        return 'Teaser Only'
      case 'none':
        return 'Coach Only'
      default:
        return disclosure
    }
  }

  function getDisclosureIcon(disclosure: string) {
    switch (disclosure) {
      case 'full':
        return <Eye className="w-4 h-4" />
      case 'teaser':
        return <Sparkles className="w-4 h-4" />
      case 'none':
        return <EyeOff className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
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
              Are you sure you want to delete this campaign? This action cannot be undone.
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
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Organize your clients into campaigns with specific settings
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/coaching/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-8 py-8">
        {/* Back Link */}
        <Link
          href="/dashboard/coaching"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Coaching Dashboard
        </Link>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No campaigns yet
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Campaigns help you organize clients into groups with specific results disclosure settings.
              You can also manage clients directly without campaigns.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" asChild>
                <Link href="/dashboard/coaching/clients">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Clients
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/coaching/campaigns/new">
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
                {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}
              </h2>
            </div>
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-card border border-border rounded-lg p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {campaign.name}
                    </h3>
                    {campaign.description && (
                      <p className="text-muted-foreground mt-1">
                        {campaign.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {getDisclosureIcon(campaign.results_disclosure)}
                        {getDisclosureLabel(campaign.results_disclosure)}
                      </span>
                      <span className="text-border">|</span>
                      <span suppressHydrationWarning>
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-[hsl(var(--accent-subtle))] text-primary'
                          : campaign.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        confirmDelete(campaign.id)
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete campaign"
                    >
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
