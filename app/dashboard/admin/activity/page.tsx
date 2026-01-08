'use client'

/**
 * Admin Activity Page
 *
 * Displays login history with filtering and pagination.
 * Admin-only access.
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react'

interface LoginEvent {
  id: string
  login_at: string
  ip_address: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  auth_method: string | null
  success: boolean
  failure_reason: string | null
  user: {
    email: string | null
    name: string | null
  }
}

interface ActivityData {
  logins: LoginEvent[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  summary: {
    total24h: number
    successful24h: number
    failed24h: number
    uniqueUsers24h: number
  }
}

export default function AdminActivityPage() {
  const router = useRouter()
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deviceFilter, setDeviceFilter] = useState<string>('')
  const [successFilter, setSuccessFilter] = useState<string>('')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadActivity()
    }
  }, [isAdmin, page, deviceFilter, successFilter])

  async function checkAdminAccess() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

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
  }

  async function loadActivity() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
      })

      if (search) params.append('search', search)
      if (deviceFilter) params.append('device', deviceFilter)
      if (successFilter) params.append('success', successFilter)

      const response = await fetch(`/flowforge/api/admin/activity?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch activity')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching activity:', err)
      setError('Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadActivity()
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getDeviceIcon(deviceType: string | null) {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      default:
        return <HelpCircle className="w-4 h-4" />
    }
  }

  function getAuthMethodLabel(method: string | null) {
    switch (method) {
      case 'password':
        return 'Password'
      case 'magic_link':
        return 'Magic Link'
      case 'oauth_google':
        return 'Google'
      case 'oauth_github':
        return 'GitHub'
      default:
        return method || 'Unknown'
    }
  }

  if (loading && !data) {
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/admin/overview"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Activity className="w-7 h-7 text-purple-600" />
          Login Activity
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor user login events and security activity
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/50 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Logins (24h)</p>
            <p className="text-2xl font-bold text-foreground">{data.summary.total24h}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-2xl font-bold text-green-600">{data.summary.successful24h}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-red-600">{data.summary.failed24h}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Unique Users</p>
            <p className="text-2xl font-bold text-foreground">{data.summary.uniqueUsers24h}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg
                           text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </form>

          {/* Device Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value)
                setPage(1)
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          {/* Success Filter */}
          <select
            value={successFilter}
            onChange={(e) => {
              setSuccessFilter(e.target.value)
              setPage(1)
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="true">Successful</option>
            <option value="false">Failed</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => loadActivity()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Time</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Device</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Method</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">IP</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.logins.map((login) => (
                <tr key={login.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {login.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {login.user?.email || 'No email'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{formatDate(login.login_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {getDeviceIcon(login.device_type)}
                      </span>
                      <div>
                        <p className="text-sm text-foreground capitalize">
                          {login.device_type || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {login.browser || 'Unknown browser'} / {login.os || 'Unknown OS'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                      {getAuthMethodLabel(login.auth_method)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground font-mono">
                      {login.ip_address || 'Unknown'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {login.success ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Success</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">Failed</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.logins || data.logins.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No login events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {((data.pagination.page - 1) * data.pagination.pageSize) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.totalCount)} of{' '}
              {data.pagination.totalCount} logins
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.totalPages}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
