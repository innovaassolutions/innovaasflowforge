/**
 * URL helpers that respect the Next.js basePath configuration
 * This ensures URLs work both locally and in production with basePath
 */

// Get basePath from next.config.js
const BASE_PATH = ''

/**
 * Construct a full public URL with basePath for server-side use
 * This is used for generating URLs that will be shared externally (e.g., in emails, API responses)
 */
export function buildPublicUrl(path: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // Check if APP_URL already includes basePath
  if (appUrl.endsWith(BASE_PATH)) {
    return `${appUrl}${cleanPath}`
  }

  // In production, append basePath if not already included
  // For local dev (localhost), don't append basePath
  const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1')
  if (!isLocalhost) {
    return `${appUrl}${BASE_PATH}${cleanPath}`
  }

  return `${appUrl}${cleanPath}`
}

/**
 * Check if we're running in production (with basePath)
 */
function isProductionPath(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.pathname.startsWith(BASE_PATH)
  }
  return false
}

/**
 * Construct an API URL with basePath
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  if (isProductionPath()) {
    return `${BASE_PATH}/${cleanPath}`
  }

  return `/${cleanPath}`
}

/**
 * Construct an asset URL (images, etc.) with basePath
 * Use this for static assets in the public folder
 */
export function assetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  if (isProductionPath()) {
    return `${BASE_PATH}${cleanPath}`
  }

  return cleanPath
}
