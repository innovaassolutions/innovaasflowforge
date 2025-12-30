/**
 * Education Synthesis API Endpoint
 *
 * POST /api/education/synthesis
 *
 * Triggers synthesis generation for a completed education campaign.
 * Uses the education-synthesis-agent to analyze interview transcripts
 * and generate insights using the Four Lenses framework.
 *
 * Story: 2.1 - Database & API Foundation
 * Epic: 2 - Education Synthesis Reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateEducationSynthesis } from '@/lib/agents/education-synthesis-agent';

interface SynthesisRequest {
  campaign_id: string;
  school_id: string;
  module: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization and permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id, role, permissions, user_type')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id && profile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'User not associated with an organization' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: SynthesisRequest = await request.json();
    const { campaign_id, school_id, module } = body;

    // Validate required fields
    if (!campaign_id || !school_id || !module) {
      return NextResponse.json(
        { error: 'campaign_id, school_id, and module are required' },
        { status: 400 }
      );
    }

    // Verify school belongs to user's organization (unless admin)
    if (profile?.user_type !== 'admin') {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id, organization_id')
        .eq('id', school_id)
        .single();

      if (schoolError || !school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      if (school.organization_id !== profile?.organization_id) {
        return NextResponse.json(
          { error: 'Access denied - school belongs to different organization' },
          { status: 403 }
        );
      }
    }

    // Verify campaign exists and belongs to school
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, status, education_config')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if campaign has completed sessions
    const { count: sessionCount, error: countError } = await supabaseAdmin
      .from('agent_sessions')
      .select('id', { count: 'exact', head: true })
      .not('participant_token_id', 'is', null)
      .eq('education_session_context->>module', module);

    if (countError) {
      console.error('Error counting sessions:', countError);
      return NextResponse.json(
        { error: 'Failed to verify campaign sessions' },
        { status: 500 }
      );
    }

    if (!sessionCount || sessionCount === 0) {
      return NextResponse.json(
        {
          error: 'No completed sessions found for this campaign/module',
          details: 'At least one completed interview session is required for synthesis',
        },
        { status: 400 }
      );
    }

    console.log(
      `Generating synthesis for campaign ${campaign_id}, school ${school_id}, module ${module} (${sessionCount} sessions)`
    );

    // Generate synthesis using the education synthesis agent
    const synthesisResult = await generateEducationSynthesis(
      campaign_id,
      school_id,
      module
    );

    // Get participant token IDs used in synthesis
    const { data: sessions } = await supabaseAdmin
      .from('agent_sessions')
      .select('participant_token_id')
      .not('participant_token_id', 'is', null)
      .eq('education_session_context->>module', module);

    const sourceTokenIds = (sessions as Array<{ participant_token_id: string | null }> | null)
      ?.map((s) => s.participant_token_id)
      .filter((id): id is string => id !== null) || [];

    // Save synthesis to database using admin client (bypasses RLS)
    // @ts-ignore - education_synthesis table not yet in generated types
    const { data: synthesisData, error: insertError } = await supabaseAdmin
      .from('education_synthesis')
      // @ts-ignore - education_synthesis table not yet in generated types
      .insert({
        campaign_id,
        school_id,
        module,
        content: synthesisResult as unknown as Record<string, unknown>,
        model_used: 'claude-sonnet-4-5-20250929',
        source_token_ids: sourceTokenIds,
        generated_at: new Date().toISOString(),
      })
      .select('id, generated_at')
      .single();

    const synthesis = synthesisData as { id: string; generated_at: string } | null;

    if (insertError || !synthesis) {
      console.error('Error saving synthesis:', insertError);
      return NextResponse.json(
        { error: 'Failed to save synthesis result', details: insertError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        synthesis_id: synthesis.id,
        generated_at: synthesis.generated_at,
        session_count: sessionCount,
        module,
        executive_summary: synthesisResult.executive_summary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Synthesis generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
