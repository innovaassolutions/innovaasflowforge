/**
 * Archetype Results PDF Document
 *
 * Generates a branded PDF that mirrors the web results page.
 * Uses tenant branding for colors, fonts, and logo.
 *
 * Story: 1.3 Email & PDF
 */

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Circle
} from '@react-pdf/renderer'
import type { TenantProfile } from '@/lib/supabase/server'
import type { ResultsResponse } from '@/app/api/coach/[slug]/results/[token]/route'

// ============================================================================
// TYPES
// ============================================================================

export interface EnhancedResultsData {
  personalizedDefaultNarrative: string
  personalizedAuthenticNarrative: string
  personalizedTensionInsights: string | null
  reflectionThemes: string[]
  personalizedGuidance: string
  meaningfulQuotes: Array<{
    quote: string
    context: string
  }>
  enhancedAt: string
}

export interface ArchetypeResultsPDFData {
  session: NonNullable<ResultsResponse['session']>
  results: NonNullable<ResultsResponse['results']>
  tenant: TenantProfile
  reflectionMessages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  enhancedResults?: EnhancedResultsData
  generatedDate: string
  /** Pre-validated logo URL - pass null to skip logo rendering */
  validatedLogoUrl?: string | null
  /** Custom footer text (e.g., website URL) - falls back to display_name */
  pdfFooterText?: string
}

interface BrandColors {
  primary: string
  primaryHover: string
  secondary: string
  background: string
  backgroundSubtle: string
  backgroundMuted: string
  text: string
  textMuted: string
  border: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getBrandColors(tenant: TenantProfile): BrandColors {
  // Defensive: Handle missing brand_config or colors
  const colors = tenant?.brand_config?.colors || {}
  return {
    primary: colors.primary || '#F25C05',
    primaryHover: colors.primaryHover || '#DC5204',
    secondary: colors.secondary || '#1D9BA3',
    background: colors.background || '#FFFEFB',
    backgroundSubtle: colors.backgroundSubtle || '#FAF8F3',
    backgroundMuted: '#F2EFE7', // Sand color for tension pattern
    text: colors.text || '#171614',
    textMuted: colors.textMuted || '#71706B',
    border: colors.border || '#E6E2D6'
  }
}

// ============================================================================
// PDF STYLES FACTORY
// ============================================================================

function createStyles(colors: BrandColors) {
  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      padding: 40,
      fontFamily: 'Helvetica',
      fontSize: 10
    },

    // Header (on every page)
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    headerLogo: {
      maxHeight: 48,
      maxWidth: 180
    },
    headerText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.primary
    },
    headerRight: {
      textAlign: 'right'
    },
    headerLabel: {
      fontSize: 9,
      color: colors.textMuted,
      marginBottom: 2
    },
    headerName: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colors.text
    },

    // Hero Section
    heroSection: {
      textAlign: 'center',
      marginBottom: 24
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8
    },
    heroSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      maxWidth: 400,
      marginHorizontal: 'auto'
    },

    // Archetype Card
    archetypeCard: {
      marginBottom: 20,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border
    },
    archetypeHeader: {
      backgroundColor: colors.primary,
      padding: 16
    },
    archetypeLabel: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4
    },
    archetypeTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF'
    },
    archetypeContent: {
      backgroundColor: colors.backgroundSubtle,
      padding: 16
    },
    archetypeDescription: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 16,
      lineHeight: 1.5
    },

    // Side-by-side archetype cards container
    archetypesRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20
    },
    archetypeCardCompact: {
      flex: 1,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border
    },
    archetypeHeaderCompact: {
      backgroundColor: colors.primary,
      padding: 12
    },
    archetypeLabelCompact: {
      fontSize: 8,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 2
    },
    archetypeTitleCompact: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF'
    },
    archetypeContentCompact: {
      backgroundColor: colors.backgroundSubtle,
      padding: 12
    },
    archetypeDescriptionCompact: {
      fontSize: 9,
      color: colors.textMuted,
      marginBottom: 10,
      lineHeight: 1.4
    },
    traitsSectionCompact: {
      marginBottom: 10
    },
    sectionLabelCompact: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6
    },
    traitsContainerCompact: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4
    },
    traitCompact: {
      backgroundColor: colors.backgroundMuted,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
      fontSize: 7,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border
    },
    infoBoxCompact: {
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 4,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    infoBoxTitleCompact: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.secondary,
      marginBottom: 4
    },
    infoBoxTextCompact: {
      fontSize: 8,
      color: colors.text,
      lineHeight: 1.4
    },
    watchForSectionCompact: {
      marginTop: 6
    },
    bulletItemCompact: {
      flexDirection: 'row',
      marginBottom: 4,
      alignItems: 'flex-start'
    },
    bulletDotCompact: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.textMuted,
      marginRight: 6,
      marginTop: 4
    },
    bulletTextCompact: {
      flex: 1,
      fontSize: 8,
      color: colors.text,
      lineHeight: 1.3
    },

    // Traits
    traitsSection: {
      marginBottom: 16
    },
    sectionLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8
    },
    traitsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6
    },
    trait: {
      backgroundColor: colors.backgroundMuted,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      fontSize: 9,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border
    },

    // Info Boxes (When Grounded, Under Pressure)
    infoBox: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 6,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border
    },
    infoBoxTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.secondary,
      marginBottom: 6
    },
    infoBoxText: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.5
    },

    // Watch For (Overuse Signals)
    watchForSection: {
      marginTop: 8
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: 6,
      alignItems: 'flex-start'
    },
    bulletDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.textMuted,
      marginRight: 8,
      marginTop: 5
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.4
    },

    // Tension Pattern Card - Sand/Neutral Colors
    tensionCard: {
      marginBottom: 20,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.backgroundMuted,
      borderWidth: 1,
      borderColor: colors.border
    },
    tensionHeader: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center'
    },
    tensionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.secondary,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center'
    },
    tensionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.secondary
    },
    tensionSubtitle: {
      fontSize: 9,
      color: colors.textMuted
    },
    tensionContent: {
      paddingHorizontal: 16,
      paddingBottom: 16
    },
    tensionDescription: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 6,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border
    },
    tensionDescriptionText: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.5
    },
    tensionTriggerNumber: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    tensionTriggerNumberText: {
      fontSize: 9,
      color: colors.secondary,
      fontWeight: 'bold'
    },
    tensionNote: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 6,
      marginTop: 12,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border
    },
    tensionNoteIcon: {
      marginRight: 10,
      marginTop: 2
    },
    tensionNoteText: {
      flex: 1,
      fontSize: 9,
      color: colors.textMuted,
      lineHeight: 1.5
    },

    // Moving Forward Section
    movingForwardCard: {
      backgroundColor: colors.backgroundSubtle,
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border
    },
    movingForwardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12
    },
    movingForwardIntro: {
      fontSize: 10,
      color: colors.text,
      marginBottom: 16,
      lineHeight: 1.5
    },
    stepItem: {
      flexDirection: 'row',
      marginBottom: 14,
      alignItems: 'flex-start'
    },
    stepNumber: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center'
    },
    stepNumberText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFFFFF'
    },
    stepContent: {
      flex: 1
    },
    stepTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 3
    },
    stepDescription: {
      fontSize: 9,
      color: colors.textMuted,
      lineHeight: 1.4
    },

    // Reflection Section (legacy - for non-enhanced)
    reflectionSection: {
      marginBottom: 20
    },
    reflectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    reflectionBlock: {
      marginBottom: 16
    },
    reflectionQuestion: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.secondary,
      marginBottom: 6
    },
    reflectionAnswer: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.5,
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: colors.secondary
    },

    // Enhanced Results - Quote Callout
    quoteCallout: {
      backgroundColor: colors.backgroundSubtle,
      borderLeftWidth: 3,
      borderLeftColor: colors.secondary,
      padding: 12,
      marginVertical: 12,
      borderRadius: 4
    },
    quoteText: {
      fontSize: 11,
      fontStyle: 'italic',
      color: colors.text,
      lineHeight: 1.5,
      marginBottom: 6
    },
    quoteContext: {
      fontSize: 9,
      color: colors.textMuted
    },

    // Enhanced Results - Themes
    themesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 12,
      marginBottom: 16
    },
    themeTag: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 9,
      color: '#FFFFFF'
    },

    // Enhanced Results - Personalized Section
    personalizedSection: {
      marginBottom: 20
    },
    personalizedLabel: {
      fontSize: 9,
      color: colors.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8
    },
    personalizedNarrative: {
      fontSize: 11,
      color: colors.text,
      lineHeight: 1.6,
      marginBottom: 12
    },

    // Footer
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    footerText: {
      fontSize: 8,
      color: colors.textMuted
    },
    footerConfidential: {
      fontSize: 8,
      color: colors.textMuted,
      textAlign: 'center'
    },
    pageNumber: {
      fontSize: 8,
      color: colors.textMuted
    }
  })
}

// ============================================================================
// COMPONENT: PageHeader
// ============================================================================

interface PageHeaderProps {
  tenant: TenantProfile
  clientName: string
  styles: ReturnType<typeof createStyles>
  logoUrl?: string | null // Pre-validated logo URL
}

function PageHeader({ tenant, clientName, styles, logoUrl }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        {logoUrl ? (
          <Image
            src={logoUrl}
            style={styles.headerLogo}
          />
        ) : (
          <Text style={styles.headerText}>{tenant.display_name}</Text>
        )}
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerLabel}>Results for</Text>
        <Text style={styles.headerName}>{clientName}</Text>
      </View>
    </View>
  )
}

// ============================================================================
// COMPONENT: PageFooter
// ============================================================================

interface PageFooterProps {
  tenant: TenantProfile
  generatedDate: string
  styles: ReturnType<typeof createStyles>
  pdfFooterText?: string
}

function PageFooter({ tenant, generatedDate, styles, pdfFooterText }: PageFooterProps) {
  const footerLabel = pdfFooterText || tenant.display_name
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{footerLabel}</Text>
      <Text style={styles.footerConfidential}>Your results are confidential</Text>
      <Text style={styles.footerText}>{generatedDate}</Text>
    </View>
  )
}

// ============================================================================
// COMPONENT: ArchetypeCard
// ============================================================================

interface ArchetypeCardProps {
  archetype: NonNullable<ResultsResponse['results']>['primary_archetype']
  label: string
  description: string
  personalizedNarrative?: string
  styles: ReturnType<typeof createStyles>
  colors: BrandColors
}

function ArchetypeCard({ archetype, label, description, personalizedNarrative, styles, colors }: ArchetypeCardProps) {
  return (
    <View style={styles.archetypeCard}>
      {/* Header */}
      <View style={styles.archetypeHeader}>
        <Text style={styles.archetypeLabel}>{label}</Text>
        <Text style={styles.archetypeTitle}>The {archetype.name}</Text>
      </View>

      {/* Content */}
      <View style={styles.archetypeContent}>
        {/* Use personalized narrative if available, otherwise use generic description */}
        {personalizedNarrative ? (
          <View style={styles.personalizedSection}>
            <Text style={styles.personalizedLabel}>Your Personalized Insight</Text>
            <Text style={styles.personalizedNarrative}>{personalizedNarrative}</Text>
          </View>
        ) : (
          <Text style={styles.archetypeDescription}>{description}</Text>
        )}

        {/* Core Traits */}
        <View style={styles.traitsSection}>
          <Text style={styles.sectionLabel}>Core Traits</Text>
          <View style={styles.traitsContainer}>
            {(archetype.core_traits || []).map((trait, index) => (
              <Text key={index} style={styles.trait}>{trait}</Text>
            ))}
          </View>
        </View>

        {/* When Grounded */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>When Grounded</Text>
          <Text style={styles.infoBoxText}>{archetype.when_grounded}</Text>
        </View>

        {/* Under Pressure */}
        <View style={styles.infoBox}>
          <Text style={{ ...styles.infoBoxTitle, color: colors.textMuted }}>Under Pressure</Text>
          <Text style={styles.infoBoxText}>{archetype.under_pressure}</Text>
        </View>

        {/* Watch For (Overuse Signals) */}
        <View style={styles.watchForSection}>
          <Text style={styles.sectionLabel}>Watch For (Signs of Overuse)</Text>
          {(archetype.overuse_signals || []).map((signal, index) => (
            <View key={index} style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{signal}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

// ============================================================================
// COMPONENT: ArchetypeCardCompact (Side-by-side layout)
// ============================================================================

interface ArchetypeCardCompactProps {
  archetype: NonNullable<ResultsResponse['results']>['primary_archetype']
  label: string
  description: string
  styles: ReturnType<typeof createStyles>
  colors: BrandColors
}

function ArchetypeCardCompact({ archetype, label, description, styles, colors }: ArchetypeCardCompactProps) {
  return (
    <View style={styles.archetypeCardCompact}>
      {/* Header */}
      <View style={styles.archetypeHeaderCompact}>
        <Text style={styles.archetypeLabelCompact}>{label}</Text>
        <Text style={styles.archetypeTitleCompact}>The {archetype.name}</Text>
      </View>

      {/* Content */}
      <View style={styles.archetypeContentCompact}>
        <Text style={styles.archetypeDescriptionCompact}>{description}</Text>

        {/* Core Traits */}
        <View style={styles.traitsSectionCompact}>
          <Text style={styles.sectionLabelCompact}>Core Traits</Text>
          <View style={styles.traitsContainerCompact}>
            {(archetype.core_traits || []).map((trait, index) => (
              <Text key={index} style={styles.traitCompact}>{trait}</Text>
            ))}
          </View>
        </View>

        {/* When Grounded */}
        <View style={styles.infoBoxCompact}>
          <Text style={styles.infoBoxTitleCompact}>When Grounded</Text>
          <Text style={styles.infoBoxTextCompact}>{archetype.when_grounded}</Text>
        </View>

        {/* Under Pressure */}
        <View style={styles.infoBoxCompact}>
          <Text style={{ ...styles.infoBoxTitleCompact, color: colors.textMuted }}>Under Pressure</Text>
          <Text style={styles.infoBoxTextCompact}>{archetype.under_pressure}</Text>
        </View>

        {/* Watch For (Overuse Signals) */}
        <View style={styles.watchForSectionCompact}>
          <Text style={styles.sectionLabelCompact}>Watch For</Text>
          {(archetype.overuse_signals || []).slice(0, 3).map((signal, index) => (
            <View key={index} style={styles.bulletItemCompact}>
              <View style={styles.bulletDotCompact} />
              <Text style={styles.bulletTextCompact}>{signal}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

// ============================================================================
// COMPONENT: TensionPatternCard
// ============================================================================

interface TensionPatternCardProps {
  tensionPattern: NonNullable<ResultsResponse['results']>['tension_pattern']
  primaryArchetype: string
  authenticArchetype: string
  styles: ReturnType<typeof createStyles>
  colors: BrandColors
}

function TensionPatternCard({
  tensionPattern,
  primaryArchetype,
  authenticArchetype,
  styles,
  colors
}: TensionPatternCardProps) {
  if (!tensionPattern.has_tension) return null

  return (
    <View style={styles.tensionCard}>
      {/* Header */}
      <View style={styles.tensionHeader}>
        <View style={styles.tensionIconContainer}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="M8 7h12M20 7l-4-4m4 4l-4 4M16 17H4M4 17l4 4m-4-4l4-4"
              stroke={colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
        <View>
          <Text style={styles.tensionTitle}>Your Tension Pattern</Text>
          <Text style={styles.tensionSubtitle}>
            {primaryArchetype} under pressure vs {authenticArchetype} when grounded
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.tensionContent}>
        {/* Description */}
        {tensionPattern.description && (
          <View style={styles.tensionDescription}>
            <Text style={styles.tensionDescriptionText}>{tensionPattern.description}</Text>
          </View>
        )}

        {/* What This Means */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ ...styles.sectionLabel, color: colors.secondary }}>What This Means</Text>
          <Text style={{ fontSize: 10, color: colors.text, lineHeight: 1.5 }}>
            When you're under pressure, you naturally lean into {primaryArchetype} energy - this is adaptive and has served you well. But your authentic self thrives with {authenticArchetype} energy. The goal isn't to eliminate your default response, but to create more choice about when and how you use each.
          </Text>
        </View>

        {/* Triggers */}
        {tensionPattern.triggers && Array.isArray(tensionPattern.triggers) && tensionPattern.triggers.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ ...styles.sectionLabel, color: colors.secondary }}>Common Triggers</Text>
            {tensionPattern.triggers.map((trigger, index) => (
              <View key={index} style={styles.bulletItem}>
                <View style={styles.tensionTriggerNumber}>
                  <Text style={styles.tensionTriggerNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.bulletText}>{trigger}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reassurance Note */}
        <View style={styles.tensionNote}>
          <View style={styles.tensionNoteIcon}>
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Circle cx={12} cy={12} r={10} stroke={colors.secondary} strokeWidth={2} fill="none" />
              <Path d="M12 16v-4M12 8h.01" stroke={colors.secondary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.tensionNoteText}>
            This tension is common among leaders and is not a flaw - it's a pattern that developed for good reasons. Understanding it is the first step toward leading with greater intention and sustainability.
          </Text>
        </View>
      </View>
    </View>
  )
}

// ============================================================================
// COMPONENT: MovingForwardSection
// ============================================================================

interface MovingForwardSectionProps {
  primaryArchetype: string
  authenticArchetype: string
  hasTension: boolean
  tenantName: string
  personalizedGuidance?: string
  styles: ReturnType<typeof createStyles>
}

function MovingForwardSection({
  primaryArchetype,
  authenticArchetype,
  hasTension,
  tenantName,
  personalizedGuidance,
  styles
}: MovingForwardSectionProps) {
  return (
    <View style={styles.movingForwardCard}>
      <Text style={styles.movingForwardTitle}>Moving Forward</Text>

      {/* Use personalized guidance if available */}
      {personalizedGuidance ? (
        <View style={styles.personalizedSection}>
          <Text style={styles.personalizedLabel}>Personalized Guidance</Text>
          <Text style={styles.personalizedNarrative}>{personalizedGuidance}</Text>
        </View>
      ) : (
        <Text style={styles.movingForwardIntro}>
          Understanding your leadership archetype is the first step toward leading with greater intention and sustainability.
        </Text>
      )}

      {/* Step 1 */}
      <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Recognize your patterns</Text>
          <Text style={styles.stepDescription}>
            Notice when you default to {primaryArchetype} energy under pressure. These patterns developed for good reasons.
          </Text>
        </View>
      </View>

      {/* Step 2 */}
      <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>
            {hasTension ? 'Bridge the gap' : 'Strengthen your strengths'}
          </Text>
          <Text style={styles.stepDescription}>
            {hasTension
              ? `Work on accessing your ${authenticArchetype} energy even when stressed.`
              : `Your natural alignment is a gift. Focus on sustainable ways to leverage your ${primaryArchetype} strengths.`}
          </Text>
        </View>
      </View>

      {/* Step 3 */}
      <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>3</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Continue the conversation</Text>
          <Text style={styles.stepDescription}>
            {tenantName} can help you explore these patterns further and develop strategies for sustainable leadership.
          </Text>
        </View>
      </View>
    </View>
  )
}

// ============================================================================
// COMPONENT: ReflectionSection
// ============================================================================

interface ReflectionSectionProps {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  styles: ReturnType<typeof createStyles>
}

function ReflectionSection({ messages, styles }: ReflectionSectionProps) {
  if (!messages || messages.length === 0) return null

  // Pair up assistant questions with user answers
  const pairs: Array<{ question: string; answer: string }> = []
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === 'assistant' && messages[i + 1]?.role === 'user') {
      pairs.push({
        question: messages[i].content,
        answer: messages[i + 1].content
      })
      i++ // Skip the user message since we've paired it
    }
  }

  if (pairs.length === 0) return null

  return (
    <View style={styles.reflectionSection}>
      <Text style={styles.reflectionTitle}>Your Reflections</Text>
      {pairs.map((pair, index) => (
        <View key={index} style={styles.reflectionBlock}>
          <Text style={styles.reflectionQuestion}>Q: {pair.question}</Text>
          <Text style={styles.reflectionAnswer}>{pair.answer}</Text>
        </View>
      ))}
    </View>
  )
}

// ============================================================================
// COMPONENT: QuoteCallout (Enhanced Results)
// ============================================================================

interface QuoteCalloutProps {
  quote: string
  context: string
  styles: ReturnType<typeof createStyles>
}

function QuoteCallout({ quote, context, styles }: QuoteCalloutProps) {
  return (
    <View style={styles.quoteCallout}>
      <Text style={styles.quoteText}>"{quote}"</Text>
      <Text style={styles.quoteContext}>{context}</Text>
    </View>
  )
}

// ============================================================================
// COMPONENT: ReflectionThemes (Enhanced Results)
// ============================================================================

interface ReflectionThemesProps {
  themes: string[]
  styles: ReturnType<typeof createStyles>
}

function ReflectionThemes({ themes, styles }: ReflectionThemesProps) {
  if (!themes || themes.length === 0) return null

  return (
    <View style={styles.themesContainer}>
      {themes.map((theme, index) => (
        <Text key={index} style={styles.themeTag}>{theme}</Text>
      ))}
    </View>
  )
}

// ============================================================================
// MAIN DOCUMENT COMPONENT
// ============================================================================

export function ArchetypeResultsPDF({ data }: { data: ArchetypeResultsPDFData }) {
  const { session, results, tenant, reflectionMessages, enhancedResults, generatedDate, validatedLogoUrl, pdfFooterText } = data
  const colors = getBrandColors(tenant)
  const styles = createStyles(colors)

  const primaryArchetypeName = results.primary_archetype.name
  const authenticArchetypeName = results.authentic_archetype.name
  const hasTension = results.tension_pattern.has_tension

  // Check if we have enhanced results
  const isEnhanced = !!enhancedResults

  return (
    <Document>
      {/* Page 1: Both Archetypes Side-by-Side */}
      <Page size="A4" style={styles.page}>
        <PageHeader tenant={tenant} clientName={session.client_name} styles={styles} logoUrl={validatedLogoUrl} />

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Leadership Archetype</Text>
          <Text style={styles.heroSubtitle}>
            {isEnhanced
              ? 'Your personalized leadership insights, enriched by your reflections.'
              : 'Based on your responses, here\'s what we discovered about your natural leadership patterns.'
            }
          </Text>
        </View>

        {/* Reflection Themes (if enhanced) */}
        {isEnhanced && enhancedResults.reflectionThemes && (
          <ReflectionThemes themes={enhancedResults.reflectionThemes} styles={styles} />
        )}

        {/* Side-by-Side Archetype Cards */}
        <View style={styles.archetypesRow}>
          {/* Default Archetype Under Pressure */}
          <ArchetypeCardCompact
            archetype={results.primary_archetype}
            label="Default Archetype Under Pressure"
            description="How you respond when pressure is high."
            styles={styles}
            colors={colors}
          />

          {/* Authentic Archetype When Grounded */}
          <ArchetypeCardCompact
            archetype={results.authentic_archetype}
            label="Authentic Archetype When Grounded"
            description="Your most sustainable leadership style."
            styles={styles}
            colors={colors}
          />
        </View>

        {/* Quote Callout (first quote on page 1 if enhanced) */}
        {isEnhanced && enhancedResults.meaningfulQuotes?.[0] && (
          <QuoteCallout
            quote={enhancedResults.meaningfulQuotes[0].quote}
            context={enhancedResults.meaningfulQuotes[0].context}
            styles={styles}
          />
        )}

        <PageFooter tenant={tenant} generatedDate={generatedDate} styles={styles} pdfFooterText={pdfFooterText} />
      </Page>

      {/* Page 2: Tension Pattern (if exists) + Personalized Insights */}
      {hasTension && (
        <Page size="A4" style={styles.page}>
          <PageHeader tenant={tenant} clientName={session.client_name} styles={styles} logoUrl={validatedLogoUrl} />

          {/* Tension Pattern */}
          <TensionPatternCard
            tensionPattern={results.tension_pattern}
            primaryArchetype={primaryArchetypeName}
            authenticArchetype={authenticArchetypeName}
            styles={styles}
            colors={colors}
          />

          {/* Personalized Narratives (if enhanced) */}
          {isEnhanced && enhancedResults.personalizedDefaultNarrative && (
            <View style={styles.personalizedSection}>
              <Text style={styles.personalizedLabel}>Your {primaryArchetypeName} Insight</Text>
              <Text style={styles.personalizedNarrative}>{enhancedResults.personalizedDefaultNarrative}</Text>
            </View>
          )}

          {isEnhanced && enhancedResults.personalizedAuthenticNarrative && (
            <View style={styles.personalizedSection}>
              <Text style={styles.personalizedLabel}>Your {authenticArchetypeName} Insight</Text>
              <Text style={styles.personalizedNarrative}>{enhancedResults.personalizedAuthenticNarrative}</Text>
            </View>
          )}

          {/* Personalized Tension Insights (if enhanced) */}
          {isEnhanced && enhancedResults.personalizedTensionInsights && (
            <View style={styles.personalizedSection}>
              <Text style={styles.personalizedLabel}>Your Personalized Tension Insight</Text>
              <Text style={styles.personalizedNarrative}>{enhancedResults.personalizedTensionInsights}</Text>
            </View>
          )}

          {/* Quote Callout (second quote on page 2 if enhanced) */}
          {isEnhanced && enhancedResults.meaningfulQuotes?.[1] && (
            <QuoteCallout
              quote={enhancedResults.meaningfulQuotes[1].quote}
              context={enhancedResults.meaningfulQuotes[1].context}
              styles={styles}
            />
          )}

          <PageFooter tenant={tenant} generatedDate={generatedDate} styles={styles} pdfFooterText={pdfFooterText} />
        </Page>
      )}

      {/* Page 3 (or 2 if no tension): Moving Forward */}
      <Page size="A4" style={styles.page}>
        <PageHeader tenant={tenant} clientName={session.client_name} styles={styles} logoUrl={validatedLogoUrl} />

        {/* Moving Forward - with personalized guidance if enhanced */}
        <MovingForwardSection
          primaryArchetype={primaryArchetypeName}
          authenticArchetype={authenticArchetypeName}
          hasTension={hasTension}
          tenantName={tenant.display_name}
          personalizedGuidance={enhancedResults?.personalizedGuidance}
          styles={styles}
        />

        {/* Legacy Reflections - ONLY show if NOT enhanced (fallback for old sessions) */}
        {!isEnhanced && reflectionMessages && reflectionMessages.length > 0 && (
          <ReflectionSection messages={reflectionMessages} styles={styles} />
        )}

        <PageFooter tenant={tenant} generatedDate={generatedDate} styles={styles} pdfFooterText={pdfFooterText} />
      </Page>
    </Document>
  )
}
