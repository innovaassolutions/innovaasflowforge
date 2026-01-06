'use client'

import { useState, useEffect, Suspense } from 'react'
import { apiUrl } from '@/lib/api-url'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'

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
  user_type: string | null
}

interface TenantProfile {
  id: string
  tenant_type: 'coach' | 'consultant' | 'school'
  enabled_assessments: string[]
}

interface SimpleParticipant {
  name: string
  email: string
}

// Assessment types and their labels
const ASSESSMENT_TYPES = {
  industry4: { label: 'Industry 4.0 Readiness', description: 'Digital transformation assessment for companies' },
  archetype: { label: 'Leadership Archetype', description: 'Individual leadership style assessment' },
  education: { label: 'Education Assessment', description: 'Learning and development assessment' },
  custom: { label: 'Custom Assessment', description: 'Custom configured assessment' }
}

// Map tenant type to available assessment types
function getAssessmentTypesForTenant(tenantType: string | null): string[] {
  switch (tenantType) {
    case 'coach':
      return ['archetype', 'custom']
    case 'consultant':
      return ['industry4', 'custom']
    case 'school':
      return ['education', 'custom']
    default:
      return ['industry4'] // Default for legacy users
  }
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

  // New state for unified campaign system
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [assessmentType, setAssessmentType] = useState<string>('')
  const [simpleParticipants, setSimpleParticipants] = useState<SimpleParticipant[]>([])
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' })

  const [formData, setFormData] = useState({
    campaignName: '',
    companyProfileId: initialCompanyId || '',
    facilitatorName: '',
    facilitatorEmail: '',
    description: ''
  })

  // Check if current assessment type requires company selection
  const requiresCompany = assessmentType === 'industry4'

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

      // Fetch user profile (includes user_type)
      const { data: profile } = (await supabase
        .from('user_profiles')
        .select('full_name, email, user_type')
        .eq('id', session.user.id)
        .single()) as { data: UserProfile | null, error: any }

      if (profile) {
        setUserProfile(profile)
        setFormData(prev => ({
          ...prev,
          facilitatorName: profile.full_name || '',
          facilitatorEmail: profile.email || ''
        }))
      }

      // Fetch tenant profile for assessment type filtering
      const { data: tenant } = (await supabase
        .from('tenant_profiles')
        .select('id, tenant_type, enabled_assessments')
        .eq('user_id', session.user.id)
        .single()) as { data: TenantProfile | null, error: any }

      if (tenant) {
        setTenantProfile(tenant)
        // Set default assessment type based on tenant type
        const availableTypes = getAssessmentTypesForTenant(tenant.tenant_type)
        setAssessmentType(availableTypes[0] || 'industry4')
      } else {
        // Legacy user - default to industry4
        setAssessmentType('industry4')
      }

      // Fetch companies (only needed for industry4 assessments, but load anyway for flexibility)
      const response = await fetch(apiUrl('api/company-profiles'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      setCompanies(data.companies || [])
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

      const response = await fetch(apiUrl(`api/company-profiles/${companyId}/stakeholders`), {
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

  // Simple participant functions (for non-company campaigns)
  function addSimpleParticipant() {
    if (!newParticipant.name || !newParticipant.email) {
      setError('Please fill in participant name and email')
      return
    }
    setSimpleParticipants([...simpleParticipants, { ...newParticipant }])
    setNewParticipant({ name: '', email: '' })
    setError(null)
  }

  function removeSimpleParticipant(index: number) {
    setSimpleParticipants(simpleParticipants.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.campaignName) {
      setError('Please enter a campaign name')
      return
    }

    // Company required only for industry4 assessments
    if (requiresCompany && !formData.companyProfileId) {
      setError('Please select a company for Industry 4.0 assessments')
      return
    }

    // Check for participants based on assessment type
    if (requiresCompany) {
      if (selectedStakeholders.length === 0) {
        setError('Please select or add at least one stakeholder')
        return
      }
    } else {
      if (simpleParticipants.length === 0) {
        setError('Please add at least one participant')
        return
      }
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

      // Build request body based on assessment type
      const requestBody: Record<string, any> = {
        name: formData.campaignName,
        assessmentType: assessmentType,
        facilitatorName: formData.facilitatorName,
        facilitatorEmail: formData.facilitatorEmail,
        description: formData.description,
      }

      if (requiresCompany) {
        // Industry 4.0 assessment - needs company and stakeholders
        requestBody.companyProfileId = formData.companyProfileId
        requestBody.stakeholders = selectedStakeholders
      } else {
        // Non-company campaigns - use simple participants
        requestBody.participants = simpleParticipants
      }

      const response = await fetch(apiUrl('api/campaigns'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      // Store campaign data and show success modal with access links
      setCreatedCampaignId(data.campaign.id)
      setStakeholderLinks(data.participantAssignments || [])
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Campaign</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a campaign and assign stakeholders for interviews
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Campaign Details</h2>

            <div className="space-y-4">
              {/* Assessment Type Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Assessment Type <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getAssessmentTypesForTenant(tenantProfile?.tenant_type || null).map(type => {
                    const typeInfo = ASSESSMENT_TYPES[type as keyof typeof ASSESSMENT_TYPES]
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setAssessmentType(type)
                          // Clear company selection when switching away from industry4
                          if (type !== 'industry4') {
                            updateField('companyProfileId', '')
                          }
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          assessmentType === type
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-muted hover:bg-muted'
                        }`}
                      >
                        <div className="font-medium text-foreground">{typeInfo?.label || type}</div>
                        <div className="text-xs text-muted-foreground mt-1">{typeInfo?.description || ''}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Company selector - only for industry4 assessments */}
              {requiresCompany && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.companyProfileId}
                    onChange={(e) => updateField('companyProfileId', e.target.value)}
                    required={requiresCompany}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a company...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                  {companies.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No companies found. <Link href="/dashboard/companies/new" className="text-primary hover:underline">Add a company</Link> first.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Campaign Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => updateField('campaignName', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Q1 2025 Digital Transformation Assessment"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Facilitator Name
                  </label>
                  <input
                    type="text"
                    value={formData.facilitatorName}
                    onChange={(e) => updateField('facilitatorName', e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Facilitator Email
                  </label>
                  <input
                    type="email"
                    value={formData.facilitatorEmail}
                    onChange={(e) => updateField('facilitatorEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Brief description of this campaign..."
                />
              </div>
            </div>
          </div>

          {/* Simple Participants - for non-company campaigns (coaches, institutions) */}
          {!requiresCompany && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Add Participants <span className="text-destructive">*</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add the people who will complete this assessment. They will receive a unique access link.
              </p>

              {/* Add Participant Form */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  placeholder="Participant Name"
                  className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="email"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  placeholder="Email Address"
                  className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={addSimpleParticipant}
                  className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(var(--accent-hover))] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Participants List */}
              {simpleParticipants.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Participants ({simpleParticipants.length}):
                  </h3>
                  <div className="space-y-2">
                    {simpleParticipants.map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-foreground">{participant.name}</div>
                          <div className="text-xs text-muted-foreground">{participant.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSimpleParticipant(index)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stakeholder Selection - for company-based campaigns (industry4) */}
          {requiresCompany && formData.companyProfileId && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Assign Stakeholders <span className="text-destructive">*</span>
              </h2>

              {/* Existing Stakeholders */}
              {availableStakeholders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-3">
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
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-background hover:border-muted hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium text-foreground">{stakeholder.full_name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{stakeholder.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
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
                    className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Stakeholder
                  </button>
                ) : (
                  <div className="p-4 bg-background border border-border rounded-lg">
                    <h3 className="text-sm font-medium text-foreground mb-3">New Stakeholder</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newStakeholder.fullName}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, fullName: e.target.value })}
                        placeholder="Full Name *"
                        className="px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <input
                        type="email"
                        value={newStakeholder.email}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                        placeholder="Email *"
                        className="px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <select
                        value={newStakeholder.roleType}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, roleType: e.target.value })}
                        className="px-3 py-2 bg-input border border-border rounded text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                        className="px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={addNewStakeholder}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-[hsl(var(--accent-hover))] transition-colors"
                      >
                        Add to Campaign
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewStakeholderForm(false)}
                        className="px-4 py-2 bg-muted text-foreground rounded hover:bg-border transition-colors"
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
                  <h3 className="text-sm font-medium text-foreground mb-3">
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
                          className="flex items-center justify-between p-3 bg-background border border-border rounded-lg mb-2"
                        >
                          <div>
                            <div className="font-medium text-foreground">{fullStakeholder.full_name}</div>
                            <div className="text-xs text-muted-foreground">{fullStakeholder.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStakeholder(index)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null
                    } else {
                      return (
                        <div
                          key={`new-${index}`}
                          className="flex items-center justify-between p-3 bg-background border border-border rounded-lg mb-2"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              {stakeholder.fullName} <span className="text-xs text-primary">(New)</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{stakeholder.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStakeholder(index)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
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
              className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || (requiresCompany ? selectedStakeholders.length === 0 : simpleParticipants.length === 0)}
              className="px-6 py-2 bg-primary hover:bg-[hsl(var(--accent-hover))] rounded-lg text-primary-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal with Access Links */}
      {success && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
            <div className="flex flex-col">
              {/* Success Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl font-bold text-foreground mb-2 text-center">
                Campaign Created Successfully!
              </h3>
              <p className="text-muted-foreground mb-6 text-center">
                Share these interview access links with your stakeholders
              </p>

              {/* Stakeholder Access Links */}
              <div className="space-y-4 mb-6">
                {stakeholderLinks.map((stakeholder, index) => (
                  <div
                    key={index}
                    className="bg-background border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground font-medium mb-1">
                          {stakeholder.stakeholder_name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {stakeholder.stakeholder_email}
                        </p>
                        <div className="bg-muted border border-border rounded px-3 py-2">
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
                        className="flex-shrink-0 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                  className="flex-1 bg-muted hover:bg-border text-foreground px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Copy All Links
                </button>
                <button
                  onClick={() => router.push(`/dashboard/campaigns/${createdCampaignId}`)}
                  className="flex-1 bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  View Campaign
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    }>
      <CampaignFormWrapper />
    </Suspense>
  )
}
