import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle
} from '@joshuajaco/react-pdf-renderer-bundled'
import { ARCHETYPES, Archetype } from './agents/archetype-constitution'

// ============================================================================
// TYPES
// ============================================================================

export interface CoachingReportData {
  clientName: string
  coachName: string
  brandName: string
  generatedDate: string
  context: {
    role: string
    ambiguity_level: string
    current_feeling: string
  }
  scores: {
    default: Record<Archetype, number>
    authentic: Record<Archetype, number>
    friction: Record<Archetype, number>
  }
  default_archetype: Archetype
  authentic_archetype: Archetype
  is_aligned: boolean
  stories_captured: Array<{
    quote: string
    theme: string
    archetype: Archetype
  }>
}

// ============================================================================
// BRANDING - Leading with Meaning
// ============================================================================

const LWM_BRANDING = {
  colors: {
    primary: '#2D5A7B',      // Deep teal blue
    secondary: '#7BA7BC',    // Light teal
    accent: '#E8A838',       // Warm gold
    darkBackground: '#1A3A4A',
    lightBackground: '#F7F9FA',
    white: '#FFFFFF',
    text: '#2C3E50',
    textLight: '#5D6D7E',
    textMuted: '#95A5A6'
  },
  archetypeColors: {
    anchor: '#3498DB',     // Blue - stability
    catalyst: '#E74C3C',   // Red - action
    steward: '#27AE60',    // Green - care
    wayfinder: '#9B59B6',  // Purple - clarity
    architect: '#F39C12'   // Orange - systems
  }
}

// ============================================================================
// PDF STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  coverPage: {
    backgroundColor: LWM_BRANDING.colors.darkBackground,
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  coverBrandBox: {
    marginTop: 60
  },
  coverBrandName: {
    fontSize: 14,
    color: LWM_BRANDING.colors.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: LWM_BRANDING.colors.white,
    marginBottom: 12
  },
  coverSubtitle: {
    fontSize: 18,
    color: LWM_BRANDING.colors.secondary,
    marginBottom: 30
  },
  coverClientBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 8,
    marginTop: 40
  },
  coverClientLabel: {
    fontSize: 10,
    color: LWM_BRANDING.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4
  },
  coverClientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LWM_BRANDING.colors.white,
    marginBottom: 4
  },
  coverClientRole: {
    fontSize: 12,
    color: LWM_BRANDING.colors.secondary
  },
  coverMeta: {
    fontSize: 10,
    color: LWM_BRANDING.colors.textMuted,
    marginTop: 'auto'
  },

  // Content Pages
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: LWM_BRANDING.colors.primary,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: LWM_BRANDING.colors.accent,
    paddingBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LWM_BRANDING.colors.text,
    marginTop: 24,
    marginBottom: 12
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: LWM_BRANDING.colors.text,
    marginBottom: 10
  },

  // Archetype Cards
  archetypeCard: {
    backgroundColor: LWM_BRANDING.colors.lightBackground,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16
  },
  archetypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  archetypeIcon: {
    width: 40,
    height: 40,
    marginRight: 12
  },
  archetypeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LWM_BRANDING.colors.text
  },
  archetypeLabel: {
    fontSize: 10,
    color: LWM_BRANDING.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  archetypeDescription: {
    fontSize: 11,
    color: LWM_BRANDING.colors.textLight,
    lineHeight: 1.5
  },

  // Scores
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  scoreName: {
    width: 80,
    fontSize: 10,
    color: LWM_BRANDING.colors.text
  },
  scoreBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    marginRight: 8
  },
  scoreBar: {
    height: 12,
    borderRadius: 6
  },
  scoreValue: {
    width: 30,
    fontSize: 10,
    color: LWM_BRANDING.colors.textLight,
    textAlign: 'right'
  },

  // Story Quotes
  quoteCard: {
    backgroundColor: LWM_BRANDING.colors.lightBackground,
    borderLeftWidth: 4,
    borderLeftColor: LWM_BRANDING.colors.accent,
    padding: 16,
    marginBottom: 12
  },
  quoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: LWM_BRANDING.colors.text,
    lineHeight: 1.6,
    marginBottom: 8
  },
  quoteTheme: {
    fontSize: 9,
    color: LWM_BRANDING.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  // Alignment Box
  alignmentBox: {
    padding: 20,
    borderRadius: 8,
    marginVertical: 16
  },
  alignmentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8
  },
  alignmentText: {
    fontSize: 11,
    lineHeight: 1.6
  },

  // Footer
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: LWM_BRANDING.colors.textMuted
  },
  pageNumber: {
    fontSize: 8,
    color: LWM_BRANDING.colors.textMuted
  }
})

// ============================================================================
// ARCHETYPE ICON COMPONENT
// ============================================================================

function ArchetypeIcon({ archetype, size = 40 }: { archetype: Archetype, size?: number }) {
  const color = LWM_BRANDING.archetypeColors[archetype]

  // Simple circle icon with first letter
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="18" fill={color} />
      <Path
        d={getArchetypeIconPath(archetype)}
        fill="white"
        transform="translate(10, 10)"
      />
    </Svg>
  )
}

function getArchetypeIconPath(archetype: Archetype): string {
  // Simple symbolic paths for each archetype
  const paths: Record<Archetype, string> = {
    anchor: 'M10 0 L10 14 L4 14 L10 20 L16 14 L10 14 Z', // Arrow down (stability)
    catalyst: 'M0 10 L8 10 L8 4 L20 10 L8 16 L8 10 Z',   // Arrow right (action)
    steward: 'M10 0 C4 0 0 6 0 10 C0 18 10 20 10 20 C10 20 20 18 20 10 C20 6 16 0 10 0 Z', // Heart
    wayfinder: 'M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z', // Compass star
    architect: 'M0 16 L6 16 L6 8 L14 8 L14 16 L20 16 L20 20 L0 20 Z' // Building blocks
  }
  return paths[archetype]
}

// ============================================================================
// SCORE BAR COMPONENT
// ============================================================================

function ScoreBar({ archetype, score, maxScore }: { archetype: Archetype, score: number, maxScore: number }) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
  const color = LWM_BRANDING.archetypeColors[archetype]

  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreName}>{ARCHETYPES[archetype].name}</Text>
      <View style={styles.scoreBarContainer}>
        <View style={[styles.scoreBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.scoreValue}>{score}</Text>
    </View>
  )
}

// ============================================================================
// COVER PAGE
// ============================================================================

function CoverPage({ data }: { data: CoachingReportData }) {
  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBrandBox}>
        <Text style={styles.coverBrandName}>{data.brandName}</Text>
        <Text style={styles.coverTitle}>Leadership Archetype</Text>
        <Text style={styles.coverTitle}>Discovery Report</Text>
        <Text style={styles.coverSubtitle}>Understanding Your Leadership Patterns</Text>
      </View>

      <View style={styles.coverClientBox}>
        <Text style={styles.coverClientLabel}>Prepared for</Text>
        <Text style={styles.coverClientName}>{data.clientName}</Text>
        <Text style={styles.coverClientRole}>{data.context.role}</Text>
      </View>

      <View style={styles.coverMeta}>
        <Text>Coach: {data.coachName}</Text>
        <Text>Generated: {data.generatedDate}</Text>
      </View>
    </Page>
  )
}

// ============================================================================
// ARCHETYPE PROFILE PAGE
// ============================================================================

function ArchetypeProfilePage({ data }: { data: CoachingReportData }) {
  const defaultArch = ARCHETYPES[data.default_archetype]
  const authenticArch = ARCHETYPES[data.authentic_archetype]

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Your Leadership Pattern</Text>

      <Text style={styles.bodyText}>
        This report reveals patterns in how you lead - especially the difference between
        how you respond under pressure versus what feels most sustainable and energizing.
        These patterns are not fixed traits; they are adaptive responses that have served you well.
      </Text>

      {/* Default Mode */}
      <Text style={styles.sectionTitle}>Under Pressure: {defaultArch.name} Energy</Text>
      <View style={styles.archetypeCard}>
        <View style={styles.archetypeHeader}>
          <View style={styles.archetypeIcon}>
            <ArchetypeIcon archetype={data.default_archetype} />
          </View>
          <View>
            <Text style={styles.archetypeLabel}>Default Mode</Text>
            <Text style={styles.archetypeName}>{defaultArch.name}</Text>
          </View>
        </View>
        <Text style={styles.archetypeDescription}>
          When stakes are high and things feel messy, you tend toward {defaultArch.name} energy: {defaultArch.under_pressure.toLowerCase()}.
        </Text>
        <Text style={[styles.archetypeDescription, { marginTop: 8 }]}>
          Core traits: {defaultArch.core_traits.join(', ')}.
        </Text>
      </View>

      {/* Authentic Mode */}
      <Text style={styles.sectionTitle}>At Your Best: {authenticArch.name} Energy</Text>
      <View style={styles.archetypeCard}>
        <View style={styles.archetypeHeader}>
          <View style={styles.archetypeIcon}>
            <ArchetypeIcon archetype={data.authentic_archetype} />
          </View>
          <View>
            <Text style={styles.archetypeLabel}>Authentic Mode</Text>
            <Text style={styles.archetypeName}>{authenticArch.name}</Text>
          </View>
        </View>
        <Text style={styles.archetypeDescription}>
          When you are at your best - grounded and energized - you lead with {authenticArch.name} energy: {authenticArch.when_grounded.toLowerCase()}.
        </Text>
        <Text style={[styles.archetypeDescription, { marginTop: 8 }]}>
          Core traits: {authenticArch.core_traits.join(', ')}.
        </Text>
      </View>

      {/* Alignment Insight */}
      <View style={[
        styles.alignmentBox,
        {
          backgroundColor: data.is_aligned
            ? 'rgba(39, 174, 96, 0.1)'
            : 'rgba(230, 126, 34, 0.1)',
          borderLeftWidth: 4,
          borderLeftColor: data.is_aligned
            ? LWM_BRANDING.archetypeColors.steward
            : LWM_BRANDING.colors.accent
        }
      ]}>
        <Text style={[
          styles.alignmentTitle,
          { color: data.is_aligned ? '#27AE60' : '#E67E22' }
        ]}>
          {data.is_aligned ? 'Aligned Pattern' : 'Misaligned Pattern'}
        </Text>
        <Text style={styles.alignmentText}>
          {data.is_aligned
            ? `Your default response under pressure aligns with what feels most sustainable. This suggests you have developed coping mechanisms that serve both the immediate need and your long-term wellbeing.`
            : `There is a gap between how you respond under pressure (${defaultArch.name}) and what feels most sustainable (${authenticArch.name}). This is common - we often develop coping patterns that work in the moment but cost us energy over time. The path forward is not to fix this, but to find more moments where you can lead from your authentic mode.`
          }
        </Text>
      </View>

      <View style={styles.pageFooter}>
        <Text>{data.brandName}</Text>
        <Text style={styles.pageNumber}>2</Text>
      </View>
    </Page>
  )
}

// ============================================================================
// SCORES PAGE
// ============================================================================

function ScoresPage({ data }: { data: CoachingReportData }) {
  const defaultMax = Math.max(...Object.values(data.scores.default), 1)
  const authenticMax = Math.max(...Object.values(data.scores.authentic), 1)
  const archetypes: Archetype[] = ['anchor', 'catalyst', 'steward', 'wayfinder', 'architect']

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Detailed Scores</Text>

      <Text style={styles.bodyText}>
        Your responses across the assessment reveal the strength of each archetype in different contexts.
        Higher scores indicate stronger tendencies toward that pattern.
      </Text>

      {/* Default Mode Scores */}
      <Text style={styles.sectionTitle}>Default Mode Under Pressure</Text>
      <View style={{ marginBottom: 20 }}>
        {archetypes.map(arch => (
          <ScoreBar
            key={`default-${arch}`}
            archetype={arch}
            score={data.scores.default[arch]}
            maxScore={defaultMax}
          />
        ))}
      </View>

      {/* Authentic Mode Scores */}
      <Text style={styles.sectionTitle}>Authentic Mode When Grounded</Text>
      <View style={{ marginBottom: 20 }}>
        {archetypes.map(arch => (
          <ScoreBar
            key={`authentic-${arch}`}
            archetype={arch}
            score={data.scores.authentic[arch]}
            maxScore={authenticMax}
          />
        ))}
      </View>

      {/* Context Summary */}
      <Text style={styles.sectionTitle}>Your Context</Text>
      <View style={styles.archetypeCard}>
        <Text style={[styles.bodyText, { marginBottom: 4 }]}>
          <Text style={{ fontWeight: 'bold' }}>Role: </Text>
          {data.context.role}
        </Text>
        <Text style={[styles.bodyText, { marginBottom: 4 }]}>
          <Text style={{ fontWeight: 'bold' }}>Decision Environment: </Text>
          {data.context.ambiguity_level}
        </Text>
        <Text style={styles.bodyText}>
          <Text style={{ fontWeight: 'bold' }}>Current State: </Text>
          {data.context.current_feeling}
        </Text>
      </View>

      <View style={styles.pageFooter}>
        <Text>{data.brandName}</Text>
        <Text style={styles.pageNumber}>3</Text>
      </View>
    </Page>
  )
}

// ============================================================================
// STORIES PAGE
// ============================================================================

function StoriesPage({ data }: { data: CoachingReportData }) {
  if (!data.stories_captured || data.stories_captured.length === 0) {
    return null
  }

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Your Stories</Text>

      <Text style={styles.bodyText}>
        Throughout our conversation, you shared moments that reveal how your leadership
        patterns show up in practice. These stories are valuable - they are the evidence
        of who you are as a leader.
      </Text>

      {data.stories_captured.map((story, index) => (
        <View key={index} style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{story.quote}"</Text>
          <Text style={styles.quoteTheme}>
            Theme: {story.theme} ({ARCHETYPES[story.archetype].name})
          </Text>
        </View>
      ))}

      <Text style={[styles.bodyText, { marginTop: 20 }]}>
        Notice how these stories connect to your archetype pattern. They are not accidents -
        they are expressions of the leadership energy you bring to challenging moments.
      </Text>

      <View style={styles.pageFooter}>
        <Text>{data.brandName}</Text>
        <Text style={styles.pageNumber}>4</Text>
      </View>
    </Page>
  )
}

// ============================================================================
// NEXT STEPS PAGE
// ============================================================================

function NextStepsPage({ data }: { data: CoachingReportData }) {
  const defaultArch = ARCHETYPES[data.default_archetype]
  const authenticArch = ARCHETYPES[data.authentic_archetype]

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Moving Forward</Text>

      <Text style={styles.bodyText}>
        This assessment is not about changing who you are - it is about finding more
        sustainable ways to lead that feel true to you. Here are some things to consider:
      </Text>

      {/* Watch For Section */}
      <Text style={styles.sectionTitle}>Watch For: {defaultArch.name} Overuse</Text>
      <View style={styles.archetypeCard}>
        <Text style={styles.bodyText}>
          When under pressure, you may over-rely on {defaultArch.name} energy.
          Signs that you are overusing this pattern:
        </Text>
        {defaultArch.overuse_signals.map((signal, idx) => (
          <Text key={idx} style={[styles.bodyText, { marginLeft: 12 }]}>
            {'\u2022'} {signal}
          </Text>
        ))}
      </View>

      {/* Lean Into Section */}
      <Text style={styles.sectionTitle}>Lean Into: {authenticArch.name} Energy</Text>
      <View style={styles.archetypeCard}>
        <Text style={styles.bodyText}>
          When you have the space to lead from your authentic mode, you bring
          {authenticArch.name} energy: {authenticArch.when_grounded.toLowerCase()}.
        </Text>
        <Text style={[styles.bodyText, { marginTop: 8 }]}>
          Look for moments where you can create the conditions for this - even small
          shifts can have a significant impact on your sustainability and effectiveness.
        </Text>
      </View>

      {/* Coaching Conversation */}
      <Text style={styles.sectionTitle}>Your Coaching Conversation</Text>
      <View style={styles.archetypeCard}>
        <Text style={styles.bodyText}>
          This report provides a starting point for your conversation with {data.coachName}.
          Together, you will explore:
        </Text>
        <Text style={[styles.bodyText, { marginLeft: 12, marginTop: 8 }]}>
          {'\u2022'} What triggers your default mode response?
        </Text>
        <Text style={[styles.bodyText, { marginLeft: 12 }]}>
          {'\u2022'} When does your authentic mode feel most accessible?
        </Text>
        <Text style={[styles.bodyText, { marginLeft: 12 }]}>
          {'\u2022'} What small shifts might create more sustainable leadership?
        </Text>
      </View>

      <View style={styles.pageFooter}>
        <Text>{data.brandName}</Text>
        <Text style={styles.pageNumber}>5</Text>
      </View>
    </Page>
  )
}

// ============================================================================
// MAIN DOCUMENT COMPONENT
// ============================================================================

export function CoachingReportDocument({ data }: { data: CoachingReportData }) {
  return (
    <Document>
      <CoverPage data={data} />
      <ArchetypeProfilePage data={data} />
      <ScoresPage data={data} />
      {data.stories_captured && data.stories_captured.length > 0 && (
        <StoriesPage data={data} />
      )}
      <NextStepsPage data={data} />
    </Document>
  )
}

export default CoachingReportDocument
