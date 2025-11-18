'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Users, Mail, Briefcase, Building2 } from 'lucide-react'

const ROLE_TYPES = [
  { value: 'managing_director', label: 'Managing Director' },
  { value: 'it_operations', label: 'IT Operations' },
  { value: 'production_manager', label: 'Production Manager' },
  { value: 'purchasing_manager', label: 'Purchasing Manager' },
  { value: 'planning_scheduler', label: 'Planning & Scheduler' },
  { value: 'engineering_maintenance', label: 'Engineering & Maintenance' }
]

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

export default function EditStakeholderPage({ params }: { params: { id: string, stakeholderId: string } }) {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    roleType: 'managing_director' as string,
    title: '',
    department: ''
  })

  useEffect(() => {
    loadData()
  }, [params.id, params.stakeholderId])

  async function loadData() {
    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Authentication required. Please sign in again.')
        return
      }

      // Load company
      const companyResponse = await fetch('/api/company-profiles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const companyData = await companyResponse.json()
      const foundCompany = companyData.companies?.find((c: CompanyProfile) => c.id === params.id)

      if (!foundCompany) {
        setError('Company not found or you do not have access to it')
        return
      }

      setCompany(foundCompany)

      // Load stakeholder
      const stakeholderResponse = await fetch(
        `/api/company-profiles/${params.id}/stakeholders/${params.stakeholderId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      const stakeholderData = await stakeholderResponse.json()

      if (!stakeholderResponse.ok || !stakeholderData.stakeholder) {
        setError('Stakeholder not found')
        return
      }

      const stakeholder = stakeholderData.stakeholder

      // Populate form
      setFormData({
        fullName: stakeholder.full_name,
        email: stakeholder.email,
        roleType: stakeholder.role_type,
        title: stakeholder.title || '',
        department: stakeholder.department || ''
      })

    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load stakeholder information')
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.fullName || !formData.email || !formData.roleType) {
      setError('Please fill in all required fields')
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

      const response = await fetch(
        `/api/company-profiles/${params.id}/stakeholders/${params.stakeholderId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update stakeholder profile')
      }

      // Success! Navigate back to company detail page
      router.push(`/dashboard/companies/${params.id}`)
    } catch (err) {
      console.error('Error updating stakeholder:', err)
      setError(err instanceof Error ? err.message : 'Failed to update stakeholder profile')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${formData.fullName}? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Authentication required. Please sign in again.')
        return
      }

      const response = await fetch(
        `/api/company-profiles/${params.id}/stakeholders/${params.stakeholderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete stakeholder profile')
      }

      // Success! Navigate back to company detail page
      router.push(`/dashboard/companies/${params.id}`)
    } catch (err) {
      console.error('Error deleting stakeholder:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete stakeholder profile')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ctp-base flex items-center justify-center">
        <div className="text-ctp-text">Loading...</div>
      </div>
    )
  }

  if (error && !formData.fullName) {
    return (
      <div className="min-h-screen bg-ctp-base">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-ctp-red/10 border border-ctp-red rounded-lg p-6 text-ctp-red">
            {error}
          </div>
          <Link
            href={`/dashboard/companies/${params.id}`}
            className="inline-block mt-4 text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors"
          >
            ← Back to Company
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctp-base">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/companies/${params.id}`}
            className="text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors mb-4 inline-block"
          >
            ← Back to {company?.company_name}
          </Link>
          <h1 className="text-3xl font-bold text-ctp-text">Edit Stakeholder</h1>
          <p className="mt-2 text-sm text-ctp-subtext0">
            Update stakeholder profile information
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-ctp-red/10 border border-ctp-red rounded-lg text-ctp-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
            <h2 className="text-lg font-semibold text-ctp-text mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Full Name <span className="text-ctp-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address <span className="text-ctp-red">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
            <h2 className="text-lg font-semibold text-ctp-text mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Professional Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Role Type <span className="text-ctp-red">*</span>
                </label>
                <select
                  value={formData.roleType}
                  onChange={(e) => updateField('roleType', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  required
                >
                  {ROLE_TYPES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="Senior Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="Operations"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || submitting}
              className="px-6 py-2 bg-ctp-red/10 border border-ctp-red rounded-lg text-ctp-red font-medium hover:bg-ctp-red/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Stakeholder'}
            </button>

            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/companies/${params.id}`}
                className="px-6 py-2 text-ctp-subtext0 hover:text-ctp-text transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || deleting}
                className="px-6 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
