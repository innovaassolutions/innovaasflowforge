'use client'

/**
 * TransformationRoadmap Component
 *
 * McKinsey/BCG-style transformation roadmap with phased initiatives.
 * Gantt-style timeline showing Foundation → Build → Scale phases.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import { useState } from 'react'
import type { RoadmapInitiative } from '@/lib/consulting-data-transformers'

interface TransformationRoadmapProps {
  data: RoadmapInitiative[]
  className?: string
}

export function TransformationRoadmap({ data, className = '' }: TransformationRoadmapProps) {
  const [hoveredInitiative, setHoveredInitiative] = useState<RoadmapInitiative | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-mocha-surface0 rounded-lg ${className}`}>
        <p className="text-mocha-subtext1 text-sm">No roadmap data available</p>
      </div>
    )
  }

  // Phase boundaries (weeks)
  const phaseBoundaries = {
    foundation: { start: 0, end: 12, label: 'Foundation (0-3 months)' },
    build: { start: 12, end: 26, label: 'Build (3-6 months)' },
    scale: { start: 26, end: 52, label: 'Scale (6-12 months)' }
  }

  // Timeline dimensions
  const totalWeeks = 52
  const weekWidth = 12 // pixels per week
  const timelineWidth = totalWeeks * weekWidth
  const rowHeight = 50
  const headerHeight = 80

  // Type colors
  const getTypeColor = (type: RoadmapInitiative['type']): string => {
    switch (type) {
      case 'quick-win':
        return '#10b981' // Green
      case 'strategic':
        return '#F25C05' // Orange
      case 'transformative':
        return '#1D9BA3' // Teal
      default:
        return '#6b7280' // Gray
    }
  }

  // Get phase color
  const getPhaseColor = (phase: RoadmapInitiative['phase']): string => {
    switch (phase) {
      case 'foundation':
        return '#10b98120' // Green tint
      case 'build':
        return '#F25C0520' // Orange tint
      case 'scale':
        return '#1D9BA320' // Teal tint
      default:
        return '#31324420'
    }
  }

  // Group initiatives by phase
  const initiativesByPhase = {
    foundation: data.filter(i => i.phase === 'foundation'),
    build: data.filter(i => i.phase === 'build'),
    scale: data.filter(i => i.phase === 'scale')
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
      aria-label="Transformation roadmap showing phased implementation timeline"
      className={className}
    >
      <div className="relative overflow-x-auto bg-mocha-surface0 rounded-lg p-6">
        <div className="min-w-max" onMouseMove={handleMouseMove}>
          {/* Timeline header */}
          <div className="mb-4" style={{ width: timelineWidth + 200 }}>
            <div className="flex">
              {/* Initiative label column */}
              <div style={{ width: 200 }} />

              {/* Timeline axis */}
              <div className="relative" style={{ width: timelineWidth }}>
                {/* Month markers */}
                <div className="flex justify-between text-mocha-subtext0 text-xs font-medium mb-2">
                  <span>Month 1</span>
                  <span>Month 3</span>
                  <span>Month 6</span>
                  <span>Month 9</span>
                  <span>Month 12</span>
                </div>

                {/* Phase backgrounds */}
                <div className="absolute top-6 left-0 right-0 h-2 flex">
                  {Object.entries(phaseBoundaries).map(([phase, bounds]) => (
                    <div
                      key={phase}
                      style={{
                        width: `${((bounds.end - bounds.start) / totalWeeks) * 100}%`,
                        backgroundColor: getPhaseColor(phase as RoadmapInitiative['phase'])
                      }}
                      className="border-r border-mocha-surface2"
                    />
                  ))}
                </div>

                {/* Phase labels */}
                <div className="absolute top-12 left-0 right-0 flex text-xs font-semibold">
                  {Object.entries(phaseBoundaries).map(([phase, bounds]) => (
                    <div
                      key={phase}
                      style={{
                        width: `${((bounds.end - bounds.start) / totalWeeks) * 100}%`
                      }}
                      className="text-center text-mocha-text"
                    >
                      {bounds.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Initiatives */}
          <div className="space-y-1" style={{ marginTop: headerHeight }}>
            {(Object.keys(phaseBoundaries) as Array<keyof typeof phaseBoundaries>).map((phase) =>
              initiativesByPhase[phase].map((initiative, idx) => {
                const startX = (initiative.startWeek / totalWeeks) * timelineWidth
                const width = (initiative.durationWeeks / totalWeeks) * timelineWidth
                const color = getTypeColor(initiative.type)
                const isHovered = hoveredInitiative === initiative

                return (
                  <div key={`${phase}-${idx}`} className="flex items-center" style={{ height: rowHeight }}>
                    {/* Initiative name */}
                    <div
                      style={{ width: 200 }}
                      className="pr-4 text-mocha-text text-sm font-medium truncate"
                    >
                      {initiative.name}
                    </div>

                    {/* Timeline bar */}
                    <div className="relative" style={{ width: timelineWidth }}>
                      {/* Phase background */}
                      <div
                        className="absolute inset-0 rounded"
                        style={{ backgroundColor: getPhaseColor(phase) }}
                      />

                      {/* Initiative bar */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 rounded cursor-pointer transition-all duration-200"
                        style={{
                          left: startX,
                          width: width,
                          height: isHovered ? 32 : 28,
                          backgroundColor: color,
                          opacity: isHovered ? 1 : 0.8,
                          border: isHovered ? '2px solid #cdd6f4' : 'none',
                          boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                        }}
                        onMouseEnter={() => setHoveredInitiative(initiative)}
                        onMouseLeave={() => setHoveredInitiative(null)}
                      >
                        <div className="flex items-center justify-center h-full px-2">
                          <span className="text-white text-xs font-medium truncate">
                            {initiative.durationWeeks}w
                          </span>
                        </div>
                      </div>

                      {/* Week grid lines (every 4 weeks) */}
                      {[...Array(13)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-l border-mocha-surface2"
                          style={{ left: (i * 4 * weekWidth) }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Tooltip */}
          {hoveredInitiative && (
            <div
              className="absolute pointer-events-none bg-mocha-base border border-mocha-surface2 rounded-lg px-4 py-3 shadow-lg z-10"
              style={{
                left: mousePosition.x + 15,
                top: mousePosition.y - 100,
                maxWidth: '300px'
              }}
            >
              <div className="space-y-2">
                <div>
                  <p className="text-mocha-text font-semibold text-sm leading-tight">
                    {hoveredInitiative.name}
                  </p>
                  <p className="text-mocha-subtext1 text-xs mt-1">
                    {hoveredInitiative.pillar}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-mocha-subtext0">Phase</p>
                    <p className="text-mocha-text font-medium capitalize">
                      {hoveredInitiative.phase}
                    </p>
                  </div>
                  <div>
                    <p className="text-mocha-subtext0">Type</p>
                    <p
                      className="font-medium capitalize"
                      style={{ color: getTypeColor(hoveredInitiative.type) }}
                    >
                      {hoveredInitiative.type.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-mocha-subtext0">Start</p>
                    <p className="text-mocha-text font-medium">
                      Week {hoveredInitiative.startWeek}
                    </p>
                  </div>
                  <div>
                    <p className="text-mocha-subtext0">Duration</p>
                    <p className="text-mocha-text font-medium">
                      {hoveredInitiative.durationWeeks} weeks
                    </p>
                  </div>
                </div>
                {hoveredInitiative.dimensions.length > 0 && (
                  <div className="text-xs pt-2 border-t border-mocha-surface2">
                    <p className="text-mocha-subtext0 mb-1">Dimensions:</p>
                    <p className="text-mocha-text">
                      {hoveredInitiative.dimensions.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 px-4 py-3 bg-mocha-surface0 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#10b981' }} />
          <span className="text-mocha-text text-sm">Quick Win</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#F25C05' }} />
          <span className="text-mocha-text text-sm">Strategic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#1D9BA3' }} />
          <span className="text-mocha-text text-sm">Transformative</span>
        </div>
      </div>

      <figcaption className="sr-only">
        Transformation roadmap showing {data.length} initiatives across three phases:
        Foundation (0-3 months), Build (3-6 months), and Scale (6-12 months).
        Initiative types include quick wins, strategic investments, and transformative changes.
      </figcaption>
    </figure>
  )
}
