
-- Security RLS Policy Cleanup Migration
-- This migration resolves RLS policy conflicts and implements secure access patterns

-- First, let's clean up any conflicting policies on data_entries
DROP POLICY IF EXISTS "SuperAdmin data_entries full access" ON data_entries;
DROP POLICY IF EXISTS "RegionAdmin data_entries access" ON data_entries;
DROP POLICY IF EXISTS "SectorAdmin data_entries access" ON data_entries;
DROP POLICY IF EXISTS "SchoolAdmin data_entries access" ON data_entries;
DROP POLICY IF EXISTS "Users access own school data entries" ON data_entries;

-- Create consolidated, non-conflicting RLS policies for data_entries
CREATE POLICY "data_entries_access_policy" ON data_entries
FOR ALL USING (
  CASE 
    WHEN public.get_user_role() = 'superadmin' THEN true
    WHEN public.get_user_role() = 'regionadmin' THEN
      school_id IN (
        SELECT id FROM schools 
        WHERE region_id = public.get_user_region_id()
      )
    WHEN public.get_user_role() = 'sectoradmin' THEN
      school_id IN (
        SELECT id FROM schools 
        WHERE sector_id = public.get_user_sector_id()
      )
    WHEN public.get_user_role() = 'schooladmin' THEN
      school_id = public.get_user_school_id()
    ELSE false
  END
);

-- Clean up any orphaned policies on other tables
DROP POLICY IF EXISTS "duplicate_policy_1" ON profiles;
DROP POLICY IF EXISTS "duplicate_policy_2" ON profiles;

-- Ensure we have clean, single policies for critical tables
DROP POLICY IF EXISTS "profiles_access_policy" ON profiles;
CREATE POLICY "profiles_access_policy" ON profiles
FOR ALL USING (
  id = auth.uid() OR public.get_user_role() = 'superadmin'
);

-- Add security logging trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log important security events
  IF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'data_entries' THEN
    INSERT INTO audit_logs (
      action, 
      table_name, 
      record_id, 
      user_id, 
      old_data
    ) VALUES (
      'DELETE', 
      TG_TABLE_NAME, 
      OLD.id::text, 
      auth.uid(), 
      row_to_json(OLD)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply security logging to critical tables
DROP TRIGGER IF EXISTS security_log_data_entries ON data_entries;
CREATE TRIGGER security_log_data_entries
  AFTER DELETE ON data_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit()
RETURNS boolean AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Check login attempts in last 15 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM audit_logs
  WHERE action = 'LOGIN_ATTEMPT'
  AND user_id = auth.uid()
  AND created_at > now() - interval '15 minutes';
  
  RETURN attempt_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
