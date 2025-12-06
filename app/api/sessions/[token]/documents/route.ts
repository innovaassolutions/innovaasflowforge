import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch uploaded documents for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

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

    // Fetch documents for this session
    const { data: documents, error: docsError } = await supabase
      .from('session_documents')
      .select('id, document_name, file_size, mime_type, created_at')
      .eq('stakeholder_session_id', session.id)
      .order('created_at', { ascending: true })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      documents: documents || []
    })
  } catch (error) {
    console.error('Error in documents GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Upload a new document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

    // Find session by access token
    const { data: session, error: sessionError } = await supabase
      .from('stakeholder_sessions')
      .select('id, stakeholder_name, campaigns(id, name)')
      .eq('access_token', token)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not supported' },
        { status: 400 }
      )
    }

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${session.id}/${timestamp}-${sanitizedFileName}`

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('session-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from('session_documents')
      .insert({
        stakeholder_session_id: session.id,
        document_name: file.name,
        document_type: 'other', // Could be enhanced with better type detection
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        storage_bucket: 'session-documents',
        processing_status: 'pending'
      })
      .select('id, document_name, file_size, mime_type')
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('session-documents').remove([storagePath])
      return NextResponse.json(
        { success: false, error: 'Failed to save document record' },
        { status: 500 }
      )
    }

    // Update session to mark that documents have been uploaded
    await supabase
      .from('stakeholder_sessions')
      .update({ has_uploaded_documents: true })
      .eq('id', session.id)

    return NextResponse.json({
      success: true,
      document
    })
  } catch (error) {
    console.error('Error in document POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
