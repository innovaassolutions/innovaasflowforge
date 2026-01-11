/**
 * Coaching Invitation Email Template
 *
 * Branded email inviting a client to complete their archetype assessment.
 *
 * Story: 3-3-registration-sessions
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

interface CoachingInvitationEmailProps {
  participantName: string
  coachName: string
  coachEmail: string
  sessionUrl: string
  brandConfig: {
    logo?: { url: string; alt?: string }
    colors?: {
      primary?: string
      background?: string
      text?: string
      textMuted?: string
    }
    tagline?: string
    welcomeMessage?: string
  }
  emailConfig?: {
    senderName?: string
    emailFooter?: string
  }
}

export function CoachingInvitationEmail({
  participantName,
  coachName,
  coachEmail,
  sessionUrl,
  brandConfig,
  emailConfig,
}: CoachingInvitationEmailProps) {
  const primaryColor = brandConfig.colors?.primary || '#1a1a2e'
  const backgroundColor = brandConfig.colors?.background || '#ffffff'
  const textColor = brandConfig.colors?.text || '#333333'
  const mutedColor = brandConfig.colors?.textMuted || '#666666'

  const previewText = `${coachName} has invited you to complete your Leadership Archetype Assessment`

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
              {coachName} has invited you to complete your Leadership Archetype Assessment.
            </Text>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              {brandConfig.welcomeMessage ||
                'This assessment will help you discover your authentic leadership style and how it shows up under pressure. The conversation takes about 15-20 minutes and there are no right or wrong answers.'}
            </Text>

            {/* CTA Button */}
            <Section style={styles.buttonContainer}>
              <Button
                href={sessionUrl}
                style={{ ...styles.button, backgroundColor: primaryColor }}
              >
                Start Your Assessment
              </Button>
            </Section>

            <Text style={{ ...styles.smallText, color: mutedColor }}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={{ ...styles.link, color: primaryColor }}>
              <Link href={sessionUrl} style={{ color: primaryColor }}>
                {sessionUrl}
              </Link>
            </Text>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              You can close the session at any time and return later using the same link.
              Your responses are confidential.
            </Text>

            <Text style={{ ...styles.paragraph, color: textColor }}>
              If you have any questions, feel free to reach out to{' '}
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
              Assessment platform powered by{' '}
              <Link
                href="https://flowforge.innovaas.co"
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

export default CoachingInvitationEmail
