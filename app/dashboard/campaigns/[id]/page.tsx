'use client'

import { useState, useEffect } from 'react'
import { apiUrl } from '@/lib/api-url'
import { useParams, useRouter } from 'next/navigation'
import { apiUrl } from '@/lib/api-url'
import Link from 'next/link'
import { apiUrl } from '@/lib/api-url'
import { CheckCircle2, Clock, Mail, Pause, Share2 } from 'lucide-react'
import { apiUrl } from '@/lib/api-url'
import { ReportGenerationPanel } from '@/components/reports/ReportGenerationPanel'
import { apiUrl } from '@/lib/api-url'

interface StakeholderSession {
  id: string
  stakeholder_name: string
  stakeholder_email: string
  stakeholder_title: string
  stakeholder_role: string
  status: string
  started_at: string | null
  completed_at: string | null
  access_token: string
}

interface Campaign {
  id: string
  name: string
  company_name: string
  facilitator_name: string
  facilitator_email: string
  description: string | null
  status: string
  created_at: string
  stakeholders: StakeholderSession[]
  progress: {
    total: number
    completed: number
    inProgress: number
    pending: number
    percentComplete: number
  }
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [completingSession, setCompletingSession] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showReportPanel, setShowReportPanel] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCampaign()
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchCampaign, 10000)
    return () => clearInterval(interval)
  }, [params.id])

  async function fetchCampaign() {
    try {
      setLoading(true)
      const response = await fetch(apiUrl(`api/campaigns/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setCampaign(data.campaign)
        setEditForm({
          name: data.campaign.name,
          description: data.campaign.description || '',
          status: data.campaign.status
        })
        setError(null)
      } else {
        setError('Failed to load campaign')
      }
    } catch (err) {
      setError('Error loading campaign')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this campaign? This will permanently delete all stakeholder sessions and data.')) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(apiUrl(`api/campaigns/${params.id}`), {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        alert('Campaign deleted successfully')
        router.push('/dashboard')
      } else {
        alert('Failed to delete campaign: ' + data.error)
      }
    } catch (err) {
      alert('Error deleting campaign')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  async function handleSaveEdit() {
    try {
      const response = await fetch(apiUrl(`api/campaigns/${params.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await response.json()

      if (data.success) {
        setCampaign({ ...campaign!, ...data.campaign })
        setEditing(false)
        alert('Campaign updated successfully')
      } else {
        alert('Failed to update campaign: ' + data.error)
      }
    } catch (err) {
      alert('Error updating campaign')
      console.error(err)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400'
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'invited':
        return 'bg-mocha-overlay0/20 text-mocha-overlay0'
      default:
        return 'bg-mocha-overlay0/20 text-mocha-overlay0'
    }
  }

  function getStatusIcon(status: string, startedAt: string | null) {
    // Completed
    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-green-400" />
    }

    // Paused (in progress but no recent activity - placeholder for future implementation)
    if (status === 'paused') {
      return <Pause className="w-5 h-5 text-yellow-400" />
    }

    // In progress
    if (status === 'in_progress') {
      return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
    }

    // Accessed but not started (started_at exists but status is still invited)
    if (startedAt && status === 'invited') {
      return <Mail className="w-5 h-5 text-purple-400" />
    }

    // Not accessed yet (invited)
    return <Mail className="w-5 h-5 text-mocha-overlay0" />
  }

  function getStatusLabel(status: string, startedAt: string | null) {
    if (status === 'completed') return 'Complete'
    if (status === 'paused') return 'Paused'
    if (status === 'in_progress') return 'In Progress'
    if (startedAt && status === 'invited') return 'Accessed'
    return 'Invited'
  }

  function getRoleTypeLabel(roleType: string): string {
    const labels: Record<string, string> = {
      managing_director: 'Managing Director',
      it_operations: 'IT Operations',
      production_manager: 'Production Manager',
      purchasing_manager: 'Purchasing Manager',
      planning_scheduler: 'Planning/Scheduler',
      engineering_maintenance: 'Engineering/Maintenance'
    }
    return labels[roleType] || roleType
  }

  async function handleCompleteSession(sessionId: string, stakeholderName: string) {
    if (!confirm(`Are you sure you want to mark ${stakeholderName}'s interview as complete? This action cannot be undone.`)) {
      return
    }

    try {
      setCompletingSession(sessionId)
      const response = await fetch(apiUrl(`api/campaigns/${params.id}/sessions/${sessionId}/complete`), {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        // Refresh campaign data to show updated status
        await fetchCampaign()
      } else {
        alert('Failed to complete session: ' + data.error)
      }
    } catch (err) {
      alert('Error completing session')
      console.error(err)
    } finally {
      setCompletingSession(null)
    }
  }

  async function handleGenerateReport() {
    console.log('[Generate Report] Button clicked')
    console.log('[Generate Report] Campaign:', campaign)
    console.log('[Generate Report] Completed interviews:', campaign?.progress.completed)

    if (campaign!.progress.completed === 0) {
      alert('No completed interviews found. At least one interview must be completed to generate a report.')
      return
    }

    console.log('[Generate Report] Starting synthesis...')

    try {
      setGeneratingReport(true)

      const response = await fetch(apiUrl(`api/campaigns/${params.id}/synthesize`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'markdown' })
      })

      const data = await response.json()

      if (data.success) {
        // Download the markdown report
        const blob = new Blob([data.report], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        alert(
          `Report generated successfully!\n\n` +
          `Overall Readiness Score: ${data.assessment.overallScore.toFixed(1)}/5.0\n` +
          `Pillars Analyzed: ${data.assessment.pillars.length}\n` +
          `Key Themes: ${data.assessment.themeCount}\n` +
          `Recommendations: ${data.assessment.recommendationCount}\n\n` +
          `File downloaded: ${data.filename}`
        )
      } else {
        alert('Failed to generate report: ' + data.error)
      }
    } catch (err) {
      alert('Error generating report')
      console.error(err)
    } finally {
      setGeneratingReport(false)
    }
  }

  async function handleGeneratePDF() {
    console.log('[Generate PDF] Button clicked')
    console.log('[Generate PDF] Campaign:', campaign)
    console.log('[Generate PDF] Completed interviews:', campaign?.progress.completed)

    if (campaign!.progress.completed === 0) {
      alert('No completed interviews found. At least one interview must be completed to generate a PDF report.')
      return
    }

    console.log('[Generate PDF] Starting PDF generation...')

    try {
      setGeneratingPDF(true)

      const response = await fetch(apiUrl(`api/campaigns/${params.id}/generate-pdf`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Download the PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        // Extract filename from Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `${campaign!.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Assessment.pdf`

        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        alert('PDF report generated and downloaded successfully!')
      } else {
        const data = await response.json()
        alert('Failed to generate PDF: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Error generating PDF')
      console.error(err)
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (loading && !campaign) {
    return (
      <div className="min-h-screen bg-mocha-base flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-r-transparent"></div>
          <p className="text-mocha-subtext1 mt-4">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-mocha-base flex items-center justify-center">
        <div className="bg-mocha-surface0 border border-red-500/20 rounded-lg p-8">
          <p className="text-red-400">{error}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-brand-teal hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!campaign) return null

  return (
    <div className="min-h-screen bg-mocha-base">
      {/* Header */}
      <header className="bg-mocha-mantle border-b border-mocha-surface0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="text-mocha-subtext1 hover:text-mocha-text transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="mt-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-brand-teal bg-clip-text text-transparent">
                  {campaign.name}
                </h1>
                <p className="text-mocha-subtext1 mt-2">
                  {campaign.company_name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    campaign.status
                  )}`}>
                  {campaign.status}
                </span>
                {campaign.progress.completed > 0 && (
                  <>
                    <button
                      onClick={() => setShowReportPanel(true)}
                      className="bg-gradient-to-r from-brand-orange to-brand-teal hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-opacity flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Generate Client Report
                    </button>
                    <button
                      onClick={handleGeneratePDF}
                      disabled={generatingPDF}
                      className="bg-mocha-surface0 hover:bg-mocha-surface1 text-mocha-text border border-mocha-surface1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                      {generatingPDF ? (
                        <>
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-r-transparent"></div>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          Download PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      disabled={generatingReport}
                      className="bg-mocha-surface0 hover:bg-mocha-surface1 text-mocha-text border border-mocha-surface1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                      {generatingReport ? (
                        <>
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-r-transparent"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          Download Markdown
                        </>
                      )}
                    </button>
                  </>
                )}
                <Link
                  href={`/dashboard/campaigns/${campaign.id}/edit`}
                  className="btn-primary">
                  + Add Stakeholders
                </Link>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary">
                  Edit Details
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-mocha-surface0 rounded-lg p-6">
            <h3 className="text-sm font-medium text-mocha-subtext1">Total Stakeholders</h3>
            <p className="text-3xl font-bold text-mocha-text mt-2">
              {campaign.progress.total}
            </p>
          </div>
          <div className="bg-mocha-surface0 rounded-lg p-6">
            <h3 className="text-sm font-medium text-mocha-subtext1">Completed</h3>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {campaign.progress.completed}
            </p>
          </div>
          <div className="bg-mocha-surface0 rounded-lg p-6">
            <h3 className="text-sm font-medium text-mocha-subtext1">In Progress</h3>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {campaign.progress.inProgress}
            </p>
          </div>
          <div className="bg-mocha-surface0 rounded-lg p-6">
            <h3 className="text-sm font-medium text-mocha-subtext1">Pending</h3>
            <p className="text-3xl font-bold text-mocha-overlay0 mt-2">
              {campaign.progress.pending}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-mocha-surface0 rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-mocha-subtext1">Overall Progress</h3>
            <span className="text-2xl font-bold text-mocha-text">
              {campaign.progress.percentComplete}%
            </span>
          </div>
          <div className="w-full bg-mocha-base rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-orange to-brand-teal h-full transition-all duration-500 rounded-full"
              style={{ width: `${campaign.progress.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Synthesis Readiness */}
        {campaign.progress.completed > 0 && (
          <div className="bg-gradient-to-r from-brand-orange/10 to-brand-teal/10 border border-brand-orange/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-mocha-text mb-2">
                  {campaign.progress.completed === campaign.progress.total
                    ? 'Ready for Comprehensive Analysis'
                    : 'Partial Analysis Available'}
                </h3>
                <p className="text-sm text-mocha-subtext1 mb-3">
                  {campaign.progress.completed === campaign.progress.total
                    ? `All ${campaign.progress.total} stakeholder interviews are complete. Generate a comprehensive digital transformation readiness assessment with dimensional scoring, cross-stakeholder synthesis, and strategic recommendations.`
                    : `${campaign.progress.completed} of ${campaign.progress.total} interviews complete. You can generate a report now with available data, or wait for all stakeholders to complete their interviews for the most comprehensive analysis.`}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowReportPanel(true)}
                    className="bg-gradient-to-r from-brand-orange to-brand-teal hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Generate Client Report
                  </button>
                  <button
                    onClick={handleGeneratePDF}
                    disabled={generatingPDF}
                    className="bg-mocha-surface0 hover:bg-mocha-surface1 text-mocha-text border border-mocha-surface1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                    {generatingPDF ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-r-transparent"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        Download PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="bg-mocha-surface0 hover:bg-mocha-surface1 text-mocha-text border border-mocha-surface1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                    {generatingReport ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-r-transparent"></div>
                        Generating Markdown...
                      </>
                    ) : (
                      <>
                        Download Markdown
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stakeholder List */}
        <div className="bg-mocha-surface0 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-mocha-text mb-6">
            Stakeholder Sessions
          </h2>
          <div className="space-y-4">
            {campaign.stakeholders.map((stakeholder) => {
              const accessLink = `${window.location.origin}/session/${stakeholder.access_token}`

              return (
                <div
                  key={stakeholder.id}
                  className="bg-mocha-base border border-mocha-surface1 rounded-lg p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(stakeholder.status, stakeholder.started_at)}
                        <h3 className="text-lg font-semibold text-mocha-text">
                          {stakeholder.stakeholder_name}
                        </h3>
                        <span className="text-xs bg-brand-orange/20 text-brand-orange px-2 py-1 rounded">
                          {getRoleTypeLabel(stakeholder.stakeholder_role)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getStatusColor(
                            stakeholder.status
                          )}`}>
                          {getStatusLabel(stakeholder.status, stakeholder.started_at)}
                        </span>
                      </div>
                      <p className="text-sm text-mocha-subtext1 mt-1">
                        {stakeholder.stakeholder_title}
                      </p>
                      <p className="text-sm text-mocha-subtext0 mt-2">
                        {stakeholder.stakeholder_email}
                      </p>

                      {/* Timeline */}
                      <div className="flex gap-6 mt-3 text-xs text-mocha-subtext0">
                        {stakeholder.started_at && (
                          <span>
                            Started: {new Date(stakeholder.started_at).toLocaleString()}
                          </span>
                        )}
                        {stakeholder.completed_at && (
                          <span>
                            Completed: {new Date(stakeholder.completed_at).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Access Link */}
                      <div className="mt-4 bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-mocha-subtext1 mb-1">
                              Interview Access Link
                            </p>
                            <code className="text-xs text-mocha-text bg-mocha-base px-2 py-1 rounded break-all block">
                              {accessLink}
                            </code>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(accessLink)
                                alert('Access link copied to clipboard!')
                              }}
                              className="flex-shrink-0 bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                              Copy Link
                            </button>
                            {stakeholder.status !== 'completed' && (
                              <button
                                onClick={() => handleCompleteSession(stakeholder.id, stakeholder.stakeholder_name)}
                                disabled={completingSession === stakeholder.id}
                                className="flex-shrink-0 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                {completingSession === stakeholder.id ? 'Completing...' : 'Mark as Complete'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Campaign Info */}
        <div className="bg-mocha-surface0 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-mocha-text mb-4">
            Campaign Information
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-mocha-subtext1">Facilitator</dt>
              <dd className="text-mocha-text mt-1">
                {campaign.facilitator_name} ({campaign.facilitator_email})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-mocha-subtext1">Created</dt>
              <dd className="text-mocha-text mt-1">
                {new Date(campaign.created_at).toLocaleString()}
              </dd>
            </div>
            {campaign.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-mocha-subtext1">Description</dt>
                <dd className="text-mocha-text mt-1">{campaign.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-mocha-surface0 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-mocha-text mb-6">Edit Campaign</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-2 text-mocha-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-2 text-mocha-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-2 text-mocha-text">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditing(false)
                  setEditForm({
                    name: campaign.name,
                    description: campaign.description || '',
                    status: campaign.status
                  })
                }}
                className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Panel */}
      <ReportGenerationPanel
        campaignId={campaign.id}
        campaignName={campaign.name}
        isOpen={showReportPanel}
        onClose={() => setShowReportPanel(false)}
        onSuccess={() => {
          // Optionally refresh campaign data or show additional success feedback
          fetchCampaign()
        }}
      />
    </div>
  )
}
