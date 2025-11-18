'use client'

import { useState, useEffect } from 'react'
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

const ROLE_TYPES = [
  { value: 'managing_director', label: 'Managing Director' },
  { value: 'it_operations', label: 'IT Operations' },
  { value: 'production_manager', label: 'Production Manager' },
  { value: 'purchasing_manager', label: 'Purchasing Manager' },
  { value: 'planning_scheduler', label: 'Planning & Scheduler' },
  { value: 'engineering_maintenance', label: 'Engineering & Maintenance' }
]

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyIdFromUrl = searchParams.get('companyId')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [availableStakeholders, setAvailableStakeholders] = useState<StakeholderProfile[]>([])
  const [selectedStakeholders, setSelectedStakeholders] = useState<StakeholderSelection[]>([])
  const [showNewStakeholderForm, setShowNewStakeholderForm] = useState(false)

  const [formData, setFormData] = useState({
    campaignName: '',
    companyProfileId: companyIdFromUrl || '',
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

      // If companyId was in URL and companies loaded, auto-select it
      if (companyIdFromUrl && data.companies) {
        const company = data.companies.find((c: CompanyProfile) => c.id === companyIdFromUrl)
        if (company) {
          setFormData(prev => ({ ...prev, companyProfileId: company.id }))
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return
      }

      const response = await fetch(`/api/company-profiles/${companyId}/stakeholders`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      setAvailableStakeholders(data.stakeholders || [])
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
    if (!newStakeholder.fullName || !newStakeholder.email || !newStakeholder.roleType) {
      setError('Please fill in all required fields for the new stakeholder')
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

    setNewStakeholder({
      fullName: '',
      email: '',
      roleType: 'managing_director',
      position: '',
      department: ''
    })
    setShowNewStakeholderForm(false)
  }

  function removeStakeholder(index: number) {
    setSelectedStakeholders(selectedStakeholders.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.campaignName || !formData.companyProfileId || !formData.facilitatorName || !formData.facilitatorEmail) {
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Authentication required. Please sign in again.')
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

      // Success! Navigate to campaign detail page
      router.push(`/dashboard/campaigns/${data.campaign.id}`)
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleTypeLabel = (roleType: string) => {
    const role = ROLE_TYPES.find(r => r.value === roleType)
    return role?.label || roleType
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
            Set up a new assessment or workshop campaign
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-ctp-red/10 border border-ctp-red rounded-lg text-ctp-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
            <h2 className="text-lg font-semibold text-ctp-text mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Campaign Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Company <span className="text-ctp-red">*</span>
                </label>
                {companies.length === 0 ? (
                  <div className="text-sm text-ctp-subtext0">
                    No companies found. <Link href="/dashboard/companies/new" className="text-ctp-peach hover:underline">Create a company first</Link>
                  </div>
                ) : (
                  <select
                    value={formData.companyProfileId}
                    onChange={(e) => updateField('companyProfileId', e.target.value)}
                    className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                    required
                  >
                    <option value="">Select a company...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.company_name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Campaign Name <span className="text-ctp-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => updateField('campaignName', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="Q1 2025 Industry 4.0 Assessment"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ctp-text mb-2">
                    Facilitator Name <span className="text-ctp-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.facilitatorName}
                    onChange={(e) => updateField('facilitatorName', e.target.value)}
                    className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ctp-text mb-2">
                    Facilitator Email <span className="text-ctp-red">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.facilitatorEmail}
                    onChange={(e) => updateField('facilitatorEmail', e.target.value)}
                    className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                    placeholder="your@email.com"
                    required
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
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="Brief description of this campaign..."
                />
              </div>
            </div>
          </div>

          {/* Stakeholders */}
          {formData.companyProfileId && (
            <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
              <h2 className="text-lg font-semibold text-ctp-text mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Stakeholders ({selectedStakeholders.length})
              </h2>

              {/* Available Stakeholders */}
              {availableStakeholders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-ctp-text mb-3">Select from existing stakeholders:</h3>
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
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            isSelected
                              ? 'border-ctp-peach bg-ctp-peach/10'
                              : 'border-ctp-surface1 bg-ctp-base hover:border-ctp-surface2'
                          }`}
                        >
                          <div className="font-medium text-ctp-text">{stakeholder.full_name}</div>
                          <div className="text-xs text-ctp-subtext0 mt-1">
                            {stakeholder.title || getRoleTypeLabel(stakeholder.role_type)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Add New Stakeholder */}
              {!showNewStakeholderForm && (
                <button
                  type="button"
                  onClick={() => setShowNewStakeholderForm(true)}
                  className="w-full p-3 border-2 border-dashed border-ctp-surface1 rounded-lg text-ctp-subtext0 hover:border-ctp-peach hover:text-ctp-peach transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Stakeholder
                </button>
              )}

              {showNewStakeholderForm && (
                <div className="p-4 bg-ctp-base rounded-lg border border-ctp-surface1">
                  <h3 className="text-sm font-medium text-ctp-text mb-4">Create New Stakeholder</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ctp-subtext0 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={newStakeholder.fullName}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text text-sm focus:border-ctp-peach focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-ctp-subtext0 mb-2">Email *</label>
                      <input
                        type="email"
                        value={newStakeholder.email}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                        className="w-full px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text text-sm focus:border-ctp-peach focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-ctp-subtext0 mb-2">Role Type *</label>
                      <select
                        value={newStakeholder.roleType}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, roleType: e.target.value })}
                        className="w-full px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text text-sm focus:border-ctp-peach focus:outline-none"
                      >
                        {ROLE_TYPES.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-ctp-subtext0 mb-2">Job Title</label>
                      <input
                        type="text"
                        value={newStakeholder.position}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, position: e.target.value })}
                        className="w-full px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text text-sm focus:border-ctp-peach focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-ctp-subtext0 mb-2">Department</label>
                      <input
                        type="text"
                        value={newStakeholder.department}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, department: e.target.value })}
                        className="w-full px-3 py-2 bg-ctp-surface0 border border-ctp-surface1 rounded text-ctp-text text-sm focus:border-ctp-peach focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewStakeholderForm(false)}
                      className="px-4 py-2 text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addNewStakeholder}
                      className="px-4 py-2 bg-ctp-peach rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Add to Campaign
                    </button>
                  </div>
                </div>
              )}

              {/* Selected Stakeholders List */}
              {selectedStakeholders.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-ctp-text">Selected stakeholders:</h3>
                  {selectedStakeholders.map((stakeholder, index) => {
                    if (stakeholder.isExisting) {
                      const profile = availableStakeholders.find(s => s.id === stakeholder.stakeholderProfileId)
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-ctp-base rounded-lg border border-ctp-surface1"
                        >
                          <div>
                            <div className="font-medium text-ctp-text">{profile?.full_name}</div>
                            <div className="text-xs text-ctp-subtext0">{profile?.email}</div>
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
                    } else {
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-ctp-peach/10 rounded-lg border border-ctp-peach"
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
              {submitting ? 'Creating Campaign...' : 'Create Campaign & Send Invitations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
