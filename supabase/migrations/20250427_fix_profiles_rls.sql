
-- Əvvəlki RLS qaydalarını silək ki, recursion problemləri aradan qalxsın
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Profiles are updatable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "SuperAdmin access to all profiles" ON profiles;
DROP POLICY IF EXISTS "Everyone can see all profiles" ON profiles;

-- Təhlükəsiz RLS qaydaları yaradaq - recursion olmadan

-- 1. SECURITY DEFINER funksiyalar əlavə edək
CREATE OR REPLACE FUNCTION public.user_has_role(role_param text)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role::text = role_param
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;

-- 2. İstifadəçilərin öz profillərini görməsi üçün qayda
CREATE POLICY "Users see own profiles" 
ON profiles 
FOR SELECT 
USING (id = public.get_current_user_profile());

-- 3. SuperAdmin bütün profillərə çıxış əldə edir
CREATE POLICY "SuperAdmin full access to profiles" 
ON profiles 
FOR ALL 
USING (public.user_has_role('superadmin'));

-- 4. RegionAdmin öz regionundakı istifadəçilərin profillərini görə bilər
CREATE POLICY "RegionAdmin sees profiles in own region" 
ON profiles 
FOR SELECT 
USING (
  id IN (
    SELECT user_id FROM user_roles 
    WHERE region_id IN (
      SELECT region_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'regionadmin'
    )
  )
);

-- 5. SectorAdmin öz sektorundakı istifadəçilərin profillərini görə bilər
CREATE POLICY "SectorAdmin sees profiles in own sector" 
ON profiles 
FOR SELECT 
USING (
  id IN (
    SELECT user_id FROM user_roles 
    WHERE sector_id IN (
      SELECT sector_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'sectoradmin'
    )
  )
);

-- 6. Əlavə funksiya: Supabase Edge funksionerlisi üçün köməkçi
CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role 
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'user';
END;
$$;
