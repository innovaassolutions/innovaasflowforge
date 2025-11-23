/**
 * ConsultingSection Component
 *
 * Section wrapper with professional spacing and structure.
 * Implements McKinsey/BCG visual hierarchy standards.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { ReactNode } from 'react'
import { gridConfig, visualAccents } from '@/lib/layout/consulting-grid'

interface ConsultingSectionProps {
  children: ReactNode
  spacing?: 'normal' | 'narrow' | 'wide'
  divider?: boolean
  accent?: boolean
  className?: string
  id?: string
}

export function ConsultingSection({
  children,
  spacing = 'normal',
  divider = false,
  accent = false,
  className = ''
}: ConsultingSectionProps) {
  const spacingClass = {
    narrow: 'py-15', // 60px
    normal: 'py-25', // 100px
    wide: 'py-32' // 128px
  }[spacing]

  const dividerClass = divider
    ? accent
      ? visualAccents.dividerAccent
      : visualAccents.dividerThick
    : ''

  return (
    <section className={`${spacingClass} ${dividerClass} ${className}`}>
      {children}
    </section>
  )
}

/**
 * Content block with consistent spacing
 */
interface ContentBlockProps {
  children: ReactNode
  className?: string
}

export function ContentBlock({ children, className = '' }: ContentBlockProps) {
  return (
    <div className={`mb-15 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Callout box with visual treatment
 */
interface CalloutSectionProps {
  children: ReactNode
  variant?: 'info' | 'warning' | 'success' | 'neutral'
  className?: string
}

export function CalloutSection({
  children,
  variant = 'info',
  className = ''
}: CalloutSectionProps) {
  const variantClass = {
    info: visualAccents.calloutInfo,
    warning: visualAccents.calloutWarning,
    success: visualAccents.calloutSuccess,
    neutral: visualAccents.card
  }[variant]

  return (
    <aside className={`${variantClass} ${className}`}>
      {children}
    </aside>
  )
}

/**
 * Pull quote with visual emphasis
 */
interface PullQuoteProps {
  children: ReactNode
  author?: string
  className?: string
}

export function PullQuote({ children, author, className = '' }: PullQuoteProps) {
  return (
    <blockquote className={`${visualAccents.pullQuote} my-10 ${className}`}>
      {children}
      {author && (
        <footer className="text-base not-italic text-mocha-subtext0 mt-4">
          — {author}
        </footer>
      )}
    </blockquote>
  )
}

/**
 * Visual divider with optional label
 */
interface DividerProps {
  label?: string
  accent?: boolean
  className?: string
}

export function Divider({ label, accent = false, className = '' }: DividerProps) {
  const dividerClass = accent ? visualAccents.dividerAccent : visualAccents.dividerThin

  if (label) {
    return (
      <div className={`flex items-center gap-4 my-10 ${className}`}>
        <div className={`flex-1 ${dividerClass}`} />
        <span className="text-mocha-subtext1 text-sm font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className={`flex-1 ${dividerClass}`} />
      </div>
    )
  }

  return <hr className={`${dividerClass} my-10 ${className}`} />
}
