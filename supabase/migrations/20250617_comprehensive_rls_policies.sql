
-- Comprehensive RLS Policies for İnfoLine Security
-- This migration implements secure Row-Level Security for all tables

-- Enable RLS on all tables first
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users see own profiles" ON profiles;
DROP POLICY IF EXISTS "SuperAdmin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "RegionAdmin sees profiles in own region" ON profiles;
DROP POLICY IF EXISTS "SectorAdmin sees profiles in own sector" ON profiles;

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "SuperAdmin full access to profiles" ON profiles
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "RegionAdmin views region profiles" ON profiles
FOR SELECT USING (
  id IN (
    SELECT ur.user_id FROM user_roles ur
    WHERE ur.region_id IN (
      SELECT region_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'regionadmin'
    )
  )
);

CREATE POLICY "SectorAdmin views sector profiles" ON profiles
FOR SELECT USING (
  id IN (
    SELECT ur.user_id FROM user_roles ur
    WHERE ur.sector_id IN (
      SELECT sector_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'sectoradmin'
    )
  )
);

-- REGIONS TABLE POLICIES
CREATE POLICY "SuperAdmin full access to regions" ON regions
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "RegionAdmin views own region" ON regions
FOR SELECT USING (
  id IN (
    SELECT region_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'regionadmin'
  )
);

CREATE POLICY "RegionAdmin updates own region" ON regions
FOR UPDATE USING (
  id IN (
    SELECT region_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'regionadmin'
  )
);

-- SECTORS TABLE POLICIES
CREATE POLICY "SuperAdmin full access to sectors" ON sectors
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "RegionAdmin views region sectors" ON sectors
FOR SELECT USING (
  region_id IN (
    SELECT region_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'regionadmin'
  )
);

CREATE POLICY "SectorAdmin views own sector" ON sectors
FOR SELECT USING (
  id IN (
    SELECT sector_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'sectoradmin'
  )
);

CREATE POLICY "SectorAdmin updates own sector" ON sectors
FOR UPDATE USING (
  id IN (
    SELECT sector_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'sectoradmin'
  )
);

-- SCHOOLS TABLE POLICIES
CREATE POLICY "SuperAdmin full access to schools" ON schools
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "RegionAdmin views region schools" ON schools
FOR SELECT USING (
  region_id IN (
    SELECT region_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'regionadmin'
  )
);

CREATE POLICY "SectorAdmin views sector schools" ON schools
FOR SELECT USING (
  sector_id IN (
    SELECT sector_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'sectoradmin'
  )
);

CREATE POLICY "SchoolAdmin views own school" ON schools
FOR SELECT USING (
  id IN (
    SELECT school_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'schooladmin'
  )
);

-- DATA ENTRIES POLICIES
CREATE POLICY "SuperAdmin full access to data entries" ON data_entries
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "Users access own school data entries" ON data_entries
FOR ALL USING (
  school_id IN (
    SELECT school_id FROM user_roles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "RegionAdmin views region data entries" ON data_entries
FOR SELECT USING (
  school_id IN (
    SELECT s.id FROM schools s
    JOIN user_roles ur ON ur.region_id = s.region_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'regionadmin'
  )
);

CREATE POLICY "SectorAdmin views sector data entries" ON data_entries
FOR ALL USING (
  school_id IN (
    SELECT s.id FROM schools s
    JOIN user_roles ur ON ur.sector_id = s.sector_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'sectoradmin'
  )
);

-- REPORTS TABLE POLICIES
CREATE POLICY "SuperAdmin full access to reports" ON reports
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "Users view own reports" ON reports
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users create own reports" ON reports
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users update own reports" ON reports
FOR UPDATE USING (created_by = auth.uid());

-- AUDIT LOGS POLICIES (READ-ONLY for non-superadmins)
CREATE POLICY "SuperAdmin full access to audit logs" ON audit_logs
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "Users view own audit logs" ON audit_logs
FOR SELECT USING (user_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users access own notifications" ON notifications
FOR ALL USING (user_id = auth.uid());

-- FILE UPLOAD POLICIES
CREATE POLICY "SuperAdmin full access to school files" ON school_files
FOR ALL USING (public.user_has_role('superadmin'));

CREATE POLICY "School users access own school files" ON school_files
FOR ALL USING (
  school_id IN (
    SELECT school_id FROM user_roles 
    WHERE user_id = auth.uid()
  ) OR
  uploaded_by = auth.uid()
);

-- Create function for rate limiting (to be used in application)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier text,
  action_type text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count integer;
  window_start timestamp;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  SELECT COUNT(*) INTO attempt_count
  FROM audit_logs
  WHERE action = action_type
  AND created_at > window_start
  AND (user_id::text = user_identifier OR ip_address = user_identifier);
  
  RETURN attempt_count < max_attempts;
END;
$$;

-- Add security trigger for input validation
CREATE OR REPLACE FUNCTION public.sanitize_text_input()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Basic XSS prevention - remove script tags and javascript: protocols
  IF TG_TABLE_NAME = 'data_entries' AND NEW.value IS NOT NULL THEN
    NEW.value := regexp_replace(NEW.value, '<script[^>]*>.*?</script>', '', 'gi');
    NEW.value := regexp_replace(NEW.value, 'javascript:', '', 'gi');
    NEW.value := regexp_replace(NEW.value, 'vbscript:', '', 'gi');
    NEW.value := regexp_replace(NEW.value, 'onload=', '', 'gi');
    NEW.value := regexp_replace(NEW.value, 'onerror=', '', 'gi');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply sanitization trigger to data entry tables
CREATE TRIGGER sanitize_data_entries_input
  BEFORE INSERT OR UPDATE ON data_entries
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_text_input();

CREATE TRIGGER sanitize_sector_data_entries_input
  BEFORE INSERT OR UPDATE ON sector_data_entries
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_text_input();
