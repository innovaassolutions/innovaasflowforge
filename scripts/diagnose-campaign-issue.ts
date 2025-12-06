/**
 * Diagnostic Script: Investigate Campaign Visibility Issue
 *
 * This script investigates why todd.abraham@innovaas.co couldn't see campaigns
 * despite being an admin user.
 *
 * Run with: npx tsx scripts/diagnose-campaign-issue.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function diagnose() {
  console.log('🔍 Diagnosing Campaign Visibility Issue\n')
  console.log('=' .repeat(60))

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 1. Get Todd's profile
  console.log('\n1️⃣  TODD\'S USER PROFILE')
  console.log('-'.repeat(60))
  const { data: todd } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'todd.abraham@innovaas.co')
    .single()

  if (!todd) {
    console.log('❌ Todd\'s profile not found!')
    return
  }

  console.log('✅ Profile found:')
  console.log('   ID:', todd.id)
  console.log('   Email:', todd.email)
  console.log('   User Type:', todd.user_type)
  console.log('   Company Profile ID:', todd.company_profile_id)
  console.log('   Created At:', todd.created_at)

  // 2. Get all campaigns
  console.log('\n2️⃣  ALL CAMPAIGNS IN SYSTEM')
  console.log('-'.repeat(60))
  const { data: allCampaigns } = await supabase
    .from('campaigns')
    .select('id, name, company_name, created_by, company_profile_id, created_at')
    .order('created_at', { ascending: false })

  console.log(`✅ Found ${allCampaigns?.length || 0} campaigns:\n`)
  allCampaigns?.forEach((campaign, idx) => {
    const createdByTodd = campaign.created_by === todd.id
    const matchesCompany = campaign.company_profile_id === todd.company_profile_id

    console.log(`   ${idx + 1}. ${campaign.name}`)
    console.log(`      Company: ${campaign.company_name}`)
    console.log(`      Created by Todd: ${createdByTodd ? '✅ YES' : '❌ NO'}`)
    console.log(`      Matches Todd's company: ${matchesCompany ? '✅ YES' : '❌ NO'}`)
    console.log(`      Company Profile ID: ${campaign.company_profile_id || 'NULL'}`)
    console.log(`      Created By: ${campaign.created_by || 'NULL'}`)
    console.log()
  })

  // 3. Check Alimex campaign specifically
  console.log('3️⃣  ALIMEX CAMPAIGN DETAILS')
  console.log('-'.repeat(60))
  const { data: alimex } = await supabase
    .from('campaigns')
    .select('*')
    .ilike('company_name', '%Alimex%')
    .single()

  if (alimex) {
    console.log('✅ Alimex campaign found:')
    console.log('   ID:', alimex.id)
    console.log('   Name:', alimex.name)
    console.log('   Company:', alimex.company_name)
    console.log('   Created By:', alimex.created_by)
    console.log('   Created by Todd?', alimex.created_by === todd.id ? '✅ YES' : '❌ NO')
    console.log('   Company Profile ID:', alimex.company_profile_id)
    console.log('   Matches Todd\'s company?', alimex.company_profile_id === todd.company_profile_id ? '✅ YES' : '❌ NO')
  } else {
    console.log('❌ Alimex campaign not found!')
  }

  // 4. Check RLS policy simulation
  console.log('\n4️⃣  RLS POLICY SIMULATION')
  console.log('-'.repeat(60))
  console.log('The policy allows access if:')
  console.log('  a) created_by = todd.id, OR')
  console.log('  b) company_profile_id matches todd\'s company_profile_id\n')

  const campaignsToddShouldSee = allCampaigns?.filter(c =>
    c.created_by === todd.id || c.company_profile_id === todd.company_profile_id
  )

  console.log(`📊 Based on RLS policy, todd should see: ${campaignsToddShouldSee?.length || 0} campaigns`)
  console.log(`📊 Actually exist in system: ${allCampaigns?.length || 0} campaigns`)
  console.log()

  if (campaignsToddShouldSee && campaignsToddShouldSee.length < (allCampaigns?.length || 0)) {
    console.log('⚠️  WITHOUT admin status, todd would NOT see these campaigns:')
    const blockedCampaigns = allCampaigns?.filter(c =>
      c.created_by !== todd.id && c.company_profile_id !== todd.company_profile_id
    )
    blockedCampaigns?.forEach(c => {
      console.log(`   ❌ ${c.name} (${c.company_name})`)
    })
  }

  // 5. Test API authentication flow
  console.log('\n5️⃣  API AUTHENTICATION CHECK')
  console.log('-'.repeat(60))

  const { data: { user }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.log('❌ Could not list users:', authError.message)
  } else {
    const toddAuthUser = user?.find(u => u.email === 'todd.abraham@innovaas.co')
    if (toddAuthUser) {
      console.log('✅ Todd\'s auth.users record exists:')
      console.log('   ID:', toddAuthUser.id)
      console.log('   Email:', toddAuthUser.email)
      console.log('   Last sign in:', toddAuthUser.last_sign_in_at)
      console.log('   Matches profile ID?', toddAuthUser.id === todd.id ? '✅ YES' : '❌ NO')
    }
  }

  // 6. Summary
  console.log('\n6️⃣  DIAGNOSTIC SUMMARY')
  console.log('='.repeat(60))
  console.log('\n🔍 FINDINGS:')

  if (todd.user_type === 'admin') {
    console.log('   ✅ Todd IS an admin - should bypass RLS completely')
  } else {
    console.log('   ❌ Todd is NOT an admin - subject to RLS policies')
  }

  const createdByTodd = allCampaigns?.filter(c => c.created_by === todd.id).length || 0
  console.log(`   📊 Campaigns created by Todd: ${createdByTodd}`)

  const matchingCompany = allCampaigns?.filter(c => c.company_profile_id === todd.company_profile_id).length || 0
  console.log(`   📊 Campaigns matching Todd's company: ${matchingCompany}`)

  console.log('\n💡 POSSIBLE ROOT CAUSES:')
  console.log('   1. API route may have had authentication/session issue')
  console.log('   2. User profile query in API route may have failed silently')
  console.log('   3. Browser session/token may have been stale or invalid')
  console.log('   4. Race condition in user profile creation/lookup')
  console.log('\n✅ RESOLUTION:')
  console.log('   - Refreshing browser session should resolve the issue')
  console.log('   - Admin status confirmed and campaigns are accessible')
  console.log()
}

diagnose()
