'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  LayoutDashboard,
  Building2,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  X
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface UserProfile {
  full_name: string
  email: string
  role: string
  user_type: 'consultant' | 'company' | null
}

interface DashboardSidebarProps {
  userProfile: UserProfile | null
  onLogout: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export default function DashboardSidebar({ userProfile, onLogout, isMobileOpen, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const navItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
      matchPaths: ['/dashboard']
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      matchPaths: ['/dashboard']
    },
    {
      name: 'Companies',
      href: '/dashboard/companies',
      icon: Building2,
      matchPaths: ['/dashboard/companies']
    },
    {
      name: 'Campaigns',
      href: '/dashboard/campaigns',
      icon: BarChart3,
      matchPaths: ['/dashboard/campaigns']
    }
  ]

  function isActive(matchPaths: string[]) {
    return matchPaths.some(path => {
      if (path === '/dashboard') {
        return pathname === path
      }
      return pathname?.startsWith(path)
    })
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          group bg-ctp-mantle border-r border-ctp-surface0 flex flex-col fixed left-0 top-16 bottom-0 z-30
          transition-all duration-200 ease-in-out opacity-100
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:w-16 lg:hover:w-52
        `}>
        {/* Close button (mobile only) */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute top-4 right-4 p-2 text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-2 pt-4 space-y-1 overflow-y-auto bg-ctp-mantle">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.matchPaths)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                title={item.name}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-ctp-surface0 text-ctp-text'
                    : 'text-ctp-subtext1 hover:bg-ctp-surface0/50 hover:text-ctp-text'
                }`}>
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 overflow-hidden">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="p-2 border-t border-ctp-surface0 bg-ctp-mantle">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={userProfile?.full_name || 'User'}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ctp-surface0 transition-all duration-200">
              <div className="w-8 h-8 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 overflow-hidden whitespace-nowrap">
                <div className="text-sm font-medium text-ctp-text truncate">
                  {userProfile?.full_name || 'User'}
                </div>
                <div className="text-xs text-ctp-subtext0 truncate">
                  {userProfile?.email || ''}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-ctp-subtext0 transition-all duration-200 shrink-0 ${showUserMenu ? 'rotate-180' : ''} lg:opacity-0 lg:group-hover:opacity-100`} />
            </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-ctp-surface0 border border-ctp-surface1 rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-ctp-peach/10 to-ctp-teal/10 border-b border-ctp-surface1">
                <p className="text-sm font-medium text-ctp-text truncate">
                  {userProfile?.full_name}
                </p>
                <p className="text-xs text-ctp-subtext1 truncate">
                  {userProfile?.user_type || userProfile?.role || 'member'}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-3 text-sm text-ctp-text hover:bg-ctp-surface1 transition-colors flex items-center gap-2 group">
                <LogOut className="w-4 h-4 text-ctp-subtext0 group-hover:text-ctp-red transition-colors" />
                <span className="group-hover:text-ctp-red transition-colors">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}
