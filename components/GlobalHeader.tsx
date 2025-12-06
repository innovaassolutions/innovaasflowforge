'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function GlobalHeader() {
  const pathname = usePathname()

  // Hide header on dashboard pages (dashboard has its own header)
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return (
    <header className="bg-mocha-surface0 border-b border-mocha-surface1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-mocha-text hover:text-brand-orange transition-colors group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-brand-orange to-brand-teal">
              <span className="text-white font-bold text-lg">IF</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Innovaas FlowForge</h1>
              <p className="text-xs text-mocha-subtext1">Assessment Platform</p>
            </div>
          </Link>

          {/* Home Navigation */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-mocha-text hover:text-brand-orange hover:bg-mocha-surface1 rounded-lg transition-colors"
            aria-label="Go to homepage">
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
