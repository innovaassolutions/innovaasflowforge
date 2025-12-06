/**
 * Emergency Fix Script: Set todd.abraham@innovaas.co as Admin
 *
 * This script updates todd's user_type to 'admin' to resolve the data visibility issue.
 *
 * Run with: npx tsx scripts/fix-todd-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

async function fixToddAdmin() {
  console.log('🔧 Fixing todd.abraham@innovaas.co admin access...\n')

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Check current status
    console.log('📊 Current user profile:')
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, user_type, company_profile_id')
      .eq('email', 'todd.abraham@innovaas.co')
      .single()

    if (fetchError) {
      console.error('❌ Error fetching user profile:', fetchError.message)
      process.exit(1)
    }

    if (!currentProfile) {
      console.error('❌ User profile not found for todd.abraham@innovaas.co')
      process.exit(1)
    }

    console.log('   Email:', currentProfile.email)
    console.log('   User Type:', currentProfile.user_type || 'NULL')
    console.log('   Company Profile ID:', currentProfile.company_profile_id || 'NULL')
    console.log()

    // Update to admin
    console.log('🔄 Updating user_type to "admin"...')
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({ user_type: 'admin' })
      .eq('email', 'todd.abraham@innovaas.co')
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError.message)
      process.exit(1)
    }

    console.log('✅ Successfully updated user profile!')
    console.log()
    console.log('📊 Updated user profile:')
    console.log('   Email:', updatedProfile.email)
    console.log('   User Type:', updatedProfile.user_type)
    console.log('   Company Profile ID:', updatedProfile.company_profile_id || 'NULL')
    console.log()

    // Verify campaigns are now accessible
    console.log('🔍 Verifying campaign access...')
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, name, company_name')
      .order('created_at', { ascending: false })

    if (campaignsError) {
      console.error('❌ Error fetching campaigns:', campaignsError.message)
    } else {
      console.log(`✅ Can now access ${campaigns?.length || 0} campaign(s):`)
      campaigns?.forEach((campaign, idx) => {
        console.log(`   ${idx + 1}. ${campaign.name} (${campaign.company_name})`)
      })
    }

    console.log()
    console.log('🎉 Fix complete! Please refresh your browser and try logging in again.')
    console.log()

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the fix
fixToddAdmin()
