/**
 * Consulting Grid System
 *
 * McKinsey/BCG-style multi-column layout system with precise spacing.
 * Implements professional consulting presentation standards.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

/**
 * Grid configuration based on McKinsey/BCG standards
 */
export const gridConfig = {
  // Container widths
  maxWidth: 1600, // Maximum content width
  marginOuter: 100, // Left/right margins
  gutter: 40, // Space between columns

  // Column counts for different layouts
  columns: {
    single: 1,
    twoColumn: 2,
    threeColumn: 3,
    fourColumn: 4,
    asymmetric: [1, 2], // 1:2 ratio (e.g., sidebar + main content)
  },

  // Vertical spacing
  sectionSpacing: 100, // Space between major sections
  blockSpacing: 60, // Space between content blocks
  elementSpacing: 40, // Space between elements

  // Typography spacing
  headingMargin: 24,
  paragraphMargin: 16,
  listMargin: 12,
}

/**
 * Generate CSS Grid template columns for consulting layouts
 */
export function getGridTemplateColumns(layout: keyof typeof gridConfig.columns | number[]): string {
  if (Array.isArray(layout)) {
    // Custom ratio (e.g., [1, 2] for 1:2 ratio)
    return layout.map(ratio => `${ratio}fr`).join(' ')
  }

  const columnCount = typeof layout === 'number' ? layout : gridConfig.columns[layout]

  if (typeof columnCount === 'number') {
    return `repeat(${columnCount}, 1fr)`
  }

  // Asymmetric layout
  return (columnCount as number[]).map(ratio => `${ratio}fr`).join(' ')
}

/**
 * CSS classes for consulting grid layouts
 */
export const gridClasses = {
  // Container
  container: `mx-auto`,

  // Basic grids
  singleColumn: 'grid grid-cols-1',
  twoColumn: 'grid grid-cols-1 lg:grid-cols-2',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fourColumn: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',

  // Asymmetric layouts
  sidebarMain: 'grid grid-cols-1 lg:grid-cols-[300px_1fr]', // Fixed sidebar + fluid main
  mainSidebar: 'grid grid-cols-1 lg:grid-cols-[1fr_300px]', // Fluid main + fixed sidebar
  narrowWide: 'grid grid-cols-1 lg:grid-cols-[1fr_2fr]', // 1:2 ratio

  // Gaps
  gapLarge: 'gap-10', // 40px
  gapMedium: 'gap-6', // 24px
  gapSmall: 'gap-4', // 16px

  // Section spacing
  sectionY: 'py-25', // 100px vertical
  blockY: 'py-15', // 60px vertical
  elementY: 'py-10', // 40px vertical
}

/**
 * Typography scale for consulting reports
 * Based on McKinsey/BCG presentation standards
 */
export const typography = {
  display: {
    size: 'text-5xl', // 48px
    weight: 'font-bold',
    lineHeight: 'leading-tight', // 1.2
    letterSpacing: 'tracking-tight',
    margin: 'mb-8'
  },
  headline: {
    size: 'text-4xl', // 36px
    weight: 'font-bold',
    lineHeight: 'leading-tight', // 1.3
    letterSpacing: 'tracking-tight',
    margin: 'mb-6'
  },
  title: {
    size: 'text-2xl', // 24px
    weight: 'font-semibold',
    lineHeight: 'leading-snug', // 1.4
    letterSpacing: '',
    margin: 'mb-4'
  },
  subtitle: {
    size: 'text-lg', // 18px
    weight: 'font-medium',
    lineHeight: 'leading-normal', // 1.5
    letterSpacing: '',
    margin: 'mb-3'
  },
  body: {
    size: 'text-base', // 16px
    weight: 'font-normal',
    lineHeight: 'leading-relaxed', // 1.6
    letterSpacing: '',
    margin: 'mb-4'
  },
  caption: {
    size: 'text-sm', // 14px
    weight: 'font-normal',
    lineHeight: 'leading-normal', // 1.5
    letterSpacing: '',
    margin: 'mb-2'
  }
}

/**
 * Get complete typography classes for a given level
 */
export function getTypographyClasses(level: keyof typeof typography): string {
  const styles = typography[level]
  return `${styles.size} ${styles.weight} ${styles.lineHeight} ${styles.letterSpacing || ''} ${styles.margin}`
}

/**
 * White space utility classes
 */
export const whiteSpace = {
  // Margins (based on 4px baseline)
  m0: 'm-0',
  m1: 'm-1', // 4px
  m2: 'm-2', // 8px
  m3: 'm-3', // 12px
  m4: 'm-4', // 16px
  m6: 'm-6', // 24px
  m10: 'm-10', // 40px
  m15: 'm-15', // 60px
  m25: 'm-25', // 100px

  // Padding
  p0: 'p-0',
  p1: 'p-1',
  p2: 'p-2',
  p3: 'p-3',
  p4: 'p-4',
  p6: 'p-6',
  p10: 'p-10',
  p15: 'p-15',
  p25: 'p-25',

  // Gaps (for flexbox/grid)
  gap1: 'gap-1',
  gap2: 'gap-2',
  gap3: 'gap-3',
  gap4: 'gap-4',
  gap6: 'gap-6',
  gap10: 'gap-10',
  gap15: 'gap-15',
}

/**
 * Consulting-style visual accents
 */
export const visualAccents = {
  // Dividers
  dividerThin: 'border-t border-mocha-surface1',
  dividerThick: 'border-t-2 border-mocha-surface2',
  dividerAccent: 'border-t-2 border-brand-orange',

  // Pull quotes
  pullQuote: 'border-l-4 border-brand-orange pl-6 italic text-xl text-mocha-text',

  // Callout boxes
  calloutInfo: 'border-l-4 border-brand-teal bg-mocha-surface0 p-6 rounded-r',
  calloutWarning: 'border-l-4 border-yellow-500 bg-mocha-surface0 p-6 rounded-r',
  calloutSuccess: 'border-l-4 border-green-500 bg-mocha-surface0 p-6 rounded-r',

  // Section headers
  sectionHeader: 'border-b-2 border-mocha-surface2 pb-4 mb-8',

  // Cards
  card: 'bg-mocha-surface0 rounded-lg p-6 shadow-sm',
  cardElevated: 'bg-mocha-surface0 rounded-lg p-8 shadow-lg',
}

/**
 * Page structure helpers
 */
export const pageStructure = {
  // Full-page containers
  page: `min-h-screen bg-mocha-base`,
  pageContent: `max-w-[${gridConfig.maxWidth}px] mx-auto px-[${gridConfig.marginOuter}px]`,

  // Sections
  section: `py-[${gridConfig.sectionSpacing}px]`,
  sectionNarrow: `py-[${gridConfig.blockSpacing}px]`,

  // Content blocks
  block: `mb-[${gridConfig.blockSpacing}px]`,
  element: `mb-[${gridConfig.elementSpacing}px]`,
}
