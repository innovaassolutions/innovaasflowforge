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

  return (
    <Document>
      {/* TEST: Ultra-minimal single page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Test PDF Report</Text>
        <Text style={styles.paragraph}>This is a test. Score: {overallScore.toFixed(1)}</Text>
      </Page>
    </Document>
  )

  /* BACKUP: Full document commented out for debugging
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.coverTitle}>Digital Transformation</Text>
          <Text style={styles.coverTitle}>Readiness Assessment</Text>
          <Text style={styles.coverSubtitle}>{metadata.companyName}</Text>
        </View>

        <View style={styles.coverMetadata}>
          <Text style={styles.coverMetadataText}>Campaign: {metadata.campaignName}</Text>
          <Text style={styles.coverMetadataText}>Facilitator: {metadata.facilitatorName}</Text>
          <Text style={styles.coverMetadataText}>Assessment Date: {metadata.generatedDate}</Text>
          <Text style={styles.coverMetadataText}>
            Stakeholders Interviewed: {metadata.stakeholderCount}
          </Text>
        </View>

        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: getScoreColor(overallScore) }}>
            {overallScore.toFixed(1)}
          </Text>
          <Text style={{ fontSize: 14, color: INNOVAAS_BRANDING.colors.white, marginTop: 10 }}>
            {getMaturityLevel(overallScore)}
          </Text>
        </View>

        <Text style={[styles.coverMetadataText, { marginTop: 40 }]}>
          Powered by Innovaas FlowForge
        </Text>
      </Page>

      {/* Executive Summary Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Executive Summary</Text>

        <View style={styles.scoreContainer}>
          <View>
            <Text style={[styles.scoreText, { color: getScoreColor(overallScore) }]}>
              {overallScore.toFixed(1)}
            </Text>
            <Text style={styles.scoreLabel}>Overall Readiness Score</Text>
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: INNOVAAS_BRANDING.colors.darkBackground }}>
              {getMaturityLevel(overallScore)} Level
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>{executiveSummary}</Text>

        <View style={styles.chartSection}>
          <Text style={styles.subsectionHeader}>Readiness Radar</Text>
          <Text style={styles.paragraph}>(Chart visualization - to be added)</Text>
        </View>

        <Text style={[styles.footer, { paddingTop: 5 }]}>
          {metadata.companyName} | {metadata.campaignName} | Generated {metadata.generatedDate}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Pillar Scores Overview Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Readiness by Pillar</Text>

        <View style={styles.chartSection}>
          <Text style={styles.subsectionHeader}>Pillar Score Comparison</Text>
          <Text style={styles.paragraph}>(Chart visualization - to be added)</Text>
        </View>

        {pillars.map((pillar, idx) => (
          <View key={idx} style={styles.pillarContainer}>
            <Text style={[styles.subsectionHeader, { marginTop: 0, marginBottom: 8 }]}>
              {pillar.pillar} Pillar: {pillar.score.toFixed(1)} / 5.0
            </Text>

            <Text style={styles.paragraph}>
              {pillar.dimensions.length} dimensions evaluated
            </Text>
          </View>
        ))}

        <Text style={styles.footer}>
          {metadata.companyName} | {metadata.campaignName} | Generated {metadata.generatedDate}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Detailed Dimensions Pages */}
      {pillars.map((pillar, pillarIdx) => (
        <Page key={pillarIdx} size="A4" style={styles.page}>
          <Text style={styles.header}>{pillar.pillar} Pillar Details</Text>

          {pillar.dimensions.map((dim, dimIdx) => (
            <View key={dimIdx} style={styles.dimensionContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={styles.subsectionHeader}>
                  {dim.dimension}: {dim.score.toFixed(1)} / 5.0
                </Text>
              </View>

              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getConfidenceColor(dim.confidence),
                      color: INNOVAAS_BRANDING.colors.white
                    }
                  ]}
                >
                  <Text>Confidence: {dim.confidence.toUpperCase()}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getPriorityColor(dim.priority),
                      color: INNOVAAS_BRANDING.colors.white
                    }
                  ]}
                >
                  <Text>Priority: {dim.priority.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 5 }]}>
                Key Findings:
              </Text>
              {dim.keyFindings.map((finding, fIdx) => (
                <Text key={fIdx} style={styles.bullet}>
                  • {finding}
                </Text>
              ))}

              {dim.supportingQuotes.length > 0 && (
                <>
                  <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 8 }]}>
                    Supporting Evidence:
                  </Text>
                  {dim.supportingQuotes.slice(0, 2).map((quote, qIdx) => (
                    <Text key={qIdx} style={styles.quote}>
                      "{quote}"
                    </Text>
                  ))}
                </>
              )}

              <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 8 }]}>
                Gap to Next Level:
              </Text>
              <Text style={styles.paragraph}>{dim.gapToNext}</Text>

              {dimIdx < pillar.dimensions.length - 1 && (
                <View style={{
                  marginVertical: 10,
                  borderBottom: `1px solid ${INNOVAAS_BRANDING.colors.secondary}`
                }} />
              )}
            </View>
          ))}

          <Text style={styles.footer}>
            {metadata.companyName} | {metadata.campaignName} | Generated {metadata.generatedDate}
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      ))}

      {/* Key Themes & Contradictions Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Key Themes & Gaps</Text>

        <Text style={styles.sectionHeader}>Cross-Cutting Themes</Text>
        {keyThemes.length > 0 ? (
          keyThemes.map((theme, idx) => (
            <Text key={idx} style={styles.bullet}>
              • {theme}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>No cross-cutting themes identified.</Text>
        )}

        <Text style={[styles.sectionHeader, { marginTop: 30 }]}>Contradictions & Gaps</Text>
        {contradictions.length > 0 ? (
          contradictions.map((contradiction, idx) => (
            <Text key={idx} style={styles.bullet}>
              • {contradiction}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>No significant contradictions identified.</Text>
        )}

        {priorityDonutData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.subsectionHeader}>Priority Distribution</Text>
            <Text style={styles.paragraph}>(Chart visualization - to be added)</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {metadata.companyName} | {metadata.campaignName} | Generated {metadata.generatedDate}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Recommendations Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Strategic Recommendations</Text>

        {recommendations.map((rec, idx) => (
          <View key={idx} style={styles.recommendationContainer}>
            <Text style={[styles.subsectionHeader, { marginTop: 0 }]}>
              Recommendation {idx + 1}
            </Text>
            <Text style={styles.paragraph}>{rec}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          {metadata.companyName} | {metadata.campaignName} | Generated {metadata.generatedDate}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Stakeholder Perspectives Pages */}
      {stakeholderPerspectives.map((sp, spIdx) => (
        <Page key={spIdx} size="A4" style={styles.page}>
          <Text style={styles.header}>Stakeholder Perspectives</Text>

          <View style={styles.stakeholderContainer}>
            <Text style={[styles.subsectionHeader, { fontSize: 16 }]}>
              {sp.name} — {sp.title}
            </Text>
            <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 5 }]}>
              Role: {sp.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>

            {sp.keyConcerns.length > 0 && (
              <>
                <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 10 }]}>
                  Key Concerns:
                </Text>
                {sp.keyConcerns.map((concern, cIdx) => (
                  <Text key={cIdx} style={styles.bullet}>
                    • {concern}
                  </Text>
                ))}
              </>
            )}

            {sp.notableQuotes.length > 0 && (
              <>
                <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 10 }]}>
                  Notable Quotes:
                </Text>
                {sp.notableQuotes.map((quote, qIdx) => (
                  <Text key={qIdx} style={styles.quote}>
                    "{quote}"
                  </Text>
                ))}
              </>
            )}
          </View>

          <Text style={styles.footer}>
            {metadata.companyName} | {metadata.campaignName} | Generated {metadata.generatedDate}
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      ))}

      {/* Methodology Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Assessment Methodology</Text>

        <Text style={styles.paragraph}>
          This assessment was conducted using a structured multi-stakeholder interview approach
          informed by globally-recognized Industry 4.0 maturity frameworks. The methodology
          evaluates digital transformation readiness across three core pillars:
        </Text>

        <View style={{ marginVertical: 15 }}>
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.subsectionHeader, { marginTop: 0 }]}>
              Technology (40% weight)
            </Text>
            <Text style={styles.paragraph}>
              Digital infrastructure, analytics capabilities, and cybersecurity resilience
            </Text>
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.subsectionHeader, { marginTop: 0 }]}>
              Process (35% weight)
            </Text>
            <Text style={styles.paragraph}>
              Operations integration, supply chain connectivity, and innovation lifecycle
            </Text>
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.subsectionHeader, { marginTop: 0 }]}>
              Organization (25% weight)
            </Text>
            <Text style={styles.paragraph}>
              Talent development and strategic governance
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Each dimension is scored on a 0-5 maturity scale based on evidence from stakeholder
          conversations. Confidence levels indicate the strength of supporting data, and priority
          rankings guide recommended focus areas.
        </Text>

        <View style={{ marginTop: 30, padding: 15, backgroundColor: INNOVAAS_BRANDING.colors.lightGray, borderRadius: 8 }}>
          <Text style={[styles.subsectionHeader, { marginTop: 0 }]}>Maturity Level Reference</Text>
          {[
            { level: 0, name: 'Newcomer', desc: 'Little awareness, manual processes, no strategy' },
            { level: 1, name: 'Beginner', desc: 'Initial awareness, pilot projects, limited scope' },
            { level: 2, name: 'Intermediate', desc: 'Defined processes, multi-department adoption' },
            { level: 3, name: 'Experienced', desc: 'Integrated systems, organization-wide adoption' },
            { level: 4, name: 'Expert', desc: 'Optimized systems, industry best practices' },
            { level: 5, name: 'Leader', desc: 'Industry-leading, ecosystem influence' }
          ].map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginBottom: 5 }}>
              <Text style={[styles.paragraph, { fontWeight: 'bold', marginRight: 5, width: 20 }]}>
                {item.level}
              </Text>
              <Text style={[styles.paragraph, { fontWeight: 'bold', marginRight: 10, width: 80 }]}>
                {item.name}
              </Text>
              <Text style={[styles.paragraph, { flex: 1 }]}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          {metadata.companyName} | {metadata.campaignName} | Generated {metadata.generatedDate}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>
    </Document>
  )
  */
}
