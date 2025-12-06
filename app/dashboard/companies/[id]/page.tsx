'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Building2, Globe, MapPin, Users, DollarSign, Mail, Briefcase, Plus, BarChart3, Trash2 } from 'lucide-react'

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

interface StakeholderProfile {
  id: string
  full_name: string
  email: string
  role_type: string
  title: string | null
  department: string | null
  created_at: string
}

interface Campaign {
  id: string
  name: string
  campaign_type: string
  status: string
  created_at: string
  description: string | null
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [stakeholders, setStakeholders] = useState<StakeholderProfile[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Unwrap params Promise
  useEffect(() => {
    params.then(p => setCompanyId(p.id))
  }, [params])

  useEffect(() => {
    if (companyId) {
      loadCompanyData()
    }
  }, [companyId])

  async function loadCompanyData() {
    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Authentication required. Please sign in again.')
        return
      }

      // Load company profile
      const companyResponse = await fetch('/api/company-profiles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const companyData = await companyResponse.json()
      const foundCompany = companyData.companies?.find((c: CompanyProfile) => c.id === companyId)

      if (!foundCompany) {
        setError('Company not found or you do not have access to it')
        return
      }

      setCompany(foundCompany)

      // Load stakeholders for this company
      const stakeholdersResponse = await fetch(`/api/company-profiles/${companyId}/stakeholders`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const stakeholdersData = await stakeholdersResponse.json()
      setStakeholders(stakeholdersData.stakeholders || [])

      // Load campaigns for this company
      const campaignsResponse = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const campaignsData = await campaignsResponse.json()
      const companyCampaigns = campaignsData.campaigns?.filter(
        (c: Campaign & { company_profile_id: string }) => c.company_profile_id === companyId
      ) || []
      setCampaigns(companyCampaigns)

    } catch (err) {
      console.error('Error loading company data:', err)
      setError('Failed to load company information')
    } finally {
      setLoading(false)
    }
  }

  const getMarketScopeLabel = (scope: string) => {
    const labels = {
      local: 'Local',
      regional: 'Regional',
      national: 'National',
      international: 'International'
    }
    return labels[scope as keyof typeof labels] || scope
  }

  const getRoleTypeLabel = (roleType: string) => {
    const labels = {
      managing_director: 'Managing Director',
      it_operations: 'IT Operations',
      production_manager: 'Production Manager',
      purchasing_manager: 'Purchasing Manager',
      planning_scheduler: 'Planning & Scheduler',
      engineering_maintenance: 'Engineering & Maintenance'
    }
    return labels[roleType as keyof typeof labels] || roleType
  }

  const getCampaignTypeLabel = (type: string) => {
    const labels = {
      industry_4_0_readiness: 'Industry 4.0 Readiness',
      theory_of_constraints: 'Theory of Constraints',
      lean_six_sigma: 'Lean Six Sigma',
      bmad_strategic_planning: 'BMAD Strategic Planning'
    }
    return labels[type as keyof typeof labels] || type
  }

  async function handleDeleteCampaign(campaignId: string) {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Not authenticated')
        return
      }

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Remove campaign from list
        setCampaigns(campaigns.filter(c => c.id !== campaignId))
        setShowDeleteConfirm(false)
        setDeletingCampaignId(null)
      } else {
        setError(data.error || 'Failed to delete campaign')
      }
    } catch (err) {
      setError('Error deleting campaign')
      console.error(err)
    }
  }

  function confirmDelete(campaignId: string) {
    setDeletingCampaignId(campaignId)
    setShowDeleteConfirm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ctp-base flex items-center justify-center">
        <div className="text-ctp-text">Loading company information...</div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-ctp-base">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-ctp-red/10 border border-ctp-red rounded-lg p-6 text-ctp-red">
            {error || 'Company not found'}
          </div>
          <Link
            href="/dashboard/companies"
            className="inline-block mt-4 text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors"
          >
            ← Back to Companies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctp-base">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingCampaignId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-ctp-surface0 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-ctp-text mb-4">
              Delete Campaign?
            </h3>
            <p className="text-ctp-subtext1 mb-6">
              Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated stakeholder sessions and data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingCampaignId(null)
                }}
                className="px-4 py-2 bg-ctp-surface1 hover:bg-ctp-surface2 text-ctp-text rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCampaign(deletingCampaignId)}
                className="px-4 py-2 bg-ctp-red hover:bg-ctp-red/80 text-white rounded-lg transition-colors"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/companies"
            className="text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors mb-4 inline-block"
          >
            ← Back to Companies
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-ctp-peach to-ctp-teal flex items-center justify-center text-white text-2xl font-bold">
                {company.company_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-ctp-text">{company.company_name}</h1>
                <p className="mt-1 text-ctp-subtext0">{company.industry}</p>
              </div>
            </div>
            <Link
              href={`/dashboard/companies/${company.id}/edit`}
              className="px-4 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded-lg text-ctp-text hover:bg-ctp-surface1 transition-colors"
            >
              Edit Company
            </Link>
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2 bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
            <h2 className="text-lg font-semibold text-ctp-text mb-4">Company Information</h2>

            {company.description && (
              <div className="mb-6">
                <p className="text-ctp-subtext0">{company.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-ctp-peach mt-0.5" />
                <div>
                  <p className="text-xs text-ctp-subtext0 mb-1">Market Scope</p>
                  <p className="text-ctp-text font-medium">{getMarketScopeLabel(company.market_scope)}</p>
                </div>
              </div>

              {company.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-ctp-peach mt-0.5" />
                  <div>
                    <p className="text-xs text-ctp-subtext0 mb-1">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ctp-text font-medium hover:text-ctp-peach transition-colors"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}

              {company.headquarters_location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-ctp-peach mt-0.5" />
                  <div>
                    <p className="text-xs text-ctp-subtext0 mb-1">Headquarters</p>
                    <p className="text-ctp-text font-medium">{company.headquarters_location}</p>
                  </div>
                </div>
              )}

              {company.employee_count_range && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-ctp-peach mt-0.5" />
                  <div>
                    <p className="text-xs text-ctp-subtext0 mb-1">Employees</p>
                    <p className="text-ctp-text font-medium">{company.employee_count_range}</p>
                  </div>
                </div>
              )}

              {company.annual_revenue_range && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-ctp-peach mt-0.5" />
                  <div>
                    <p className="text-xs text-ctp-subtext0 mb-1">Annual Revenue</p>
                    <p className="text-ctp-text font-medium">{company.annual_revenue_range}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-ctp-peach" />
                <p className="text-sm text-ctp-subtext0">Stakeholders</p>
              </div>
              <p className="text-3xl font-bold text-ctp-text">{stakeholders.length}</p>
            </div>

            <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-ctp-teal" />
                <p className="text-sm text-ctp-subtext0">Campaigns</p>
              </div>
              <p className="text-3xl font-bold text-ctp-text">{campaigns.length}</p>
            </div>
          </div>
        </div>

        {/* Stakeholders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-ctp-text flex items-center gap-2">
              <Users className="w-5 h-5" />
              Stakeholders
            </h2>
            <Link
              href={`/dashboard/companies/${company.id}/stakeholders/new`}
              className="px-4 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Stakeholder
            </Link>
          </div>

          {stakeholders.length === 0 ? (
            <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-8 text-center">
              <Users className="w-12 h-12 text-ctp-subtext0 mx-auto mb-3" />
              <p className="text-ctp-subtext0 mb-4">No stakeholders added yet</p>
              <Link
                href={`/dashboard/companies/${company.id}/stakeholders/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add Your First Stakeholder
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stakeholders.map(stakeholder => (
                <div
                  key={stakeholder.id}
                  className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-4 hover:border-ctp-peach transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-ctp-text">{stakeholder.full_name}</h3>
                      {stakeholder.title && (
                        <p className="text-sm text-ctp-subtext0">{stakeholder.title}</p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/companies/${company.id}/stakeholders/${stakeholder.id}/edit`}
                      className="text-sm text-ctp-subtext0 hover:text-ctp-peach transition-colors"
                    >
                      Edit
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-ctp-peach" />
                      <span className="text-ctp-subtext0">{stakeholder.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-ctp-peach" />
                      <span className="text-ctp-subtext0">{getRoleTypeLabel(stakeholder.role_type)}</span>
                    </div>

                    {stakeholder.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-ctp-peach" />
                        <span className="text-ctp-subtext0">{stakeholder.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaigns Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-ctp-text flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Campaigns
            </h2>
            <Link
              href={`/dashboard/campaigns/new?companyId=${company.id}`}
              className="px-4 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-8 text-center">
              <BarChart3 className="w-12 h-12 text-ctp-subtext0 mx-auto mb-3" />
              <p className="text-ctp-subtext0 mb-4">No campaigns created yet</p>
              <Link
                href={`/dashboard/campaigns/new?companyId=${company.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-4 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="flex-1 hover:opacity-80 transition-opacity"
                    >
                      <h3 className="font-semibold text-ctp-text mb-1">{campaign.name}</h3>
                      <p className="text-sm text-ctp-subtext0 mb-2">
                        {getCampaignTypeLabel(campaign.campaign_type)}
                      </p>
                      {campaign.description && (
                        <p className="text-sm text-ctp-subtext0">{campaign.description}</p>
                      )}
                    </Link>
                    <div className="ml-4 flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-ctp-green/10 text-ctp-green'
                          : campaign.status === 'completed'
                          ? 'bg-ctp-blue/10 text-ctp-blue'
                          : 'bg-ctp-surface1 text-ctp-subtext0'
                      }`}>
                        {campaign.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          confirmDelete(campaign.id)
                        }}
                        className="p-2 text-ctp-subtext0 hover:text-ctp-red hover:bg-ctp-red/10 rounded-lg transition-colors"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
