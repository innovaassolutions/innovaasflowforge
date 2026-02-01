/**
 * ReliefMovesCard Component
 *
 * Displays relief moves for a given archetype pairing (misaligned)
 * or protection strategies for aligned pairings.
 *
 * Based on Mark Nickerson's Leadership Archetypes methodology.
 *
 * CRITICAL STYLING REQUIREMENT (per Mark's feedback):
 * - Use sand-colored/neutral background (--brand-bg-muted)
 * - Use blue/teal text for headings (--brand-secondary)
 * - DO NOT use red, orange, or warning colors
 * - Present as practical guidance, not problems
 *
 * Story: Relief Moves Enhancement
 */

import type { Archetype } from '@/lib/agents/archetype-constitution'
import { getReliefMoves, getAlignedProtection } from '@/lib/data/relief-moves'

interface ReliefMovesCardProps {
  defaultArchetype: Archetype
  authenticArchetype: Archetype
  isAligned: boolean
}

export function ReliefMovesCard({
  defaultArchetype,
  authenticArchetype,
  isAligned,
}: ReliefMovesCardProps) {
  if (isAligned) {
    return (
      <AlignedProtectionCard archetype={defaultArchetype} />
    )
  }

  return (
    <MisalignedReliefCard
      defaultArchetype={defaultArchetype}
      authenticArchetype={authenticArchetype}
    />
  )
}

// ============================================================================
// Misaligned Relief Moves
// ============================================================================

function MisalignedReliefCard({
  defaultArchetype,
  authenticArchetype,
}: {
  defaultArchetype: Archetype
  authenticArchetype: Archetype
}) {
  const reliefMoves = getReliefMoves(defaultArchetype, authenticArchetype)
  if (!reliefMoves) return null

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--brand-bg-muted)',
        border: '1px solid var(--brand-border)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          {/* Icon */}
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{
                color: 'var(--brand-secondary, var(--brand-text))',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Your Relief Moves
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              {reliefMoves.title}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-5"
        style={{ color: 'var(--brand-text)' }}
      >
        {/* Relief Aim */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--brand-secondary, var(--brand-text-muted))' }}
          >
            Relief Aim
          </h3>
          <p className="text-sm leading-relaxed">
            {reliefMoves.reliefAim}
          </p>
        </div>

        {/* Narrative */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
          }}
        >
          <p className="leading-relaxed text-sm">
            {reliefMoves.narrative}
          </p>
        </div>

        {/* Relief Moves */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--brand-secondary, var(--brand-text-muted))' }}
          >
            Practical Moves
          </h3>
          <div className="space-y-3">
            {reliefMoves.moves.map((move, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  border: '1px solid var(--brand-border)',
                }}
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: 'var(--brand-secondary, var(--brand-primary))',
                    color: 'white',
                  }}
                >
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-text)' }}>
                  {move}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Framing Quote */}
        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: 'var(--brand-bg)',
            borderLeftColor: 'var(--brand-secondary, var(--brand-primary))',
          }}
        >
          <p
            className="text-sm font-medium italic"
            style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
          >
            &ldquo;{reliefMoves.framing}&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Aligned Protection Strategies
// ============================================================================

function AlignedProtectionCard({
  archetype,
}: {
  archetype: Archetype
}) {
  const protection = getAlignedProtection(archetype)
  if (!protection) return null

  const archetypeName = archetype.charAt(0).toUpperCase() + archetype.slice(1)

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--brand-bg-muted)',
        border: '1px solid var(--brand-border)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          {/* Icon */}
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{
                color: 'var(--brand-secondary, var(--brand-text))',
                fontFamily: 'var(--brand-font-heading)',
              }}
            >
              Staying Grounded as a {archetypeName}
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--brand-text-muted)' }}
            >
              Recognizing when your strength is being overused
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-5"
        style={{ color: 'var(--brand-text)' }}
      >
        {/* Under Pressure */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--brand-secondary, var(--brand-text-muted))' }}
          >
            Under Pressure You May
          </h3>
          <ul className="space-y-2">
            {protection.underPressure.map((item, index) => (
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
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* When Calm and Aligned */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--brand-secondary, var(--brand-text-muted))' }}
          >
            When Calm and Aligned You
          </h3>
          <div className="space-y-2">
            {protection.whenAligned.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  border: '1px solid var(--brand-border)',
                }}
              >
                <svg
                  className="flex-shrink-0 w-4 h-4 mt-0.5"
                  style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-text)' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reframe Quote */}
        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: 'var(--brand-bg)',
            borderLeftColor: 'var(--brand-secondary, var(--brand-primary))',
          }}
        >
          <p
            className="text-sm font-medium italic"
            style={{ color: 'var(--brand-secondary, var(--brand-primary))' }}
          >
            &ldquo;{protection.reframe}&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
