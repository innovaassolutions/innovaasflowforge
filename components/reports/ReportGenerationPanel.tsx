/**
 * Report Generation Panel Component
 *
 * Campaign dashboard UI for generating shareable client reports.
 * Includes tier selection, consultant observations, and shareable URL display.
 *
 * Story: 1.2 - Report Generation UI
 * Epic: 1 - Client Assessment Report Generation System
 */

'use client'

import { useState } from 'react'
import { X, Copy, Check, Loader2, Eye, EyeOff } from 'lucide-react'
import type { ReportTier } from '@/lib/types'
import { apiUrl } from '@/lib/api-url'

interface ReportGenerationPanelProps {
  campaignId: string
  campaignName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface GeneratedReport {
  id: string
  campaign_id: string
  campaign_name: string
  access_token: string
  url: string
  is_regeneration: boolean
  regeneration_count: number
  is_active?: boolean
}

export function ReportGenerationPanel({
  campaignId,
  campaignName,
  isOpen,
  onClose,
  onSuccess,
}: ReportGenerationPanelProps) {
  const [selectedTier, setSelectedTier] = useState<ReportTier>('basic')
  const [observations, setObservations] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isTogglingAccess, setIsTogglingAccess] = useState(false)
  const [reportActive, setReportActive] = useState(true)

  if (!isOpen) return null

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(apiUrl(`api/campaigns/${campaignId}/generate-report`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultant_observations: observations.trim() || undefined,
          report_tier_override: selectedTier,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedReport(data.report)
        setReportActive(data.report.is_active !== false) // Default to true if not specified
        onSuccess?.()
      } else {
        setError(data.error || 'Failed to generate report')
      }
    } catch (err) {
      console.error('Report generation error:', err)
      setError('Network error - please try again')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!generatedReport?.url) return

    try {
      await navigator.clipboard.writeText(generatedReport.url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleToggleAccess = async () => {
    if (!generatedReport) return

    setIsTogglingAccess(true)
    setError(null)

    try {
      const newActiveState = !reportActive

      const response = await fetch(
        apiUrl(`api/campaigns/${campaignId}/report/toggle-access`),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: newActiveState }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setReportActive(newActiveState)
      } else {
        setError(data.error || 'Failed to toggle report access')
      }
    } catch (err) {
      console.error('Toggle access error:', err)
      setError('Network error - please try again')
    } finally {
      setIsTogglingAccess(false)
    }
  }

  const handleClose = () => {
    setSelectedTier('basic')
    setObservations('')
    setGeneratedReport(null)
    setError(null)
    setCopiedUrl(false)
    setReportActive(true)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-mocha-surface0 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-mocha-text">
              Generate Client Report
            </h2>
            <p className="text-sm text-mocha-subtext1 mt-1">
              {campaignName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-mocha-subtext0 hover:text-mocha-text transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State */}
        {generatedReport && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  {generatedReport.is_regeneration
                    ? 'Report Regenerated Successfully!'
                    : 'Report Generated Successfully!'}
                </h3>
                <p className="text-sm text-mocha-subtext1 mb-4">
                  {generatedReport.is_regeneration
                    ? `This is regeneration #${generatedReport.regeneration_count}. The shareable URL remains the same.`
                    : 'Share this URL with your client to provide access to their assessment report.'}
                </p>

                {/* Shareable URL */}
                <div className="bg-mocha-base border border-mocha-surface1 rounded-lg p-4">
                  <label className="block text-xs font-medium text-mocha-subtext1 mb-2">
                    Shareable Report URL
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-mocha-text bg-mocha-surface0 px-3 py-2 rounded break-all">
                      {generatedReport.url}
                    </code>
                    <button
                      onClick={handleCopyUrl}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        copiedUrl
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal'
                      }`}>
                      {copiedUrl ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Report Access Toggle */}
                <div className="mt-4 bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {reportActive ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-mocha-subtext0" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-mocha-text">
                          Report Access
                        </div>
                        <div className="text-xs text-mocha-subtext1">
                          {reportActive
                            ? 'Public access enabled - clients can view this report'
                            : 'Access disabled - report is not accessible'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleAccess}
                      disabled={isTogglingAccess}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                        reportActive
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 disabled:opacity-50'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 disabled:opacity-50'
                      }`}>
                      {isTogglingAccess ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {reportActive ? 'Disabling...' : 'Enabling...'}
                        </>
                      ) : (
                        <>{reportActive ? 'Disable Access' : 'Enable Access'}</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Report Details */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-mocha-subtext1">Report Tier:</span>
                    <span className="ml-2 text-mocha-text font-medium capitalize">
                      {selectedTier}
                    </span>
                  </div>
                  <div>
                    <span className="text-mocha-subtext1">Report ID:</span>
                    <span className="ml-2 text-mocha-text font-mono text-xs">
                      {generatedReport.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Generation Form (hidden after success) */}
        {!generatedReport && (
          <>
            {/* Tier Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-mocha-subtext1 mb-3">
                Report Tier
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-mocha-base border border-mocha-surface1 rounded-lg cursor-pointer hover:border-brand-orange/50 transition-colors">
                  <input
                    type="radio"
                    name="tier"
                    value="basic"
                    checked={selectedTier === 'basic'}
                    onChange={(e) => setSelectedTier(e.target.value as ReportTier)}
                    className="mt-1 accent-brand-orange"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-mocha-text">Basic</div>
                    <div className="text-sm text-mocha-subtext1 mt-1">
                      Scores and high-level summary only. Ideal for quick assessments.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-mocha-base border border-mocha-surface1 rounded-lg cursor-pointer hover:border-brand-orange/50 transition-colors">
                  <input
                    type="radio"
                    name="tier"
                    value="informative"
                    checked={selectedTier === 'informative'}
                    onChange={(e) => setSelectedTier(e.target.value as ReportTier)}
                    className="mt-1 accent-brand-orange"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-mocha-text">Informative</div>
                    <div className="text-sm text-mocha-subtext1 mt-1">
                      Scores + themes + stakeholder quotes. Provides context and insights.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-mocha-base border border-mocha-surface1 rounded-lg cursor-pointer hover:border-brand-orange/50 transition-colors">
                  <input
                    type="radio"
                    name="tier"
                    value="premium"
                    checked={selectedTier === 'premium'}
                    onChange={(e) => setSelectedTier(e.target.value as ReportTier)}
                    className="mt-1 accent-brand-orange"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-mocha-text">Premium</div>
                    <div className="text-sm text-mocha-subtext1 mt-1">
                      Full analysis + architecture recommendations. Complete strategic assessment.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Consultant Observations */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-mocha-subtext1 mb-2">
                Consultant Observations
                <span className="text-mocha-subtext0 font-normal ml-2">(Optional)</span>
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Add any additional context, observations, or recommendations for the client..."
                rows={4}
                className="w-full bg-mocha-base border border-mocha-surface1 rounded-lg px-4 py-3 text-mocha-text placeholder:text-mocha-subtext0 focus:border-brand-orange/50 focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-mocha-subtext0 mt-2">
                These notes will be included in the report and visible to the client.
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-mocha-surface1 hover:bg-mocha-surface2 text-mocha-text rounded-lg font-medium transition-colors">
            {generatedReport ? 'Close' : 'Cancel'}
          </button>
          {!generatedReport && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2 bg-gradient-to-r from-brand-orange to-brand-teal hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
