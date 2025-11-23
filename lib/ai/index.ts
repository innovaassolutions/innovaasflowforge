/**
 * AI Utilities
 *
 * Google Gemini-powered illustration generation for consulting-grade reports.
 * Provides SVG generation with caching and fallback mechanisms.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

export {
  generateIllustration,
  generatePillarIllustration,
  generateFrameworkDiagram,
  generateIllustrationWithFallback,
  getPlaceholderSVG,
  type IllustrationStyle,
  type IllustrationOptions
} from './illustration-generator'

export {
  imageCache,
  generateCacheKey
} from './image-cache'

export {
  genAI,
  getImageGenerationModel,
  imageGenerationConfig
} from './gemini-client'
