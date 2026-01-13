/**
 * Cost Calculator Service
 *
 * Calculates AI usage costs based on model pricing data.
 * Implements in-memory caching with 5-minute TTL for performance.
 *
 * Story: billing-1-3-implement-cost-calculation-service
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Types
// ============================================================================

export interface ModelPricing {
  id: string
  provider: string
  modelId: string
  displayName: string | null
  inputRatePerMillion: number  // USD per 1M input tokens
  outputRatePerMillion: number // USD per 1M output tokens
  effectiveDate: Date
  isActive: boolean
}

interface CachedPricing {
  pricing: ModelPricing
  timestamp: number
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// ============================================================================
// Cache
// ============================================================================

const pricingCache = new Map<string, CachedPricing>()

// ============================================================================
// Database Client
// ============================================================================

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Fetch pricing from database for a specific model
 */
async function fetchPricingFromDb(modelId: string): Promise<ModelPricing | null> {
  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('model_pricing')
    .select('*')
    .eq('model_id', modelId)
    .eq('is_active', true)
    .order('effective_date', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    provider: data.provider,
    modelId: data.model_id,
    displayName: data.display_name,
    inputRatePerMillion: parseFloat(data.input_rate_per_million),
    outputRatePerMillion: parseFloat(data.output_rate_per_million),
    effectiveDate: new Date(data.effective_date),
    isActive: data.is_active,
  }
}

/**
 * Get model pricing with caching
 *
 * Checks in-memory cache first, falls back to database query.
 * Cache entries expire after 5 minutes (CACHE_TTL_MS).
 */
export async function getModelPricing(modelId: string): Promise<ModelPricing | null> {
  // Check cache first
  const cached = pricingCache.get(modelId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.pricing
  }

  // Cache miss - query database
  const pricing = await fetchPricingFromDb(modelId)

  if (pricing) {
    pricingCache.set(modelId, { pricing, timestamp: Date.now() })
  }

  return pricing
}

/**
 * Calculate cost in cents for given token usage
 *
 * Formula: cost_cents = (input × inputRate + output × outputRate) / 1M × 100
 *
 * @param modelId - The AI model identifier (e.g., 'claude-sonnet-4-20250514')
 * @param inputTokens - Number of input/prompt tokens
 * @param outputTokens - Number of output/completion tokens
 * @returns Cost in integer cents, or 0 if model not found
 */
export async function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  // Handle edge cases
  if (!modelId || (inputTokens <= 0 && outputTokens <= 0)) {
    return 0
  }

  // Ensure non-negative values
  const safeInputTokens = Math.max(0, inputTokens || 0)
  const safeOutputTokens = Math.max(0, outputTokens || 0)

  // Get pricing
  const pricing = await getModelPricing(modelId)

  if (!pricing) {
    console.warn(`[CostCalculator] Model not found in pricing table: ${modelId}`)
    return 0
  }

  // Calculate cost in USD
  const costUsd =
    (safeInputTokens * pricing.inputRatePerMillion +
      safeOutputTokens * pricing.outputRatePerMillion) /
    1_000_000

  // Convert to cents and round up (conservative estimate)
  const costCents = Math.ceil(costUsd * 100)

  return costCents
}

/**
 * Refresh the pricing cache
 *
 * Clears all cached entries, forcing fresh database queries on next access.
 */
export async function refreshPricingCache(): Promise<void> {
  pricingCache.clear()
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: pricingCache.size,
    keys: Array.from(pricingCache.keys()),
  }
}
