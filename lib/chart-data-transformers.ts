/**
 * Chart Data Transformers
 *
 * Converts ReadinessAssessment synthesis data into chart-ready formats
 * for Recharts components.
 *
 * Part of Report Visual Transformation spec
 */

import { ReadinessAssessment, PillarScore, DimensionalScore } from './agents/synthesis-agent'

// ============================================================================
// Type Definitions
// ============================================================================

export interface RadarDataPoint {
  axis: string          // Pillar name
  value: number         // Score 0-5
  fullMark: number      // Always 5
}

export interface BarDataPoint {
  dimension: string     // Dimension name
  score: number         // Score 0-5
  pillar: string        // Parent pillar
  priority: string      // Priority level
  color: string         // Score-based color
}

export interface ProgressDataPoint {
  current: number       // Current score
  target: number        // Next level threshold
  percentage: number    // Percentage to next level
  level: string         // Maturity level name
}

export interface MetricCard {
  label: string
  value: string | number
  icon: string          // Icon name (Lucide)
  trend?: 'up' | 'down' | 'neutral'
  color: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get score-based color (traffic light system)
 */
export function getScoreColor(score: number): string {
  if (score >= 4.0) return '#10b981'  // Green
  if (score >= 3.0) return '#eab308'  // Yellow
  if (score >= 2.0) return '#f97316'  // Orange
  return '#ef4444'                    // Red
}

/**
 * Get maturity level name from score
 */
export function getMaturityLevel(score: number): string {
  if (score < 1) return 'Newcomer'
  if (score < 2) return 'Beginner'
  if (score < 3) return 'Intermediate'
  if (score < 4) return 'Experienced'
  if (score < 5) return 'Expert'
  return 'Leader'
}

/**
 * Get next maturity level threshold
 */
export function getNextLevelThreshold(score: number): number {
  if (score < 1) return 1
  if (score < 2) return 2
  if (score < 3) return 3
  if (score < 4) return 4
  return 5
}

// ============================================================================
// Transformation Functions
// ============================================================================

/**
 * Transform pillar data into radar chart format
 */
export function transformToRadarData(pillars: PillarScore[]): RadarDataPoint[] {
  return pillars.map(pillar => ({
    axis: pillar.pillar,
    value: pillar.score,
    fullMark: 5
  }))
}

/**
 * Transform dimension data into bar chart format
 */
export function transformToDimensionBarData(pillars: PillarScore[]): BarDataPoint[] {
  const barData: BarDataPoint[] = []

  pillars.forEach(pillar => {
    pillar.dimensions.forEach(dimension => {
      barData.push({
        dimension: dimension.dimension,
        score: dimension.score,
        pillar: pillar.pillar,
        priority: dimension.priority,
        color: getScoreColor(dimension.score)
      })
    })
  })

  return barData
}

/**
 * Transform score into progress bar data
 */
export function transformToProgressData(score: number): ProgressDataPoint {
  const target = getNextLevelThreshold(score)
  const level = getMaturityLevel(score)
  const percentage = (score / target) * 100

  return {
    current: score,
    target,
    percentage: Math.min(percentage, 100),
    level
  }
}

/**
 * Transform assessment into dashboard metric cards
 */
export function transformToMetricCards(assessment: ReadinessAssessment): MetricCard[] {
  const cards: MetricCard[] = []

  // Overall Score Card
  cards.push({
    label: 'Overall Readiness',
    value: assessment.overallScore.toFixed(1),
    icon: 'Activity',
    color: getScoreColor(assessment.overallScore)
  })

  // Pillar Score Cards
  assessment.pillars.forEach(pillar => {
    cards.push({
      label: pillar.pillar,
      value: pillar.score.toFixed(1),
      icon: getPillarIcon(pillar.pillar),
      color: getScoreColor(pillar.score)
    })
  })

  // Stakeholder Count Card
  cards.push({
    label: 'Stakeholders',
    value: assessment.stakeholderPerspectives.length,
    icon: 'Users',
    color: '#6b7280' // Gray
  })

  return cards.slice(0, 5) // Return max 5 cards
}

/**
 * Get icon name for pillar
 */
function getPillarIcon(pillarName: string): string {
  const iconMap: Record<string, string> = {
    'Technology': 'Cpu',
    'Process': 'GitBranch',
    'Organization': 'Building2'
  }
  return iconMap[pillarName] || 'Circle'
}
