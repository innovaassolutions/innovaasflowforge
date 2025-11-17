import { line, curveLinear, arc as d3Arc } from 'd3-shape'
import { scaleLinear } from 'd3-scale'

/**
 * Generate SVG path data for a radar/spider chart
 */
export interface RadarDataPoint {
  label: string
  value: number // 0-5 scale
  maxValue?: number
}

export function generateRadarChartPath(
  data: RadarDataPoint[],
  size: number = 200,
  maxValue: number = 5
): { path: string; points: Array<{ x: number; y: number; label: string; value: number }> } {
  const center = size / 2
  const radius = size / 2 - 20 // Leave margin
  const angleStep = (2 * Math.PI) / data.length

  // Generate points on the radar
  const points = data.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2 // Start from top
    const r = (item.value / maxValue) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: item.label,
      value: item.value
    }
  })

  // Create closed path
  const lineGenerator = line<{ x: number; y: number }>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(curveLinear)

  // Close the path by adding first point at the end
  const pathData = lineGenerator([...points, points[0]])

  return {
    path: pathData || '',
    points
  }
}

/**
 * Generate grid lines for radar chart background
 */
export function generateRadarGrid(
  numPoints: number,
  size: number = 200,
  levels: number = 5
): Array<{ path: string; level: number }> {
  const center = size / 2
  const radius = size / 2 - 20
  const angleStep = (2 * Math.PI) / numPoints
  const grids: Array<{ path: string; level: number }> = []

  // Generate concentric polygons for each level
  for (let level = 1; level <= levels; level++) {
    const levelRadius = (radius / levels) * level
    const points = []

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2
      points.push({
        x: center + levelRadius * Math.cos(angle),
        y: center + levelRadius * Math.sin(angle)
      })
    }

    const lineGenerator = line<{ x: number; y: number }>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveLinear)

    const pathData = lineGenerator([...points, points[0]])
    grids.push({
      path: pathData || '',
      level: (level / levels) * 5 // Scale to 0-5
    })
  }

  return grids
}

/**
 * Generate axis lines for radar chart
 */
export function generateRadarAxes(
  numPoints: number,
  size: number = 200
): Array<{ x1: number; y1: number; x2: number; y2: number; label: string }> {
  const center = size / 2
  const radius = size / 2 - 20
  const angleStep = (2 * Math.PI) / numPoints
  const axes: Array<{ x1: number; y1: number; x2: number; y2: number; label: string }> = []

  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep - Math.PI / 2
    axes.push({
      x1: center,
      y1: center,
      x2: center + radius * Math.cos(angle),
      y2: center + radius * Math.sin(angle),
      label: `Axis ${i + 1}`
    })
  }

  return axes
}

/**
 * Generate bar chart data
 */
export interface BarDataPoint {
  label: string
  value: number
  color?: string
  maxValue?: number
}

export function generateBarChart(
  data: BarDataPoint[],
  width: number = 400,
  height: number = 200,
  maxValue: number = 5
): Array<{ x: number; y: number; width: number; height: number; label: string; value: number; color: string }> {
  const barWidth = (width - 40) / data.length - 10 // Margins and spacing
  const scaleY = scaleLinear()
    .domain([0, maxValue])
    .range([0, height - 40]) // Leave margin for labels

  return data.map((item, i) => {
    const barHeight = scaleY(item.value)
    return {
      x: 20 + i * (barWidth + 10),
      y: height - 20 - barHeight,
      width: barWidth,
      height: barHeight,
      label: item.label,
      value: item.value,
      color: item.color || '#F25C05'
    }
  })
}

/**
 * Generate horizontal bar chart (better for dimension names)
 */
export function generateHorizontalBarChart(
  data: BarDataPoint[],
  width: number = 400,
  height: number = 300,
  maxValue: number = 5
): Array<{ x: number; y: number; width: number; height: number; label: string; value: number; color: string }> {
  const barHeight = (height - 40) / data.length - 10 // Margins and spacing
  const scaleX = scaleLinear()
    .domain([0, maxValue])
    .range([0, width - 150]) // Leave space for labels

  return data.map((item, i) => {
    const barWidth = scaleX(item.value)
    return {
      x: 140, // Leave space for label on left
      y: 20 + i * (barHeight + 10),
      width: barWidth,
      height: barHeight,
      label: item.label,
      value: item.value,
      color: item.color || '#F25C05'
    }
  })
}

/**
 * Generate donut chart segments
 */
export interface DonutDataPoint {
  label: string
  value: number
  color: string
}

export function generateDonutChart(
  data: DonutDataPoint[],
  size: number = 200,
  innerRadiusRatio: number = 0.6
): Array<{ path: string; label: string; value: number; percentage: number; color: string }> {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const center = size / 2
  const outerRadius = size / 2 - 10
  const innerRadius = outerRadius * innerRadiusRatio

  let currentAngle = -Math.PI / 2 // Start from top

  return data.map(item => {
    const percentage = (item.value / total) * 100
    const angleSize = (item.value / total) * 2 * Math.PI

    const arcGenerator = d3Arc()
    const pathData = arcGenerator({
      innerRadius,
      outerRadius,
      startAngle: currentAngle,
      endAngle: currentAngle + angleSize
    })

    currentAngle += angleSize

    return {
      path: pathData || '',
      label: item.label,
      value: item.value,
      percentage: Math.round(percentage),
      color: item.color
    }
  })
}

/**
 * Score color helper (matches report-generator)
 */
export function getScoreColor(score: number): string {
  if (score >= 4) return '#4CAF50' // Green - Expert/Leader
  if (score >= 3) return '#1D9BA3' // Teal - Experienced
  if (score >= 2) return '#FFB347' // Warm accent - Intermediate
  if (score >= 1) return '#FF9800' // Orange - Beginner
  return '#777777' // Gray - Newcomer
}
