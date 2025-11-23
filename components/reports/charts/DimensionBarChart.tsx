'use client'

/**
 * DimensionBarChart Component
 *
 * Horizontal bar chart showing dimension scores with color coding.
 * Uses Recharts for rendering with responsive design.
 *
 * Part of Report Visual Transformation spec
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { BarDataPoint } from '@/lib/chart-data-transformers'

interface DimensionBarChartProps {
  data: BarDataPoint[]
  className?: string
}

export function DimensionBarChart({ data, className = '' }: DimensionBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-mocha-surface0 rounded-lg ${className}`}>
        <p className="text-mocha-subtext1 text-sm">No data available</p>
      </div>
    )
  }

  return (
    <figure role="img" aria-label="Dimension scores comparison" className={className}>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 50)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#313244" />
          <XAxis
            type="number"
            domain={[0, 5]}
            tick={{ fill: '#cdd6f4', fontSize: 11 }}
            label={{ value: 'Score (0-5)', position: 'insideBottom', offset: -5, fill: '#cdd6f4' }}
          />
          <YAxis
            type="category"
            dataKey="dimension"
            tick={{ fill: '#cdd6f4', fontSize: 11 }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e1e2e',
              border: '1px solid #313244',
              borderRadius: '8px',
              color: '#cdd6f4'
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(1)} / 5.0`,
              `${props.payload.pillar} - ${props.payload.dimension}`
            ]}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <figcaption className="sr-only">
        Bar chart comparing dimension scores across {data.length} dimensions
      </figcaption>
    </figure>
  )
}
