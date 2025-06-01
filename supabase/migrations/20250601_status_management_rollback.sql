-- =========================================================
-- Status Management System - Rollback Migration
-- Date: 2025-06-01
-- Description: Safely rollback status management system changes
-- =========================================================

-- WARNING: This rollback will remove status transition protection
-- Make sure to backup status_transition_log data before running
-- ========================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'STATUS MANAGEMENT ROLLBACK - STARTING';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'This will remove status transition protection!';
  RAISE NOTICE 'Make sure you have backed up audit data.';
  RAISE NOTICE '';
END $$;

-- 1. Remove Triggers
-- ========================================
DROP TRIGGER IF EXISTS data_entries_status_validation ON data_entries;
DROP TRIGGER IF EXISTS data_entries_status_notification ON data_entries;

-- 2. Remove Functions (in dependency order)
-- ========================================
DROP FUNCTION IF EXISTS validate_status_transition();
DROP FUNCTION IF EXISTS create_notification_on_status_change();
DROP FUNCTION IF EXISTS check_data_entry_permission(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_entry_status(UUID, UUID);
DROP FUNCTION IF EXISTS get_status_history(UUID, UUID);

-- 3. Remove RLS Policies
-- ========================================
DROP POLICY IF EXISTS "data_entries_select_policy" ON data_entries;
DROP POLICY IF EXISTS "data_entries_insert_policy" ON data_entries;
DROP POLICY IF EXISTS "data_entries_update_policy" ON data_entries;
DROP POLICY IF EXISTS "data_entries_delete_policy" ON data_entries;
DROP POLICY IF EXISTS "status_transition_log_select_policy" ON status_transition_log;
DROP POLICY IF EXISTS "status_transition_log_no_modify" ON status_transition_log;

-- 4. Backup Status Transition Log (Optional)
-- ========================================
-- Create backup table before dropping
CREATE TABLE IF NOT EXISTS status_transition_log_backup AS 
SELECT 
  id,
  school_id,
  category_id,
  old_status,
  new_status,
  changed_by,
  changed_at,
  comment,
  metadata,
  created_at,
  'Backup created during rollback on ' || NOW()::TEXT as backup_note
FROM status_transition_log;

-- 5. Remove Status Transition Log Table
-- ========================================
DROP TABLE IF EXISTS status_transition_log CASCADE;

-- 6. Remove Status Constraint
-- ========================================
ALTER TABLE data_entries DROP CONSTRAINT IF EXISTS data_entries_status_check;

-- 7. Restore Original RLS Policies (Basic)
-- ========================================
-- Re-enable RLS but with simpler policies
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;

-- Basic select policy (all authenticated users can read their accessible data)
CREATE POLICY "data_entries_basic_select" ON data_entries
  FOR SELECT
  TO authenticated
  USING (true); -- This should be refined based on your original policies

-- Basic insert policy  
CREATE POLICY "data_entries_basic_insert" ON data_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- This should be refined based on your original policies

-- Basic update policy
CREATE POLICY "data_entries_basic_update" ON data_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true); -- This should be refined based on your original policies

-- 8. Clean up any remaining test functions
-- ========================================
DROP FUNCTION IF EXISTS test_status_management_system();
DROP FUNCTION IF EXISTS create_status_test_data();
DROP FUNCTION IF EXISTS test_status_performance();
DROP FUNCTION IF EXISTS cleanup_status_test_functions();

-- 9. Reset any modified columns to defaults (Optional)
-- ========================================
-- Reset status fields that might have been modified
-- NOTE: This will reset approval/rejection timestamps and users
-- Comment out if you want to preserve this data

/*
UPDATE data_entries SET
  approved_at = NULL,
  approved_by = NULL,
  rejected_at = NULL,
  rejected_by = NULL
WHERE status NOT IN ('approved', 'rejected');
*/

-- 10. Create Simple Status Change Trigger (Original)
-- ========================================
-- Restore basic notification trigger (if it existed before)
CREATE OR REPLACE FUNCTION public.create_notification_on_data_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_admin_id UUID;
  v_message TEXT;
  v_category_name TEXT;
BEGIN
  -- Kateqoriya adını əldə edirik
  SELECT name INTO v_category_name FROM categories WHERE id = NEW.category_id;
  
  -- Məlumat statusuna görə bildiriş yaradırıq
  IF TG_OP = 'INSERT' THEN
    -- Məktəbin sektorunu əldə edirik
    SELECT admin_id INTO v_admin_id FROM sectors WHERE id = (
      SELECT sector_id FROM schools WHERE id = NEW.school_id
    );
    
    IF v_admin_id IS NOT NULL THEN
      v_message := 'Yeni məlumat daxil edildi: ' || v_category_name;
      
      INSERT INTO notifications (
        user_id,
        type,
        title,
        description,
        reference_type,
        reference_id
      ) VALUES (
        v_admin_id,
        'new_data',
        'Yeni məlumat',
        v_message,
        'data_entry',
        NEW.id
      );
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    -- Status dəyişdikdə məktəb admininə bildiriş
    SELECT admin_id INTO v_admin_id FROM schools WHERE id = NEW.school_id;
    
    IF v_admin_id IS NOT NULL THEN
      IF NEW.status = 'approved' THEN
        v_message := v_category_name || ' kateqoriyasına aid məlumat təsdiqləndi';
      ELSIF NEW.status = 'rejected' THEN
        v_message := v_category_name || ' kateqoriyasına aid məlumat rədd edildi: ' || COALESCE(NEW.rejection_reason, '');
      END IF;
      
      INSERT INTO notifications (
        user_id,
        type,
        title,
        description,
        reference_type,
        reference_id,
        priority
      ) VALUES (
        v_admin_id,
        CASE WHEN NEW.status = 'approved' THEN 'data_approved' ELSE 'data_rejected' END,
        CASE WHEN NEW.status = 'approved' THEN 'Məlumat təsdiqləndi' ELSE 'Məlumat rədd edildi' END,
        v_message,
        'data_entry',
        NEW.id,
        CASE WHEN NEW.status = 'rejected' THEN 'high' ELSE 'normal' END
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Bildiriş yaradılması xətası əsas əməliyyatı dayandırmamalıdır
  RAISE NOTICE 'Bildiriş yaradılarkən xəta: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Restore basic trigger
CREATE TRIGGER data_change_notification_trigger
AFTER INSERT OR UPDATE ON data_entries
FOR EACH ROW
EXECUTE FUNCTION create_notification_on_data_change();

-- 11. Final Cleanup and Reporting
-- ========================================
DO $$ 
DECLARE
  backup_count INTEGER;
BEGIN
  -- Check if backup was created
  SELECT COUNT(*) INTO backup_count FROM status_transition_log_backup;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'STATUS MANAGEMENT ROLLBACK - COMPLETED';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Rollback Summary:';
  RAISE NOTICE '  ✓ Status transition validation removed';
  RAISE NOTICE '  ✓ Enhanced RLS policies removed';
  RAISE NOTICE '  ✓ Status transition log table removed';
  RAISE NOTICE '  ✓ Advanced notification system removed';
  RAISE NOTICE '  ✓ Backup created: % audit records', backup_count;
  RAISE NOTICE '';
  RAISE NOTICE 'What was restored:';
  RAISE NOTICE '  ✓ Basic RLS policies';
  RAISE NOTICE '  ✓ Original notification trigger';
  RAISE NOTICE '  ✓ Basic data access controls';
  RAISE NOTICE '';
  RAISE NOTICE 'Manual tasks:';
  RAISE NOTICE '  - Review and refine RLS policies as needed';
  RAISE NOTICE '  - Check if any application code needs updates';
  RAISE NOTICE '  - Consider if status_transition_log_backup should be kept';
  RAISE NOTICE '';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during rollback reporting: %', SQLERRM;
END $$;

-- Optional: Drop backup table after verification
-- (Uncomment after confirming rollback worked correctly)
-- DROP TABLE IF EXISTS status_transition_log_backup;
