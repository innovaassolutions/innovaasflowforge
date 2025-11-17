'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stakeholder {
  id: string
  fullName: string
  email: string
  position: string
  department: string
  dailyTaskDescription: string
  roleType: 'managing_director' | 'it_operations' | 'production_manager' |
           'purchasing_manager' | 'planning_scheduler' | 'engineering_maintenance'
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [campaignName, setCampaignName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [facilitatorName, setFacilitatorName] = useState('')
  const [facilitatorEmail, setFacilitatorEmail] = useState('')
  const [description, setDescription] = useState('')
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [showStakeholderForm, setShowStakeholderForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stakeholder form state
  const [newStakeholder, setNewStakeholder] = useState<Partial<Stakeholder>>({
    roleType: 'managing_director'
  })

  function addStakeholder() {
    if (!newStakeholder.fullName || !newStakeholder.email || !newStakeholder.position ||
        !newStakeholder.department || !newStakeholder.dailyTaskDescription) {
      alert('Please fill in all stakeholder fields')
      return
    }

    const stakeholder: Stakeholder = {
      id: Date.now().toString(),
      fullName: newStakeholder.fullName!,
      email: newStakeholder.email!,
      position: newStakeholder.position!,
      department: newStakeholder.department!,
      dailyTaskDescription: newStakeholder.dailyTaskDescription!,
      roleType: newStakeholder.roleType || 'managing_director'
    }

    setStakeholders([...stakeholders, stakeholder])
    setNewStakeholder({ roleType: 'managing_director' })
    setShowStakeholderForm(false)
  }

  function removeStakeholder(id: string) {
    setStakeholders(stakeholders.filter(s => s.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (stakeholders.length === 0) {
      alert('Please add at least one stakeholder')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          companyName,
          facilitatorName,
          facilitatorEmail,
          description,
          stakeholders: stakeholders.map(s => ({
            fullName: s.fullName,
            email: s.email,
            position: s.position,
            department: s.department,
            dailyTaskDescription: s.dailyTaskDescription,
            roleType: s.roleType
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/campaigns/${data.campaign.id}`)
      } else {
        setError(data.error || 'Failed to create campaign')
      }
    } catch (err) {
      setError('Error creating campaign')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const roleTypeLabels: Record<string, string> = {
    managing_director: 'Managing Director / C-Level',
    it_operations: 'IT Operations Manager',
    production_manager: 'Production Manager',
    purchasing_manager: 'Purchasing Manager',
    planning_scheduler: 'Planning / Scheduler',
    engineering_maintenance: 'Engineering / Maintenance'
  }

  return (
    <div className="min-h-screen bg-mocha-base">
      {/* Header */}
      <header className="bg-mocha-mantle border-b border-mocha-surface0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-mocha-subtext1 hover:text-mocha-text transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-brand-teal bg-clip-text text-transparent mt-4">
            Create New Campaign
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campaign Details */}
          <div className="bg-mocha-surface0 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-mocha-text">
              Campaign Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-mocha-text mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                required
                className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-3 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="e.g., Industry 4.0 Readiness Assessment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mocha-text mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-3 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="e.g., Alimex ACP Asia"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-mocha-text mb-2">
                  Facilitator Name *
                </label>
                <input
                  type="text"
                  value={facilitatorName}
                  onChange={(e) => setFacilitatorName(e.target.value)}
                  required
                  className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-3 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mocha-text mb-2">
                  Facilitator Email *
                </label>
                <input
                  type="email"
                  value={facilitatorEmail}
                  onChange={(e) => setFacilitatorEmail(e.target.value)}
                  required
                  className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-3 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mocha-text mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-3 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="Brief description of this assessment campaign"
              />
            </div>
          </div>

          {/* Stakeholders */}
          <div className="bg-mocha-surface0 rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-mocha-text">
                Stakeholders ({stakeholders.length})
              </h2>
              {!showStakeholderForm && (
                <button
                  type="button"
                  onClick={() => setShowStakeholderForm(true)}
                  className="bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Add Stakeholder
                </button>
              )}
            </div>

            {/* Stakeholder List */}
            {stakeholders.length > 0 && (
              <div className="space-y-3">
                {stakeholders.map((stakeholder) => (
                  <div
                    key={stakeholder.id}
                    className="bg-mocha-base border border-mocha-surface1 rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-mocha-text">
                          {stakeholder.fullName}
                        </h3>
                        <span className="text-xs bg-brand-orange/20 text-brand-orange px-2 py-1 rounded">
                          {roleTypeLabels[stakeholder.roleType]}
                        </span>
                      </div>
                      <p className="text-sm text-mocha-subtext1 mt-1">
                        {stakeholder.position} • {stakeholder.department}
                      </p>
                      <p className="text-sm text-mocha-subtext0 mt-2">
                        {stakeholder.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStakeholder(stakeholder.id)}
                      className="text-red-400 hover:text-red-300 transition-colors">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Stakeholder Form */}
            {showStakeholderForm && (
              <div className="bg-mocha-base border border-mocha-surface1 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-mocha-text">Add New Stakeholder</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newStakeholder.fullName || ''}
                      onChange={(e) => setNewStakeholder({ ...newStakeholder, fullName: e.target.value })}
                      className="w-full bg-mocha-surface0 border border-mocha-surface1 rounded px-3 py-2 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newStakeholder.email || ''}
                      onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                      className="w-full bg-mocha-surface0 border border-mocha-surface1 rounded px-3 py-2 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={newStakeholder.position || ''}
                      onChange={(e) => setNewStakeholder({ ...newStakeholder, position: e.target.value })}
                      className="w-full bg-mocha-surface0 border border-mocha-surface1 rounded px-3 py-2 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      placeholder="e.g., IT Operations Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      value={newStakeholder.department || ''}
                      onChange={(e) => setNewStakeholder({ ...newStakeholder, department: e.target.value })}
                      className="w-full bg-mocha-surface0 border border-mocha-surface1 rounded px-3 py-2 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      placeholder="e.g., Information Technology"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                      Role Type *
                    </label>
                    <select
                      value={newStakeholder.roleType}
                      onChange={(e) => setNewStakeholder({ ...newStakeholder, roleType: e.target.value as any })}
                      className="w-full bg-mocha-surface0 border border-mocha-surface1 rounded px-3 py-2 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-teal">
                      {Object.entries(roleTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                      Daily Task Description *
                    </label>
                    <textarea
                      value={newStakeholder.dailyTaskDescription || ''}
                      onChange={(e) => setNewStakeholder({ ...newStakeholder, dailyTaskDescription: e.target.value })}
                      rows={3}
                      className="w-full bg-mocha-surface0 border border-mocha-surface1 rounded px-3 py-2 text-mocha-text focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      placeholder="Describe their typical daily responsibilities and tasks"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setNewStakeholder({ roleType: 'managing_director' })
                      setShowStakeholderForm(false)
                    }}
                    className="px-4 py-2 text-mocha-subtext1 hover:text-mocha-text transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addStakeholder}
                    className="bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    Add Stakeholder
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 text-mocha-subtext1 hover:text-mocha-text transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || stakeholders.length === 0}
              className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              {submitting ? 'Creating Campaign...' : 'Create Campaign & Send Invitations'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
