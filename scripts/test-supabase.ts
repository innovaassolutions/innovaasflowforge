/**
 * Test Supabase Connection
 * Run with: npx tsx scripts/test-supabase.ts
 */

import { supabase } from '../lib/supabase/client'
import { supabaseAdmin } from '../lib/supabase/server'

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  try {
    // Test 1: Client connection
    console.log('1. Testing client connection (anon key)...')
    const { data: clientData, error: clientError } = await supabase
      .from('knowledge')
      .select('count')
      .limit(1)

    if (clientError) {
      console.error('  ❌ Client connection failed:', clientError.message)
    } else {
      console.log('  ✅ Client connection successful')
    }

    // Test 2: Admin connection
    console.log('\n2. Testing admin connection (service role key)...')
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('campaigns')
      .select('count')
      .limit(1)

    if (adminError) {
      console.error('  ❌ Admin connection failed:', adminError.message)
    } else {
      console.log('  ✅ Admin connection successful')
    }

    // Test 3: List tables
    console.log('\n3. Checking database schema...')
    const { data: tables, error: tablesError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
          ORDER BY tablename;
        `
      })

    if (tablesError) {
      console.log('  ℹ️  Cannot list tables (migration may not be applied yet)')
    } else {
      console.log('  ✅ Schema accessible')
    }

    // Test 4: Storage buckets
    console.log('\n4. Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error('  ❌ Storage check failed:', bucketsError.message)
    } else {
      console.log(`  ✅ Found ${buckets.length} storage bucket(s)`)
      buckets.forEach(bucket => {
        console.log(`     - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      })
    }

    console.log('\n✨ Connection test complete!\n')

  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
    process.exit(1)
  }
}

testConnection()
