'use client'

/**
 * Recommendations Section Component
 *
 * Strategic recommendations with visual priority indicators.
 * Organized by priority and includes actionable guidance.
 *
 * Part of Report Visual Transformation spec
 */

import { ReadinessAssessment } from '@/lib/agents/synthesis-agent'
import { CalloutBox } from '../ui/CalloutBox'
import { CheckCircle2 } from 'lucide-react'

interface RecommendationsProps {
  assessment: ReadinessAssessment
  className?: string
}

export function Recommendations({ assessment, className = '' }: RecommendationsProps) {
  return (
    <section
      className={`bg-background border border-border rounded-lg p-8 ${className}`}
      aria-labelledby="recommendations-heading">
      <h2 id="recommendations-heading" className="text-2xl font-bold text-foreground mb-6">
        Strategic Recommendations
      </h2>

      <div className="mb-6">
        <p className="text-muted-foreground leading-relaxed">
          Based on the comprehensive analysis across all dimensions, the following strategic
          recommendations are prioritized to accelerate digital transformation readiness and
          maximize business impact.
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {assessment.recommendations.map((recommendation, idx) => (
          <div
            key={idx}
            className="bg-card rounded-lg p-6 border-l-4 border-brand-teal">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-brand-teal bg-opacity-20 flex items-center justify-center">
                  <span className="text-brand-teal font-bold text-sm">{idx + 1}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-foreground leading-relaxed">{recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Priorities Callout */}
      <div className="mt-8">
        <CalloutBox variant="critical" title="Critical Priorities">
          The highest-impact opportunities for improvement have been identified in the dimensional
          analysis above. Focus initial efforts on "Critical" and "Important" priority dimensions
          to establish a strong foundation for transformation.
        </CalloutBox>
      </div>

      {/* Next Steps */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-brand-teal" />
          Recommended Next Steps
        </h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="font-semibold text-brand-teal mt-0.5">1.</span>
            <span className="text-muted-foreground">
              Review this assessment with key stakeholders and leadership team
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-semibold text-brand-teal mt-0.5">2.</span>
            <span className="text-muted-foreground">
              Prioritize recommendations based on strategic alignment and resource availability
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-semibold text-brand-teal mt-0.5">3.</span>
            <span className="text-muted-foreground">
              Develop detailed implementation roadmap with measurable milestones
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-semibold text-brand-teal mt-0.5">4.</span>
            <span className="text-muted-foreground">
              Establish governance structure and tracking mechanisms for progress monitoring
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-semibold text-brand-teal mt-0.5">5.</span>
            <span className="text-muted-foreground">
              Schedule follow-up assessment in 6-12 months to measure transformation progress
            </span>
          </li>
        </ol>
      </div>
    </section>
  )
}
