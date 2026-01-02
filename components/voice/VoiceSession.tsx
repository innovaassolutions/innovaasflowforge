'use client'

/**
 * VoiceSession Component
 *
 * Manages a hybrid voice + text conversation session with ElevenLabs Conversational AI.
 * Uses the @elevenlabs/react SDK's useConversation hook with WebRTC connection
 * for better stability and built-in echo cancellation.
 *
 * Prerequisites:
 * 1. Install the ElevenLabs React SDK: npm install @elevenlabs/react
 * 2. Configure ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in environment
 * 3. Configure ELEVENLABS_LLM_SECRET for the custom LLM endpoint
 *
 * Reference: docs/research-technical-2025-12-31.md (Appendix A)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useConversation } from '@elevenlabs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, Phone, PhoneOff, Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiUrl } from '@/lib/api-url'
import type { SignedUrlResponse } from '@/lib/types/voice'

// ============================================================================
// TYPES
// ============================================================================

interface VoiceSessionProps {
  sessionToken: string
  moduleId?: string
  onSessionEnd?: (completed: boolean) => void // completed=true means interview finished properly
  onError?: (error: string) => void
  className?: string
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// ============================================================================
// COMPONENT
// ============================================================================

export function VoiceSession({
  sessionToken,
  moduleId,
  onSessionEnd,
  onError,
  className,
}: VoiceSessionProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isSendingText, setIsSendingText] = useState(false)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationSecondsRef = useRef<number>(0)
  const hadErrorRef = useRef<boolean>(false)
  const textInputRef = useRef<HTMLInputElement>(null)
  const minDurationForComplete = 30 // Minimum 30 seconds for a valid interview

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('[VoiceSession] Connected')
      setConnectionStatus('connected')
      setError(null)
      hadErrorRef.current = false
      startDurationTracking()
    },
    onDisconnect: () => {
      const finalDuration = durationSecondsRef.current
      console.log('[VoiceSession] Disconnected - duration:', finalDuration, 'hadError:', hadErrorRef.current)
      setConnectionStatus('disconnected')
      stopDurationTracking()
      // Only mark as complete if:
      // 1. No errors occurred
      // 2. Session lasted at least 30 seconds (basic sanity check for real interview)
      const wasCompleted = !hadErrorRef.current && finalDuration >= minDurationForComplete
      console.log('[VoiceSession] Session end - completed:', wasCompleted)
      onSessionEnd?.(wasCompleted)
    },
    onError: (err) => {
      const message = typeof err === 'string' ? err : (err as Error)?.message || 'Voice session error'
      console.error('[VoiceSession] Error:', message)
      hadErrorRef.current = true
      setError(message)
      setConnectionStatus('error')
      onError?.(message)
    },
    onModeChange: ({ mode }) => {
      // Mode is 'speaking' or 'listening'
      console.log('[VoiceSession] Agent mode:', mode)
    },
  })

  // Fetch signed URL from our API
  const fetchSignedUrl = useCallback(async (): Promise<SignedUrlResponse> => {
    const response = await fetch(apiUrl('api/voice/signed-url'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, moduleId }),
    })

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text()

    if (!responseText) {
      throw new Error('Empty response from voice service')
    }

    let data: SignedUrlResponse
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('Failed to parse voice response:', responseText)
      throw new Error('Invalid response from voice service')
    }

    if (!response.ok) {
      throw new Error((data as { error?: string }).error || 'Failed to get voice session URL')
    }

    return data
  }, [sessionToken, moduleId])

  // Start the voice session
  const startSession = useCallback(async () => {
    try {
      setConnectionStatus('connecting')
      setError(null)

      // Get signed URL
      const urlData = await fetchSignedUrl()

      // Start conversation with signed URL
      // dynamicVariables is a top-level property in the SDK
      // Filter out undefined values to match SDK type expectations
      const dynamicVars: Record<string, string | number | boolean> = {}
      for (const [key, value] of Object.entries(urlData.dynamicVariables)) {
        if (value !== undefined) {
          dynamicVars[key] = value
        }
      }

      console.log('[VoiceSession] Starting with firstMessage length:', urlData.firstMessage?.length)

      // Use WebRTC connection type for better stability
      // WebSocket has known issues: https://github.com/elevenlabs/elevenlabs-examples/issues/134
      await conversation.startSession({
        conversationToken: urlData.conversationToken,
        connectionType: 'webrtc',
        dynamicVariables: dynamicVars,
        clientTools: {},
        // Pass personalized greeting as firstMessage override
        // This overrides any First Message set in ElevenLabs dashboard
        overrides: {
          agent: {
            firstMessage: urlData.firstMessage,
          },
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start voice session'
      setError(message)
      setConnectionStatus('error')
      onError?.(message)
    }
  }, [fetchSignedUrl, conversation, onError])

  // End the voice session
  const endSession = useCallback(async () => {
    try {
      await conversation.endSession()
      stopDurationTracking()

      // Track voice usage
      if (durationSeconds > 0) {
        await fetch(apiUrl('api/voice/usage'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken,
            durationSeconds,
          }),
        }).catch(console.error)
      }

      // User manually ended the session - not a complete interview
      onSessionEnd?.(false)
    } catch (err) {
      console.error('Error ending voice session:', err)
    }
  }, [conversation, sessionToken, durationSeconds, onSessionEnd])

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted
    conversation.setVolume({ volume: newMuted ? 0 : 1 })
    setIsMuted(newMuted)
  }, [conversation, isMuted])

  // Send text message
  const sendTextMessage = useCallback(async () => {
    const message = textInput.trim()
    if (!message || isSendingText || connectionStatus !== 'connected') return

    try {
      setIsSendingText(true)
      // Use ElevenLabs SDK to send text message
      // sendUserMessage sends text as if the user had spoken it
      await conversation.sendUserMessage(message)
      setTextInput('')
      console.log('[VoiceSession] Sent text message:', message.substring(0, 50))
    } catch (err) {
      console.error('[VoiceSession] Error sending text:', err)
      onError?.('Failed to send text message')
    } finally {
      setIsSendingText(false)
    }
  }, [textInput, isSendingText, connectionStatus, conversation, onError])

  // Handle Enter key in text input
  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendTextMessage()
      }
    },
    [sendTextMessage]
  )

  // Duration tracking
  const startDurationTracking = useCallback(() => {
    durationSecondsRef.current = 0
    durationIntervalRef.current = setInterval(() => {
      durationSecondsRef.current += 1
      setDurationSeconds(durationSecondsRef.current)
    }, 1000)
  }, [])

  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTracking()
      if (conversation.status === 'connected') {
        conversation.endSession().catch(console.error)
      }
    }
  }, [stopDurationTracking, conversation])

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get status display text
  const getStatusText = (): string => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        if (conversation.isSpeaking) return 'Speaking...'
        return 'Listening...'
      case 'error':
        return error || 'Error'
      default:
        return 'Ready to start'
    }
  }

  // Get status color
  const getStatusColor = (): string => {
    switch (connectionStatus) {
      case 'connecting':
        return 'text-yellow-600'
      case 'connected':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 p-6 rounded-lg border bg-card',
        className
      )}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            connectionStatus === 'connected'
              ? 'bg-green-500 animate-pulse'
              : connectionStatus === 'connecting'
                ? 'bg-yellow-500 animate-pulse'
                : connectionStatus === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-300'
          )}
        />
        <span className={cn('text-sm font-medium', getStatusColor())}>
          {getStatusText()}
        </span>
      </div>

      {/* Duration display */}
      {connectionStatus === 'connected' && (
        <div className="text-2xl font-mono text-muted-foreground">
          {formatDuration(durationSeconds)}
        </div>
      )}

      {/* Voice visualization placeholder */}
      {connectionStatus === 'connected' && (
        <div className="flex items-center gap-1 h-12">
          {conversation.isSpeaking ? (
            // Speaking animation
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 20}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            // Listening indicator
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mic className="w-5 h-5 animate-pulse" />
              <span className="text-sm">Speak now...</span>
            </div>
          )}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center gap-3">
        {connectionStatus === 'disconnected' && (
          <Button
            onClick={startSession}
            size="lg"
            className="gap-2"
          >
            <Phone className="w-5 h-5" />
            Start Voice Session
          </Button>
        )}

        {connectionStatus === 'connecting' && (
          <Button disabled size="lg" className="gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting...
          </Button>
        )}

        {connectionStatus === 'connected' && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className={cn(isMuted && 'bg-red-100 border-red-300')}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-red-600" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={endSession}
              className="gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              End Session
            </Button>
          </>
        )}

        {connectionStatus === 'error' && (
          <Button onClick={startSession} size="lg" className="gap-2">
            <Phone className="w-5 h-5" />
            Try Again
          </Button>
        )}
      </div>

      {/* Text input - always available during voice session */}
      {connectionStatus === 'connected' && (
        <div className="flex items-center gap-2 w-full max-w-md">
          <Input
            ref={textInputRef}
            type="text"
            placeholder="Or type your response here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleTextKeyDown}
            disabled={isSendingText}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendTextMessage}
            disabled={!textInput.trim() || isSendingText}
            title="Send message"
          >
            {isSendingText ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && connectionStatus === 'error' && (
        <div className="text-sm text-red-600 text-center max-w-sm">
          {error}
        </div>
      )}

      {/* Voice tips */}
      {connectionStatus === 'disconnected' && (
        <div className="text-xs text-muted-foreground text-center max-w-sm">
          Speak naturally with the AI interviewer. Your conversation will be
          transcribed and processed in real-time. You can also type messages
          using the chat button if needed.
        </div>
      )}
    </div>
  )
}

export default VoiceSession
