'use client'

import { useState, useEffect, useRef } from 'react'
import { apiUrl } from '@/lib/api-url'
import { useParams } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Session {
  id: string
  stakeholder_name: string
  stakeholder_email: string
  stakeholder_title: string
  status: string
  metadata: {
    company_name: string
    project_id: string
    type: string
  }
  agentSessionId: string
}

interface ConversationState {
  phase: string
  questions_asked: number
  is_complete?: boolean
  draft_testimonial?: string
  approved_testimonial?: string
  rating?: number
}

export default function TestimonialPage() {
  const params = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationState, setConversationState] = useState<ConversationState | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isResuming, setIsResuming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSession()
  }, [params?.token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadSession() {
    try {
      setLoading(true)
      const response = await fetch(apiUrl(`api/testimonial/${params?.token}`))
      const data = await response.json()

      if (data.success) {
        setSession(data.session)

        // If session is completed, show completion message
        if (data.session.status === 'completed') {
          setIsComplete(true)
          if (data.conversationHistory?.length > 0) {
            setMessages(data.conversationHistory)
            setConversationState(data.conversationState)
          }
          return
        }

        // Check if resuming an existing conversation
        if (data.isResuming && data.conversationHistory?.length > 0) {
          setMessages(data.conversationHistory)
          setConversationState(data.conversationState)
          setIsResuming(true)

          if (data.conversationState?.is_complete) {
            setIsComplete(true)
          }
        } else {
          // Initialize new conversation with greeting
          await sendMessage(null, data.session.agentSessionId)
        }
      } else {
        setError(data.error || 'Invalid or expired access link')
      }
    } catch (err) {
      setError('Error loading session')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(message: string | null, agentSessionId?: string) {
    if (!session && !agentSessionId) return
    const sessionId = agentSessionId || session?.agentSessionId

    try {
      setSending(true)

      // Add user message to UI if provided
      if (message) {
        const userMessage: Message = {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
      }

      const response = await fetch(apiUrl(`api/testimonial/${params?.token}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          agentSessionId: sessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
        setConversationState(data.conversationState)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-r-transparent"></div>
          <p className="text-slate-400 mt-4">Loading your session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md text-center">
          <svg
            className="mx-auto h-12 w-12 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-white">{error}</h2>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 flex-shrink-0 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Innovaas Logo */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Share Your Experience
                </h1>
                <p className="text-sm text-slate-400">
                  {session.metadata.company_name || 'Customer Success'}
                </p>
              </div>
            </div>
            {conversationState && !isComplete && (
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-slate-400">
                    {conversationState.phase === 'greeting' ? 'Getting started' :
                     conversationState.phase === 'challenge' ? 'Your challenge' :
                     conversationState.phase === 'experience' ? 'Your experience' :
                     conversationState.phase === 'results' ? 'Results achieved' :
                     conversationState.phase === 'recommendation' ? 'Your recommendation' :
                     conversationState.phase === 'synthesis' ? 'Creating testimonial' :
                     conversationState.phase === 'review' ? 'Review & approve' :
                     conversationState.phase === 'rating' ? 'Final step' :
                     'In progress'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Resume Message */}
      {isResuming && messages.length > 0 && !isComplete && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-sm text-teal-300">
                Welcome back! Continuing where you left off.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700/50 text-slate-100'
                }`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      Customer Success
                    </span>
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input or Completion */}
      <div className="flex-shrink-0 bg-slate-800/50 backdrop-blur border-t border-slate-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {isComplete ? (
            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-slate-300">
                Your testimonial has been submitted. We truly appreciate you taking the time to share your experience with us.
              </p>
              {conversationState?.rating && (
                <div className="mt-4 flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${star <= conversationState.rating! ? 'text-yellow-400' : 'text-slate-600'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              )}
              <p className="text-sm text-slate-500 mt-4">
                You may now close this window.
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
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sending || messages.length === 0}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Your responses will be used to create your testimonial
              </p>
            </>
          )}
        </div>
      </div>

      {/* Powered by Innovaas */}
      <div className="bg-slate-900 border-t border-slate-800 py-3">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            Powered by <span className="text-orange-400 font-medium">Innovaas</span> FlowForge
          </p>
        </div>
      </div>
    </div>
  )
}
