'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Bot,
  Clock,
  Hash,
  RefreshCw,
} from 'lucide-react'

interface ConversationListItem {
  id: string
  sessionType: 'industry' | 'coaching' | 'education'
  participantName: string
  participantEmail: string | null
  participantType: string
  contextName: string
  status: string
  messageCount: number
  lastActivity: string
  createdAt: string
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string | null
}

interface ConversationDetail {
  id: string
  sessionType: 'industry' | 'coaching' | 'education'
  participantName: string
  participantEmail: string | null
  participantType: string
  contextName: string
  status: string
  agentType: string
  createdAt: string
  lastActivity: string
  messages: ConversationMessage[]
}

interface ConversationsData {
  conversations: ConversationListItem[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  summary: {
    total: number
    industry: number
    coaching: number
    education: number
  }
}

type SessionTypeFilter = 'all' | 'industry' | 'coaching' | 'education'

export default function ConversationsPage() {
  const router = useRouter()
  const [data, setData] = useState<ConversationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>('all')

  // Detail panel
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (authorized) {
      loadConversations()
    }
  }, [authorized, page, typeFilter])

  async function checkAccess() {
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

    if (!profile?.user_type) {
      setLoading(false)
      return
    }

    setUserType(profile.user_type)
    setAuthorized(true)
  }

  async function loadConversations() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        type: typeFilter,
      })
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/conversations?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  async function loadDetail(id: string) {
    setSelectedId(id)
    setDetailLoading(true)
    setDetail(null)

    try {
      const response = await fetch(`/api/admin/conversations/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversation detail')
      }
      const result = await response.json()
      setDetail(result.conversation)
    } catch (err) {
      console.error('Error fetching conversation detail:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  function closePanel() {
    setSelectedId(null)
    setDetail(null)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadConversations()
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

  function formatRelativeDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function getSessionTypeBadge(type: string) {
    switch (type) {
      case 'industry':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Industry</span>
      case 'coaching':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Coaching</span>
      case 'education':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Education</span>
      default:
        return null
    }
  }

  function getStatusBadge(status: string) {
    const normalized = status.toLowerCase()
    if (['completed', 'done'].includes(normalized)) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>
    }
    if (['in_progress', 'started', 'registered'].includes(normalized)) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">In Progress</span>
    }
    if (['invited', 'pending'].includes(normalized)) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Invited</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">{status}</span>
  }

  // Determine which tabs to show based on user type
  const availableTabs: { value: SessionTypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
  ]
  if (userType === 'admin' || userType === 'consultant') {
    availableTabs.push({ value: 'industry', label: 'Industry' })
  }
  if (userType === 'admin' || userType === 'coach') {
    availableTabs.push({ value: 'coaching', label: 'Coaching' })
  }
  if (userType === 'admin' || userType === 'company') {
    availableTabs.push({ value: 'education', label: 'Education' })
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6">
          <h1 className="text-xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-primary" />
          Conversations
        </h1>
        <p className="text-muted-foreground mt-1">
          View interview transcripts from your assessments
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
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{data.summary.total}</p>
          </div>
          {(userType === 'admin' || userType === 'consultant') && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="text-2xl font-bold text-blue-600">{data.summary.industry}</p>
            </div>
          )}
          {(userType === 'admin' || userType === 'coach') && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Coaching</p>
              <p className="text-2xl font-bold text-green-600">{data.summary.coaching}</p>
            </div>
          )}
          {(userType === 'admin' || userType === 'company') && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Education</p>
              <p className="text-2xl font-bold text-purple-600">{data.summary.education}</p>
            </div>
          )}
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
                placeholder="Search by name, email, or context..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg
                           text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </form>

          {/* Type Filter Tabs */}
          {availableTabs.length > 2 && (
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {availableTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setTypeFilter(tab.value)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    typeFilter === tab.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Refresh */}
          <button
            onClick={() => loadConversations()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg
                       hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Participant</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Context</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Messages</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.conversations.map((conv) => (
                <tr
                  key={conv.id}
                  onClick={() => loadDetail(conv.id)}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                    selectedId === conv.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {conv.participantName}
                      </p>
                      {conv.participantEmail && (
                        <p className="text-xs text-muted-foreground">
                          {conv.participantEmail}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {getSessionTypeBadge(conv.sessionType)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {conv.participantType}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground truncate max-w-[200px]">
                      {conv.contextName}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Hash className="w-3 h-3" />
                      {conv.messageCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(conv.status)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeDate(conv.lastActivity)}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.conversations || data.conversations.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Conversations will appear here once participants start their assessments.
                    </p>
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
              {data.pagination.totalCount} conversations
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

      {/* Slide-over Detail Panel */}
      {selectedId && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={closePanel}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-card border-l border-border
                       shadow-xl z-50 flex flex-col overflow-hidden
                       animate-in slide-in-from-right duration-200"
          >
            {/* Panel Header */}
            <div className="flex items-start justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex-1 min-w-0">
                {detailLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading transcript...</span>
                  </div>
                ) : detail ? (
                  <>
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {detail.participantName}
                    </h2>
                    {detail.participantEmail && (
                      <p className="text-sm text-muted-foreground truncate">
                        {detail.participantEmail}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {getSessionTypeBadge(detail.sessionType)}
                      {getStatusBadge(detail.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {detail.contextName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(detail.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {detail.messages.length} messages
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Failed to load conversation</p>
                )}
              </div>
              <button
                onClick={closePanel}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {detailLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {!detailLoading && detail?.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    {/* Sender indicator */}
                    <div className={`flex items-center gap-1.5 mb-1 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Bot className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground capitalize">
                        {msg.role === 'user' ? 'Participant' : 'Assistant'}
                      </span>
                    </div>

                    {/* Message bubble */}
                    <div className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Timestamp */}
                    {msg.timestamp && (
                      <p className={`text-[10px] text-muted-foreground mt-1 ${
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {formatDate(msg.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {!detailLoading && detail && detail.messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No messages in this conversation</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
