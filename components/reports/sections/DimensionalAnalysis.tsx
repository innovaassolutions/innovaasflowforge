'use client'

/**
 * DimensionalAnalysis Section Component
 *
 * Comprehensive pillar and dimension analysis with interactive charts.
 * Includes RadarChart for pillars and DimensionBarChart for detailed scores.
 *
 * Part of Report Visual Transformation spec
 */

import { useMemo } from 'react'
import { ReadinessAssessment } from '@/lib/agents/synthesis-agent'
import { RadarChart } from '../charts/RadarChart'
import { DimensionBarChart } from '../charts/DimensionBarChart'
import { ScoreBadge } from '../ui/ScoreBadge'
import { PriorityTag } from '../ui/PriorityTag'
import { CalloutBox } from '../ui/CalloutBox'
import { transformToRadarData, transformToDimensionBarData } from '@/lib/chart-data-transformers'

interface DimensionalAnalysisProps {
  assessment: ReadinessAssessment
  className?: string
}

export function DimensionalAnalysis({ assessment, className = '' }: DimensionalAnalysisProps) {
  // Memoize chart data transformations to avoid recalculation on re-renders
  const radarData = useMemo(() => transformToRadarData(assessment.pillars), [assessment.pillars])
  const barData = useMemo(() => transformToDimensionBarData(assessment.pillars), [assessment.pillars])

  return (
    <section
      className={`bg-mocha-base border border-mocha-surface0 rounded-lg p-8 ${className}`}
      aria-labelledby="dimensional-analysis-heading">
      <h2 id="dimensional-analysis-heading" className="text-2xl font-bold text-mocha-text mb-6">
        Dimensional Analysis
      </h2>

      {/* Radar Chart - Pillar Overview */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-mocha-text mb-4">Pillar Overview</h3>
        <div className="bg-mocha-surface0 rounded-lg p-6">
          <RadarChart data={radarData} />
        </div>
      </div>

      {/* Pillar Breakdowns */}
      {assessment.pillars.map((pillar, pillarIdx) => (
        <div key={pillarIdx} className="mb-10 last:mb-0">
          {/* Pillar Header */}
          <div className="flex items-center gap-4 mb-6">
            <ScoreBadge score={pillar.score} size="lg" />
            <div>
              <h3 className="text-xl font-semibold text-mocha-text">{pillar.pillar}</h3>
              <p className="text-sm text-mocha-subtext0">
                {pillar.dimensions.length} dimensions analyzed
              </p>
            </div>
          </div>

          {/* Dimension Bar Chart */}
          <div className="bg-mocha-surface0 rounded-lg p-6 mb-6">
            <DimensionBarChart data={barData.filter(d => d.pillar === pillar.pillar)} />
          </div>

          {/* Dimension Details */}
          <div className="space-y-6">
            {pillar.dimensions.map((dimension, dimIdx) => (
              <div key={dimIdx} className="border-l-2 border-mocha-surface1 pl-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-mocha-text">
                        {dimension.dimension}
                      </h4>
                      <ScoreBadge score={dimension.score} size="sm" />
                      <PriorityTag priority={dimension.priority} />
                    </div>
                    <p className="text-sm text-mocha-subtext1 mb-3">
                      Confidence: <span className="capitalize">{dimension.confidence}</span>
                    </p>
                  </div>
                </div>

                {/* Key Findings */}
                {dimension.keyFindings.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-mocha-text mb-2">Key Findings</h5>
                    <ul className="space-y-1">
                      {dimension.keyFindings.map((finding, findingIdx) => (
                        <li key={findingIdx} className="flex items-start gap-2 text-sm text-mocha-subtext0">
                          <span className="text-mocha-teal mt-1">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gap to Next Level */}
                {dimension.gapToNext && (
                  <CalloutBox variant="info" title="Path to Next Level">
                    {dimension.gapToNext}
                  </CalloutBox>
                )}

                {/* Supporting Quotes */}
                {dimension.supportingQuotes.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-mocha-surface1">
                    <h5 className="text-sm font-semibold text-mocha-text mb-2">
                      Stakeholder Insights
                    </h5>
                    <div className="space-y-2">
                      {dimension.supportingQuotes.slice(0, 2).map((quote, quoteIdx) => (
                        <p key={quoteIdx} className="text-sm italic text-mocha-subtext0">
                          "{quote}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Contradictions */}
      {assessment.contradictions.length > 0 && (
        <div className="mt-10 pt-8 border-t border-mocha-surface1">
          <h3 className="text-lg font-semibold text-mocha-text mb-4">
            Areas of Divergent Perspectives
          </h3>
          <div className="space-y-3">
            {assessment.contradictions.map((contradiction, idx) => (
              <CalloutBox key={idx} variant="warning">
                {contradiction}
              </CalloutBox>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
