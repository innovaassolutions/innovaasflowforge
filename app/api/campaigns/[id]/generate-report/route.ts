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
import { createClient } from '@/lib/supabase/server';
import { generateAccessToken } from '@/lib/utils/token-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

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

    // Verify user has access to this campaign (organization check)
    // User must either:
    // 1. Be the campaign creator, OR
    // 2. Belong to the same organization as the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(
        `
        id,
        name,
        report_tier,
        created_by,
        company_profile_id,
        user_profiles!inner (
          id,
          company_profile_id
        )
      `
      )
      .eq('id', campaignId)
      .eq('user_profiles.id', user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or access denied' },
        { status: 404 }
      );
    }

    // Get campaign synthesis data from campaign_synthesis table
    const { data: synthesis, error: synthesisError } = await supabase
      .from('campaign_synthesis')
      .select('synthesis_data')
      .eq('campaign_id', campaignId)
      .maybeSingle();

    // Validate campaign has synthesis data
    if (
      synthesisError ||
      !synthesis ||
      !synthesis.synthesis_data ||
      Object.keys(synthesis.synthesis_data).length === 0
    ) {
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
    const { data: existingReport } = await supabase
      .from('campaign_reports')
      .select('id, regeneration_count')
      .eq('campaign_id', campaignId)
      .maybeSingle();

    // UPSERT campaign_reports record
    // If report exists: increment regeneration_count, update regenerated_at
    // If new: create with regeneration_count = 0
    const reportData = {
      campaign_id: campaignId,
      access_token: accessToken,
      is_active: true,
      report_tier: campaign.report_tier || 'basic',
      synthesis_snapshot: synthesis.synthesis_data,
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

    const { data: report, error: upsertError } = await supabase
      .from('campaign_reports')
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
