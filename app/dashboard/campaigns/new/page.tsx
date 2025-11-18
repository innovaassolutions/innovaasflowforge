'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Building2, Users, Plus, X } from 'lucide-react'

interface CompanyProfile {
  id: string
  company_name: string
}

interface StakeholderProfile {
  id: string
  full_name: string
  email: string
  role_type: string
  title: string | null
  department: string | null
}

interface StakeholderSelection {
  stakeholderProfileId?: string
  fullName?: string
  email?: string
  roleType?: string
  position?: string
  department?: string
  isExisting: boolean
}

interface UserProfile {
  full_name: string | null
  email: string | null
}

const ROLE_TYPES = [
  { value: 'managing_director', label: 'Managing Director' },
  { value: 'it_operations', label: 'IT Operations' },
  { value: 'production_manager', label: 'Production Manager' },
  { value: 'purchasing_manager', label: 'Purchasing Manager' },
  { value: 'planning_scheduler', label: 'Planning & Scheduler' },
  { value: 'engineering_maintenance', label: 'Engineering & Maintenance' }
]

// Component that uses useSearchParams - wrapped in Suspense
function CampaignFormWrapper() {
  const searchParams = useSearchParams()
  const companyIdFromUrl = searchParams.get('companyId')

  return <NewCampaignForm initialCompanyId={companyIdFromUrl} />
}

// Main form component
function NewCampaignForm({ initialCompanyId }: { initialCompanyId: string | null }) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null)
  const [stakeholderLinks, setStakeholderLinks] = useState<Array<{
    stakeholder_name: string
    stakeholder_email: string
    access_link: string
  }>>([])

  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [availableStakeholders, setAvailableStakeholders] = useState<StakeholderProfile[]>([])
  const [selectedStakeholders, setSelectedStakeholders] = useState<StakeholderSelection[]>([])
  const [showNewStakeholderForm, setShowNewStakeholderForm] = useState(false)

  const [formData, setFormData] = useState({
    campaignName: '',
    companyProfileId: initialCompanyId || '',
    facilitatorName: '',
    facilitatorEmail: '',
    description: ''
  })

  const [newStakeholder, setNewStakeholder] = useState({
    fullName: '',
    email: '',
    roleType: 'managing_director',
    position: '',
    department: ''
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (formData.companyProfileId) {
      loadStakeholders(formData.companyProfileId)
    }
  }, [formData.companyProfileId])

  async function loadCompanies() {
    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Authentication required. Please sign in again.')
        return
      }

      const response = await fetch('/api/company-profiles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      setCompanies(data.companies || [])

      // If we have an initial company ID from URL, load user profile to pre-fill facilitator fields
      if (initialCompanyId) {
        const { data: profile } = (await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single()) as { data: UserProfile | null, error: any }

        if (profile) {
          setFormData(prev => ({
            ...prev,
            facilitatorName: profile.full_name || '',
            facilitatorEmail: profile.email || ''
          }))
        }
      }
    } catch (err) {
      console.error('Error loading companies:', err)
      setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  async function loadStakeholders(companyId: string) {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) return

      const response = await fetch(`/api/company-profiles/${companyId}/stakeholders`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      setAvailableStakeholders(data.stakeholders || [])
      setSelectedStakeholders([]) // Reset selections when company changes
    } catch (err) {
      console.error('Error loading stakeholders:', err)
    }
  }

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function toggleStakeholderSelection(stakeholder: StakeholderProfile) {
    const isSelected = selectedStakeholders.some(
      s => s.stakeholderProfileId === stakeholder.id
    )

    if (isSelected) {
      setSelectedStakeholders(
        selectedStakeholders.filter(s => s.stakeholderProfileId !== stakeholder.id)
      )
    } else {
      setSelectedStakeholders([
        ...selectedStakeholders,
        {
          stakeholderProfileId: stakeholder.id,
          isExisting: true
        }
      ])
    }
  }

  function addNewStakeholder() {
    if (!newStakeholder.fullName || !newStakeholder.email) {
      setError('Please fill in stakeholder name and email')
      return
    }

    setSelectedStakeholders([
      ...selectedStakeholders,
      {
        fullName: newStakeholder.fullName,
        email: newStakeholder.email,
        roleType: newStakeholder.roleType,
        position: newStakeholder.position,
        department: newStakeholder.department,
        isExisting: false
      }
    ])

    // Reset form
    setNewStakeholder({
      fullName: '',
      email: '',
      roleType: 'managing_director',
      position: '',
      department: ''
    })
    setShowNewStakeholderForm(false)
    setError(null)
  }

  function removeStakeholder(index: number) {
    setSelectedStakeholders(selectedStakeholders.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.campaignName || !formData.companyProfileId) {
      setError('Please fill in all required fields')
      return
    }

    if (selectedStakeholders.length === 0) {
      setError('Please select or add at least one stakeholder')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Authentication required')
        return
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: formData.campaignName,
          companyProfileId: formData.companyProfileId,
          facilitatorName: formData.facilitatorName,
          facilitatorEmail: formData.facilitatorEmail,
          description: formData.description,
          stakeholders: selectedStakeholders
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      // Store campaign data and show success modal with access links
      setCreatedCampaignId(data.campaign.id)
      setStakeholderLinks(data.stakeholderAssignments || [])
      setSuccess(true)
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ctp-base flex items-center justify-center">
        <div className="text-ctp-text">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctp-base">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-ctp-text">Create New Campaign</h1>
          <p className="mt-2 text-sm text-ctp-subtext0">
            Create a campaign and assign stakeholders for interviews
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-ctp-red/10 border border-ctp-red rounded-lg p-4">
            <p className="text-ctp-red text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-ctp-surface0 rounded-lg p-6 border border-ctp-surface1">
            <h2 className="text-lg font-semibold text-ctp-text mb-4">Campaign Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Company <span className="text-ctp-red">*</span>
                </label>
                <select
                  value={formData.companyProfileId}
                  onChange={(e) => updateField('companyProfileId', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:outline-none focus:border-ctp-peach"
                >
                  <option value="">Select a company...</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Campaign Name <span className="text-ctp-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => updateField('campaignName', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:border-ctp-peach"
                  placeholder="Q1 2025 Digital Transformation Assessment"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ctp-text mb-2">
                    Facilitator Name
                  </label>
                  <input
                    type="text"
                    value={formData.facilitatorName}
                    onChange={(e) => updateField('facilitatorName', e.target.value)}
                    className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:border-ctp-peach"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ctp-text mb-2">
                    Facilitator Email
                  </label>
                  <input
                    type="email"
                    value={formData.facilitatorEmail}
                    onChange={(e) => updateField('facilitatorEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:border-ctp-peach"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:border-ctp-peach"
                  placeholder="Brief description of this campaign..."
                />
              </div>
            </div>
          </div>

          {/* Stakeholder Selection */}
          {formData.companyProfileId && (
            <div className="bg-ctp-surface0 rounded-lg p-6 border border-ctp-surface1">
              <h2 className="text-lg font-semibold text-ctp-text mb-4">
                Assign Stakeholders <span className="text-ctp-red">*</span>
              </h2>

              {/* Existing Stakeholders */}
              {availableStakeholders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-ctp-text mb-3">
                    Select from existing stakeholders:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableStakeholders.map(stakeholder => {
                      const isSelected = selectedStakeholders.some(
                        s => s.stakeholderProfileId === stakeholder.id
                      )
                      return (
                        <button
                          key={stakeholder.id}
                          type="button"
                          onClick={() => toggleStakeholderSelection(stakeholder)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            isSelected
                              ? 'border-ctp-peach bg-ctp-peach/10'
                              : 'border-ctp-surface1 bg-ctp-base hover:border-ctp-surface2'
                          }`}
                        >
                          <div className="font-medium text-ctp-text">{stakeholder.full_name}</div>
                          <div className="text-sm text-ctp-subtext0 mt-1">{stakeholder.email}</div>
                          <div className="text-xs text-ctp-subtext0 mt-1">
                            {stakeholder.role_type.replace('_', ' ')}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Add New Stakeholder */}
              <div className="mb-6">
                {!showNewStakeholderForm ? (
                  <button
                    type="button"
                    onClick={() => setShowNewStakeholderForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text hover:bg-ctp-surface1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Stakeholder
                  </button>
                ) : (
                  <div className="p-4 bg-ctp-base border border-ctp-surface1 rounded-lg">
                    <h3 className="text-sm font-medium text-ctp-text mb-3">New Stakeholder</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newStakeholder.fullName}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, fullName: e.target.value })}
                        placeholder="Full Name *"
                        className="px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:border-ctp-peach"
                      />
                      <input
                        type="email"
                        value={newStakeholder.email}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                        placeholder="Email *"
                        className="px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:border-ctp-peach"
                      />
                      <select
                        value={newStakeholder.roleType}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, roleType: e.target.value })}
                        className="px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text focus:outline-none focus:border-ctp-peach"
                      >
                        {ROLE_TYPES.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newStakeholder.position}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, position: e.target.value })}
                        placeholder="Job Title"
                        className="px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:border-ctp-peach"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={addNewStakeholder}
                        className="px-4 py-2 bg-ctp-peach text-white rounded hover:opacity-90 transition-opacity"
                      >
                        Add to Campaign
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewStakeholderForm(false)}
                        className="px-4 py-2 bg-ctp-surface1 text-ctp-text rounded hover:bg-ctp-surface2 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Stakeholders Summary */}
              {selectedStakeholders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-ctp-text mb-3">
                    Selected stakeholders ({selectedStakeholders.length}):
                  </h3>
                  {selectedStakeholders.map((stakeholder, index) => {
                    if (stakeholder.isExisting) {
                      const fullStakeholder = availableStakeholders.find(
                        s => s.id === stakeholder.stakeholderProfileId
                      )
                      return fullStakeholder ? (
                        <div
                          key={`existing-${stakeholder.stakeholderProfileId}`}
                          className="flex items-center justify-between p-3 bg-ctp-base border border-ctp-surface1 rounded-lg mb-2"
                        >
                          <div>
                            <div className="font-medium text-ctp-text">{fullStakeholder.full_name}</div>
                            <div className="text-xs text-ctp-subtext0">{fullStakeholder.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStakeholder(index)}
                            className="text-ctp-red hover:text-ctp-red/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null
                    } else {
                      return (
                        <div
                          key={`new-${index}`}
                          className="flex items-center justify-between p-3 bg-ctp-base border border-ctp-surface1 rounded-lg mb-2"
                        >
                          <div>
                            <div className="font-medium text-ctp-text">
                              {stakeholder.fullName} <span className="text-xs text-ctp-peach">(New)</span>
                            </div>
                            <div className="text-xs text-ctp-subtext0">{stakeholder.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStakeholder(index)}
                            className="text-ctp-red hover:text-ctp-red/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    }
                  })}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 text-ctp-subtext0 hover:text-ctp-text transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || selectedStakeholders.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal with Access Links */}
      {success && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-ctp-surface0 rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-ctp-surface1 shadow-2xl">
            <div className="flex flex-col">
              {/* Success Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-teal rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl font-bold text-ctp-text mb-2 text-center">
                Campaign Created Successfully!
              </h3>
              <p className="text-ctp-subtext1 mb-6 text-center">
                Share these interview access links with your stakeholders
              </p>

              {/* Stakeholder Access Links */}
              <div className="space-y-4 mb-6">
                {stakeholderLinks.map((stakeholder, index) => (
                  <div
                    key={index}
                    className="bg-ctp-base border border-ctp-surface1 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-ctp-text font-medium mb-1">
                          {stakeholder.stakeholder_name}
                        </h4>
                        <p className="text-sm text-ctp-subtext0 mb-3">
                          {stakeholder.stakeholder_email}
                        </p>
                        <div className="bg-ctp-surface0 border border-ctp-surface1 rounded px-3 py-2">
                          <code className="text-xs text-brand-teal break-all">
                            {stakeholder.access_link}
                          </code>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(stakeholder.access_link)
                          alert(`Link copied for ${stakeholder.stakeholder_name}!`)
                        }}
                        className="flex-shrink-0 bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Copy all links as formatted text
                    const allLinks = stakeholderLinks
                      .map(s => `${s.stakeholder_name} (${s.stakeholder_email}):\n${s.access_link}`)
                      .join('\n\n')
                    navigator.clipboard.writeText(allLinks)
                    alert('All links copied to clipboard!')
                  }}
                  className="flex-1 bg-ctp-surface1 hover:bg-ctp-surface2 text-ctp-text px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Copy All Links
                </button>
                <button
                  onClick={() => router.push(`/dashboard/campaigns/${createdCampaignId}`)}
                  className="flex-1 bg-gradient-to-r from-brand-orange to-brand-teal hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity"
                >
                  View Campaign
                </button>
              </div>

              <p className="text-xs text-ctp-subtext0 mt-4 text-center">
                You can also access these links anytime from the campaign dashboard
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Default export with Suspense boundary
export default function NewCampaignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ctp-base flex items-center justify-center">
        <div className="text-ctp-text">Loading...</div>
      </div>
    }>
      <CampaignFormWrapper />
    </Suspense>
  )
}
