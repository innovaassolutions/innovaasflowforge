'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, Download, FileText } from 'lucide-react'
import { generateReportFilename, downloadReport } from '@/lib/download-utils'
import type { ReadinessAssessment } from '@/lib/agents/synthesis-agent'

// Lazy load heavy chart components
const ExecutiveSummary = lazy(() =>
  import('@/components/reports/sections').then(mod => ({ default: mod.ExecutiveSummary }))
)
const DimensionalAnalysis = lazy(() =>
  import('@/components/reports/sections').then(mod => ({ default: mod.DimensionalAnalysis }))
)
const Recommendations = lazy(() =>
  import('@/components/reports/sections').then(mod => ({ default: mod.Recommendations }))
)

interface ReportData {
  id: string
  campaign: {
    id: string
    name: string
    description: string
    company_name: string
    company_industry: string
  }
  tier: 'basic' | 'informative' | 'premium'
  synthesis: ReadinessAssessment
  consultant_observations: string | null
  supporting_documents: any[]
  generated_at: string
  regenerated_at: string | null
  regeneration_count: number
}

export default function ReportViewerPage() {
  const params = useParams()
  const token = params.token as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<'pdf' | 'md' | null>(null)

  useEffect(() => {
    fetchReport()
  }, [token])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/reports/${token}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load report')
      }

      setReport(data.report)
    } catch (err) {
      console.error('Report fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: 'pdf' | 'md') => {
    if (!report) return

    try {
      setDownloading(format)

      const filename = generateReportFilename(
        report.campaign.company_name,
        report.campaign.name,
        token,
        format
      )

      const downloadUrl = `/api/reports/${token}/download?format=${format}`
      await downloadReport(downloadUrl, filename)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mocha-base flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-orange border-r-transparent mb-4"></div>
          <p className="text-mocha-text">Loading assessment report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-mocha-base flex items-center justify-center p-6">
        <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-mocha-text mb-2">Report Not Found</h1>
          <p className="text-mocha-subtext0 mb-4">
            {error || 'This report may have been deactivated or the access link is invalid.'}
          </p>
          <p className="text-sm text-mocha-subtext1">
            Please contact the assessment facilitator for a new access link.
          </p>
        </div>
      </div>
    )
  }

  const { synthesis, campaign, tier, consultant_observations } = report

  return (
    <div className="min-h-screen bg-mocha-base">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-orange/20 to-brand-teal/20 border-b border-mocha-surface1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-mocha-text mb-2">
                Digital Transformation Readiness Assessment
              </h1>
              <p className="text-xl text-mocha-subtext0">{campaign.company_name}</p>
              <p className="text-sm text-mocha-subtext1 mt-1">
                {campaign.company_industry} • {campaign.name}
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 disabled:bg-mocha-surface1 disabled:text-mocha-subtext1 text-white rounded-lg transition-colors text-sm font-medium"
                aria-label="Download PDF report">
                {downloading === 'pdf' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDownload('md')}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-4 py-2 bg-mocha-surface0 hover:bg-mocha-surface1 disabled:bg-mocha-surface0 disabled:text-mocha-subtext1 text-mocha-text border border-mocha-surface1 hover:border-mocha-surface2 rounded-lg transition-colors text-sm font-medium"
                aria-label="Download Markdown report">
                {downloading === 'md' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-mocha-text border-r-transparent"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>Markdown</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Executive Summary Section */}
        <Suspense
          fallback={
            <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-8 animate-pulse">
              <div className="h-8 bg-mocha-surface1 rounded w-1/3 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-mocha-surface1 rounded"></div>
                <div className="h-4 bg-mocha-surface1 rounded"></div>
                <div className="h-4 bg-mocha-surface1 rounded w-2/3"></div>
              </div>
            </div>
          }>
          <ExecutiveSummary assessment={synthesis} />
        </Suspense>

        {/* Dimensional Analysis Section */}
        <Suspense
          fallback={
            <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-8 animate-pulse">
              <div className="h-8 bg-mocha-surface1 rounded w-1/2 mb-6"></div>
              <div className="h-64 bg-mocha-surface1 rounded"></div>
            </div>
          }>
          <DimensionalAnalysis assessment={synthesis} />
        </Suspense>

        {/* Recommendations Section */}
        {(tier === 'informative' || tier === 'premium') &&
          synthesis.recommendations.length > 0 && (
            <Suspense
              fallback={
                <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-8 animate-pulse">
                  <div className="h-8 bg-mocha-surface1 rounded w-1/3 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-20 bg-mocha-surface1 rounded"></div>
                    <div className="h-20 bg-mocha-surface1 rounded"></div>
                    <div className="h-20 bg-mocha-surface1 rounded"></div>
                  </div>
                </div>
              }>
              <Recommendations assessment={synthesis} />
            </Suspense>
          )}

        {/* Consultant Observations */}
        {consultant_observations && (
          <section className="bg-mocha-base border border-mocha-surface0 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-mocha-text mb-6">Consultant Observations</h2>
            <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-6">
              <p className="text-mocha-text whitespace-pre-wrap leading-relaxed">
                {consultant_observations}
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-mocha-surface1 text-center">
          <p className="text-sm text-mocha-subtext1">
            Generated on{' '}
            {new Date(report.generated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {report.regeneration_count > 0 && (
              <span className="ml-2">
                (Updated {report.regeneration_count} time
                {report.regeneration_count > 1 ? 's' : ''})
              </span>
            )}
          </p>
          <p className="text-xs text-mocha-subtext1 mt-2">
            Report Tier: {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </p>
        </div>
      </div>
    </div>
  )
}
