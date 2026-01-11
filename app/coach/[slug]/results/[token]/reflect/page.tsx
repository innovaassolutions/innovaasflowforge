'use client'

/**
 * Reflection Conversation Page
 *
 * AI-facilitated reflection on archetype results.
 * Follows the same UI pattern as the session page but for
 * a shorter conversation (2-3 exchanges).
 *
 * Story: 1.2 Reflection Flow
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTenant } from '@/lib/contexts/tenant-context'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ReflectionState {
  phase: string
  exchange_count: number
  is_complete: boolean
}

export default function ReflectPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()

  const slug = params?.slug as string
  const token = params?.token as string

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reflectionState, setReflectionState] = useState<ReflectionState | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReflection()
  }, [token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadReflection() {
    try {
      setLoading(true)

      // First check if there's existing reflection state
      const getResponse = await fetch(`/api/coach/${slug}/results/${token}/reflect`)
      const existingData = await getResponse.json()

      if (existingData.success && existingData.conversationHistory?.length > 0) {
        // Resume existing reflection
        setMessages(existingData.conversationHistory)
        setReflectionState(existingData.state)

        if (existingData.isComplete) {
          setIsComplete(true)
        }
      } else {
        // Start new reflection conversation
        await sendMessage(null)
      }
    } catch (err) {
      setError('Error loading reflection')
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

      const response = await fetch(`/api/coach/${slug}/results/${token}/reflect`, {
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
        setReflectionState(data.state)

        // Check if reflection is complete
        if (data.isComplete) {
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

  function handleReturnToResults() {
    router.push(`/coach/${slug}/results/${token}`)
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
            Loading your reflection...
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
          <button
            onClick={handleReturnToResults}
            className="mt-6 px-6 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
            }}
          >
            Return to Results
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--brand-bg)' }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 border-b"
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
                  width={200}
                  height={80}
                  className="h-16 sm:h-20 w-auto object-contain"
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
            <div className="text-right">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
              >
                Reflection
              </p>
              <p className="text-xs" style={{ color: 'var(--brand-text-muted)' }}>
                Go deeper into your results
              </p>
            </div>
          </div>
        </div>
      </header>

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
                      Reflection Guide
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
                <svg
                  className="h-6 w-6"
                  style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3
                  className="text-2xl font-bold"
                  style={{
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--brand-font-heading)',
                  }}
                >
                  Reflection Complete
                </h3>
              </div>
              <p className="mb-4" style={{ color: 'var(--brand-text)' }}>
                Thank you for your thoughtful reflections. These insights have been saved.
              </p>
              <button
                onClick={handleReturnToResults}
                className="px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white',
                }}
              >
                Return to Results
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending || messages.length === 0}
                  placeholder="Share your thoughts..."
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
                  Take your time. There are no right or wrong answers.
                </p>
                <button
                  onClick={handleReturnToResults}
                  className="text-xs underline"
                  style={{ color: 'var(--brand-text-muted)' }}
                >
                  Return to results
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
