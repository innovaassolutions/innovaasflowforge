'use client'

/**
 * Tenant Usage History Page
 *
 * Shows historical usage data with daily chart and event list.
 * Includes date filtering and session breakdown.
 *
 * Story: billing-5-2-tenant-usage-history-view
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
  Filter,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DailyUsage {
  date: string
  tokens: number
}

interface UsageEvent {
  id: string
  date: string
  eventType: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  modelUsed: string | null
  sessionId: string | null
}

interface UsageHistoryData {
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalTokens: number
    avgDailyTokens: number
    peakDay: string
    peakTokens: number
    totalEvents: number
  }
  dailyUsage: DailyUsage[]
  recentEvents: UsageEvent[]
}

/**
 * Format large numbers for display
 */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toLocaleString()
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format event type for display
 */
function formatEventType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function UsageHistoryPage() {
  const router = useRouter()
  const [data, setData] = useState<UsageHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Date filter state
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  async function checkAuthAndLoad() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user has a tenant profile (coach/consultant)
    const { data: tenant } = await (supabase
      .from('tenant_profiles') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!tenant) {
      setError('No tenant profile found. This page is for tenant users only.')
      setLoading(false)
      return
    }

    setIsAuthorized(true)
    await fetchHistory()
  }

  async function fetchHistory() {
    try {
      const params = new URLSearchParams()
      params.set('startDate', startDate)
      params.set('endDate', endDate)

      const response = await fetch(`/api/tenant/usage/history?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch usage history')
      }

      const historyData = await response.json()
      setData(historyData)
      setError(null)
    } catch (err) {
      console.error('Error fetching usage history:', err)
      setError('Unable to load usage history')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchHistory()
  }

  async function handleDateFilter() {
    setLoading(true)
    await fetchHistory()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not authorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">{error || 'Access denied'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Zap className="w-7 h-7 text-purple-600" />
                Usage History
              </h1>
              <p className="text-muted-foreground mt-1">
                View your token consumption over time
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card border border-border rounded-md hover:bg-muted transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/50 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Date Filter */}
          <div className="mb-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Date Range</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <button
                onClick={handleDateFilter}
                className="px-4 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {data?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Tokens</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(data.summary.totalTokens)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Daily</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(data.summary.avgDailyTokens)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Activity className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peak Day</p>
                    <p className="text-lg font-bold text-foreground">
                      {data.summary.peakDay ? formatDate(data.summary.peakDay) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Events</p>
                    <p className="text-lg font-bold text-foreground">
                      {data.summary.totalEvents.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Usage Chart */}
          {data?.dailyUsage && data.dailyUsage.length > 0 && (
            <div className="mb-8 bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Daily Token Usage
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.dailyUsage.map((d) => ({
                      ...d,
                      displayDate: formatDate(d.date),
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fill: '#71706B', fontSize: 11 }}
                      tickLine={{ stroke: '#E6E2D6' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#71706B', fontSize: 11 }}
                      tickLine={{ stroke: '#E6E2D6' }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFEFB',
                        border: '1px solid #E6E2D6',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [
                        `${formatNumber(value)} tokens`,
                        'Usage',
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar
                      dataKey="tokens"
                      fill="#7C3AED"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Events List */}
          {data?.recentEvents && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Activity
                </h2>
              </div>

              {data.recentEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No usage events found for this period
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {data.recentEvents.slice(0, 50).map((event) => (
                    <div
                      key={event.id}
                      className="px-6 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {formatEventType(event.eventType)}
                            </span>
                            {event.modelUsed && (
                              <span className="text-xs text-muted-foreground">
                                {event.modelUsed}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(event.date).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {formatNumber(event.totalTokens)} tokens
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(event.inputTokens)} in / {formatNumber(event.outputTokens)} out
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.recentEvents.length > 50 && (
                <div className="px-6 py-3 bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">
                    Showing 50 of {data.recentEvents.length} events
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
