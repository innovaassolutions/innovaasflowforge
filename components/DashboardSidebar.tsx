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
  X,
  Shield,
  UserCog,
  GraduationCap,
  UserCircle
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface UserProfile {
  full_name: string
  email: string
  role: string
  user_type: 'consultant' | 'company' | 'admin' | 'coach' | null
  permissions?: {
    education?: {
      view_schools?: boolean
      manage_schools?: boolean
      view_safeguarding_alerts?: boolean
    }
  }
  // Verticals this user has access to
  verticals?: ('industry' | 'education')[]
  // Coach tenant info (if user is a coach)
  tenant_slug?: string
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

  // Check user types for role-specific navigation
  const isCoach = userProfile?.user_type === 'coach'
  const isSchool = userProfile?.user_type === 'company'
  const isConsultantOrAdmin = userProfile?.user_type === 'consultant' || userProfile?.user_type === 'admin'

  // Check if user has access to specific verticals
  // Admin users see everything; consultants check verticals array
  // If no verticals set, default to showing industry (legacy behavior for consultants)
  const hasIndustryAccess = isConsultantOrAdmin && (
    userProfile?.user_type === 'admin' ||
    userProfile?.verticals?.includes('industry') ||
    (!userProfile?.verticals || userProfile?.verticals.length === 0)
  )

  const hasEducationAccess = isConsultantOrAdmin && (
    userProfile?.user_type === 'admin' ||
    userProfile?.verticals?.includes('education') ||
    userProfile?.permissions?.education?.view_schools
  )

  // Base nav items everyone sees
  const baseNavItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
      matchPaths: ['/dashboard']
    }
  ]

  // Coach-specific navigation
  const coachNavItems = isCoach ? [
    {
      name: 'Clients',
      href: '/dashboard/coaching/clients',
      icon: UserCircle,
      matchPaths: ['/dashboard/coaching/clients']
    }
  ] : []

  // School-specific navigation (user_type === 'company')
  const schoolNavItems = isSchool ? [
    {
      name: 'My School',
      href: '/dashboard/education/schools',
      icon: GraduationCap,
      matchPaths: ['/dashboard/education/schools']
    },
    {
      name: 'Access Codes',
      href: '/dashboard/education/access-codes',
      icon: Users,
      matchPaths: ['/dashboard/education/access-codes']
    }
  ] : []

  // Industry vertical items - Companies only (consultants)
  const industryNavItems = hasIndustryAccess ? [
    {
      name: 'Companies',
      href: '/dashboard/companies',
      icon: Building2,
      matchPaths: ['/dashboard/companies']
    }
  ] : []

  // Education vertical items (for consultants/admin who manage schools)
  const educationNavItems = hasEducationAccess ? [
    {
      name: 'Schools',
      href: '/dashboard/education/schools',
      icon: GraduationCap,
      matchPaths: ['/dashboard/education']
    }
  ] : []

  // Campaigns - shown after Schools (consultants only)
  const campaignNavItems = hasIndustryAccess ? [
    {
      name: 'Campaigns',
      href: '/dashboard/campaigns',
      icon: BarChart3,
      matchPaths: ['/dashboard/campaigns']
    }
  ] : []

  const navItems = [...baseNavItems, ...coachNavItems, ...schoolNavItems, ...industryNavItems, ...educationNavItems, ...campaignNavItems]

  // Admin-only nav items (check user_type for platform admin access)
  const adminNavItems = userProfile?.user_type === 'admin' ? [
    {
      name: 'Users',
      href: '/dashboard/admin/users',
      icon: Shield,
      matchPaths: ['/dashboard/admin']
    }
  ] : []

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
          group flex flex-col fixed left-0 top-16 bottom-0 z-30
          transition-all duration-200 ease-in-out
          bg-card border-r border-border
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:w-16 lg:hover:w-52
        `}>
        {/* Close button (mobile only) */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-2 pt-4 space-y-1 overflow-y-auto bg-card">
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
                    ? 'bg-[hsl(var(--accent-subtle))] text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-brand-teal'
                }`} />
                <span className="font-medium whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 overflow-hidden">
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Admin Section */}
          {adminNavItems.length > 0 && (
            <>
              <div className="my-3 border-t border-border" />
              {adminNavItems.map((item) => {
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
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}>
                    <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                      active
                        ? 'text-purple-700'
                        : 'text-muted-foreground group-hover:text-purple-600'
                    }`} />
                    <span className="font-medium whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 overflow-hidden">
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="p-2 border-t border-border bg-card">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={userProfile?.full_name || 'User'}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 overflow-hidden whitespace-nowrap">
                <div className="text-sm font-medium text-foreground truncate">
                  {userProfile?.full_name || 'User'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {userProfile?.email || ''}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-200 shrink-0 ${showUserMenu ? 'rotate-180' : ''} lg:opacity-0 lg:group-hover:opacity-100`} />
            </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-3 bg-[hsl(var(--accent-subtle))] border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">
                  {userProfile?.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userProfile?.user_type || userProfile?.role || 'member'}
                </p>
              </div>
              <Link
                href="/dashboard/account"
                onClick={onCloseMobile}
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-b border-border">
                <UserCog className="w-4 h-4 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 group">
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                <span className="group-hover:text-destructive transition-colors">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}
