'use client'

/**
 * Archetype Interview Session Page
 *
 * AI-facilitated conversation for leadership archetype discovery.
 * Follows the 19-question interview flow from archetype-constitution.ts.
 *
 * Story: 3-3-registration-sessions
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTenantPaths } from '@/lib/hooks/use-tenant-paths'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface SessionData {
  id: string
  stakeholder_name: string
  stakeholder_email: string
  status: string
  client_status: string
}

interface SessionState {
  phase: string
  current_question_index: number
  is_complete: boolean
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const { buildPath } = useTenantPaths()

  const slug = params?.slug as string
  const token = params?.token as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isResuming, setIsResuming] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSession()
  }, [token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadSession() {
    try {
      setLoading(true)
      const response = await fetch(`/api/coach/${slug}/session/${token}`)
      const data = await response.json()

      if (data.success) {
        setSession(data.session)

        // If session is completed, redirect to results page
        if (data.session.client_status === 'completed') {
          router.push(buildPath(`/results/${token}`))
          return
        }

        // Check if resuming an existing conversation
        if (data.isResuming && data.conversationHistory?.length > 0) {
          setMessages(data.conversationHistory)
          setSessionState(data.sessionState)
          setIsResuming(true)

          if (data.sessionState?.is_complete) {
            setIsComplete(true)
          }
        } else {
          // Initialize new conversation with greeting
          await sendMessage(null)
        }
      } else {
        setError(data.error || 'Invalid or expired session link')
      }
    } catch (err) {
      setError('Error loading session')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(message: string | null) {
    try {
      setSending(true)

      // Add user message to UI if provided
      if (message) {
        const userMessage: Message = {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, userMessage])
        setInputMessage('')
      }

      const response = await fetch(`/api/coach/${slug}/session/${token}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (data.success) {
        // Add assistant response
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setSessionState(data.sessionState)

        // Check if interview is complete - redirect to results page
        if (data.isComplete) {
          // Short delay to show the final AI message before redirecting
          setTimeout(() => {
            router.push(buildPath(`/results/${token}`))
          }, 2000)
          setIsComplete(true)
        }
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (err) {
      setError('Error sending message')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputMessage.trim() || sending) return
    sendMessage(inputMessage)
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function getProgressPercentage(): number {
    if (!sessionState) return 0
    return Math.round((sessionState.current_question_index / 19) * 100)
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--brand-bg)' }}
      >
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"
            style={{ borderColor: 'var(--brand-primary)', borderRightColor: 'transparent' }}
          />
          <p className="mt-4" style={{ color: 'var(--brand-text-muted)' }}>
            Loading your session...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--brand-bg)' }}
      >
        <div
          className="rounded-xl p-8 max-w-md text-center"
          style={{
            backgroundColor: 'var(--brand-bg-subtle)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <svg
            className="mx-auto h-12 w-12"
            style={{ color: 'var(--brand-primary)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2
            className="mt-4 text-xl font-semibold"
            style={{ color: 'var(--brand-text)' }}
          >
            {error}
          </h2>
          <p className="mt-2" style={{ color: 'var(--brand-text-muted)' }}>
            Please contact {tenant.display_name} for assistance.
          </p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--brand-bg)' }}
    >
      {/* Header - Sticky to show progress while scrolling */}
      <header
        className="flex-shrink-0 border-b sticky top-0 z-10"
        style={{
          backgroundColor: 'var(--brand-bg)',
          borderColor: 'var(--brand-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              {tenant.brand_config.logo?.url ? (
                <Image
                  src={tenant.brand_config.logo.url}
                  alt={tenant.brand_config.logo.alt || tenant.display_name}
                  width={240}
                  height={96}
                  className="h-20 sm:h-24 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <h1
                  className="text-xl font-bold"
                  style={{
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--brand-font-heading)',
                  }}
                >
                  {tenant.display_name}
                </h1>
              )}
            </div>
            {sessionState && !isComplete && (
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                  Progress
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-24 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--brand-border)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${getProgressPercentage()}%`,
                        backgroundColor: 'var(--brand-primary)',
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    {getProgressPercentage()}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Resume Message */}
      {isResuming && messages.length > 0 && !isComplete && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div
            className="rounded-lg p-4 text-center"
            style={{
              backgroundColor: 'var(--brand-bg-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <p style={{ color: 'var(--brand-text)' }}>
              Welcome back, {session.stakeholder_name}! Your conversation has been
              restored.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-3xl rounded-xl px-6 py-4"
                style={{
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--brand-primary)'
                      : 'var(--brand-bg-subtle)',
                  color: message.role === 'user' ? 'white' : 'var(--brand-text)',
                  border:
                    message.role === 'assistant'
                      ? '1px solid var(--brand-border)'
                      : 'none',
                }}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--brand-secondary, var(--brand-primary))' }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--brand-text-muted)' }}
                    >
                      Leadership Guide
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                <p
                  className="text-xs mt-2"
                  style={{
                    color:
                      message.role === 'user'
                        ? 'rgba(255,255,255,0.7)'
                        : 'var(--brand-text-muted)',
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div
                className="rounded-xl px-6 py-4"
                style={{
                  backgroundColor: 'var(--brand-bg-subtle)',
                  border: '1px solid var(--brand-border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                  <span style={{ color: 'var(--brand-text-muted)' }}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input or Completion */}
      <div
        className="flex-shrink-0 border-t"
        style={{
          backgroundColor: 'var(--brand-bg-subtle)',
          borderColor: 'var(--brand-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {isComplete ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: 'var(--brand-bg)',
                border: '1px solid var(--brand-border)',
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div
                  className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-r-transparent"
                  style={{ borderColor: 'var(--brand-primary)', borderRightColor: 'transparent' }}
                />
                <h3
                  className="text-2xl font-bold"
                  style={{
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--brand-font-heading)',
                  }}
                >
                  Assessment Complete!
                </h3>
              </div>
              <p style={{ color: 'var(--brand-text)' }}>
                Taking you to your results...
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending || messages.length === 0}
                  placeholder="Type your response..."
                  className="flex-1 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--brand-bg)',
                    border: '1px solid var(--brand-border)',
                    color: 'var(--brand-text)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sending || messages.length === 0}
                  className="font-semibold px-6 py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                  }}
                >
                  Send
                </button>
              </form>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs" style={{ color: 'var(--brand-text-muted)' }}>
                  Your responses are confidential.
                </p>
                <p className="text-xs" style={{ color: 'var(--brand-text-muted)' }}>
                  You can close and resume later using the same link.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
