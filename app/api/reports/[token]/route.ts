/**
 * Report Access API Endpoint
 *
 * GET /api/reports/[token]
 *
 * Public endpoint for accessing shareable client reports via access token.
 * No authentication required - security through cryptographic token (256-bit).
 *
 * Story: 1.1 - Database & API Foundation
 * Epic: 1 - Client Assessment Report Generation System
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidTokenFormat } from '@/lib/utils/token-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: accessToken } = await params;

    // Validate token format (43 base64url characters)
    if (!accessToken || !isValidTokenFormat(accessToken)) {
      return NextResponse.json(
        { error: 'Invalid access token format' },
        { status: 400 }
      );
    }

    // Initialize Supabase client (public access, no auth required)
    const supabase = await createClient();

    // Query campaign_reports with access token
    // RLS policy "Public token access for active reports" allows this
    const { data: report, error: reportError } = await supabase
      .from('campaign_reports')
      .select(
        `
        id,
        campaign_id,
        report_tier,
        synthesis_snapshot,
        consultant_observations,
        supporting_documents,
        created_at,
        regenerated_at,
        regeneration_count,
        access_count,
        campaigns (
          name,
          description,
          company_name,
          company_industry
        )
      `
      )
      .eq('access_token', accessToken)
      .eq('is_active', true)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        {
          error: 'Report not found or access denied',
          details:
            'This report may have been deactivated or the access token is invalid',
        },
        { status: 404 }
      );
    }

    // Increment access count and update last_accessed_at
    // This runs as a separate operation and doesn't block the response
    // Using service role client to bypass RLS for the UPDATE operation
    const { error: updateError } = await supabase
      .from('campaign_reports')
      .update({
        access_count: report.access_count ? report.access_count + 1 : 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', report.id);

    // Log error but don't fail request if tracking update fails
    if (updateError) {
      console.error('Failed to update access tracking:', updateError);
    }

    // Return report data
    return NextResponse.json(
      {
        success: true,
        report: {
          id: report.id,
          campaign: {
            id: report.campaign_id,
            name: report.campaigns?.name,
            description: report.campaigns?.description,
            company_name: report.campaigns?.company_name,
            company_industry: report.campaigns?.company_industry,
          },
          tier: report.report_tier,
          synthesis: report.synthesis_snapshot,
          consultant_observations: report.consultant_observations,
          supporting_documents: report.supporting_documents || [],
          generated_at: report.created_at,
          regenerated_at: report.regenerated_at,
          regeneration_count: report.regeneration_count || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Report access error:', error);
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
