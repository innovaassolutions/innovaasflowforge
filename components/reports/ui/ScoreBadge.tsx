'use client'

/**
 * ScoreBadge Component
 *
 * Circular badge displaying score with gradient background.
 * Color-coded using traffic light system.
 *
 * Part of Report Visual Transformation spec
 */

import { getScoreColor } from '@/lib/chart-data-transformers'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  label?: string
  className?: string
}

export function ScoreBadge({
  score,
  size = 'md',
  showLabel = false,
  label = 'Score',
  className = ''
}: ScoreBadgeProps) {
  const color = getScoreColor(score)

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
    xl: 'w-40 h-40 text-4xl'
  }

  const sizeClass = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, -20)} 100%)`
        }}
        role="status"
        aria-label={`${label}: ${score.toFixed(1)} out of 5.0`}>
        {score.toFixed(1)}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  )
}

/**
 * Adjust color brightness for gradient effect
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt))
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}
