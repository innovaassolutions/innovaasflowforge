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
  Zap,
  Mail,
  FileText,
  Mic,
  Calendar,
  ChevronDown,
} from 'lucide-react'

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
  total_tokens: number
  total_cost_cents: number
  event_count: number
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

interface BillingData {
  summary: {
    totalTokens: number
    totalCostCents: number
    totalCostDollars: string
    totalEvents: number
    uniqueTenants: number
  }
  byType: UsageByType[]
  byTenant: UsageByTenant[]
  byMonth: UsageByMonth[]
  byModel: UsageByModel[]
}

export default function AdminBillingPage() {
  const router = useRouter()
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'type' | 'tenant' | 'month' | 'model'>('type')

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

    try {
      const response = await fetch('/api/admin/billing')
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
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-purple-600" />
          Usage & Billing
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor platform usage and associated costs
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
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.totalEvents.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.uniqueTenants}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
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
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Events</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Tokens</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.byTenant.map((row, idx) => (
                <tr key={row.tenant_id || idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">
                      {row.tenant_name || 'Platform'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground capitalize">
                      {row.tenant_type || 'N/A'}
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
              {(!data?.byTenant || data.byTenant.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
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
      </div>
    </div>
  )
}
