/**
 * Report Generation API Endpoint
 *
 * POST /api/campaigns/[id]/generate-report
 *
 * Generates a shareable client report for a campaign with synthesis data.
 * Creates or updates a campaign_reports record with a unique access token.
 *
 * Story: 1.1 - Database & API Foundation
 * Epic: 1 - Client Assessment Report Generation System
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { generateAccessToken } from '@/lib/utils/token-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Parse request body
    const body = await request.json();
    const reportTier = body.report_tier_override || 'basic';
    const consultantObservations = body.consultant_observations || null;

    // Validate campaign ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!campaignId || !uuidRegex.test(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID format' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's company profile (use admin to bypass RLS)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('company_profile_id')
      .eq('id', user.id)
      .single() as any;

    if (profileError || !userProfile) {
      console.error('[Report Gen] User profile error:', profileError);
      console.error('[Report Gen] User ID:', user.id);
      return NextResponse.json(
        { error: 'User profile not found', details: profileError?.message },
        { status: 404 }
      );
    }

    // Check if user has a company_profile_id
    if (!userProfile.company_profile_id) {
      console.error('[Report Gen] User has no company_profile_id:', user.id);
      return NextResponse.json(
        {
          error: 'User profile incomplete',
          details: 'Your user profile is not associated with a company. Please contact support.'
        },
        { status: 400 }
      );
    }

    console.log('[Report Gen] User profile:', {
      user_id: user.id,
      company_profile_id: userProfile.company_profile_id
    });

    // Get campaign and verify user has access (same organization)
    // Note: report_tier is in campaign_reports table, not campaigns table
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, created_by, company_profile_id')
      .eq('id', campaignId)
      .single() as any;

    if (campaignError || !campaign) {
      console.error('[Report Gen] Campaign error:', campaignError);
      console.error('[Report Gen] Campaign ID:', campaignId);
      return NextResponse.json(
        { error: 'Campaign not found', details: campaignError?.message },
        { status: 404 }
      );
    }

    console.log('[Report Gen] Campaign found:', {
      campaign_id: campaign.id,
      company_profile_id: campaign.company_profile_id
    });

    // Verify user belongs to same organization as campaign
    if (campaign.company_profile_id !== userProfile.company_profile_id) {
      return NextResponse.json(
        { error: 'Access denied - different organization' },
        { status: 403 }
      );
    }

    // Get campaign synthesis data from campaign_synthesis table
    const { data: synthesis, error: synthesisError } = await supabaseAdmin
      .from('campaign_synthesis')
      .select('synthesis_data')
      .eq('campaign_id', campaignId)
      .maybeSingle() as any;

    console.log('[Report Gen] Synthesis query result:', {
      has_synthesis: !!synthesis,
      has_data: !!synthesis?.synthesis_data,
      error: synthesisError?.message
    });

    // Validate campaign has synthesis data
    if (
      synthesisError ||
      !synthesis ||
      !synthesis.synthesis_data ||
      Object.keys(synthesis.synthesis_data).length === 0
    ) {
      console.error('[Report Gen] No synthesis data:', {
        synthesisError,
        has_synthesis: !!synthesis,
        has_data: !!synthesis?.synthesis_data
      });
      return NextResponse.json(
        {
          error: 'Campaign synthesis not yet generated',
          details:
            'Please ensure the campaign has completed synthesis before generating a report',
        },
        { status: 400 }
      );
    }

    // Generate unique access token
    const accessToken = generateAccessToken();

    // Get existing report if any
    const { data: existingReport } = await supabaseAdmin
      .from('campaign_reports')
      .select('id, regeneration_count')
      .eq('campaign_id', campaignId)
      .maybeSingle() as any;

    // UPSERT campaign_reports record
    // If report exists: increment regeneration_count, update regenerated_at
    // If new: create with regeneration_count = 0
    const reportData = {
      campaign_id: campaignId,
      access_token: accessToken,
      is_active: true,
      report_tier: reportTier,
      synthesis_snapshot: synthesis.synthesis_data,
      consultant_observations: consultantObservations,
      created_by: user.id,
      updated_at: new Date().toISOString(),
      ...(existingReport
        ? {
            regenerated_at: new Date().toISOString(),
            regeneration_count: (existingReport.regeneration_count || 0) + 1,
          }
        : {
            regeneration_count: 0,
          }),
    };

    const { data: report, error: upsertError } = await (supabaseAdmin
      .from('campaign_reports') as any)
      .upsert(reportData, {
        onConflict: 'campaign_id',
        ignoreDuplicates: false,
      })
      .select('id, access_token, regeneration_count')
      .single();

    if (upsertError) {
      console.error('Report upsert error:', upsertError);
      return NextResponse.json(
        {
          error: 'Failed to generate report',
          details: upsertError.message,
        },
        { status: 500 }
      );
    }

    // Construct shareable report URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const reportUrl = `${baseUrl}/reports/${report.access_token}`;

    // Return success response
    return NextResponse.json(
      {
        success: true,
        report: {
          id: report.id,
          campaign_id: campaignId,
          campaign_name: campaign.name,
          access_token: report.access_token,
          url: reportUrl,
          is_regeneration: existingReport !== null,
          regeneration_count: report.regeneration_count,
        },
      },
      { status: existingReport ? 200 : 201 }
    );
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
