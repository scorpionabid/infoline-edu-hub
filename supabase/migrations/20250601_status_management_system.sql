-- =========================================================
-- Status Management System Migration
-- Date: 2025-06-01
-- Description: Complete status transition system with validation and audit trail
-- =========================================================

-- 1. Status Enum Constraint
-- ========================================
DO $$ 
BEGIN
  -- Add constraint for valid status values (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'data_entries_status_check' 
    AND table_name = 'data_entries'
  ) THEN
    ALTER TABLE data_entries 
    ADD CONSTRAINT data_entries_status_check 
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));
  END IF;
END $$;

-- 2. Status Transition Log Table
-- ========================================
CREATE TABLE IF NOT EXISTS status_transition_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to data entry (composite key: school_id + category_id)
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Status transition details
  old_status VARCHAR(20) NOT NULL CHECK (old_status IN ('draft', 'pending', 'approved', 'rejected')),
  new_status VARCHAR(20) NOT NULL CHECK (new_status IN ('draft', 'pending', 'approved', 'rejected')),
  
  -- User who made the change
  changed_by UUID NOT NULL REFERENCES profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional context
  comment TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- IP address and user agent for security audit
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp for audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_status_transition_log_school_category ON status_transition_log(school_id, category_id);
CREATE INDEX IF NOT EXISTS idx_status_transition_log_changed_at ON status_transition_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_status_transition_log_changed_by ON status_transition_log(changed_by);

-- 3. Status Transition Validation Function
-- ========================================
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  old_status TEXT;
  new_status TEXT;
  user_role TEXT;
  user_id UUID;
  school_region_id UUID;
  school_sector_id UUID;
  user_region_id UUID;
  user_sector_id UUID;
  user_school_id UUID;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Skip validation for system operations (when no user context)
  IF user_id IS NULL THEN
    -- For system operations, ensure created_by is null instead of 'system'
    IF NEW.created_by = 'system' THEN
      NEW.created_by := NULL;
    END IF;
    RETURN NEW;
  END IF;
  
  old_status := COALESCE(OLD.status, 'draft');
  new_status := NEW.status;
  
  -- If status hasn't changed, allow the operation
  IF old_status = new_status THEN
    RETURN NEW;
  END IF;
  
  -- Get user role (take the first active role)
  SELECT role, region_id, sector_id, school_id 
  INTO user_role, user_region_id, user_sector_id, user_school_id
  FROM user_roles 
  WHERE user_id = validate_status_transition.user_id 
  LIMIT 1;
  
  -- If no role found, deny the operation
  IF user_role IS NULL THEN
    RAISE EXCEPTION 'User role not found. Access denied.';
  END IF;
  
  -- Get school's region and sector for permission checking
  SELECT region_id, sector_id 
  INTO school_region_id, school_sector_id
  FROM schools 
  WHERE id = NEW.school_id;
  
  -- Rule 1: Prevent modification of approved entries
  IF old_status = 'approved' AND new_status != 'approved' THEN
    RAISE EXCEPTION 'Cannot modify approved entries. Status: % → %', old_status, new_status;
  END IF;
  
  -- Rule 2: DRAFT → PENDING (School Admin only, for their own school)  
  IF old_status = 'draft' AND new_status = 'pending' THEN
    IF user_role = 'schooladmin' AND user_school_id = NEW.school_id THEN
      has_permission := TRUE;
    ELSIF user_role IN ('superadmin') THEN
      has_permission := TRUE;
    END IF;
  END IF;
  
  -- Rule 3: PENDING → APPROVED (Sector/Region/Super Admin)
  IF old_status = 'pending' AND new_status = 'approved' THEN
    IF user_role = 'superadmin' THEN
      has_permission := TRUE;
    ELSIF user_role = 'regionadmin' AND user_region_id = school_region_id THEN
      has_permission := TRUE;
    ELSIF user_role = 'sectoradmin' AND user_sector_id = school_sector_id THEN
      has_permission := TRUE;
    END IF;
  END IF;
  
  -- Rule 4: PENDING → REJECTED (Sector/Region/Super Admin with reason)
  IF old_status = 'pending' AND new_status = 'rejected' THEN
    -- Check if rejection reason is provided
    IF NEW.rejection_reason IS NULL OR trim(NEW.rejection_reason) = '' THEN
      RAISE EXCEPTION 'Rejection reason is required when rejecting data';
    END IF;
    
    IF user_role = 'superadmin' THEN
      has_permission := TRUE;
    ELSIF user_role = 'regionadmin' AND user_region_id = school_region_id THEN
      has_permission := TRUE;
    ELSIF user_role = 'sectoradmin' AND user_sector_id = school_sector_id THEN
      has_permission := TRUE;
    END IF;
  END IF;
  
  -- Rule 5: REJECTED → DRAFT (School Admin only, for their own school)
  IF old_status = 'rejected' AND new_status = 'draft' THEN
    IF user_role = 'schooladmin' AND user_school_id = NEW.school_id THEN
      has_permission := TRUE;
    ELSIF user_role IN ('superadmin') THEN
      has_permission := TRUE;
    END IF;
  END IF;
  
  -- Check if transition is allowed
  IF NOT has_permission THEN
    RAISE EXCEPTION 'Status transition not allowed. Role: %, Transition: % → %', 
      user_role, old_status, new_status;
  END IF;
  
  -- Set audit fields
  NEW.updated_at := NOW();
  
  -- Set approval/rejection timestamps and users
  IF new_status = 'approved' THEN
    NEW.approved_at := NOW();
    NEW.approved_by := user_id;
  ELSIF new_status = 'rejected' THEN
    NEW.rejected_at := NOW();
    NEW.rejected_by := user_id;
  END IF;
  
  -- Log the transition (don't let logging errors stop the main operation)
  BEGIN
    INSERT INTO status_transition_log (
      school_id,
      category_id,
      old_status,
      new_status,
      changed_by,
      changed_at,
      comment,
      metadata
    ) VALUES (
      NEW.school_id,
      NEW.category_id,
      old_status,
      new_status,
      user_id,
      NOW(),
      CASE 
        WHEN new_status = 'pending' THEN 'Submitted for approval'
        WHEN new_status = 'approved' THEN 'Data approved'
        WHEN new_status = 'rejected' THEN 'Data rejected: ' || COALESCE(NEW.rejection_reason, 'No reason provided')
        WHEN new_status = 'draft' THEN 'Reset to draft after rejection'
        ELSE 'Status changed'
      END,
      jsonb_build_object(
        'previous_status', old_status,
        'new_status', new_status,
        'school_id', NEW.school_id,
        'category_id', NEW.category_id,
        'user_role', user_role
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the main operation
    RAISE NOTICE 'Error logging status transition: %', SQLERRM;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Re-raise with more context
  RAISE EXCEPTION 'Status validation failed: %', SQLERRM;
END;
$$;

-- 4. Apply Trigger to data_entries Table
-- ========================================
DROP TRIGGER IF EXISTS data_entries_status_validation ON data_entries;

CREATE TRIGGER data_entries_status_validation
  BEFORE UPDATE OR INSERT ON data_entries
  FOR EACH ROW
  EXECUTE FUNCTION validate_status_transition();

-- 5. Enhanced RLS Policies
-- ========================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "data_entries_select_policy" ON data_entries;
DROP POLICY IF EXISTS "data_entries_insert_policy" ON data_entries;
DROP POLICY IF EXISTS "data_entries_update_policy" ON data_entries;
DROP POLICY IF EXISTS "data_entries_delete_policy" ON data_entries;

-- Enable RLS
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;

-- Helper function to check user's role and permissions
CREATE OR REPLACE FUNCTION check_data_entry_permission(
  entry_school_id UUID,
  entry_status TEXT DEFAULT NULL,
  required_permission TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  user_id UUID;
  user_data RECORD;
  school_region_id UUID;
  school_sector_id UUID;
BEGIN
  -- Get current user
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user role and associated IDs
  SELECT role, region_id, sector_id, school_id
  INTO user_data
  FROM user_roles
  WHERE user_roles.user_id = check_data_entry_permission.user_id
  LIMIT 1;
  
  -- No role = no access
  IF user_data.role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- SuperAdmins can do everything
  IF user_data.role = 'superadmin' THEN
    RETURN TRUE;
  END IF;
  
  -- Get school's region and sector
  SELECT region_id, sector_id
  INTO school_region_id, school_sector_id
  FROM schools
  WHERE id = entry_school_id;
  
  -- Region Admin: can access schools in their region
  IF user_data.role = 'regionadmin' AND user_data.region_id = school_region_id THEN
    -- Can read all, can edit only non-approved
    IF required_permission = 'read' THEN
      RETURN TRUE;
    ELSIF required_permission = 'write' AND entry_status != 'approved' THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- Sector Admin: can access schools in their sector
  IF user_data.role = 'sectoradmin' AND user_data.sector_id = school_sector_id THEN
    -- Can read all, can edit only non-approved
    IF required_permission = 'read' THEN
      RETURN TRUE;
    ELSIF required_permission = 'write' AND entry_status != 'approved' THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- School Admin: can access their own school's data
  IF user_data.role = 'schooladmin' AND user_data.school_id = entry_school_id THEN
    -- Can read all, can edit only draft and rejected
    IF required_permission = 'read' THEN
      RETURN TRUE;
    ELSIF required_permission = 'write' AND entry_status IN ('draft', 'rejected') THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- RLS Policies for data_entries

-- SELECT: Read permission
CREATE POLICY "data_entries_select_policy" ON data_entries
  FOR SELECT
  TO authenticated
  USING (check_data_entry_permission(school_id, status, 'read'));

-- INSERT: School admins can insert for their school
CREATE POLICY "data_entries_insert_policy" ON data_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    check_data_entry_permission(school_id, 'draft', 'write') AND
    (status IS NULL OR status = 'draft')
  );

-- UPDATE: Status-aware update permissions
CREATE POLICY "data_entries_update_policy" ON data_entries
  FOR UPDATE
  TO authenticated
  USING (check_data_entry_permission(school_id, status, 'write'))
  WITH CHECK (check_data_entry_permission(school_id, status, 'write'));

-- DELETE: Only superadmins can delete (soft delete preferred)  
CREATE POLICY "data_entries_delete_policy" ON data_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- 6. RLS for Status Transition Log
-- ========================================
ALTER TABLE status_transition_log ENABLE ROW LEVEL SECURITY;

-- Only allow reading transition logs, not modifying (system-managed)
CREATE POLICY "status_transition_log_select_policy" ON status_transition_log
  FOR SELECT
  TO authenticated
  USING (
    -- SuperAdmins can see all logs
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    ) OR
    -- Others can see logs for entries they have permission to view
    check_data_entry_permission(school_id, NULL, 'read')
  );

-- Prevent direct modification of audit logs
CREATE POLICY "status_transition_log_no_modify" ON status_transition_log
  FOR ALL
  TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

-- 7. Utility Functions for Status Management
-- ========================================

-- Function to get current status for a school-category combination
CREATE OR REPLACE FUNCTION get_entry_status(
  school_id_param UUID,
  category_id_param UUID
)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  current_status TEXT;
BEGIN
  SELECT status INTO current_status
  FROM data_entries
  WHERE school_id = school_id_param AND category_id = category_id_param
  LIMIT 1;
  
  RETURN COALESCE(current_status, 'draft');
END;
$$;

-- Function to get status transition history
CREATE OR REPLACE FUNCTION get_status_history(
  school_id_param UUID,
  category_id_param UUID
)
RETURNS TABLE (
  transition_id UUID,
  old_status TEXT,
  new_status TEXT,
  changed_by_name TEXT,
  changed_at TIMESTAMP WITH TIME ZONE,
  comment TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  SELECT 
    stl.id,
    stl.old_status,
    stl.new_status,
    p.full_name,
    stl.changed_at,
    stl.comment
  FROM status_transition_log stl
  LEFT JOIN profiles p ON stl.changed_by = p.id
  WHERE stl.school_id = school_id_param 
    AND stl.category_id = category_id_param
  ORDER BY stl.changed_at DESC;
$$;

-- 8. Data Integrity Improvements
-- ========================================

-- Ensure status consistency
UPDATE data_entries 
SET status = 'draft' 
WHERE status IS NULL OR status = '';

-- Add default values for timestamp fields
ALTER TABLE data_entries 
  ALTER COLUMN created_at SET DEFAULT NOW();

-- 9. Create Notification for Status Changes (Enhanced)
-- ========================================
-- Update existing notification function to work with new status system
CREATE OR REPLACE FUNCTION create_notification_on_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_notification_targets UUID[];
  v_target_user UUID;
  v_school_name TEXT;
  v_category_name TEXT;
  v_message TEXT;
BEGIN
  -- Only trigger on status changes
  IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Get school and category names for better notifications
    SELECT s.name, c.name 
    INTO v_school_name, v_category_name
    FROM schools s, categories c
    WHERE s.id = NEW.school_id AND c.id = NEW.category_id;
    
    -- Determine who should receive notifications based on new status
    CASE NEW.status
      WHEN 'pending' THEN
        -- Notify sector and region admins when submitted for approval
        SELECT array_agg(DISTINCT ur.user_id)
        INTO v_notification_targets
        FROM user_roles ur
        JOIN schools s ON s.id = NEW.school_id
        WHERE (
          (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id) OR
          (ur.role = 'regionadmin' AND ur.region_id = s.region_id) OR
          ur.role = 'superadmin'
        ) AND ur.user_id != auth.uid(); -- Don't notify the actor
        
      WHEN 'approved', 'rejected' THEN
        -- Notify school admin when approved/rejected
        SELECT array_agg(ur.user_id)
        INTO v_notification_targets  
        FROM user_roles ur
        WHERE ur.role = 'schooladmin' 
          AND ur.school_id = NEW.school_id
          AND ur.user_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID);
          
      ELSE
        v_notification_targets := ARRAY[]::UUID[];
    END CASE;
    
    -- Create notifications for each target
    IF array_length(v_notification_targets, 1) > 0 THEN
      FOREACH v_target_user IN ARRAY v_notification_targets
      LOOP
        -- Create appropriate message
        v_message := CASE NEW.status
          WHEN 'pending' THEN format('"%s" məktəbinin "%s" kateqoriyasına aid məlumat təsdiq üçün göndərildi', v_school_name, v_category_name)
          WHEN 'approved' THEN format('"%s" kateqoriyasına aid məlumatlarınız təsdiqləndi', v_category_name)
          WHEN 'rejected' THEN format('"%s" kateqoriyasına aid məlumatlarınız rədd edildi: %s', v_category_name, COALESCE(NEW.rejection_reason, 'Səbəb göstərilmədi'))
          ELSE format('"%s" kateqoriyasının statusu dəyişdi', v_category_name)
        END;
        
        -- Insert notification
        INSERT INTO notifications (
          user_id,
          type,
          title,
          description,
          reference_type,
          reference_id,
          priority,
          created_at
        ) VALUES (
          v_target_user,
          CASE NEW.status
            WHEN 'pending' THEN 'data_submitted'
            WHEN 'approved' THEN 'data_approved'
            WHEN 'rejected' THEN 'data_rejected'
            ELSE 'status_changed'
          END,
          CASE NEW.status
            WHEN 'pending' THEN 'Yeni məlumat təsdiqi'
            WHEN 'approved' THEN 'Məlumat təsdiqləndi'
            WHEN 'rejected' THEN 'Məlumat rədd edildi'
            ELSE 'Status dəyişikliyi'
          END,
          v_message,
          'data_entry',
          NEW.id::TEXT,
          CASE WHEN NEW.status = 'rejected' THEN 'high' ELSE 'normal' END,
          NOW()
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't let notification errors stop the main operation
  RAISE NOTICE 'Notification creation error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Apply enhanced notification trigger
DROP TRIGGER IF EXISTS data_entries_status_notification ON data_entries;
CREATE TRIGGER data_entries_status_notification
  AFTER UPDATE ON data_entries
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_status_change();

-- 10. Comments & Final Setup
-- ========================================

-- Add helpful comments to tables
COMMENT ON TABLE status_transition_log IS 'Audit trail for all status transitions in data entries';
COMMENT ON COLUMN status_transition_log.school_id IS 'Reference to school (part of composite key)';
COMMENT ON COLUMN status_transition_log.category_id IS 'Reference to category (part of composite key)';
COMMENT ON COLUMN status_transition_log.changed_by IS 'User who initiated the status change';
COMMENT ON COLUMN status_transition_log.metadata IS 'Additional context and system information';

COMMENT ON FUNCTION validate_status_transition() IS 'Validates status transitions according to business rules and user permissions';
COMMENT ON FUNCTION get_entry_status(UUID, UUID) IS 'Get current status for a school-category data entry';
COMMENT ON FUNCTION get_status_history(UUID, UUID) IS 'Get status transition history for a school-category data entry';

-- Migration complete notification
DO $$ BEGIN
  RAISE NOTICE 'Status Management System migration completed successfully!';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ Status transition validation';
  RAISE NOTICE '  ✓ Comprehensive audit trail';
  RAISE NOTICE '  ✓ Role-based permissions';
  RAISE NOTICE '  ✓ Enhanced notifications';
  RAISE NOTICE '  ✓ Data integrity protection';
END $$;
