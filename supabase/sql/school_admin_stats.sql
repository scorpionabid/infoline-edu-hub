
-- Məktəb admini üçün statistika funksiyası
-- Bu SQL funksiyası, məktəb admini üçün dashboard statistikalarını əldə etmək üçün yaradılıb.
-- Funksiya məktəbin id-sini qəbul edir və aşağıdakı məlumatları qaytarır:
-- - pending_forms: Gözləyən formaların sayı
-- - approved_forms: Təsdiqlənmiş formaların sayı
-- - rejected_forms: Rədd edilmiş formaların sayı
-- - due_soon_forms: Vaxtı yaxınlaşan formaların sayı (3 gün içində)
-- - overdue_forms: Vaxtı keçmiş formaların sayı
-- - completion_rate: Tamamlanma faizi

CREATE OR REPLACE FUNCTION get_school_admin_stats(school_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  pending_count INTEGER;
  approved_count INTEGER;
  rejected_count INTEGER;
  due_soon_count INTEGER;
  overdue_count INTEGER;
  completion_rate INTEGER;
  total_entries INTEGER;
  filled_entries INTEGER;
BEGIN
  -- Gözləyən formaların sayını əldə et
  SELECT COUNT(*) INTO pending_count
  FROM data_entries
  WHERE school_id = school_id_param AND status = 'pending';
  
  -- Təsdiqlənmiş formaların sayını əldə et
  SELECT COUNT(*) INTO approved_count
  FROM data_entries
  WHERE school_id = school_id_param AND status = 'approved';
  
  -- Rədd edilmiş formaların sayını əldə et
  SELECT COUNT(*) INTO rejected_count
  FROM data_entries
  WHERE school_id = school_id_param AND status = 'rejected';
  
  -- Vaxtı yaxınlaşan formaların sayını əldə et (3 gün içində olan deadline-lər)
  SELECT COUNT(*) INTO due_soon_count
  FROM data_entries de
  JOIN columns c ON de.column_id = c.id
  JOIN categories cat ON c.category_id = cat.id
  WHERE de.school_id = school_id_param
    AND cat.deadline IS NOT NULL
    AND cat.deadline > NOW()
    AND cat.deadline <= NOW() + INTERVAL '3 days'
    AND de.status = 'pending';
  
  -- Vaxtı keçmiş formaların sayını əldə et
  SELECT COUNT(*) INTO overdue_count
  FROM data_entries de
  JOIN columns c ON de.column_id = c.id
  JOIN categories cat ON c.category_id = cat.id
  WHERE de.school_id = school_id_param
    AND cat.deadline IS NOT NULL
    AND cat.deadline < NOW()
    AND de.status = 'pending';
  
  -- Tamamlanma faizini hesabla
  SELECT COUNT(*) INTO total_entries
  FROM schools_required_columns
  WHERE school_id = school_id_param;
  
  SELECT COUNT(*) INTO filled_entries
  FROM data_entries
  WHERE school_id = school_id_param AND status IN ('approved', 'pending');
  
  -- Əgər total_entries sıfırdırsa, completion_rate 0 olacaq
  IF total_entries > 0 THEN
    completion_rate := (filled_entries * 100) / total_entries;
  ELSE
    completion_rate := 0;
  END IF;
  
  -- Nəticəni JSON formatında qaytaraq
  result := json_build_object(
    'pending_forms', pending_count,
    'approved_forms', approved_count,
    'rejected_forms', rejected_count,
    'due_soon_forms', due_soon_count,
    'overdue_forms', overdue_count,
    'completion_rate', completion_rate,
    'total_entries', total_entries,
    'filled_entries', filled_entries
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'error', SQLERRM,
    'pending_forms', 0,
    'approved_forms', 0,
    'rejected_forms', 0,
    'due_soon_forms', 0,
    'overdue_forms', 0,
    'completion_rate', 0,
    'total_entries', 0,
    'filled_entries', 0
  );
END;
$$;

-- schools_required_columns cədvəli mövcud deyilsə, onu əvəz edəcək bir funksiya
CREATE OR REPLACE FUNCTION get_schools_required_columns_count(school_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_count INTEGER;
BEGIN
  -- Bütün məcburi sütunların sayı
  SELECT COUNT(*) INTO column_count
  FROM columns c
  JOIN categories cat ON c.category_id = cat.id
  WHERE c.is_required = TRUE
    AND (cat.assignment = 'all' OR cat.assignment = 'sectors');
  
  RETURN column_count;
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$;
