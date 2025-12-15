'use client'

/**
 * QuoteCard Component
 *
 * Styled card for displaying stakeholder quotes.
 * Part of Report Visual Transformation spec
 */

interface QuoteCardProps {
  quote: string
  author?: string
  title?: string
  className?: string
}

export function QuoteCard({ quote, author, title, className = '' }: QuoteCardProps) {
  return (
    <blockquote
      className={`bg-card border-l-4 border-brand-teal rounded-r-lg p-4 ${className}`}
      role="blockquote">
      <p className="text-foreground italic text-sm leading-relaxed mb-2">
        "{quote}"
      </p>
      {(author || title) && (
        <footer className="text-xs text-muted-foreground mt-2">
          {author && <span className="font-medium">{author}</span>}
          {author && title && <span className="mx-1">—</span>}
          {title && <span>{title}</span>}
        </footer>
      )}
    </blockquote>
  )
}
