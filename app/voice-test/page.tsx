'use client'

/**
 * Voice Test Page - Minimal implementation for debugging
 *
 * This is a stripped-down voice session page to isolate connection issues.
 * Uses the test agent with 30-second turn timeout.
 *
 * Access at: /voice-test
 */

import { useState, useCallback } from 'react'
import { useConversation } from '@elevenlabs/react'
import { Button } from '@/components/ui/button'
import { apiUrl } from '@/lib/api-url'

export default function VoiceTestPage() {
  const [status, setStatus] = useState<string>('idle')
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString().substring(11, 23)
    console.log(`[VoiceTest] ${message}`)
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }, [])

  const conversation = useConversation({
    onConnect: () => {
      addLog('✅ CONNECTED')
      addLog(`Status: ${conversation.status}`)
      addLog(`isSpeaking: ${conversation.isSpeaking}`)
      setStatus('connected')

      // Try to set max volume
      try {
        conversation.setVolume({ volume: 1 })
        addLog('Volume set to 1')
      } catch (e) {
        addLog(`Volume error: ${e}`)
      }

      // Start monitoring input/output volumes
      let monitorCount = 0
      const volumeMonitor = setInterval(() => {
        monitorCount++
        try {
          const outVol = conversation.getOutputVolume?.()
          const inVol = conversation.getInputVolume?.()
          addLog(`📊 Vol[${monitorCount}] out: ${outVol?.toFixed(3)} in: ${inVol?.toFixed(3)}`)

          // Warn if no input after 3 seconds
          if (monitorCount > 3 && (inVol === 0 || inVol === undefined)) {
            addLog('⚠️ WARNING: No microphone input detected!')
          }
        } catch (e) {
          addLog(`Volume monitor error: ${e}`)
        }

        // Stop after 30 seconds
        if (monitorCount >= 30) {
          clearInterval(volumeMonitor)
        }
      }, 1000)

      // Store the interval for cleanup
      ;(window as unknown as { _volumeMonitor?: NodeJS.Timeout })._volumeMonitor = volumeMonitor
    },
    onDisconnect: () => {
      addLog('❌ DISCONNECTED')
      addLog(`Final status: ${conversation.status}`)
      setStatus('disconnected')

      // Stop volume monitoring
      const win = window as unknown as { _volumeMonitor?: NodeJS.Timeout }
      if (win._volumeMonitor) {
        clearInterval(win._volumeMonitor)
        win._volumeMonitor = undefined
      }
    },
    onError: (err) => {
      const msg = typeof err === 'string' ? err : (err as Error)?.message || 'Unknown error'
      addLog(`🔴 ERROR: ${msg}`)
      setError(msg)
      setStatus('error')
    },
    onModeChange: ({ mode }) => {
      addLog(`Mode changed: ${mode}`)
    },
    onMessage: (message) => {
      addLog(`Message: ${JSON.stringify(message).substring(0, 100)}...`)
    },
    onStatusChange: (status) => {
      addLog(`Status change: ${JSON.stringify(status)}`)
    },
    onAudio: (audio) => {
      if (audio) {
        addLog(`🔊 Audio received: ${audio.length} bytes`)
      }
    },
  })

  const startSession = useCallback(async () => {
    try {
      setStatus('connecting')
      setError(null)
      setLogs([])
      addLog('Starting session...')

      // Check microphone permission BEFORE starting
      addLog('Checking microphone permission...')
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        addLog(`Microphone permission: ${permissionStatus.state}`)

        if (permissionStatus.state === 'denied') {
          throw new Error('Microphone permission denied. Please enable in browser settings.')
        }

        // If not granted, request access
        if (permissionStatus.state !== 'granted') {
          addLog('Requesting microphone access...')
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          addLog(`Microphone stream obtained: ${stream.getAudioTracks().length} audio tracks`)

          // Get track settings for debugging
          const track = stream.getAudioTracks()[0]
          if (track) {
            const settings = track.getSettings()
            addLog(`Audio track: ${track.label}, enabled: ${track.enabled}`)
            addLog(`Sample rate: ${settings.sampleRate}, channels: ${settings.channelCount}`)
          }

          // Stop the stream - SDK will create its own
          stream.getTracks().forEach(t => t.stop())
          addLog('Test stream stopped (SDK will create its own)')
        }
      } catch (e) {
        addLog(`Microphone error: ${e instanceof Error ? e.message : e}`)
        // Continue anyway - SDK might handle it differently
      }

      // Resume audio context (browser autoplay policy)
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
        if (AudioContext) {
          const ctx = new AudioContext()
          addLog(`Audio context state: ${ctx.state}`)
          if (ctx.state === 'suspended') {
            await ctx.resume()
            addLog('Audio context resumed')
          }
          await ctx.close()
        }
      } catch (e) {
        addLog(`Audio context error: ${e}`)
      }

      // Get test session token
      addLog('Fetching test session token...')
      const response = await fetch(apiUrl('api/voice/test-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`API error: ${response.status} - ${text}`)
      }

      const data = await response.json()
      addLog(`Got token for agent: ${data.agentId}`)

      // Start with MINIMAL config - just token and connection type
      addLog('Starting conversation with WebRTC...')
      await conversation.startSession({
        conversationToken: data.conversationToken,
        connectionType: 'webrtc',
        // No dynamic variables
        // No overrides
        // No client tools
      })

      addLog('startSession() completed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      addLog(`Start failed: ${msg}`)
      setError(msg)
      setStatus('error')
    }
  }, [addLog, conversation])

  const endSession = useCallback(async () => {
    try {
      addLog('Ending session...')
      await conversation.endSession()
    } catch (err) {
      addLog(`End error: ${err}`)
    }
  }, [addLog, conversation])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h1 className="text-2xl font-bold mb-4">Voice Test Page</h1>
          <p className="text-gray-600 mb-4">
            Minimal voice session for debugging. Uses test agent with 30-second turn timeout.
          </p>

          {/* Status indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-4 h-4 rounded-full ${
              status === 'connected' ? 'bg-green-500 animate-pulse' :
              status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              status === 'error' ? 'bg-red-500' :
              'bg-gray-300'
            }`} />
            <span className="font-medium capitalize">{status}</span>
            {conversation.isSpeaking && <span className="text-sm text-gray-500">(speaking)</span>}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            {status !== 'connected' && status !== 'connecting' && (
              <Button onClick={startSession}>
                Start Voice Session
              </Button>
            )}
            {status === 'connecting' && (
              <Button disabled>
                Connecting...
              </Button>
            )}
            {status === 'connected' && (
              <Button variant="destructive" onClick={endSession}>
                End Session
              </Button>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-96 overflow-y-auto">
          <h2 className="text-white mb-2">Debug Logs:</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click Start to begin.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm">
          <h3 className="font-bold mb-2">Testing Instructions:</h3>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Click &quot;Start Voice Session&quot;</li>
            <li>Grant microphone permission if prompted</li>
            <li>The agent should say: &quot;Hello! This is a test message...&quot;</li>
            <li>You have 30 seconds to respond before timeout</li>
            <li>Watch the logs for any disconnect messages</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
