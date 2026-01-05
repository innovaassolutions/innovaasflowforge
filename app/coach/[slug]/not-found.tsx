/**
 * Coach Not Found Page
 *
 * Displayed when an invalid coach slug is accessed.
 *
 * Story: 3-2-branding-infrastructure
 */

import Link from 'next/link'

export default function CoachNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ff-bg">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-ff-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-ff-text mb-2">
          Coach Not Found
        </h2>
        <p className="text-ff-text-muted mb-8 max-w-md">
          The coach profile you&apos;re looking for doesn&apos;t exist or is no
          longer active. Please check the URL and try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-ff-accent text-white font-medium hover:bg-ff-accent-hover transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
