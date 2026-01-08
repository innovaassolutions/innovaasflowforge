'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Building2,
  Activity,
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  Mic,
  GraduationCap,
  BarChart3,
  Loader2,
  ArrowRight,
} from 'lucide-react'

interface Stats {
  users: {
    total: number
    active30d: number
  }
  tenants: {
    coaches: number
    consultants: number
    schools: number
    active: number
  }
  sessions: {
    total: number
    completed: number
  }
  campaigns: {
    total: number
    completed: number
  }
  usage: {
    totalTokens: number
    totalCostCents: number
    totalCostDollars: string
  }
  recentLogins24h: number
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAndLoadStats()
  }, [])

  async function checkAdminAndLoadStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is platform admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single() as { data: { user_type: string | null } | null }

    if (!profile || profile.user_type !== 'admin') {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setIsAdmin(true)

    // Fetch stats
    try {
      const response = await fetch('/flowforge/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6">
          <h1 className="text-xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this page.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const completionRate = stats?.sessions.total
    ? Math.round((stats.sessions.completed / stats.sessions.total) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-purple-600" />
          Platform Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor platform usage, activity, and billing metrics
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/50 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/dashboard/admin/users"
          className="bg-card border border-border rounded-lg p-4 hover:border-purple-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-foreground">Users</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
        <Link
          href="/dashboard/admin/tenants"
          className="bg-card border border-border rounded-lg p-4 hover:border-purple-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-foreground">Tenants</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
        <Link
          href="/dashboard/admin/activity"
          className="bg-card border border-border rounded-lg p-4 hover:border-purple-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-foreground">Activity</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
        <Link
          href="/dashboard/admin/billing"
          className="bg-card border border-border rounded-lg p-4 hover:border-purple-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-foreground">Billing</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{stats?.users.total || 0}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {stats?.users.active30d || 0} active in last 30 days
          </p>
        </div>

        {/* Recent Logins */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Logins (24h)</p>
              <p className="text-2xl font-bold text-foreground">{stats?.recentLogins24h || 0}</p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/activity"
            className="text-xs text-primary hover:underline mt-3 inline-block"
          >
            View login history
          </Link>
        </div>

        {/* Sessions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold text-foreground">{stats?.sessions.total || 0}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {stats?.sessions.completed || 0} completed ({completionRate}%)
          </p>
        </div>

        {/* Platform Cost */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform Cost</p>
              <p className="text-2xl font-bold text-foreground">${stats?.usage.totalCostDollars || '0.00'}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {(stats?.usage.totalTokens || 0).toLocaleString()} tokens used
          </p>
        </div>
      </div>

      {/* Tenants Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tenants by Type</h2>
            <p className="text-sm text-muted-foreground">
              {stats?.tenants.active || 0} active tenants
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coaches */}
          <Link
            href="/dashboard/admin/tenants?type=coach"
            className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 hover:border-emerald-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">{stats?.tenants.coaches || 0}</p>
                <p className="text-sm text-emerald-600">Coaches</p>
              </div>
            </div>
          </Link>

          {/* Consultants */}
          <Link
            href="/dashboard/admin/tenants?type=consultant"
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats?.tenants.consultants || 0}</p>
                <p className="text-sm text-blue-600">Consultants</p>
              </div>
            </div>
          </Link>

          {/* Schools */}
          <Link
            href="/dashboard/admin/tenants?type=school"
            className="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:border-teal-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-teal-600" />
              <div>
                <p className="text-2xl font-bold text-teal-700">{stats?.tenants.schools || 0}</p>
                <p className="text-sm text-teal-600">Schools</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
