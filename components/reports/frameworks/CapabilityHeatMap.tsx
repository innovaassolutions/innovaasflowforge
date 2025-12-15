'use client'

/**
 * CapabilityHeatMap Component
 *
 * McKinsey/BCG-style capability heat map showing maturity across pillars and dimensions.
 * CSS Grid-based visualization with color intensity representing scores.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { useState } from 'react'
import type { HeatMapCell } from '@/lib/consulting-data-transformers'

interface CapabilityHeatMapProps {
  data: HeatMapCell[][]
  className?: string
}

export function CapabilityHeatMap({ data, className = '' }: CapabilityHeatMapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatMapCell | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-card rounded-lg ${className}`}>
        <p className="text-muted-foreground text-sm">No data available for heat map</p>
      </div>
    )
  }

  // Extract unique pillar names from first row
  const pillars = data[0]?.map(cell => cell.pillar) || []
  const numRows = data.length
  const numCols = pillars.length

  // Get cell color based on score
  const getCellColor = (score: number): string => {
    if (score >= 4.0) return '#10b981' // Green - strong
    if (score >= 3.0) return '#eab308' // Yellow - developing
    if (score >= 2.0) return '#f97316' // Orange - emerging
    return '#ef4444' // Red - nascent
  }

  // Calculate opacity based on intensity (0-100)
  const getOpacity = (intensity: number): number => {
    return 0.3 + (intensity / 100) * 0.6 // Range: 0.3 to 0.9
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <figure
      role="img"
      aria-label="Capability heat map showing maturity scores across pillars and dimensions"
      className={className}
    >
      <div className="relative overflow-x-auto" onMouseMove={handleMouseMove}>
        {/* Heat map grid */}
        <div className="inline-block min-w-full">
          {/* Column headers (pillars) */}
          <div
            className="grid gap-1 mb-1"
            style={{
              gridTemplateColumns: `200px repeat(${numCols}, 140px)`
            }}
          >
            <div className="h-20" /> {/* Empty corner cell */}
            {pillars.map((pillar, idx) => (
              <div
                key={`header-${idx}`}
                className="h-20 flex items-center justify-center bg-card rounded-t-lg px-2"
              >
                <p className="text-foreground font-semibold text-sm text-center leading-tight">
                  {pillar}
                </p>
              </div>
            ))}
          </div>

          {/* Heat map rows */}
          {data.map((row, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="grid gap-1 mb-1"
              style={{
                gridTemplateColumns: `200px repeat(${numCols}, 140px)`
              }}
            >
              {/* Row header (dimension name from first cell) */}
              <div className="h-24 flex items-center px-4 bg-card rounded-l-lg">
                <p className="text-foreground text-sm font-medium leading-tight">
                  {row[0]?.dimension || `Dimension ${rowIdx + 1}`}
                </p>
              </div>

              {/* Heat map cells */}
              {row.map((cell, colIdx) => {
                const color = getCellColor(cell.score)
                const opacity = getOpacity(cell.intensity)
                const isHovered = hoveredCell?.dimension === cell.dimension &&
                                  hoveredCell?.pillar === cell.pillar

                return (
                  <div
                    key={`cell-${rowIdx}-${colIdx}`}
                    className="h-24 flex flex-col items-center justify-center rounded cursor-pointer transition-all duration-200 border-2"
                    style={{
                      backgroundColor: color,
                      opacity: isHovered ? 1 : opacity,
                      borderColor: isHovered ? '#171614' : 'transparent',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <p className="text-white font-bold text-2xl drop-shadow-lg">
                      {cell.score.toFixed(1)}
                    </p>
                    <p className="text-white text-xs mt-1 opacity-90">
                      Gap: {cell.gap.toFixed(1)}
                    </p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredCell && (
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
                  {hoveredCell.dimension}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {hoveredCell.pillar}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Current Score</p>
                  <p className="text-foreground font-medium">
                    {hoveredCell.score.toFixed(1)} / 5.0
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gap to Target</p>
                  <p className="text-foreground font-medium">
                    {hoveredCell.gap.toFixed(1)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Maturity Level</p>
                  <p className="text-foreground font-medium">
                    {hoveredCell.score >= 4.0 ? 'Expert' :
                     hoveredCell.score >= 3.0 ? 'Experienced' :
                     hoveredCell.score >= 2.0 ? 'Intermediate' :
                     hoveredCell.score >= 1.0 ? 'Beginner' : 'Newcomer'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 px-4 py-3 bg-card rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#10b981' }} />
          <span className="text-foreground text-sm">Expert (4.0-5.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#eab308' }} />
          <span className="text-foreground text-sm">Experienced (3.0-3.9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f97316' }} />
          <span className="text-foreground text-sm">Intermediate (2.0-2.9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-foreground text-sm">Beginner (0-1.9)</span>
        </div>
      </div>

      <figcaption className="sr-only">
        Heat map showing capability maturity across {pillars.length} pillars and {numRows} dimensions.
        Color intensity indicates score level from red (low) to green (high).
      </figcaption>
    </figure>
  )
}
