/**
 * Consulting Data Transformers
 *
 * Strategic framework data transformations for McKinsey/BCG-style visualizations.
 * Converts ReadinessAssessment data into priority matrices, heat maps, and roadmaps.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import type { ReadinessAssessment, PillarScore, DimensionalScore } from './agents/synthesis-agent'

// ============================================================================
// Type Definitions
// ============================================================================

export type Quadrant = 'quick-wins' | 'strategic-bets' | 'fill-ins' | 'long-term'

export interface MatrixDimension {
  dimension: string
  pillar: string
  score: number // Current maturity (0-5)
  impact: number // Business impact (1-5)
  effort: number // Implementation effort (1-5)
  quadrant: Quadrant
  priority: string // Original priority from assessment
}

export interface HeatMapCell {
  pillar: string
  dimension: string
  score: number
  intensity: number // 0-100 for color opacity
  gap: number // Distance to target (5.0)
}

export interface RoadmapInitiative {
  name: string
  phase: 'foundation' | 'build' | 'scale'
  startWeek: number // 0-52
  durationWeeks: number
  type: 'quick-win' | 'strategic' | 'transformative'
  dimensions: string[] // Related dimensions
  pillar: string
}

export interface StrategicImperative {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  timeframe: '0-3 months' | '3-6 months' | '6-12 months'
  dimensions: string[]
}

// ============================================================================
// Priority Matrix Transformations
// ============================================================================

/**
 * Calculate business impact score from dimension data
 * Considers priority level and gap to target maturity
 */
export function calculateImpact(dim: DimensionalScore): number {
  // Priority determines base impact
  const priorityWeight: Record<string, number> = {
    critical: 5,
    important: 4,
    foundational: 3,
    opportunistic: 2
  }

  const baseImpact = priorityWeight[dim.priority] || 3

  // Larger gap to target = higher impact potential
  const gapToTarget = 5 - dim.score
  const gapWeight = (gapToTarget / 5) * 2 // Max 2 points from gap

  // Combined score (weighted 70/30)
  const impact = baseImpact * 0.7 + gapWeight * 0.3

  return Math.min(5, Math.max(1, impact))
}

/**
 * Calculate implementation effort from current maturity level
 * Lower maturity = higher effort to improve
 */
export function calculateEffort(dim: DimensionalScore): number {
  const score = dim.score

  // Maturity levels determine effort
  if (score < 1) return 5 // Newcomer - very high effort
  if (score < 2) return 4 // Beginner - high effort
  if (score < 3) return 3 // Intermediate - medium effort
  if (score < 4) return 2 // Experienced - low effort
  return 1 // Expert/Leader - very low effort
}

/**
 * Determine quadrant based on impact and effort scores
 */
export function determineQuadrant(impact: number, effort: number): Quadrant {
  const isHighImpact = impact >= 3.5
  const isLowEffort = effort <= 2.5

  if (isHighImpact && isLowEffort) return 'quick-wins'
  if (isHighImpact && !isLowEffort) return 'strategic-bets'
  if (!isHighImpact && isLowEffort) return 'fill-ins'
  return 'long-term'
}

/**
 * Transform assessment data into priority matrix format
 */
export function transformToMatrixData(assessment: ReadinessAssessment): MatrixDimension[] {
  return assessment.pillars.flatMap(pillar =>
    pillar.dimensions.map(dim => {
      const impact = calculateImpact(dim)
      const effort = calculateEffort(dim)
      const quadrant = determineQuadrant(impact, effort)

      return {
        dimension: dim.dimension,
        pillar: pillar.pillar,
        score: dim.score,
        impact,
        effort,
        quadrant,
        priority: dim.priority
      }
    })
  )
}

// ============================================================================
// Heat Map Transformations
// ============================================================================

/**
 * Transform assessment into capability heat map format
 * Creates matrix: rows = dimensions, cols = pillars
 */
export function transformToHeatMapData(assessment: ReadinessAssessment): HeatMapCell[][] {
  const maxDimensions = Math.max(...assessment.pillars.map(p => p.dimensions.length))

  return Array.from({ length: maxDimensions }, (_, rowIdx) =>
    assessment.pillars
      .map(pillar => {
        const dim = pillar.dimensions[rowIdx]
        if (!dim) return null

        return {
          pillar: pillar.pillar,
          dimension: dim.dimension,
          score: dim.score,
          intensity: (dim.score / 5) * 100,
          gap: 5 - dim.score
        }
      })
      .filter((cell): cell is HeatMapCell => cell !== null)
  )
}

// ============================================================================
// Transformation Roadmap
// ============================================================================

/**
 * Generate transformation roadmap initiatives from assessment
 * Phases based on priority and maturity
 */
export function transformToRoadmapData(assessment: ReadinessAssessment): RoadmapInitiative[] {
  const initiatives: RoadmapInitiative[] = []

  // Phase 1: Foundation (0-3 months) - Quick wins and critical gaps
  const quickWins = assessment.pillars.flatMap(pillar =>
    pillar.dimensions
      .filter(d => d.priority === 'critical' && d.score < 3)
      .map((d, idx) => ({
        name: d.dimension,
        phase: 'foundation' as const,
        startWeek: idx * 2, // Stagger quick wins
        durationWeeks: 4,
        type: 'quick-win' as const,
        dimensions: [d.dimension],
        pillar: pillar.pillar
      }))
  )

  // Phase 2: Build (3-6 months) - Important strategic initiatives
  const strategic = assessment.pillars.flatMap(pillar =>
    pillar.dimensions
      .filter(d => d.priority === 'important' && d.score < 4)
      .map((d, idx) => ({
        name: d.dimension,
        phase: 'build' as const,
        startWeek: 12 + idx * 4,
        durationWeeks: 12,
        type: 'strategic' as const,
        dimensions: [d.dimension],
        pillar: pillar.pillar
      }))
  )

  // Phase 3: Scale (6-12 months) - Transformative foundational work
  const transformative = assessment.pillars.flatMap(pillar =>
    pillar.dimensions
      .filter(d => d.priority === 'foundational' && d.score < 4)
      .map((d, idx) => ({
        name: d.dimension,
        phase: 'scale' as const,
        startWeek: 26 + idx * 8,
        durationWeeks: 20,
        type: 'transformative' as const,
        dimensions: [d.dimension],
        pillar: pillar.pillar
      }))
  )

  return [...quickWins, ...strategic, ...transformative].slice(0, 15) // Limit to 15 initiatives
}

// ============================================================================
// Strategic Insights
// ============================================================================

/**
 * Extract top strategic imperatives from assessment
 */
export function extractTopImperatives(
  assessment: ReadinessAssessment,
  count: number = 3
): StrategicImperative[] {
  const matrixData = transformToMatrixData(assessment)

  // Prioritize quick wins and strategic bets
  const highPriority = matrixData
    .filter(d => d.quadrant === 'quick-wins' || d.quadrant === 'strategic-bets')
    .sort((a, b) => {
      // Sort by impact (descending), then effort (ascending)
      if (b.impact !== a.impact) return b.impact - a.impact
      return a.effort - b.effort
    })
    .slice(0, count)

  return highPriority.map(dim => ({
    title: dim.dimension,
    description: dim.quadrant === 'quick-wins'
      ? `High-impact quick win in ${dim.pillar}. Immediate focus recommended.`
      : `Strategic investment in ${dim.pillar}. Critical for long-term transformation.`,
    impact: dim.impact >= 4.5 ? 'high' : dim.impact >= 3.5 ? 'medium' : 'low',
    timeframe: dim.quadrant === 'quick-wins' ? '0-3 months' : '3-6 months',
    dimensions: [dim.dimension]
  }))
}

/**
 * Generate strategic insights from assessment patterns
 */
export function generateStrategicInsights(assessment: ReadinessAssessment): string[] {
  const insights: string[] = []

  // Identify weak pillars
  const lowScorePillars = assessment.pillars.filter(p => p.score < 3)
  if (lowScorePillars.length > 0) {
    insights.push(
      `${lowScorePillars.map(p => p.pillar).join(' and ')} ${lowScorePillars.length === 1 ? 'requires' : 'require'} immediate attention to build transformation foundation`
    )
  }

  // Identify strengths to leverage
  const strongDimensions = assessment.pillars.flatMap(p =>
    p.dimensions.filter(d => d.score >= 4)
  )
  if (strongDimensions.length > 0) {
    insights.push(
      `Leverage existing strengths in ${strongDimensions.slice(0, 2).map(d => d.dimension).join(' and ')} as transformation accelerators`
    )
  }

  // Count quick wins
  const matrixData = transformToMatrixData(assessment)
  const quickWinsCount = matrixData.filter(d => d.quadrant === 'quick-wins').length
  if (quickWinsCount > 0) {
    insights.push(
      `${quickWinsCount} quick win${quickWinsCount === 1 ? '' : 's'} identified for immediate impact in 0-3 months`
    )
  }

  // Identify strategic bets
  const strategicBetsCount = matrixData.filter(d => d.quadrant === 'strategic-bets').length
  if (strategicBetsCount > 0) {
    insights.push(
      `${strategicBetsCount} strategic initiative${strategicBetsCount === 1 ? '' : 's'} require sustained investment over 3-6 months`
    )
  }

  // Overall readiness commentary
  const overallScore = assessment.overallScore
  if (overallScore < 2) {
    insights.push('Organization is in early stages - focus on building foundational capabilities')
  } else if (overallScore < 3) {
    insights.push('Organization is developing - prioritize quick wins to build momentum')
  } else if (overallScore < 4) {
    insights.push('Organization is maturing - ready for strategic investments in advanced capabilities')
  } else {
    insights.push('Organization demonstrates strong maturity - focus on optimization and innovation')
  }

  return insights.slice(0, 5) // Return top 5 insights
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get color for quadrant in priority matrix
 */
export function getQuadrantColor(quadrant: Quadrant): string {
  const colors: Record<Quadrant, string> = {
    'quick-wins': '#10b981', // Green - high value, low effort
    'strategic-bets': '#F25C05', // Orange - high value, high effort
    'fill-ins': '#eab308', // Yellow - low value, low effort
    'long-term': '#6b7280' // Gray - low value, high effort
  }
  return colors[quadrant]
}

/**
 * Get label for quadrant
 */
export function getQuadrantLabel(quadrant: Quadrant): string {
  const labels: Record<Quadrant, string> = {
    'quick-wins': 'Quick Wins',
    'strategic-bets': 'Strategic Bets',
    'fill-ins': 'Fill-ins',
    'long-term': 'Long-term'
  }
  return labels[quadrant]
}
