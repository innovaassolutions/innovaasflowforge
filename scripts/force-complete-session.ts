import { supabaseAdmin } from '@/lib/supabase/server'

async function forceCompleteSession() {
  try {
    const sessionId = '34553fd9-9a5a-4c0b-854f-27d61a6a5add' // Malcom's session

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
    console.log('\nSession successfully marked as completed!')

  } catch (error) {
    console.error('Script error:', error)
  }
}

forceCompleteSession()
