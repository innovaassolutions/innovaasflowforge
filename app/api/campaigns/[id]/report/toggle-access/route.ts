/**
 * Report Access Toggle API Endpoint
 *
 * PATCH /api/campaigns/[id]/report/toggle-access
 *
 * Toggles the is_active status of a campaign report to enable/disable public access.
 *
 * Story: 1.2 - Report Generation UI
 * Epic: 1 - Client Assessment Report Generation System
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean value' },
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

    // Get campaign to verify access
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, created_by, company_profile_id')
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

    // Update the report's is_active status
    const { data: updatedReport, error: updateError } = await (supabaseAdmin
      .from('campaign_reports') as any)
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('campaign_id', campaignId)
      .select('id, access_token, is_active')
      .single();

    if (updateError) {
      console.error('Report toggle error:', updateError);

      // Check if report doesn't exist
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No report found for this campaign' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update report access', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        report: {
          id: updatedReport.id,
          campaign_id: campaignId,
          is_active: updatedReport.is_active,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Report toggle access error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
