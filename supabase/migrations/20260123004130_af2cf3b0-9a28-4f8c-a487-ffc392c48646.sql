-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-documents', 'quiz-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'quiz-documents' 
  AND auth.role() = 'authenticated'
);

-- Allow users to read their own uploaded files
CREATE POLICY "Users can read their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'quiz-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'quiz-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);