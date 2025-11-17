import { supabaseAdmin } from '@/lib/supabase/server'

async function fixGeorgeSession() {
  try {
    const sessionId = 'c5122b7e-e307-43a6-b9f9-a0078587aba4' // George's session

    // Update stakeholder session status
    const { error: statusError } = await supabaseAdmin
      .from('stakeholder_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (statusError) {
      console.error('Failed to update stakeholder session:', statusError)
      return
    }

    console.log('✅ Stakeholder session marked as completed')

    // Update agent session state
    const { data: agentSession, error: fetchError } = await supabaseAdmin
      .from('agent_sessions')
      .select('session_context')
      .eq('stakeholder_session_id', sessionId)
      .single()

    if (fetchError || !agentSession) {
      console.error('Failed to fetch agent session:', fetchError)
      return
    }

    const updatedContext = {
      ...agentSession.session_context,
      phase: 'completed',
      is_complete: true
    }

    const { error: contextError } = await supabaseAdmin
      .from('agent_sessions')
      .update({
        session_context: updatedContext
      })
      .eq('stakeholder_session_id', sessionId)

    if (contextError) {
      console.error('Failed to update agent session context:', contextError)
      return
    }

    console.log('✅ Agent session context updated with is_complete: true')
    console.log('\nGeorge\'s session successfully marked as completed!')

  } catch (error) {
    console.error('Script error:', error)
  }
}

fixGeorgeSession()
