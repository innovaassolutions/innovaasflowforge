import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface StakeholderInvitationEmailProps {
  stakeholderName: string
  facilitatorName: string
  companyName: string
  campaignName: string
  stakeholderRole: string
  stakeholderTitle?: string
  accessLink: string
  estimatedTime?: string
}

export const StakeholderInvitationEmail = ({
  stakeholderName = 'Waqas',
  facilitatorName = 'Malcolm',
  companyName = 'Alimex ACP Asia',
  campaignName = 'Industry 4.0 Readiness Assessment',
  stakeholderRole = 'IT Operations Manager',
  stakeholderTitle,
  accessLink = 'https://flowforge.innovaas.com/session/abc123',
  estimatedTime = '20-30 minutes',
}: StakeholderInvitationEmailProps) => {
  const previewText = `${facilitatorName} has invited you to participate in ${companyName}'s ${campaignName}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Innovaas branding */}
          <Section style={header}>
            <Img
              src="https://flowforge.innovaas.com/innovaas-logo.png"
              alt="Innovaas"
              style={logo}
            />
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h1}>Your Input is Requested</Heading>

            <Text style={text}>
              Hi <strong>{stakeholderName}</strong>,
            </Text>

            <Text style={text}>
              {facilitatorName} has invited you to participate in{' '}
              <strong>{companyName}'s {campaignName}</strong>.
            </Text>

            <Section style={roleCard}>
              <Text style={roleLabel}>Your Role</Text>
              <Text style={roleValue}>
                {stakeholderTitle || stakeholderRole}
              </Text>
              {stakeholderTitle && (
                <Text style={roleSubValue}>{stakeholderRole}</Text>
              )}
              {estimatedTime && (
                <>
                  <Text style={roleLabel}>Estimated Time</Text>
                  <Text style={roleValue}>{estimatedTime}</Text>
                </>
              )}
            </Section>

            <Text style={text}>
              This AI-guided interview will help us understand your perspective on:
            </Text>

            <ul style={list}>
              <li style={listItem}>Current technology infrastructure and systems</li>
              <li style={listItem}>Data integration challenges and opportunities</li>
              <li style={listItem}>Operational bottlenecks and inefficiencies</li>
              <li style={listItem}>Opportunities for digital transformation</li>
            </ul>

            <Text style={text}>
              The interview is conversational and adapts to your responses. You can
              pause and resume at any time.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={accessLink}>
                Start Your Interview
              </Button>
            </Section>

            <Text style={linkText}>
              Or copy and paste this URL into your browser:{' '}
              <Link href={accessLink} style={link}>
                {accessLink}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This interview is powered by{' '}
              <Link href="https://innovaas.com" style={footerLink}>
                Innovaas Flow Forge
              </Link>
              , an AI-assisted business consulting platform.
            </Text>
            <Text style={footerText}>
              Questions? Contact{' '}
              <Link href="mailto:support@innovaas.com" style={footerLink}>
                support@innovaas.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default StakeholderInvitationEmail

// Styles using Innovaas + Catppuccin Mocha color scheme
const main = {
  backgroundColor: '#1e1e2e', // Mocha base
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#181825', // Mocha mantle
  borderRadius: '12px 12px 0 0',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const logo = {
  width: '180px',
  height: 'auto',
  margin: '0 auto',
}

const content = {
  backgroundColor: '#313244', // Mocha surface0
  borderRadius: '0 0 12px 12px',
  padding: '32px 40px',
}

const h1 = {
  color: '#F25C05', // Innovaas orange
  fontSize: '28px',
  fontWeight: '700' as const,
  margin: '0 0 24px',
  lineHeight: '1.3',
}

const text = {
  color: '#cdd6f4', // Mocha text
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const roleCard = {
  backgroundColor: '#45475a', // Mocha surface1
  borderLeft: '4px solid #F25C05', // Innovaas orange
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 0',
}

const roleLabel = {
  color: '#bac2de', // Mocha subtext1
  fontSize: '12px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const roleValue = {
  color: '#F25C05', // Innovaas orange
  fontSize: '18px',
  fontWeight: '700' as const,
  margin: '0 0 16px',
}

const roleSubValue = {
  color: '#a6adc8', // Mocha subtext0
  fontSize: '14px',
  margin: '0 0 16px',
}

const list = {
  color: '#cdd6f4',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
  paddingLeft: '20px',
}

const listItem = {
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#F25C05', // Innovaas orange
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  lineHeight: '1.5',
}

const linkText = {
  color: '#a6adc8', // Mocha subtext0
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#1D9BA3', // Innovaas teal
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const footer = {
  borderTop: '1px solid #45475a', // Mocha surface1
  marginTop: '32px',
  paddingTop: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6c7086', // Mocha overlay0
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '8px 0',
}

const footerLink = {
  color: '#1D9BA3', // Innovaas teal
  textDecoration: 'underline',
}
