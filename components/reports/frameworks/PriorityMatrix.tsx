'use client'

/**
 * PriorityMatrix Component
 *
 * McKinsey/BCG-style 2x2 priority matrix (Impact vs Effort).
 * Custom SVG visualization with quadrants for strategic prioritization.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { useState } from 'react'
import type { MatrixDimension, Quadrant } from '@/lib/consulting-data-transformers'
import { getQuadrantColor, getQuadrantLabel } from '@/lib/consulting-data-transformers'

interface PriorityMatrixProps {
  data: MatrixDimension[]
  className?: string
}

export function PriorityMatrix({ data, className = '' }: PriorityMatrixProps) {
  const [hoveredDimension, setHoveredDimension] = useState<MatrixDimension | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-card rounded-lg ${className}`}>
        <p className="text-muted-foreground text-sm">No data available for priority matrix</p>
      </div>
    )
  }

  // SVG dimensions and margins
  const width = 600
  const height = 400
  const margin = { top: 40, right: 40, bottom: 60, left: 80 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Scales (effort: 1-5, impact: 1-5)
  const xScale = (effort: number) => ((effort - 1) / 4) * innerWidth
  const yScale = (impact: number) => innerHeight - ((impact - 1) / 4) * innerHeight

  // Quadrant thresholds (impact >= 3.5, effort <= 2.5)
  const impactThreshold = 3.5
  const effortThreshold = 2.5
  const xThreshold = xScale(effortThreshold)
  const yThreshold = yScale(impactThreshold)

  // Bubble size scale (score: 0-5 → radius: 8-24px)
  const radiusScale = (score: number) => 8 + (score / 5) * 16

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <figure
      role="img"
      aria-label="Priority matrix showing impact versus effort for all dimensions"
      className={className}
    >
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="mx-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredDimension(null)}
        >
          {/* Background quadrants */}
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Quadrant backgrounds */}
            <rect
              x={0}
              y={0}
              width={xThreshold}
              height={yThreshold}
              fill="#1a2e2a"
              opacity={0.3}
            />
            <rect
              x={xThreshold}
              y={0}
              width={innerWidth - xThreshold}
              height={yThreshold}
              fill="#2e1f1a"
              opacity={0.3}
            />
            <rect
              x={0}
              y={yThreshold}
              width={xThreshold}
              height={innerHeight - yThreshold}
              fill="#2e2a1a"
              opacity={0.3}
            />
            <rect
              x={xThreshold}
              y={yThreshold}
              width={innerWidth - xThreshold}
              height={innerHeight - yThreshold}
              fill="#25252e"
              opacity={0.3}
            />

            {/* Grid lines */}
            <line
              x1={xThreshold}
              y1={0}
              x2={xThreshold}
              y2={innerHeight}
              stroke="#E7E5E4"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <line
              x1={0}
              y1={yThreshold}
              x2={innerWidth}
              y2={yThreshold}
              stroke="#E7E5E4"
              strokeWidth={2}
              strokeDasharray="4 4"
            />

            {/* Quadrant labels */}
            <text
              x={xThreshold / 2}
              y={yThreshold / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#10b981"
              fontSize={14}
              fontWeight={600}
              opacity={0.7}
            >
              Quick Wins
            </text>
            <text
              x={xThreshold + (innerWidth - xThreshold) / 2}
              y={yThreshold / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#F25C05"
              fontSize={14}
              fontWeight={600}
              opacity={0.7}
            >
              Strategic Bets
            </text>
            <text
              x={xThreshold / 2}
              y={yThreshold + (innerHeight - yThreshold) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#eab308"
              fontSize={14}
              fontWeight={600}
              opacity={0.7}
            >
              Fill-ins
            </text>
            <text
              x={xThreshold + (innerWidth - xThreshold) / 2}
              y={yThreshold + (innerHeight - yThreshold) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6b7280"
              fontSize={14}
              fontWeight={600}
              opacity={0.7}
            >
              Long-term
            </text>

            {/* Axes */}
            <line
              x1={0}
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              stroke="#171614"
              strokeWidth={2}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={innerHeight}
              stroke="#171614"
              strokeWidth={2}
            />

            {/* Data bubbles */}
            {data.map((dim, idx) => {
              const cx = xScale(dim.effort)
              const cy = yScale(dim.impact)
              const r = radiusScale(dim.score)
              const color = getQuadrantColor(dim.quadrant)
              const isHovered = hoveredDimension?.dimension === dim.dimension

              return (
                <circle
                  key={`${dim.dimension}-${idx}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={color}
                  fillOpacity={isHovered ? 0.8 : 0.6}
                  stroke={isHovered ? '#171614' : color}
                  strokeWidth={isHovered ? 2 : 1}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredDimension(dim)}
                  onMouseLeave={() => setHoveredDimension(null)}
                />
              )
            })}
          </g>

          {/* Axis labels */}
          <text
            x={width / 2}
            y={height - 20}
            textAnchor="middle"
            fill="#171614"
            fontSize={14}
            fontWeight={500}
          >
            Implementation Effort →
          </text>
          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            fill="#171614"
            fontSize={14}
            fontWeight={500}
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            Business Impact →
          </text>

          {/* Axis tick labels */}
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* X-axis ticks */}
            <text x={xScale(1)} y={innerHeight + 20} textAnchor="middle" fill="#78716C" fontSize={11}>
              Low
            </text>
            <text x={xScale(3)} y={innerHeight + 20} textAnchor="middle" fill="#78716C" fontSize={11}>
              Medium
            </text>
            <text x={xScale(5)} y={innerHeight + 20} textAnchor="middle" fill="#78716C" fontSize={11}>
              High
            </text>

            {/* Y-axis ticks */}
            <text x={-10} y={yScale(1)} textAnchor="end" dominantBaseline="middle" fill="#78716C" fontSize={11}>
              Low
            </text>
            <text x={-10} y={yScale(3)} textAnchor="end" dominantBaseline="middle" fill="#78716C" fontSize={11}>
              Medium
            </text>
            <text x={-10} y={yScale(5)} textAnchor="end" dominantBaseline="middle" fill="#78716C" fontSize={11}>
              High
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredDimension && (
          <div
            className="absolute pointer-events-none bg-background border border-border rounded-lg px-4 py-3 shadow-lg z-10"
            style={{
              left: mousePosition.x + 15,
              top: mousePosition.y - 80,
              maxWidth: '280px'
            }}
          >
            <div className="space-y-2">
              <div>
                <p className="text-foreground font-semibold text-sm leading-tight">
                  {hoveredDimension.dimension}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {hoveredDimension.pillar}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Impact</p>
                  <p className="text-foreground font-medium">
                    {hoveredDimension.impact.toFixed(1)} / 5.0
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Effort</p>
                  <p className="text-foreground font-medium">
                    {hoveredDimension.effort.toFixed(1)} / 5.0
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current</p>
                  <p className="text-foreground font-medium">
                    {hoveredDimension.score.toFixed(1)} / 5.0
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quadrant</p>
                  <p
                    className="font-medium text-xs"
                    style={{ color: getQuadrantColor(hoveredDimension.quadrant) }}
                  >
                    {getQuadrantLabel(hoveredDimension.quadrant)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <figcaption className="sr-only">
        Priority matrix showing {data.length} dimensions positioned by business impact (vertical) and implementation effort (horizontal).
        Quadrants: Quick Wins (high impact, low effort), Strategic Bets (high impact, high effort),
        Fill-ins (low impact, low effort), and Long-term (low impact, high effort).
      </figcaption>
    </figure>
  )
}
