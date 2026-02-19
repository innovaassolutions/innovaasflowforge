'use client'

/**
 * Notification Settings Page
 *
 * Allows tenants to configure multi-channel notifications:
 * - Channel setup (Email, Slack, Telegram, WhatsApp)
 * - Event preferences (session completions, usage warnings)
 * - Delivery log / audit trail
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Bell,
  Mail,
  Hash,
  Send,
  Phone,
  Settings,
  History,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react'

interface NotificationPreferences {
  channels: {
    email: { enabled: boolean }
    slack: { enabled: boolean; webhook_url?: string | null; channel_name?: string | null }
    telegram: { enabled: boolean; bot_token?: string | null; chat_id?: string | null }
    whatsapp: { enabled: boolean; phone_number?: string | null }
  }
  notify_on_session_complete: boolean
  notify_on_usage_warning: boolean
}

interface LogEntry {
  id: string
  event_type: string
  channel: string
  status: string
  error_message: string | null
  estimated_cost_usd: number
  recipient: string
  metadata: Record<string, unknown>
  created_at: string
}

const DEFAULT_PREFS: NotificationPreferences = {
  channels: {
    email: { enabled: true },
    slack: { enabled: false, webhook_url: null, channel_name: null },
    telegram: { enabled: false, bot_token: null, chat_id: null },
    whatsapp: { enabled: false, phone_number: null },
  },
  notify_on_session_complete: true,
  notify_on_usage_warning: true,
}

export default function NotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Password field visibility
  const [showSlackUrl, setShowSlackUrl] = useState(false)
  const [showBotToken, setShowBotToken] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadLogs = useCallback(async (tid: string) => {
    setLogsLoading(true)
    try {
      const response = await fetch(`/api/tenant/notifications/log?tenant_id=${tid}&limit=20`)
      const data = await response.json()
      if (data.success) {
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }, [])

  async function loadSettings() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUserEmail(user.email || '')

      const { data: tenantData, error: tenantError } = await (supabase
        .from('tenant_profiles') as any)
        .select('id, notification_preferences')
        .eq('user_id', user.id)
        .single()

      if (tenantError || !tenantData) {
        setError('No tenant profile found. Please contact support.')
        setLoading(false)
        return
      }

      setTenantId(tenantData.id)

      const savedPrefs = tenantData.notification_preferences
      if (savedPrefs) {
        setPrefs({
          ...DEFAULT_PREFS,
          ...savedPrefs,
          channels: {
            ...DEFAULT_PREFS.channels,
            ...savedPrefs.channels,
          },
        })
      }

      loadLogs(tenantData.id)
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || !tenantId) {
        setError('Authentication required')
        return
      }

      const { error: updateError } = await (supabase
        .from('tenant_profiles') as any)
        .update({ notification_preferences: prefs })
        .eq('id', tenantId)

      if (updateError) {
        setError('Failed to save notification settings')
        return
      }

      setSuccess('Notification settings saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save notification settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleTestChannel(channel: string) {
    setTesting(channel)
    setError(null)
    setSuccess(null)

    try {
      const channelConfig = prefs.channels[channel as keyof typeof prefs.channels]
      const response = await fetch('/api/tenant/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, config: channelConfig }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(`Test notification sent to ${channel} successfully`)
      } else {
        setError(data.error || `Test failed for ${channel}`)
      }
      setTimeout(() => { setSuccess(null); setError(null) }, 4000)
    } catch (err) {
      console.error('Test failed:', err)
      setError(`Test connection failed for ${channel}`)
    } finally {
      setTesting(null)
    }
  }

  function updateChannel<K extends keyof NotificationPreferences['channels']>(
    channel: K,
    updates: Partial<NotificationPreferences['channels'][K]>
  ) {
    setPrefs(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: { ...prev.channels[channel], ...updates },
      },
    }))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const channelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return Mail
      case 'slack': return Hash
      case 'telegram': return Send
      case 'whatsapp': return Phone
      default: return Bell
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" /> Sent</span>
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3 h-3" /> Failed</span>
      case 'skipped':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200">Skipped</span>
      default:
        return <span className="text-xs text-[var(--text-muted)]">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <span className="ml-2 text-[var(--text-muted)]">Loading settings...</span>
      </div>
    )
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
            Notification Settings
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Configure how you receive notifications when sessions complete
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Status messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* =============== Section 1: Notification Channels =============== */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[var(--text)]" />
              <h2 className="text-lg font-semibold text-[var(--text)]">Notification Channels</h2>
            </div>
            <div className="space-y-4">

              {/* Email Channel - Always enabled */}
              <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text)]">Email</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Notifications sent to {userEmail || 'your account email'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                    Always On
                  </span>
                </div>
              </div>

              {/* Slack Channel */}
              <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text)]">Slack</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Post to a Slack channel via incoming webhook
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.channels.slack.enabled}
                      onChange={(e) => updateChannel('slack', { enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>
                {prefs.channels.slack.enabled && (
                  <div className="ml-[52px] space-y-3">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                      <p className="font-medium mb-1">Setup Instructions</p>
                      <ol className="list-decimal list-inside space-y-1 text-purple-700">
                        <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="underline font-medium">api.slack.com/apps</a> and click &quot;Create New App&quot; &rarr; &quot;From scratch&quot;</li>
                        <li>Name it (e.g. &quot;FlowForge Notifications&quot;) and select your workspace</li>
                        <li>Under &quot;Features&quot;, click <strong>Incoming Webhooks</strong> and toggle it on</li>
                        <li>Click &quot;Add New Webhook to Workspace&quot; and choose a channel</li>
                        <li>Copy the Webhook URL and paste it below</li>
                      </ol>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Webhook URL
                      </label>
                      <div className="relative">
                        <input
                          type={showSlackUrl ? 'text' : 'password'}
                          value={prefs.channels.slack.webhook_url || ''}
                          onChange={(e) => updateChannel('slack', { webhook_url: e.target.value || null })}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full px-3 py-2 pr-10 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSlackUrl(!showSlackUrl)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                        >
                          {showSlackUrl ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Channel Name (optional)
                      </label>
                      <input
                        type="text"
                        value={prefs.channels.slack.channel_name || ''}
                        onChange={(e) => updateChannel('slack', { channel_name: e.target.value || null })}
                        placeholder="#notifications"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestChannel('slack')}
                      disabled={testing === 'slack' || !prefs.channels.slack.webhook_url}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {testing === 'slack' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Test Connection
                    </button>
                  </div>
                )}
              </div>

              {/* Telegram Channel */}
              <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                      <Send className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text)]">Telegram</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Receive messages via a Telegram bot
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.channels.telegram.enabled}
                      onChange={(e) => updateChannel('telegram', { enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>
                {prefs.channels.telegram.enabled && (
                  <div className="ml-[52px] space-y-3">
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sm text-sky-800">
                      <p className="font-medium mb-1">Setup Instructions</p>
                      <ol className="list-decimal list-inside space-y-1 text-sky-700">
                        <li>Open Telegram and search for <strong>@BotFather</strong></li>
                        <li>Send <code className="bg-sky-100 px-1 rounded">/newbot</code> and follow the prompts to name your bot</li>
                        <li>Copy the <strong>bot token</strong> BotFather gives you (paste it below)</li>
                        <li>Find your bot in Telegram and send it any message</li>
                        <li>Visit <code className="bg-sky-100 px-1 rounded text-xs">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> in your browser (replace &lt;TOKEN&gt; with your bot token)</li>
                        <li>Find <code className="bg-sky-100 px-1 rounded">&quot;chat&quot;:{`{`}&quot;id&quot;:</code> in the response &mdash; that number is your Chat ID</li>
                      </ol>
                      <p className="mt-2 text-sky-600 text-xs">For group chats, add the bot to the group first, then check getUpdates. Group chat IDs start with a minus sign.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Bot Token
                      </label>
                      <div className="relative">
                        <input
                          type={showBotToken ? 'text' : 'password'}
                          value={prefs.channels.telegram.bot_token || ''}
                          onChange={(e) => updateChannel('telegram', { bot_token: e.target.value || null })}
                          placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                          className="w-full px-3 py-2 pr-10 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBotToken(!showBotToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                        >
                          {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Chat ID
                      </label>
                      <input
                        type="text"
                        value={prefs.channels.telegram.chat_id || ''}
                        onChange={(e) => updateChannel('telegram', { chat_id: e.target.value || null })}
                        placeholder="-1001234567890"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestChannel('telegram')}
                      disabled={testing === 'telegram' || !prefs.channels.telegram.bot_token || !prefs.channels.telegram.chat_id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {testing === 'telegram' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Test Connection
                    </button>
                  </div>
                )}
              </div>

              {/* WhatsApp Channel */}
              <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text)]">WhatsApp</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Receive messages via WhatsApp Business
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.channels.whatsapp.enabled}
                      onChange={(e) => updateChannel('whatsapp', { enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>
                {prefs.channels.whatsapp.enabled && (
                  <div className="ml-[52px] space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      <p className="font-medium mb-1">Important Notes</p>
                      <ul className="list-disc list-inside space-y-1 text-amber-700">
                        <li>WhatsApp notifications are powered by Twilio and must be enabled at the platform level by your administrator</li>
                        <li>Each notification costs approximately $0.05 - $0.08 (tracked in your delivery log)</li>
                        <li>Enter the phone number where you want to receive notifications in E.164 format (e.g. +14155238886)</li>
                      </ul>
                      <p className="mt-2 text-amber-600 text-xs">Contact support if WhatsApp is not yet available for your account.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Phone Number (E.164 format)
                      </label>
                      <input
                        type="tel"
                        value={prefs.channels.whatsapp.phone_number || ''}
                        onChange={(e) => updateChannel('whatsapp', { phone_number: e.target.value || null })}
                        placeholder="+14155238886"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestChannel('whatsapp')}
                      disabled={testing === 'whatsapp' || !prefs.channels.whatsapp.phone_number}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {testing === 'whatsapp' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Test Connection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =============== Section 2: Notification Events =============== */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-[var(--text)]" />
              <h2 className="text-lg font-semibold text-[var(--text)]">Notification Events</h2>
            </div>
            <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-medium text-[var(--text)]">Session Completions</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Notify when a participant completes an interview or assessment
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.notify_on_session_complete}
                    onChange={(e) => setPrefs(prev => ({ ...prev, notify_on_session_complete: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-medium text-[var(--text)]">Usage Warnings</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Notify when approaching monthly usage limits (75%, 90%, 100%)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.notify_on_usage_warning}
                    onChange={(e) => setPrefs(prev => ({ ...prev, notify_on_usage_warning: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mb-10">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </form>

        {/* =============== Section 3: Delivery Log =============== */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-[var(--text)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Delivery Log</h2>
          </div>

          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
              <span className="ml-2 text-sm text-[var(--text-muted)]">Loading log...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] p-8 text-center">
              <History className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-[var(--text-muted)]">No notifications sent yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Delivery history will appear here once sessions are completed.
              </p>
            </div>
          ) : (
            <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-muted)]">
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Event</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Channel</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Recipient</th>
                      <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {logs.map((log) => {
                      const ChannelIcon = channelIcon(log.channel)
                      return (
                        <tr key={log.id} className="hover:bg-[var(--bg-muted)] transition-colors">
                          <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-4 py-3 text-[var(--text)]">
                            {log.event_type.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-[var(--text)]">
                              <ChannelIcon className="w-3.5 h-3.5" />
                              {log.channel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {statusBadge(log.status)}
                            {log.error_message && (
                              <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={log.error_message}>
                                {log.error_message}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs">
                            {log.recipient}
                          </td>
                          <td className="px-4 py-3 text-right text-[var(--text-muted)]">
                            {log.estimated_cost_usd > 0 ? `$${log.estimated_cost_usd.toFixed(4)}` : '--'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
