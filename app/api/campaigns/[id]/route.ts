import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/campaigns/[id]
 * Get campaign details with stakeholder sessions
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
      .select('*')
      .eq('id', campaignId)
      .single() as any

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch stakeholder sessions
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('campaign_assignments')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true }) as any

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: sessionsError.message },
        { status: 500 }
      )
    }

    // Calculate progress statistics
    const totalSessions = sessions?.length || 0
    const completedSessions = sessions?.filter((s: any) => s.status === 'completed').length || 0
    const inProgressSessions = sessions?.filter((s: any) => s.status === 'in_progress').length || 0
    const pendingSessions = sessions?.filter((s: any) => s.status === 'pending').length || 0

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        stakeholders: sessions,
        progress: {
          total: totalSessions,
          completed: completedSessions,
          inProgress: inProgressSessions,
          pending: pendingSessions,
          percentComplete: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
        }
      }
    })

  } catch (error) {
    console.error('Campaign fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update campaign details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const body = await request.json()

    const { data: campaign, error } = await (supabaseAdmin
      .from('campaigns') as any)
      .update({
        name: body.name,
        description: body.description,
        status: body.status
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('Campaign update error:', error)
      return NextResponse.json(
        { error: 'Failed to update campaign', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Campaign update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign and all associated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    console.log(`🗑️ Attempting to delete campaign: ${campaignId}`)
    console.log(`🔑 Service role key configured:`, !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Delete campaign (cascades to campaign_assignments, agent_sessions, etc.)
    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

    if (error) {
      console.error('❌ Campaign deletion error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to delete campaign', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Campaign deleted successfully: ${campaignId}`)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Campaign deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
