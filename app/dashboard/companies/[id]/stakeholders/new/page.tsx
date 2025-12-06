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

export default function NewStakeholderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    roleType: 'managing_director' as string,
    title: '',
    department: ''
  })

  // Unwrap params Promise
  useEffect(() => {
    params.then(p => setCompanyId(p.id))
  }, [params])

  useEffect(() => {
    if (companyId) {
      loadCompany()
    }
  }, [companyId])

  async function loadCompany() {
    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Authentication required. Please sign in again.')
        return
      }

      const response = await fetch('api/company-profiles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      const foundCompany = data.companies?.find((c: CompanyProfile) => c.id === companyId)

      if (!foundCompany) {
        setError('Company not found or you do not have access to it')
        return
      }

      setCompany(foundCompany)
    } catch (err) {
      console.error('Error loading company:', err)
      setError('Failed to load company information')
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

      const response = await fetch(`api/company-profiles/${companyId}/stakeholders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create stakeholder profile')
      }

      // Success! Navigate back to company detail page
      router.push(`/dashboard/companies/${companyId}`)
    } catch (err) {
      console.error('Error creating stakeholder:', err)
      setError(err instanceof Error ? err.message : 'Failed to create stakeholder profile')
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

  if (error && !company) {
    return (
      <div className="min-h-screen bg-ctp-base">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-ctp-red/10 border border-ctp-red rounded-lg p-6 text-ctp-red">
            {error}
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
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/companies/${companyId}`}
            className="text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors mb-4 inline-block"
          >
            ← Back to {company?.company_name}
          </Link>
          <h1 className="text-3xl font-bold text-ctp-text">Add Stakeholder</h1>
          <p className="mt-2 text-sm text-ctp-subtext0">
            Create a new stakeholder profile for {company?.company_name}
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
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/dashboard/companies/${companyId}`}
              className="px-6 py-2 text-ctp-subtext0 hover:text-ctp-text transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Add Stakeholder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
