/**
 * URL helpers for constructing public URLs
 *
 * Note: As of Jan 2026, FlowForge uses a dedicated subdomain (flowforge.innovaas.co)
 * instead of a basePath. These helpers now simply construct URLs using NEXT_PUBLIC_APP_URL.
 */

/**
 * Construct a full public URL for server-side use
 * This is used for generating URLs that will be shared externally (e.g., in emails, API responses)
 */
export function buildPublicUrl(path: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${appUrl}${cleanPath}`
}

/**
 * Construct an API URL (relative path)
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `/${cleanPath}`
}

/**
 * Construct an asset URL (relative path for static assets in the public folder)
 */
export function assetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return cleanPath
}
