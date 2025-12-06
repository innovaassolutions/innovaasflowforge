'use client'

import { useEffect, useState } from 'react'
import { apiUrl } from '@/lib/api-url'
import { useRouter, useParams } from 'next/navigation'
import { apiUrl } from '@/lib/api-url'
import Link from 'next/link'
import { apiUrl } from '@/lib/api-url'

interface Stakeholder {
  id?: string
  fullName: string
  email: string
  position: string
  department: string
  dailyTaskDescription: string
  roleType: 'managing_director' | 'it_operations' | 'production_manager' | 'purchasing_manager' | 'planning_scheduler' | 'engineering_maintenance'
}

interface Campaign {
  id: string
  name: string
  company_name: string
  facilitator_name: string
  facilitator_email: string
  description?: string
}

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [existingStakeholders, setExistingStakeholders] = useState<any[]>([])
  const [newStakeholders, setNewStakeholders] = useState<Stakeholder[]>([])

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(apiUrl(`api/campaigns/${campaignId}`)
      const data = await response.json()

      if (data.success) {
        setCampaign(data.campaign)
        setExistingStakeholders(data.campaign.stakeholders || [])
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStakeholder = () => {
    setNewStakeholders([
      ...newStakeholders,
      {
        fullName: '',
        email: '',
        position: '',
        department: '',
        dailyTaskDescription: '',
        roleType: 'managing_director'
      }
    ])
  }

  const updateStakeholder = (index: number, field: keyof Stakeholder, value: string) => {
    const updated = [...newStakeholders]
    updated[index] = { ...updated[index], [field]: value }
    setNewStakeholders(updated)
  }

  const removeStakeholder = (index: number) => {
    setNewStakeholders(newStakeholders.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newStakeholders.length === 0) {
      alert('Please add at least one new stakeholder')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(apiUrl(`api/campaigns/${campaignId}/stakeholders`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stakeholders: newStakeholders })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Successfully added ${newStakeholders.length} stakeholder(s)!`)
        router.push(`/dashboard/campaigns/${campaignId}`)
      } else {
        alert('Error adding stakeholders: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to add stakeholders')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400">Loading campaign...</div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-red-400">Campaign not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/dashboard/campaigns/${campaignId}`}
            className="text-teal-400 hover:text-teal-300"
          >
            ← Back to Campaign
          </Link>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Add Stakeholders</h1>
          <p className="text-gray-400">{campaign.name} - {campaign.company_name}</p>
        </div>

        {existingStakeholders.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Existing Stakeholders</h2>
            <div className="space-y-2">
              {existingStakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <p className="text-gray-100 font-medium">{stakeholder.stakeholder_name}</p>
                    <p className="text-sm text-gray-400">{stakeholder.stakeholder_email} • {stakeholder.stakeholder_title}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${
                    stakeholder.status === 'completed' ? 'bg-green-900 text-green-300' :
                    stakeholder.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {stakeholder.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-100">New Stakeholders</h2>
              <button
                type="button"
                onClick={addStakeholder}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                + Add Stakeholder
              </button>
            </div>

            {newStakeholders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Click "Add Stakeholder" to add new participants to this campaign
              </p>
            ) : (
              <div className="space-y-6">
                {newStakeholders.map((stakeholder, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-100">Stakeholder {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeStakeholder(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={stakeholder.fullName}
                          onChange={(e) => updateStakeholder(index, 'fullName', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                          placeholder="Malcolm Sterling"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={stakeholder.email}
                          onChange={(e) => updateStakeholder(index, 'email', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                          placeholder="malcolm@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Position/Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={stakeholder.position}
                          onChange={(e) => updateStakeholder(index, 'position', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                          placeholder="Managing Director"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Department *
                        </label>
                        <input
                          type="text"
                          required
                          value={stakeholder.department}
                          onChange={(e) => updateStakeholder(index, 'department', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                          placeholder="Executive Management"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Role Type *
                        </label>
                        <select
                          required
                          value={stakeholder.roleType}
                          onChange={(e) => updateStakeholder(index, 'roleType', e.target.value as any)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                        >
                          <option value="managing_director">Managing Director</option>
                          <option value="it_operations">IT Operations Manager</option>
                          <option value="production_manager">Production Manager</option>
                          <option value="purchasing_manager">Purchasing Manager</option>
                          <option value="planning_scheduler">Planning & Scheduler</option>
                          <option value="engineering_maintenance">Engineering & Maintenance</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Daily Task Description *
                        </label>
                        <textarea
                          required
                          value={stakeholder.dailyTaskDescription}
                          onChange={(e) => updateStakeholder(index, 'dailyTaskDescription', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                          rows={3}
                          placeholder="Describe their key responsibilities and daily tasks..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {newStakeholders.length > 0 && (
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {submitting ? 'Adding Stakeholders...' : `Add ${newStakeholders.length} Stakeholder${newStakeholders.length > 1 ? 's' : ''}`}
              </button>
              <Link
                href={`/dashboard/campaigns/${campaignId}`}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-center"
              >
                Cancel
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
