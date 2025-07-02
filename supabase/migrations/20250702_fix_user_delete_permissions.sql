-- Fix User Delete Permissions and Visibility Issues
-- Add DELETE and UPDATE permissions for profiles table

-- Drop existing policies
DROP POLICY IF EXISTS "RegionAdmin views region profiles" ON profiles;
DROP POLICY IF EXISTS "RegionAdmin updates region profiles" ON profiles;

-- Enhanced RegionAdmin policy for SELECT
CREATE POLICY "RegionAdmin views region profiles" ON profiles
FOR SELECT USING (
  -- Users can see their own profile
  id = auth.uid() OR
  -- RegionAdmin can see ALL users in their region (including other regionadmins)
  EXISTS (
    SELECT 1 FROM user_roles current_admin
    WHERE current_admin.user_id = auth.uid() 
    AND current_admin.role = 'regionadmin'
    AND current_admin.region_id IN (
      SELECT target_user.region_id 
      FROM user_roles target_user 
      WHERE target_user.user_id = profiles.id
      AND target_user.region_id IS NOT NULL
    )
  )
);

-- RegionAdmin UPDATE permission
CREATE POLICY "RegionAdmin updates region profiles" ON profiles
FOR UPDATE USING (
  -- Users can update their own profile
  id = auth.uid() OR
  -- SuperAdmin can update all
  public.user_has_role('superadmin') OR
  -- RegionAdmin can update users in their region
  EXISTS (
    SELECT 1 FROM user_roles current_admin
    WHERE current_admin.user_id = auth.uid() 
    AND current_admin.role = 'regionadmin'
    AND current_admin.region_id IN (
      SELECT target_user.region_id 
      FROM user_roles target_user 
      WHERE target_user.user_id = profiles.id
      AND target_user.region_id IS NOT NULL
    )
  )
);

-- RegionAdmin DELETE permission (for hard delete)
CREATE POLICY "RegionAdmin deletes region profiles" ON profiles
FOR DELETE USING (
  -- SuperAdmin can delete all
  public.user_has_role('superadmin') OR
  -- RegionAdmin can delete users in their region (except other regionadmins)
  EXISTS (
    SELECT 1 FROM user_roles current_admin
    JOIN user_roles target_user ON target_user.user_id = profiles.id
    WHERE current_admin.user_id = auth.uid() 
    AND current_admin.role = 'regionadmin'
    AND current_admin.region_id = target_user.region_id
    AND target_user.role != 'regionadmin'  -- Cannot delete other regionadmins
    AND target_user.role != 'superadmin'   -- Cannot delete superadmins
  )
);

-- SectorAdmin DELETE permission  
CREATE POLICY "SectorAdmin deletes sector profiles" ON profiles
FOR DELETE USING (
  -- SuperAdmin can delete all
  public.user_has_role('superadmin') OR
  -- SectorAdmin can delete users in their sector (except regionadmins and other sectoradmins)
  EXISTS (
    SELECT 1 FROM user_roles current_admin
    JOIN user_roles target_user ON target_user.user_id = profiles.id
    WHERE current_admin.user_id = auth.uid() 
    AND current_admin.role = 'sectoradmin'
    AND current_admin.sector_id = target_user.sector_id
    AND target_user.role = 'schooladmin'   -- Can only delete schooladmins
  )
);
