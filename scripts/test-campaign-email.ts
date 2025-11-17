/**
 * Test script to verify campaign email template rendering
 * Run with: npx tsx scripts/test-campaign-email.ts your-email@example.com
 */

import { Resend } from 'resend'
import { StakeholderInvitationEmail } from '../emails/stakeholder-invitation'
import { SimpleEmail } from '../emails/test-simple'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const RESEND_API_KEY = process.env.RESEND_API_KEY

async function testCampaignEmail() {
  console.log('🧪 Testing Campaign Email Template...\n')

  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set')
    process.exit(1)
  }

  const resend = new Resend(RESEND_API_KEY)
  const testEmail = process.argv[2] || 'delivered@resend.dev'

  // Test 1: Simple email first
  console.log('📧 Test 1: Sending simple email template...\n')

  try {
    const simpleResult = await resend.emails.send({
      from: 'Flow Forge <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Simple Test Email',
      react: SimpleEmail({
        name: 'Test User',
        link: 'http://localhost:3000'
      })
    })

    if (simpleResult.error) {
      console.error('❌ Simple email failed:', simpleResult.error)
    } else {
      console.log('✅ Simple email sent successfully!')
      console.log(`   Email ID: ${simpleResult.data?.id}\n`)
    }
  } catch (error: any) {
    console.error('❌ Simple email error:', error.message)
    console.log('The simple template failed, so the complex one will likely fail too.\n')
  }

  // Test 2: Campaign email
  console.log('📧 Test 2: Sending campaign template email...\n')

  const testData = {
    stakeholderName: 'John Doe',
    facilitatorName: 'Jane Smith',
    companyName: 'Test Company Inc.',
    campaignName: 'Industry 4.0 Readiness Assessment',
    stakeholderRole: 'IT Operations Manager',
    stakeholderTitle: 'Senior IT Manager',
    accessLink: 'http://localhost:3000/session/test-token-123',
    estimatedTime: '20-30 minutes'
  }

  console.log('Template data:')
  console.log(JSON.stringify(testData, null, 2))
  console.log('')

  try {
    const result = await resend.emails.send({
      from: 'Flow Forge <onboarding@resend.dev>',
      to: testEmail,
      subject: `${testData.facilitatorName} has invited you to participate in ${testData.companyName}'s ${testData.campaignName}`,
      react: StakeholderInvitationEmail(testData)
    })

    if (result.error) {
      console.error('❌ Email send failed:')
      console.error('Error:', result.error)
      process.exit(1)
    }

    console.log('✅ Campaign email sent successfully!')
    console.log(`   Email ID: ${result.data?.id}`)
    console.log(`\nCheck ${testEmail} for the campaign invitation email.`)

  } catch (error: any) {
    console.error('❌ Error sending campaign email:')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Stack trace:', error?.stack)

    if (error?.message?.includes('react')) {
      console.log('\n💡 This might be a React email rendering issue.')
      console.log('   Check that @react-email/components is installed correctly.')
    }

    process.exit(1)
  }
}

testCampaignEmail()
