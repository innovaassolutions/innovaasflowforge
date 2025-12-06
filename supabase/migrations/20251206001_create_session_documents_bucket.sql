-- Create storage bucket for session documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-documents', 'session-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for session documents bucket
CREATE POLICY "Users can upload documents to their sessions"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'session-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stakeholder_sessions
    WHERE access_token = current_setting('request.headers')::json->>'authorization'
  )
);

CREATE POLICY "Users can view their session documents"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'session-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stakeholder_sessions
    WHERE access_token = current_setting('request.headers')::json->>'authorization'
  )
);

CREATE POLICY "Users can delete their session documents"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'session-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stakeholder_sessions
    WHERE access_token = current_setting('request.headers')::json->>'authorization'
  )
);

-- Allow service role full access
CREATE POLICY "Service role has full access to session documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'session-documents')
WITH CHECK (bucket_id = 'session-documents');
