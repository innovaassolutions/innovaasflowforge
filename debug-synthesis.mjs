#!/usr/bin/env node
/**
 * Debug script to test synthesis locally and capture detailed errors
 * Usage: node debug-synthesis.mjs
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const campaignId = 'a6e552da-7718-458a-aede-66ca56ce7e4f';

console.log('🔍 Diagnostic Check for Synthesis Failure');
console.log('=========================================\n');

// Check 1: Environment Variables
console.log('1. Checking environment variables...');
const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`   ANTHROPIC_API_KEY: ${hasAnthropicKey ? '✓ Present' : '✗ Missing'}`);
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✓ Present' : '✗ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${hasSupabaseKey ? '✓ Present' : '✗ Missing'}`);

if (!hasAnthropicKey) {
  console.error('\n❌ ANTHROPIC_API_KEY is missing!');
  process.exit(1);
}

// Check 2: Test Anthropic API Connection
console.log('\n2. Testing Anthropic API connection...');
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

try {
  console.log('   Attempting to use model: claude-sonnet-4-20250514');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: 'Hello' }]
  });
  console.log('   ✓ Model claude-sonnet-4-20250514 works!');
} catch (error) {
  console.log(`   ✗ Model claude-sonnet-4-20250514 failed: ${error.message}`);

  // Try alternative models
  console.log('\n   Trying alternative models...');
  const modelsToTry = [
    'claude-sonnet-4-5-20250929',
    'claude-sonnet-4-20241022',
    'claude-3-5-sonnet-20241022'
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`   Testing ${model}...`);
      await client.messages.create({
        model,
        max_tokens: 100,
        messages: [{ role: 'user', content: 'Hello' }]
      });
      console.log(`   ✓ ${model} works!`);
      console.log(`\n   💡 SOLUTION: Update synthesis-agent.ts to use: ${model}`);
      break;
    } catch (err) {
      console.log(`   ✗ ${model} failed: ${err.message}`);
    }
  }
}

// Check 3: Campaign Data
if (hasSupabaseUrl && hasSupabaseKey) {
  console.log('\n3. Checking campaign data...');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('id, name, company_name')
      .eq('id', campaignId)
      .single();

    if (campError) {
      console.log(`   ✗ Campaign fetch error: ${campError.message}`);
    } else if (campaign) {
      console.log(`   ✓ Campaign found: ${campaign.name} (${campaign.company_name})`);
    }

    const { data: assignments, error: assError } = await supabase
      .from('campaign_assignments')
      .select('id, stakeholder_name, status')
      .eq('campaign_id', campaignId);

    if (assError) {
      console.log(`   ✗ Assignments fetch error: ${assError.message}`);
    } else if (assignments) {
      const completed = assignments.filter(a => a.status === 'completed');
      console.log(`   ✓ Found ${assignments.length} assignments, ${completed.length} completed`);
      completed.forEach(a => console.log(`      - ${a.stakeholder_name}`));
    }
  } catch (err) {
    console.log(`   ✗ Database check failed: ${err.message}`);
  }
}

console.log('\n=========================================');
console.log('Diagnostic complete!');
