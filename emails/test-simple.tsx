import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Text,
} from '@react-email/components'

interface SimpleEmailProps {
  name: string
  link: string
}

export const SimpleEmail = ({
  name = 'Test User',
  link = 'https://example.com',
}: SimpleEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px' }}>
          <Section>
            <Text>Hello {name}!</Text>
            <Text>This is a simple test email.</Text>
            <Button href={link} style={{ backgroundColor: '#007bff', color: '#fff', padding: '12px 20px' }}>
              Click Here
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SimpleEmail
