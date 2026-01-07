/**
 * Archetype Results Email Template
 *
 * Branded email sent to participants with their results PDF attached.
 * Includes thank you message, return link, and optional booking CTA.
 *
 * Story: 1.3 Email & PDF
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

interface ArchetypeResultsEmailProps {
  participantName: string
  coachName: string
  coachEmail: string
  resultsUrl: string
  archetypeName: string
  hasTension: boolean
  brandConfig: {
    logo?: { url: string; alt?: string }
    colors?: {
      primary?: string
      secondary?: string
      background?: string
      text?: string
      textMuted?: string
    }
    tagline?: string
    completionMessage?: string
  }
  emailConfig?: {
    senderName?: string
    emailFooter?: string
  }
  bookingConfig?: {
    enabled: boolean
    url?: string
    ctaText?: string
  }
}

export function ArchetypeResultsEmail({
  participantName,
  coachName,
  coachEmail,
  resultsUrl,
  archetypeName,
  hasTension,
  brandConfig,
  emailConfig,
  bookingConfig,
}: ArchetypeResultsEmailProps) {
  const primaryColor = brandConfig.colors?.primary || '#1a1a2e'
  const secondaryColor = brandConfig.colors?.secondary || '#1D9BA3'
  const backgroundColor = brandConfig.colors?.background || '#ffffff'
  const textColor = brandConfig.colors?.text || '#333333'
  const mutedColor = brandConfig.colors?.textMuted || '#666666'

  const previewText = `Your Leadership Archetype Results from ${coachName}`

  const defaultCompletionMessage = hasTension
    ? `Thank you for completing your Leadership Archetype Assessment! Your results reveal that you're a ${archetypeName} under pressure, with a different style when you're at your best. This tension is common and understanding it is key to sustainable leadership.`
    : `Thank you for completing your Leadership Archetype Assessment! Your results reveal that you're naturally a ${archetypeName} - and this shows up consistently whether you're under pressure or at your best. This alignment is a real strength.`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ ...styles.body, backgroundColor }}>
        <Container style={styles.container}>
          {/* Header with Logo */}
          <Section style={styles.header}>
            {brandConfig.logo?.url ? (
              <Img
                src={brandConfig.logo.url.startsWith('/')
                  ? `${process.env.NEXT_PUBLIC_APP_URL}${brandConfig.logo.url}`
                  : brandConfig.logo.url
                }
                alt={brandConfig.logo.alt || coachName}
                width={180}
                height={60}
                style={styles.logo}
              />
            ) : (
              <Heading style={{ ...styles.brandName, color: primaryColor }}>
                {coachName}
              </Heading>
            )}
            {brandConfig.tagline && (
              <Text style={{ ...styles.tagline, color: mutedColor }}>
                {brandConfig.tagline}
              </Text>
            )}
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={{ ...styles.heading, color: textColor }}>
              Hello {participantName},
            </Heading>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              {brandConfig.completionMessage || defaultCompletionMessage}
            </Text>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              Your detailed results are attached as a PDF. You can also view them online anytime using the link below.
            </Text>

            {/* View Results Button */}
            <Section style={styles.buttonContainer}>
              <Button
                href={resultsUrl}
                style={{ ...styles.button, backgroundColor: primaryColor }}
              >
                View Your Results
              </Button>
            </Section>

            <Text style={{ ...styles.smallText, color: mutedColor }}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={{ ...styles.link, color: primaryColor }}>
              <Link href={resultsUrl} style={{ color: primaryColor }}>
                {resultsUrl}
              </Link>
            </Text>

            {/* Booking CTA (if enabled) */}
            {bookingConfig?.enabled && bookingConfig.url && (
              <Section style={styles.bookingSection}>
                <Text style={{ ...styles.bookingText, color: textColor }}>
                  Ready to explore your results further?
                </Text>
                <Button
                  href={bookingConfig.url}
                  style={{ ...styles.secondaryButton, backgroundColor: secondaryColor }}
                >
                  {bookingConfig.ctaText || 'Book a Session'}
                </Button>
              </Section>
            )}

            <Text style={{ ...styles.paragraph, color: textColor }}>
              If you have any questions about your results, feel free to reach out to{' '}
              <Link href={`mailto:${coachEmail}`} style={{ color: primaryColor }}>
                {coachEmail}
              </Link>
              .
            </Text>

            <Text style={{ ...styles.signature, color: textColor }}>
              Best regards,
              <br />
              {coachName}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={{ ...styles.footerText, color: mutedColor }}>
              {emailConfig?.emailFooter || `Sent by ${coachName}`}
            </Text>
            <Text style={{ ...styles.footerText, color: mutedColor }}>
              Your results are confidential and available via your unique link.
            </Text>
            <Text style={{ ...styles.footerText, color: mutedColor }}>
              Assessment platform powered by{' '}
              <Link
                href="https://www.innovaas.co/flowforge"
                style={{ color: mutedColor }}
              >
                Innovaas FlowForge
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
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
    marginBottom: '40px',
  },
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  brandName: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0',
  },
  tagline: {
    fontSize: '14px',
    margin: '8px 0 0',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    border: '1px solid #e2e8f0',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 24px',
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    display: 'inline-block',
  },
  secondaryButton: {
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
    margin: '0 0 8px',
    textAlign: 'center' as const,
  },
  link: {
    fontSize: '12px',
    wordBreak: 'break-all' as const,
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  bookingSection: {
    textAlign: 'center' as const,
    margin: '32px 0',
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  bookingText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 16px',
  },
  signature: {
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '32px 0 0',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '40px',
  },
  footerText: {
    fontSize: '12px',
    margin: '0 0 8px',
  },
}

export default ArchetypeResultsEmail
