'use client'

/**
 * CalloutBox Component
 *
 * Highlighted box for key insights and findings.
 * Supports different variants with semantic colors.
 *
 * Part of Report Visual Transformation spec
 */

import { AlertCircle, CheckCircle2, Info, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CalloutBoxProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'critical'
  title?: string
  icon?: LucideIcon
  className?: string
}

export function CalloutBox({
  children,
  variant = 'info',
  title,
  icon,
  className = ''
}: CalloutBoxProps) {
  const config = getVariantConfig(variant)
  const Icon = icon || config.icon

  return (
    <div
      className={`rounded-lg p-4 border ${className}`}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border
      }}
      role="note"
      aria-label={title || `${variant} callout`}>
      <div className="flex items-start gap-3">
        <Icon className="flex-shrink-0 mt-0.5" size={20} style={{ color: config.iconColor }} />
        <div className="flex-1">
          {title && (
            <h4 className="text-sm font-semibold mb-1" style={{ color: config.titleColor }}>
              {title}
            </h4>
          )}
          <div className="text-sm text-mocha-text leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}

function getVariantConfig(variant: string) {
  switch (variant) {
    case 'success':
      return {
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        iconColor: '#10b981',
        titleColor: '#10b981',
        icon: CheckCircle2
      }
    case 'warning':
      return {
        bg: 'rgba(234, 179, 8, 0.1)',
        border: 'rgba(234, 179, 8, 0.3)',
        iconColor: '#eab308',
        titleColor: '#eab308',
        icon: AlertCircle
      }
    case 'critical':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
        iconColor: '#ef4444',
        titleColor: '#ef4444',
        icon: AlertCircle
      }
    default: // info
      return {
        bg: 'rgba(29, 155, 163, 0.1)',
        border: 'rgba(29, 155, 163, 0.3)',
        iconColor: '#1D9BA3',
        titleColor: '#1D9BA3',
        icon: Info
      }
  }
}
