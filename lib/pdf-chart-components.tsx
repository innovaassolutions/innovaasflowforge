import React from 'react'
import { Svg, Path, Line, Circle, Text as SvgText, G, Rect } from '@joshuajaco/react-pdf-renderer-bundled'
import {
  generateRadarChartPath,
  generateRadarGrid,
  generateRadarAxes,
  generateHorizontalBarChart,
  generateDonutChart,
  getScoreColor,
  type RadarDataPoint,
  type BarDataPoint,
  type DonutDataPoint
} from './pdf-charts'
import { INNOVAAS_BRANDING } from './report-generator'

// ============================================================================
// Radar/Spider Chart Component
// ============================================================================

interface RadarChartProps {
  data: RadarDataPoint[]
  size?: number
  title?: string
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 200, title }) => {
  const { path, points } = generateRadarChartPath(data, size)
  const gridLines = generateRadarGrid(data.length, size)
  const axes = generateRadarAxes(data.length, size)
  const center = size / 2

  return (
    <Svg width={size} height={size + 30} style={{ margin: '10px auto' }}>
      {/* Background grid */}
      {gridLines.map((grid, i) => (
        <Path
          key={`grid-${i}`}
          d={grid.path}
          stroke="#E0E0E0"
          strokeWidth={1}
          fill="none"
        />
      ))}

      {/* Axes */}
      {axes.map((axis, i) => (
        <Line
          key={`axis-${i}`}
          x1={axis.x1}
          y1={axis.y1}
          x2={axis.x2}
          y2={axis.y2}
          stroke="#CCCCCC"
          strokeWidth={1}
        />
      ))}

      {/* Data path */}
      <Path
        d={path}
        stroke={INNOVAAS_BRANDING.colors.primary}
        strokeWidth={2}
        fill={`${INNOVAAS_BRANDING.colors.primary}33`} // 20% opacity
      />

      {/* Data points */}
      {points.map((point, i) => (
        <Circle
          key={`point-${i}`}
          cx={point.x}
          cy={point.y}
          r={4}
          fill={INNOVAAS_BRANDING.colors.primary}
        />
      ))}

      {/* Labels */}
      {points.map((point, i) => {
        const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2
        const labelRadius = size / 2 - 5
        const labelX = center + labelRadius * Math.cos(angle)
        const labelY = center + labelRadius * Math.sin(angle)

        return (
          <SvgText
            key={`label-${i}`}
            x={labelX}
            y={labelY}
            fill={INNOVAAS_BRANDING.colors.darkBackground}
            style={{ fontSize: 8, textAnchor: 'middle' }}
          >
            {point.label}: {point.value.toFixed(1)}
          </SvgText>
        )
      })}

      {/* Title */}
      {title && (
        <SvgText
          x={center}
          y={size + 20}
          fill={INNOVAAS_BRANDING.colors.darkBackground}
          style={{ fontSize: 10, fontWeight: 'bold', textAnchor: 'middle' }}
        >
          {title}
        </SvgText>
      )}
    </Svg>
  )
}

// ============================================================================
// Horizontal Bar Chart Component
// ============================================================================

interface HorizontalBarChartProps {
  data: BarDataPoint[]
  width?: number
  height?: number
  title?: string
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  width = 400,
  height = 300,
  title
}) => {
  const bars = generateHorizontalBarChart(data, width, height)

  return (
    <Svg width={width} height={height + 30} style={{ margin: '10px auto' }}>
      {/* Y-axis line */}
      <Line
        x1={135}
        y1={20}
        x2={135}
        y2={height - 20}
        stroke="#CCCCCC"
        strokeWidth={1}
      />

      {/* Bars */}
      {bars.map((bar, i) => (
        <G key={`bar-${i}`}>
          {/* Bar */}
          <Rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={bar.color}
          />

          {/* Label (left side) */}
          <SvgText
            x={130}
            y={bar.y + bar.height / 2 + 3}
            fill={INNOVAAS_BRANDING.colors.darkBackground}
            style={{ fontSize: 9, textAnchor: 'end' }}
          >
            {bar.label}
          </SvgText>

          {/* Value (on bar) */}
          <SvgText
            x={bar.x + bar.width + 5}
            y={bar.y + bar.height / 2 + 3}
            fill={bar.color}
            style={{ fontSize: 9, fontWeight: 'bold' }}
          >
            {bar.value.toFixed(1)}
          </SvgText>
        </G>
      ))}

      {/* Title */}
      {title && (
        <SvgText
          x={width / 2}
          y={height + 20}
          fill={INNOVAAS_BRANDING.colors.darkBackground}
          style={{ fontSize: 10, fontWeight: 'bold', textAnchor: 'middle' }}
        >
          {title}
        </SvgText>
      )}
    </Svg>
  )
}

// ============================================================================
// Donut Chart Component
// ============================================================================

interface DonutChartProps {
  data: DonutDataPoint[]
  size?: number
  title?: string
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 200, title }) => {
  const segments = generateDonutChart(data, size)
  const center = size / 2

  return (
    <Svg width={size} height={size + 80} style={{ margin: '10px auto' }}>
      {/* Donut segments */}
      <G transform={`translate(${center}, ${center})`}>
        {segments.map((segment, i) => (
          <Path
            key={`segment-${i}`}
            d={segment.path}
            fill={segment.color}
          />
        ))}
      </G>

      {/* Legend */}
      {data.map((item, i) => (
        <G key={`legend-${i}`}>
          {/* Color box */}
          <Rect
            x={10}
            y={size + 10 + i * 15}
            width={10}
            height={10}
            fill={item.color}
          />

          {/* Label */}
          <SvgText
            x={25}
            y={size + 19 + i * 15}
            fill={INNOVAAS_BRANDING.colors.darkBackground}
            style={{ fontSize: 8 }}
          >
            {item.label}: {segments[i].percentage}%
          </SvgText>
        </G>
      ))}

      {/* Title */}
      {title && (
        <SvgText
          x={center}
          y={15}
          fill={INNOVAAS_BRANDING.colors.darkBackground}
          style={{ fontSize: 10, fontWeight: 'bold', textAnchor: 'middle' }}
        >
          {title}
        </SvgText>
      )}
    </Svg>
  )
}

// ============================================================================
// Score Badge Component
// ============================================================================

interface ScoreBadgeProps {
  score: number
  label: string
  x?: number
  y?: number
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, label }) => {
  const color = getScoreColor(score)

  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      {/* Circle background */}
      <Circle
        cx={60}
        cy={60}
        r={50}
        fill={`${color}20`}
        stroke={color}
        strokeWidth={4}
      />

      {/* Score */}
      <SvgText
        x={60}
        y={70}
        fill={color}
        style={{ fontSize: 32, fontWeight: 'bold', textAnchor: 'middle' }}
      >
        {score.toFixed(1)}
      </SvgText>

      {/* Label */}
      <SvgText
        x={60}
        y={95}
        fill={INNOVAAS_BRANDING.colors.darkBackground}
        style={{ fontSize: 10, textAnchor: 'middle' }}
      >
        {label}
      </SvgText>
    </Svg>
  )
}
