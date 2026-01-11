'use client'

/**
 * Admin Tenants Page
 *
 * Displays tenant list with tabs for filtering by type.
 * Shows session/campaign counts per tenant.
 * Admin-only access.
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  ArrowLeft,
  Loader2,
  Mic,
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Globe,
} from 'lucide-react'

interface Tenant {
  id: string
  slug: string
  display_name: string
  tenant_type: string
  subscription_tier: string | null
  is_active: boolean
  custom_domain: string | null
  created_at: string
  updated_at: string
  owner: {
    email: string | null
    name: string | null
    last_seen_at: string | null
  }
  sessions: {
    total: number
    completed: number
  }
  campaigns: {
    total: number
    completed: number
  }
}

interface TenantsData {
  tenants: Tenant[]
  summary: {
    coaches: number
    consultants: number
    schools: number
    active: number
    total: number
  }
}

type TabType = 'all' | 'coach' | 'consultant' | 'school'

export default function AdminTenantsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<TenantsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Get initial tab from URL params
  const initialTab = (searchParams?.get('type') as TabType) || 'all'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadTenants()
    }
  }, [isAdmin, activeTab])

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
  }

  async function loadTenants() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.append('type', activeTab)
      }
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/tenants?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tenants')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching tenants:', err)
      setError('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadTenants()
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
    // Update URL without navigation
    const url = new URL(window.location.href)
    if (tab === 'all') {
      url.searchParams.delete('type')
    } else {
      url.searchParams.set('type', tab)
    }
    window.history.pushState({}, '', url)
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'coach':
        return <Mic className="w-4 h-4 text-emerald-600" />
      case 'consultant':
        return <Building2 className="w-4 h-4 text-blue-600" />
      case 'school':
        return <GraduationCap className="w-4 h-4 text-teal-600" />
      default:
        return <Building2 className="w-4 h-4 text-muted-foreground" />
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'coach':
        return 'bg-emerald-100 text-emerald-700'
      case 'consultant':
        return 'bg-blue-100 text-blue-700'
      case 'school':
        return 'bg-teal-100 text-teal-700'
      default:
        return 'bg-muted text-foreground'
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
          <Building2 className="w-7 h-7 text-purple-600" />
          Tenants
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage platform tenants and view their activity
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/50 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{data.summary.total}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-600">Coaches</p>
            <p className="text-2xl font-bold text-emerald-700">{data.summary.coaches}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600">Consultants</p>
            <p className="text-2xl font-bold text-blue-700">{data.summary.consultants}</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-600">Schools</p>
            <p className="text-2xl font-bold text-teal-700">{data.summary.schools}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Active</p>
            <p className="text-2xl font-bold text-green-700">{data.summary.active}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All Tenants
        </button>
        <button
          onClick={() => handleTabChange('coach')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'coach'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic className="w-4 h-4" />
          Coaches
        </button>
        <button
          onClick={() => handleTabChange('consultant')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'consultant'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Consultants
        </button>
        <button
          onClick={() => handleTabChange('school')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'school'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Schools
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, slug, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg
                       text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </form>

      {/* Tenants Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tenant</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Owner</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Sessions</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Campaigns</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {tenant.display_name}
                        </p>
                        {tenant.custom_domain && (
                          <span title="Custom domain">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(tenant.tenant_type)}`}>
                      {getTypeIcon(tenant.tenant_type)}
                      <span className="capitalize">{tenant.tenant_type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-foreground">{tenant.owner?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{tenant.owner?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div>
                      <p className="text-sm font-medium text-foreground">{tenant.sessions.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {tenant.sessions.completed} completed
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div>
                      <p className="text-sm font-medium text-foreground">{tenant.campaigns.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {tenant.campaigns.completed} completed
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tenant.is_active ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs">Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs">Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tenant.owner?.last_seen_at)}
                    </p>
                  </td>
                </tr>
              ))}
              {(!data?.tenants || data.tenants.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
