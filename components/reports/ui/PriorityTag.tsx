'use client'

/**
 * PriorityTag Component
 *
 * Inline badge showing priority level with semantic colors.
 * Part of Report Visual Transformation spec
 */

interface PriorityTagProps {
  priority: string
  className?: string
}

export function PriorityTag({ priority, className = '' }: PriorityTagProps) {
  const colors = getPriorityColors(priority)

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderWidth: '1px',
        borderColor: colors.border
      }}
      role="status"
      aria-label={`Priority: ${priority}`}>
      {priority}
    </span>
  )
}

function getPriorityColors(priority: string): { bg: string; text: string; border: string } {
  switch (priority.toLowerCase()) {
    case 'critical':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        text: '#ef4444',
        border: 'rgba(239, 68, 68, 0.3)'
      }
    case 'important':
      return {
        bg: 'rgba(249, 115, 22, 0.1)',
        text: '#f97316',
        border: 'rgba(249, 115, 22, 0.3)'
      }
    case 'foundational':
      return {
        bg: 'rgba(234, 179, 8, 0.1)',
        text: '#eab308',
        border: 'rgba(234, 179, 8, 0.3)'
      }
    case 'opportunistic':
      return {
        bg: 'rgba(29, 155, 163, 0.1)',
        text: '#1D9BA3',
        border: 'rgba(29, 155, 163, 0.3)'
      }
    default:
      return {
        bg: 'rgba(107, 114, 128, 0.1)',
        text: '#6b7280',
        border: 'rgba(107, 114, 128, 0.3)'
      }
  }
}
