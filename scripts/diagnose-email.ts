/**
 * Email delivery diagnostic script
 * Run with: npx tsx scripts/diagnose-email.ts your-email@example.com
 */

import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const RESEND_API_KEY = process.env.RESEND_API_KEY

async function diagnoseEmail() {
  console.log('🔍 Email Delivery Diagnostic\n')

  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set')
    process.exit(1)
  }

  const resend = new Resend(RESEND_API_KEY)
  const testEmail = process.argv[2]

  if (!testEmail) {
    console.error('❌ Please provide an email address: npx tsx scripts/diagnose-email.ts your@email.com')
    process.exit(1)
  }

  // Check 1: API Key format
  console.log('1️⃣  Checking API Key...')
  if (RESEND_API_KEY.startsWith('re_')) {
    console.log('   ✓ API key format looks correct')

    // Determine if test or production key
    if (RESEND_API_KEY.includes('_test_') || RESEND_API_KEY.length < 40) {
      console.log('   ⚠️  This appears to be a TEST API key')
      console.log('   → Test keys only send to verified addresses in your Resend account')
      console.log('   → To send to any email, you need a PRODUCTION API key')
    } else {
      console.log('   ✓ This appears to be a production API key')
    }
  } else {
    console.log('   ❌ API key format is invalid (should start with "re_")')
  }

  // Check 2: Send test email
  console.log('\n2️⃣  Sending test email to:', testEmail)
  try {
    const result = await resend.emails.send({
      from: 'Flow Forge <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Test Email - Flow Forge Diagnostic',
      html: `
        <div style="font-family: Arial; padding: 20px; max-width: 600px;">
          <h2 style="color: #F25C05;">Email Delivery Test</h2>
          <p>If you're reading this, email delivery is working!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is a diagnostic email from Flow Forge. If you didn't request this, you can safely ignore it.
          </p>
        </div>
      `
    })

    console.log('\n   📧 Email send response:')
    console.log('   ', JSON.stringify(result, null, 2))

    if (result.error) {
      console.log('\n   ❌ Email failed to send')
      console.log('   Error:', result.error.message)

      if (result.error.message?.includes('not verified')) {
        console.log('\n   💡 Solution: Add and verify your email domain in Resend dashboard')
        console.log('   https://resend.com/domains')
      }
    } else if (result.data) {
      console.log('\n   ✅ Email sent successfully!')
      console.log('   Email ID:', result.data.id)

      console.log('\n3️⃣  Next steps:')
      console.log('   1. Check your inbox for:', testEmail)
      console.log('   2. Check your spam/junk folder')
      console.log('   3. Check Resend dashboard: https://resend.com/emails')
      console.log('   4. If using Gmail, check "All Mail" folder')

      console.log('\n   ⏱️  Note: Email delivery can take 1-5 minutes')
    }

  } catch (error: any) {
    console.error('\n   ❌ Error sending email:')
    console.error('   ', error.message)
  }

  // Check 3: Recommendations
  console.log('\n4️⃣  Recommendations:')
  console.log('   • If emails aren\'t arriving, verify your domain at https://resend.com/domains')
  console.log('   • Change "from" address from onboarding@resend.dev to noreply@yourdomain.com')
  console.log('   • Check Resend logs at https://resend.com/emails for delivery status')
  console.log('   • For production use, get a production API key (not test key)')
}

diagnoseEmail()
