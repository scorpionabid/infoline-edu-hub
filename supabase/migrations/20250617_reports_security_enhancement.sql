
-- Reports Security Enhancement Migration
-- Add NOT NULL constraint to reports.created_by and enhance security

-- Add NOT NULL constraint to reports.created_by
ALTER TABLE reports 
ALTER COLUMN created_by SET NOT NULL;

-- Set default value for existing NULL records to a system user
UPDATE reports 
SET created_by = '00000000-0000-0000-0000-000000000000'::uuid
WHERE created_by IS NULL;

-- Enhanced RLS policies for reports
DROP POLICY IF EXISTS "Users view own reports" ON reports;
DROP POLICY IF EXISTS "Users create own reports" ON reports;
DROP POLICY IF EXISTS "Users update own reports" ON reports;

-- More restrictive report policies
CREATE POLICY "Users can only view their own reports" ON reports
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can only create reports for themselves" ON reports
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can only update their own reports" ON reports
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can only delete their own reports" ON reports
FOR DELETE USING (created_by = auth.uid());

-- SuperAdmin can access all reports
CREATE POLICY "SuperAdmin full access to all reports" ON reports
FOR ALL USING (public.user_has_role(auth.uid(), 'superadmin'));

-- Prevent report template access based on role
CREATE POLICY "Role-based report template access" ON report_templates
FOR SELECT USING (
  CASE 
    WHEN type = 'superadmin' THEN public.user_has_role(auth.uid(), 'superadmin')
    WHEN type = 'regionadmin' THEN public.user_has_role(auth.uid(), 'regionadmin') OR public.user_has_role(auth.uid(), 'superadmin')
    WHEN type = 'sectoradmin' THEN public.user_has_role(auth.uid(), 'sectoradmin') OR public.user_has_role(auth.uid(), 'regionadmin') OR public.user_has_role(auth.uid(), 'superadmin')
    ELSE true
  END
);

-- Add function to validate report sharing
CREATE OR REPLACE FUNCTION public.validate_report_sharing(
  report_id uuid,
  shared_user_ids uuid[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report_owner uuid;
  user_role text;
BEGIN
  -- Get report owner
  SELECT created_by INTO report_owner
  FROM reports
  WHERE id = report_id;
  
  -- Only owner or superadmin can share reports
  IF report_owner != auth.uid() AND NOT public.user_has_role(auth.uid(), 'superadmin') THEN
    RETURN false;
  END IF;
  
  -- Additional validation can be added here
  RETURN true;
END;
$$;
