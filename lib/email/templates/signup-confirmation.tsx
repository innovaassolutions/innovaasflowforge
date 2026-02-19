/**
 * Signup Confirmation Email Template
 *
 * Branded email sent via Resend when a user self-registers.
 * Contains a confirmation link to verify their email address.
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

interface SignupConfirmationEmailProps {
  fullName: string
  email: string
  confirmationUrl: string
  accountType: string
}

export function SignupConfirmationEmail({
  fullName,
  email,
  confirmationUrl,
  accountType,
}: SignupConfirmationEmailProps) {
  const accountLabel =
    accountType === 'company' ? 'Company' :
    accountType === 'coach' ? 'Coach' : 'Consultant'

  return (
    <Html>
      <Head />
      <Preview>Confirm your FlowForge account</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header with Logo */}
          <Section style={styles.header}>
            <Img
              src="https://flowforge.innovaas.co/icon-orb.svg"
              alt="FlowForge"
              width={60}
              height={60}
              style={styles.logo}
            />
            <Heading style={styles.brandName}>FlowForge</Heading>
            <Text style={styles.tagline}>Assessment Platform</Text>
          </Section>

          {/* Content Card */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Welcome, {fullName}!
            </Heading>

            <Text style={styles.paragraph}>
              Thank you for creating a <strong>{accountLabel}</strong> account on FlowForge.
              Please confirm your email address to activate your account.
            </Text>

            <Text style={styles.paragraph}>
              Click the button below to verify <strong>{email}</strong>.
            </Text>

            {/* CTA Button */}
            <Section style={styles.buttonContainer}>
              <Button href={confirmationUrl} style={styles.button}>
                Confirm Email Address
              </Button>
            </Section>

            <Text style={styles.smallText}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={styles.link}>
              <Link href={confirmationUrl} style={styles.linkAnchor}>
                {confirmationUrl}
              </Link>
            </Text>

            <Text style={styles.muted}>
              If you did not create this account, you can safely ignore this email.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              FlowForge Assessment Platform
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
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: 0,
    padding: 0,
    backgroundColor: '#FFFEFB',
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
    color: '#171614',
    margin: '0',
  },
  tagline: {
    fontSize: '14px',
    color: '#71706B',
    margin: '8px 0 0',
  },
  content: {
    backgroundColor: '#FAF8F3',
    borderRadius: '12px',
    padding: '32px',
    border: '1px solid #E6E2D6',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#171614',
    margin: '0 0 16px',
  },
  paragraph: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#71706B',
    margin: '0 0 16px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#F25C05',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    padding: '14px 36px',
  },
  smallText: {
    fontSize: '12px',
    color: '#71706B',
    margin: '0 0 8px',
    textAlign: 'center' as const,
  },
  link: {
    fontSize: '12px',
    wordBreak: 'break-all' as const,
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  linkAnchor: {
    color: '#F25C05',
  },
  muted: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#71706B',
    margin: '0',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #E6E2D6',
  },
  footerText: {
    fontSize: '12px',
    color: '#71706B',
    margin: '0',
  },
}

export default SignupConfirmationEmail
