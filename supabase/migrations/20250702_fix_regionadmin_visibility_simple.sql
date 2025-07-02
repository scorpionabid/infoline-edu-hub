-- Fix RegionAdmin User Visibility - Simple Solution
-- RegionAdmin should see ALL users assigned to their region, including other regionadmins

-- Drop existing RegionAdmin policy
DROP POLICY IF EXISTS "RegionAdmin views region profiles" ON profiles;

-- Create improved RegionAdmin policy
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
