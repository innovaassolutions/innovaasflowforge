'use client'

/**
 * ProgressBar Component
 *
 * Visual progress bar showing maturity level advancement.
 * CSS-based component (not Recharts).
 *
 * Part of Report Visual Transformation spec
 */

import type { ProgressDataPoint } from '@/lib/chart-data-transformers'
import { getScoreColor } from '@/lib/chart-data-transformers'

interface ProgressBarProps {
  data: ProgressDataPoint
  className?: string
}

export function ProgressBar({ data, className = '' }: ProgressBarProps) {
  const { current, target, percentage, level } = data
  const color = getScoreColor(current)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-mocha-text">{level}</span>
        <span className="text-mocha-subtext0">
          {current.toFixed(1)} / {target.toFixed(1)}
        </span>
      </div>

      <div className="relative w-full h-3 bg-mocha-surface1 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={target}
          aria-label={`Progress to ${level} level: ${percentage.toFixed(0)}%`}
        />
      </div>

      <p className="text-xs text-mocha-subtext1">
        {percentage < 100 ? (
          <>
            {(target - current).toFixed(1)} points to {getNextLevelName(target)}
          </>
        ) : (
          'Maximum level achieved'
        )}
      </p>
    </div>
  )
}

function getNextLevelName(targetScore: number): string {
  if (targetScore === 1) return 'Beginner'
  if (targetScore === 2) return 'Intermediate'
  if (targetScore === 3) return 'Experienced'
  if (targetScore === 4) return 'Expert'
  if (targetScore === 5) return 'Leader'
  return 'Next Level'
}
