/**
 * One-time script to set user as admin
 * Run with: npx tsx scripts/set-admin.ts
 */

import { supabaseAdmin } from '../lib/supabase/server'

async function setAdminUser() {
  const email = 'todd.abraham@innovaas.co'

  console.log('Setting admin privileges for:', email)

  // First, update the constraint to allow 'admin' type
  const { error: constraintError } = await supabaseAdmin.rpc('exec_sql', {
    sql: `
      ALTER TABLE user_profiles
        DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;

      ALTER TABLE user_profiles
        ADD CONSTRAINT user_profiles_user_type_check
        CHECK (user_type IN ('consultant', 'company', 'admin'));
    `
  })

  if (constraintError) {
    console.log('Constraint may already be updated:', constraintError.message)
  } else {
    console.log('✓ Database constraint updated to include admin type')
  }

  // Update user profile to admin
  const { data, error } = await (supabaseAdmin
    .from('user_profiles') as any)
    .update({ user_type: 'admin' })
    .eq('email', email)
    .select('id, email, user_type, role')
    .single()

  if (error) {
    console.error('❌ Error updating user profile:', error)
    process.exit(1)
  }

  console.log('✓ User profile updated successfully!')
  console.log('Profile:', data)

  process.exit(0)
}

setAdminUser()
