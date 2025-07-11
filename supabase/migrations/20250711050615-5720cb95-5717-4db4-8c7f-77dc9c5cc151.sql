-- Phase 1: File Management System - Real Data Implementation
-- Create storage buckets for school files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('school-files', 'school-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for school files storage
CREATE POLICY "Authenticated users can view school files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'school-files');

CREATE POLICY "School admins can upload files to their schools" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'school-files' AND
  (storage.foldername(name))[1] IN (
    SELECT s.id::text 
    FROM schools s
    JOIN user_roles ur ON ur.school_id = s.id
    WHERE ur.user_id = auth.uid() AND ur.role = 'schooladmin'
    UNION
    SELECT s.id::text 
    FROM schools s
    WHERE EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND (ur.role = 'superadmin' OR 
           (ur.role = 'regionadmin' AND ur.region_id = s.region_id) OR
           (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id))
    )
  )
);

CREATE POLICY "School admins can update their school files" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'school-files' AND
  (storage.foldername(name))[1] IN (
    SELECT s.id::text 
    FROM schools s
    JOIN user_roles ur ON ur.school_id = s.id
    WHERE ur.user_id = auth.uid() AND ur.role = 'schooladmin'
    UNION
    SELECT s.id::text 
    FROM schools s
    WHERE EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND (ur.role = 'superadmin' OR 
           (ur.role = 'regionadmin' AND ur.region_id = s.region_id) OR
           (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id))
    )
  )
);

CREATE POLICY "School admins can delete their school files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'school-files' AND
  (storage.foldername(name))[1] IN (
    SELECT s.id::text 
    FROM schools s
    JOIN user_roles ur ON ur.school_id = s.id
    WHERE ur.user_id = auth.uid() AND ur.role = 'schooladmin'
    UNION
    SELECT s.id::text 
    FROM schools s
    WHERE EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND (ur.role = 'superadmin' OR 
           (ur.role = 'regionadmin' AND ur.region_id = s.region_id) OR
           (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id))
    )
  )
);

-- Update school_files table to work better with real data
ALTER TABLE school_files ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE school_files ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE school_files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Create function to get file URL with download tracking
CREATE OR REPLACE FUNCTION get_school_file_url(file_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_path TEXT;
  signed_url TEXT;
BEGIN
  -- Get file path
  SELECT sf.file_path INTO file_path
  FROM school_files sf
  WHERE sf.id = file_id AND sf.is_active = true;
  
  IF file_path IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Increment download count
  UPDATE school_files 
  SET download_count = download_count + 1
  WHERE id = file_id;
  
  -- Return the file path (frontend will create signed URL)
  RETURN file_path;
END;
$$;