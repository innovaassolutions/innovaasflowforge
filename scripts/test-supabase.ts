/**
 * Test Supabase Connection
 * Run with: npx tsx scripts/test-supabase.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  // Check environment variables are loaded
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('❌ Missing environment variables!')
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✓' : '✗')
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗')
    console.log('\nMake sure .env.local file exists and contains all required variables.')
    process.exit(1)
  }

  console.log('✅ Environment variables loaded\n')

  // Create Supabase clients
  const supabase = createClient(supabaseUrl, anonKey)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test 1: Client connection
    console.log('1. Testing client connection (anon key)...')
    const { data: clientData, error: clientError } = await supabase
      .from('knowledge')
      .select('count')
      .limit(1)

    if (clientError) {
      console.error('  ❌ Client connection failed:', clientError.message)
      if (clientError.message.includes('relation') && clientError.message.includes('does not exist')) {
        console.log('  ℹ️  This is expected if migrations haven\'t been applied yet')
      }
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
      if (adminError.message.includes('relation') && adminError.message.includes('does not exist')) {
        console.log('  ℹ️  This is expected if migrations haven\'t been applied yet')
      }
    } else {
      console.log('  ✅ Admin connection successful')
    }

    // Test 3: Storage buckets
    console.log('\n3. Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error('  ❌ Storage check failed:', bucketsError.message)
    } else {
      console.log(`  ✅ Found ${buckets.length} storage bucket(s)`)
      if (buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`     - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
        })
      } else {
        console.log('  ℹ️  No storage buckets found. Run storage-config.sql to create them.')
      }
    }

    console.log('\n✨ Connection test complete!\n')

    // Summary
    console.log('📝 Next Steps:')
    if (!clientData && !adminData) {
      console.log('   1. Apply the database migration:')
      console.log('      - Open Supabase Dashboard > SQL Editor')
      console.log('      - Run: supabase/migrations/20251115_initial_schema.sql')
      console.log('   2. Configure storage buckets:')
      console.log('      - Run: supabase/storage-config.sql')
      console.log('   3. Run this test again to verify')
    } else {
      console.log('   ✅ Database is configured and ready!')
    }
    console.log('')

  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
    process.exit(1)
  }
}

testConnection()
