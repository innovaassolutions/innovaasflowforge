'use client'

/**
 * AIIllustration Component
 *
 * Displays AI-generated illustrations with loading states and fallbacks.
 * Uses Google Gemini to create custom SVG visualizations.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { useState, useEffect } from 'react'
import type { IllustrationOptions } from '@/lib/ai'

interface AIIllustrationProps {
  prompt: string
  options?: IllustrationOptions
  className?: string
  alt?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function AIIllustration({
  prompt,
  options = {},
  className = '',
  alt,
  onLoad,
  onError
}: AIIllustrationProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadIllustration() {
      setIsLoading(true)
      setError(null)

      try {
        // Call API route to generate illustration
        const response = await fetch('/api/illustrations/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
            options
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to generate illustration: ${response.statusText}`)
        }

        const data = await response.json()

        if (!mounted) return

        setSvgContent(data.svg)
        setIsLoading(false)

        if (onLoad) {
          onLoad()
        }
      } catch (err) {
        if (!mounted) return

        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        setIsLoading(false)

        if (onError) {
          onError(error)
        }

        console.error('[AIIllustration] Failed to load illustration:', error)
      }
    }

    loadIllustration()

    return () => {
      mounted = false
    }
  }, [prompt, JSON.stringify(options)]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-mocha-surface0 rounded-lg ${className}`}>
        <div className="text-center space-y-3 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-mocha-surface2 border-t-brand-orange mx-auto" />
          <p className="text-mocha-subtext1 text-sm">Generating illustration...</p>
        </div>
      </div>
    )
  }

  if (error || !svgContent) {
    return (
      <div className={`flex items-center justify-center bg-mocha-surface0 rounded-lg ${className}`}>
        <div className="text-center space-y-2 p-8">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className="mx-auto text-mocha-subtext0"
          >
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path
              d="M32 16v16m0 8h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-mocha-subtext1 text-sm">
            {error?.message || 'Failed to load illustration'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <figure
      className={`overflow-hidden rounded-lg ${className}`}
      role="img"
      aria-label={alt || prompt}
    >
      <div
        dangerouslySetInnerHTML={{ __html: svgContent }}
        className="w-full h-full [&>svg]:w-full [&>svg]:h-auto"
      />
      {alt && (
        <figcaption className="sr-only">{alt}</figcaption>
      )}
    </figure>
  )
}
