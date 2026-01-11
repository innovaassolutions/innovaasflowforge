/**
 * Report Retrieval API Endpoint
 *
 * GET /api/campaigns/[id]/report
 *
 * Retrieves the existing campaign report without regenerating it.
 * Returns report details including access token and shareable URL.
 *
 * Epic: 1 - Client Assessment Report Generation System
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

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

    // Get user's profile with user_type (use admin to bypass RLS)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('company_profile_id, user_type')
      .eq('id', user.id)
      .single() as any;

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const isConsultant = userProfile.user_type === 'consultant';
    const isAdmin = userProfile.user_type === 'admin';

    // Get campaign to verify access and get name
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, created_by, company_profile_id')
      .eq('id', campaignId)
      .single() as any;

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this campaign
    if (isAdmin) {
      // Admins have full access
    } else if (isConsultant) {
      // Consultants can only access campaigns they created
      if (campaign.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    } else {
      // Regular users must belong to same organization
      if (campaign.company_profile_id !== userProfile.company_profile_id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Fetch the existing report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('campaign_reports')
      .select('id, access_token, report_tier, is_active, created_at, regenerated_at, regeneration_count')
      .eq('campaign_id', campaignId)
      .maybeSingle() as any;

    if (reportError) {
      console.error('Report fetch error:', reportError);
      return NextResponse.json(
        { error: 'Failed to fetch report', details: reportError.message },
        { status: 500 }
      );
    }

    // If no report exists, return null
    if (!report) {
      return NextResponse.json(
        { success: true, report: null },
        { status: 200 }
      );
    }

    // Construct shareable report URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const reportUrl = `${baseUrl}/reports/${report.access_token}`;

    // Return success response with report details
    return NextResponse.json(
      {
        success: true,
        report: {
          id: report.id,
          campaign_id: campaignId,
          campaign_name: campaign.name,
          access_token: report.access_token,
          url: reportUrl,
          report_tier: report.report_tier,
          is_active: report.is_active,
          created_at: report.created_at,
          regenerated_at: report.regenerated_at,
          regeneration_count: report.regeneration_count,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Report retrieval error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
