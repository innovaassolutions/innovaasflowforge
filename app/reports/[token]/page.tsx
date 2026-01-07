/**
 * Professional Consulting Report Viewer
 *
 * Visual-first, print-ready client assessment reports.
 * Follows McKinsey/BCG/PWC design standards with light backgrounds,
 * minimal text, and dominant data visualizations.
 *
 * Story: 1.3 - Report Landing Page & Visualizations
 * Epic: 1 - Client Assessment Report Generation System
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertCircle, Download, FileText } from 'lucide-react'
import { generateReportFilename, downloadReport } from '@/lib/download-utils'
import type { ReadinessAssessment } from '@/lib/agents/synthesis-agent'
import { transformToMatrixData, transformToHeatMapData, transformToRoadmapData } from '@/lib/consulting-data-transformers'
import { apiUrl } from '@/lib/api-url'

// Dynamically load heavy chart components with NO SSR
const ExecutiveOnePager = dynamic(() =>
  import('@/components/reports/sections').then(mod => mod.ExecutiveOnePager),
  { ssr: false }
)
const ExecutiveSummary = dynamic(() =>
  import('@/components/reports/sections').then(mod => mod.ExecutiveSummary),
  { ssr: false }
)
const DimensionalAnalysis = dynamic(() =>
  import('@/components/reports/sections').then(mod => mod.DimensionalAnalysis),
  { ssr: false }
)
const EnhancedRecommendations = dynamic(() =>
  import('@/components/reports/sections').then(mod => mod.EnhancedRecommendations),
  { ssr: false }
)
const Recommendations = dynamic(() =>
  import('@/components/reports/sections').then(mod => mod.Recommendations),
  { ssr: false }
)

// Dynamically load strategic framework components with NO SSR
const PriorityMatrix = dynamic(() =>
  import('@/components/reports/frameworks').then(mod => mod.PriorityMatrix),
  { ssr: false }
)
const CapabilityHeatMap = dynamic(() =>
  import('@/components/reports/frameworks').then(mod => mod.CapabilityHeatMap),
  { ssr: false }
)
const TransformationRoadmap = dynamic(() =>
  import('@/components/reports/frameworks').then(mod => mod.TransformationRoadmap),
  { ssr: false }
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
  const token = params?.token as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<'pdf' | 'md' | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchReport()
  }, [token])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiUrl(`api/reports/${token}`))
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

      const downloadUrl = apiUrl(`api/reports/${token}/download?format=${format}`)
      await downloadReport(downloadUrl, filename)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  // Transform data for strategic frameworks (memoized for performance)
  // These must be called before any conditional returns (Rules of Hooks)
  const synthesis = report?.synthesis
  const matrixData = useMemo(() => synthesis ? transformToMatrixData(synthesis) : [], [synthesis])
  const heatMapData = useMemo(() => synthesis ? transformToHeatMapData(synthesis) : [], [synthesis])
  const roadmapData = useMemo(() => synthesis ? transformToRoadmapData(synthesis) : [], [synthesis])

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-orange border-r-transparent mb-4"></div>
          <p className="text-gray-900">Loading assessment report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'This report may have been deactivated or the access link is invalid.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact the assessment facilitator for a new access link.
          </p>
        </div>
      </div>
    )
  }

  const { campaign, tier, consultant_observations } = report

  // Determine if we should show consulting-grade components (premium tier)
  const showConsultingGrade = tier === 'premium'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Digital Transformation Readiness Assessment
              </h1>
              <p className="text-xl text-muted-foreground">{campaign.company_name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {campaign.company_industry} • {campaign.name}
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-3">
              {/* PDF download temporarily disabled */}
              <button
                disabled={true}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg transition-colors text-sm font-medium cursor-not-allowed opacity-60"
                aria-label="PDF download temporarily unavailable"
                title="PDF download is temporarily unavailable. Please use Markdown format.">
                <Download size={16} />
                <span>PDF (Unavailable)</span>
              </button>
              <button
                onClick={() => handleDownload('md')}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted disabled:bg-card disabled:text-muted-foreground text-foreground border border-border hover:border-border/80 rounded-lg transition-colors text-sm font-medium"
                aria-label="Download Markdown report">
                {downloading === 'md' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-r-transparent"></div>
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
      <div className="space-y-0">
        {/* Executive One-Pager (Premium only) or Executive Summary */}
        {showConsultingGrade && synthesis ? (
          <ExecutiveOnePager assessment={synthesis} />
        ) : synthesis ? (
          <ExecutiveSummary assessment={synthesis} />
        ) : null}

        {/* Dimensional Analysis Section (All tiers) */}
        {synthesis && (
          <DimensionalAnalysis assessment={synthesis} />
        )}

        {/* Strategic Frameworks (Premium only) */}
        {showConsultingGrade && (
          <>
            {/* Priority Matrix */}
            <PriorityMatrix data={matrixData} />

            {/* Capability Heat Map */}
            <CapabilityHeatMap data={heatMapData} />

            {/* Transformation Roadmap */}
            <TransformationRoadmap data={roadmapData} />
          </>
        )}

        {/* Recommendations Section */}
        {synthesis && synthesis.recommendations.length > 0 && (
          <>
            {showConsultingGrade ? (
              <EnhancedRecommendations assessment={synthesis} />
            ) : tier === 'informative' ? (
              <Recommendations assessment={synthesis} />
            ) : null}
          </>
        )}

        {/* Consultant Observations */}
        {consultant_observations && (
          <section className="bg-background border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Consultant Observations</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {consultant_observations}
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
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
          <p className="text-xs text-muted-foreground mt-2">
            Report Tier: {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </p>
        </div>
      </div>
    </div>
  )
}
