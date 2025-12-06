'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
  stakeholder_role: string
  status: string
  campaigns: {
    id: string
    name: string
    company_name: string
    facilitator_name: string
  }
  agentSessionId: string
}

interface ConversationState {
  phase: string
  questions_asked: number
  topics_covered: string[]
}

export default function StakeholderInterviewPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationState, setConversationState] = useState<ConversationState | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isResuming, setIsResuming] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSession()
  }, [params.token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadSession() {
    try {
      setLoading(true)
      const response = await fetch(`/api/sessions/${params.token}`)
      const data = await response.json()

      if (data.success) {
        setSession(data.session)

        // If session is completed, don't allow further interaction
        if (data.session.status === 'completed') {
          setError('This interview has been completed. Thank you for your participation!')
          return
        }

        // Check if resuming an existing conversation
        if (data.isResuming && data.conversationHistory?.length > 0) {
          // Restore conversation history
          setMessages(data.conversationHistory)
          setConversationState(data.conversationState)
          setIsResuming(true)

          // Check if conversation was already complete
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
      setError('Error loading interview session')
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

      const response = await fetch(`/api/sessions/${params.token}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          agentSessionId: sessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        // Add assistant response
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
        setConversationState(data.conversationState)

        // Check if interview is complete
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

  async function handleSubmitInterview() {
    if (!session) return

    try {
      setSubmitting(true)
      setShowSubmitConfirm(false)

      const response = await fetch(`/api/sessions/${params.token}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentSessionId: session.agentSessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsComplete(true)
      } else {
        setError(data.error || 'Failed to submit interview')
      }
    } catch (err) {
      setError('Error submitting interview')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mocha-base flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-r-transparent"></div>
          <p className="text-mocha-subtext1 mt-4">Loading your interview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mocha-base flex items-center justify-center p-4">
        <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-8 max-w-md text-center">
          <svg
            className="mx-auto h-12 w-12 text-brand-orange"
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
          <h2 className="mt-4 text-xl font-semibold text-mocha-text">{error}</h2>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-mocha-base flex flex-col">
      {/* Header */}
      <header className="bg-mocha-mantle border-b border-mocha-surface0 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-orange to-brand-teal bg-clip-text text-transparent">
                {session.campaigns.name}
              </h1>
              <p className="text-mocha-subtext1 mt-1">
                {session.campaigns.company_name}
              </p>
            </div>
            {conversationState && (
              <div className="text-right">
                <p className="text-sm text-mocha-subtext1">Progress</p>
                <p className="text-lg font-semibold text-brand-orange">
                  {conversationState.questions_asked}/15
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Welcome or Resume Message */}
      {messages.length === 0 && !isResuming && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-mocha-surface0 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-mocha-text">
              Welcome, {session.stakeholder_name}!
            </h2>
            <p className="text-mocha-subtext1 mt-4">
              Your AI-guided interview is ready to begin. This will take approximately 20-30 minutes.
            </p>
            <div className="mt-6 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-r-transparent"></div>
            <p className="text-mocha-subtext0 mt-3">Loading your interview...</p>
          </div>
        </div>
      )}

      {/* Resume Message */}
      {isResuming && messages.length > 0 && !isComplete && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-brand-teal/20 border border-brand-teal/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-mocha-text font-medium">
                Welcome back! Your conversation has been restored. You can continue from where you left off.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-3xl rounded-lg px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-brand-orange text-white'
                    : 'bg-mocha-surface0 text-mocha-text'
                }`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-brand-teal"></div>
                    <span className="text-xs font-medium text-mocha-subtext1">
                      Industry 4.0 Consultant
                    </span>
                  </div>
                )}
                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                  {message.content}
                </div>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-white/70' : 'text-mocha-subtext0'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-mocha-surface0 rounded-lg px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse"></div>
                  <span className="text-mocha-subtext1">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input or Completion Message */}
      <div className="flex-shrink-0 bg-mocha-mantle border-t border-mocha-surface0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {isComplete ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-green-400">Interview Complete!</h3>
              </div>
              <p className="text-mocha-text">
                Thank you for your valuable insights, {session.stakeholder_name}. Your responses have been saved and will be analyzed alongside other stakeholder perspectives.
              </p>
              <p className="text-mocha-subtext1 mt-4">
                You may now close this window. Results will be shared by {session.campaigns.facilitator_name}.
              </p>
            </div>
          ) : (
            <>
              {/* Submit Confirmation Dialog */}
              {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-mocha-text mb-3">
                      Submit Interview Early?
                    </h3>
                    <p className="text-mocha-subtext1 mb-6">
                      You've answered {conversationState?.questions_asked || 0} questions so far.
                      Are you sure you want to submit the interview now? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSubmitConfirm(false)}
                        className="flex-1 bg-mocha-surface1 hover:bg-mocha-surface2 text-mocha-text px-4 py-2 rounded-lg transition-colors"
                      >
                        Continue Interview
                      </button>
                      <button
                        onClick={handleSubmitInterview}
                        disabled={submitting}
                        className="flex-1 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {submitting ? 'Submitting...' : 'Submit Now'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending || messages.length === 0 || submitting}
                  placeholder="Type your response..."
                  className="flex-1 bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-3 text-mocha-text placeholder-mocha-overlay0 focus:outline-none focus:ring-2 focus:ring-brand-orange disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sending || messages.length === 0 || submitting}
                  className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  Send
                </button>
              </form>

              {/* Submit Interview Button (appears after 5+ questions) */}
              {conversationState && conversationState.questions_asked >= 5 && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={submitting}
                    className="text-sm text-mocha-subtext1 hover:text-brand-orange underline transition-colors disabled:opacity-50"
                  >
                    Submit interview early
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-mocha-subtext0">
                  Your responses are confidential and will be used solely for this assessment.
                </p>
                <p className="text-xs text-mocha-subtext1">
                  You can close this window anytime and resume later using the same link.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
