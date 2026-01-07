'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, Mail, Pause, Share2, Plus, Pencil, Trash2, Key, ExternalLink, Users, FileText, AlertTriangle } from 'lucide-react'
import { ReportGenerationPanel } from '@/components/reports/ReportGenerationPanel'
import { Button } from '@/components/ui/button'
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
  // Education campaign fields
  school_id?: string
  campaign_type?: string
  education_config?: {
    modules: string[]
    pilot_type: string
  }
}

interface AccessCodeSummary {
  total: number
  active: number
  redeemed: number
  expired: number
  revoked: number
}

interface EducationReport {
  id: string
  access_token: string
  has_safeguarding_signals: boolean
  created_at: string
  synthesis: {
    module: string
    generated_at: string
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
  const [existingReport, setExistingReport] = useState<{ id: string; url: string; access_token: string } | null>(null)
  const [accessCodeSummary, setAccessCodeSummary] = useState<AccessCodeSummary | null>(null)
  const [educationReport, setEducationReport] = useState<EducationReport | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCampaign()
    checkForExistingReport()
    fetchAccessCodeSummary()
    fetchEducationReport()
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchCampaign, 10000)
    return () => clearInterval(interval)
  }, [params?.id])

  async function fetchCampaign() {
    try {
      setLoading(true)
      const response = await fetch(apiUrl(`api/campaigns/${params?.id}`))
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

  async function checkForExistingReport() {
    try {
      const response = await fetch(apiUrl(`api/campaigns/${params?.id}/report`))
      const data = await response.json()

      if (data.success && data.report) {
        setExistingReport(data.report)
      } else {
        setExistingReport(null)
      }
    } catch (err) {
      console.error('Error checking for existing report:', err)
      setExistingReport(null)
    }
  }

  async function fetchAccessCodeSummary() {
    try {
      const response = await fetch(apiUrl(`api/education/access-codes?campaign_id=${params?.id}`))
      const data = await response.json()

      if (data.summary) {
        setAccessCodeSummary({
          total: data.summary.total || 0,
          active: data.summary.by_status?.active || 0,
          redeemed: data.summary.by_status?.redeemed || 0,
          expired: data.summary.by_status?.expired || 0,
          revoked: data.summary.by_status?.revoked || 0
        })
      }
    } catch (err) {
      console.error('Error fetching access codes:', err)
    }
  }

  async function fetchEducationReport() {
    try {
      const response = await fetch(apiUrl(`api/education/reports?campaign_id=${params?.id}`))
      const data = await response.json()

      if (data.success && data.reports && data.reports.length > 0) {
        // Get the most recent report
        const report = data.reports[0]
        setEducationReport({
          id: report.id,
          access_token: report.access_token,
          has_safeguarding_signals: report.has_safeguarding_signals,
          created_at: report.created_at,
          synthesis: {
            module: report.module || 'student_wellbeing',
            generated_at: report.synthesis_generated_at || report.created_at
          }
        })
      } else {
        setEducationReport(null)
      }
    } catch (err) {
      console.error('Error fetching education report:', err)
      setEducationReport(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this campaign? This will permanently delete all stakeholder sessions and data.')) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(apiUrl(`api/campaigns/${params?.id}`), {
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
      const response = await fetch(apiUrl(`api/campaigns/${params?.id}`), {
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
        return 'bg-success/20 text-success'
      case 'in_progress':
        return 'bg-brand-teal/20 text-brand-teal'
      case 'paused':
        return 'bg-warning/20 text-warning'
      case 'invited':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  function getStatusIcon(status: string, startedAt: string | null) {
    // Completed
    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-success" />
    }

    // Paused (in progress but no recent activity - placeholder for future implementation)
    if (status === 'paused') {
      return <Pause className="w-5 h-5 text-warning" />
    }

    // In progress
    if (status === 'in_progress') {
      return <Clock className="w-5 h-5 text-brand-teal animate-pulse" />
    }

    // Accessed but not started (started_at exists but status is still invited)
    if (startedAt && status === 'invited') {
      return <Mail className="w-5 h-5 text-purple-500" />
    }

    // Not accessed yet (invited)
    return <Mail className="w-5 h-5 text-muted-foreground" />
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
      const response = await fetch(apiUrl(`api/campaigns/${params?.id}/sessions/${sessionId}/complete`), {
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

      const response = await fetch(apiUrl(`api/campaigns/${params?.id}/synthesize`), {
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

      const response = await fetch(apiUrl(`api/campaigns/${params?.id}/generate-pdf`), {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-lg p-8">
          <p className="text-destructive">{error}</p>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="mt-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {campaign.name}
                </h1>
                <p className="text-muted-foreground mt-2">
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
                    {existingReport ? (
                      <button
                        onClick={() => window.open(existingReport.url, '_blank')}
                        className="bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        View Report
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowReportPanel(true)}
                        className="bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Generate Client Report
                      </button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={handleGeneratePDF}
                      disabled={generatingPDF}>
                      {generatingPDF ? (
                        <>
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mr-2"></div>
                          Generating PDF...
                        </>
                      ) : (
                        'Download PDF'
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleGenerateReport}
                      disabled={generatingReport}>
                      {generatingReport ? (
                        <>
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        'Download Markdown'
                      )}
                    </Button>
                  </>
                )}
                <Button asChild>
                  <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stakeholders
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditing(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Progress Overview - Only for non-education campaigns */}
        {!campaign.school_id && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Total Stakeholders</h3>
              <p className="text-3xl font-bold text-foreground mt-2">
                {campaign.progress.total}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              <p className="text-3xl font-bold text-success mt-2">
                {campaign.progress.completed}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
              <p className="text-3xl font-bold text-brand-teal mt-2">
                {campaign.progress.inProgress}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <p className="text-3xl font-bold text-muted-foreground mt-2">
                {campaign.progress.pending}
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar - Only for non-education campaigns */}
        {!campaign.school_id && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Overall Progress</h3>
              <span className="text-2xl font-bold text-foreground">
                {campaign.progress.percentComplete}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${campaign.progress.percentComplete}%` }}
              />
            </div>
          </div>
        )}

        {/* Synthesis Readiness - Only for non-education campaigns */}
        {!campaign.school_id && campaign.progress.completed > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-brand-teal/10 border border-primary/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {campaign.progress.completed === campaign.progress.total
                    ? 'Ready for Comprehensive Analysis'
                    : 'Partial Analysis Available'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {campaign.progress.completed === campaign.progress.total
                    ? `All ${campaign.progress.total} stakeholder interviews are complete. Generate a comprehensive digital transformation readiness assessment with dimensional scoring, cross-stakeholder synthesis, and strategic recommendations.`
                    : `${campaign.progress.completed} of ${campaign.progress.total} interviews complete. You can generate a report now with available data, or wait for all stakeholders to complete their interviews for the most comprehensive analysis.`}
                </p>
                <div className="flex flex-wrap gap-3">
                  {existingReport ? (
                    <button
                      onClick={() => window.open(existingReport.url, '_blank')}
                      className="bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      View Report
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowReportPanel(true)}
                      className="bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Generate Client Report
                    </button>
                  )}
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleGeneratePDF}
                    disabled={generatingPDF}>
                    {generatingPDF ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mr-2"></div>
                        Generating PDF...
                      </>
                    ) : (
                      'Download PDF'
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleGenerateReport}
                    disabled={generatingReport}>
                    {generatingReport ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mr-2"></div>
                        Generating Markdown...
                      </>
                    ) : (
                      'Download Markdown'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education Access Codes Section */}
        {accessCodeSummary && accessCodeSummary.total > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-brand-teal" />
                Education Access Codes
              </h2>
              <Link
                href={`/dashboard/education/access-codes?campaign_id=${campaign.id}`}
                className="flex items-center gap-2 text-sm text-brand-teal hover:text-brand-teal/80 transition-colors">
                View All Codes
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Access Code Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{accessCodeSummary.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Codes</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-success">{accessCodeSummary.active}</p>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-brand-teal">{accessCodeSummary.redeemed}</p>
                <p className="text-xs text-muted-foreground mt-1">Redeemed</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-muted-foreground">{accessCodeSummary.expired}</p>
                <p className="text-xs text-muted-foreground mt-1">Expired</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{accessCodeSummary.revoked}</p>
                <p className="text-xs text-muted-foreground mt-1">Revoked</p>
              </div>
            </div>

            {/* Progress for Education Campaign */}
            {accessCodeSummary.total > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participation Rate
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {Math.round((accessCodeSummary.redeemed / accessCodeSummary.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-teal h-full transition-all duration-500 rounded-full"
                    style={{ width: `${(accessCodeSummary.redeemed / accessCodeSummary.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {accessCodeSummary.redeemed} of {accessCodeSummary.total} codes have been used by participants
                </p>
              </div>
            )}
          </div>
        )}

        {/* Education Report Section - Only for education campaigns */}
        {campaign.school_id && educationReport && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-teal" />
                Education Report
              </h2>
            </div>

            <div className="bg-background border border-border rounded-lg p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {educationReport.synthesis.module
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase())} Report
                    </h3>
                    {educationReport.has_safeguarding_signals && (
                      <span className="flex items-center gap-1 text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Safeguarding Alert
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generated: {new Date(educationReport.synthesis.generated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Link
                  href={`/education/report/${educationReport.access_token}`}
                  target="_blank"
                  className="flex items-center gap-2 bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View Report
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* No Report Yet Message - Only for education campaigns without a report */}
        {campaign.school_id && !educationReport && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <FileText className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No Report Generated Yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Once enough participants complete the assessment, a synthesis report will be generated and available here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stakeholder List - Only for non-education campaigns */}
        {!campaign.school_id && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Stakeholder Sessions
            </h2>
            <div className="space-y-4">
              {campaign.stakeholders.map((stakeholder) => {
                const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
                const accessLink = `${window.location.origin}${basePath}/session/${stakeholder.access_token}`

                return (
                  <div
                    key={stakeholder.id}
                    className="bg-background border border-border rounded-lg p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(stakeholder.status, stakeholder.started_at)}
                          <h3 className="text-lg font-semibold text-foreground">
                            {stakeholder.stakeholder_name}
                          </h3>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            {getRoleTypeLabel(stakeholder.stakeholder_role)}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getStatusColor(
                              stakeholder.status
                            )}`}>
                            {getStatusLabel(stakeholder.status, stakeholder.started_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stakeholder.stakeholder_title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {stakeholder.stakeholder_email}
                        </p>

                        {/* Timeline */}
                        <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
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
                        <div className="mt-4 bg-muted border border-border rounded-lg p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Interview Access Link
                              </p>
                              <code className="text-xs text-foreground bg-background px-2 py-1 rounded break-all block">
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
                                  className="flex-shrink-0 bg-success/20 hover:bg-success/30 text-success px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
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
        )}

        {/* Campaign Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Campaign Information
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Facilitator</dt>
              <dd className="text-foreground mt-1">
                {campaign.facilitator_name} ({campaign.facilitator_email})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="text-foreground mt-1">
                {new Date(campaign.created_at).toLocaleString()}
              </dd>
            </div>
            {campaign.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="text-foreground mt-1">{campaign.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">Edit Campaign</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false)
                  setEditForm({
                    name: campaign.name,
                    description: campaign.description || '',
                    status: campaign.status
                  })
                }}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
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
          // Refresh campaign data and check for existing report
          fetchCampaign()
          checkForExistingReport()
        }}
      />
    </div>
  )
}
