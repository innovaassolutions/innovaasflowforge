/**
 * Pricing Change Alert Email Template
 *
 * Email sent to platform admins when AI model pricing changes are detected.
 *
 * Story: billing-6-2-pricing-change-alerts
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components'

interface PriceChange {
  modelId: string
  displayName: string
  provider: string
  oldInputRate: number | null
  oldOutputRate: number | null
  newInputRate: number
  newOutputRate: number
  inputChangePercent: number | null
  outputChangePercent: number | null
  changeType: 'update' | 'new_model' | 'manual'
}

interface PricingChangeAlertEmailProps {
  adminName: string
  changes: PriceChange[]
  dashboardUrl: string
  syncedAt: string
}

export function PricingChangeAlertEmail({
  adminName,
  changes,
  dashboardUrl,
  syncedAt,
}: PricingChangeAlertEmailProps) {
  const primaryColor = '#F25C05' // FlowForge accent
  const backgroundColor = '#FFFEFB'
  const textColor = '#171614'
  const mutedColor = '#71706B'
  const borderColor = '#E6E2D6'

  const previewText = `AI Pricing Alert: ${changes.length} model(s) have pricing changes requiring review`

  // Group changes by provider
  const changesByProvider = changes.reduce((acc, change) => {
    if (!acc[change.provider]) {
      acc[change.provider] = []
    }
    acc[change.provider].push(change)
    return acc
  }, {} as Record<string, PriceChange[]>)

  const formatRate = (rate: number) => `$${rate.toFixed(2)}`
  const formatPercent = (percent: number | null) => {
    if (percent === null) return 'N/A'
    const sign = percent >= 0 ? '+' : ''
    return `${sign}${percent.toFixed(1)}%`
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ ...styles.body, backgroundColor }}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL || 'https://flowforge.innovaas.co'}/icon-orb.svg`}
              alt="FlowForge"
              width={48}
              height={48}
              style={styles.logo}
            />
            <Heading style={{ ...styles.brandName, color: textColor }}>
              FlowForge
            </Heading>
            <Text style={{ ...styles.tagline, color: mutedColor }}>
              OPEX Assessment Platform
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={{ ...styles.content, borderColor }}>
            <Heading style={{ ...styles.heading, color: textColor }}>
              AI Pricing Changes Detected
            </Heading>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              Hi {adminName},
            </Text>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              Our automated pricing sync has detected the following changes to AI model pricing.
              Please review these changes and ensure your subscription tiers maintain healthy margins.
            </Text>

            {/* Changes by Provider */}
            {Object.entries(changesByProvider).map(([provider, providerChanges]) => (
              <Section key={provider} style={styles.providerSection}>
                <Heading style={{ ...styles.providerHeading, color: primaryColor }}>
                  {provider.toUpperCase()}
                </Heading>

                {providerChanges.map((change) => (
                  <Section
                    key={change.modelId}
                    style={{ ...styles.changeCard, borderColor }}
                  >
                    <Text style={{ ...styles.modelName, color: textColor }}>
                      {change.displayName}
                      {change.changeType === 'new_model' && (
                        <span style={styles.newBadge}> NEW</span>
                      )}
                    </Text>
                    <Text style={{ ...styles.modelId, color: mutedColor }}>
                      {change.modelId}
                    </Text>

                    {/* Rates Table */}
                    <table style={styles.rateTable}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, color: mutedColor }}>Rate</th>
                          <th style={{ ...styles.th, color: mutedColor }}>Previous</th>
                          <th style={{ ...styles.th, color: mutedColor }}>Current</th>
                          <th style={{ ...styles.th, color: mutedColor }}>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ ...styles.td, color: textColor }}>Input (per 1M)</td>
                          <td style={{ ...styles.td, color: mutedColor }}>
                            {change.oldInputRate !== null
                              ? formatRate(change.oldInputRate)
                              : '—'}
                          </td>
                          <td style={{ ...styles.td, color: textColor, fontWeight: '600' }}>
                            {formatRate(change.newInputRate)}
                          </td>
                          <td style={{
                            ...styles.td,
                            color: change.inputChangePercent && change.inputChangePercent < 0
                              ? '#16a34a'
                              : change.inputChangePercent && change.inputChangePercent > 0
                                ? '#dc2626'
                                : mutedColor
                          }}>
                            {formatPercent(change.inputChangePercent)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ ...styles.td, color: textColor }}>Output (per 1M)</td>
                          <td style={{ ...styles.td, color: mutedColor }}>
                            {change.oldOutputRate !== null
                              ? formatRate(change.oldOutputRate)
                              : '—'}
                          </td>
                          <td style={{ ...styles.td, color: textColor, fontWeight: '600' }}>
                            {formatRate(change.newOutputRate)}
                          </td>
                          <td style={{
                            ...styles.td,
                            color: change.outputChangePercent && change.outputChangePercent < 0
                              ? '#16a34a'
                              : change.outputChangePercent && change.outputChangePercent > 0
                                ? '#dc2626'
                                : mutedColor
                          }}>
                            {formatPercent(change.outputChangePercent)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Section>
                ))}
              </Section>
            ))}

            {/* CTA Button */}
            <Section style={styles.buttonContainer}>
              <Button
                href={dashboardUrl}
                style={{ ...styles.button, backgroundColor: primaryColor }}
              >
                Review Pricing Dashboard
              </Button>
            </Section>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              <strong>Action Required:</strong> Review your subscription tier pricing to ensure margins
              remain healthy after these provider rate changes.
            </Text>

            <Text style={{ ...styles.smallText, color: mutedColor }}>
              Sync completed at: {new Date(syncedAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={{ ...styles.footerText, color: mutedColor }}>
              This is an automated alert from FlowForge.
            </Text>
            <Text style={{ ...styles.footerText, color: mutedColor }}>
              <Link
                href="https://flowforge.innovaas.co"
                style={{ color: mutedColor }}
              >
                Innovaas FlowForge
              </Link>
              {' '}&bull;{' '}
              <Link
                href={dashboardUrl}
                style={{ color: mutedColor }}
              >
                Admin Dashboard
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  logo: {
    margin: '0 auto 16px',
    display: 'block',
  },
  brandName: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  tagline: {
    fontSize: '12px',
    margin: '4px 0 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    border: '1px solid',
  },
  heading: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 24px',
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  providerSection: {
    marginTop: '24px',
    marginBottom: '24px',
  },
  providerHeading: {
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 12px',
    letterSpacing: '0.05em',
  },
  changeCard: {
    backgroundColor: '#FAF8F3',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid',
  },
  modelName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px',
  },
  modelId: {
    fontSize: '12px',
    margin: '0 0 12px',
    fontFamily: 'monospace',
  },
  newBadge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '8px',
    textTransform: 'uppercase' as const,
  },
  rateTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '6px 8px',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  td: {
    padding: '6px 8px',
    borderTop: '1px solid #E6E2D6',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    display: 'inline-block',
  },
  smallText: {
    fontSize: '12px',
    margin: '16px 0 0',
    textAlign: 'center' as const,
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '32px',
  },
  footerText: {
    fontSize: '12px',
    margin: '0 0 4px',
  },
}

export default PricingChangeAlertEmail
