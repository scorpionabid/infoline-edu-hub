-- CORRECTED RLS POLICIES for school_links
-- These policies use 'profiles' instead of non-existent 'users' table

-- STEP 1: Drop all existing problematic policies
DROP POLICY IF EXISTS "RegionAdmins can manage links in their region" ON school_links;
DROP POLICY IF EXISTS "School users access own school links" ON school_links;
DROP POLICY IF EXISTS "SchoolAdmins can view their school links" ON school_links;
DROP POLICY IF EXISTS "SectorAdmins can manage links in their sector" ON school_links;
DROP POLICY IF EXISTS "SuperAdmin full access to school links" ON school_links;
DROP POLICY IF EXISTS "SuperAdmins can manage all school links" ON school_links;

-- STEP 2: Create corrected policies using existing tables

-- SuperAdmin - full access
CREATE POLICY "superadmin_school_links_all" ON school_links
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- RegionAdmin - can manage links for schools in their region
CREATE POLICY "regionadmin_school_links" ON school_links
FOR ALL USING (
  school_id IN (
    SELECT s.id FROM schools s
    JOIN user_roles ur ON ur.region_id = s.region_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'regionadmin'
  )
);

-- SectorAdmin - can manage links for schools in their sector  
CREATE POLICY "sectoradmin_school_links" ON school_links
FOR ALL USING (
  school_id IN (
    SELECT s.id FROM schools s
    JOIN user_roles ur ON ur.sector_id = s.sector_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'sectoradmin'
  )
);

-- SchoolAdmin - can manage links for their own school
CREATE POLICY "schooladmin_school_links" ON school_links
FOR ALL USING (
  school_id IN (
    SELECT school_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'schooladmin'
  )
);

-- Enable RLS
ALTER TABLE school_links ENABLE ROW LEVEL SECURITY;

-- Test query to ensure policies work
-- SELECT COUNT(*) FROM school_links; -- Should work without errors
