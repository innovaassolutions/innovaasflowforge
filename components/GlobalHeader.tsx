'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function GlobalHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch - don't render until client-side
  if (!mounted) {
    return null
  }

  // Hide header on dashboard pages (dashboard has its own header)
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-lg">IF</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Innovaas FlowForge</h1>
              <p className="text-xs text-muted-foreground">Assessment Platform</p>
            </div>
          </Link>

          {/* Home Navigation */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            aria-label="Go to homepage">
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
