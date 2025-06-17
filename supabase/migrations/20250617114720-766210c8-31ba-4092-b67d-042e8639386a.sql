
-- Phase 1: RLS Policy-lərini aktivləşdir
ALTER TABLE public.school_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_transition_log ENABLE ROW LEVEL SECURITY;

-- Phase 2: School Links üçün RLS policy-ləri (düzəldilmiş funksiya çağırışı)
DROP POLICY IF EXISTS "SuperAdmin full access to school links" ON school_links;
DROP POLICY IF EXISTS "School users access own school links" ON school_links;

CREATE POLICY "SuperAdmin full access to school links" ON school_links
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "School users access own school links" ON school_links
FOR ALL USING (
  school_id IN (
    SELECT school_id FROM user_roles 
    WHERE user_id = auth.uid()
  ) OR
  created_by = auth.uid()
);

-- Phase 3: Audit Logs üçün RLS policy-ləri
DROP POLICY IF EXISTS "SuperAdmin full access to audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users view own audit logs" ON audit_logs;

CREATE POLICY "SuperAdmin full access to audit logs" ON audit_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Users view own audit logs" ON audit_logs
FOR SELECT USING (user_id = auth.uid());

-- Phase 4: Notifications üçün RLS policy-ləri  
DROP POLICY IF EXISTS "Users access own notifications" ON notifications;

CREATE POLICY "Users access own notifications" ON notifications
FOR ALL USING (user_id = auth.uid());

-- Phase 5: Status Transition Log üçün RLS policy-ləri
DROP POLICY IF EXISTS "SuperAdmin full access to status logs" ON status_transition_log;
DROP POLICY IF EXISTS "Users view related status logs" ON status_transition_log;

CREATE POLICY "SuperAdmin full access to status logs" ON status_transition_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Users view related status logs" ON status_transition_log
FOR SELECT USING (changed_by = auth.uid());

-- Phase 6: Status History View-ı təhlükəsiz şəkildə yenidən yarat
DROP VIEW IF EXISTS public.status_history_view;

CREATE VIEW public.status_history_view 
WITH (security_barrier = true)
AS
SELECT 
  stl.id,
  stl.data_entry_id,
  stl.old_status,
  stl.new_status,
  stl.changed_at,
  stl.comment,
  stl.metadata,
  p.full_name as changed_by_name,
  p.email as changed_by_email
FROM status_transition_log stl
LEFT JOIN profiles p ON stl.changed_by = p.id
WHERE (
  -- SuperAdmin can see all
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ) OR
  -- Users can see their own changes
  stl.changed_by = auth.uid() OR
  -- Users can see changes related to their accessible data entries
  EXISTS (
    SELECT 1 FROM data_entries de
    WHERE de.id::text = stl.data_entry_id
    AND public.can_access_data_entry(auth.uid(), de.id)
  )
);

-- Phase 7: Reports created_by məcburiliyi
UPDATE reports 
SET created_by = '00000000-0000-0000-0000-000000000000'::uuid
WHERE created_by IS NULL;

ALTER TABLE reports 
ALTER COLUMN created_by SET NOT NULL;
