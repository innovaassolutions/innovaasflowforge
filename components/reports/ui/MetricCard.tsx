'use client'

/**
 * MetricCard Component
 *
 * Dashboard metric card displaying key metrics with icons and optional trends.
 * Used in executive summary and overview sections.
 *
 * Part of Report Visual Transformation spec
 */

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color?: string
  tooltip?: string
  className?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  color = '#F25C05',
  tooltip,
  className = ''
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'

  return (
    <div
      className={`bg-card rounded-lg p-6 border border-border hover:border-primary/30 transition-colors ${className}`}
      role="article"
      aria-label={`${label}: ${value}`}
      title={tooltip}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Icon size={24} style={{ color }} />
          {trend && (
            <div className="flex items-center gap-1">
              <TrendIcon size={16} style={{ color: trendColor }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
