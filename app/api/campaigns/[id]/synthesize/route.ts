import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { synthesizeCampaign } from '@/lib/agents/synthesis-agent'
import {
  generateMarkdownReport,
  generatePDFReportData,
  generateReportFilename,
  type ReportMetadata
} from '@/lib/report-generator'

/**
 * POST /api/campaigns/[id]/synthesize
 * Generate comprehensive readiness assessment report from completed interviews
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const body = await request.json()
    const { format = 'markdown' } = body // 'markdown' or 'pdf-data'

    console.log(`[Synthesize] Starting synthesis for campaign ${campaignId}`)

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await (supabaseAdmin
      .from('campaigns') as any)
      .select('id, name, company_name, facilitator_name, description')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if all stakeholders have completed their interviews
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('campaign_assignments')
      .select('id, status, stakeholder_name')
      .eq('campaign_id', campaignId)

    if (sessionsError) {
      console.error('[Synthesize] Sessions fetch error:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: sessionsError.message },
        { status: 500 }
      )
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'No stakeholder sessions found for this campaign' },
        { status: 400 }
      )
    }

    const totalSessions = sessions.length
    const completedSessions = sessions.filter((s: any) => s.status === 'completed')
    const incompleteSessions = sessions.filter((s: any) => s.status !== 'completed')

    console.log(`[Synthesize] Status: ${completedSessions.length}/${totalSessions} completed`)

    if (completedSessions.length === 0) {
      return NextResponse.json(
        { error: 'No completed interviews found. At least one interview must be completed to generate a report.' },
        { status: 400 }
      )
    }

    // Allow synthesis even if not all sessions complete, but warn user
    const allComplete = incompleteSessions.length === 0

    // Run synthesis agent
    console.log(`[Synthesize] Running synthesis agent...`)
    const assessment = await synthesizeCampaign(campaignId)

    console.log(`[Synthesize] Synthesis complete. Overall score: ${assessment.overallScore.toFixed(1)}`)

    // Prepare metadata
    const metadata: ReportMetadata = {
      campaignName: campaign.name,
      companyName: campaign.company_name,
      facilitatorName: campaign.facilitator_name,
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      stakeholderCount: completedSessions.length
    }

    // Generate report in requested format
    if (format === 'pdf-data') {
      // Return structured data for PDF rendering
      const pdfData = generatePDFReportData(assessment, metadata)

      return NextResponse.json({
        success: true,
        format: 'pdf-data',
        data: pdfData,
        filename: generateReportFilename(
          campaign.company_name,
          campaign.name,
          'pdf'
        ),
        allSessionsComplete: allComplete,
        sessionsIncluded: completedSessions.length,
        sessionsTotal: totalSessions
      })
    } else {
      // Generate markdown report
      const markdownReport = generateMarkdownReport(assessment, metadata)

      return NextResponse.json({
        success: true,
        format: 'markdown',
        report: markdownReport,
        assessment: {
          overallScore: assessment.overallScore,
          pillars: assessment.pillars.map(p => ({
            name: p.pillar,
            score: p.score,
            dimensionCount: p.dimensions.length
          })),
          themeCount: assessment.keyThemes.length,
          recommendationCount: assessment.recommendations.length
        },
        filename: generateReportFilename(
          campaign.company_name,
          campaign.name,
          'md'
        ),
        allSessionsComplete: allComplete,
        sessionsIncluded: completedSessions.length,
        sessionsTotal: totalSessions,
        incompleteSessions: incompleteSessions.map((s: any) => s.stakeholder_name)
      })
    }

  } catch (error) {
    console.error('[Synthesize] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate synthesis report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/campaigns/[id]/synthesize
 * Check synthesis readiness (how many sessions complete, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, company_name')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check session status
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('campaign_assignments')
      .select('id, status, stakeholder_name, stakeholder_role')
      .eq('campaign_id', campaignId)

    if (sessionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: sessionsError.message },
        { status: 500 }
      )
    }

    const totalSessions = sessions?.length || 0
    const completedSessions = sessions?.filter((s: any) => s.status === 'completed') || []
    const incompleteSessions = sessions?.filter((s: any) => s.status !== 'completed') || []

    return NextResponse.json({
      success: true,
      ready: completedSessions.length > 0,
      allComplete: incompleteSessions.length === 0,
      stats: {
        total: totalSessions,
        completed: completedSessions.length,
        incomplete: incompleteSessions.length,
        percentComplete: totalSessions > 0
          ? Math.round((completedSessions.length / totalSessions) * 100)
          : 0
      },
      completedStakeholders: completedSessions.map((s: any) => ({
        name: s.stakeholder_name,
        role: s.stakeholder_role
      })),
      incompleteStakeholders: incompleteSessions.map((s: any) => ({
        name: s.stakeholder_name,
        role: s.stakeholder_role,
        status: s.status
      }))
    })

  } catch (error) {
    console.error('[Synthesize Readiness Check] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check synthesis readiness',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
