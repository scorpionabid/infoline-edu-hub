-- Fix RegionAdmin User Visibility Issue
-- RegionAdmin should see ALL users in their region, including other regionadmins

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "RegionAdmin views region profiles" ON profiles;
DROP POLICY IF EXISTS "SectorAdmin views sector profiles" ON profiles;

-- Create improved RegionAdmin policy that allows viewing ALL users in their region
CREATE POLICY "RegionAdmin views region profiles" ON profiles
FOR SELECT USING (
  -- SuperAdmin can see all
  public.user_has_role('superadmin') OR
  -- Users can see their own profile
  id = auth.uid() OR
  -- RegionAdmin can see all users in their region(s)
  EXISTS (
    SELECT 1 FROM user_roles current_user_role
    WHERE current_user_role.user_id = auth.uid() 
    AND current_user_role.role = 'regionadmin'
    AND current_user_role.region_id IN (
      SELECT ur.region_id FROM user_roles ur 
      WHERE ur.user_id = profiles.id
      AND ur.region_id IS NOT NULL
    )
  )
);

-- Create improved SectorAdmin policy that allows viewing users in their sector AND region
CREATE POLICY "SectorAdmin views sector profiles" ON profiles
FOR SELECT USING (
  -- SuperAdmin can see all
  public.user_has_role('superadmin') OR
  -- Users can see their own profile
  id = auth.uid() OR
  -- SectorAdmin can see users in their sector
  EXISTS (
    SELECT 1 FROM user_roles current_user_role
    WHERE current_user_role.user_id = auth.uid() 
    AND current_user_role.role = 'sectoradmin'
    AND current_user_role.sector_id IN (
      SELECT ur.sector_id FROM user_roles ur 
      WHERE ur.user_id = profiles.id
      AND ur.sector_id IS NOT NULL
    )
  ) OR
  -- SectorAdmin can also see users in their region (regionadmins)
  EXISTS (
    SELECT 1 FROM user_roles current_user_role
    WHERE current_user_role.user_id = auth.uid() 
    AND current_user_role.role = 'sectoradmin'
    AND current_user_role.region_id IN (
      SELECT ur.region_id FROM user_roles ur 
      WHERE ur.user_id = profiles.id
      AND ur.role = 'regionadmin'
    )
  )
);

-- Also create update policies for RegionAdmin and SectorAdmin
CREATE POLICY "RegionAdmin updates region profiles" ON profiles
FOR UPDATE USING (
  -- SuperAdmin can update all
  public.user_has_role('superadmin') OR
  -- Users can update their own profile
  id = auth.uid() OR
  -- RegionAdmin can update users in their region
  EXISTS (
    SELECT 1 FROM user_roles current_user_role
    WHERE current_user_role.user_id = auth.uid() 
    AND current_user_role.role = 'regionadmin'
    AND current_user_role.region_id IN (
      SELECT ur.region_id FROM user_roles ur 
      WHERE ur.user_id = profiles.id
      AND ur.region_id IS NOT NULL
    )
  )
);

CREATE POLICY "SectorAdmin updates sector profiles" ON profiles
FOR UPDATE USING (
  -- SuperAdmin can update all
  public.user_has_role('superadmin') OR
  -- Users can update their own profile
  id = auth.uid() OR
  -- SectorAdmin can update users in their sector
  EXISTS (
    SELECT 1 FROM user_roles current_user_role
    WHERE current_user_role.user_id = auth.uid() 
    AND current_user_role.role = 'sectoradmin'
    AND current_user_role.sector_id IN (
      SELECT ur.sector_id FROM user_roles ur 
      WHERE ur.user_id = profiles.id
      AND ur.sector_id IS NOT NULL
    )
  )
);

-- Test the policy with a sample query
-- RegionAdmin should now see all users in their region including other regionadmins
