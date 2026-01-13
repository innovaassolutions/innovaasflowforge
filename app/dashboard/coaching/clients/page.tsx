'use client'

/**
 * Coaching Clients Page
 *
 * Allows coaches to view and manage their assessment clients.
 * Includes ability to add new clients and send invite emails.
 *
 * Story: 3-3-registration-sessions
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  UserCircle,
  Plus,
  Trash2,
  ArrowLeft,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  FileText,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface CoachingClient {
  id: string
  client_name: string
  client_email: string
  client_status: 'registered' | 'in_progress' | 'completed' | 'archived'
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
  }
}

interface TenantProfile {
  id: string
  slug: string
  display_name: string
}

export default function CoachingClientsPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [clients, setClients] = useState<CoachingClient[]>([])
  const [tenant, setTenant] = useState<TenantProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [sendingInvite, setSendingInvite] = useState<string | null>(null)
  const [inviteSent, setInviteSent] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // New client form state
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [addingClient, setAddingClient] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    loadData(client)
  }, [])

  async function loadData(client: SupabaseClient<Database>) {
    try {
      setLoading(true)

      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get coach's tenant profile
      const { data: tenantData, error: tenantError } = await client
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

      // Fetch coaching clients (type assertion needed as coaching_sessions not in generated types yet)
      const { data: clientsData, error: clientsError } = await (client
        .from('coaching_sessions') as any)
        .select('id, client_name, client_email, client_status, access_token, created_at, started_at, completed_at, last_activity_at, metadata')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false })

      if (clientsError) {
        setError(`Failed to load clients: ${clientsError.message || clientsError.code}`)
        console.error('Clients error:', clientsError)
      } else {
        setClients(clientsData || [])
      }
    } catch (err) {
      setError('Error loading data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !tenant) return

    setAddingClient(true)
    setAddError(null)

    try {
      // Generate unique session token
      const sessionToken = crypto.randomUUID().replace(/-/g, '')

      // Type assertion needed as coaching_sessions not in generated types yet
      const { data, error } = await (supabase
        .from('coaching_sessions') as any)
        .insert({
          tenant_id: tenant.id,
          client_name: newClientName.trim(),
          client_email: newClientEmail.trim().toLowerCase(),
          client_status: 'registered',
          access_token: sessionToken,
          access_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            created_by: 'coach_dashboard',
            created_at: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          setAddError('A client with this email already exists.')
        } else {
          setAddError('Failed to add client. Please try again.')
        }
        console.error(error)
      } else if (data) {
        const newClient = data as CoachingClient
        setClients([newClient, ...clients])
        setShowAddModal(false)
        setNewClientName('')
        setNewClientEmail('')

        // Auto-send invite email after creating client
        try {
          const { data: { session: authSession } } = await supabase.auth.getSession()
          if (authSession) {
            const response = await fetch(`/api/coach/${tenant.slug}/session/${newClient.access_token}/invite`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authSession.access_token}`,
              },
            })
            const inviteData = await response.json()
            if (response.ok && inviteData.success) {
              setInviteSent(newClient.id)
              setTimeout(() => setInviteSent(null), 3000)
            } else {
              console.error('Auto-send invite failed:', inviteData)
              // Don't show error - client was created successfully, email just didn't send
            }
          }
        } catch (inviteErr) {
          console.error('Auto-send invite error:', inviteErr)
          // Don't show error - client was created successfully
        }
      }
    } catch (err) {
      setAddError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setAddingClient(false)
    }
  }

  async function handleDeleteClient(clientId: string) {
    if (!supabase) return

    try {
      const { error } = await (supabase
        .from('coaching_sessions') as any)
        .delete()
        .eq('id', clientId)

      if (error) {
        setError('Failed to delete client')
        console.error(error)
      } else {
        setClients(clients.filter((c) => c.id !== clientId))
        setShowDeleteConfirm(false)
        setDeletingClientId(null)
      }
    } catch (err) {
      setError('Error deleting client')
      console.error(err)
    }
  }

  async function handleSendInvite(client: CoachingClient) {
    if (!supabase || !tenant) return

    setSendingInvite(client.id)
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
        setInviteSent(client.id)
        setTimeout(() => setInviteSent(null), 3000)
      } else {
        console.error('Send invite response:', data)
        setError(data.error || data.details || 'Failed to send invite')
      }
    } catch (err) {
      setError('Error sending invite')
      console.error(err)
    } finally {
      setSendingInvite(null)
    }
  }

  function getSessionUrl(accessToken: string) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/coach/${tenant?.slug}/session/${accessToken}`
  }

  function getReportUrl(accessToken: string) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/coach/${tenant?.slug}/results/${accessToken}`
  }

  function copySessionLink(accessToken: string) {
    navigator.clipboard.writeText(getSessionUrl(accessToken))
    setCopiedToken(accessToken)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  async function handleDownloadPdf(client: CoachingClient) {
    if (!tenant) return

    setDownloadingPdf(client.id)
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
      setDownloadingPdf(null)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'registered':
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'registered':
        return 'Not Started'
      case 'archived':
        return 'Archived'
      default:
        return status
    }
  }

  function getStatusStyles(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'registered':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  function handleExportCSV() {
    if (clients.length === 0) return

    // Define CSV headers
    const headers = [
      'Name',
      'Email',
      'Status',
      'Default Archetype',
      'Authentic Archetype',
      'Registration Date',
      'Completion Date',
    ]

    // Build CSV rows
    const rows = clients.map((client) => [
      client.client_name,
      client.client_email,
      getStatusLabel(client.client_status),
      client.metadata?.default_archetype || '',
      client.metadata?.authentic_archetype || '',
      new Date(client.created_at).toLocaleDateString(),
      client.completed_at ? new Date(client.completed_at).toLocaleDateString() : '',
    ])

    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    // Build CSV content
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n')

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coaching-clients-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Filter and search clients
  const filteredClients = clients.filter((client) => {
    // Status filter
    if (statusFilter !== 'all' && client.client_status !== statusFilter) {
      return false
    }
    // Search filter (name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        client.client_name.toLowerCase().includes(query) ||
        client.client_email.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-8 max-w-md w-full border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Add New Client
            </h3>
            <form onSubmit={handleAddClient}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="clientName"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter client's full name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="client@example.com"
                    required
                  />
                </div>
              </div>

              {addError && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {addError}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewClientName('')
                    setNewClientEmail('')
                    setAddError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addingClient}>
                  {addingClient ? 'Adding...' : 'Add Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingClientId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-8 max-w-md w-full border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Remove Client?
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this client? This will delete their
              session and any assessment data. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingClientId(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClient(deletingClientId)}
              >
                Remove Client
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Clients</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage assessment sessions for your coaching clients
            </p>
          </div>
          <div className="flex gap-3">
            {clients.length > 0 && (
              <Button variant="outline" onClick={handleExportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-8 py-8">
        {/* Back Link */}
        <Link
          href="/dashboard/coaching"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Coaching Dashboard
        </Link>

        {/* Filter and Search Bar */}
        {clients.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Statuses</option>
                <option value="registered">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}

        {/* Clients List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading clients...</p>
          </div>
        ) : error ? (
          <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No clients yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              Add your first client to start conducting assessments.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {filteredClients.length === clients.length
                  ? `${clients.length} Client${clients.length !== 1 ? 's' : ''}`
                  : `${filteredClients.length} of ${clients.length} Client${clients.length !== 1 ? 's' : ''}`}
              </h2>
              {(statusFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setSearchQuery('')
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Clear filters
                </button>
              )}
            </div>
            {filteredClients.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No matching clients
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-card border border-border rounded-lg p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {client.client_name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                          client.client_status
                        )}`}
                      >
                        {getStatusIcon(client.client_status)}
                        {getStatusLabel(client.client_status)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {client.client_email}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span suppressHydrationWarning>
                        Added {new Date(client.created_at).toLocaleDateString()}
                      </span>
                      {client.completed_at && (
                        <>
                          <span className="text-border">|</span>
                          <span suppressHydrationWarning>
                            Completed{' '}
                            {new Date(client.completed_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Report and Download PDF - only show for completed clients */}
                    {client.client_status === 'completed' && (
                      <>
                        <a
                          href={getReportUrl(client.access_token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                          title="View report"
                        >
                          <FileText className="w-4 h-4" />
                          View Report
                        </a>
                        <button
                          onClick={() => handleDownloadPdf(client)}
                          disabled={downloadingPdf === client.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloadingPdf === client.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {downloadingPdf === client.id ? 'Generating...' : 'PDF'}
                        </button>
                      </>
                    )}

                    {/* Send Invite Email - only show for clients who haven't completed */}
                    {client.client_status !== 'completed' && (
                      <button
                        onClick={() => handleSendInvite(client)}
                        disabled={sendingInvite === client.id}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                        title={inviteSent === client.id ? 'Invite sent!' : 'Send invite email'}
                      >
                        {sendingInvite === client.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : inviteSent === client.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Copy Session Link */}
                    <button
                      onClick={() => copySessionLink(client.access_token)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Copy session link"
                    >
                      {copiedToken === client.access_token ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Open Session Link */}
                    <a
                      href={getSessionUrl(client.access_token)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Open session"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        setDeletingClientId(client.id)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Remove client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
