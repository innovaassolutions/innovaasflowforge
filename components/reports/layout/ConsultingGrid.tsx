/**
 * ConsultingGrid Component
 *
 * Professional multi-column grid layout for consulting-grade reports.
 * Implements McKinsey/BCG-style spacing and structure.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { ReactNode } from 'react'
import { gridConfig, getGridTemplateColumns } from '@/lib/layout/consulting-grid'

interface ConsultingGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | number[]
  gap?: 'small' | 'medium' | 'large'
  className?: string
}

export function ConsultingGrid({
  children,
  columns = 2,
  gap = 'large',
  className = ''
}: ConsultingGridProps) {
  // Determine grid template columns
  const templateColumns = Array.isArray(columns) ? getGridTemplateColumns(columns) : undefined

  // Gap sizes
  const gapSize = {
    small: gridConfig.elementSpacing / 4, // 10px (0.625rem)
    medium: gridConfig.blockSpacing / 4, // 15px (0.9375rem)
    large: gridConfig.gutter // 40px (2.5rem)
  }[gap]

  // Responsive columns (collapse to single column on mobile)
  const responsiveClass = typeof columns === 'number' && columns > 1
    ? 'grid-cols-1 lg:grid-cols-' + columns
    : ''

  return (
    <div
      className={`grid ${responsiveClass} ${className}`}
      style={{
        gridTemplateColumns: typeof columns === 'number' ? undefined : templateColumns,
        gap: `${gapSize}px`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Asymmetric grid for sidebar + main content layouts
 */
interface AsymmetricGridProps {
  children: ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: number
  gap?: 'small' | 'medium' | 'large'
  className?: string
}

export function AsymmetricGrid({
  children,
  sidebarPosition = 'left',
  sidebarWidth = 300,
  gap = 'large',
  className = ''
}: AsymmetricGridProps) {
  const gapSize = {
    small: gridConfig.elementSpacing / 4,
    medium: gridConfig.blockSpacing / 4,
    large: gridConfig.gutter
  }[gap]

  const gridTemplate =
    sidebarPosition === 'left'
      ? `${sidebarWidth}px 1fr`
      : `1fr ${sidebarWidth}px`

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-[${gridTemplate}] ${className}`}
      style={{
        gap: `${gapSize}px`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Hero grid for executive one-pager layouts
 */
interface HeroGridProps {
  children: ReactNode
  className?: string
}

export function HeroGrid({ children, className = '' }: HeroGridProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-12 gap-10 ${className}`}
    >
      {children}
    </div>
  )
}
