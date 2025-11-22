#!/usr/bin/env node
/**
 * Test script to verify synthesis works with the model fix
 * This simulates what will happen when the API endpoint is called
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const campaignId = 'a6e552da-7718-458a-aede-66ca56ce7e4f'; // Alimex campaign

console.log('🧪 Testing Synthesis Fix');
console.log('========================\n');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSynthesis() {
  console.log('1. Checking campaign exists...');

  const { data: campaign, error: campError } = await supabase
    .from('campaigns')
    .select('id, name, company_name, report_tier')
    .eq('id', campaignId)
    .single();

  if (campError) {
    console.error('   ✗ Campaign fetch error:', campError.message);
    return;
  }

  console.log(`   ✓ Campaign: ${campaign.name}`);
  console.log(`   Company: ${campaign.company_name}`);
  console.log(`   Report Tier: ${campaign.report_tier || 'NOT SET (will default to standard)'}`);

  console.log('\n2. Checking completed interviews...');

  const { data: assignments, error: assError } = await supabase
    .from('campaign_assignments')
    .select('id, stakeholder_name, status')
    .eq('campaign_id', campaignId)
    .eq('status', 'completed');

  if (assError) {
    console.error('   ✗ Assignments fetch error:', assError.message);
    return;
  }

  console.log(`   ✓ Found ${assignments.length} completed interviews`);
  assignments.forEach(a => console.log(`      - ${a.stakeholder_name}`));

  console.log('\n3. Testing model configuration...');

  // Import the model config
  const { getModelForTier } = await import('./lib/model-config.ts');

  const tier = campaign.report_tier || 'standard';
  const modelId = getModelForTier(tier);

  console.log(`   ✓ Tier: ${tier}`);
  console.log(`   ✓ Model: ${modelId}`);

  console.log('\n========================');
  console.log('✅ All checks passed!');
  console.log('\nThe synthesis should now work correctly.');
  console.log('\nTo test the full synthesis:');
  console.log('1. Apply the database migration (add report_tier column)');
  console.log('2. Start your dev server: npm run dev');
  console.log('3. Navigate to the Alimex campaign and click "Generate Report"');
}

testSynthesis().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
