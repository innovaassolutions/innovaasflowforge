'use client'

/**
 * Tenant Context Provider
 *
 * Provides tenant profile data to branded coaching pages without prop drilling.
 * Used by components within /coach/[slug]/ routes.
 *
 * Story: 3-2-branding-infrastructure
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { TenantProfile } from '@/lib/supabase/server'

interface TenantContextValue {
  tenant: TenantProfile
  isLoading: boolean
}

const TenantContext = createContext<TenantContextValue | null>(null)

interface TenantProviderProps {
  tenant: TenantProfile
  children: ReactNode
}

/**
 * Provider component to wrap branded coaching pages
 *
 * @example
 * <TenantProvider tenant={tenant}>
 *   <BrandedHeader />
 *   {children}
 * </TenantProvider>
 */
export function TenantProvider({ tenant, children }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant, isLoading: false }}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * Hook to access tenant data within branded pages
 *
 * @throws Error if used outside TenantProvider
 *
 * @example
 * const { tenant } = useTenant()
 * console.log(tenant.display_name) // "Leading with Meaning"
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)

  if (!context) {
    throw new Error(
      'useTenant must be used within a TenantProvider. ' +
        'Make sure this component is rendered within the /coach/[slug]/ layout.'
    )
  }

  return context
}

/**
 * Optional hook that returns null outside of TenantProvider
 * Useful for components that may be used in both branded and non-branded contexts
 */
export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext)
}
