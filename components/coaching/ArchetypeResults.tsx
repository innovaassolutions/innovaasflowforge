/**
 * ArchetypeResults Component
 *
 * Displays a leadership archetype with its traits, descriptions, and insights.
 * Uses tenant branding via CSS custom properties.
 *
 * Story: 1.1 Results Page Foundation
 */

import type { Archetype } from '@/lib/agents/archetype-constitution'

interface ArchetypeData {
  key: Archetype
  name: string
  core_traits: string[]
  under_pressure: string
  when_grounded: string
  overuse_signals: string[]
}

interface ArchetypeResultsProps {
  archetype: ArchetypeData
  label: string
  description: string
}

export function ArchetypeResults({ archetype, label, description }: ArchetypeResultsProps) {
  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--brand-bg-subtle)',
        border: '1px solid var(--brand-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 sm:px-8 sm:py-5"
        style={{
          backgroundColor: 'var(--brand-primary)',
        }}
      >
        <p className="text-sm font-medium text-white/80 mb-1">{label}</p>
        <h2
          className="text-2xl sm:text-3xl font-bold text-white"
          style={{ fontFamily: 'var(--brand-font-heading)' }}
        >
          The {archetype.name}
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
        {/* Description */}
        <p
          className="text-lg"
          style={{ color: 'var(--brand-text-muted)' }}
        >
          {description}
        </p>

        {/* Core Traits */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            Core Traits
          </h3>
          <div className="flex flex-wrap gap-2">
            {archetype.core_traits.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--brand-bg-muted)',
                  color: 'var(--brand-text)',
                  border: '1px solid var(--brand-border)',
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* When Grounded */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            When Grounded
          </h3>
          <p style={{ color: 'var(--brand-text)' }}>
            {archetype.when_grounded}
          </p>
        </div>

        {/* Under Pressure */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Under Pressure
          </h3>
          <p style={{ color: 'var(--brand-text)' }}>
            {archetype.under_pressure}
          </p>
        </div>

        {/* Watch For */}
        <div>
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Watch For (Signs of Overuse)
          </h3>
          <ul className="space-y-2">
            {archetype.overuse_signals.map((signal, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm"
                style={{ color: 'var(--brand-text)' }}
              >
                <span
                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                  style={{ backgroundColor: 'var(--brand-text-muted)' }}
                />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
