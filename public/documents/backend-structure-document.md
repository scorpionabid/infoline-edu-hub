# Backend Structure Document: İnfoLine - Məktəb Məlumatları Toplama Sistemi

## 1. Ümumi Arxitektura

İnfoLine proyektinin backend strukturu Supabase platforması üzərində qurulub. Bu, Firebase-ə bənzər tam funksionallı bir backend-as-a-service (BaaS) həllidir və aşağıdakı əsas komponentləri təmin edir:

- **PostgreSQL Verilənlər Bazası**: Bütün məlumatları saxlamaq üçün
- **Authentication**: Rol-əsaslı giriş sistemi
- **Storage Buckets**: Faylların saxlanması
- **Edge Functions**: Serverless funksiyalar
- **Row Level Security (RLS)**: Səviyyəli məlumat təhlükəsizliyi
- **Realtime Abunəlik**: Canlı məlumat yeniləmələri

Bu arxitektura Supabase-in API-lərindən və client SDK-dan istifadə edərək məlumatların toplanması, yenilənməsi və təhlili imkanlarını təmin edir.

## 2. Verilənlər Bazası Strukturu

### 2.1. Cədvəllər və Əlaqələr

Verilənlər bazası aşağıdakı əsas cədvəllərdən ibarətdir:

**Əsas Cədvəllər**:

| Cədvəl Adı | Təsvir |
|------------|--------|
| `regions` | Regionlar haqqında məlumatlar |
| `sectors` | Sektorlar haqqında məlumatlar |
| `schools` | Məktəblər haqqında məlumatlar |
| `categories` | Məlumat kateqoriyaları |
| `columns` | Kateqoriyalara aid sütunlar |
| `data_entries` | İstifadəçilər tərəfindən daxil edilən məlumatlar |
| `profiles` | İstifadəçi profilləri |
| `user_roles` | İstifadəçi rolları və icazələri |
| `notifications` | Sistem bildirişləri |
| `reports` | Hesabatlar |
| `report_templates` | Hesabat şablonları |
| `audit_logs` | Sistem əməliyyatlarının izlənməsi |

**ER Diaqramı Əsas Əlaqələr**:

```
regions <-- sectors <-- schools
                         |
                         v
categories --> columns --> data_entries
     ^                       ^
     |                       |
user_roles <-------------> profiles
     |                       |
     v                       v
notifications           audit_logs
     |
     v
reports <-- report_templates
```

### 2.2. Cədvəl Strukturları

#### 2.2.1. `regions` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **name** (text, NOT NULL): Region adı
- **description** (text): Region təsviri
- **status** (text): Region statusu (aktiv/deaktiv)
- **created_at** (timestamp): Yaradılma tarixi
- **updated_at** (timestamp): Yenilənmə tarixi

#### 2.2.2. `sectors` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **region_id** (uuid, NOT NULL): Aid olduğu region
- **name** (text, NOT NULL): Sektor adı
- **description** (text): Sektor təsviri
- **status** (text): Sektor statusu (aktiv/deaktiv)
- **created_at** (timestamp): Yaradılma tarixi
- **updated_at** (timestamp): Yenilənmə tarixi

#### 2.2.3. `schools` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **sector_id** (uuid, NOT NULL): Aid olduğu sektor
- **region_id** (uuid, NOT NULL): Aid olduğu region
- **name** (text, NOT NULL): Məktəb adı
- **principal_name** (text): Direktor adı
- **address** (text): Ünvan
- **phone** (text): Telefon nömrəsi
- **email** (text): E-poçt ünvanı
- **student_count** (integer): Şagird sayı
- **teacher_count** (integer): Müəllim sayı
- **type** (text): Məktəb növü
- **language** (text): Tədris dili
- **status** (text): Məktəb statusu (aktiv/deaktiv)
- **logo** (text): Logo URL-i
- **admin_email** (text): Məktəb admininin e-poçtu
- **created_at** (timestamp): Yaradılma tarixi
- **updated_at** (timestamp): Yenilənmə tarixi
- **completion_rate** (decimal): Məlumat dolulugu faizi

#### 2.2.4. `categories` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **name** (text, NOT NULL): Kateqoriya adı
- **description** (text): Kateqoriya təsviri
- **assignment** (text): Təyinat (All/Sectors)
- **deadline** (timestamp): Son tarix
- **status** (text): Status (aktiv/deaktiv)
- **archived** (boolean): Arxivləşdirmə statusu
- **priority** (integer): Prioritet sırası
- **created_at** (timestamp): Yaradılma tarixi
- **updated_at** (timestamp): Yenilənmə tarixi
- **column_count** (integer): Sütun sayı

#### 2.2.5. `columns` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **category_id** (uuid, NOT NULL): Aid olduğu kateqoriya
- **name** (text, NOT NULL): Sütun adı
- **type** (text, NOT NULL): Sütun tipi (mətn, rəqəm, tarix, seçim və s.)
- **is_required** (boolean): Məcburi sahə olub-olmadığı
- **placeholder** (text): Placeholder mətni
- **help_text** (text): Kömək mətni
- **order_index** (integer): Sıralama indeksi
- **status** (text): Status (aktiv/deaktiv)
- **validation** (jsonb): Validasiya qaydaları
- **default_value** (text): Default dəyər
- **options** (jsonb): Seçim variantları

#### 2.2.6. `data_entries` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **school_id** (uuid, NOT NULL): Məktəb ID-si
- **category_id** (uuid, NOT NULL): Kateqoriya ID-si
- **column_id** (uuid, NOT NULL): Sütun ID-si
- **value** (text): Daxil edilmiş dəyər
- **status** (text): Status (Gözləmədə, Təsdiqlənmiş, Rədd edilmiş)
- **created_at** (timestamp): Yaradılma tarixi
- **updated_at** (timestamp): Yenilənmə tarixi
- **created_by** (uuid): Yaradan istifadəçi ID-si
- **approved_by** (uuid): Təsdiqləyən istifadəçi ID-si
- **approved_at** (timestamp): Təsdiqlənmə tarixi
- **rejected_by** (uuid): Rədd edən istifadəçi ID-si
- **rejection_reason** (text): Rədd etmə səbəbi

#### 2.2.7. `profiles` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator (auth.users tablosu ilə eyni)
- **full_name** (text, NOT NULL): Ad və soyad
- **avatar** (text): Profil şəkli URL-i
- **phone** (text): Telefon nömrəsi
- **position** (text): Vəzifə
- **language** (text): İnterfeys dili
- **status** (text): Status (aktiv/deaktiv/bloklanmış)
- **last_login** (timestamp): Son giriş tarixi
- **created_at** (timestamp): Yaradılma tarixi
- **updated_at** (timestamp): Yenilənmə tarixi

#### 2.2.8. `user_roles` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **user_id** (uuid, NOT NULL): İstifadəçi ID-si
- **role** (app_role, NOT NULL): Rol (superadmin, regionadmin, sectoradmin, schooladmin)
- **region_id** (uuid): Region ID-si (regionadmin üçün)
- **sector_id** (uuid): Sektor ID-si (sectoradmin üçün)
- **school_id** (uuid): Məktəb ID-si (schooladmin üçün)
- **created_at** (timestamp): Yaradılma tarixi
- **updated_at** (timestamp): Yenilənmə tarixi

#### 2.2.9. `notifications` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **user_id** (uuid, NOT NULL): İstifadəçi ID-si
- **type** (text, NOT NULL): Bildiriş növü
- **title** (text, NOT NULL): Başlıq
- **message** (text): Mesaj mətni
- **related_entity_id** (uuid): Əlaqəli element ID-si
- **related_entity_type** (text): Əlaqəli element tipi
- **is_read** (boolean): Oxunub-oxunmadığı
- **priority** (text): Prioritet
- **created_at** (timestamp): Yaradılma tarixi

#### 2.2.10. `audit_logs` Cədvəli
- **ID** (uuid, NOT NULL): Unikal identifikator
- **action** (text, NOT NULL): Əməliyyat növü
- **user_id** (uuid, NOT NULL): Əməliyyatı edən istifadəçi
- **entity_type** (text, NOT NULL): Element tipi
- **entity_id** (uuid, NOT NULL): Element ID-si
- **old_value** (jsonb): Əvvəlki dəyər
- **new_value** (jsonb): Yeni dəyər
- **ip_address** (text): IP ünvan
- **user_agent** (text): İstifadəçi agent məlumatı
- **created_at** (timestamp): Yaradılma tarixi

## 3. RLS (Row Level Security) Siyasətləri

RLS siyasətləri istifadəçi rollarına uyğun olaraq məlumat təhlükəsizliyini təmin edir. Aşağıda əsas RLS siyasətləri təqdim olunur:

### 3.1. `categories` Cədvəli üçün RLS Siyasətləri

SuperAdmin categories full access: SuperAdmin-lər bütün kateqoriyalara tam giriş əldə edirlər
RegionAdmin can access categories: Region admin-ləri kateqoriyalara giriş əldə edirlər
SchoolAdmin can view appropriate categories: Məktəb admin-ləri yalnız "All" təyinatlı kateqoriyalara giriş əldə edirlər
SectorAdmin can view appropriate categories: Sektor admin-ləri "All" və "Sectors" təyinatlı kateqoriyalara giriş əldə edirlər

### 3.2. `columns` Cədvəli üçün RLS Siyasətləri

SuperAdmin columns full access: SuperAdmin-lər bütün sütunlara tam giriş əldə edirlər
RegionAdmin columns full access: Region admin-ləri sütunlara tam giriş əldə edirlər
SchoolAdmin can view columns based on category assignment: Məktəb admin-ləri yalnız müvafiq kateqoriyalara aid sütunlara giriş əldə edirlər
SectorAdmin can view columns based on category assignment: Sektor admin-ləri müvafiq kateqoriyalara aid sütunlara giriş əldə edirlər

### 3.3. `data_en tries Cədvəli üçün RLS Siyasətləri

SuperAdmin data_entries full access: SuperAdmin-lər bütün data_entries məlumatlarına tam giriş əldə edirlər
RegionAdmin can access data entries in their region: Region admin-ləri yalnız öz regionlarındakı məlumatları idarə edə bilirlər
SectorAdmin can access data entries in their sector: Sektor admin-ləri yalnız öz sektorlarındakı məlumatları idarə edə bilirlər
SchoolAdmin can access own school data entries: Məktəb admin-ləri yalnız öz məktəblərinin məlumatlarını idarə edə bilirlər

### 3.4. `profiles` Cədvəli üçün RLS Siyasətləri

superadmin_manage_profiles: SuperAdmin-lər bütün profillərə tam giriş əldə edirlər
regionadmin_view_profiles: Region admin-ləri müəyyən profillərə giriş əldə edirlər
view_own_profile: İstifadəçilər öz profillərinə giriş əldə edirlər
update_own_profile: İstifadəçilər öz profillərini yeniləyə bilirlər

### 3.5. `regions` Cədvəli üçün RLS Siyasətləri

SuperAdmin regions full access: SuperAdmin-lər bütün regionlara tam giriş əldə edirlər
RegionAdmin can access own region: Region admin-ləri yalnız öz regionlarına giriş əldə edirlər

### 3.6. `schools` Cədvəli üçün RLS Siyasətləri

SuperAdmin schools full access: SuperAdmin-lər bütün məktəblərə tam giriş əldə edirlər
RegionAdmin can access own region schools: Region admin-ləri yalnız öz regionlarındakı məktəblərə giriş əldə edirlər
SectorAdmin can access own sector schools: Sektor admin-ləri yalnız öz sektorlarındakı məktəblərə giriş əldə edirlər
SchoolAdmin can access own school: Məktəb admin-ləri yalnız öz məktəblərinə giriş əldə edirlər

### 3.7. `sectors` Cədvəli üçün RLS Siyasətləri

SuperAdmin sectors full access: SuperAdmin-lər bütün sektorlara tam giriş əldə edirlər
RegionAdmin can access own region sectors: Region admin-ləri yalnız öz regionlarındakı sektorlara giriş əldə edirlər
SectorAdmin can access own sector: Sektor admin-ləri yalnız öz sektorlarına giriş əldə edirlər

### 3.8. `user_roles` Cədvəli üçün RLS Siyasətləri

superadmin_manage_all: SuperAdmin-lər bütün istifadəçi rollarını idarə edə bilirlər
regionadmin_manage_region: Region admin-ləri öz regionlarındakı istifadəçi rollarını idarə edə bilirlər
view_own_role: İstifadəçilər öz rollarını görə bilirlər

### 3.9. Trigger-lər və Funksiyalar

### 3.9.1. Trigger-lər

| Trigger Adı | Event | Funksiya |
|-------------|-------|----------|
| on_data_entry_insert | INSERT | notify_on_data_entry_insert() |
| data_change_notification_trigger | INSERT, UPDATE, DELETE | notify_data_change() |
| check_data_entry_approval | UPDATE | check_approval_permissions() |

### 3.9.2. Stored Procedures və Funksiyalar

İcazə Yoxlama Funksiyaları

is_superadmin(): İstifadəçinin superadmin olub-olmadığını yoxlayır
is_regionadmin(): İstifadəçinin region admini olub-olmadığını yoxlayır
is_sectoradmin(): İstifadəçinin sektor admini olub-olmadığını yoxlayır
is_schooladmin(): İstifadəçinin məktəb admini olub-olmadığını yoxlayır
has_role(), has_role_safe(): İstifadəçinin müəyyən rola sahib olub-olmadığını yoxlayır
has_region_access(), has_sector_access(), has_school_access(): İstifadəçinin müəyyən regiona/sektora/məktəbə giriş icazəsinin olub-olmadığını yoxlayır

### 3.10. Məlumat Əldə Etmə Funksiyaları

get_user_role(), get_auth_user_role(): İstifadəçinin rolunu əldə edir
get_user_region_id(), get_user_sector_id(), get_user_school_id(): İstifadəçinin region/sektor/məktəb ID-sini əldə edir
get_full_user_data(): İstifadəçinin bütün məlumatlarını əldə edir
safe_get_user_by_id(), safe_get_user_by_email(): Təhlükəsiz şəkildə istifadəçi məlumatlarını əldə edir

### 3.11. Statistika və Hesablama Funksiyaları

calculate_completion_rate(): Tamamlanma faizini hesablayır
calculate_sector_completion_rate(): Sektor tamamlanma faizini hesablayır
get_region_stats(), get_sector_stats(): Region/sektor statistikasını əldə edir
get_school_completion_stats(): Məktəb tamamlanma statistikasını əldə edir

### 3.12. Əməliyyat Funksiyaları

assign_region_admin(), assign_sector_admin(), assign_school_admin(): Admin təyin etmə funksiyaları
update_user_role(): İstifadəçi rolunu yeniləmə
create_audit_log(): Audit qeydlərini yaratma
notify_data_change(), notify_on_data_entry_insert(): Bildiriş göndərmə funksiyaları
validate_column_value(): Sütun dəyərinin validasiyası



### 3.13. Edge Functions

İnfoLine proyektində aşağıdakı Edge Functions istifadə olunur:

| Function Adı | Məqsəd |
|-------------|--------|
| submit-category | Kateqoriya təqdim etmək |
| create-user | İstifadəçi yaratmaq |
| reset-user-password | İstifadəçi şifrəsini sıfırlamaq |
| create-superadmin | SuperAdmin yaratmaq |
| direct-login | Birbaşa giriş (təhlükəsiz giriş üçün) |
| create-region-admin | Region adminini yaratmaq |
| assign-region-admin | Mövcud istifadəçini region admini təyin etmək |
| create-region | Region yaratmaq |
| submit-category-for-approval | Kateqoriyanı təsdiq üçün təqdim etmək |
| assign-existing-user-as-admin | Mövcud istifadəçiləri admin təyin etmək |
| assign-existing-user-as-school-admin | Mövcud istifadəçini məktəb admini təyin etmək |
| assign-existing-user-as-sector-admin | Mövcud istifadəçini sektor admini təyin etmək |
| assign-sector-admin | İstifadəçini sektor admini təyin etmək |
| bulk-approve-entries | Məlumatları toplu şəkildə təsdiqləmək |
| cached-query | Sorğu nəticələrini keşləmək |
| data-entries-bulk-update | Məlumatları toplu şəkildə yeniləmək |
| export-report | Hesabat ixrac etmək |
| get-all-users | Bütün istifadəçiləri əldə etmək |
| get-dashboard-data | Dashboard məlumatlarını əldə etmək |
| get_all_users_with_roles | Rolları ilə birlikdə bütün istifadəçiləri əldə etmək |
| invalidate-cache | Keşi silmək |

## 6. Authentication Sistemi

Supabase Authentication modulu, 4 əsas rol üçün çoxsəviyyəli giriş sistemi təmin edir:

1. **SuperAdmin**: Sistemin tam administratoru
2. **RegionAdmin**: Region səviyyəsində administrator
3. **SectorAdmin**: Sektor səviyyəsində administrator
4. **SchoolAdmin**: Məktəb səviyyəsində administrator

### 6.1. Autentikasiya Axını

```
1. İstifadəçi login səhifəsinə giriş edir
2. Email və şifrə daxil edir
3. Supabase.auth.signInWithPassword API-si istifadə olunur
4. Uğurlu giriş zamanı JWT token yaradılır
5. İstifadəçi rolu user_roles cədvəlindən əldə edilir
6. İstifadəçi roluna uyğun dashboard-a yönləndirilir
```

### 6.2. Şifrə Bərpası

```
1. İstifadəçi "Şifrəni unutmuşam" düyməsinə basır
2. Email ünvanını daxil edir
3. Supabase.auth.resetPasswordForEmail API-si istifadə olunur
4. Şifrə bərpa linki ilə email göndərilir
5. İstifadəçi linkə keçid edir və yeni şifrə təyin edir
```

## 7. Storage Buckets

Layihədə aşağıdakı storage bucket-ləri istifadə olunur:

| Bucket Adı | Təyinat |
|------------|---------|
| avatars | İstifadəçi profil şəkilləri |
| school-logos | Məktəb logoları |
| reports | Hesabat faylları |
| templates | Excel şablonları və digər templatelər |
| uploads | İstifadəçilər tərəfindən yüklənən fayllar |

## 8. API Arxitektura

İnfoLine tətbiqi üçün API arxitekturası Supabase-in postgREST interfeysinə əsaslanır və aşağıdakı komponentlərdən ibarətdir:

### 8.1. Data API

- **GET /rest/v1/{table}** - Cədvəldən məlumatları əldə etmək
- **POST /rest/v1/{table}** - Cədvələ yeni məlumat əlavə etmək
- **PATCH /rest/v1/{table}?{primary_key}=eq.{id}** - Mövcud məlumatı yeniləmək
- **DELETE /rest/v1/{table}?{primary_key}=eq.{id}** - Məlumatı silmək

### 8.2. Function API

- **POST /rest/v1/rpc/{function_name}** - PostgreSQL funksiyalarını çağırmaq

### 8.3. Edge Functions API

- **POST /functions/v1/{function_name}** - Edge Functions-ları çağırmaq

## 9. Məlumat Axını Sxemi

```
┌────────────┐      ┌────────────┐      ┌────────────┐
│  Frontend  │◄────►│  Supabase  │◄────►│ PostgreSQL │
└────────────┘      └────────────┘      └────────────┘
       ▲                   ▲                  ▲
       │                   │                  │
       ▼                   ▼                  ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│   Edge     │      │   Auth     │      │  Realtime  │
│ Functions  │      │  Service   │      │ Subsciption│
└────────────┘      └────────────┘      └────────────┘
```

## 10. Performans Optimallaşdırması

### 10.1. İndekslər

Aşağıdakı sütunlar üçün indekslər yaradılıb:

- `data_entries` cədvəlində `school_id`, `category_id`, və `column_id`
- `user_roles` cədvəlində `user_id` və `role`
- `schools` cədvəlində `region_id` və `sector_id`
- `sectors` cədvəlində `region_id`
- `columns` cədvəlində `category_id`

### 10.2. Keşləmə Strategiyaları

- **Client-side keşləmə**: React Query istifadə edilərək sorğu nəticələri kliyent tərəfdə keşlənir
- **Server-side keşləmə**: Edge Functions vasitəsilə server tərəfdə sorğu nəticələri keşlənir

## 11. Təhlükəsizlik Təminatları

- JWT-əsaslı autentifikasiya
- RLS ilə məlumat təhlükəsizliyi
- HTTPS protokolu
- CSRF müdafiəsi
- Supabase-in daxili təhlükəsizlik tədbirləri

## 12. Gələcək Təkmilləşdirmələr

- Tam real-time bildiriş sistemi
- İstifadəçi fəaliyyətlərinin daha ətraflı izlənməsi
- GraphQL dəstəyi
- İri miqyaslı hesablamalar üçün worker pool inteqrasiyası
- Backup və recovery sisteminin təkmilləşdirilməsi

Bu sənəd İnfoLine proyektinin backend strukturunu təsvir edir və proyektin texniki arxitekturası haqqında əhatəli məlumat təqdim edir.