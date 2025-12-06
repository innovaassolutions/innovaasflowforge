'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiUrl } from '@/lib/api-url'
import { Plus, Building2, Globe, MapPin, Users, Flag, Landmark } from 'lucide-react'

interface CompanyProfile {
  id: string
  company_name: string
  industry: string
  description: string | null
  website: string | null
  market_scope: 'local' | 'regional' | 'national' | 'international'
  employee_count_range: string | null
  annual_revenue_range: string | null
  headquarters_location: string | null
  created_at: string
}

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Authentication required')
        return
      }

      const response = await fetch(apiUrl('api/company-profiles'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load companies')
      }

      const data = await response.json()
      setCompanies(data.companies || [])
    } catch (err) {
      console.error('Error loading companies:', err)
      setError(err instanceof Error ? err.message : 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  function getMarketScopeIcon(scope: string) {
    const iconProps = { className: "w-7 h-7 text-brand-teal" }
    switch (scope) {
      case 'international': return <Globe {...iconProps} />
      case 'national': return <Flag {...iconProps} />
      case 'regional': return <Landmark {...iconProps} />
      case 'local': return <MapPin {...iconProps} />
      default: return <Building2 {...iconProps} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-mocha-base">
        <div className="text-mocha-text">Loading companies...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mocha-base">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mocha-text">Company Profiles</h1>
            <p className="mt-2 text-sm text-mocha-subtext0">
              Manage your client companies and their information
            </p>
          </div>
          <Link
            href="/dashboard/companies/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mocha-peach to-mocha-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Company
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-mocha-red/10 border border-mocha-red rounded-lg text-mocha-red">
            {error}
          </div>
        )}

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <div className="text-center py-12 bg-mocha-surface0 rounded-lg border border-mocha-surface1">
            <Building2 className="w-16 h-16 text-mocha-subtext0 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mocha-text mb-2">No companies yet</h3>
            <p className="text-sm text-mocha-subtext0 mb-6">
              Create your first company profile to get started
            </p>
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mocha-peach to-mocha-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Create Company Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/dashboard/companies/${company.id}`}
                className="block bg-mocha-surface0 rounded-lg border border-mocha-surface1 p-6 hover:border-mocha-peach transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-mocha-peach to-mocha-teal rounded-lg flex items-center justify-center text-white text-xl">
                      {company.company_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-mocha-text">
                        {company.company_name}
                      </h3>
                      <p className="text-sm text-mocha-subtext0">{company.industry}</p>
                    </div>
                  </div>
                  <span className="text-2xl">{getMarketScopeIcon(company.market_scope)}</span>
                </div>

                {company.description && (
                  <p className="text-sm text-mocha-subtext1 mb-4 line-clamp-2">
                    {company.description}
                  </p>
                )}

                <div className="space-y-2">
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm text-mocha-subtext0">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{company.website}</span>
                    </div>
                  )}
                  {company.headquarters_location && (
                    <div className="flex items-center gap-2 text-sm text-mocha-subtext0">
                      <MapPin className="w-4 h-4" />
                      <span>{company.headquarters_location}</span>
                    </div>
                  )}
                  {company.employee_count_range && (
                    <div className="flex items-center gap-2 text-sm text-mocha-subtext0">
                      <Users className="w-4 h-4" />
                      <span>{company.employee_count_range} employees</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-mocha-surface1">
                  <span className="text-xs text-mocha-subtext0">
                    Created {new Date(company.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="text-sm text-mocha-subtext0 hover:text-mocha-text transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
