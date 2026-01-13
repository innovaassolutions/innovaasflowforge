'use client'

/**
 * Coaching Dashboard Page
 *
 * Main dashboard for coaches showing lead pipeline overview,
 * quick stats, and recent activity.
 *
 * Story: 3-4-dashboard-pipeline
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  Phone,
  Trophy,
  ArrowRight,
  FileSpreadsheet,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PipelineStats {
  registered: number
  in_progress: number
  completed: number
  contacted: number
  converted: number
  archived: number
  total: number
}

interface TenantProfile {
  id: string
  slug: string
  display_name: string
}

interface RecentClient {
  id: string
  client_name: string
  client_status: string
  created_at: string
  completed_at: string | null
}

export default function CoachingDashboardPage() {
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantProfile | null>(null)
  const [stats, setStats] = useState<PipelineStats | null>(null)
  const [recentClients, setRecentClients] = useState<RecentClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get coach's tenant profile
      const { data: tenantData, error: tenantError } = await supabase
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

      // Fetch all clients for pipeline stats
      const { data: clients, error: clientsError } = await (supabase
        .from('coaching_sessions') as any)
        .select('id, client_name, client_status, created_at, completed_at')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false })

      if (clientsError) {
        console.error('Error fetching clients:', clientsError)
        setError('Failed to load pipeline data')
        setLoading(false)
        return
      }

      // Calculate pipeline stats
      const pipelineStats: PipelineStats = {
        registered: 0,
        in_progress: 0,
        completed: 0,
        contacted: 0,
        converted: 0,
        archived: 0,
        total: clients?.length || 0,
      }

      clients?.forEach((client: RecentClient) => {
        switch (client.client_status) {
          case 'registered':
            pipelineStats.registered++
            break
          case 'in_progress':
            pipelineStats.in_progress++
            break
          case 'completed':
            pipelineStats.completed++
            break
          case 'contacted':
            pipelineStats.contacted++
            break
          case 'converted':
            pipelineStats.converted++
            break
          case 'archived':
            pipelineStats.archived++
            break
        }
      })

      setStats(pipelineStats)
      setRecentClients(clients?.slice(0, 5) || [])
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'registered':
        return <AlertCircle className="w-5 h-5" />
      case 'in_progress':
        return <Clock className="w-5 h-5" />
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'contacted':
        return <Phone className="w-5 h-5" />
      case 'converted':
        return <Trophy className="w-5 h-5" />
      case 'archived':
        return <Archive className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'registered':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'in_progress':
        return 'bg-amber-50 border-amber-200 text-amber-700'
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'contacted':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'converted':
        return 'bg-accent-subtle border-accent/30 text-accent'
      case 'archived':
        return 'bg-gray-50 border-gray-200 text-gray-500'
      default:
        return 'bg-muted border-border text-muted-foreground'
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'registered':
        return 'Not Started'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'contacted':
        return 'Contacted'
      case 'converted':
        return 'Converted'
      case 'archived':
        return 'Archived'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Link href="/dashboard" className="inline-block mt-4 text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Coaching Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {tenant?.display_name}. Here&apos;s your client pipeline.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/dashboard/coaching/clients">
          <Button>
            <Users className="w-4 h-4 mr-2" />
            View All Clients
          </Button>
        </Link>
        <Link href={`/coach/${tenant?.slug}/register`} target="_blank">
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Registration Page
          </Button>
        </Link>
      </div>

      {/* Pipeline Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Lead Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Registered */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Not Started</span>
            </div>
            <p className="text-3xl font-bold text-blue-800">
              {stats?.registered || 0}
            </p>
          </div>

          {/* In Progress */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-3xl font-bold text-amber-800">
              {stats?.in_progress || 0}
            </p>
          </div>

          {/* Completed */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-3xl font-bold text-green-800">
              {stats?.completed || 0}
            </p>
          </div>

          {/* Contacted */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Phone className="w-5 h-5" />
              <span className="text-sm font-medium">Contacted</span>
            </div>
            <p className="text-3xl font-bold text-purple-800">
              {stats?.contacted || 0}
            </p>
          </div>

          {/* Converted */}
          <div className="bg-accent-subtle border border-accent/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Converted</span>
            </div>
            <p className="text-3xl font-bold text-accent">
              {stats?.converted || 0}
            </p>
          </div>

          {/* Archived */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Archive className="w-5 h-5" />
              <span className="text-sm font-medium">Archived</span>
            </div>
            <p className="text-3xl font-bold text-gray-600">
              {stats?.archived || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Total Clients Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-4xl font-bold text-foreground mt-1">
                {stats?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Link
              href="/dashboard/coaching/clients"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Manage clients
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-4xl font-bold text-foreground mt-1">
                {stats && stats.total > 0
                  ? Math.round(((stats.completed + stats.contacted + stats.converted) / stats.total) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {(stats?.completed || 0) + (stats?.contacted || 0) + (stats?.converted || 0)} of {stats?.total || 0} assessments completed
            </p>
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      {recentClients.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Clients</h2>
            <Link
              href="/dashboard/coaching/clients"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentClients.map((client) => (
              <div
                key={client.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{client.client_name}</p>
                  <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    Added {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    client.client_status
                  )}`}
                >
                  {getStatusIcon(client.client_status)}
                  {getStatusLabel(client.client_status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats?.total === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No clients yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by adding your first client or sharing your registration link
            with potential clients.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/coaching/clients">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </Link>
            <Link href={`/coach/${tenant?.slug}/register`} target="_blank">
              <Button variant="outline">
                View Registration Page
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
