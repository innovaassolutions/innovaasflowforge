'use client'

/**
 * ExecutiveSummary Section Component
 *
 * Hero section displaying overall readiness score and key metrics.
 * Includes prominent ScoreBadge and MetricCard grid.
 *
 * Part of Report Visual Transformation spec
 */

import { useMemo } from 'react'
import { ReadinessAssessment } from '@/lib/agents/synthesis-agent'
import { ScoreBadge } from '../ui/ScoreBadge'
import { MetricCard } from '../ui/MetricCard'
import { transformToMetricCards } from '@/lib/chart-data-transformers'

interface ExecutiveSummaryProps {
  assessment: ReadinessAssessment
  className?: string
}

export function ExecutiveSummary({ assessment, className = '' }: ExecutiveSummaryProps) {
  // Memoize metric card transformation to avoid recalculation on re-renders
  const metricCards = useMemo(() => transformToMetricCards(assessment), [assessment])

  return (
    <section
      className={`bg-background border border-border rounded-lg p-8 ${className}`}
      aria-labelledby="executive-summary-heading">
      <h2 id="executive-summary-heading" className="text-2xl font-bold text-foreground mb-6">
        Executive Summary
      </h2>

      {/* Hero Score */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="flex-shrink-0">
          <ScoreBadge score={assessment.overallScore} size="xl" showLabel />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Overall Readiness Assessment
          </h3>
          <div className="text-muted-foreground leading-relaxed">
            {assessment.executiveSummary.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((card, idx) => (
          <MetricCard
            key={idx}
            label={card.label}
            value={card.value}
            icon={require('lucide-react')[card.icon]}
            color={card.color}
            trend={card.trend}
          />
        ))}
      </div>

      {/* Key Themes */}
      {assessment.keyThemes.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Key Themes</h3>
          <ul className="space-y-2">
            {assessment.keyThemes.map((theme, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-brand-teal mt-1">•</span>
                <span className="text-muted-foreground">{theme}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
