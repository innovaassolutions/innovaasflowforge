'use client'

/**
 * Coaching Archetype Report Viewer
 *
 * Browser-viewable leadership archetype discovery report.
 * Displays client's archetype pattern, scores, and stories.
 *
 * Access via: /reports/coaching/[access_token]
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import { apiUrl } from '@/lib/api-url'

// Types
interface ArchetypeDefinition {
  name: string
  key: string
  core_traits: string[]
  under_pressure: string
  when_grounded: string
  overuse_signals: string[]
}

interface ReportData {
  clientName: string
  coachName: string
  brandName: string
  generatedDate: string
  completedDate: string | null
  context: {
    role: string
    ambiguity_level: string
    current_feeling: string
  }
  scores: {
    default: Record<string, number>
    authentic: Record<string, number>
    friction: Record<string, number>
  }
  default_archetype: string
  authentic_archetype: string
  is_aligned: boolean
  stories_captured: Array<{
    quote: string
    theme: string
    archetype: string
  }>
  archetypes: Record<string, ArchetypeDefinition>
}

// Color palette for archetypes
const ARCHETYPE_COLORS: Record<string, string> = {
  anchor: '#3498DB',
  catalyst: '#E74C3C',
  steward: '#27AE60',
  wayfinder: '#9B59B6',
  architect: '#F39C12'
}

// Score Bar Component
function ScoreBar({ archetype, score, maxScore, archetypes }: {
  archetype: string
  score: number
  maxScore: number
  archetypes: Record<string, ArchetypeDefinition>
}) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
  const color = ARCHETYPE_COLORS[archetype]

  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="w-24 text-sm text-[var(--text-muted)]">
        {archetypes[archetype]?.name || archetype}
      </span>
      <div className="flex-1 h-3 bg-[var(--bg-muted)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right text-sm text-[var(--text-muted)]">{score}</span>
    </div>
  )
}

// Archetype Card Component
function ArchetypeCard({ archetype, mode, definition }: {
  archetype: string
  mode: 'default' | 'authentic'
  definition: ArchetypeDefinition
}) {
  const color = ARCHETYPE_COLORS[archetype]
  const modeLabel = mode === 'default' ? 'Under Pressure' : 'At Your Best'
  const modeDescription = mode === 'default' ? definition.under_pressure : definition.when_grounded

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: `${color}10`, borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: color }}
        >
          {definition.name[0]}
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
            {modeLabel}
          </p>
          <h3 className="text-xl font-semibold text-[var(--text)]">
            {definition.name}
          </h3>
        </div>
      </div>
      <p className="text-[var(--text)] mb-3">
        {modeDescription}
      </p>
      <p className="text-sm text-[var(--text-muted)]">
        <span className="font-medium">Core traits:</span> {definition.core_traits.join(', ')}
      </p>
    </div>
  )
}

// Story Quote Component
function StoryQuote({ story, archetypes }: {
  story: { quote: string; theme: string; archetype: string }
  archetypes: Record<string, ArchetypeDefinition>
}) {
  const color = ARCHETYPE_COLORS[story.archetype]
  const archetypeName = archetypes[story.archetype]?.name || story.archetype

  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{ backgroundColor: 'var(--bg-subtle)', borderLeft: `4px solid ${color}` }}
    >
      <p className="text-[var(--text)] italic mb-2">"{story.quote}"</p>
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
        {story.theme} ({archetypeName})
      </p>
    </div>
  )
}

export default function CoachingReportPage() {
  const params = useParams()
  const token = params.token as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [token])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiUrl(`api/coaching/report/${token}`))
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load report')
        return
      }

      setReport(data.data)
    } catch (err) {
      console.error('Error fetching report:', err)
      setError('Failed to load report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!report) return

    setDownloading(true)
    try {
      const response = await fetch(apiUrl(`api/coaching/report/${token}/pdf`), {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.clientName.replace(/\s+/g, '_')}_Leadership_Report.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading PDF:', err)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading your report...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !report) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-subtle)] rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-[var(--text)] mb-2">
            Unable to Load Report
          </h1>
          <p className="text-[var(--text-muted)]">
            {error || 'Report not found'}
          </p>
        </div>
      </div>
    )
  }

  const defaultDef = report.archetypes[report.default_archetype]
  const authenticDef = report.archetypes[report.authentic_archetype]
  const defaultMax = Math.max(...Object.values(report.scores.default), 1)
  const authenticMax = Math.max(...Object.values(report.scores.authentic), 1)
  const archetypeKeys = ['anchor', 'catalyst', 'steward', 'wayfinder', 'architect']

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="bg-[#1A3A4A] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <p className="text-sm text-[#7BA7BC] uppercase tracking-wider mb-2">
            {report.brandName}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Leadership Archetype Discovery
          </h1>
          <p className="text-[#7BA7BC] text-lg">
            Understanding Your Leadership Patterns
          </p>

          <div className="mt-8 bg-white/10 rounded-lg p-4 inline-block">
            <p className="text-xs text-[#95A5A6] uppercase tracking-wider mb-1">
              Prepared for
            </p>
            <p className="text-xl font-semibold">{report.clientName}</p>
            <p className="text-sm text-[#7BA7BC]">{report.context.role}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg text-[var(--text)] leading-relaxed">
            This report reveals patterns in how you lead - especially the difference between
            how you respond under pressure versus what feels most sustainable and energizing.
            These patterns are not fixed traits; they are adaptive responses that have served you well.
          </p>
        </section>

        {/* Your Pattern */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 pb-2 border-b-2 border-[var(--accent)]">
            Your Leadership Pattern
          </h2>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ArchetypeCard
              archetype={report.default_archetype}
              mode="default"
              definition={defaultDef}
            />
            <ArchetypeCard
              archetype={report.authentic_archetype}
              mode="authentic"
              definition={authenticDef}
            />
          </div>

          {/* Alignment Insight */}
          <div
            className={`rounded-xl p-6 ${
              report.is_aligned
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-orange-50 border-l-4 border-orange-500'
            }`}
          >
            <h3 className={`font-semibold mb-2 ${
              report.is_aligned ? 'text-green-700' : 'text-orange-700'
            }`}>
              {report.is_aligned ? 'Aligned Pattern' : 'Misaligned Pattern'}
            </h3>
            <p className={report.is_aligned ? 'text-green-800' : 'text-orange-800'}>
              {report.is_aligned
                ? 'Your default response under pressure aligns with what feels most sustainable. This suggests you have developed coping mechanisms that serve both the immediate need and your long-term wellbeing.'
                : `There is a gap between how you respond under pressure (${defaultDef.name}) and what feels most sustainable (${authenticDef.name}). This is common - we often develop coping patterns that work in the moment but cost us energy over time.`
              }
            </p>
          </div>
        </section>

        {/* Detailed Scores */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 pb-2 border-b-2 border-[var(--accent)]">
            Detailed Scores
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Default Mode Under Pressure
              </h3>
              <div className="bg-[var(--bg-subtle)] rounded-lg p-4">
                {archetypeKeys.map(arch => (
                  <ScoreBar
                    key={`default-${arch}`}
                    archetype={arch}
                    score={report.scores.default[arch]}
                    maxScore={defaultMax}
                    archetypes={report.archetypes}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Authentic Mode When Grounded
              </h3>
              <div className="bg-[var(--bg-subtle)] rounded-lg p-4">
                {archetypeKeys.map(arch => (
                  <ScoreBar
                    key={`authentic-${arch}`}
                    archetype={arch}
                    score={report.scores.authentic[arch]}
                    maxScore={authenticMax}
                    archetypes={report.archetypes}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Your Stories */}
        {report.stories_captured && report.stories_captured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6 pb-2 border-b-2 border-[var(--accent)]">
              Your Stories
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              Throughout our conversation, you shared moments that reveal how your leadership
              patterns show up in practice.
            </p>
            {report.stories_captured.map((story, index) => (
              <StoryQuote
                key={index}
                story={story}
                archetypes={report.archetypes}
              />
            ))}
          </section>
        )}

        {/* Moving Forward */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 pb-2 border-b-2 border-[var(--accent)]">
            Moving Forward
          </h2>

          <div className="space-y-6">
            {/* Watch For */}
            <div className="bg-[var(--bg-subtle)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-[var(--accent)]" />
                Watch For: {defaultDef.name} Overuse
              </h3>
              <p className="text-[var(--text-muted)] mb-3">
                When under pressure, you may over-rely on {defaultDef.name} energy. Signs to watch for:
              </p>
              <ul className="space-y-2">
                {defaultDef.overuse_signals.map((signal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[var(--text)]">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lean Into */}
            <div className="bg-[var(--bg-subtle)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-[var(--accent)]" />
                Lean Into: {authenticDef.name} Energy
              </h3>
              <p className="text-[var(--text)]">
                When you have the space to lead from your authentic mode, you bring {authenticDef.name} energy:
                {' '}{authenticDef.when_grounded.toLowerCase()}.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-[var(--bg-subtle)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-[var(--accent)]" />
                Your Coaching Conversation
              </h3>
              <p className="text-[var(--text-muted)] mb-3">
                This report provides a starting point for your conversation with {report.coachName}. Together, you will explore:
              </p>
              <ul className="space-y-2 text-[var(--text)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  What triggers your default mode response?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  When does your authentic mode feel most accessible?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  What small shifts might create more sustainable leadership?
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Download Button */}
        <section className="text-center py-8 border-t border-[var(--border)]">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download PDF Report
              </>
            )}
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            {report.brandName} &bull; Report generated {report.generatedDate}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Coach: {report.coachName}
          </p>
        </div>
      </footer>
    </div>
  )
}
