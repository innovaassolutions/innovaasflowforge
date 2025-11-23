/**
 * Download Utilities
 *
 * Handles PDF and Markdown report downloads from the report viewer page.
 * Generates context-aware filenames including access token.
 *
 * Part of Report Visual Transformation spec
 */

// ============================================================================
// Filename Generation
// ============================================================================

/**
 * Generate context-aware filename for report downloads
 *
 * @param companyName - Company name from report
 * @param campaignName - Campaign name from report
 * @param token - Access token (first 8 chars used)
 * @param format - File format ('pdf' or 'md')
 * @returns Sanitized filename with timestamp and token
 */
export function generateReportFilename(
  companyName: string,
  campaignName: string,
  token: string,
  format: 'pdf' | 'md'
): string {
  // Sanitize and format strings for filename
  const sanitize = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30) // Limit length
  }

  const company = sanitize(companyName)
  const campaign = sanitize(campaignName)
  const tokenPrefix = token.substring(0, 8)
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  return `${company}-${campaign}-${timestamp}-${tokenPrefix}.${format}`
}

// ============================================================================
// Download Triggers
// ============================================================================

/**
 * Trigger browser download for report file
 *
 * @param url - Download URL (API endpoint)
 * @param filename - Target filename
 */
export async function downloadReport(url: string, filename: string): Promise<void> {
  try {
    // Fetch the file
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    // Get blob from response
    const blob = await response.blob()

    // Create temporary download link
    const downloadUrl = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.download = filename
    anchor.style.display = 'none'

    // Trigger download
    document.body.appendChild(anchor)
    anchor.click()

    // Cleanup
    document.body.removeChild(anchor)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Download error:', error)
    throw new Error('Failed to download report')
  }
}
