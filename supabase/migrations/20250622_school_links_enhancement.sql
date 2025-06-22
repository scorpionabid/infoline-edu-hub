-- School Links RLS Policies Enhancement
-- Bu migration school_links cədvəli üçün əlavə RLS policy-lər əlavə edir

-- Mövcud policy-ləri düzəltmək
DROP POLICY IF EXISTS "School users access own school links" ON school_links;
DROP POLICY IF EXISTS "RegionAdmin views region school links" ON school_links;
DROP POLICY IF EXISTS "SectorAdmin views sector school links" ON school_links;

-- Yeni və təkmilləşdirilmiş policy-lər
CREATE POLICY "SuperAdmin full access to school links" ON school_links
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "RegionAdmin manages region school links" ON school_links
FOR ALL USING (
  school_id IN (
    SELECT s.id FROM schools s
    JOIN user_roles ur ON ur.region_id = s.region_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'regionadmin'
  )
);

CREATE POLICY "SectorAdmin manages sector school links" ON school_links
FOR ALL USING (
  school_id IN (
    SELECT s.id FROM schools s
    JOIN user_roles ur ON ur.sector_id = s.sector_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'sectoradmin'
  )
);

CREATE POLICY "SchoolAdmin manages own school links" ON school_links
FOR ALL USING (
  school_id IN (
    SELECT school_id FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'schooladmin'
  ) OR
  created_by = auth.uid()
);

-- Triggerlar və funksiyalar
CREATE OR REPLACE FUNCTION public.notify_link_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Link əlavə edildikdə bildiriş gönder
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (
      user_id, type, title, message, 
      related_entity_id, related_entity_type,
      is_read, priority, created_at
    )
    SELECT 
      ur.user_id,
      'school_link_added',
      'Yeni link əlavə edildi',
      format('"%s" adlı yeni link əlavə edildi', NEW.title),
      NEW.id::text,
      'school_link',
      false,
      'normal',
      now()
    FROM user_roles ur
    JOIN schools s ON (
      (ur.role = 'schooladmin' AND ur.school_id = NEW.school_id) OR
      (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id AND s.id = NEW.school_id) OR
      (ur.role = 'regionadmin' AND ur.region_id = s.region_id AND s.id = NEW.school_id)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger yaratmaq
DROP TRIGGER IF EXISTS school_links_notify_changes ON school_links;
CREATE TRIGGER school_links_notify_changes
  AFTER INSERT OR UPDATE OR DELETE ON school_links
  FOR EACH ROW EXECUTE FUNCTION public.notify_link_changes();

-- Audit logging üçün trigger
CREATE OR REPLACE FUNCTION public.audit_school_links()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, entity_type, entity_id, 
    old_value, new_value, ip_address, created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    'school_link',
    COALESCE(NEW.id, OLD.id)::text,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    inet_client_addr()::text,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trigger yaratmaq
DROP TRIGGER IF EXISTS school_links_audit ON school_links;
CREATE TRIGGER school_links_audit
  AFTER INSERT OR UPDATE OR DELETE ON school_links
  FOR EACH ROW EXECUTE FUNCTION public.audit_school_links();

-- İndekslər performans üçün
CREATE INDEX IF NOT EXISTS idx_school_links_school_id ON school_links(school_id);
CREATE INDEX IF NOT EXISTS idx_school_links_created_by ON school_links(created_by);
CREATE INDEX IF NOT EXISTS idx_school_links_category ON school_links(category);
CREATE INDEX IF NOT EXISTS idx_school_links_active ON school_links(is_active);

-- Statistik funksiya
CREATE OR REPLACE FUNCTION public.get_school_link_stats(p_school_id uuid)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_links', COUNT(*),
      'active_links', COUNT(*) FILTER (WHERE is_active = true),
      'categories', json_agg(DISTINCT category),
      'last_updated', MAX(updated_at)
    )
    FROM school_links
    WHERE school_id = p_school_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
