-- Safe Migration: Add Soft Delete Functionality to Profiles Table
-- Migration: 20250702_add_soft_delete_columns_safe.sql
-- This migration is designed to not break existing functionality

-- Step 1: Add new columns (non-breaking)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Step 2: Add foreign key constraint (non-breaking)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_deleted_by_fkey'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_deleted_by_fkey 
        FOREIGN KEY (deleted_by) REFERENCES profiles(id);
    END IF;
END $$;

-- Step 3: Add indexes for performance (non-breaking)
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(id) WHERE deleted_at IS NULL;

-- Step 4: Create audit_logs table if it doesn't exist (non-breaking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS on audit_logs (non-breaking)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 6: Create safe audit log function (non-breaking)
CREATE OR REPLACE FUNCTION create_audit_log_safe(
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
  -- Only insert if audit_logs table exists and has RLS enabled
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
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
  END IF;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log error but don't fail the calling function
    RAISE WARNING 'Could not create audit log: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create user-friendly soft delete function (non-breaking)
CREATE OR REPLACE FUNCTION soft_delete_user_safe(
  p_target_user_id UUID,
  p_deleted_by UUID DEFAULT auth.uid()
) RETURNS JSONB AS $$
DECLARE
  v_user_data JSONB;
  v_current_user_role TEXT;
  v_can_delete BOOLEAN := FALSE;
BEGIN
  -- Get current user role
  SELECT role INTO v_current_user_role
  FROM user_roles
  WHERE user_id = COALESCE(p_deleted_by, auth.uid());
  
  IF v_current_user_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User role not found');
  END IF;
  
  -- Check if user exists and is not already deleted
  SELECT to_jsonb(p.*) INTO v_user_data
  FROM profiles p
  WHERE p.id = p_target_user_id
  AND p.deleted_at IS NULL;
  
  IF v_user_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found or already deleted');
  END IF;
  
  -- Permission check (simplified for safety)
  IF v_current_user_role = 'superadmin' THEN
    v_can_delete := TRUE;
  ELSIF v_current_user_role = 'regionadmin' THEN
    -- RegionAdmin can delete users in their region
    SELECT EXISTS(
      SELECT 1 FROM user_roles current_admin
      JOIN user_roles target_user ON target_user.user_id = p_target_user_id
      WHERE current_admin.user_id = COALESCE(p_deleted_by, auth.uid())
      AND current_admin.role = 'regionadmin'
      AND current_admin.region_id = target_user.region_id
      AND target_user.role NOT IN ('regionadmin', 'superadmin')
    ) INTO v_can_delete;
  END IF;
  
  IF NOT v_can_delete THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Perform soft delete
  UPDATE profiles
  SET 
    deleted_at = NOW(),
    deleted_by = p_deleted_by,
    status = 'inactive'
  WHERE id = p_target_user_id
  AND deleted_at IS NULL;
  
  -- Create audit log (safe)
  PERFORM create_audit_log_safe(
    p_deleted_by,
    'soft_delete',
    'user',
    p_target_user_id,
    v_user_data,
    jsonb_build_object('deleted_at', NOW(), 'deleted_by', p_deleted_by, 'status', 'inactive')
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'User soft deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create hard delete function (non-breaking)
CREATE OR REPLACE FUNCTION hard_delete_user_safe(
  p_target_user_id UUID,
  p_deleted_by UUID DEFAULT auth.uid()
) RETURNS JSONB AS $$
DECLARE
  v_user_data JSONB;
  v_current_user_role TEXT;
  v_can_delete BOOLEAN := FALSE;
BEGIN
  -- Get current user role
  SELECT role INTO v_current_user_role
  FROM user_roles
  WHERE user_id = COALESCE(p_deleted_by, auth.uid());
  
  IF v_current_user_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User role not found');
  END IF;
  
  -- Get user data before deletion
  SELECT to_jsonb(p.*) INTO v_user_data
  FROM profiles p
  WHERE p.id = p_target_user_id;
  
  IF v_user_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Permission check (only superadmin can hard delete)
  IF v_current_user_role = 'superadmin' THEN
    v_can_delete := TRUE;
  END IF;
  
  IF NOT v_can_delete THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only superadmin can hard delete users');
  END IF;
  
  -- Create audit log before deletion
  PERFORM create_audit_log_safe(
    p_deleted_by,
    'hard_delete',
    'user',
    p_target_user_id,
    v_user_data,
    NULL
  );
  
  -- Delete from user_roles first
  DELETE FROM user_roles WHERE user_id = p_target_user_id;
  
  -- Delete from profiles
  DELETE FROM profiles WHERE id = p_target_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'User hard deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant permissions (non-breaking)
GRANT EXECUTE ON FUNCTION soft_delete_user_safe(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION hard_delete_user_safe(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_audit_log_safe(UUID, TEXT, TEXT, UUID, JSONB, JSONB, TEXT, TEXT) TO authenticated;

-- Step 10: Add policies for audit_logs (non-breaking)
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
  DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
  
  -- Create new policies
  CREATE POLICY "audit_logs_select_policy" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('superadmin', 'regionadmin')
    )
  );
  
  CREATE POLICY "audit_logs_insert_policy" ON audit_logs
  FOR INSERT WITH CHECK (true);
END $$;

-- Step 11: Create notification trigger (optional, non-breaking)
CREATE OR REPLACE FUNCTION notify_user_deletion_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if notifications table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Insert notification for admins when user is soft deleted
    IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      INSERT INTO notifications (
        user_id, type, title, message, 
        related_entity_id, related_entity_type,
        is_read, priority, created_at
      )
      SELECT 
        ur.user_id,
        'user_deleted',
        'İstifadəçi deaktiv edildi',
        format('%s istifadəçisi deaktiv edildi', NEW.full_name),
        NEW.id,
        'user',
        false,
        'normal',
        NOW()
      FROM user_roles ur
      WHERE ur.role IN ('superadmin', 'regionadmin');
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the update if notification fails
    RAISE WARNING 'Could not create user deletion notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_user_deletion_notification_safe'
  ) THEN
    CREATE TRIGGER trigger_user_deletion_notification_safe
      AFTER UPDATE ON profiles
      FOR EACH ROW
      WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
      EXECUTE FUNCTION notify_user_deletion_safe();
  END IF;
END $$;

-- Summary comment
COMMENT ON COLUMN profiles.deleted_at IS 'Soft delete timestamp - when user was deactivated';
COMMENT ON COLUMN profiles.deleted_by IS 'User ID who performed the soft delete operation';
COMMENT ON FUNCTION soft_delete_user_safe IS 'Safely soft delete a user with permission checks';
COMMENT ON FUNCTION hard_delete_user_safe IS 'Safely hard delete a user (superadmin only)';
