import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { ReadinessAssessment } from './agents/synthesis-agent'
import {
  INNOVAAS_BRANDING,
  ReportMetadata,
  getScoreColor,
  getPriorityColor,
  getConfidenceColor
} from './report-generator'
// Temporarily commented out for debugging React-PDF Error #31
// import {
//   RadarChart,
//   HorizontalBarChart,
//   DonutChart,
//   ScoreBadge
// } from './pdf-chart-components'
// import {
//   TechnologyIcon,
//   DataIcon,
//   CloudIcon,
//   ProcessIcon,
//   IntegrationIcon,
//   SupplyChainIcon,
//   PeopleIcon,
//   StrategyIcon,
//   CheckmarkIcon,
//   WarningIcon,
//   StarIcon,
//   DividerLine
// } from './pdf-icons'
import type { RadarDataPoint, BarDataPoint, DonutDataPoint } from './pdf-charts'

// ============================================================================
// PDF Styles
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: INNOVAAS_BRANDING.colors.white
  },
  coverPage: {
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: INNOVAAS_BRANDING.colors.darkBackground
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.white,
    marginTop: 80,
    textAlign: 'center'
  },
  coverSubtitle: {
    fontSize: 18,
    color: INNOVAAS_BRANDING.colors.primary,
    marginTop: 20,
    textAlign: 'center'
  },
  coverMetadata: {
    marginTop: 40,
    padding: 20,
    backgroundColor: `${INNOVAAS_BRANDING.colors.white}10`,
    borderRadius: 8
  },
  coverMetadataText: {
    fontSize: 12,
    color: INNOVAAS_BRANDING.colors.white,
    marginBottom: 8,
    textAlign: 'center'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.darkBackground,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: `2px solid ${INNOVAAS_BRANDING.colors.primary}`
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.primary,
    marginTop: 20,
    marginBottom: 10
  },
  subsectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.darkBackground,
    marginTop: 15,
    marginBottom: 8
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: INNOVAAS_BRANDING.colors.darkBackground,
    marginBottom: 10,
    textAlign: 'justify'
  },
  scoreContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    padding: 15,
    backgroundColor: INNOVAAS_BRANDING.colors.lightGray,
    borderRadius: 8
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 15
  },
  scoreLabel: {
    fontSize: 12,
    color: INNOVAAS_BRANDING.colors.midGray
  },
  pillarContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: INNOVAAS_BRANDING.colors.lightGray,
    borderRadius: 8,
    borderLeft: `4px solid ${INNOVAAS_BRANDING.colors.primary}`
  },
  dimensionContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 15,
    borderLeft: `2px solid ${INNOVAAS_BRANDING.colors.secondary}`
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 5
  },
  bullet: {
    fontSize: 10,
    marginLeft: 15,
    marginBottom: 5
  },
  quote: {
    fontSize: 9,
    fontStyle: 'italic',
    color: INNOVAAS_BRANDING.colors.midGray,
    marginLeft: 20,
    marginVertical: 5,
    paddingLeft: 10,
    borderLeft: `3px solid ${INNOVAAS_BRANDING.colors.secondary}`
  },
  recommendationContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: `${INNOVAAS_BRANDING.colors.secondary}10`,
    borderRadius: 6
  },
  stakeholderContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: INNOVAAS_BRANDING.colors.lightGray,
    borderRadius: 8
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: INNOVAAS_BRANDING.colors.midGray,
    textAlign: 'center',
    borderTop: `1px solid ${INNOVAAS_BRANDING.colors.midGray}`
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: INNOVAAS_BRANDING.colors.midGray
  },
  chartSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: INNOVAAS_BRANDING.colors.lightGray,
    borderRadius: 8
  }
})

// ============================================================================
// PDF Document Component
// ============================================================================

interface PDFDocumentProps {
  assessment: ReadinessAssessment
  metadata: ReportMetadata
}

export function AssessmentPDFDocument({
  assessment,
  metadata
}: PDFDocumentProps) {
  const { overallScore, pillars, executiveSummary, keyThemes, contradictions, recommendations, stakeholderPerspectives } = assessment

  // Prepare chart data
  const radarData: RadarDataPoint[] = pillars.flatMap(pillar =>
    pillar.dimensions.map(dim => ({
      label: dim.dimension.substring(0, 20), // Truncate for readability
      value: dim.score
    }))
  ).slice(0, 8) // Limit to 8 dimensions for readability

  const pillarBarData: BarDataPoint[] = pillars.map(pillar => ({
    label: pillar.pillar,
    value: pillar.score,
    color: getScoreColor(pillar.score)
  }))

  const priorityDonutData: DonutDataPoint[] = [
    {
      label: 'Critical',
      value: pillars.flatMap(p => p.dimensions).filter(d => d.priority === 'critical').length,
      color: getPriorityColor('critical')
    },
    {
      label: 'Important',
      value: pillars.flatMap(p => p.dimensions).filter(d => d.priority === 'important').length,
      color: getPriorityColor('important')
    },
    {
      label: 'Foundational',
      value: pillars.flatMap(p => p.dimensions).filter(d => d.priority === 'foundational').length,
      color: getPriorityColor('foundational')
    },
    {
      label: 'Opportunistic',
      value: pillars.flatMap(p => p.dimensions).filter(d => d.priority === 'opportunistic').length,
      color: getPriorityColor('opportunistic')
    }
  ].filter(item => item.value > 0)

  const getMaturityLevel = (score: number): string => {
    if (score < 1) return 'Newcomer'
    if (score < 2) return 'Beginner'
    if (score < 3) return 'Intermediate'
    if (score < 4) return 'Experienced'
    if (score < 5) return 'Expert'
    return 'Leader'
  }

  // NOTE: Full PDF generation is deferred. Using minimal test version.
  // User will handle PDF formatting externally from Markdown export.
  return (
    <Document>
      {/* TEST: Ultra-minimal single page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Test PDF Report</Text>
        <Text style={styles.paragraph}>This is a test. Score: {overallScore.toFixed(1)}</Text>
      </Page>
    </Document>
  )

  /*
  BACKUP: Full document code removed to fix Next.js 15 SWC parsing issues.
  The commented JSX was causing build failures in production.
  Full document code is preserved in git history (commit 87def44).
  To restore, see: git show 87def44:lib/pdf-document.tsx
  */
}
