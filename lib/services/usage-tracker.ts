/**
 * Usage Tracker Service
 *
 * Tracks cumulative token usage per tenant per billing period.
 * Calculates usage percentage against tier limits.
 *
 * Story: billing-2-3-implement-usage-tracking
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Types
// ============================================================================

export interface TenantUsage {
  tenantId: string
  currentUsage: number           // Total tokens used in billing period
  limit: number                  // From tier or override (0 = unlimited)
  percentage: number             // 0-100+ (can exceed 100 if over limit)
  billingPeriodStart: Date
  billingPeriodEnd: Date
  daysRemaining: number
  isOverLimit: boolean
  tierName: string | null
  hasOverride: boolean
}

interface CachedUsage {
  usage: TenantUsage
  timestamp: number
}

interface TenantProfileWithTier {
  id: string
  tier_id: string | null
  usage_limit_override: number | null
  billing_period_start: string | null
  subscription_tiers: {
    id: string
    name: string
    monthly_token_limit: number | null
  } | null
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_TTL_MS = 60 * 1000 // 1 minute cache for usage data

// ============================================================================
// Cache
// ============================================================================

const usageCache = new Map<string, CachedUsage>()

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
// Helper Functions
// ============================================================================

/**
 * Calculate billing period end date (1 month from start)
 */
function calculateBillingPeriodEnd(start: Date): Date {
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  return end
}

/**
 * Calculate days remaining in billing period
 */
function calculateDaysRemaining(end: Date): number {
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Get tenant profile with tier information
 */
async function getTenantProfile(tenantId: string): Promise<TenantProfileWithTier | null> {
  const supabase = getServiceClient()

  const { data, error } = await (supabase
    .from('tenant_profiles') as any)
    .select(`
      id, tier_id, usage_limit_override, billing_period_start,
      subscription_tiers(id, name, monthly_token_limit)
    `)
    .eq('id', tenantId)
    .single()

  if (error || !data) {
    console.error('[UsageTracker] Failed to fetch tenant profile:', error)
    return null
  }

  // Handle Supabase returning nested relation as object or array
  const tierData = Array.isArray(data.subscription_tiers)
    ? data.subscription_tiers[0]
    : data.subscription_tiers

  return {
    id: data.id,
    tier_id: data.tier_id,
    usage_limit_override: data.usage_limit_override,
    billing_period_start: data.billing_period_start,
    subscription_tiers: tierData || null,
  } as TenantProfileWithTier
}

/**
 * Query total token usage for tenant since billing period start
 *
 * Uses input_tokens + output_tokens columns (Story 1.1)
 * Falls back to tokens_used for legacy events
 */
async function queryUsageTokens(tenantId: string, billingStart: Date): Promise<number> {
  const supabase = getServiceClient()

  const { data, error } = await (supabase
    .from('usage_events') as any)
    .select('input_tokens, output_tokens, tokens_used')
    .eq('tenant_id', tenantId)
    .gte('created_at', billingStart.toISOString())

  if (error) {
    console.error('[UsageTracker] Failed to query usage events:', error)
    return 0
  }

  if (!data || data.length === 0) {
    return 0
  }

  // Sum tokens from all events
  // Use input_tokens + output_tokens if available, fallback to tokens_used
  let totalTokens = 0
  for (const event of data) {
    if (event.input_tokens !== null || event.output_tokens !== null) {
      totalTokens += (event.input_tokens || 0) + (event.output_tokens || 0)
    } else if (event.tokens_used !== null) {
      totalTokens += event.tokens_used
    }
  }

  return totalTokens
}

/**
 * Get current token usage for a tenant (simple count)
 *
 * Lightweight method that only returns the token count.
 * Use getTenantUsage() for full usage details.
 */
export async function getCurrentUsageTokens(tenantId: string): Promise<number> {
  // Check cache first
  const cached = usageCache.get(tenantId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.usage.currentUsage
  }

  // Get full usage to populate cache
  const usage = await getTenantUsage(tenantId)
  return usage?.currentUsage ?? 0
}

/**
 * Get comprehensive usage data for a tenant
 *
 * Returns current usage, limits, percentage, and billing period info.
 * Results are cached for 1 minute to reduce database load.
 */
export async function getTenantUsage(tenantId: string): Promise<TenantUsage | null> {
  // Check cache first
  const cached = usageCache.get(tenantId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.usage
  }

  // Fetch tenant profile with tier
  const tenant = await getTenantProfile(tenantId)
  if (!tenant) {
    return null
  }

  // Determine billing period start
  // Default to first of current month if not set
  const billingPeriodStart = tenant.billing_period_start
    ? new Date(tenant.billing_period_start)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const billingPeriodEnd = calculateBillingPeriodEnd(billingPeriodStart)
  const daysRemaining = calculateDaysRemaining(billingPeriodEnd)

  // Get current usage tokens
  const currentUsage = await queryUsageTokens(tenantId, billingPeriodStart)

  // Determine limit (override takes precedence)
  const hasOverride = tenant.usage_limit_override !== null
  const limit = hasOverride
    ? tenant.usage_limit_override!
    : (tenant.subscription_tiers?.monthly_token_limit ?? 0)

  // Calculate percentage
  // If limit is 0 or null, treat as unlimited (0%)
  const percentage = limit > 0
    ? Math.round((currentUsage / limit) * 100)
    : 0

  const isOverLimit = limit > 0 && currentUsage > limit

  const usage: TenantUsage = {
    tenantId,
    currentUsage,
    limit,
    percentage,
    billingPeriodStart,
    billingPeriodEnd,
    daysRemaining,
    isOverLimit,
    tierName: tenant.subscription_tiers?.name ?? null,
    hasOverride,
  }

  // Cache the result
  usageCache.set(tenantId, { usage, timestamp: Date.now() })

  return usage
}

/**
 * Check if tenant is over their usage limit
 *
 * Quick check for pre-request validation.
 * Returns false if no limit is set (unlimited).
 */
export async function isOverLimit(tenantId: string): Promise<boolean> {
  const usage = await getTenantUsage(tenantId)
  return usage?.isOverLimit ?? false
}

/**
 * Check if tenant is approaching their limit (warning threshold)
 *
 * @param threshold - Percentage threshold (default 80%)
 */
export async function isApproachingLimit(
  tenantId: string,
  threshold: number = 80
): Promise<boolean> {
  const usage = await getTenantUsage(tenantId)
  if (!usage || usage.limit === 0) {
    return false // No limit = can't approach it
  }
  return usage.percentage >= threshold && !usage.isOverLimit
}

// ============================================================================
// Pre-Request Usage Check (Story 2.4)
// ============================================================================

export interface UsageCheckResult {
  allowed: boolean
  usage: TenantUsage | null
  reason?: string
  retryAfterSeconds?: number
}

/**
 * Check if tenant can proceed with an AI request
 *
 * Use this before processing AI requests to enforce usage limits.
 * Returns whether the request should be allowed and usage details.
 */
export async function checkUsageLimit(tenantId: string): Promise<UsageCheckResult> {
  const usage = await getTenantUsage(tenantId)

  // If we can't get usage data, allow the request (fail open)
  if (!usage) {
    console.warn(`[UsageTracker] Could not get usage for tenant ${tenantId}, allowing request`)
    return { allowed: true, usage: null }
  }

  // If no limit set (unlimited tier), always allow
  if (usage.limit === 0) {
    return { allowed: true, usage }
  }

  // Check if over limit
  if (usage.isOverLimit || usage.percentage >= 100) {
    // Calculate seconds until billing period reset
    const retryAfterSeconds = Math.max(
      0,
      Math.floor((usage.billingPeriodEnd.getTime() - Date.now()) / 1000)
    )

    return {
      allowed: false,
      usage,
      reason: 'Usage limit reached. Please upgrade your plan or wait for your next billing cycle.',
      retryAfterSeconds,
    }
  }

  return { allowed: true, usage }
}

/**
 * Create HTTP error response for blocked requests
 *
 * Returns a formatted response object suitable for API routes.
 */
export function createUsageLimitError(result: UsageCheckResult): {
  status: number
  body: Record<string, unknown>
  headers: Record<string, string>
} {
  const resetDate = result.usage?.billingPeriodEnd.toISOString().split('T')[0] ?? 'unknown'

  return {
    status: 429,
    body: {
      error: 'UsageLimitExceeded',
      message: result.reason ?? 'Usage limit reached',
      usage: result.usage
        ? {
            current: result.usage.currentUsage,
            limit: result.usage.limit,
            percentage: result.usage.percentage,
            resetDate,
          }
        : null,
    },
    headers: {
      'Retry-After': String(result.retryAfterSeconds ?? 86400),
      'X-RateLimit-Limit': String(result.usage?.limit ?? 0),
      'X-RateLimit-Remaining': String(
        Math.max(0, (result.usage?.limit ?? 0) - (result.usage?.currentUsage ?? 0))
      ),
      'X-RateLimit-Reset': resetDate,
    },
  }
}

/**
 * Invalidate cached usage for a tenant
 *
 * Call this after logging new usage events to ensure
 * fresh data on next query.
 */
export function invalidateUsageCache(tenantId: string): void {
  usageCache.delete(tenantId)
}

/**
 * Clear all cached usage data
 *
 * Useful for testing or when bulk updates occur.
 */
export function clearUsageCache(): void {
  usageCache.clear()
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getUsageCacheStats(): { size: number; keys: string[] } {
  return {
    size: usageCache.size,
    keys: Array.from(usageCache.keys()),
  }
}

/**
 * Format usage for display
 *
 * Convenience method for UI components.
 */
export function formatUsageDisplay(usage: TenantUsage): {
  usageText: string
  percentageText: string
  statusText: string
  statusColor: 'green' | 'yellow' | 'red'
} {
  const formatTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toString()
  }

  const usageText = usage.limit > 0
    ? `${formatTokens(usage.currentUsage)} / ${formatTokens(usage.limit)} tokens`
    : `${formatTokens(usage.currentUsage)} tokens (unlimited)`

  const percentageText = usage.limit > 0
    ? `${usage.percentage}%`
    : 'N/A'

  let statusText: string
  let statusColor: 'green' | 'yellow' | 'red'

  if (usage.isOverLimit) {
    statusText = 'Over limit'
    statusColor = 'red'
  } else if (usage.percentage >= 80) {
    statusText = 'Approaching limit'
    statusColor = 'yellow'
  } else {
    statusText = 'OK'
    statusColor = 'green'
  }

  return { usageText, percentageText, statusText, statusColor }
}
