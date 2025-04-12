
-- Məlumatların toplu yenilənməsi üçün funksiya
CREATE OR REPLACE FUNCTION public.bulk_update_data_entries(
  p_entries JSONB[],
  p_school_id UUID,
  p_category_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_entry JSONB;
  v_count INTEGER := 0;
  v_updated_ids UUID[] := '{}';
BEGIN
  -- İstifadəçinin məktəb admini olduğunu yoxlayırıq
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id
    AND school_id = p_school_id
    AND role = 'schooladmin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Bu məktəb üçün admin səlahiyyətiniz yoxdur'
    );
  END IF;
  
  -- Dövrdə bütün məlumatları yeniləyirik
  FOR i IN 1..array_length(p_entries, 1) LOOP
    v_entry := p_entries[i];
    
    -- Əgər mövcud məlumat varsa, yeniləyirik
    IF (v_entry->>'id') IS NOT NULL THEN
      UPDATE data_entries
      SET 
        value = v_entry->>'value',
        updated_at = NOW()
      WHERE 
        id = (v_entry->>'id')::UUID
        AND school_id = p_school_id
        AND category_id = p_category_id
        AND status != 'approved'; -- Təsdiqlənmiş məlumatlar yenilənə bilməz
      
      IF FOUND THEN
        v_count := v_count + 1;
        v_updated_ids := v_updated_ids || (v_entry->>'id')::UUID;
      END IF;
    -- Əks halda yeni məlumat əlavə edirik
    ELSE
      INSERT INTO data_entries (
        column_id,
        category_id,
        school_id,
        value,
        created_by,
        status
      ) VALUES (
        (v_entry->>'column_id')::UUID,
        p_category_id,
        p_school_id,
        v_entry->>'value',
        p_user_id,
        'pending'
      )
      RETURNING id INTO v_entry;
      
      v_count := v_count + 1;
      v_updated_ids := v_updated_ids || v_entry::UUID;
    END IF;
  END LOOP;
  
  -- Audit log əlavə edirik
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    new_value
  ) VALUES (
    p_user_id,
    'bulk_update_data',
    'category',
    p_category_id,
    jsonb_build_object(
      'school_id', p_school_id,
      'updated_count', v_count,
      'updated_at', NOW()
    )
  );
  
  -- Tamamlanma dərəcəsini hesablayırıq
  PERFORM calculate_completion_rate(p_school_id, p_category_id);
  
  -- Nəticəni qaytarırıq
  v_result := jsonb_build_object(
    'success', true,
    'updated_count', v_count,
    'updated_ids', v_updated_ids
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Tamamlanma dərəcəsini hesablamaq üçün funksiya
CREATE OR REPLACE FUNCTION public.calculate_completion_rate(
  p_school_id UUID,
  p_category_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_columns INTEGER;
  v_filled_entries INTEGER;
  v_completion_rate INTEGER;
BEGIN
  -- Kateqoriyadakı sütunların sayını əldə edirik
  SELECT COUNT(*) INTO v_total_columns
  FROM columns
  WHERE category_id = p_category_id
  AND status = 'active';
  
  -- Doldurulmuş məlumatların sayını əldə edirik
  SELECT COUNT(*) INTO v_filled_entries
  FROM data_entries
  WHERE school_id = p_school_id
  AND category_id = p_category_id
  AND value IS NOT NULL
  AND value != '';
  
  -- Tamamlanma dərəcəsini hesablayırıq
  IF v_total_columns > 0 THEN
    v_completion_rate := (v_filled_entries * 100) / v_total_columns;
  ELSE
    v_completion_rate := 0;
  END IF;
  
  -- Məktəbin tamamlanma dərəcəsini yeniləyirik
  UPDATE schools
  SET completion_rate = v_completion_rate,
      updated_at = NOW()
  WHERE id = p_school_id;
  
  RETURN v_completion_rate;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tamamlanma dərəcəsi hesablanarkən xəta: %', SQLERRM;
  RETURN 0;
END;
$$;

-- Məlumatların toplu təsdiqlənməsi üçün funksiya
CREATE OR REPLACE FUNCTION public.bulk_approve_data_entries(
  p_entry_ids UUID[],
  p_school_id UUID,
  p_category_id UUID,
  p_approved_by UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_count INTEGER := 0;
  v_approved_ids UUID[] := '{}';
  v_school_admin_id UUID;
BEGIN
  -- İstifadəçinin admin rolunda olduğunu yoxlayırıq
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_approved_by
    AND role IN ('superadmin', 'regionadmin', 'sectoradmin')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Məlumatları təsdiqləmək üçün admin səlahiyyətiniz yoxdur'
    );
  END IF;
  
  -- Məktəb admin ID-sini əldə edirik
  SELECT admin_id INTO v_school_admin_id
  FROM schools
  WHERE id = p_school_id;
  
  -- Məlumatları təsdiqləyirik
  UPDATE data_entries
  SET 
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE 
    id = ANY(p_entry_ids)
    AND school_id = p_school_id
    AND category_id = p_category_id
    AND status = 'pending';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Təsdiqlənmiş ID-ləri əldə edirik
  SELECT array_agg(id) INTO v_approved_ids
  FROM data_entries
  WHERE id = ANY(p_entry_ids)
  AND status = 'approved';
  
  -- Audit log əlavə edirik
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    new_value
  ) VALUES (
    p_approved_by,
    'bulk_approve_data',
    'category',
    p_category_id,
    jsonb_build_object(
      'school_id', p_school_id,
      'approved_count', v_count,
      'approved_at', NOW()
    )
  );
  
  -- Nəticəni qaytarırıq
  v_result := jsonb_build_object(
    'success', true,
    'approved_count', v_count,
    'approved_ids', v_approved_ids,
    'school_admin_id', v_school_admin_id
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
