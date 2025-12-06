import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// DELETE - Remove an uploaded document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; documentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { token, documentId } = await params

    // Find session by access token
    const { data: session, error: sessionError } = await supabase
      .from('stakeholder_sessions')
      .select('id')
      .eq('access_token', token)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get document details before deleting
    const { data: document, error: docError } = await supabase
      .from('session_documents')
      .select('storage_path, storage_bucket, stakeholder_session_id')
      .eq('id', documentId)
      .eq('stakeholder_session_id', session.id) // Ensure document belongs to this session
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(document.storage_bucket)
      .remove([document.storage_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue with database deletion even if storage delete fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('session_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    // Check if there are any remaining documents
    const { data: remainingDocs } = await supabase
      .from('session_documents')
      .select('id')
      .eq('stakeholder_session_id', session.id)

    // Update session flag if no documents remain
    if (!remainingDocs || remainingDocs.length === 0) {
      await supabase
        .from('stakeholder_sessions')
        .update({ has_uploaded_documents: false })
        .eq('id', session.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Error in document DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
