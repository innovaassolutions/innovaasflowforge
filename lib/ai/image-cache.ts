/**
 * Image Cache
 *
 * Simple in-memory cache for generated illustrations with 24-hour TTL.
 * Prevents redundant API calls and improves performance.
 *
 * Part of Consulting-Grade Report Redesign spec
 */

interface CacheEntry {
  data: string // SVG code or base64 image
  timestamp: number
  expiresAt: number
}

class ImageCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Get cached image data
   * @param key - Cache key (usually a hash of the prompt)
   * @returns Cached data or null if not found/expired
   */
  get(key: string): string | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Store image data in cache
   * @param key - Cache key
   * @param data - Image data to cache
   */
  set(key: string, data: string): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.TTL
    })
  }

  /**
   * Check if key exists and is not expired
   * @param key - Cache key to check
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear expired entries from cache
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        isExpired: Date.now() > entry.expiresAt
      }))
    }
  }
}

// Singleton instance
export const imageCache = new ImageCache()

// Run cleanup every hour
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    imageCache.cleanup()
  }, 60 * 60 * 1000) // 1 hour
}

/**
 * Generate a cache key from a prompt
 * @param prompt - Illustration prompt
 * @returns Cache key (simple hash)
 */
export function generateCacheKey(prompt: string): string {
  // Simple hash function for cache keys
  let hash = 0
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `img_${Math.abs(hash).toString(36)}`
}
