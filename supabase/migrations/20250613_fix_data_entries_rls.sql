-- ============================================================================
-- İnfoLine Data Entries RLS Policy-ləri
-- ============================================================================
-- Məqsəd: data_entries cədvəli üçün RLS policy-lərini yaratmaq və SchoolAdmin
-- istifadəçilərinin məlumat daxil etmə problemini həll etmək

-- Əvvəlki policy-ləri təmizləyək (əgər mövcuddursa)
DROP POLICY IF EXISTS "SuperAdmin data_entries full access" ON data_entries;
DROP POLICY IF EXISTS "RegionAdmin data_entries access" ON data_entries;
DROP POLICY IF EXISTS "SectorAdmin data_entries access" ON data_entries;
DROP POLICY IF EXISTS "SchoolAdmin data_entries access" ON data_entries;

-- ============================================================================
-- Köməkçi Funksiyalar
-- ============================================================================

-- İstifadəçinin rolunu təhlükəsiz şəkildə qaytaran funksiya
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text 
  FROM user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- İstifadəçinin məktəb ID-sini qaytaran funksiya
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT school_id 
  FROM user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- İstifadəçinin sektor ID-sini qaytaran funksiya
CREATE OR REPLACE FUNCTION public.get_user_sector_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT sector_id 
  FROM user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- İstifadəçinin region ID-sini qaytaran funksiya
CREATE OR REPLACE FUNCTION public.get_user_region_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT region_id 
  FROM user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- ============================================================================
-- RLS Policy-ləri
-- ============================================================================

-- RLS-i aktivləşdiririk (əgər aktivləşdirimmişsə)
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;

-- 1. SuperAdmin - bütün məlumatlar üçün tam giriş
CREATE POLICY "SuperAdmin data_entries full access" 
ON data_entries 
FOR ALL 
TO authenticated
USING (public.get_user_role() = 'superadmin');

-- 2. RegionAdmin - öz regionundakı məktəblərin məlumatları
CREATE POLICY "RegionAdmin data_entries access" 
ON data_entries 
FOR ALL 
TO authenticated
USING (
  public.get_user_role() = 'regionadmin' AND
  school_id IN (
    SELECT id FROM schools 
    WHERE region_id = public.get_user_region_id()
  )
);

-- 3. SectorAdmin - öz sektorundakı məktəblərin məlumatları
CREATE POLICY "SectorAdmin data_entries access" 
ON data_entries 
FOR ALL 
TO authenticated
USING (
  public.get_user_role() = 'sectoradmin' AND
  school_id IN (
    SELECT id FROM schools 
    WHERE sector_id = public.get_user_sector_id()
  )
);

-- 4. SchoolAdmin - yalnız öz məktəbinin məlumatları (ƏN MÜHÜM!)
CREATE POLICY "SchoolAdmin data_entries access" 
ON data_entries 
FOR ALL 
TO authenticated
USING (
  public.get_user_role() = 'schooladmin' AND
  school_id = public.get_user_school_id()
);

-- ============================================================================
-- İndekslər (Performans üçün)
-- ============================================================================

-- RLS policy-lərinin performansını artırmaq üçün indekslər
CREATE INDEX IF NOT EXISTS idx_data_entries_school_id ON data_entries(school_id);
CREATE INDEX IF NOT EXISTS idx_schools_sector_id ON schools(sector_id);
CREATE INDEX IF NOT EXISTS idx_schools_region_id ON schools(region_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- ============================================================================
-- Test və Validasiya
-- ============================================================================

-- Policy-lərin düzgün işlədiyini yoxlamaq üçün test sorğuları
-- Bu sorğular manual olaraq SQL Editor-də icra edilə bilər:

-- TEST 1: SuperAdmin access test
-- SELECT COUNT(*) FROM data_entries; -- SuperAdmin üçün bütün məlumatlar görünməlidir

-- TEST 2: SchoolAdmin access test  
-- SELECT COUNT(*) FROM data_entries; -- SchoolAdmin üçün yalnız öz məktəbinin məlumatları görünməlidir

-- TEST 3: Giriş icazəsi yoxlanması
-- SELECT public.get_user_role(); -- İstifadəçinin rolunu qaytarmalıdır
-- SELECT public.get_user_school_id(); -- SchoolAdmin üçün məktəb ID-sini qaytarmalıdır

-- ============================================================================
-- Log və Debug
-- ============================================================================

-- Bu migration-ın uğurla tamamlandığını log edirik
DO $$
BEGIN
  RAISE NOTICE '✅ Data Entries RLS Policy-ləri uğurla yaradıldı';
  RAISE NOTICE '🔑 SchoolAdmin artıq data_entries cədvəlinə giriş əldə edə bilər';
  RAISE NOTICE '📊 4 policy yaradıldı: SuperAdmin, RegionAdmin, SectorAdmin, SchoolAdmin';
  RAISE NOTICE '⚡ Performance indeksləri əlavə edildi';
END $$;
