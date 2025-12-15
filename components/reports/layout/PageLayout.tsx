/**
 * PageLayout Component
 *
 * Full-page consulting report layout with navigation and structure.
 * Implements McKinsey/BCG presentation format.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { ReactNode } from 'react'
import { gridConfig, pageStructure } from '@/lib/layout/consulting-grid'

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Main page container with proper margins
 */
export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`${pageStructure.page} ${className}`}>
      <div
        className="mx-auto"
        style={{
          maxWidth: `${gridConfig.maxWidth}px`,
          paddingLeft: `${gridConfig.marginOuter}px`,
          paddingRight: `${gridConfig.marginOuter}px`
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Page navigation indicators (for multi-page reports)
 */
interface PageIndicatorProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
  className?: string
}

export function PageIndicator({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PageIndicatorProps) {
  return (
    <nav
      className={`flex items-center justify-center gap-2 py-6 ${className}`}
      aria-label="Report pages"
    >
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange?.(page)}
          className={`w-3 h-3 rounded-full transition-all ${
            page === currentPage
              ? 'bg-brand-orange scale-125'
              : 'bg-muted hover:bg-muted/80'
          }`}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        />
      ))}
    </nav>
  )
}

/**
 * Sticky page header with progress indicator
 */
interface PageHeaderProps {
  title: string
  subtitle?: string
  progress?: number // 0-100
  className?: string
}

export function PageHeader({ title, subtitle, progress, className = '' }: PageHeaderProps) {
  return (
    <header className={`sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border ${className}`}>
      <div className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {progress !== undefined && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
              <div className="w-32 h-2 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * Page footer with navigation and metadata
 */
interface PageFooterProps {
  children?: ReactNode
  className?: string
}

export function PageFooter({ children, className = '' }: PageFooterProps) {
  return (
    <footer className={`border-t border-border py-8 mt-20 ${className}`}>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {children || (
          <p>Generated with Innovaas FlowForge Digital Transformation Assessment</p>
        )}
      </div>
    </footer>
  )
}

/**
 * Full-viewport page section (for distinct visual pages)
 */
interface FullPageSectionProps {
  children: ReactNode
  id?: string
  className?: string
}

export function FullPageSection({ children, id, className = '' }: FullPageSectionProps) {
  return (
    <section
      id={id}
      className={`min-h-screen flex flex-col justify-center py-25 ${className}`}
    >
      {children}
    </section>
  )
}
