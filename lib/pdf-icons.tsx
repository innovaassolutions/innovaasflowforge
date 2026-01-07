import React from 'react'
import { Svg, Path, Circle, Rect, G } from '@react-pdf/renderer'
import { INNOVAAS_BRANDING } from './report-generator'

interface IconProps {
  size?: number
  color?: string
}

// ============================================================================
// Technology Icons
// ============================================================================

export const TechnologyIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.primary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3ZM20 19H4V5H20V19ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17ZM16 9C17.1 9 18 8.1 18 7C18 5.9 17.1 5 16 5C14.9 5 14 5.9 14 7C14 8.1 14.9 9 16 9ZM8 9C9.1 9 10 8.1 10 7C10 5.9 9.1 5 8 5C6.9 5 6 5.9 6 7C6 8.1 6.9 9 8 9Z"
      fill={color}
    />
  </Svg>
)

export const DataIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.primary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z"
      fill={color}
    />
  </Svg>
)

export const CloudIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.primary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18Z"
      fill={color}
    />
  </Svg>
)

// ============================================================================
// Process Icons
// ============================================================================

export const ProcessIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.secondary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM16 17.01V10H14V17.01H11L15 21L19 17.01H16Z"
      fill={color}
    />
  </Svg>
)

export const IntegrationIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.secondary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="18" cy="12" r="3" fill={color} />
    <Circle cx="6" cy="12" r="3" fill={color} />
    <Rect x="8" y="11" width="8" height="2" fill={color} />
  </Svg>
)

export const SupplyChainIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.secondary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM6 18C5.45 18 5 17.55 5 17C5 16.45 5.45 16 6 16C6.55 16 7 16.45 7 17C7 17.55 6.55 18 6 18ZM19 9.5L20.96 12H17V9.5H19ZM18 18C17.45 18 17 17.55 17 17C17 16.45 17.45 16 18 16C18.55 16 19 16.45 19 17C19 17.55 18.55 18 18 18Z"
      fill={color}
    />
  </Svg>
)

// ============================================================================
// Organization Icons
// ============================================================================

export const PeopleIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.secondary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
      fill={color}
    />
  </Svg>
)

export const StrategyIcon: React.FC<IconProps> = ({
  size = 40,
  color = INNOVAAS_BRANDING.colors.secondary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 11.75C6.66 11.75 2 12.92 2 15.25V17H16V15.25C16 12.92 11.34 11.75 9 11.75ZM4.34 15C5.18 14.42 7.21 13.75 9 13.75C10.79 13.75 12.82 14.42 13.66 15H4.34ZM9 10C10.93 10 12.5 8.43 12.5 6.5C12.5 4.57 10.93 3 9 3C7.07 3 5.5 4.57 5.5 6.5C5.5 8.43 7.07 10 9 10ZM9 5C9.83 5 10.5 5.67 10.5 6.5C10.5 7.33 9.83 8 9 8C8.17 8 7.5 7.33 7.5 6.5C7.5 5.67 8.17 5 9 5ZM16.04 13.81C17.2 14.65 18 15.77 18 17H22V15.25C22 13.23 18.5 12.08 16.04 13.81ZM15 10C16.93 10 18.5 8.43 18.5 6.5C18.5 4.57 16.93 3 15 3C14.46 3 13.96 3.13 13.5 3.35C14.13 4.24 14.5 5.33 14.5 6.5C14.5 7.67 14.13 8.76 13.5 9.65C13.96 9.87 14.46 10 15 10Z"
      fill={color}
    />
  </Svg>
)

// ============================================================================
// Assessment/Score Icons
// ============================================================================

export const CheckmarkIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#4CAF50'
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
      fill={color}
    />
  </Svg>
)

export const WarningIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#FF9800'
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
      fill={color}
    />
  </Svg>
)

export const StarIcon: React.FC<IconProps> = ({
  size = 24,
  color = INNOVAAS_BRANDING.colors.primary
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
      fill={color}
    />
  </Svg>
)

// ============================================================================
// Decorative Elements
// ============================================================================

export const DividerLine: React.FC<{ width?: number; color?: string }> = ({
  width = 400,
  color = INNOVAAS_BRANDING.colors.primary
}) => (
  <Svg width={width} height={4} style={{ margin: '10px 0' }}>
    <Rect x={0} y={1} width={width} height={2} fill={color} />
  </Svg>
)

export const DotPattern: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <Svg width={size} height={size}>
    {Array.from({ length: 10 }).map((_, row) =>
      Array.from({ length: 10 }).map((_, col) => (
        <Circle
          key={`${row}-${col}`}
          cx={5 + col * 10}
          cy={5 + row * 10}
          r={1.5}
          fill={`${INNOVAAS_BRANDING.colors.primary}20`}
        />
      ))
    )}
  </Svg>
)
