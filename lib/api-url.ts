/**
 * URL helpers that respect the Next.js basePath configuration
 * This ensures URLs work both locally and in production with basePath
 */

// Get basePath from next.config.js
const BASE_PATH = '/flowforge'

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
