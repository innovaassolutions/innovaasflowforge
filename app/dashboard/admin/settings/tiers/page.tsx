'use client'

/**
 * Admin Subscription Tiers Settings Page
 *
 * Displays and manages subscription tier configurations.
 * Admin-only access.
 *
 * Story: billing-2-5-admin-ui-tier-management
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Settings,
  CheckCircle,
  XCircle,
  Coins,
  Zap,
  Pencil,
  X,
} from 'lucide-react'

interface Tier {
  id: string
  name: string
  displayName: string
  monthlyTokenLimit: number | null
  monthlySessionLimit: number | null
  priceCentsMonthly: number
  isActive: boolean
}

export default function AdminTiersPage() {
  const router = useRouter()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTier, setEditingTier] = useState<Tier | null>(null)
  const [editTokenLimit, setEditTokenLimit] = useState('')
  const [editSessionLimit, setEditSessionLimit] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [saving, setSaving] = useState(false)

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

    const { data: profile } = await (supabase
      .from('user_profiles') as any)
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_type !== 'admin') {
      setLoading(false)
      return
    }

    setIsAdmin(true)
    await loadTiers()
  }

  async function loadTiers() {
    try {
      const response = await fetch('/api/admin/tiers')
      if (!response.ok) {
        throw new Error('Failed to fetch tiers')
      }
      const data = await response.json()
      setTiers(data.tiers)
    } catch (err) {
      console.error('Error loading tiers:', err)
      setError('Failed to load subscription tiers')
    } finally {
      setLoading(false)
    }
  }

  function openEditModal(tier: Tier) {
    setEditingTier(tier)
    setEditTokenLimit(tier.monthlyTokenLimit?.toString() || '')
    setEditSessionLimit(tier.monthlySessionLimit?.toString() || '')
    setEditPrice((tier.priceCentsMonthly / 100).toString())
    setShowEditModal(true)
  }

  function closeEditModal() {
    setShowEditModal(false)
    setEditingTier(null)
    setEditTokenLimit('')
    setEditSessionLimit('')
    setEditPrice('')
  }

  async function saveTierChanges() {
    if (!editingTier) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/tiers/${editingTier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyTokenLimit: editTokenLimit ? parseInt(editTokenLimit, 10) : null,
          monthlySessionLimit: editSessionLimit ? parseInt(editSessionLimit, 10) : null,
          priceCentsMonthly: editPrice ? Math.round(parseFloat(editPrice) * 100) : 0,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to update tier')
      }

      await loadTiers()
      closeEditModal()
    } catch (err: any) {
      console.error('Error saving tier:', err)
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  function formatTokens(n: number | null): string {
    if (n === null) return 'Unlimited'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toString()
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(0)}/mo`
  }

  function getTierColor(name: string): string {
    switch (name.toLowerCase()) {
      case 'starter':
        return 'border-emerald-200 bg-emerald-50'
      case 'pro':
        return 'border-blue-200 bg-blue-50'
      case 'enterprise':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-border bg-card'
    }
  }

  function getTierTextColor(name: string): string {
    switch (name.toLowerCase()) {
      case 'starter':
        return 'text-emerald-700'
      case 'pro':
        return 'text-blue-700'
      case 'enterprise':
        return 'text-purple-700'
      default:
        return 'text-foreground'
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/admin/overview"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-7 h-7 text-accent" />
          Subscription Tiers
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage subscription tier configurations
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/50 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`border-2 rounded-xl p-6 ${getTierColor(tier.name)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${getTierTextColor(tier.name)}`}>
                {tier.displayName || tier.name}
              </h2>
              {tier.isActive ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <div className={`text-3xl font-bold mb-6 ${getTierTextColor(tier.name)}`}>
              {formatPrice(tier.priceCentsMonthly)}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Token Limit:</span>
                <span className="font-medium text-foreground">
                  {formatTokens(tier.monthlyTokenLimit)}
                </span>
              </div>
              {tier.monthlySessionLimit && (
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Session Limit:</span>
                  <span className="font-medium text-foreground">
                    {tier.monthlySessionLimit}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Tier ID: {tier.id.slice(0, 8)}...
              </p>
              <button
                onClick={() => openEditModal(tier)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground
                           hover:bg-white/50 transition-colors"
                title="Edit Tier"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tiers.length === 0 && !error && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No subscription tiers configured</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-accent-subtle border border-accent/20 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Changes to tier configurations affect all tenants on that tier.
          Use the edit button to modify token limits and pricing.
        </p>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeEditModal}
          />

          {/* Modal */}
          <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Edit Tier
                </h2>
                <p className="text-sm text-muted-foreground">
                  {editingTier.displayName || editingTier.name}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Token Limit */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Monthly Token Limit
                </label>
                <input
                  type="number"
                  value={editTokenLimit}
                  onChange={(e) => setEditTokenLimit(e.target.value)}
                  placeholder="e.g., 500000 (leave empty for unlimited)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg
                             text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for unlimited tokens
                </p>
              </div>

              {/* Session Limit */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Monthly Session Limit
                </label>
                <input
                  type="number"
                  value={editSessionLimit}
                  onChange={(e) => setEditSessionLimit(e.target.value)}
                  placeholder="e.g., 100 (leave empty for unlimited)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg
                             text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for unlimited sessions
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Monthly Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="29.00"
                    className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg
                               text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium
                             text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTierChanges}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium
                             hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
