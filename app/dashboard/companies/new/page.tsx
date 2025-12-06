'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiUrl } from '@/lib/api-url'
import { Building2, Globe, MapPin, Users, DollarSign } from 'lucide-react'

const INDUSTRIES = [
  'Manufacturing',
  'Automotive',
  'Aerospace',
  'Electronics',
  'Pharmaceuticals',
  'Food & Beverage',
  'Chemical',
  'Consumer Goods',
  'Industrial Equipment',
  'Technology',
  'Other'
]

const MARKET_SCOPES = [
  { value: 'local', label: 'Local', description: 'City or local area' },
  { value: 'regional', label: 'Regional', description: 'State or multi-state region' },
  { value: 'national', label: 'National', description: 'Entire country' },
  { value: 'international', label: 'International', description: 'Multiple countries' }
]

const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+'
]

const REVENUE_RANGES = [
  'Under $1M',
  '$1M-$10M',
  '$10M-$50M',
  '$50M-$100M',
  '$100M-$500M',
  '$500M-$1B',
  'Over $1B'
]

export default function NewCompanyPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Manufacturing',
    description: '',
    website: '',
    marketScope: 'national' as 'local' | 'regional' | 'national' | 'international',
    employeeCountRange: '',
    annualRevenueRange: '',
    headquartersLocation: ''
  })

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.companyName || !formData.industry) {
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

      const response = await fetch(apiUrl('api/company-profiles'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create company profile')
      }

      // Success! Navigate to companies list
      router.push('/dashboard/companies')
    } catch (err) {
      console.error('Error creating company:', err)
      setError(err instanceof Error ? err.message : 'Failed to create company profile')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ctp-base">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/companies"
            className="text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors mb-4 inline-block"
          >
            ← Back to Companies
          </Link>
          <h1 className="text-3xl font-bold text-ctp-text">Create Company Profile</h1>
          <p className="mt-2 text-sm text-ctp-subtext0">
            Add a new company to manage campaigns and stakeholders
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-ctp-red/10 border border-ctp-red rounded-lg text-ctp-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
            <h2 className="text-lg font-semibold text-ctp-text mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Company Name <span className="text-ctp-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="Acme Manufacturing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Industry <span className="text-ctp-red">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateField('industry', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  required
                >
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
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
                  placeholder="Brief description of what the company does..."
                />
              </div>
            </div>
          </div>

          {/* Market & Location */}
          <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
            <h2 className="text-lg font-semibold text-ctp-text mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Market & Location
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Market Scope <span className="text-ctp-red">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MARKET_SCOPES.map(scope => (
                    <button
                      key={scope.value}
                      type="button"
                      onClick={() => updateField('marketScope', scope.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.marketScope === scope.value
                          ? 'border-ctp-peach bg-ctp-peach/10 text-ctp-text'
                          : 'border-ctp-surface1 bg-ctp-base text-ctp-subtext0 hover:border-ctp-surface2'
                      }`}
                    >
                      <div className="font-medium">{scope.label}</div>
                      <div className="text-xs mt-1">{scope.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Headquarters Location
                </label>
                <input
                  type="text"
                  value={formData.headquartersLocation}
                  onChange={(e) => updateField('headquartersLocation', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                  placeholder="Detroit, MI"
                />
              </div>
            </div>
          </div>

          {/* Company Size */}
          <div className="bg-ctp-surface0 rounded-lg border border-ctp-surface1 p-6">
            <h2 className="text-lg font-semibold text-ctp-text mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Company Size
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Employee Count
                </label>
                <select
                  value={formData.employeeCountRange}
                  onChange={(e) => updateField('employeeCountRange', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                >
                  <option value="">Select range...</option>
                  {EMPLOYEE_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ctp-text mb-2">
                  Annual Revenue
                </label>
                <select
                  value={formData.annualRevenueRange}
                  onChange={(e) => updateField('annualRevenueRange', e.target.value)}
                  className="w-full px-4 py-2 bg-ctp-base border border-ctp-surface1 rounded-lg text-ctp-text focus:border-ctp-peach focus:outline-none"
                >
                  <option value="">Select range...</option>
                  {REVENUE_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard/companies"
              className="px-6 py-2 text-ctp-subtext0 hover:text-ctp-text transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-ctp-peach to-ctp-teal rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Company Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
