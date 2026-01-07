/**
 * TensionPatternCard Component
 *
 * Displays tension pattern information when primary and authentic archetypes differ.
 * Supports personalized insights from reflection enhancement.
 *
 * CRITICAL STYLING REQUIREMENT (per Mark's feedback):
 * - Use sand-colored/neutral background (--brand-bg-muted)
 * - Use blue/teal text for headings (--brand-secondary)
 * - DO NOT use red, orange, or warning colors
 * - Present tension as a pattern to explore, not a problem to fix
 *
 * Story: 1.1 Results Page Foundation
 * Enhanced: Reflection Integration Enhancement
 */

interface TensionPatternData {
  has_tension: boolean
  description?: string
  triggers?: string[]
}

interface TensionPatternCardProps {
  tensionPattern: TensionPatternData
  primaryArchetype: string
  authenticArchetype: string
  /** Personalized tension insights from reflection enhancement */
  personalizedInsights?: string | null
}

export function TensionPatternCard({
  tensionPattern,
  primaryArchetype,
  authenticArchetype,
  personalizedInsights,
}: TensionPatternCardProps) {
  if (!tensionPattern.has_tension) return null

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{
        // Sand-colored/neutral background - NOT warning colors
        backgroundColor: 'var(--brand-bg-muted)',
        border: '1px solid var(--brand-border)',
      }}
    >
      {/* Header - Blue/Teal, NOT Red/Orange */}
      <div className="px-6 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          {/* Icon - Neutral/Blue, NOT warning */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--brand-bg)',
              border: '2px solid var(--brand-secondary, var(--brand-border))',
            }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <div>
            {/* Title - Blue/Teal text */}
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{
                color: 'var(--brand-secondary, var(--brand-text))',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Your Tension Pattern
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              {primaryArchetype} under pressure vs {authenticArchetype} when grounded
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-5"
        style={{ color: 'var(--brand-text)' }}
      >
        {/* Description */}
        {tensionPattern.description && (
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--brand-bg)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <p className="leading-relaxed">
              {tensionPattern.description}
            </p>
          </div>
        )}

        {/* Personalized Insights (if enhanced) */}
        {personalizedInsights && (
          <div
            className="p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: 'var(--brand-bg)',
              borderLeftColor: 'var(--brand-secondary, var(--brand-primary))',
            }}
          >
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
            >
              Your Personal Pattern
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--brand-text)' }}
            >
              {personalizedInsights}
            </p>
          </div>
        )}

        {/* What This Means */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--brand-secondary, var(--brand-text-muted))' }}
          >
            What This Means
          </h3>
          <p className="text-sm" style={{ color: 'var(--brand-text)' }}>
            When you&apos;re under pressure, you naturally lean into {primaryArchetype} energy
            - this is adaptive and has served you well. But your authentic self thrives
            with {authenticArchetype} energy. The goal isn&apos;t to eliminate your default
            response, but to create more choice about when and how you use each.
          </p>
        </div>

        {/* Triggers */}
        {tensionPattern.triggers && tensionPattern.triggers.length > 0 && (
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--brand-secondary, var(--brand-text-muted))' }}
            >
              Common Triggers
            </h3>
            <ul className="space-y-2">
              {tensionPattern.triggers.map((trigger, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: 'var(--brand-text)' }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mt-0.5"
                    style={{
                      backgroundColor: 'var(--brand-bg)',
                      color: 'var(--brand-secondary, var(--brand-text-muted))',
                      border: '1px solid var(--brand-border)',
                    }}
                  >
                    {index + 1}
                  </span>
                  {trigger}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reassurance Note */}
        <div
          className="flex items-start gap-3 p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <svg
            className="flex-shrink-0 w-5 h-5 mt-0.5"
            style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
            This tension is common among leaders and is not a flaw - it&apos;s a pattern
            that developed for good reasons. Understanding it is the first step toward
            leading with greater intention and sustainability.
          </p>
        </div>
      </div>
    </section>
  )
}
