'use client'

/**
 * Admin Billing Page
 *
 * Displays usage and cost metrics aggregated by event type, tenant, and time.
 * Admin-only access.
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DollarSign,
  ArrowLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Zap,
  Mail,
  FileText,
  Mic,
  Calendar,
  ChevronDown,
  Filter,
  Building2,
  X,
  AlertTriangle,
  Percent,
  BarChart3,
  Download,
  FileDown,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface UsageByType {
  event_type: string
  total_tokens: number
  total_cost_cents: number
  event_count: number
}

interface UsageByTenant {
  tenant_id: string | null
  tenant_name: string | null
  tenant_type: string | null
  subscription_tier: string
  total_tokens: number
  total_cost_cents: number
  event_count: number
  revenue_cents: number
  margin_cents: number
  margin_percentage: number
  has_revenue_override: boolean
  is_negative_margin: boolean
  is_low_margin: boolean
}

interface UsageByMonth {
  month: string
  total_tokens: number
  total_cost_cents: number
  event_count: number
}

interface UsageByModel {
  model: string | null
  total_tokens: number
  total_cost_cents: number
  event_count: number
}

interface UsageByProvider {
  provider: string
  total_tokens: number
  total_cost_cents: number
  event_count: number
  percentage: number
}

interface DailyTrend {
  date: string
  total_cost_cents: number
  anthropic: number
  openai: number
  google: number
  other: number
}

interface BillingData {
  summary: {
    totalTokens: number
    totalCostCents: number
    totalCostDollars: string
    totalEvents: number
    uniqueTenants: number
    totalRevenueCents: number
    totalRevenueDollars: string
    totalMarginCents: number
    totalMarginDollars: string
    overallMarginPercentage: number
    tenantsWithNegativeMargin: number
    tenantsWithLowMargin: number
  }
  byType: UsageByType[]
  byTenant: UsageByTenant[]
  byMonth: UsageByMonth[]
  byModel: UsageByModel[]
  byProvider: UsageByProvider[]
  dailyTrend: DailyTrend[]
}

export default function AdminBillingPage() {
  const router = useRouter()
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'type' | 'tenant' | 'month' | 'model' | 'provider'>('type')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [chartView, setChartView] = useState<'total' | 'provider'>('total')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  async function checkAdminAndLoadData() {
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
    await fetchBillingData()
  }

  async function fetchBillingData(start?: string, end?: string) {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (start) params.set('startDate', start)
      if (end) params.set('endDate', end)

      const url = `/api/admin/billing${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch billing data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching billing data:', err)
      setError('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  function handleDateFilter() {
    fetchBillingData(startDate || undefined, endDate || undefined)
  }

  function clearDateFilter() {
    setStartDate('')
    setEndDate('')
    fetchBillingData()
  }

  function getEventIcon(eventType: string) {
    switch (eventType) {
      case 'llm_call':
        return <Zap className="w-4 h-4 text-purple-600" />
      case 'email_sent':
        return <Mail className="w-4 h-4 text-blue-600" />
      case 'report_generated':
        return <FileText className="w-4 h-4 text-green-600" />
      case 'voice_interview':
        return <Mic className="w-4 h-4 text-orange-600" />
      default:
        return <Zap className="w-4 h-4 text-muted-foreground" />
    }
  }

  function getEventLabel(eventType: string) {
    switch (eventType) {
      case 'llm_call':
        return 'LLM Calls'
      case 'email_sent':
        return 'Emails Sent'
      case 'report_generated':
        return 'Reports Generated'
      case 'voice_interview':
        return 'Voice Interviews'
      default:
        return eventType
    }
  }

  function formatCost(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
  }

  function formatTokens(tokens: number): string {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(2)}M`
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toString()
  }

  function formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  async function handleExport() {
    try {
      setExporting(true)
      const params = new URLSearchParams()
      params.set('format', exportFormat)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/admin/billing/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition')
      const filenameMatch = disposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `billing-export.${exportFormat}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setShowExportModal(false)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export data')
    } finally {
      setExporting(false)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <DollarSign className="w-7 h-7 text-purple-600" />
              Usage & Billing
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor platform usage and associated costs
            </p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card border border-border rounded-md hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-purple-600" />
                  Export Billing Data
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Export Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-foreground">CSV</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={() => setExportFormat('json')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-foreground">JSON</span>
                  </label>
                </div>
              </div>

              {/* Date Range Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Date Range:</span>{' '}
                  {startDate && endDate
                    ? `${startDate} to ${endDate}`
                    : startDate
                      ? `From ${startDate}`
                      : endDate
                        ? `Until ${endDate}`
                        : 'All time'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the date filter on the dashboard to change the export range.
                </p>
              </div>

              {/* Export Info */}
              <div className="text-sm text-muted-foreground">
                <p>The export will include:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Date and time</li>
                  <li>Tenant name</li>
                  <li>Model used</li>
                  <li>Token counts (input/output)</li>
                  <li>Costs in cents and dollars</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/50 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {data?.summary && (
        <>
          {/* First row: Cost and Revenue metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-foreground">${data.summary.totalCostDollars}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${data.summary.totalRevenueDollars}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${data.summary.totalMarginCents >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {data.summary.totalMarginCents >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Margin</p>
                  <p className={`text-2xl font-bold ${data.summary.totalMarginCents >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${data.summary.totalMarginDollars}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${data.summary.overallMarginPercentage >= 20 ? 'bg-purple-100' : 'bg-orange-100'}`}>
                  <Percent className={`w-5 h-5 ${data.summary.overallMarginPercentage >= 20 ? 'text-purple-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Margin %</p>
                  <p className={`text-2xl font-bold ${data.summary.overallMarginPercentage >= 20 ? 'text-purple-600' : 'text-orange-600'}`}>
                    {data.summary.overallMarginPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Second row: Usage metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold text-foreground">{formatTokens(data.summary.totalTokens)}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold text-foreground">{data.summary.totalEvents.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Tenants</p>
                  <p className="text-2xl font-bold text-foreground">{data.summary.uniqueTenants}</p>
                </div>
              </div>
            </div>

            {(data.summary.tenantsWithNegativeMargin > 0 || data.summary.tenantsWithLowMargin > 0) && (
              <div className="bg-card border border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">At-Risk Tenants</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {data.summary.tenantsWithNegativeMargin + data.summary.tenantsWithLowMargin}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.summary.tenantsWithNegativeMargin > 0 && `${data.summary.tenantsWithNegativeMargin} negative`}
                      {data.summary.tenantsWithNegativeMargin > 0 && data.summary.tenantsWithLowMargin > 0 && ', '}
                      {data.summary.tenantsWithLowMargin > 0 && `${data.summary.tenantsWithLowMargin} low`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Cost Trend Chart */}
      {data?.dailyTrend && data.dailyTrend.length > 0 && (
        <div className="mb-8 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-foreground">Cost Trend</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartView('total')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartView === 'total'
                    ? 'bg-purple-600 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Total
              </button>
              <button
                onClick={() => setChartView('provider')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartView === 'provider'
                    ? 'bg-purple-600 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                By Provider
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.dailyTrend.map((d) => ({
                  ...d,
                  date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  total: d.total_cost_cents / 100,
                  anthropic: d.anthropic / 100,
                  openai: d.openai / 100,
                  google: d.google / 100,
                  other: d.other / 100,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#71706B', fontSize: 12 }}
                  tickLine={{ stroke: '#E6E2D6' }}
                />
                <YAxis
                  tick={{ fill: '#71706B', fontSize: 12 }}
                  tickLine={{ stroke: '#E6E2D6' }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFEFB',
                    border: '1px solid #E6E2D6',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                {chartView === 'total' ? (
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Cost"
                    stroke="#F25C05"
                    strokeWidth={2}
                    dot={{ fill: '#F25C05', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#F25C05' }}
                  />
                ) : (
                  <>
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="anthropic"
                      name="Anthropic"
                      stroke="#1D9BA3"
                      strokeWidth={2}
                      dot={{ fill: '#1D9BA3', strokeWidth: 0, r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="openai"
                      name="OpenAI"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={{ fill: '#6366F1', strokeWidth: 0, r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="google"
                      name="Google"
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={{ fill: '#22C55E', strokeWidth: 0, r: 2 }}
                    />
                    {data.dailyTrend.some((d) => d.other > 0) && (
                      <Line
                        type="monotone"
                        dataKey="other"
                        name="Other"
                        stroke="#71706B"
                        strokeWidth={2}
                        dot={{ fill: '#71706B', strokeWidth: 0, r: 2 }}
                      />
                    )}
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <button
            onClick={handleDateFilter}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Apply
          </button>
          {(startDate || endDate) && (
            <button
              onClick={clearDateFilter}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('type')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'type'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          By Event Type
        </button>
        <button
          onClick={() => setActiveTab('tenant')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tenant'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          By Tenant
        </button>
        <button
          onClick={() => setActiveTab('month')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'month'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          By Month
        </button>
        <button
          onClick={() => setActiveTab('model')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'model'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          By Model
        </button>
        <button
          onClick={() => setActiveTab('provider')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'provider'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          By Provider
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {activeTab === 'type' && (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Event Type</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Events</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Tokens</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.byType.map((row) => (
                <tr key={row.event_type} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getEventIcon(row.event_type)}
                      <span className="text-sm font-medium text-foreground">
                        {getEventLabel(row.event_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {row.event_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {formatTokens(row.total_tokens)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {formatCost(row.total_cost_cents)}
                  </td>
                </tr>
              ))}
              {(!data?.byType || data.byType.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No usage data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'tenant' && (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tenant</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tier</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Cost</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Revenue</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Margin</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.byTenant.map((row, idx) => (
                <tr
                  key={row.tenant_id || idx}
                  className={`hover:bg-muted/30 transition-colors ${
                    row.is_negative_margin ? 'bg-red-50' : row.is_low_margin ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {row.tenant_name || 'Platform'}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {row.tenant_type || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground capitalize">
                        {row.subscription_tier}
                      </span>
                      {row.has_revenue_override && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Custom
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {formatCost(row.total_cost_cents)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {formatCost(row.revenue_cents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${
                      row.is_negative_margin ? 'text-red-600' :
                      row.is_low_margin ? 'text-orange-600' : 'text-emerald-600'
                    }`}>
                      {formatCost(row.margin_cents)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-sm font-medium ${
                        row.is_negative_margin ? 'text-red-600' :
                        row.is_low_margin ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        {row.margin_percentage}%
                      </span>
                      {row.is_negative_margin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Negative
                        </span>
                      )}
                      {row.is_low_margin && !row.is_negative_margin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.byTenant || data.byTenant.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No usage data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'month' && (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Month</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Events</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Tokens</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.byMonth.map((row) => (
                <tr key={row.month} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {formatMonth(row.month)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {row.event_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {formatTokens(row.total_tokens)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {formatCost(row.total_cost_cents)}
                  </td>
                </tr>
              ))}
              {(!data?.byMonth || data.byMonth.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No usage data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'model' && (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Model</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Calls</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Tokens</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.byModel.map((row, idx) => (
                <tr key={row.model || idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-foreground">
                      {row.model || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {row.event_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {formatTokens(row.total_tokens)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {formatCost(row.total_cost_cents)}
                  </td>
                </tr>
              ))}
              {(!data?.byModel || data.byModel.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No usage data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'provider' && (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Provider</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Calls</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Tokens</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Cost</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.byProvider?.map((row) => (
                <tr key={row.provider} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {row.provider}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {row.event_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {formatTokens(row.total_tokens)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {formatCost(row.total_cost_cents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {row.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.byProvider || data.byProvider.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No usage data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
