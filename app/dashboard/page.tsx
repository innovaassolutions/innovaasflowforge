'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { Building2, BarChart3, Users, Plus, Trash2, UserCircle, CheckCircle, Clock, Mail, GraduationCap, Key, FileText } from 'lucide-react'
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

interface CoachingSession {
  id: string
  client_name: string
  client_email: string
  client_status: 'registered' | 'started' | 'completed' | 'contacted' | 'converted' | 'archived' | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  access_token: string
}

interface UserProfile {
  user_type: 'consultant' | 'company' | 'admin' | 'coach' | null
}

interface SchoolInfo {
  id: string
  name: string
  code: string
}

interface AccessCodeStats {
  total: number
  active: number
  redeemed: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [companiesCount, setCompaniesCount] = useState(0)
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [accessCodeStats, setAccessCodeStats] = useState<AccessCodeStats>({ total: 0, active: 0, redeemed: 0 })

  const isCoach = userProfile?.user_type === 'coach'
  const isSchool = userProfile?.user_type === 'company'

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    initializeDashboard(client)
  }, [])

  async function initializeDashboard(client: SupabaseClient<Database>) {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Fetch user profile to determine user type
    const { data: profile } = await client
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile) {
      const userProfile = profile as UserProfile
      setUserProfile(userProfile)

      // If coach, fetch tenant info and coaching sessions
      if (userProfile.user_type === 'coach') {
        const { data: tenant, error: tenantError } = await (client
          .from('tenant_profiles') as any)
          .select('id, slug')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single() as { data: { id: string; slug: string } | null; error: any }

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError)
          setError(`Failed to load tenant profile: ${tenantError.message || tenantError.code}`)
        } else if (tenant) {
          setTenantId(tenant.id)
          setTenantSlug(tenant.slug)
          await fetchCoachingSessions(client, tenant.id)
        } else {
          setError('No tenant profile found for this coach')
        }
      } else if (userProfile.user_type === 'company') {
        // School user - fetch school info and access code stats
        await fetchSchoolInfo(client, user.id)
      } else {
        // Consultant/Admin - fetch campaigns
        await fetchCampaigns(client)
        await fetchCompaniesCount(client)
      }
    }

    setLoading(false)
  }

  async function fetchCoachingSessions(client: SupabaseClient<Database>, tenantIdParam: string) {
    try {
      const { data: sessions, error: fetchError } = await (client
        .from('coaching_sessions') as any)
        .select('id, client_name, client_email, client_status, created_at, started_at, completed_at, access_token')
        .eq('tenant_id', tenantIdParam)
        .order('created_at', { ascending: false }) as { data: CoachingSession[] | null; error: any }

      if (fetchError) {
        console.error('Error fetching coaching sessions:', fetchError)
        setError(`Failed to load coaching sessions: ${fetchError.message || fetchError.code || 'Unknown error'}`)
        return
      }

      setCoachingSessions(sessions || [])
    } catch (err) {
      console.error('Error fetching coaching sessions:', err)
      setError('Failed to load coaching sessions')
    }
  }

  async function fetchSchoolInfo(client: SupabaseClient<Database>, userId: string) {
    try {
      const { data: { session } } = await client.auth.getSession()
      if (!session) return

      // Fetch school info via API
      const response = await fetch(apiUrl('api/education/schools'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.schools?.length > 0) {
        // For school users, they typically have access to one school
        const school = data.schools[0]
        setSchoolInfo({
          id: school.id,
          name: school.name,
          code: school.code
        })

        // Fetch access code stats for this school
        await fetchAccessCodeStats(client, school.id)
      }
    } catch (err) {
      console.error('Error fetching school info:', err)
    }
  }

  async function fetchAccessCodeStats(client: SupabaseClient<Database>, schoolId: string) {
    try {
      const { data: { session } } = await client.auth.getSession()
      if (!session) return

      // Fetch access codes for this school
      const response = await fetch(apiUrl(`api/education/access-codes?school_id=${schoolId}`), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.codes) {
        const codes = data.codes
        setAccessCodeStats({
          total: codes.length,
          active: codes.filter((c: any) => c.status === 'active').length,
          redeemed: codes.filter((c: any) => c.status === 'redeemed').length
        })
      }
    } catch (err) {
      console.error('Error fetching access code stats:', err)
    }
  }

  async function fetchCampaigns(client?: SupabaseClient<Database>) {
    try {
      const supabaseClient = client || supabase

      if (!supabaseClient) {
        setError('Supabase client not initialized')
        return
      }

      const { data: { session } } = await supabaseClient.auth.getSession()

      if (!session) {
        setError('Not authenticated')
        router.push('/auth/login')
        return
      }

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

        if (response.status === 401) {
          router.push('/auth/login')
        }
      }
    } catch (err) {
      setError('Error loading campaigns')
      console.error(err)
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

  // Calculate coach stats
  const clientsCount = coachingSessions.length
  const completedCount = coachingSessions.filter(s =>
    s.client_status === 'completed'
  ).length
  const inProgressCount = coachingSessions.filter(s =>
    s.client_status === 'started'
  ).length

  // Render Coach Dashboard
  if (isCoach) {
    return (
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="bg-card border-b border-border px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your coaching clients and sessions
              </p>
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/dashboard/coaching/clients">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/dashboard/coaching/clients"
              className="bg-card border border-border rounded-xl p-6 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <UserCircle className="w-10 h-10 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Total Clients</p>
                  <h3 className="text-4xl font-bold text-foreground">{clientsCount}</h3>
                </div>
              </div>
            </Link>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-10 h-10 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Completed</p>
                  <h3 className="text-4xl font-bold text-success">{completedCount}</h3>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <Clock className="w-10 h-10 text-brand-teal" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">In Progress</p>
                  <h3 className="text-4xl font-bold text-brand-teal">{inProgressCount}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Clients List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent"></div>
              <p className="text-muted-foreground mt-4">Loading clients...</p>
            </div>
          ) : error ? (
            <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : coachingSessions.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No clients yet
              </h3>
              <p className="mt-2 text-muted-foreground">
                Get started by adding your first coaching client.
              </p>
              <div className="mt-6">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/dashboard/coaching/clients">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Client
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Clients
                </h2>
                <Link href="/dashboard/coaching/clients" className="text-sm text-emerald-600 hover:text-emerald-700">
                  View all clients
                </Link>
              </div>
              {coachingSessions.slice(0, 5).map((session) => {
                // Determine effective status from both legacy and new status fields
                const isCompleted = session.client_status === 'completed'
                const isInProgress = session.client_status === 'started'
                const displayStatus = isCompleted ? 'Completed' : isInProgress ? 'In Progress' : session.client_status || 'Pending'

                return (
                  <div
                    key={session.id}
                    className="bg-card border border-border rounded-lg p-6 transition-colors hover:border-emerald-500/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {session.client_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{session.client_email}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span suppressHydrationWarning>
                            Added {new Date(session.created_at).toLocaleDateString()}
                          </span>
                          {session.completed_at && (
                            <>
                              <span>•</span>
                              <span suppressHydrationWarning>
                                Completed {new Date(session.completed_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                          {displayStatus}
                        </span>
                        {tenantSlug && session.access_token && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          >
                            <Link href={`/coach/${tenantSlug}/session/${session.access_token}`} target="_blank">
                              View Session
                            </Link>
                          </Button>
                        )}
                        {session.access_token && isCompleted && (
                          <Button
                            size="sm"
                            asChild
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Link href={`/reports/coaching/${session.access_token}`} target="_blank">
                              <FileText className="w-4 h-4 mr-1.5" />
                              View Report
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    )
  }

  // Render School Dashboard
  if (isSchool) {
    return (
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="bg-card border-b border-border px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {schoolInfo?.name || 'Your school dashboard'}
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/dashboard/education/access-codes">
                <Key className="w-4 h-4 mr-2" />
                Manage Access Codes
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/dashboard/education/schools"
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <GraduationCap className="w-10 h-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">My School</p>
                  <h3 className="text-lg font-bold text-foreground truncate">
                    {schoolInfo?.name || 'Loading...'}
                  </h3>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/education/access-codes"
              className="bg-card border border-border rounded-xl p-6 hover:border-success/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Key className="w-10 h-10 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Active Codes</p>
                  <h3 className="text-4xl font-bold text-success">{accessCodeStats.active}</h3>
                </div>
              </div>
            </Link>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-10 h-10 text-brand-teal" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Completed Assessments</p>
                  <h3 className="text-4xl font-bold text-brand-teal">{accessCodeStats.redeemed}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              <p className="text-muted-foreground mt-4">Loading...</p>
            </div>
          ) : error ? (
            <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/education/schools"
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-medium text-foreground">View School Details</h3>
                    <p className="text-sm text-muted-foreground">See school information and settings</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/education/access-codes"
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Key className="w-8 h-8 text-success" />
                  <div>
                    <h3 className="font-medium text-foreground">Manage Access Codes</h3>
                    <p className="text-sm text-muted-foreground">Generate and track student codes</p>
                  </div>
                </Link>
              </div>
              {schoolInfo?.code && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">School Code</p>
                  <p className="text-lg font-mono font-semibold text-foreground">{schoolInfo.code}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    )
  }

  // Render Consultant/Admin Dashboard (original)
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
