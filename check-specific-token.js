const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkToken() {
  const token = 'd_f6fWwDxp-dbbt77Na6bgSZGNaCnasqouDs8aXHfkM';

  console.log('Checking token:', token);

  const { data, error } = await supabase
    .from('campaign_reports')
    .select(`
      id,
      campaign_id,
      access_token,
      is_active,
      report_tier,
      created_at,
      campaigns (
        name,
        company_name
      )
    `)
    .eq('access_token', token)
    .single();

  if (error) {
    console.error('\n❌ Token NOT found in database');
    console.error('Error:', error.message);
    return;
  }

  console.log('\n✅ Token FOUND in database:');
  console.log('Campaign:', data.campaigns?.name);
  console.log('Company:', data.campaigns?.company_name);
  console.log('Active:', data.is_active);
  console.log('Tier:', data.report_tier);
}

checkToken().catch(console.error);
