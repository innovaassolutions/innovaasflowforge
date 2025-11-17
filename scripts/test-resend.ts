/**
 * Test script to verify Resend email configuration
 * Run with: npx tsx scripts/test-resend.ts
 */

import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const RESEND_API_KEY = process.env.RESEND_API_KEY

async function testResend() {
  console.log('🧪 Testing Resend Configuration...\n')

  // Check if API key is set
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env.local')
    console.log('Please add RESEND_API_KEY=your_api_key to .env.local')
    process.exit(1)
  }

  console.log('✓ RESEND_API_KEY is set')
  console.log(`  Key starts with: ${RESEND_API_KEY.substring(0, 7)}...`)

  // Initialize Resend
  const resend = new Resend(RESEND_API_KEY)

  // Test email address - change this to your email
  const testEmail = process.argv[2] || 'delivered@resend.dev'

  console.log(`\n📧 Sending test email to: ${testEmail}\n`)

  try {
    const result = await resend.emails.send({
      from: 'Flow Forge <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Test Email from Flow Forge',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #F25C05;">Test Email</h1>
          <p>This is a test email to verify your Resend configuration is working correctly.</p>
          <p>If you received this email, your Resend integration is set up properly!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent from Flow Forge test script at ${new Date().toISOString()}
          </p>
        </div>
      `
    })

    if (result.error) {
      console.error('❌ Email send failed:')
      console.error('Error:', result.error)
      process.exit(1)
    }

    console.log('✅ Email sent successfully!')
    console.log(`   Email ID: ${result.data?.id}`)
    console.log(`\nCheck ${testEmail} for the test email.`)
    console.log('Note: If using a test API key, emails only go to verified addresses.')

  } catch (error: any) {
    console.error('❌ Unexpected error:')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)

    if (error?.message?.includes('API key')) {
      console.log('\n💡 Your API key might be invalid. Check:')
      console.log('   1. Copy the key correctly from https://resend.com/api-keys')
      console.log('   2. Make sure it starts with "re_"')
      console.log('   3. Verify the key is active in your Resend dashboard')
    }

    process.exit(1)
  }
}

testResend()
