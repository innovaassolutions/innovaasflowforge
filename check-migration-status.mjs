#!/usr/bin/env node
/**
 * Check if report_tier column exists in campaigns table
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Checking Migration Status');
console.log('============================\n');

async function checkMigration() {
  try {
    // Try to select report_tier from campaigns
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name, report_tier')
      .limit(1);

    if (error) {
      if (error.message.includes('column') && error.message.includes('report_tier')) {
        console.log('❌ MIGRATION NOT APPLIED');
        console.log('\nThe report_tier column does NOT exist in campaigns table.');
        console.log('\n📋 Action Required:');
        console.log('1. Go to: https://supabase.com/dashboard');
        console.log('2. Navigate to: SQL Editor → New Query');
        console.log('3. Run this SQL:\n');
        console.log('ALTER TABLE campaigns');
        console.log('  ADD COLUMN IF NOT EXISTS report_tier TEXT NOT NULL DEFAULT \'standard\'');
        console.log('    CHECK (report_tier IN (\'standard\', \'premium\', \'enterprise\'));\n');
        console.log('CREATE INDEX IF NOT EXISTS idx_campaigns_report_tier ON campaigns(report_tier);\n');
        return false;
      } else {
        console.log('❌ Unexpected error:', error.message);
        return false;
      }
    }

    console.log('✅ MIGRATION APPLIED');
    console.log('\nThe report_tier column exists!');
    if (data && data.length > 0) {
      console.log(`Sample campaign report_tier: ${data[0].report_tier || 'NULL'}`);
    }
    return true;

  } catch (err) {
    console.error('❌ Error checking migration:', err.message);
    return false;
  }
}

checkMigration().then(applied => {
  if (!applied) {
    console.log('\n⚠️  This is likely why synthesis is failing with 500 errors!');
    process.exit(1);
  }
  process.exit(0);
});
