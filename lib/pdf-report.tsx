import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@joshuajaco/react-pdf-renderer-bundled'
import { PDFReportData, INNOVAAS_BRANDING, getScoreColor, getPriorityColor, getConfidenceColor } from './report-generator'

// ============================================================================
// PDF Styles (Innovaas Branding)
// ============================================================================

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  coverPage: {
    backgroundColor: INNOVAAS_BRANDING.colors.darkBackground,
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  logo: {
    width: 200,
    height: 46,
    marginBottom: 40
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.white,
    marginBottom: 20,
    marginTop: 60
  },
  coverSubtitle: {
    fontSize: 18,
    color: INNOVAAS_BRANDING.colors.lightGray,
    marginBottom: 10
  },
  coverMeta: {
    fontSize: 12,
    color: INNOVAAS_BRANDING.colors.midGray,
    marginTop: 30
  },
  overallScoreBox: {
    backgroundColor: INNOVAAS_BRANDING.colors.primary,
    padding: 30,
    borderRadius: 8,
    marginTop: 40,
    alignItems: 'center'
  },
  overallScoreLabel: {
    fontSize: 14,
    color: INNOVAAS_BRANDING.colors.white,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  overallScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.white
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.darkBackground,
    marginBottom: 20,
    marginTop: 30,
    borderBottom: `2px solid ${INNOVAAS_BRANDING.colors.primary}`,
    paddingBottom: 10
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.darkBackground,
    marginTop: 20,
    marginBottom: 12
  },
  subsectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.navBackground,
    marginTop: 15,
    marginBottom: 8
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333',
    marginBottom: 10
  },
  executiveSummary: {
    fontSize: 11,
    lineHeight: 1.7,
    color: '#333333',
    marginBottom: 12,
    textAlign: 'justify'
  },
  scoreCard: {
    backgroundColor: INNOVAAS_BRANDING.colors.lightGray,
    padding: 15,
    borderRadius: 6,
    marginBottom: 15
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  scoreName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.darkBackground
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  dimensionCard: {
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    borderLeft: `4px solid ${INNOVAAS_BRANDING.colors.secondary}`
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  dimensionName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.darkBackground
  },
  dimensionScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.primary
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    marginRight: 6
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.white,
    textTransform: 'uppercase'
  },
  findingsList: {
    marginTop: 6,
    marginBottom: 6
  },
  findingItem: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#444444',
    marginBottom: 4,
    paddingLeft: 10
  },
  quote: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666666',
    paddingLeft: 15,
    borderLeft: `3px solid ${INNOVAAS_BRANDING.colors.secondary}`,
    marginVertical: 6,
    paddingVertical: 4
  },
  gapText: {
    fontSize: 10,
    color: '#555555',
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 3,
    marginTop: 6
  },
  recommendationItem: {
    marginBottom: 15,
    paddingLeft: 15,
    borderLeft: `3px solid ${INNOVAAS_BRANDING.colors.primary}`
  },
  recommendationNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.primary,
    marginBottom: 4
  },
  recommendationText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333'
  },
  themeItem: {
    marginBottom: 12
  },
  themeNumber: {
    fontSize: 11,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.secondary,
    marginBottom: 3
  },
  themeText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#444444'
  },
  stakeholderCard: {
    backgroundColor: INNOVAAS_BRANDING.colors.lightGray,
    padding: 12,
    borderRadius: 4,
    marginBottom: 12
  },
  stakeholderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: INNOVAAS_BRANDING.colors.darkBackground
  },
  stakeholderRole: {
    fontSize: 9,
    color: INNOVAAS_BRANDING.colors.midGray,
    marginBottom: 8
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: INNOVAAS_BRANDING.colors.midGray,
    textAlign: 'center',
    borderTop: `1px solid ${INNOVAAS_BRANDING.colors.lightGray}`,
    paddingTop: 10
  },
  pageNumber: {
    fontSize: 8,
    color: INNOVAAS_BRANDING.colors.midGray
  }
})

// ============================================================================
// PDF Components
// ============================================================================

interface PDFReportProps {
  data: PDFReportData
}

export const InnovaasAssessmentReport: React.FC<PDFReportProps> = ({ data }) => {
  const { metadata, assessment, branding } = data

  return (
    <Document
      title={`${metadata.companyName} - Digital Transformation Assessment`}
      author="Innovaas FlowForge"
      subject="Digital Transformation Readiness Assessment"
      keywords="Industry 4.0, Digital Transformation, Readiness Assessment"
    >
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          {/* Logo would go here if we could load external images in PDF */}
          <Text style={styles.coverTitle}>
            Digital Transformation{'\n'}Readiness Assessment
          </Text>
          <Text style={styles.coverSubtitle}>{metadata.companyName}</Text>
          <Text style={styles.coverSubtitle}>{metadata.campaignName}</Text>
        </View>

        <View style={styles.overallScoreBox}>
          <Text style={styles.overallScoreLabel}>Overall Readiness Score</Text>
          <Text style={styles.overallScoreValue}>
            {assessment.overallScore.toFixed(1)} / 5.0
          </Text>
        </View>

        <View>
          <Text style={styles.coverMeta}>
            Assessment Date: {metadata.generatedDate}
          </Text>
          <Text style={styles.coverMeta}>
            Stakeholders Interviewed: {metadata.stakeholderCount}
          </Text>
          <Text style={styles.coverMeta}>
            Facilitator: {metadata.facilitatorName}
          </Text>
        </View>
      </Page>

      {/* Executive Summary Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Executive Summary</Text>
        {assessment.executiveSummary.split('\n\n').map((paragraph, idx) => (
          <Text key={idx} style={styles.executiveSummary}>
            {paragraph}
          </Text>
        ))}

        <Text style={styles.sectionHeader}>Readiness by Pillar</Text>
        <View style={styles.scoreCard}>
          {assessment.pillars.map((pillar, idx) => (
            <View key={idx} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{pillar.pillar}</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(pillar.score) }]}>
                {pillar.score.toFixed(1)} / 5.0
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          Innovaas FlowForge Assessment Platform | {metadata.companyName}
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* Dimensional Analysis Pages */}
      {assessment.pillars.map((pillar, pillarIdx) => (
        <Page key={pillarIdx} size="A4" style={styles.page}>
          <Text style={styles.header}>
            {pillar.pillar} Pillar: {pillar.score.toFixed(1)} / 5.0
          </Text>

          {pillar.dimensions.map((dimension, dimIdx) => (
            <View key={dimIdx} style={styles.dimensionCard}>
              <View style={styles.dimensionHeader}>
                <Text style={styles.dimensionName}>{dimension.dimension}</Text>
                <Text style={styles.dimensionScore}>{dimension.score.toFixed(1)} / 5.0</Text>
              </View>

              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: getConfidenceColor(dimension.confidence) }]}>
                  <Text style={styles.badgeText}>Confidence: {dimension.confidence}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getPriorityColor(dimension.priority) }]}>
                  <Text style={styles.badgeText}>Priority: {dimension.priority}</Text>
                </View>
              </View>

              <Text style={[styles.subsectionHeader, { fontSize: 10, marginTop: 8 }]}>Key Findings:</Text>
              <View style={styles.findingsList}>
                {dimension.keyFindings.map((finding, fIdx) => (
                  <Text key={fIdx} style={styles.findingItem}>• {finding}</Text>
                ))}
              </View>

              {dimension.supportingQuotes.length > 0 && (
                <>
                  <Text style={[styles.subsectionHeader, { fontSize: 10, marginTop: 8 }]}>
                    Supporting Evidence:
                  </Text>
                  {dimension.supportingQuotes.slice(0, 2).map((quote, qIdx) => (
                    <Text key={qIdx} style={styles.quote}>"{quote}"</Text>
                  ))}
                </>
              )}

              <Text style={[styles.subsectionHeader, { fontSize: 10, marginTop: 8 }]}>Gap to Next Level:</Text>
              <Text style={styles.gapText}>{dimension.gapToNext}</Text>
            </View>
          ))}

          <Text style={styles.footer} fixed>
            Innovaas FlowForge Assessment Platform | {metadata.companyName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      ))}

      {/* Key Themes & Contradictions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Key Themes</Text>
        {assessment.keyThemes.length > 0 ? (
          assessment.keyThemes.map((theme, idx) => (
            <View key={idx} style={styles.themeItem}>
              <Text style={styles.themeNumber}>Theme {idx + 1}</Text>
              <Text style={styles.themeText}>{theme}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.bodyText}>No cross-cutting themes identified.</Text>
        )}

        <Text style={styles.sectionHeader}>Contradictions & Gaps</Text>
        {assessment.contradictions.length > 0 ? (
          assessment.contradictions.map((contradiction, idx) => (
            <View key={idx} style={styles.themeItem}>
              <Text style={styles.themeNumber}>Gap {idx + 1}</Text>
              <Text style={styles.themeText}>{contradiction}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.bodyText}>No significant contradictions identified.</Text>
        )}

        <Text style={styles.footer} fixed>
          Innovaas FlowForge Assessment Platform | {metadata.companyName}
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* Strategic Recommendations */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Strategic Recommendations</Text>
        {assessment.recommendations.map((recommendation, idx) => (
          <View key={idx} style={styles.recommendationItem}>
            <Text style={styles.recommendationNumber}>Recommendation {idx + 1}</Text>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Innovaas FlowForge Assessment Platform | {metadata.companyName}
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      {/* Stakeholder Perspectives */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Stakeholder Perspectives</Text>
        {assessment.stakeholderPerspectives.map((stakeholder, idx) => (
          <View key={idx} style={styles.stakeholderCard}>
            <Text style={styles.stakeholderName}>{stakeholder.name}</Text>
            <Text style={styles.stakeholderRole}>
              {stakeholder.title} — {formatRoleType(stakeholder.role)}
            </Text>

            {stakeholder.keyConcerns.length > 0 && (
              <>
                <Text style={[styles.subsectionHeader, { fontSize: 9, marginTop: 6 }]}>
                  Key Concerns:
                </Text>
                {stakeholder.keyConcerns.map((concern, cIdx) => (
                  <Text key={cIdx} style={[styles.findingItem, { fontSize: 9 }]}>
                    • {concern}
                  </Text>
                ))}
              </>
            )}

            {stakeholder.notableQuotes.length > 0 && (
              <>
                <Text style={[styles.subsectionHeader, { fontSize: 9, marginTop: 6 }]}>
                  Notable Quote:
                </Text>
                <Text style={styles.quote}>"{stakeholder.notableQuotes[0]}"</Text>
              </>
            )}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Innovaas FlowForge Assessment Platform | {metadata.companyName}
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

// Helper function
function formatRoleType(roleType: string): string {
  const roleMap: Record<string, string> = {
    managing_director: 'Managing Director / Executive Leadership',
    it_operations: 'IT Operations Manager',
    production_manager: 'Production Manager',
    purchasing_manager: 'Purchasing Manager',
    planning_scheduler: 'Planning & Scheduling',
    engineering_maintenance: 'Engineering & Maintenance'
  }
  return roleMap[roleType] || roleType
}
