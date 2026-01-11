/**
 * Test Production API Endpoints
 *
 * This script tests the production API to verify:
 * 1. Admin check is working correctly
 * 2. Campaigns endpoint returns data
 * 3. Company profiles endpoint returns data
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testProductionAPI() {
  console.log('🔍 Testing Production API Endpoints\n')
  console.log('='.repeat(60))

  // You'll need to provide your session token
  console.log('\n📝 To run this test:')
  console.log('1. Log in to https://flowforge.innovaas.co')
  console.log('2. Open DevTools (F12)')
  console.log('3. Go to Application → Local Storage → https://www.innovaas.co')
  console.log('4. Find the Supabase auth token')
  console.log('5. Run: npx tsx scripts/test-production-api.ts <your-token>\n')

  const token = process.argv[2]

  if (!token) {
    console.log('❌ No token provided')
    console.log('Usage: npx tsx scripts/test-production-api.ts <access-token>')
    process.exit(1)
  }

  const productionUrl = 'https://flowforge.innovaas.co'

  console.log(`\n🌐 Testing against: ${productionUrl}`)
  console.log(`🔑 Token: ${token.substring(0, 20)}...`)

  // Test 1: Campaigns endpoint
  console.log('\n1️⃣  Testing /api/campaigns')
  console.log('-'.repeat(60))

  try {
    const campaignsResponse = await fetch(`${productionUrl}/api/campaigns`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log(`Status: ${campaignsResponse.status} ${campaignsResponse.statusText}`)

    const campaignsData = await campaignsResponse.json()

    if (!campaignsResponse.ok) {
      console.log('❌ Error:', campaignsData.error)
      if (campaignsData.details) {
        console.log('   Details:', campaignsData.details)
      }
    } else {
      console.log(`✅ Success! Returned ${campaignsData.campaigns?.length || 0} campaigns`)

      if (campaignsData.campaigns && campaignsData.campaigns.length > 0) {
        console.log('\nCampaigns:')
        campaignsData.campaigns.forEach((c: any, idx: number) => {
          console.log(`   ${idx + 1}. ${c.name} (${c.company_name})`)
        })
      } else {
        console.log('⚠️  No campaigns returned (expected 5)')
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error)
  }

  // Test 2: Company profiles endpoint
  console.log('\n2️⃣  Testing /api/company-profiles')
  console.log('-'.repeat(60))

  try {
    const companiesResponse = await fetch(`${productionUrl}/api/company-profiles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log(`Status: ${companiesResponse.status} ${companiesResponse.statusText}`)

    const companiesData = await companiesResponse.json()

    if (!companiesResponse.ok) {
      console.log('❌ Error:', companiesData.error)
      if (companiesData.details) {
        console.log('   Details:', companiesData.details)
      }
    } else {
      console.log(`✅ Success! Returned ${companiesData.companies?.length || 0} companies`)

      if (companiesData.companies && companiesData.companies.length > 0) {
        console.log('\nCompanies:')
        companiesData.companies.forEach((c: any, idx: number) => {
          console.log(`   ${idx + 1}. ${c.company_name} (${c.industry})`)
        })
      } else {
        console.log('⚠️  No companies returned')
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n💡 Diagnosis:')
  console.log('   - If you see errors about "Failed to fetch user profile"')
  console.log('     → API fixes not deployed yet on Vercel')
  console.log('   - If you see "User profile not found"')
  console.log('     → Database issue with user_profiles table')
  console.log('   - If you see 0 campaigns/companies but no errors')
  console.log('     → Admin bypass not working (RLS filtering)')
  console.log('   - If you see 5 campaigns')
  console.log('     → Everything working! 🎉')
  console.log()
}

testProductionAPI()
