
-- Filtered users qayıdan database function
CREATE OR REPLACE FUNCTION public.get_filtered_users(
  p_role text[] DEFAULT NULL,
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL,
  p_school_id uuid DEFAULT NULL,
  p_status text[] DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(user_json json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _offset integer;
  _current_user_role text;
  _current_user_region_id uuid;
  _current_user_sector_id uuid;
BEGIN
  -- Cari istifadəçi məlumatlarını əldə et
  SELECT role, region_id, sector_id INTO _current_user_role, _current_user_region_id, _current_user_sector_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Offset hesabla
  _offset := (p_page - 1) * p_limit;
  
  -- SuperAdmin bütün istifadəçiləri görə bilər
  IF _current_user_role = 'superadmin' THEN
    RETURN QUERY
    WITH user_data AS (
      SELECT
        u.id,
        p.email,
        p.full_name,
        p.full_name as name,
        ur.role,
        ur.region_id,
        ur.sector_id,
        ur.school_id,
        p.phone,
        p.position,
        p.language,
        p.avatar,
        p.status,
        p.last_login,
        p.created_at,
        p.updated_at,
        COALESCE(
          r.name, 
          s.name, 
          sch.name
        ) as entity_name
      FROM 
        user_roles ur
      JOIN 
        profiles p ON ur.user_id = p.id
      LEFT JOIN
        regions r ON ur.region_id = r.id
      LEFT JOIN
        sectors s ON ur.sector_id = s.id
      LEFT JOIN
        schools sch ON ur.school_id = sch.id,
        auth.users u
      WHERE 
        ur.user_id = u.id
        AND (p_role IS NULL OR ur.role = ANY(p_role))
        AND (p_region_id IS NULL OR ur.region_id = p_region_id)
        AND (p_sector_id IS NULL OR ur.sector_id = p_sector_id)
        AND (p_school_id IS NULL OR ur.school_id = p_school_id)
        AND (p_status IS NULL OR p.status = ANY(p_status))
        AND (
          p_search IS NULL OR 
          p.full_name ILIKE '%' || p_search || '%' OR 
          p.email ILIKE '%' || p_search || '%' OR
          COALESCE(p.phone, '') ILIKE '%' || p_search || '%'
        )
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET _offset
    )
    SELECT row_to_json(user_data) FROM user_data;
  
  -- RegionAdmin öz regionundakı istifadəçiləri görə bilər
  ELSIF _current_user_role = 'regionadmin' THEN
    RETURN QUERY
    WITH user_data AS (
      SELECT
        u.id,
        p.email,
        p.full_name,
        p.full_name as name,
        ur.role,
        ur.region_id,
        ur.sector_id,
        ur.school_id,
        p.phone,
        p.position,
        p.language,
        p.avatar,
        p.status,
        p.last_login,
        p.created_at,
        p.updated_at,
        COALESCE(
          s.name, 
          sch.name
        ) as entity_name
      FROM 
        user_roles ur
      JOIN 
        profiles p ON ur.user_id = p.id
      LEFT JOIN
        sectors s ON ur.sector_id = s.id
      LEFT JOIN
        schools sch ON ur.school_id = sch.id,
        auth.users u
      WHERE 
        ur.user_id = u.id
        AND ur.region_id = _current_user_region_id
        AND (p_role IS NULL OR ur.role = ANY(p_role))
        AND (p_sector_id IS NULL OR ur.sector_id = p_sector_id)
        AND (p_school_id IS NULL OR ur.school_id = p_school_id)
        AND (p_status IS NULL OR p.status = ANY(p_status))
        AND (
          p_search IS NULL OR 
          p.full_name ILIKE '%' || p_search || '%' OR 
          p.email ILIKE '%' || p_search || '%' OR
          COALESCE(p.phone, '') ILIKE '%' || p_search || '%'
        )
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET _offset
    )
    SELECT row_to_json(user_data) FROM user_data;
  
  -- SectorAdmin öz sektorundakı məktəblərin adminlərini görə bilər
  ELSIF _current_user_role = 'sectoradmin' THEN
    RETURN QUERY
    WITH user_data AS (
      SELECT
        u.id,
        p.email,
        p.full_name,
        p.full_name as name,
        ur.role,
        ur.region_id,
        ur.sector_id,
        ur.school_id,
        p.phone,
        p.position,
        p.language,
        p.avatar,
        p.status,
        p.last_login,
        p.created_at,
        p.updated_at,
        sch.name as entity_name
      FROM 
        user_roles ur
      JOIN 
        profiles p ON ur.user_id = p.id
      LEFT JOIN
        schools sch ON ur.school_id = sch.id,
        auth.users u
      WHERE 
        ur.user_id = u.id
        AND ur.sector_id = _current_user_sector_id
        AND ur.role = 'schooladmin'
        AND (p_school_id IS NULL OR ur.school_id = p_school_id)
        AND (p_status IS NULL OR p.status = ANY(p_status))
        AND (
          p_search IS NULL OR 
          p.full_name ILIKE '%' || p_search || '%' OR 
          p.email ILIKE '%' || p_search || '%' OR
          COALESCE(p.phone, '') ILIKE '%' || p_search || '%'
        )
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET _offset
    )
    SELECT row_to_json(user_data) FROM user_data;
  
  -- SchoolAdmin yalnız özünü görə bilər
  ELSE
    RETURN QUERY
    WITH user_data AS (
      SELECT
        u.id,
        p.email,
        p.full_name,
        p.full_name as name,
        ur.role,
        ur.region_id,
        ur.sector_id,
        ur.school_id,
        p.phone,
        p.position,
        p.language,
        p.avatar,
        p.status,
        p.last_login,
        p.created_at,
        p.updated_at,
        sch.name as entity_name
      FROM 
        user_roles ur
      JOIN 
        profiles p ON ur.user_id = p.id
      LEFT JOIN
        schools sch ON ur.school_id = sch.id,
        auth.users u
      WHERE 
        ur.user_id = u.id
        AND ur.user_id = auth.uid()
      LIMIT 1
    )
    SELECT row_to_json(user_data) FROM user_data;
  END IF;
END;
$$;

-- Count almaq üçün ayrı bir funksiya
CREATE OR REPLACE FUNCTION public.get_filtered_users_count(
  p_role text[] DEFAULT NULL,
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL,
  p_school_id uuid DEFAULT NULL,
  p_status text[] DEFAULT NULL,
  p_search text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _count integer;
  _current_user_role text;
  _current_user_region_id uuid;
  _current_user_sector_id uuid;
BEGIN
  -- Cari istifadəçi məlumatlarını əldə et
  SELECT role, region_id, sector_id INTO _current_user_role, _current_user_region_id, _current_user_sector_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- SuperAdmin bütün istifadəçiləri görə bilər
  IF _current_user_role = 'superadmin' THEN
    SELECT COUNT(*)
    INTO _count
    FROM 
      user_roles ur
    JOIN 
      profiles p ON ur.user_id = p.id
    LEFT JOIN
      regions r ON ur.region_id = r.id
    LEFT JOIN
      sectors s ON ur.sector_id = s.id
    LEFT JOIN
      schools sch ON ur.school_id = sch.id,
      auth.users u
    WHERE 
      ur.user_id = u.id
      AND (p_role IS NULL OR ur.role = ANY(p_role))
      AND (p_region_id IS NULL OR ur.region_id = p_region_id)
      AND (p_sector_id IS NULL OR ur.sector_id = p_sector_id)
      AND (p_school_id IS NULL OR ur.school_id = p_school_id)
      AND (p_status IS NULL OR p.status = ANY(p_status))
      AND (
        p_search IS NULL OR 
        p.full_name ILIKE '%' || p_search || '%' OR 
        p.email ILIKE '%' || p_search || '%' OR
        COALESCE(p.phone, '') ILIKE '%' || p_search || '%'
      );
  
  -- RegionAdmin öz regionundakı istifadəçiləri görə bilər
  ELSIF _current_user_role = 'regionadmin' THEN
    SELECT COUNT(*)
    INTO _count
    FROM 
      user_roles ur
    JOIN 
      profiles p ON ur.user_id = p.id
    LEFT JOIN
      sectors s ON ur.sector_id = s.id
    LEFT JOIN
      schools sch ON ur.school_id = sch.id,
      auth.users u
    WHERE 
      ur.user_id = u.id
      AND ur.region_id = _current_user_region_id
      AND (p_role IS NULL OR ur.role = ANY(p_role))
      AND (p_sector_id IS NULL OR ur.sector_id = p_sector_id)
      AND (p_school_id IS NULL OR ur.school_id = p_school_id)
      AND (p_status IS NULL OR p.status = ANY(p_status))
      AND (
        p_search IS NULL OR 
        p.full_name ILIKE '%' || p_search || '%' OR 
        p.email ILIKE '%' || p_search || '%' OR
        COALESCE(p.phone, '') ILIKE '%' || p_search || '%'
      );
  
  -- SectorAdmin öz sektorundakı məktəblərin adminlərini görə bilər
  ELSIF _current_user_role = 'sectoradmin' THEN
    SELECT COUNT(*)
    INTO _count
    FROM 
      user_roles ur
    JOIN 
      profiles p ON ur.user_id = p.id
    LEFT JOIN
      schools sch ON ur.school_id = sch.id,
      auth.users u
    WHERE 
      ur.user_id = u.id
      AND ur.sector_id = _current_user_sector_id
      AND ur.role = 'schooladmin'
      AND (p_school_id IS NULL OR ur.school_id = p_school_id)
      AND (p_status IS NULL OR p.status = ANY(p_status))
      AND (
        p_search IS NULL OR 
        p.full_name ILIKE '%' || p_search || '%' OR 
        p.email ILIKE '%' || p_search || '%' OR
        COALESCE(p.phone, '') ILIKE '%' || p_search || '%'
      );
  
  -- SchoolAdmin yalnız özünü görə bilər
  ELSE
    _count := 1;
  END IF;
  
  RETURN _count;
END;
$$;
