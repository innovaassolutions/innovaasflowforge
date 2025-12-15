'use client'

/**
 * ExecutiveOnePager Component
 *
 * McKinsey/BCG-style executive summary that tells complete story in 60 seconds.
 * Includes hero metric, priority matrix, strategic imperatives, and key insights.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

import type { ReadinessAssessment } from '@/lib/agents/synthesis-agent'
import {
  transformToMatrixData,
  extractTopImperatives,
  generateStrategicInsights,
  transformToRoadmapData,
  getQuadrantColor,
  getQuadrantLabel
} from '@/lib/consulting-data-transformers'
import { DisplayHeading, Subtitle, Caption, InsightCallout } from '@/components/reports/layout'
import { HeroGrid } from '@/components/reports/layout'
import { useMemo } from 'react'

interface ExecutiveOnePagerProps {
  assessment: ReadinessAssessment
  className?: string
}

export function ExecutiveOnePager({ assessment, className = '' }: ExecutiveOnePagerProps) {
  // Transform data
  const matrixData = useMemo(() => transformToMatrixData(assessment), [assessment])
  const topImperatives = useMemo(() => extractTopImperatives(assessment, 3), [assessment])
  const strategicInsights = useMemo(() => generateStrategicInsights(assessment), [assessment])
  const roadmapInitiatives = useMemo(() => transformToRoadmapData(assessment), [assessment])

  // Count quick wins
  const quickWinsCount = matrixData.filter(d => d.quadrant === 'quick-wins').length

  // Get overall readiness context
  const getReadinessContext = (score: number): string => {
    if (score < 2) return 'Early Stage - Building Foundation'
    if (score < 3) return 'Developing - Key Gaps to Address'
    if (score < 4) return 'Maturing - Ready for Strategic Investments'
    return 'Advanced - Optimization Focus'
  }

  return (
    <section className={`min-h-screen bg-background py-25 ${className}`}>
      <div className="max-w-[1600px] mx-auto px-[100px]">
        {/* Page Title */}
        <div className="text-center mb-20">
          <DisplayHeading className="text-foreground">
            Executive Summary
          </DisplayHeading>
          <Subtitle className="text-muted-foreground mt-4">
            Digital Transformation Readiness Assessment
          </Subtitle>
        </div>

        {/* Hero Metric */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <div className="relative">
              {/* Score Circle */}
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-brand-orange to-brand-teal p-1 mx-auto">
                <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center">
                  <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-teal">
                    {assessment.overallScore.toFixed(1)}
                  </div>
                  <div className="text-muted-foreground text-sm mt-2">out of 5.0</div>
                </div>
              </div>

              {/* Context Label */}
              <div className="mt-6">
                <p className="text-xl font-semibold text-foreground">
                  {getReadinessContext(assessment.overallScore)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Imperatives + Mini Matrix */}
        <HeroGrid className="mb-16">
          {/* Mini Priority Matrix */}
          <div className="lg:col-span-5 bg-card rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Priority Matrix</h3>
            <MiniPriorityMatrix data={matrixData.slice(0, 12)} />
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
                <span className="text-foreground">{quickWinsCount} Quick Wins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F25C05' }} />
                <span className="text-foreground">Strategic Bets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
                <span className="text-foreground">Fill-ins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }} />
                <span className="text-foreground">Long-term</span>
              </div>
            </div>
          </div>

          {/* Top 3 Strategic Imperatives */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-2xl font-bold text-foreground mb-6">Strategic Imperatives</h3>
            {topImperatives.map((imperative, idx) => (
              <div
                key={idx}
                className="bg-card rounded-lg p-6 border-l-4"
                style={{
                  borderColor: imperative.impact === 'high'
                    ? '#10b981'
                    : imperative.impact === 'medium'
                    ? '#eab308'
                    : '#6b7280'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: imperative.impact === 'high'
                          ? '#10b981'
                          : imperative.impact === 'medium'
                          ? '#eab308'
                          : '#6b7280'
                      }}
                    >
                      {idx + 1}
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">
                      {imperative.title}
                    </h4>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {imperative.timeframe}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed ml-11">
                  {imperative.description}
                </p>
              </div>
            ))}
          </div>
        </HeroGrid>

        {/* Critical Path - Simplified Roadmap */}
        <div className="mb-16 bg-card rounded-lg p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Critical Path Forward</h3>
          <SimplifiedRoadmap initiatives={roadmapInitiatives.slice(0, 8)} />
        </div>

        {/* Strategic Insights - "So What?" */}
        <InsightCallout title="Key Insights" className="mb-0">
          <ul className="space-y-3">
            {strategicInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-foreground leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </InsightCallout>
      </div>
    </section>
  )
}

/**
 * Mini priority matrix visualization
 */
function MiniPriorityMatrix({ data }: { data: ReturnType<typeof transformToMatrixData> }) {
  const size = 280
  const margin = 20
  const innerSize = size - margin * 2

  return (
    <svg width={size} height={size} className="mx-auto">
      <g transform={`translate(${margin}, ${margin})`}>
        {/* Quadrant backgrounds */}
        <rect x={0} y={0} width={innerSize/2} height={innerSize/2} fill="#1a2e2a" opacity={0.3} />
        <rect x={innerSize/2} y={0} width={innerSize/2} height={innerSize/2} fill="#2e1f1a" opacity={0.3} />
        <rect x={0} y={innerSize/2} width={innerSize/2} height={innerSize/2} fill="#2e2a1a" opacity={0.3} />
        <rect x={innerSize/2} y={innerSize/2} width={innerSize/2} height={innerSize/2} fill="#25252e" opacity={0.3} />

        {/* Grid lines */}
        <line x1={innerSize/2} y1={0} x2={innerSize/2} y2={innerSize} stroke="#E7E5E4" strokeWidth={1} strokeDasharray="2 2" />
        <line x1={0} y1={innerSize/2} x2={innerSize} y2={innerSize/2} stroke="#E7E5E4" strokeWidth={1} strokeDasharray="2 2" />

        {/* Data points */}
        {data.map((dim, idx) => {
          const x = ((dim.effort - 1) / 4) * innerSize
          const y = innerSize - ((dim.impact - 1) / 4) * innerSize
          const r = 4 + (dim.score / 5) * 4
          const color = getQuadrantColor(dim.quadrant)

          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={r}
              fill={color}
              opacity={0.7}
            />
          )
        })}

        {/* Axes */}
        <line x1={0} y1={innerSize} x2={innerSize} y2={innerSize} stroke="#171614" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={innerSize} stroke="#171614" strokeWidth={1} />

        {/* Labels */}
        <text x={innerSize/2} y={innerSize + 15} textAnchor="middle" fill="#171614" fontSize={10}>
          Effort →
        </text>
        <text x={-10} y={innerSize/2} textAnchor="end" fill="#171614" fontSize={10} transform={`rotate(-90, -10, ${innerSize/2})`}>
          Impact →
        </text>
      </g>
    </svg>
  )
}

/**
 * Simplified roadmap timeline
 */
function SimplifiedRoadmap({ initiatives }: { initiatives: ReturnType<typeof transformToRoadmapData> }) {
  const phases = ['Foundation', 'Build', 'Scale']

  return (
    <div className="space-y-4">
      {phases.map((phase, phaseIdx) => {
        const phaseInitiatives = initiatives.filter(i => i.phase === phase.toLowerCase())

        if (phaseInitiatives.length === 0) return null

        return (
          <div key={phase}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand-orange" />
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {phase}
              </h4>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-5">
              {phaseInitiatives.slice(0, 4).map((initiative, idx) => (
                <div
                  key={idx}
                  className="bg-muted rounded px-3 py-2"
                >
                  <p className="text-xs text-foreground font-medium leading-tight">
                    {initiative.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {initiative.durationWeeks}w
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
