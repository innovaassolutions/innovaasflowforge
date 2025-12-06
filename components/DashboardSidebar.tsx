'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronDown
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
}

export default function DashboardSidebar({ userProfile, onLogout }: DashboardSidebarProps) {
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
    <div className="w-64 bg-ctp-mantle border-r border-ctp-surface0 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-ctp-surface0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-ctp-peach to-ctp-teal bg-clip-text text-transparent">
          FlowForge
        </h1>
        <p className="text-xs text-ctp-subtext0 mt-1">Assessment Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.matchPaths)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-ctp-surface0 text-ctp-text'
                  : 'text-ctp-subtext1 hover:bg-ctp-surface0/50 hover:text-ctp-text'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-ctp-surface0">
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ctp-surface0 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-ctp-text truncate">
                {userProfile?.full_name || 'User'}
              </div>
              <div className="text-xs text-ctp-subtext0 truncate">
                {userProfile?.email || ''}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-ctp-subtext0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
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

      {/* Footer Branding */}
      <div className="p-4 border-t border-ctp-surface0">
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs text-ctp-subtext0">Powered by</p>
          <Image
            src="/designguide/innovaas_orange_and_white_transparent_bkgrnd_2559x594.png"
            alt="Innovaas"
            width={80}
            height={19}
            className="h-5 w-auto"
          />
        </div>
      </div>
    </div>
  )
}
