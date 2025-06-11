-- Proxy Data Entry Database Migration Script
-- Bu faylı Supabase SQL Editor-də icra etməlisiniz

-- 1. Proxy məlumatları üçün yeni sahələr əlavə et
ALTER TABLE data_entries 
ADD COLUMN IF NOT EXISTS proxy_created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS proxy_reason text,
ADD COLUMN IF NOT EXISTS proxy_original_entity text,
ADD COLUMN IF NOT EXISTS approval_comment text;

-- 2. İndekslər əlavə et (performans üçün)
CREATE INDEX IF NOT EXISTS idx_data_entries_proxy_created_by 
ON data_entries(proxy_created_by);

CREATE INDEX IF NOT EXISTS idx_data_entries_created_by_proxy 
ON data_entries(created_by, proxy_created_by);

-- 3. Audit logs üçün yeni sahələr (əgər lazımdırsa)
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS proxy_info jsonb;

-- 4. Supabase RLS siyasətlərini yeniləmək (proxy icazələri üçün)
-- Bu hissə artıq mövcud RLS siyasətlərini genişləndirir

-- SectorAdmin-in məktəb məlumatlarına proxy giriş icazəsi
CREATE POLICY IF NOT EXISTS "sectoradmin_proxy_data_entries" ON data_entries
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN schools s ON s.id = data_entries.school_id
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'sectoradmin'
    AND s.sector_id = ur.sector_id
  )
);

-- RegionAdmin-in bütün region məktəblərinə proxy giriş icazəsi
CREATE POLICY IF NOT EXISTS "regionadmin_proxy_data_entries" ON data_entries
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN schools s ON s.id = data_entries.school_id
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'regionadmin'
    AND s.region_id = ur.region_id
  )
);

-- 5. Proxy data entry üçün helper function
CREATE OR REPLACE FUNCTION check_proxy_data_entry_permission(
  user_id uuid,user_role text,target_school_id uuid
) RETURNS boolean AS $$
DECLARE
  school_record RECORD;
  user_roles_record RECORD;
BEGIN
  -- SuperAdmin həmişə edə bilər
  IF user_role = 'superadmin' THEN
    RETURN true;
  END IF;
  
  -- Məktəb məlumatlarını əldə et
  SELECT sector_id, region_id INTO school_record
  FROM schools 
  WHERE id = target_school_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- İstifadəçi rollarını yoxla
  SELECT role, region_id, sector_id INTO user_roles_record
  FROM user_roles
  WHERE user_roles.user_id = check_proxy_data_entry_permission.user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- İcazə yoxlaması
  IF user_roles_record.role = 'regionadmin' AND 
     user_roles_record.region_id = school_record.region_id THEN
    RETURN true;
  END IF;
  
  IF user_roles_record.role = 'sectoradmin' AND 
     user_roles_record.sector_id = school_record.sector_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Proxy data entry notification trigger
CREATE OR REPLACE FUNCTION notify_proxy_data_entry()
RETURNS TRIGGER AS $$
DECLARE
  school_admin_ids uuid[];
  proxy_user_name text;
  school_name text;
  category_name text;
BEGIN
  -- Yalnız proxy məlumatlar üçün bildiriş göndər
  IF NEW.proxy_created_by IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Məktəb adminlərini tap
  SELECT array_agg(ur.user_id) INTO school_admin_ids
  FROM user_roles ur
  WHERE ur.role = 'schooladmin'
  AND ur.school_id = NEW.school_id;
  
  -- Proxy istifadəçi və məktəb adlarını əldə et
  SELECT p.full_name INTO proxy_user_name
  FROM profiles p
  WHERE p.id = NEW.proxy_created_by;
  
  SELECT s.name INTO school_name
  FROM schools s
  WHERE s.id = NEW.school_id;
  
  SELECT c.name INTO category_name
  FROM categories c
  WHERE c.id = NEW.category_id;
  
  -- Hər bir məktəb adminə bildiriş göndər
  IF array_length(school_admin_ids, 1) > 0 THEN
    INSERT INTO notifications (user_id, type, title, message, related_entity_id, related_entity_type, is_read, priority, created_at)
    SELECT 
      unnest(school_admin_ids),
      'proxy_data_entry',
      'Proxy Məlumat Daxil Edildi',
      format('Sektor admini %s tərəfindən %s məktəbi üçün %s kateqoriyasında məlumat daxil edildi',
             COALESCE(proxy_user_name, 'Naməlum'),
             COALESCE(school_name, 'Naməlum'),
             COALESCE(category_name, 'Naməlum')
      ),
      NEW.school_id || '-' || NEW.category_id,
      'proxy_data_entry',
      false,
      'normal',
      now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger yarad
DROP TRIGGER IF EXISTS proxy_data_entry_notification_trigger ON data_entries;
CREATE TRIGGER proxy_data_entry_notification_trigger
  AFTER INSERT OR UPDATE ON data_entries
  FOR EACH ROW
  WHEN (NEW.proxy_created_by IS NOT NULL)
  EXECUTE FUNCTION notify_proxy_data_entry();

-- 7. Proxy məlumatların statusunu yoxlayan funksiya
CREATE OR REPLACE FUNCTION get_proxy_data_status(
  p_school_id uuid,
  p_category_id uuid
) RETURNS TABLE(
  is_proxy_data boolean,
  proxy_user_id uuid,
  proxy_reason text,
  data_status text,
  entry_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (de.proxy_created_by IS NOT NULL) as is_proxy_data,
    de.proxy_created_by as proxy_user_id,
    de.proxy_reason,
    de.status as data_status,
    COUNT(*)::integer as entry_count
  FROM data_entries de
  WHERE de.school_id = p_school_id
  AND de.category_id = p_category_id
  AND de.deleted_at IS NULL
  GROUP BY de.proxy_created_by, de.proxy_reason, de.status
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Proxy məlumatların avtomatik təsdiq funksiyası
CREATE OR REPLACE FUNCTION auto_approve_proxy_data(
  p_school_id uuid,
  p_category_id uuid,
  p_proxy_user_id uuid
) RETURNS TABLE(
  success boolean,
  message text,
  approved_count integer
) AS $$
DECLARE
  v_approved_count integer := 0;
BEGIN
  -- Proxy məlumatları avtomatik təsdiq et
  UPDATE data_entries
  SET 
    status = 'approved',
    approved_by = p_proxy_user_id,
    approved_at = now(),
    updated_at = now()
  WHERE school_id = p_school_id
  AND category_id = p_category_id
  AND proxy_created_by = p_proxy_user_id
  AND status IN ('draft', 'pending');
  
  GET DIAGNOSTICS v_approved_count = ROW_COUNT;
  
  -- Nəticə qaytır
  RETURN QUERY SELECT 
    true as success,
    format('Proxy məlumatlar avtomatik təsdiqləndi: %s sahə', v_approved_count) as message,
    v_approved_count as approved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Kommentləri və təsvirləri əlavə et
COMMENT ON COLUMN data_entries.proxy_created_by IS 'Proxy olaraq məlumat daxil edən istifadəçi ID-si';
COMMENT ON COLUMN data_entries.proxy_reason IS 'Proxy məlumat daxil etmə səbəbi';
COMMENT ON COLUMN data_entries.proxy_original_entity IS 'Orijinal məktəb/entity məlumatı';
COMMENT ON COLUMN data_entries.approval_comment IS 'Təsdiq və ya rədd etmə şərhi';

COMMENT ON FUNCTION check_proxy_data_entry_permission(uuid, text, uuid) IS 'Proxy data entry icazəsini yoxlayır';
COMMENT ON FUNCTION get_proxy_data_status(uuid, uuid) IS 'Proxy məlumatların statusunu qaytarır';
COMMENT ON FUNCTION auto_approve_proxy_data(uuid, uuid, uuid) IS 'Proxy məlumatları avtomatik təsdiq edir';

-- Migration tamamlandı - Proxy Data Entry funksionallığı hazırdır