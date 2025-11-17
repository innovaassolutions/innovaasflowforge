import { supabaseAdmin } from '@/lib/supabase/server'

async function checkSessionStatus() {
  try {
    // Get the campaign ID from the URL shown in the screenshot
    const campaignId = '678fb1d8-72d1-408d-829d-799ec5d26007'

    // Get all stakeholder sessions for this campaign
    const { data: sessions, error } = await supabaseAdmin
      .from('stakeholder_sessions')
      .select(`
        id,
        stakeholder_name,
        stakeholder_role,
        status,
        started_at,
        completed_at
      `)
      .eq('campaign_id', campaignId)

    if (error) {
      console.error('Error fetching sessions:', error)
      return
    }

    console.log('\n=== STAKEHOLDER SESSIONS ===')
    sessions?.forEach(session => {
      console.log(`\nName: ${session.stakeholder_name}`)
      console.log(`Role: ${session.stakeholder_role}`)
      console.log(`Status: ${session.status}`)
      console.log(`Started: ${session.started_at}`)
      console.log(`Completed: ${session.completed_at}`)
      console.log(`Session ID: ${session.id}`)
    })

    // Get agent sessions with conversation state
    const { data: agentSessions, error: agentError } = await supabaseAdmin
      .from('agent_sessions')
      .select(`
        id,
        stakeholder_session_id,
        session_context,
        conversation_history
      `)
      .in('stakeholder_session_id', sessions?.map(s => s.id) || [])

    if (agentError) {
      console.error('Error fetching agent sessions:', agentError)
      return
    }

    console.log('\n=== AGENT SESSION STATES ===')
    agentSessions?.forEach(agentSession => {
      const stakeholder = sessions?.find(s => s.id === agentSession.stakeholder_session_id)
      console.log(`\nStakeholder: ${stakeholder?.stakeholder_name}`)
      console.log(`Questions Asked: ${agentSession.session_context?.questions_asked || 0}`)
      console.log(`Phase: ${agentSession.session_context?.phase || 'unknown'}`)
      console.log(`Is Complete Flag: ${agentSession.session_context?.is_complete || false}`)
      console.log(`Message Count: ${agentSession.conversation_history?.length || 0}`)
    })

  } catch (error) {
    console.error('Script error:', error)
  }
}

checkSessionStatus()
