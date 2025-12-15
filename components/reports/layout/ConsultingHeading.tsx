/**
 * ConsultingHeading Components
 *
 * Typography system for consulting-grade reports.
 * Implements McKinsey/BCG presentation standards.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { ReactNode } from 'react'
import { typography, getTypographyClasses, visualAccents } from '@/lib/layout/consulting-grid'

interface HeadingProps {
  children: ReactNode
  className?: string
  id?: string
}

/**
 * Display heading - Largest, used for main report title
 * 48px/1.2 line height
 */
export function DisplayHeading({ children, className = '', id }: HeadingProps) {
  const classes = getTypographyClasses('display')
  return (
    <h1 id={id} className={`${classes} text-foreground ${className}`}>
      {children}
    </h1>
  )
}

/**
 * Headline - Major section headers
 * 36px/1.3 line height
 */
export function Headline({ children, className = '', id }: HeadingProps) {
  const classes = getTypographyClasses('headline')
  return (
    <h2 id={id} className={`${classes} text-foreground ${className}`}>
      {children}
    </h2>
  )
}

/**
 * Title - Subsection headers
 * 24px/1.4 line height
 */
export function Title({ children, className = '', id }: HeadingProps) {
  const classes = getTypographyClasses('title')
  return (
    <h3 id={id} className={`${classes} text-foreground ${className}`}>
      {children}
    </h3>
  )
}

/**
 * Subtitle - Minor section headers
 * 18px/1.5 line height
 */
export function Subtitle({ children, className = '', id }: HeadingProps) {
  const classes = getTypographyClasses('subtitle')
  return (
    <h4 id={id} className={`${classes} text-foreground ${className}`}>
      {children}
    </h4>
  )
}

/**
 * Body text - Main content text
 * 16px/1.6 line height
 */
export function BodyText({ children, className = '' }: Omit<HeadingProps, 'id'>) {
  const classes = getTypographyClasses('body')
  return (
    <p className={`${classes} text-foreground ${className}`}>
      {children}
    </p>
  )
}

/**
 * Caption - Chart labels, footnotes, etc.
 * 14px/1.5 line height
 */
export function Caption({ children, className = '' }: Omit<HeadingProps, 'id'>) {
  const classes = getTypographyClasses('caption')
  return (
    <p className={`${classes} text-muted-foreground ${className}`}>
      {children}
    </p>
  )
}

/**
 * Section heading with optional border
 */
interface SectionHeadingProps extends HeadingProps {
  bordered?: boolean
  accent?: boolean
}

export function SectionHeading({
  children,
  bordered = false,
  accent = false,
  className = '',
  id
}: SectionHeadingProps) {
  const borderClass = bordered
    ? accent
      ? visualAccents.dividerAccent
      : visualAccents.dividerThick
    : ''

  return (
    <div className={`${borderClass} ${bordered ? 'pb-4 mb-8' : 'mb-6'}`}>
      <Headline id={id} className={className}>
        {children}
      </Headline>
    </div>
  )
}

/**
 * Insight callout - "So what?" annotation
 */
interface InsightCalloutProps {
  children: ReactNode
  title?: string
  className?: string
}

export function InsightCallout({ children, title, className = '' }: InsightCalloutProps) {
  return (
    <div className={`bg-card border-l-4 border-brand-orange rounded-r-lg p-6 my-6 ${className}`}>
      {title && (
        <p className="text-brand-orange font-semibold text-sm uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      <div className="text-foreground text-base leading-relaxed">
        {children}
      </div>
    </div>
  )
}

/**
 * Key takeaway box
 */
interface KeyTakeawayProps {
  children: ReactNode
  className?: string
}

export function KeyTakeaway({ children, className = '' }: KeyTakeawayProps) {
  return (
    <div className={`bg-gradient-to-r from-brand-orange/10 to-brand-teal/10 border-2 border-border rounded-lg p-8 my-10 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-foreground font-semibold text-lg mb-2">Key Takeaway</p>
          <div className="text-foreground text-base leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
