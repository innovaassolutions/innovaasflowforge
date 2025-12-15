'use client'

/**
 * EnhancedRecommendations Component
 *
 * Consulting-grade recommendations with Impact/Effort scoring, timeframes, and strategic grouping.
 * Implements McKinsey/BCG-style action planning.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { useMemo } from 'react'
import type { ReadinessAssessment } from '@/lib/agents/synthesis-agent'
import {
  transformToMatrixData,
  extractTopImperatives,
  getQuadrantLabel,
  type MatrixDimension
} from '@/lib/consulting-data-transformers'
import { Title, Subtitle, Caption, InsightCallout } from '@/components/reports/layout'
import { ConsultingGrid } from '@/components/reports/layout'
import { CheckCircle2, ArrowRight, Clock, Target, TrendingUp } from 'lucide-react'

interface EnhancedRecommendationsProps {
  assessment: ReadinessAssessment
  className?: string
}

export function EnhancedRecommendations({ assessment, className = '' }: EnhancedRecommendationsProps) {
  const matrixData = useMemo(() => transformToMatrixData(assessment), [assessment])
  const topImperatives = useMemo(() => extractTopImperatives(assessment, 5), [assessment])

  // Group recommendations by quadrant (strategic theme)
  const groupedRecommendations = useMemo(() => {
    const groups = {
      'quick-wins': matrixData.filter(d => d.quadrant === 'quick-wins'),
      'strategic-bets': matrixData.filter(d => d.quadrant === 'strategic-bets'),
      'fill-ins': matrixData.filter(d => d.quadrant === 'fill-ins'),
      'long-term': matrixData.filter(d => d.quadrant === 'long-term')
    }
    return groups
  }, [matrixData])

  return (
    <section className={`py-25 ${className}`} aria-labelledby="recommendations-heading">
      <div className="max-w-[1600px] mx-auto px-[100px]">
        {/* Header */}
        <div className="mb-16">
          <Title id="recommendations-heading">Strategic Action Plan</Title>
          <Caption className="mt-4">
            Prioritized recommendations based on business impact and implementation effort.
            Actions are grouped by strategic theme for maximum effectiveness.
          </Caption>
        </div>

        {/* Quick Wins - Immediate Actions */}
        {groupedRecommendations['quick-wins'].length > 0 && (
          <div className="mb-16">
            <RecommendationGroup
              title="Quick Wins"
              subtitle="High impact, low effort - immediate focus for rapid progress"
              icon={<TrendingUp className="text-green-500" size={24} />}
              color="#10b981"
              recommendations={groupedRecommendations['quick-wins']}
              timeframe="0-3 months"
            />
          </div>
        )}

        {/* Strategic Bets - Major Initiatives */}
        {groupedRecommendations['strategic-bets'].length > 0 && (
          <div className="mb-16">
            <RecommendationGroup
              title="Strategic Investments"
              subtitle="High impact, high effort - critical for long-term transformation"
              icon={<Target className="text-orange-500" size={24} />}
              color="#F25C05"
              recommendations={groupedRecommendations['strategic-bets']}
              timeframe="3-6 months"
            />
          </div>
        )}

        {/* Fill-ins - Incremental Improvements */}
        {groupedRecommendations['fill-ins'].length > 0 && (
          <div className="mb-16">
            <RecommendationGroup
              title="Incremental Improvements"
              subtitle="Lower priority, but valuable for overall capability building"
              icon={<CheckCircle2 className="text-yellow-500" size={24} />}
              color="#eab308"
              recommendations={groupedRecommendations['fill-ins']}
              timeframe="6-12 months"
            />
          </div>
        )}

        {/* Action Planning Framework */}
        <div className="mt-20">
          <InsightCallout title="Implementation Guidance">
            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">
                <strong>Sequencing Strategy:</strong> Execute Quick Wins first to build momentum and demonstrate value.
                This creates organizational buy-in for larger Strategic Investments. Incremental Improvements can
                be addressed opportunistically as resources become available.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Resource Allocation:</strong> Prioritize initiatives based on available budget, team capacity,
                and strategic alignment. Consider phasing large initiatives into smaller milestones.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Success Metrics:</strong> Define clear KPIs for each initiative. Track progress monthly and
                adjust course as needed. Schedule reassessment in 6-12 months to measure transformation impact.
              </p>
            </div>
          </InsightCallout>
        </div>
      </div>
    </section>
  )
}

/**
 * Recommendation group component
 */
interface RecommendationGroupProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  recommendations: MatrixDimension[]
  timeframe: string
}

function RecommendationGroup({
  title,
  subtitle,
  icon,
  color,
  recommendations,
  timeframe
}: RecommendationGroupProps) {
  return (
    <div>
      {/* Group Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{timeframe}</span>
          </div>
        </div>
      </div>

      {/* Recommendation Cards */}
      <ConsultingGrid columns={2} gap="medium" className="mb-0">
        {recommendations.map((rec, idx) => (
          <RecommendationCard key={idx} recommendation={rec} accentColor={color} />
        ))}
      </ConsultingGrid>
    </div>
  )
}

/**
 * Individual recommendation card
 */
interface RecommendationCardProps {
  recommendation: MatrixDimension
  accentColor: string
}

function RecommendationCard({ recommendation, accentColor }: RecommendationCardProps) {
  // Generate expected outcomes based on gap to target
  const gap = 5 - recommendation.score
  const expectedImprovement = gap * 0.6 // Assume 60% gap closure

  return (
    <div
      className="bg-card rounded-lg p-6 border-l-4 hover:shadow-lg transition-shadow"
      style={{ borderColor: accentColor }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-foreground leading-tight">
            {recommendation.dimension}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">{recommendation.pillar}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricPill
          label="Impact"
          value={recommendation.impact.toFixed(1)}
          max={5}
          color={recommendation.impact >= 4 ? '#10b981' : recommendation.impact >= 3 ? '#eab308' : '#6b7280'}
        />
        <MetricPill
          label="Effort"
          value={recommendation.effort.toFixed(1)}
          max={5}
          color={recommendation.effort <= 2 ? '#10b981' : recommendation.effort <= 3 ? '#eab308' : '#ef4444'}
          inverse
        />
        <MetricPill
          label="Current"
          value={recommendation.score.toFixed(1)}
          max={5}
          color={accentColor}
        />
      </div>

      {/* Expected Outcome */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Expected Outcome</p>
        <div className="flex items-center gap-2">
          <span className="text-foreground font-semibold">
            {recommendation.score.toFixed(1)}
          </span>
          <ArrowRight size={16} className="text-muted-foreground" />
          <span className="text-foreground font-semibold">
            {(recommendation.score + expectedImprovement).toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            +{expectedImprovement.toFixed(1)} improvement
          </span>
        </div>
      </div>

      {/* Priority Badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${accentColor}20`,
            color: accentColor
          }}
        >
          {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
        </span>
        <span className="text-xs text-muted-foreground">
          {getQuadrantLabel(recommendation.quadrant)}
        </span>
      </div>
    </div>
  )
}

/**
 * Metric pill component
 */
interface MetricPillProps {
  label: string
  value: string
  max: number
  color: string
  inverse?: boolean // For effort where lower is better
}

function MetricPill({ label, value, max, color, inverse = false }: MetricPillProps) {
  const numericValue = parseFloat(value)
  const percentage = (numericValue / max) * 100

  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="relative">
        <div className="text-lg font-bold text-foreground">{value}</div>
        <div className="h-1 bg-border rounded-full mt-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${inverse ? 100 - percentage : percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    </div>
  )
}
