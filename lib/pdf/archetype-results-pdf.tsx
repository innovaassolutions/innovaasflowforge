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

export interface ArchetypeResultsPDFData {
  session: NonNullable<ResultsResponse['session']>
  results: NonNullable<ResultsResponse['results']>
  tenant: TenantProfile
  reflectionMessages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  generatedDate: string
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
  const colors = tenant.brand_config.colors
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

    // Reflection Section
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
}

function PageHeader({ tenant, clientName, styles }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        {tenant.brand_config.logo?.url ? (
          <Image
            src={tenant.brand_config.logo.url}
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
}

function PageFooter({ tenant, generatedDate, styles }: PageFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{tenant.display_name}</Text>
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
  styles: ReturnType<typeof createStyles>
  colors: BrandColors
}

function ArchetypeCard({ archetype, label, description, styles, colors }: ArchetypeCardProps) {
  return (
    <View style={styles.archetypeCard}>
      {/* Header */}
      <View style={styles.archetypeHeader}>
        <Text style={styles.archetypeLabel}>{label}</Text>
        <Text style={styles.archetypeTitle}>The {archetype.name}</Text>
      </View>

      {/* Content */}
      <View style={styles.archetypeContent}>
        <Text style={styles.archetypeDescription}>{description}</Text>

        {/* Core Traits */}
        <View style={styles.traitsSection}>
          <Text style={styles.sectionLabel}>Core Traits</Text>
          <View style={styles.traitsContainer}>
            {archetype.core_traits.map((trait, index) => (
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
          {archetype.overuse_signals.map((signal, index) => (
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
        {tensionPattern.triggers && tensionPattern.triggers.length > 0 && (
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
  styles: ReturnType<typeof createStyles>
}

function MovingForwardSection({
  primaryArchetype,
  authenticArchetype,
  hasTension,
  tenantName,
  styles
}: MovingForwardSectionProps) {
  return (
    <View style={styles.movingForwardCard}>
      <Text style={styles.movingForwardTitle}>Moving Forward</Text>
      <Text style={styles.movingForwardIntro}>
        Understanding your leadership archetype is the first step toward leading with greater intention and sustainability.
      </Text>

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
// MAIN DOCUMENT COMPONENT
// ============================================================================

export function ArchetypeResultsPDF({ data }: { data: ArchetypeResultsPDFData }) {
  const { session, results, tenant, reflectionMessages, generatedDate } = data
  const colors = getBrandColors(tenant)
  const styles = createStyles(colors)

  const primaryArchetypeName = results.primary_archetype.name
  const authenticArchetypeName = results.authentic_archetype.name
  const hasTension = results.tension_pattern.has_tension

  return (
    <Document>
      {/* Page 1: Main Results */}
      <Page size="A4" style={styles.page}>
        <PageHeader tenant={tenant} clientName={session.client_name} styles={styles} />

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Leadership Archetype</Text>
          <Text style={styles.heroSubtitle}>
            Based on your responses, here's what we discovered about your natural leadership patterns.
          </Text>
        </View>

        {/* Primary Archetype */}
        <ArchetypeCard
          archetype={results.primary_archetype}
          label="Your Primary Archetype"
          description="This is how you naturally respond when pressure is high and things feel messy."
          styles={styles}
          colors={colors}
        />

        <PageFooter tenant={tenant} generatedDate={generatedDate} styles={styles} />
      </Page>

      {/* Page 2: Tension Pattern (if exists) + Authentic Archetype */}
      {hasTension && (
        <Page size="A4" style={styles.page}>
          <PageHeader tenant={tenant} clientName={session.client_name} styles={styles} />

          {/* Tension Pattern */}
          <TensionPatternCard
            tensionPattern={results.tension_pattern}
            primaryArchetype={primaryArchetypeName}
            authenticArchetype={authenticArchetypeName}
            styles={styles}
            colors={colors}
          />

          {/* Authentic Archetype */}
          <ArchetypeCard
            archetype={results.authentic_archetype}
            label="Your Authentic Archetype"
            description="This is the leadership style that feels most sustainable and energizing when you're at your best."
            styles={styles}
            colors={colors}
          />

          <PageFooter tenant={tenant} generatedDate={generatedDate} styles={styles} />
        </Page>
      )}

      {/* Page 3 (or 2 if no tension): Moving Forward + Reflections */}
      <Page size="A4" style={styles.page}>
        <PageHeader tenant={tenant} clientName={session.client_name} styles={styles} />

        {/* Moving Forward */}
        <MovingForwardSection
          primaryArchetype={primaryArchetypeName}
          authenticArchetype={authenticArchetypeName}
          hasTension={hasTension}
          tenantName={tenant.display_name}
          styles={styles}
        />

        {/* Reflections (if completed) */}
        {reflectionMessages && reflectionMessages.length > 0 && (
          <ReflectionSection messages={reflectionMessages} styles={styles} />
        )}

        <PageFooter tenant={tenant} generatedDate={generatedDate} styles={styles} />
      </Page>
    </Document>
  )
}
