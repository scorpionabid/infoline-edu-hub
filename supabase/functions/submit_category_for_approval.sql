
-- submit_category_for_approval adlı stored procedure yaradaq
CREATE OR REPLACE FUNCTION public.submit_category_for_approval(
  p_category_id UUID,
  p_school_id UUID
) RETURNS SETOF public.data_entries
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kateqoriya üçün bütün mövcud məlumatların statusunu yeniləyək
  RETURN QUERY
  UPDATE public.data_entries
  SET 
    status = 'pending',
    updated_at = now()
  WHERE 
    category_id = p_category_id AND 
    school_id = p_school_id AND
    (status = 'rejected' OR status IS NULL)
  RETURNING *;
END;
$$;
