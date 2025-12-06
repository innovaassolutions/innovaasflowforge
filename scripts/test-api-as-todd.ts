/**
 * Test Script: Verify API Returns Data for Todd as Admin
 *
 * This script simulates logging in as todd and hitting the API endpoints
 * to verify the admin bypass is working correctly.
 *
 * Run with: npx tsx scripts/test-api-as-todd.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const toddEmail = 'todd.abraham@innovaas.co'
const toddPassword = process.env.TODD_PASSWORD || '' // Add TODD_PASSWORD to .env.local

if (!toddPassword) {
  console.log('⚠️  TODD_PASSWORD not set in .env.local')
  console.log('   Add: TODD_PASSWORD=your_password')
  console.log('   Or provide password as argument: npx tsx scripts/test-api-as-todd.ts your_password')
  process.exit(1)
}

async function testApiAsTodd() {
  console.log('🔐 Testing API as todd.abraham@innovaas.co\n')
  console.log('='.repeat(60))

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // 1. Sign in as todd
    console.log('\n1️⃣  SIGNING IN')
    console.log('-'.repeat(60))
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: toddEmail,
      password: toddPassword
    })

    if (signInError || !authData.session) {
      console.error('❌ Sign in failed:', signInError?.message)
      process.exit(1)
    }

    console.log('✅ Signed in successfully')
    console.log('   User ID:', authData.user.id)
    console.log('   Email:', authData.user.email)
    console.log('   Token:', authData.session.access_token.substring(0, 20) + '...')

    const accessToken = authData.session.access_token

    // 2. Test /api/campaigns
    console.log('\n2️⃣  TESTING /api/campaigns')
    console.log('-'.repeat(60))

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const campaignsResponse = await fetch(`${baseUrl}/api/campaigns`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const campaignsData = await campaignsResponse.json()

    if (!campaignsResponse.ok) {
      console.error('❌ Campaigns API failed:')
      console.error('   Status:', campaignsResponse.status)
      console.error('   Error:', campaignsData.error)
      console.error('   Details:', campaignsData.details)
    } else {
      console.log('✅ Campaigns API succeeded')
      console.log(`   Returned ${campaignsData.campaigns?.length || 0} campaigns:\n`)

      campaignsData.campaigns?.forEach((c: any, idx: number) => {
        console.log(`   ${idx + 1}. ${c.name}`)
        console.log(`      Company: ${c.company_name}`)
        console.log(`      Status: ${c.status}`)
        console.log()
      })

      if (campaignsData.campaigns?.length === 5) {
        console.log('   🎉 SUCCESS! All 5 campaigns visible (admin bypass working)')
      } else if (campaignsData.campaigns?.length === 3) {
        console.log('   ⚠️  Only 3 campaigns visible (admin bypass NOT working - RLS filtering)')
      } else {
        console.log('   ⚠️  Unexpected campaign count')
      }
    }

    // 3. Test /api/company-profiles
    console.log('\n3️⃣  TESTING /api/company-profiles')
    console.log('-'.repeat(60))

    const companiesResponse = await fetch(`${baseUrl}/api/company-profiles`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const companiesData = await companiesResponse.json()

    if (!companiesResponse.ok) {
      console.error('❌ Company profiles API failed:')
      console.error('   Status:', companiesResponse.status)
      console.error('   Error:', companiesData.error)
      console.error('   Details:', companiesData.details)
    } else {
      console.log('✅ Company profiles API succeeded')
      console.log(`   Returned ${companiesData.companies?.length || 0} companies:\n`)

      companiesData.companies?.forEach((c: any, idx: number) => {
        console.log(`   ${idx + 1}. ${c.company_name}`)
        console.log(`      Industry: ${c.industry}`)
        console.log(`      Created: ${new Date(c.created_at).toLocaleDateString()}`)
        console.log()
      })

      if (companiesData.companies?.length > 0) {
        console.log('   🎉 SUCCESS! Companies visible')
      } else {
        console.log('   ⚠️  No companies returned')
      }
    }

    // 4. Sign out
    await supabase.auth.signOut()
    console.log('\n✅ Test complete! Signed out.\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Get password from command line if provided
const providedPassword = process.argv[2]
if (providedPassword) {
  process.env.TODD_PASSWORD = providedPassword
}

testApiAsTodd()
