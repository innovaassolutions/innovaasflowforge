/**
 * Brand Theme Generator
 *
 * Transforms tenant brand_config into CSS custom properties for runtime theming.
 * This enables each coach's participant-facing pages to display custom branding
 * without rebuilding the application.
 *
 * Story: 3-2-branding-infrastructure
 */

import type { TenantProfile } from '@/lib/supabase/server'

type BrandConfig = TenantProfile['brand_config']

/**
 * Default brand colors fallback (FlowForge Pearl Vibrant theme)
 */
const defaultColors = {
  primary: '#F25C05',
  primaryHover: '#DC5204',
  secondary: '#1D9BA3',
  background: '#FFFEFB',
  backgroundSubtle: '#FAF8F3',
  text: '#171614',
  textMuted: '#71706B',
  border: '#E6E2D6',
}

/**
 * Default fonts fallback
 */
const defaultFonts = {
  heading: 'Inter',
  body: 'Inter',
}

/**
 * Generate CSS custom properties from brand configuration
 *
 * @param brand - The brand_config from tenant_profiles
 * @returns CSS string to inject into document head
 *
 * @example
 * const css = generateBrandCss(tenant.brand_config)
 * // Returns: :root { --brand-primary: #2D5016; ... }
 */
export function generateBrandCss(brand: BrandConfig | null | undefined): string {
  const colors = brand?.colors ?? defaultColors
  const fonts = brand?.fonts ?? defaultFonts

  return `
    :root {
      /* Brand Colors */
      --brand-primary: ${colors.primary};
      --brand-primary-hover: ${colors.primaryHover};
      --brand-secondary: ${colors.secondary};
      --brand-bg: ${colors.background};
      --brand-bg-subtle: ${colors.backgroundSubtle};
      --brand-text: ${colors.text};
      --brand-text-muted: ${colors.textMuted};
      --brand-border: ${colors.border};

      /* Brand Fonts */
      --brand-font-heading: '${fonts.heading}', serif;
      --brand-font-body: '${fonts.body}', sans-serif;
    }
  `.trim()
}

/**
 * Common Google Fonts mapping for dynamic loading
 * Maps font names to their Google Fonts family parameter
 */
const googleFontsMap: Record<string, string> = {
  'Inter': 'Inter:wght@400;500;600;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
  'Lato': 'Lato:wght@400;700',
  'Roboto': 'Roboto:wght@400;500;700',
  'Open Sans': 'Open+Sans:wght@400;600;700',
  'Montserrat': 'Montserrat:wght@400;500;600;700',
  'Poppins': 'Poppins:wght@400;500;600;700',
  'Raleway': 'Raleway:wght@400;500;600;700',
  'Merriweather': 'Merriweather:wght@400;700',
  'Source Sans Pro': 'Source+Sans+Pro:wght@400;600;700',
  'Nunito': 'Nunito:wght@400;600;700',
  'Quicksand': 'Quicksand:wght@400;500;600;700',
  'Work Sans': 'Work+Sans:wght@400;500;600;700',
  'DM Sans': 'DM+Sans:wght@400;500;600;700',
  'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
}

/**
 * Get Google Fonts URL for brand fonts
 *
 * @param brand - The brand_config from tenant_profiles
 * @returns Google Fonts URL or null if using default Inter font
 */
export function getGoogleFontsUrl(brand: BrandConfig | null | undefined): string | null {
  const fonts = brand?.fonts ?? defaultFonts
  const families: string[] = []

  // Add heading font if not Inter (Inter is already loaded)
  if (fonts.heading !== 'Inter' && googleFontsMap[fonts.heading]) {
    families.push(googleFontsMap[fonts.heading])
  }

  // Add body font if different from heading and not Inter
  if (fonts.body !== fonts.heading && fonts.body !== 'Inter' && googleFontsMap[fonts.body]) {
    families.push(googleFontsMap[fonts.body])
  }

  if (families.length === 0) {
    return null
  }

  return `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join('&')}&display=swap`
}

/**
 * Get font family CSS value with fallbacks
 */
export function getFontFamily(fontName: string, type: 'heading' | 'body'): string {
  const fallback = type === 'heading' ? 'serif' : 'sans-serif'
  return `'${fontName}', ${fallback}`
}

/**
 * Check if brand config has custom colors (not using defaults)
 */
export function hasCustomBranding(brand: BrandConfig | null | undefined): boolean {
  if (!brand?.colors) return false
  return brand.colors.primary !== defaultColors.primary
}
