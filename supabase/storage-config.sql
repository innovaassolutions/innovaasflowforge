-- =====================================================
-- STORAGE BUCKETS CONFIGURATION
-- =====================================================

-- Create storage bucket for session documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-documents', 'session-documents', false);

-- Create storage bucket for knowledge base assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-assets', 'knowledge-assets', true);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Session documents: Authenticated users can upload
CREATE POLICY "Authenticated users can upload session documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'session-documents');

-- Session documents: Users can view their own session documents
CREATE POLICY "Users can view their session documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'session-documents');

-- Session documents: Service role can delete
CREATE POLICY "Service role can delete session documents"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'session-documents');

-- Knowledge assets: Public read access
CREATE POLICY "Public read access to knowledge assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'knowledge-assets');

-- Knowledge assets: Authenticated users can upload
CREATE POLICY "Authenticated users can upload knowledge assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'knowledge-assets');
