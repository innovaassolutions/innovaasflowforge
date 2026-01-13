'use client'

/**
 * Coaching Client Detail Page
 *
 * Displays detailed information about a coaching client,
 * including archetype results (if completed) and status management.
 *
 * Story: 3-4-dashboard-pipeline
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Trophy,
  Archive,
  FileText,
  Download,
  Send,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  User,
  Target,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface CoachingClient {
  id: string
  client_name: string
  client_email: string
  client_status: string
  access_token: string
  created_at: string
  started_at: string | null
  completed_at: string | null
  last_activity_at: string | null
  metadata?: {
    default_archetype?: string
    authentic_archetype?: string
    is_aligned?: boolean
    scores?: Record<string, number>
    reflection_completed?: boolean
    reflection_completed_at?: string
  }
}

interface TenantProfile {
  id: string
  slug: string
  display_name: string
}

const STATUS_OPTIONS = [
  { value: 'registered', label: 'Not Started', icon: AlertCircle, color: 'text-blue-600' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-amber-600' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600' },
  { value: 'contacted', label: 'Contacted', icon: Phone, color: 'text-purple-600' },
  { value: 'converted', label: 'Converted', icon: Trophy, color: 'text-accent' },
  { value: 'archived', label: 'Archived', icon: Archive, color: 'text-gray-500' },
]

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params?.id as string

  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [client, setClient] = useState<CoachingClient | null>(null)
  const [tenant, setTenant] = useState<TenantProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    loadData(client)
  }, [clientId])

  async function loadData(supabaseClient: SupabaseClient<Database>) {
    try {
      setLoading(true)

      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get coach's tenant profile
      const { data: tenantData, error: tenantError } = await supabaseClient
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

      // Fetch specific client
      const { data: clientData, error: clientError } = await (supabaseClient
        .from('coaching_sessions') as any)
        .select('*')
        .eq('id', clientId)
        .eq('tenant_id', tenantData.id)
        .single()

      if (clientError || !clientData) {
        setError('Client not found or you do not have access.')
        setLoading(false)
        return
      }

      setClient(clientData as CoachingClient)
    } catch (err) {
      setError('Error loading client data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(newStatus: string) {
    if (!supabase || !client) return

    setUpdatingStatus(true)
    setError(null)

    try {
      const { error } = await (supabase
        .from('coaching_sessions') as any)
        .update({ client_status: newStatus })
        .eq('id', client.id)

      if (error) {
        setError('Failed to update status')
        console.error(error)
      } else {
        setClient({ ...client, client_status: newStatus })
      }
    } catch (err) {
      setError('Error updating status')
      console.error(err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleSendInvite() {
    if (!supabase || !tenant || !client) return

    setSendingInvite(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        return
      }

      const response = await fetch(`/api/coach/${tenant.slug}/session/${client.access_token}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setInviteSent(true)
        setTimeout(() => setInviteSent(false), 3000)
      } else {
        setError(data.error || 'Failed to send invite')
      }
    } catch (err) {
      setError('Error sending invite')
      console.error(err)
    } finally {
      setSendingInvite(false)
    }
  }

  async function handleDownloadPdf() {
    if (!tenant || !client) return

    setDownloadingPdf(true)
    try {
      const response = await fetch(`/api/coach/${tenant.slug}/results/${client.access_token}/download-pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${client.client_name.replace(/[^a-zA-Z0-9]/g, '-')}-leadership-archetype-results.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download PDF. Please try again.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  function getSessionUrl() {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/coach/${tenant?.slug}/session/${client?.access_token}`
  }

  function getReportUrl() {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/coach/${tenant?.slug}/results/${client?.access_token}`
  }

  function copySessionLink() {
    navigator.clipboard.writeText(getSessionUrl())
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function getStatusInfo(status: string) {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive">{error || 'Client not found'}</p>
          <Link href="/dashboard/coaching/clients" className="inline-block mt-4 text-primary hover:underline">
            Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(client.client_status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <Link
          href="/dashboard/coaching/clients"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.client_name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {client.client_email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              client.client_status === 'completed' ? 'bg-green-50 border-green-200' :
              client.client_status === 'in_progress' ? 'bg-amber-50 border-amber-200' :
              client.client_status === 'registered' ? 'bg-blue-50 border-blue-200' :
              client.client_status === 'contacted' ? 'bg-purple-50 border-purple-200' :
              client.client_status === 'converted' ? 'bg-accent-subtle border-accent/30' :
              'bg-gray-50 border-gray-200'
            }`}>
              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Client Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Timeline Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="font-medium text-foreground" suppressHydrationWarning>
                      {new Date(client.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {client.started_at && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Started Assessment</p>
                      <p className="font-medium text-foreground" suppressHydrationWarning>
                        {new Date(client.started_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {client.completed_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Assessment</p>
                      <p className="font-medium text-foreground" suppressHydrationWarning>
                        {new Date(client.completed_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Archetype Results - only show if completed */}
            {client.client_status === 'completed' && client.metadata && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Archetype Results</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {client.metadata.default_archetype && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">Default Archetype</span>
                      </div>
                      <p className="text-xl font-bold text-blue-800">
                        {client.metadata.default_archetype}
                      </p>
                    </div>
                  )}
                  {client.metadata.authentic_archetype && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium">Authentic Archetype</span>
                      </div>
                      <p className="text-xl font-bold text-green-800">
                        {client.metadata.authentic_archetype}
                      </p>
                    </div>
                  )}
                </div>
                {client.metadata.is_aligned !== undefined && (
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Target className={`w-5 h-5 ${client.metadata.is_aligned ? 'text-green-600' : 'text-amber-600'}`} />
                      <span className="font-medium">
                        {client.metadata.is_aligned
                          ? 'Aligned: Leading authentically'
                          : 'Growth Opportunity: Default and authentic archetypes differ'}
                      </span>
                    </div>
                  </div>
                )}
                {client.metadata.reflection_completed && (
                  <div className="mt-4 p-3 rounded-lg bg-accent-subtle border border-accent/20">
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Reflection session completed</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Update Status */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Update Status</h2>
              <select
                value={client.client_status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updatingStatus}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {updatingStatus && (
                <p className="text-sm text-muted-foreground mt-2">Updating...</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {/* View Report - only for completed */}
                {client.client_status === 'completed' && (
                  <>
                    <a
                      href={getReportUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Report
                    </a>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                    >
                      {downloadingPdf ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {downloadingPdf ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </>
                )}

                {/* Send Invite - for incomplete */}
                {client.client_status !== 'completed' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSendInvite}
                    disabled={sendingInvite}
                  >
                    {sendingInvite ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : inviteSent ? (
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {inviteSent ? 'Invite Sent!' : 'Send Invite Email'}
                  </Button>
                )}

                {/* Copy Session Link */}
                <Button variant="outline" className="w-full" onClick={copySessionLink}>
                  {copiedLink ? (
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copiedLink ? 'Copied!' : 'Copy Session Link'}
                </Button>

                {/* Open Session */}
                <a
                  href={getSessionUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Session Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
