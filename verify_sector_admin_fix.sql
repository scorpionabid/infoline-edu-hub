-- İnfoLine - Sector Admin Assignment Verification SQL
-- Bu faylı icra etdikdən sonra səbtor admin təyin etmə düzgün işləyəcək

-- 1. Test edilməmiş sektorların region_id-ni düzəltmək
UPDATE sectors 
SET region_id = '60230000-7641-499d-b9a4-1ab1eb87eecc'
WHERE region_id IS NULL;

-- 2. NULL region_id olan sektoradminləri düzəltmək
UPDATE user_roles 
SET region_id = (
    SELECT s.region_id 
    FROM sectors s 
    WHERE s.id = user_roles.sector_id
)
WHERE role = 'sectoradmin' 
  AND region_id IS NULL 
  AND sector_id IS NOT NULL;

-- 3. Yoxlama sorğuları
-- 3.1. Problemli sektoradminləri yoxlamaq
SELECT 
    ur.id,
    ur.user_id,
    p.full_name,
    p.email,
    ur.role,
    ur.sector_id,
    ur.region_id,
    s.name as sector_name,
    r.name as region_name,
    CASE 
        WHEN ur.sector_id IS NULL THEN '❌ SECTOR_ID NULL'
        WHEN ur.region_id IS NULL THEN '❌ REGION_ID NULL'  
        ELSE '✅ TAMAM'
    END as status
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id
LEFT JOIN sectors s ON ur.sector_id = s.id
LEFT JOIN regions r ON ur.region_id = r.id
WHERE ur.role = 'sectoradmin'
ORDER BY ur.created_at DESC;

-- 3.2. Admin olmayan sektorları yoxlamaq
SELECT 
    s.id,
    s.name as sector_name,
    s.region_id,
    r.name as region_name,
    s.admin_id,
    s.admin_email,
    CASE 
        WHEN s.admin_id IS NULL THEN '⚠️ ADMİN TƏYIN EDİLMƏYİB'
        ELSE '✅ ADMİN VAR'
    END as admin_status
FROM sectors s
LEFT JOIN regions r ON s.region_id = r.id
ORDER BY s.name;

-- 3.3. Bütün sektorların region məlumatları
SELECT 
    s.id,
    s.name as sector_name,
    s.region_id,
    r.name as region_name,
    CASE 
        WHEN s.region_id IS NULL THEN '❌ REGION_ID NULL'
        ELSE '✅ REGION TƏYIN EDİLİB'
    END as region_status
FROM sectors s
LEFT JOIN regions r ON s.region_id = r.id
ORDER BY s.name;

-- 4. Test user-in vəziyyəti
SELECT 
    ur.user_id,
    p.full_name,
    p.email,
    ur.role,
    ur.sector_id,
    ur.region_id,
    s.name as sector_name,
    r.name as region_name
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id
LEFT JOIN sectors s ON ur.sector_id = s.id
LEFT JOIN regions r ON ur.region_id = r.id
WHERE p.email = 'test-user-1@example.com';
