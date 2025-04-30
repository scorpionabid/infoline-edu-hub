u sənəd İnfoLine proyektinin Supabase verilənlər bazası strukturunu, RLS siyasətlərini və Edge Functions-ları əhatə edir. Bu məlumatlar xətaların analizi və həlli üçün istifadə edilə bilər.

Cədvəl Strukturları
1. notifications Cədvəli
Sütunlar:

id (uuid, NOT NULL): Unikal identifikator
user_id (uuid, NOT NULL): İstifadəçi ID-si
type (text, NOT NULL): Bildiriş növü
title (text, NOT NULL): Bildiriş başlığı
message (text, YES): Bildiriş mesajı
related_entity_id (uuid, YES): Əlaqəli obyektin ID-si
related_entity_type (text, YES): Əlaqəli obyektin növü
is_read (boolean, YES): Oxunub-oxunmadığını göstərir
priority (text, YES): Prioritet
created_at (timestamp with time zone, NOT NULL): Yaradılma tarixi
2. data_entries Cədvəli
Sütunlar:

id (uuid, NOT NULL): Unikal identifikator
school_id (uuid, NOT NULL): Məktəb ID-si
category_id (uuid, NOT NULL): Kateqoriya ID-si
column_id (uuid, NOT NULL): Sütun ID-si
value (text, YES): Dəyər
status (text, YES): Status
created_at (timestamp with time zone, NOT NULL): Yaradılma tarixi
updated_at (timestamp with time zone, NOT NULL): Yenilənmə tarixi
created_by (uuid, YES): Yaradan istifadəçi ID-si
approved_by (uuid, YES): Təsdiqləyən istifadəçi ID-si
approved_at (timestamp with time zone, YES): Təsdiqlənmə tarixi
rejected_by (uuid, YES): Rədd edən istifadəçi ID-si
3. columns Cədvəli
Sütunlar:

id (uuid, NOT NULL): Unikal identifikator
category_id (uuid, YES): Kateqoriya ID-si
name (text, NOT NULL): Sütun adı
type (text, NOT NULL): Sütun tipi
is_required (boolean, YES): Məcburi olub-olmadığı
placeholder (text, YES): Placeholder mətni
help_text (text, YES): Kömək mətni
order_index (integer, YES): Sıralama indeksi
status (text, YES): Status
validation (jsonb, YES): Validasiya qaydaları
default_value (text, YES): Default dəyər
options (jsonb, YES): Seçim variantları
Nümunə Məlumatlar
columns Cədvəlindən Nümunə Məlumatlar:
| id | name | type | options | |----|------|------|---------| | 653da49a-8ef0-460b-a69c-3cc3e6769fd6 | Məktəb ərazisinin sahəsi (m²) | number | NULL | | 51f4eb91-27ad-4e92-a36d-59e6b24a1e7a | Direktor olmayan məktəblər | number | NULL | | bb8c4236-8540-496a-8be6-2382fb2dd7c9 | Ali məktəblərə qəbul faizi | number | NULL | | 239a7f35-9390-4241-a6c5-b8a08da6c989 | Bu il müəllimlər təlimlərdə iştirak ediblər? | boolean | NULL | | b6f9c6b9-cb68-46b2-b448-06828ff60347 | Buraxılış imtahanı nəticələri | number | NULL |

options Sütununun Formatı:
Bəzi sütunlarda options sütunu JSON formatında məlumatlar saxlayır. Nümunə formatlar:

json
CopyInsert
{"label":"Yola bilər","value":"yola_bilar"},{"label":"Yola bilməz","value":"yola_bilmez"}
json
CopyInsert
{"label":"Bəzən","value":"bezen_1"},{"label":"Həmişə","value":"hemise_1"},{"label":"Heç vaxt","value":"hec_vaxt_1"}
RLS Siyasətləri
# İnfoLine Sistemi RLS Təhlükəsizlik Konfiqurasiyası

## Sənəd Məqsədi

Bu sənəd, İnfoLine təhsil sistemində tətbiq olunmuş Row Level Security (RLS) siyasətlərini təsvir edir. RLS, istifadəçilərin yalnız öz rollarına uyğun məlumatlara giriş əldə etməsini təmin edən verilənlər bazası səviyyəsində təhlükəsizlik mexanizmidir.

## Sistem Haqqında

İnfoLine, Azərbaycanda 600+ məktəbi əhatə edən mərkəzləşdirilmiş veb platformadır. Sistem 4 əsas rolu dəstəkləyir:

- **SuperAdmin**: Bütün sistemə tam giriş
- **RegionAdmin**: Region daxilində tam səlahiyyət
- **SectorAdmin**: Sektor daxilində tam səlahiyyət
- **SchoolAdmin**: Yalnız öz məktəbi üzərində səlahiyyət

## RLS Siyasətləri

Aşağıdakı cədvəllər üçün RLS siyasətləri tətbiq edilib:

| Cədvəl               | Siyasətlər                                             |
|----------------------|--------------------------------------------------------|
| regions              | superadmin_regions, regionadmin_own_region              |
| sectors              | superadmin_sectors, regionadmin_sectors, sectoradmin_own_sector |
| schools              | superadmin_schools, regionadmin_schools, sectoradmin_schools, schooladmin_own_school |
| categories           | all_users_select_categories, admin_manage_categories    |
| columns              | all_users_select_columns, admin_manage_columns         |
| data_entries         | superadmin_data_entries, regionadmin_data_entries, sectoradmin_data_entries, schooladmin_data_entries |
| user_roles           | superadmin_user_roles, regionadmin_user_roles, sectoradmin_user_roles, view_own_role |
| profiles             | superadmin_profiles, regionadmin_profiles, sectoradmin_profiles, view_own_profile |
| notifications        | superadmin_notifications, user_notifications           |
| audit_logs           | superadmin_audit_logs, regionadmin_audit_logs          |
| sector_data_entries  | superadmin_sector_data, regionadmin_sector_data, sectoradmin_sector_data |
| report_templates     | superadmin_report_templates, admin_select_report_templates |

## Rol Hədd Funksiyaları

Sistemdə üç əsas yardımçı funksiya istifadə olunur:

1. **has_access_to_region**: İstifadəçinin regiona giriş hüququnu yoxlayır
2. **has_access_to_sector**: İstifadəçinin sektora giriş hüququnu yoxlayır
3. **has_access_to_school**: İstifadəçinin məktəbə giriş hüququnu yoxlayır

## Rol İdentifikasiya Funksiyaları

Dörd əsas rol yoxlama funksiyası mövcuddur:

1. **is_superadmin**: İstifadəçinin superadmin olub-olmadığını yoxlayır
2. **is_regionadmin**: İstifadəçinin regionadmin olub-olmadığını yoxlayır
3. **is_sectoradmin**: İstifadəçinin sectoradmin olub-olmadığını yoxlayır
4. **is_schooladmin**: İstifadəçinin schooladmin olub-olmadığını yoxlayır

## Test Nəticələri

RLS siyasətlərinin effektivliyini yoxlamaq üçün aparılan testlərin nəticələri:

### Schools Cədvəli Test Nəticələri

| Rol         | UUID | Görünən Məktəb Sayı | Gözlənilən |
|-------------|------|---------------------|------------|
| SuperAdmin  | d056c1f9-3df2-4483-9106-c6853c3ce765 | 352 | 352 (Bütün) |
| RegionAdmin | 5bed6ada-2728-4944-aa6e-0b6a28be2ecf | 352 | 352 (Öz regionundakı) |
| SectorAdmin | 6dd546fa-ef48-4238-a2d4-10748edbf0eb | 94  | 94 (Öz sektorundakı) |
| SchoolAdmin | 017be5ec-a093-460c-8a38-815f29d2ae30 | 1   | 1 (Yalnız öz məktəbi) |

### Digər Cədvəllər Üçün Test Nəticələri

Bütün digər cədvəllər üçün aparılan test nəticələri də eyni prinsipi təsdiqləyir - hər rol yalnız öz səlahiyyət dairəsindəki məlumatlara giriş əldə edir:

- **Data_entries**: Hər rol yalnız öz məktəblərinə aid məlumatları görə bilir
- **Categories və Columns**: Bütün istifadəçilər görə bilir, lakin yalnız superadmin və regionadmin redaktə edə bilir
- **Regions və Sectors**: Hər rol yalnız öz səlahiyyət dairəsindəki regon və sektorları görə bilir
- **User_roles və Profiles**: Hər rol yalnız öz səlahiyyət dairəsindəki istifadəçi profillərinə və rollarına baxa bilir
- **Notifications**: Hər istifadəçi yalnız özünə aid bildirişləri görə bilir (superadmin istisna)
- **Audit_logs**: Yalnız superadmin və regionadmin audit loglarına giriş əldə edə bilir

## Texniki Detallar

### RLS Siyasət Nümunələri

Aşağıda bir neçə əsas siyasətin kodu verilib:

#### Schools cədvəli üçün

```sql
-- SuperAdmin üçün
CREATE POLICY "superadmin_schools" ON schools 
    FOR ALL 
    TO authenticated 
    USING (is_superadmin());

-- RegionAdmin üçün
CREATE POLICY "regionadmin_schools" ON schools 
    FOR ALL 
    TO authenticated 
    USING (has_access_to_region(auth.uid(), region_id));

-- SectorAdmin üçün
CREATE POLICY "sectoradmin_schools" ON schools 
    FOR ALL 
    TO authenticated 
    USING (has_access_to_sector(auth.uid(), sector_id));

-- SchoolAdmin üçün
CREATE POLICY "schooladmin_own_school" ON schools 
    FOR ALL 
    TO authenticated 
    USING (has_access_to_school(auth.uid(), id));
```

### Əsas Yardımçı Funksiyaların Nümunələri

```sql
-- Region girişini yoxlayan funksiya
CREATE OR REPLACE FUNCTION public.has_access_to_region(_user_id uuid, _region_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = 'superadmin' OR
        (role = 'regionadmin' AND region_id = _region_id)
      )
  );
$function$;

-- Məktəb girişini yoxlayan funksiya
CREATE OR REPLACE FUNCTION public.has_access_to_school(_user_id uuid, _school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.schools sch ON sch.id = _school_id
    JOIN public.sectors s ON s.id = sch.sector_id
    WHERE ur.user_id = _user_id
      AND (
        ur.role = 'superadmin' OR
        (ur.role = 'regionadmin' AND ur.region_id = sch.region_id) OR
        (ur.role = 'sectoradmin' AND ur.sector_id = sch.sector_id) OR
        (ur.role = 'schooladmin' AND ur.school_id = _school_id)
      )
  );
$function$;
```

## Təhlükəsizlik İmplikasiyaları

Tətbiq edilmiş RLS siyasətləri aşağıdakı əhəmiyyətli təhlükəsizlik üstünlüklərini təmin edir:

1. **Təcrid olunmuş məlumat girişi**: Hər istifadəçi yalnız öz səlahiyyət dairəsindəki məlumatları görə və redaktə edə bilir.

2. **Backend-də avtomatik təhlükəsizlik**: Verilənlər bazası səviyyəsində tətbiq edildiyi üçün, frontend tərəfində əlavə filtirlərə ehtiyac qalmır.

3. **Tam audit imkanları**: Sistemdəki bütün əməliyyatlar audit_logs cədvəlində qeyd olunur və yalnız superadmin və regionadmin tərəfindən görünür.

4. **Rola əsaslanan nəzarət**: Sistemə əlavə olunan yeni istifadəçilər avtomatik olaraq rollarına uyğun girişlər əldə edirlər.

## Front-end İnteqrasiyası

Frontend-də SQL filtrləmə əvəzinə verilənlər bazası RLS-nə etibar edilə bilər. Beləliklə:

```javascript
// Əvvəl:
const { data, error } = await supabase
  .from('schools')
  .select('*')
  .eq('region_id', currentUserRegionId);

// İndi:
const { data, error } = await supabase
  .from('schools')
  .select('*');
```

## Eksploatasia Tövsiyələri

1. **Təhlükəsizlik auditləri**: Mütəmadi olaraq sistemdə RLS siyasətlərinin işləməsini yoxlayın.

2. **Yeni cədvəllər üçün RLS**: Sistemə əlavə edilən hər yeni cədvəl üçün RLS siyasətləri mütləq tətbiq edilməlidir.

3. **Backup və Yedəkləmə**: Mütəmadi olaraq backup və yedəkləmə aparılmalıdır.

4. **Rol dəyişiklikləri**: İstifadəçi rollarında dəyişiklik edildikdə, bu istifadəçinin məlumat girişinə təsirini yoxlayın.

## Nəticə

İnfoLine sistem üçün yaradılmış və tətbiq edilmiş RLS siyasətləri, verilənlər təhlükəsizliyini tam şəkildə təmin edir. Bu siyasətlər sayəsində, hər bir istifadəçi yalnız öz səlahiyyət dairəsindəki məlumatlara giriş əldə edə bilir.

Test nəticələri göstərir ki, RLS siyasətləri gözlənilən şəkildə işləyir və hər rol üçün məlumat görünürlüyü düzgün şəkildə məhdudlaşdırılır. Bu, həm məlumat təhlükəsizliyini, həm də sistemin daha səmərəli işləməsini təmin edir.

---
**Sənəd Versiyası**: 1.0  
**Son Yenilənmə Tarixi**: 30 Aprel 2025  
**Hazırlayan**: İmzalı olaraq təsdiq edilib