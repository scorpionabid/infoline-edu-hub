
-- Bu funksiya bütün kateqoriyanın məlumatlarını təsdiq üçün göndərir
CREATE OR REPLACE FUNCTION public.submit_category_for_approval(p_category_id UUID, p_school_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_column_id UUID;
  v_status TEXT;
  v_count INT := 0;
  v_success BOOLEAN := TRUE;
BEGIN
  -- Əvvəlcə kateqoriyanın bütün sütunlarını əldə edək
  FOR v_column_id IN 
    SELECT id FROM public.columns 
    WHERE category_id = p_category_id AND status = 'active'
  LOOP
    -- Hər bir sütun üçün məlumatları təsdiq üçün göndərək
    BEGIN
      -- Məlumatın statusunu yoxlayaq
      SELECT status INTO v_status
      FROM public.data_entries
      WHERE school_id = p_school_id 
        AND category_id = p_category_id
        AND column_id = v_column_id;
        
      -- Əgər məlumat yoxdursa, onu əlavə edək
      IF v_status IS NULL THEN
        INSERT INTO public.data_entries (
          school_id, 
          category_id, 
          column_id, 
          value, 
          status,
          created_by
        )
        VALUES (
          p_school_id, 
          p_category_id, 
          v_column_id, 
          '', 
          'pending',
          auth.uid()
        );
        v_count := v_count + 1;
      -- Əgər status approved deyilsə, pending kimi yeniləyək
      ELSIF v_status != 'approved' THEN
        UPDATE public.data_entries
        SET status = 'pending'
        WHERE school_id = p_school_id 
          AND category_id = p_category_id
          AND column_id = v_column_id;
        v_count := v_count + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        v_success := FALSE;
    END;
  END LOOP;
  
  RETURN v_success;
END;
$$;
