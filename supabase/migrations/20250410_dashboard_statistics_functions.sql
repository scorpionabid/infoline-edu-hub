
-- Sektorlar üçün statuslara görə sayları əldə etmək üçün funksiya
CREATE OR REPLACE FUNCTION public.get_sector_status_counts(sector_id_param UUID)
RETURNS TABLE(status TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.status,
    COUNT(de.id)::BIGINT
  FROM 
    public.data_entries de
  JOIN 
    public.schools s ON de.school_id = s.id
  WHERE 
    s.sector_id = sector_id_param
  GROUP BY 
    de.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sektora aid məktəblərin təsdiq statuslarını əldə etmək üçün funksiya
CREATE OR REPLACE FUNCTION public.get_school_approval_status_by_sector(sector_id_param UUID)
RETURNS TABLE(status TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH school_status AS (
    SELECT 
      s.id,
      CASE 
        WHEN COUNT(de.id) FILTER (WHERE de.status = 'approved') > 0 THEN 'approved'
        WHEN COUNT(de.id) FILTER (WHERE de.status = 'pending') > 0 THEN 'pending'
        WHEN COUNT(de.id) FILTER (WHERE de.status = 'rejected') > 0 THEN 'rejected'
        ELSE 'no_data'
      END as status
    FROM 
      public.schools s
    LEFT JOIN 
      public.data_entries de ON s.id = de.school_id
    WHERE 
      s.sector_id = sector_id_param
    GROUP BY 
      s.id
  )
  SELECT 
    status,
    COUNT(*)::BIGINT
  FROM 
    school_status
  GROUP BY 
    status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kateqoriyalar üzrə tamamlanma məlumatlarını əldə etmək üçün funksiya
CREATE OR REPLACE FUNCTION public.get_category_completion_by_sector(sector_id_param UUID)
RETURNS TABLE(category_name TEXT, completion_rate TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name AS category_name,
    ROUND(
      (COUNT(de.id) FILTER (WHERE de.status = 'approved')::FLOAT / 
       NULLIF(COUNT(de.id), 0)::FLOAT) * 100
    )::TEXT AS completion_rate
  FROM 
    public.categories c
  LEFT JOIN 
    public.data_entries de ON c.id = de.category_id
  LEFT JOIN 
    public.schools s ON de.school_id = s.id
  WHERE 
    s.sector_id = sector_id_param OR sector_id_param IS NULL
  GROUP BY 
    c.id, c.name
  ORDER BY 
    c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
