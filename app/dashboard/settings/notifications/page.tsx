'use client'

/**
 * Usage Notifications History Page
 *
 * Displays past usage notifications for the tenant.
 * Allows acknowledging/dismissing notifications.
 * Story: billing-3-3-tenant-notification-history
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Mail,
  Monitor,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
} from 'lucide-react'

type NotificationType = '75_percent' | '90_percent' | '100_percent'
type DeliveryMethod = 'in_app' | 'email' | 'both'

interface Notification {
  id: string
  type: NotificationType
  billingPeriod: string
  sentAt: string
  deliveryMethod: DeliveryMethod
  acknowledgedAt: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      setLoading(true)
      const response = await fetch('/api/tenant/notifications')
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to fetch notifications')
        return
      }

      setNotifications(data.notifications || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function handleAcknowledge(notification: Notification) {
    if (notification.acknowledgedAt) return

    try {
      setAcknowledging(notification.id)
      const response = await fetch('/api/tenant/notifications/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationType: notification.type,
          billingPeriod: notification.billingPeriod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, acknowledgedAt: new Date().toISOString() }
              : n
          )
        )
      }
    } catch (err) {
      console.error('Failed to acknowledge notification:', err)
    } finally {
      setAcknowledging(null)
    }
  }

  // Get unique billing periods for filter
  const billingPeriods = Array.from(
    new Set(notifications.map((n) => n.billingPeriod))
  ).sort().reverse()

  // Filter notifications
  const filteredNotifications =
    selectedPeriod === 'all'
      ? notifications
      : notifications.filter((n) => n.billingPeriod === selectedPeriod)

  const getTypeInfo = (type: NotificationType) => {
    switch (type) {
      case '75_percent':
        return {
          label: '75% Warning',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: AlertTriangle,
        }
      case '90_percent':
        return {
          label: '90% Warning',
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: AlertCircle,
        }
      case '100_percent':
        return {
          label: 'Limit Reached',
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: XCircle,
        }
    }
  }

  const getDeliveryIcon = (method: DeliveryMethod) => {
    switch (method) {
      case 'in_app':
        return Monitor
      case 'email':
        return Mail
      case 'both':
        return Bell
    }
  }

  const getDeliveryLabel = (method: DeliveryMethod) => {
    switch (method) {
      case 'in_app':
        return 'In-app'
      case 'email':
        return 'Email'
      case 'both':
        return 'Email + In-app'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPeriod = (period: string) => {
    const date = new Date(period)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Usage Notifications
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            View your past usage notifications and warnings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
            <span className="ml-2 text-[var(--text-muted)]">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error loading notifications</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-[var(--bg-subtle)] rounded-full flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-lg font-medium text-[var(--text)]">No notifications yet</h2>
            <p className="text-[var(--text-muted)] mt-2">
              You&apos;ll see usage warnings here when you approach your monthly limits.
            </p>
          </div>
        ) : (
          <>
            {/* Filter */}
            {billingPeriods.length > 1 && (
              <div className="mb-6 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--text-muted)]" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text)] text-sm
                             focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                >
                  <option value="all">All Periods</option>
                  {billingPeriods.map((period) => (
                    <option key={period} value={period}>
                      {formatPeriod(period)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notification List */}
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const typeInfo = getTypeInfo(notification.type)
                const DeliveryIcon = getDeliveryIcon(notification.deliveryMethod)
                const TypeIcon = typeInfo.icon
                const isAcknowledged = !!notification.acknowledgedAt

                return (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isAcknowledged
                        ? 'bg-[var(--bg-muted)] border-[var(--border)] opacity-60'
                        : `${typeInfo.color}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <TypeIcon
                          className={`w-5 h-5 mt-0.5 ${
                            isAcknowledged ? 'text-[var(--text-muted)]' : ''
                          }`}
                        />
                        <div>
                          <h3
                            className={`font-medium ${
                              isAcknowledged
                                ? 'text-[var(--text-muted)]'
                                : 'text-[var(--text)]'
                            }`}
                          >
                            {typeInfo.label}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">
                            <span>{formatDate(notification.sentAt)}</span>
                            <span className="flex items-center gap-1">
                              <DeliveryIcon className="w-4 h-4" />
                              {getDeliveryLabel(notification.deliveryMethod)}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            Billing period: {formatPeriod(notification.billingPeriod)}
                          </p>
                        </div>
                      </div>

                      {isAcknowledged ? (
                        <div className="flex items-center gap-1 text-[var(--text-muted)] text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Acknowledged
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(notification)}
                          disabled={acknowledging === notification.id}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-current
                                     hover:bg-white/50 transition-colors disabled:opacity-50"
                        >
                          {acknowledging === notification.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Dismiss'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
