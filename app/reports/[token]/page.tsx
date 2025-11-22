'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

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
  synthesis: {
    overallScore: number
    pillars: Array<{
      pillar: string
      score: number
      dimensions: Array<{
        dimension: string
        score: number
        confidence: string
        keyFindings: string[]
        supportingQuotes: string[]
        gapToNext: string
        priority: string
      }>
    }>
    executiveSummary: string
    keyThemes: string[]
    contradictions: string[]
    recommendations: string[]
    stakeholderPerspectives: Array<{
      name: string
      role: string
      title: string
      keyConcerns: string[]
      notableQuotes: string[]
    }>
  }
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

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-400'
    if (score >= 3) return 'text-yellow-400'
    if (score >= 2) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 4) return 'bg-green-500/10 border-green-500/30'
    if (score >= 3) return 'bg-yellow-500/10 border-yellow-500/30'
    if (score >= 2) return 'bg-orange-500/10 border-orange-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'important': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'foundational': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'opportunistic': return 'text-brand-teal bg-brand-teal/10 border-brand-teal/30'
      default: return 'text-mocha-subtext0 bg-mocha-surface0 border-mocha-surface1'
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
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-mocha-text mb-2">
                Digital Transformation Readiness Assessment
              </h1>
              <p className="text-xl text-mocha-subtext0">
                {campaign.company_name}
              </p>
              <p className="text-sm text-mocha-subtext1 mt-1">
                {campaign.company_industry} • {campaign.name}
              </p>
            </div>
            <div className={`text-center px-6 py-3 rounded-lg border ${getScoreBgColor(synthesis.overallScore)}`}>
              <div className={`text-3xl font-bold ${getScoreColor(synthesis.overallScore)}`}>
                {synthesis.overallScore.toFixed(1)}
              </div>
              <div className="text-xs text-mocha-subtext0 mt-1">Overall Score</div>
            </div>
          </div>

          <div className="bg-mocha-surface0/50 border border-mocha-surface1 rounded-lg p-4">
            <p className="text-mocha-text leading-relaxed">
              {synthesis.executiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Pillars */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-mocha-text mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-orange" />
            Readiness Pillars
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {synthesis.pillars.map((pillar) => (
              <div
                key={pillar.pillar}
                className={`bg-mocha-surface0 border rounded-lg p-6 ${getScoreBgColor(pillar.score)}`}>
                <h3 className="text-lg font-semibold text-mocha-text mb-2">{pillar.pillar}</h3>
                <div className={`text-3xl font-bold ${getScoreColor(pillar.score)} mb-2`}>
                  {pillar.score.toFixed(1)}
                </div>
                <div className="text-sm text-mocha-subtext0">
                  {pillar.dimensions.length} dimensions assessed
                </div>
              </div>
            ))}
          </div>

          {/* Dimensions per Pillar */}
          {synthesis.pillars.map((pillar) => (
            <div key={pillar.pillar} className="mb-8">
              <h3 className="text-xl font-bold text-mocha-text mb-4 border-b border-mocha-surface1 pb-2">
                {pillar.pillar} Dimensions
              </h3>

              <div className="space-y-4">
                {pillar.dimensions.map((dim) => (
                  <div
                    key={dim.dimension}
                    className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-mocha-text mb-1">
                          {dim.dimension}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${getScoreColor(dim.score)}`}>
                            {dim.score.toFixed(1)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(dim.priority)}`}>
                            {dim.priority}
                          </span>
                          <span className="text-xs text-mocha-subtext1 px-2 py-1 bg-mocha-surface1 rounded">
                            {dim.confidence} confidence
                          </span>
                        </div>
                      </div>
                    </div>

                    {tier !== 'basic' && (
                      <>
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-mocha-subtext0 mb-2">
                            Key Findings
                          </h5>
                          <ul className="space-y-1">
                            {dim.keyFindings.map((finding, idx) => (
                              <li key={idx} className="text-sm text-mocha-text flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {tier === 'informative' || tier === 'premium' ? (
                          <>
                            {dim.supportingQuotes.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-semibold text-mocha-subtext0 mb-2">
                                  Stakeholder Insights
                                </h5>
                                <div className="space-y-2">
                                  {dim.supportingQuotes.slice(0, 2).map((quote, idx) => (
                                    <blockquote
                                      key={idx}
                                      className="text-sm text-mocha-subtext1 italic border-l-2 border-brand-orange pl-3 py-1">
                                      "{quote}"
                                    </blockquote>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : null}

                        <div className="bg-mocha-surface1/50 rounded p-3">
                          <h5 className="text-sm font-semibold text-brand-orange mb-1">
                            Path to Next Level
                          </h5>
                          <p className="text-sm text-mocha-text">{dim.gapToNext}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Key Themes */}
        {tier !== 'basic' && synthesis.keyThemes.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-mocha-text mb-6">Key Themes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {synthesis.keyThemes.map((theme, idx) => (
                <div
                  key={idx}
                  className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-4">
                  <p className="text-mocha-text">{theme}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {(tier === 'informative' || tier === 'premium') && synthesis.recommendations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-mocha-text mb-6">Strategic Recommendations</h2>
            <div className="space-y-4">
              {synthesis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-brand-orange/10 to-brand-teal/10 border border-brand-orange/30 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-orange text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-mocha-text flex-1">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Consultant Observations */}
        {consultant_observations && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-mocha-text mb-6">Consultant Observations</h2>
            <div className="bg-mocha-surface0 border border-mocha-surface1 rounded-lg p-6">
              <p className="text-mocha-text whitespace-pre-wrap">{consultant_observations}</p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-mocha-surface1 text-center">
          <p className="text-sm text-mocha-subtext1">
            Generated on {new Date(report.generated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {report.regeneration_count > 0 && (
              <span className="ml-2">
                (Updated {report.regeneration_count} time{report.regeneration_count > 1 ? 's' : ''})
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
