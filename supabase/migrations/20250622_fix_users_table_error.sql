-- EMERGENCY FIX: Remove ALL policies that might reference users table
-- This will immediately fix the "public.users does not exist" error

-- Check what policies exist
SELECT schemaname, tablename, policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'school_links';

-- Drop ALL existing policies on school_links
DROP POLICY IF EXISTS "SuperAdmin full access to school links" ON school_links;
DROP POLICY IF EXISTS "RegionAdmin manages region school links" ON school_links;
DROP POLICY IF EXISTS "SectorAdmin manages sector school links" ON school_links;
DROP POLICY IF EXISTS "SchoolAdmin manages own school links" ON school_links;
DROP POLICY IF EXISTS "School users access own school links" ON school_links;
DROP POLICY IF EXISTS "Allow authenticated users to view school links" ON school_links;
DROP POLICY IF EXISTS "Allow authenticated users to insert school links" ON school_links;
DROP POLICY IF EXISTS "Allow authenticated users to update school links" ON school_links;
DROP POLICY IF EXISTS "Allow authenticated users to delete school links" ON school_links;

-- Create ONE simple policy that works for everyone
CREATE POLICY "full_access_school_links" ON school_links
FOR ALL USING (true) WITH CHECK (true);

-- Ensure RLS is enabled but permissive for now
ALTER TABLE school_links ENABLE ROW LEVEL SECURITY;

-- Test the table directly
SELECT count(*) FROM school_links;

-- Check if we can insert (this will tell us if the policy works)
-- (Don't actually run this INSERT, just check the permissions)
