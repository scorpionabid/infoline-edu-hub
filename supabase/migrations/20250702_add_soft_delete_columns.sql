-- Add Soft Delete Functionality to Profiles Table
-- Migration: 20250702_add_soft_delete_columns.sql

-- Add deleted_at and deleted_by columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- Add index for better performance on queries filtering out deleted users
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(id) WHERE deleted_at IS NULL;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS to audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit_logs (only superadmin and regionadmin can view)
CREATE POLICY "SuperAdmin and RegionAdmin view audit logs" ON audit_logs
FOR SELECT USING (
  public.user_has_role('superadmin') OR
  public.user_has_role('regionadmin')
);

-- Create policy for audit_logs INSERT (system can insert)
CREATE POLICY "System creates audit logs" ON audit_logs
FOR INSERT WITH CHECK (true);

-- Create audit log function
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_value,
    p_new_value,
    p_ip_address,
    p_user_agent,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create soft delete function
CREATE OR REPLACE FUNCTION soft_delete_user(
  p_target_user_id UUID,
  p_deleted_by UUID DEFAULT auth.uid()
) RETURNS JSONB AS $$
DECLARE
  v_user_data JSONB;
  v_current_user_role TEXT;
  v_target_user_role TEXT;
  v_can_delete BOOLEAN := FALSE;
BEGIN
  -- Check if the user performing delete exists and get their role
  SELECT role INTO v_current_user_role
  FROM user_roles
  WHERE user_id = p_deleted_by;
  
  IF v_current_user_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: No role found');
  END IF;
  
  -- Get target user data for audit log
  SELECT to_jsonb(p.*) INTO v_user_data
  FROM profiles p
  WHERE p.id = p_target_user_id
  AND p.deleted_at IS NULL;
  
  IF v_user_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found or already deleted');
  END IF;
  
  -- Get target user role
  SELECT role INTO v_target_user_role
  FROM user_roles
  WHERE user_id = p_target_user_id;
  
  -- Check permissions
  IF v_current_user_role = 'superadmin' THEN
    v_can_delete := TRUE;
  ELSIF v_current_user_role = 'regionadmin' THEN
    -- RegionAdmin can soft delete users in their region (except other regionadmins and superadmins)
    IF v_target_user_role NOT IN ('regionadmin', 'superadmin') THEN
      SELECT EXISTS(
        SELECT 1 FROM user_roles current_admin
        JOIN user_roles target_user ON target_user.user_id = p_target_user_id
        WHERE current_admin.user_id = p_deleted_by
        AND current_admin.role = 'regionadmin'
        AND current_admin.region_id = target_user.region_id
      ) INTO v_can_delete;
    END IF;
  ELSIF v_current_user_role = 'sectoradmin' THEN
    -- SectorAdmin can soft delete schooladmins in their sector
    IF v_target_user_role = 'schooladmin' THEN
      SELECT EXISTS(
        SELECT 1 FROM user_roles current_admin
        JOIN user_roles target_user ON target_user.user_id = p_target_user_id
        WHERE current_admin.user_id = p_deleted_by
        AND current_admin.role = 'sectoradmin'
        AND current_admin.sector_id = target_user.sector_id
      ) INTO v_can_delete;
    END IF;
  END IF;
  
  IF NOT v_can_delete THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied: Cannot delete this user');
  END IF;
  
  -- Perform soft delete
  UPDATE profiles
  SET 
    deleted_at = NOW(),
    deleted_by = p_deleted_by,
    status = 'inactive'
  WHERE id = p_target_user_id
  AND deleted_at IS NULL;
  
  -- Create audit log
  PERFORM create_audit_log(
    p_deleted_by,
    'soft_delete',
    'user',
    p_target_user_id,
    v_user_data,
    jsonb_build_object('deleted_at', NOW(), 'deleted_by', p_deleted_by, 'status', 'inactive')
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'User soft deleted successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create hard delete function
CREATE OR REPLACE FUNCTION hard_delete_user(
  p_target_user_id UUID,
  p_deleted_by UUID DEFAULT auth.uid()
) RETURNS JSONB AS $$
DECLARE
  v_user_data JSONB;
  v_current_user_role TEXT;
  v_target_user_role TEXT;
  v_can_delete BOOLEAN := FALSE;
BEGIN
  -- Check if the user performing delete exists and get their role
  SELECT role INTO v_current_user_role
  FROM user_roles
  WHERE user_id = p_deleted_by;
  
  IF v_current_user_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: No role found');
  END IF;
  
  -- Get target user data for audit log
  SELECT to_jsonb(p.*) INTO v_user_data
  FROM profiles p
  WHERE p.id = p_target_user_id;
  
  IF v_user_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Get target user role
  SELECT role INTO v_target_user_role
  FROM user_roles
  WHERE user_id = p_target_user_id;
  
  -- Check permissions (same as soft delete but stricter)
  IF v_current_user_role = 'superadmin' THEN
    -- SuperAdmin can hard delete anyone except other superadmins
    v_can_delete := (v_target_user_role != 'superadmin' OR p_target_user_id != p_deleted_by);
  ELSIF v_current_user_role = 'regionadmin' THEN
    -- RegionAdmin can hard delete users in their region (except other regionadmins and superadmins)
    IF v_target_user_role NOT IN ('regionadmin', 'superadmin') THEN
      SELECT EXISTS(
        SELECT 1 FROM user_roles current_admin
        JOIN user_roles target_user ON target_user.user_id = p_target_user_id
        WHERE current_admin.user_id = p_deleted_by
        AND current_admin.role = 'regionadmin'
        AND current_admin.region_id = target_user.region_id
      ) INTO v_can_delete;
    END IF;
  END IF;
  
  IF NOT v_can_delete THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied: Cannot hard delete this user');
  END IF;
  
  -- Create audit log before deletion
  PERFORM create_audit_log(
    p_deleted_by,
    'hard_delete',
    'user',
    p_target_user_id,
    v_user_data,
    NULL
  );
  
  -- Delete from user_roles first (foreign key constraint)
  DELETE FROM user_roles WHERE user_id = p_target_user_id;
  
  -- Delete from profiles
  DELETE FROM profiles WHERE id = p_target_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'User hard deleted successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to exclude soft-deleted users from normal queries
-- First drop the existing policy, then recreate
DO $$
BEGIN
  -- Drop existing policies that might conflict
  DROP POLICY IF EXISTS "RegionAdmin views region profiles" ON profiles;
  DROP POLICY IF EXISTS "SectorAdmin views sector profiles" ON profiles;
  DROP POLICY IF EXISTS "SchoolAdmin views own profile" ON profiles;
  DROP POLICY IF EXISTS "Users view own profile" ON profiles;
  
  -- Create new policies that exclude soft-deleted users
  CREATE POLICY "RegionAdmin views active region profiles" ON profiles
  FOR SELECT USING (
    (deleted_at IS NULL) AND (
      -- Users can see their own profile
      id = auth.uid() OR
      -- RegionAdmin can see users in their region
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
    )
  );
  
  CREATE POLICY "SectorAdmin views active sector profiles" ON profiles
  FOR SELECT USING (
    (deleted_at IS NULL) AND (
      -- Users can see their own profile
      id = auth.uid() OR
      -- SectorAdmin can see users in their sector
      EXISTS (
        SELECT 1 FROM user_roles current_admin
        WHERE current_admin.user_id = auth.uid() 
        AND current_admin.role = 'sectoradmin'
        AND current_admin.sector_id IN (
          SELECT target_user.sector_id 
          FROM user_roles target_user 
          WHERE target_user.user_id = profiles.id
          AND target_user.sector_id IS NOT NULL
        )
      )
    )
  );
  
  CREATE POLICY "SchoolAdmin views own active profile" ON profiles
  FOR SELECT USING (
    (deleted_at IS NULL) AND id = auth.uid()
  );
  
  CREATE POLICY "SuperAdmin views all profiles including deleted" ON profiles
  FOR SELECT USING (
    public.user_has_role('superadmin')
  );
  
  -- Update policies for other operations remain the same but add deleted_at check
  CREATE POLICY "RegionAdmin updates active region profiles" ON profiles
  FOR UPDATE USING (
    (deleted_at IS NULL) AND (
      id = auth.uid() OR
      public.user_has_role('superadmin') OR
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
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Log error but continue
  RAISE NOTICE 'Error updating policies: %', SQLERRM;
END $$;

-- Create notification function for user deletions
CREATE OR REPLACE FUNCTION notify_user_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_deleter_name TEXT;
  v_notification_title TEXT;
  v_notification_message TEXT;
BEGIN
  -- Get deleter name
  SELECT full_name INTO v_deleter_name
  FROM profiles
  WHERE id = NEW.deleted_by;
  
  -- Create notification for admins
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    v_notification_title := 'İstifadəçi Deaktiv Edildi';
    v_notification_message := format('%s istifadəçisi %s tərəfindən deaktiv edildi', 
                                   NEW.full_name, COALESCE(v_deleter_name, 'Naməlum'));
    
    -- Insert notification for superadmins and regionadmins
    INSERT INTO notifications (
      user_id, type, title, message, 
      related_entity_id, related_entity_type,
      is_read, priority, created_at
    )
    SELECT 
      ur.user_id,
      'user_deleted',
      v_notification_title,
      v_notification_message,
      NEW.id,
      'user',
      false,
      'normal',
      NOW()
    FROM user_roles ur
    WHERE ur.role IN ('superadmin', 'regionadmin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user deletion notifications
DROP TRIGGER IF EXISTS trigger_user_deletion_notification ON profiles;
CREATE TRIGGER trigger_user_deletion_notification
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
  EXECUTE FUNCTION notify_user_deletion();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION soft_delete_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION hard_delete_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_audit_log(UUID, TEXT, TEXT, UUID, JSONB, JSONB, TEXT, TEXT) TO authenticated;
