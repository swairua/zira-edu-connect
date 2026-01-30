-- Add motto column to institutions table for school branding
ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS motto text;

-- Create storage bucket for institution logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('institution-logos', 'institution-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to logos
CREATE POLICY "Institution logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'institution-logos');

-- Allow authenticated users to upload logos for their institution
CREATE POLICY "Users can upload institution logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'institution-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update logos
CREATE POLICY "Users can update institution logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'institution-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete logos
CREATE POLICY "Users can delete institution logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'institution-logos' 
  AND auth.role() = 'authenticated'
);