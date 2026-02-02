import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Rect,
  G,
  Line
} from '@react-pdf/renderer'

// ============================================================================
// Brand Colors
// ============================================================================

const COLORS = {
  primary: '#F25C05',      // Orange
  secondary: '#1D9BA3',    // Teal
  dark: '#111928',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  midGray: '#777777',
  warmAccent: '#FFB347',
  success: '#4CAF50'
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Cover Page
  coverPage: {
    padding: 0,
    backgroundColor: COLORS.dark
  },
  coverContent: {
    padding: 60,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  coverHeader: {
    marginTop: 40
  },
  coverTagline: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 20
  },
  coverTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 1.2,
    marginBottom: 20
  },
  coverSubtitle: {
    fontSize: 16,
    color: COLORS.midGray,
    lineHeight: 1.6
  },
  coverFooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20
  },
  coverBrand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  coverUrl: {
    fontSize: 10,
    color: COLORS.midGray
  },

  // Content Pages
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: `1px solid ${COLORS.lightGray}`
  },
  pageHeaderTitle: {
    fontSize: 10,
    color: COLORS.midGray
  },
  pageHeaderBrand: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary
  },

  // Typography
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 25
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 25,
    marginBottom: 10
  },
  subheading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 15,
    marginBottom: 8
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.7,
    color: COLORS.dark,
    marginBottom: 12
  },
  lead: {
    fontSize: 12,
    lineHeight: 1.6,
    color: COLORS.midGray,
    marginBottom: 20
  },

  // Feature Cards
  featureRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15
  },
  featureCard: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8
  },
  featureCardAccent: {
    flex: 1,
    padding: 20,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 8,
    borderLeft: `3px solid ${COLORS.primary}`
  },
  featureIcon: {
    marginBottom: 12
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6
  },
  featureText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.midGray
  },

  // Bullet Lists
  bulletList: {
    marginLeft: 10,
    marginBottom: 15
  },
  bulletItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 10,
    marginTop: 4
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.dark
  },

  // Comparison Table
  table: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden'
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: COLORS.dark,
    padding: 12
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    borderBottom: `1px solid ${COLORS.lightGray}`
  },
  tableRowAlt: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderBottom: `1px solid ${COLORS.white}`
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: COLORS.dark
  },
  tableCellHighlight: {
    flex: 1,
    fontSize: 9,
    color: COLORS.secondary,
    fontWeight: 'bold'
  },

  // Callout Box
  callout: {
    padding: 20,
    backgroundColor: `${COLORS.secondary}10`,
    borderRadius: 8,
    borderLeft: `4px solid ${COLORS.secondary}`,
    marginVertical: 20
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8
  },
  calloutText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.dark
  },

  // Metrics Grid
  metricsGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: 15,
    marginVertical: 20
  },
  metricCard: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: 'center'
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 9,
    color: COLORS.midGray,
    textAlign: 'center'
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTop: `1px solid ${COLORS.lightGray}`
  },
  footerText: {
    fontSize: 8,
    color: COLORS.midGray
  },
  pageNumber: {
    fontSize: 8,
    color: COLORS.midGray
  },

  // CTA Section
  ctaSection: {
    marginTop: 30,
    padding: 30,
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    alignItems: 'center'
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center'
  },
  ctaTagline: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 15
  },
  ctaUrl: {
    fontSize: 12,
    color: COLORS.white
  }
})

// ============================================================================
// Illustration Components
// ============================================================================

const MultiDimensionalIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="20" fill={`${COLORS.primary}20`} />
    <Circle cx="24" cy="24" r="12" fill={`${COLORS.primary}40`} />
    <Circle cx="24" cy="24" r="5" fill={COLORS.primary} />
    <Line x1="24" y1="4" x2="24" y2="14" stroke={COLORS.primary} strokeWidth="2" />
    <Line x1="24" y1="34" x2="24" y2="44" stroke={COLORS.primary} strokeWidth="2" />
    <Line x1="4" y1="24" x2="14" y2="24" stroke={COLORS.primary} strokeWidth="2" />
    <Line x1="34" y1="24" x2="44" y2="24" stroke={COLORS.primary} strokeWidth="2" />
  </Svg>
)

const EvidenceIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Rect x="8" y="6" width="32" height="36" rx="3" fill={`${COLORS.secondary}20`} />
    <Rect x="12" y="12" width="24" height="3" rx="1" fill={COLORS.secondary} />
    <Rect x="12" y="18" width="20" height="2" rx="1" fill={`${COLORS.secondary}60`} />
    <Rect x="12" y="23" width="18" height="2" rx="1" fill={`${COLORS.secondary}60`} />
    <Rect x="12" y="28" width="22" height="2" rx="1" fill={`${COLORS.secondary}60`} />
    <Circle cx="36" cy="36" r="8" fill={COLORS.success} />
    <Path d="M32 36 L35 39 L40 33" stroke={COLORS.white} strokeWidth="2" fill="none" />
  </Svg>
)

const FrameworkIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Rect x="4" y="4" width="18" height="18" rx="3" fill={COLORS.primary} />
    <Rect x="26" y="4" width="18" height="18" rx="3" fill={COLORS.secondary} />
    <Rect x="4" y="26" width="18" height="18" rx="3" fill={COLORS.warmAccent} />
    <Rect x="26" y="26" width="18" height="18" rx="3" fill={`${COLORS.dark}80`} />
  </Svg>
)

const AIIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="20" fill={`${COLORS.primary}15`} />
    <Circle cx="24" cy="16" r="6" fill={COLORS.primary} />
    <Circle cx="14" cy="30" r="5" fill={COLORS.secondary} />
    <Circle cx="34" cy="30" r="5" fill={COLORS.secondary} />
    <Line x1="24" y1="22" x2="24" y2="26" stroke={COLORS.dark} strokeWidth="1" />
    <Line x1="24" y1="26" x2="16" y2="28" stroke={COLORS.dark} strokeWidth="1" />
    <Line x1="24" y1="26" x2="32" y2="28" stroke={COLORS.dark} strokeWidth="1" />
  </Svg>
)

const QualityIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Path
      d="M24 4 L28 16 L40 16 L30 24 L34 36 L24 28 L14 36 L18 24 L8 16 L20 16 Z"
      fill={COLORS.primary}
    />
  </Svg>
)

const ActionIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="20" fill={`${COLORS.secondary}20`} />
    <Path
      d="M20 14 L36 24 L20 34 Z"
      fill={COLORS.secondary}
    />
  </Svg>
)

const ConversationIllustration = () => (
  <Svg width={120} height={80} viewBox="0 0 120 80">
    {/* Speech bubbles */}
    <Rect x="10" y="10" width="45" height="25" rx="12" fill={COLORS.primary} />
    <Path d="M25 35 L20 45 L35 35" fill={COLORS.primary} />
    <Rect x="65" y="30" width="45" height="25" rx="12" fill={COLORS.secondary} />
    <Path d="M95 55 L100 65 L85 55" fill={COLORS.secondary} />
    {/* Dots for text */}
    <Circle cx="22" cy="22" r="2" fill={COLORS.white} />
    <Circle cx="32" cy="22" r="2" fill={COLORS.white} />
    <Circle cx="42" cy="22" r="2" fill={COLORS.white} />
    <Circle cx="77" cy="42" r="2" fill={COLORS.white} />
    <Circle cx="87" cy="42" r="2" fill={COLORS.white} />
    <Circle cx="97" cy="42" r="2" fill={COLORS.white} />
  </Svg>
)

const DataFlowIllustration = () => (
  <Svg width={200} height={60} viewBox="0 0 200 60">
    {/* Input */}
    <Circle cx="25" cy="30" r="20" fill={`${COLORS.primary}20`} />
    <Circle cx="25" cy="30" r="12" fill={COLORS.primary} />
    {/* Arrow 1 */}
    <Line x1="50" y1="30" x2="75" y2="30" stroke={COLORS.midGray} strokeWidth="2" />
    <Path d="M70 25 L80 30 L70 35" fill={COLORS.midGray} />
    {/* Process */}
    <Rect x="85" y="10" width="40" height="40" rx="5" fill={COLORS.secondary} />
    <Text x="105" y="35" fill={COLORS.white} style={{ fontSize: 16 }} textAnchor="middle">AI</Text>
    {/* Arrow 2 */}
    <Line x1="130" y1="30" x2="155" y2="30" stroke={COLORS.midGray} strokeWidth="2" />
    <Path d="M150 25 L160 30 L150 35" fill={COLORS.midGray} />
    {/* Output */}
    <Rect x="165" y="10" width="30" height="40" rx="5" fill={COLORS.success} />
    <Path d="M173 30 L178 35 L187 25" stroke={COLORS.white} strokeWidth="2" fill="none" />
  </Svg>
)

// ============================================================================
// PDF Document Component
// ============================================================================

export function ScoringMethodologyPDF() {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverContent}>
          <View style={styles.coverHeader}>
            <Text style={styles.coverTagline}>ASSESSMENT METHODOLOGY</Text>
            <Text style={styles.coverTitle}>
              The Science Behind{'\n'}FlowForge Assessments
            </Text>
            <Text style={styles.coverSubtitle}>
              How we transform conversations into actionable intelligence
              through rigorous, evidence-based methodology.
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginVertical: 40 }}>
            <ConversationIllustration />
          </View>

          <View style={styles.coverFooter}>
            <View>
              <Text style={styles.coverBrand}>FlowForge</Text>
              <Text style={styles.coverUrl}>flowforge.innovaas.co</Text>
            </View>
            <Text style={styles.coverUrl}>Assess smarter. Advise better.</Text>
          </View>
        </View>
      </Page>

      {/* Page 2: Multi-Dimensional Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>Assessment Methodology</Text>
          <Text style={styles.pageHeaderBrand}>FlowForge</Text>
        </View>

        <Text style={styles.sectionTitle}>Multi-Dimensional Analysis</Text>
        <Text style={styles.sectionSubtitle}>Beyond Single Scores</Text>

        <Text style={styles.lead}>
          Traditional assessments reduce complex realities to a single number.
          FlowForge takes a fundamentally different approach with purpose-built
          frameworks for every context.
        </Text>

        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Svg width={32} height={32} viewBox="0 0 32 32">
                <Rect x="2" y="2" width="28" height="28" rx="4" fill={`${COLORS.primary}20`} />
                <Rect x="6" y="14" width="5" height="12" fill={COLORS.primary} />
                <Rect x="13" y="10" width="5" height="16" fill={COLORS.primary} />
                <Rect x="20" y="6" width="5" height="20" fill={COLORS.primary} />
              </Svg>
            </View>
            <Text style={styles.featureTitle}>For Organizations</Text>
            <Text style={styles.featureText}>
              Evaluate readiness across three interconnected pillars—Technology,
              Process, and Organization—each with specialized dimensions.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Svg width={32} height={32} viewBox="0 0 32 32">
                <Circle cx="16" cy="10" r="6" fill={COLORS.secondary} />
                <Path d="M8 28 C8 20 24 20 24 28" fill={COLORS.secondary} />
              </Svg>
            </View>
            <Text style={styles.featureTitle}>For Individuals</Text>
            <Text style={styles.featureText}>
              Map behavioral patterns across multiple contexts—how you lead
              under pressure, when you're at your best, and what drains energy.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Svg width={32} height={32} viewBox="0 0 32 32">
                <Circle cx="10" cy="10" r="5" fill={COLORS.warmAccent} />
                <Circle cx="22" cy="10" r="5" fill={COLORS.warmAccent} />
                <Circle cx="16" cy="22" r="5" fill={COLORS.warmAccent} />
                <Line x1="10" y1="15" x2="16" y2="17" stroke={COLORS.dark} strokeWidth="1" />
                <Line x1="22" y1="15" x2="16" y2="17" stroke={COLORS.dark} strokeWidth="1" />
              </Svg>
            </View>
            <Text style={styles.featureTitle}>For Institutions</Text>
            <Text style={styles.featureText}>
              Synthesize perspectives across stakeholder groups—identifying
              where perceptions diverge and why that matters.
            </Text>
          </View>
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>Why Multi-Dimensional Matters</Text>
          <Text style={styles.calloutText}>
            A single score hides critical nuance. Our multi-dimensional approach reveals
            not just where you stand, but why—and what's holding back progress in each area.
            This enables targeted action rather than generic recommendations.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>flowforge.innovaas.co</Text>
          <Text style={styles.pageNumber}>2</Text>
        </View>
      </Page>

      {/* Page 3: Evidence-Based Scoring */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>Assessment Methodology</Text>
          <Text style={styles.pageHeaderBrand}>FlowForge</Text>
        </View>

        <Text style={styles.sectionTitle}>Evidence-Based Scoring</Text>
        <Text style={styles.sectionSubtitle}>Every Score Tells a Story</Text>

        <Text style={styles.lead}>
          FlowForge doesn't assign scores in a vacuum. Every rating is anchored
          to specific evidence that you can trace back to its source.
        </Text>

        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold' }}>Direct Quotes: </Text>
              Actual statements from stakeholders that support each finding
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold' }}>Pattern Recognition: </Text>
              Themes that emerge across multiple conversations
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold' }}>Confidence Indicators: </Text>
              Transparency about data quality and stakeholder alignment
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold' }}>Gap Analysis: </Text>
              Clear articulation of what separates current state from the next level
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <DataFlowIllustration />
        </View>

        <Text style={styles.heading}>Quality Indicators</Text>
        <Text style={styles.paragraph}>
          We don't just score—we tell you how confident you should be in those scores.
          When data is insufficient for a reliable score, we say so explicitly.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Indicator</Text>
            <Text style={styles.tableHeaderCell}>What It Measures</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Confidence Level</Text>
            <Text style={styles.tableCell}>Stakeholder alignment on each dimension</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCell}>Data Completeness</Text>
            <Text style={styles.tableCell}>Conversation depth and coverage</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Triangulation Score</Text>
            <Text style={styles.tableCell}>Agreement across stakeholder groups</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCell}>Evidence Density</Text>
            <Text style={styles.tableCell}>Supporting quotes per finding</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>flowforge.innovaas.co</Text>
          <Text style={styles.pageNumber}>3</Text>
        </View>
      </Page>

      {/* Page 4: Context-Aware Frameworks */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>Assessment Methodology</Text>
          <Text style={styles.pageHeaderBrand}>FlowForge</Text>
        </View>

        <Text style={styles.sectionTitle}>Context-Aware Frameworks</Text>
        <Text style={styles.sectionSubtitle}>The Right Tool for Every Assessment</Text>

        <Text style={styles.lead}>
          One scoring model doesn't fit all contexts. FlowForge employs purpose-built
          frameworks optimized for each application.
        </Text>

        <View style={styles.featureCardAccent}>
          <Text style={styles.featureTitle}>Organizational Readiness</Text>
          <Text style={styles.paragraph}>
            A proven maturity model with six distinct levels (0-5), weighted across
            Technology (40%), Process (35%), and Organization (25%). Each dimension
            is scored independently with specific criteria, ensuring nuanced evaluation.
          </Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>6</Text>
              <Text style={styles.metricLabel}>Maturity Levels</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>8</Text>
              <Text style={styles.metricLabel}>Dimensions</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>3</Text>
              <Text style={styles.metricLabel}>Core Pillars</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <View style={styles.featureCardAccent}>
            <Text style={styles.featureTitle}>Leadership Development</Text>
            <Text style={styles.paragraph}>
              A behavioral archetype system that identifies core leadership patterns
              across five distinct styles. Rather than labeling leaders as "good" or "bad,"
              we map authentic strengths and surface tension patterns.
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <View style={styles.featureCardAccent}>
            <Text style={styles.featureTitle}>Institutional Health</Text>
            <Text style={styles.paragraph}>
              A Four Lenses framework that examines what's holding strong, what's slipping,
              what's misunderstood across groups, and what's at risk. Triangulation across
              stakeholder perspectives reveals blind spots.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>flowforge.innovaas.co</Text>
          <Text style={styles.pageNumber}>4</Text>
        </View>
      </Page>

      {/* Page 5: AI-Powered Synthesis & Comparison */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>Assessment Methodology</Text>
          <Text style={styles.pageHeaderBrand}>FlowForge</Text>
        </View>

        <Text style={styles.sectionTitle}>AI-Powered Synthesis</Text>
        <Text style={styles.sectionSubtitle}>Human Insight at Scale</Text>

        <Text style={styles.lead}>
          FlowForge combines the depth of human conversation with the analytical
          power of advanced AI for insights that would take weeks to uncover manually.
        </Text>

        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Natural Conversations</Text>
            <Text style={styles.featureText}>
              Stakeholders engage in authentic dialogue—not checkbox surveys.
              This surfaces nuance, context, and the "why" behind responses.
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Intelligent Analysis</Text>
            <Text style={styles.featureText}>
              Our AI synthesizes across all conversations simultaneously,
              identifying patterns, contradictions, and themes.
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Structured Output</Text>
            <Text style={styles.featureText}>
              Despite open-ended input, outputs follow rigorous frameworks—
              ensuring consistency and comparability.
            </Text>
          </View>
        </View>

        <Text style={styles.heading}>The FlowForge Difference</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Traditional Assessments</Text>
            <Text style={styles.tableHeaderCell}>FlowForge</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Single score output</Text>
            <Text style={styles.tableCellHighlight}>Multi-dimensional analysis</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCell}>Survey checkboxes</Text>
            <Text style={styles.tableCellHighlight}>Natural conversation</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Opaque algorithms</Text>
            <Text style={styles.tableCellHighlight}>Evidence-traced scores</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCell}>One-size-fits-all</Text>
            <Text style={styles.tableCellHighlight}>Context-aware frameworks</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Point-in-time snapshot</Text>
            <Text style={styles.tableCellHighlight}>Longitudinal tracking</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCell}>Data without direction</Text>
            <Text style={styles.tableCellHighlight}>Prioritized recommendations</Text>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to See It in Action?</Text>
          <Text style={styles.ctaTagline}>Assess smarter. Advise better.</Text>
          <Text style={styles.ctaUrl}>flowforge.innovaas.co</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>flowforge.innovaas.co</Text>
          <Text style={styles.pageNumber}>5</Text>
        </View>
      </Page>
    </Document>
  )
}

export default ScoringMethodologyPDF
