'use client'

/**
 * RadarChart Component
 *
 * Multi-dimensional radar chart showing pillar scores.
 * Uses Recharts for rendering with responsive design.
 *
 * Part of Report Visual Transformation spec
 */

import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import type { RadarDataPoint } from '@/lib/chart-data-transformers'

interface RadarChartProps {
  data: RadarDataPoint[]
  className?: string
}

export function RadarChart({ data, className = '' }: RadarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-mocha-surface0 rounded-lg ${className}`}>
        <p className="text-mocha-subtext1 text-sm">No data available</p>
      </div>
    )
  }

  return (
    <figure role="img" aria-label="Digital transformation readiness by pillar" className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="#313244" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#cdd6f4', fontSize: 12 }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#F25C05"
            fill="#F25C05"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e1e2e',
              border: '1px solid #313244',
              borderRadius: '8px',
              color: '#cdd6f4'
            }}
            formatter={(value: number) => [`${value.toFixed(1)} / 5.0`, 'Score']}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
      <figcaption className="sr-only">
        Radar chart showing readiness scores across {data.map(d => d.axis).join(', ')}
      </figcaption>
    </figure>
  )
}
