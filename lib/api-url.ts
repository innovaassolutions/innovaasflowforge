/**
 * Construct an API URL that respects the Next.js basePath configuration
 * This ensures API calls work both locally and in production with basePath
 */

// Get basePath from next.config.js
const BASE_PATH = '/flowforge'

export function apiUrl(path: string): string {
  // Remove leading slash if present to normalize
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // For local development, basePath might be empty
  // For production on Vercel, basePath is /flowforge
  const isProduction = typeof window !== 'undefined' && window.location.pathname.startsWith(BASE_PATH)

  if (isProduction) {
    return `${BASE_PATH}/${cleanPath}`
  }

  return `/${cleanPath}`
}
