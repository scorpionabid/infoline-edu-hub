
-- Məlumat daxil edilməsi zamanı bildiriş yaratmaq üçün trigger
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
        message,
        related_entity_type,
        related_entity_id
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
        message,
        related_entity_type,
        related_entity_id,
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

-- Data entries üçün trigger yaradırıq
DROP TRIGGER IF EXISTS data_change_notification_trigger ON data_entries;
CREATE TRIGGER data_change_notification_trigger
AFTER INSERT OR UPDATE ON data_entries
FOR EACH ROW
EXECUTE FUNCTION create_notification_on_data_change();

-- Kateqoriya son tarixi yaxınlaşdıqda bildiriş yaratmaq üçün funksiya
CREATE OR REPLACE FUNCTION public.check_category_deadline()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_category RECORD;
  v_school RECORD;
  v_warning_days INTEGER := 3; -- Son tarixə neçə gün qaldıqda xəbərdarlıq edəcəyik
BEGIN
  -- Aktiv kateqoriyaları və son tarixlərini əldə edirik
  FOR v_category IN 
    SELECT id, name, deadline 
    FROM categories 
    WHERE status = 'active' 
    AND deadline IS NOT NULL 
    AND deadline > NOW()
    AND deadline <= NOW() + (v_warning_days || ' days')::INTERVAL
  LOOP
    -- Məktəbləri əldə edirik
    FOR v_school IN 
      SELECT id, admin_id 
      FROM schools 
      WHERE status = 'active'
      AND admin_id IS NOT NULL
    LOOP
      -- Bildiriş yaradırıq
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_entity_type,
        related_entity_id,
        priority
      ) VALUES (
        v_school.admin_id,
        'deadline_warning',
        'Son tarix xəbərdarlığı',
        v_category.name || ' kateqoriyası üçün məlumat daxil etmə son tarixi yaxınlaşır: ' || 
        to_char(v_category.deadline, 'YYYY-MM-DD HH24:MI'),
        'category',
        v_category.id,
        'high'
      )
      ON CONFLICT DO NOTHING; -- Eyni bildirişin təkrarlanmasının qarşısını alırıq
    END LOOP;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Son tarix yoxlanarkən xəta: %', SQLERRM;
END;
$$;
