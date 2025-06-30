-- Create missing user_has_role function first
CREATE OR REPLACE FUNCTION public.user_has_role(role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = role_name
  );
END;
$;

-- Add RLS policies for sector_data_entries table
-- This migration adds missing RLS policies for sector data entries

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "SuperAdmin full access to sector data entries" ON sector_data_entries;
DROP POLICY IF EXISTS "RegionAdmin views region sector data" ON sector_data_entries;
DROP POLICY IF EXISTS "SectorAdmin views own sector data" ON sector_data_entries;
DROP POLICY IF EXISTS "SectorAdmin manages own sector data" ON sector_data_entries;
DROP POLICY IF EXISTS "SectorAdmin inserts own sector data" ON sector_data_entries;
DROP POLICY IF EXISTS "SectorAdmin updates own sector data" ON sector_data_entries;

-- SECTOR DATA ENTRIES POLICIES
CREATE POLICY "SuperAdmin full access to sector data entries" ON sector_data_entries
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "RegionAdmin views region sector data" ON sector_data_entries
FOR ALL USING (
  sector_id IN (
    SELECT s.id FROM sectors s
    JOIN user_roles ur ON ur.region_id = s.region_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'regionadmin'
  )
);

CREATE POLICY "SectorAdmin manages own sector data" ON sector_data_entries
FOR ALL USING (
  sector_id IN (
    SELECT sector_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'sectoradmin'
  )
);

-- Allow SectorAdmin to insert data for their own sector
CREATE POLICY "SectorAdmin inserts own sector data" ON sector_data_entries
FOR INSERT WITH CHECK (
  sector_id IN (
    SELECT sector_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'sectoradmin'
  )
);

-- Allow SectorAdmin to update data for their own sector
CREATE POLICY "SectorAdmin updates own sector data" ON sector_data_entries
FOR UPDATE USING (
  sector_id IN (
    SELECT sector_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'sectoradmin'
  )
);
