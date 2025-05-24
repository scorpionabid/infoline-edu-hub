# Database Schema Document: İnfoLine - Məktəb Məlumatları Toplama Sistemi

## 1. Giriş

Bu sənəd, İnfoLine sistemində istifadə olunan verilənlər bazası sxemini, cədvəl strukturlarını, əlaqələri və constraint-ləri əhatəli şəkildə təsvir edir. Sistem Supabase üzərində PostgreSQL verilənlər bazası istifadə edir və aşağıdakı əsas məlumat strukturlarını dəstəkləyir.

## 2. Cədvəl Strukturları

### 2.1. `regions` - Regionlar

Regionlar haqqında məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| name | text | YES | Region adı |
| description | text | NO | Region təsviri |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |
| status | text | NO | Region statusu (aktiv/deaktiv) |
| admin_id | uuid | NO | Region admin ID-si |
| admin_email | text | NO | Region admin e-poçtu |

**Indekslər:**
- `regions_pkey`: Primary key indeksi `id` sütunu üzərində
- `unique_region_name`: Unikal indeks `name` sütunu üzərində (region adlarının unikal olmasını təmin edir)

### 2.2. `sectors` - Sektorlar

Regionlara aid sektorlar haqqında məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| region_id | uuid | YES | Aid olduğu region ID-si (foreign key) |
| name | text | YES | Sektor adı |
| description | text | NO | Sektor təsviri |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |
| status | text | NO | Sektor statusu (aktiv/deaktiv) |

**Indekslər:**
- `sectors_pkey`: Primary key indeksi `id` sütunu üzərində

**Foreign Keys:**
- `sectors_region_id_fkey`: `region_id` sütunu `regions` cədvəlinin `id` sütununa istinad edir

### 2.3. `schools` - Məktəblər

Məktəblər haqqında ətraflı məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| name | text | YES | Məktəb adı |
| principal_name | text | NO | Direktor adı |
| address | text | NO | Məktəb ünvanı |
| region_id | uuid | YES | Aid olduğu region ID-si (foreign key) |
| sector_id | uuid | YES | Aid olduğu sektor ID-si (foreign key) |
| phone | text | NO | Telefon nömrəsi |
| email | text | NO | Əlaqə e-poçtu |
| student_count | integer | NO | Şagird sayı |
| teacher_count | integer | NO | Müəllim sayı |
| status | text | NO | Məktəb statusu (aktiv/deaktiv) |
| type | text | NO | Məktəb növü (tam orta, ümumi orta və s.) |
| language | text | NO | Tədris dili |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |
| completion_rate | integer | NO | Məlumat doldurulma faizi |
| logo | text | NO | Logo URL |
| admin_email | text | NO | Məktəb admin e-poçtu |
| admin_id | uuid | NO | Məktəb admin ID-si |

**Indekslər:**
- `schools_pkey`: Primary key indeksi `id` sütunu üzərində

**Foreign Keys:**
- `schools_region_id_fkey`: `region_id` sütunu `regions` cədvəlinin `id` sütununa istinad edir
- `schools_sector_id_fkey`: `sector_id` sütunu `sectors` cədvəlinin `id` sütununa istinad edir

### 2.4. `categories` - Kateqoriyalar

Məlumat kateqoriyaları haqqında məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| name | text | YES | Kateqoriya adı |
| description | text | NO | Kateqoriya təsviri |
| assignment | text | NO | Təyinat (all/sectors) |
| deadline | timestamp with time zone | NO | Son tarix |
| status | text | NO | Status (aktiv/deaktiv) |
| priority | integer | NO | Prioritet sırası |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |
| archived | boolean | NO | Arxivləşdirmə statusu |
| column_count | integer | NO | Sütun sayı |

**Indekslər:**
- `categories_pkey`: Primary key indeksi `id` sütunu üzərində

### 2.5. `columns` - Sütunlar

Kateqoriyalara aid sütunların təsvirini saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| category_id | uuid | NO | Aid olduğu kateqoriya ID-si (foreign key) |
| name | text | YES | Sütun adı |
| type | text | YES | Sütun tipi (mətn, rəqəm, tarix, seçim və s.) |
| is_required | boolean | NO | Məcburi olub-olmadığı |
| placeholder | text | NO | Placeholder mətni |
| help_text | text | NO | Kömək mətni |
| order_index | integer | NO | Sıra nömrəsi |
| status | text | NO | Status (aktiv/deaktiv) |
| validation | jsonb | NO | Validasiya qaydaları (JSON) |
| default_value | text | NO | Default dəyər |
| options | jsonb | NO | Seçim variantları (JSON) |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |

**Indekslər:**
- `columns_pkey`: Primary key indeksi `id` sütunu üzərində

**Foreign Keys:**
- `columns_category_id_fkey`: `category_id` sütunu `categories` cədvəlinin `id` sütununa istinad edir

### 2.6. `data_entries` - Məlumat daxiletmələri

İstifadəçilər tərəfindən daxil edilən məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| school_id | uuid | YES | Məktəb ID-si (foreign key) |
| category_id | uuid | YES | Kateqoriya ID-si (foreign key) |
| column_id | uuid | YES | Sütun ID-si (foreign key) |
| value | text | NO | Daxil edilmiş dəyər |
| status | text | NO | Status (Gözləmədə, Təsdiqlənmiş, Rədd edilmiş) |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |
| created_by | uuid | NO | Yaradan istifadəçi ID-si |
| approved_by | uuid | NO | Təsdiqləyən istifadəçi ID-si |
| approved_at | timestamp with time zone | NO | Təsdiqlənmə tarixi |
| rejected_by | uuid | NO | Rədd edən istifadəçi ID-si |
| rejection_reason | text | NO | Rədd etmə səbəbi |
| deleted_at | timestamp without time zone | NO | Silinmə tarixi (soft delete üçün) |

**Indekslər:**
- `data_entries_pkey`: Primary key indeksi `id` sütunu üzərində

**Foreign Keys:**
- `data_entries_school_id_fkey`: `school_id` sütunu `schools` cədvəlinin `id` sütununa istinad edir
- `data_entries_category_id_fkey`: `category_id` sütunu `categories` cədvəlinin `id` sütununa istinad edir
- `data_entries_column_id_fkey`: `column_id` sütunu `columns` cədvəlinin `id` sütununa istinad edir

### 2.7. `sector_data_entries` - Sektor məlumat girişləri

Sektorlara aid xüsusi məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| sector_id | uuid | YES | Sektor ID-si |
| category_id | uuid | YES | Kateqoriya ID-si |
| column_id | uuid | YES | Sütun ID-si |
| value | text | NO | Daxil edilmiş dəyər |
| status | text | NO | Status |
| created_at | timestamp with time zone | NO | Yaradılma tarixi |
| updated_at | timestamp with time zone | NO | Yenilənmə tarixi |
| created_by | uuid | NO | Yaradan istifadəçi ID-si |
| approved_by | uuid | NO | Təsdiqləyən istifadəçi ID-si |
| approved_at | timestamp with time zone | NO | Təsdiqlənmə tarixi |

**Indekslər:**
- `sector_data_entries_pkey`: Primary key indeksi `id` sütunu üzərində

### 2.8. `profiles` - İstifadəçi profilləri

İstifadəçilərin profil məlumatlarını saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| full_name | text | YES | İstifadəçinin tam adı |
| avatar | text | NO | Profil şəkli URL |
| phone | text | NO | Telefon nömrəsi |
| position | text | NO | Vəzifə |
| language | text | NO | İnterfeys dili |
| last_login | timestamp with time zone | NO | Son giriş tarixi |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |
| status | text | NO | Status (aktiv/deaktiv/bloklanmış) |
| email | text | NO | E-poçt ünvanı |

**Indekslər:**
- `profiles_pkey`: Primary key indeksi `id` sütunu üzərində
- `idx_profiles_email`: İndeks `email` sütunu üzərində

### 2.9. `user_roles` - İstifadəçi rolları

İstifadəçilərin rollarını və icazələrini saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| user_id | uuid | YES | İstifadəçi ID-si (foreign key) |
| role | text | YES | Rol (superadmin, regionadmin, sectoradmin, schooladmin) |
| region_id | uuid | NO | Region ID-si (regionadmin üçün) |
| sector_id | uuid | NO | Sektor ID-si (sectoradmin üçün) |
| school_id | uuid | NO | Məktəb ID-si (schooladmin üçün) |
| created_at | timestamp with time zone | NO | Yaradılma tarixi |
| updated_at | timestamp with time zone | NO | Yenilənmə tarixi |

**Indekslər:**
- `user_roles_pkey`: Primary key indeksi `id` sütunu üzərində
- `idx_user_roles_user_id`: İndeks `user_id` sütunu üzərində
- `idx_user_roles_role`: İndeks `role` sütunu üzərində
- `user_roles_user_id_role_key`: Unikal indeks `user_id` və `role` sütunları üzərində

**Foreign Keys:**
- `user_roles_user_id_fkey`: `user_id` sütunu `profiles` cədvəlinin `id` sütununa istinad edir

### 2.10. `notifications` - Bildirişlər

Sistem bildirişlərini saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| user_id | uuid | YES | İstifadəçi ID-si (foreign key) |
| type | text | YES | Bildiriş növü |
| title | text | YES | Başlıq |
| message | text | NO | Mətn |
| related_entity_id | uuid | NO | Əlaqəli element ID-si |
| related_entity_type | text | NO | Əlaqəli element tipi |
| is_read | boolean | NO | Oxunub-oxunmadığı |
| priority | text | NO | Prioritet (normal, yüksək, kritik) |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |

**Indekslər:**
- `notifications_pkey`: Primary key indeksi `id` sütunu üzərində

**Foreign Keys:**
- `notifications_user_id_fkey`: `user_id` sütunu `profiles` cədvəlinin `id` sütununa istinad edir

### 2.11. `audit_logs` - Audit qeydləri

Sistemdə baş verən dəyişikliklərin tarixçəsini saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| user_id | uuid | NO | İstifadəçi ID-si |
| action | text | YES | Əməliyyat tipi |
| entity_type | text | YES | Element tipi |
| entity_id | uuid | NO | Element ID-si |
| old_value | jsonb | NO | Əvvəlki dəyər (JSON) |
| new_value | jsonb | NO | Yeni dəyər (JSON) |
| ip_address | text | NO | IP ünvan |
| user_agent | text | NO | User agent məlumatı |
| created_at | timestamp with time zone | NO | Yaradılma tarixi |

**Indekslər:**
- `audit_logs_pkey`: Primary key indeksi `id` sütunu üzərində

### 2.12. `reports` - Hesabatlar

Sistemdə yaradılan hesabatlar haqqında məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| title | text | YES | Hesabat başlığı |
| description | text | NO | Hesabat təsviri |
| type | text | YES | Hesabat növü |
| params | jsonb | NO | Hesabat parametrləri (JSON) |
| user_id | uuid | YES | Yaradan istifadəçi ID-si |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |
| status | text | NO | Status |

**Indekslər:**
- `reports_pkey`: Primary key indeksi `id` sütunu üzərində

### 2.13. `report_templates` - Hesabat şablonları

Hesabat şablonları haqqında məlumatları saxlayır.

| Sütun Adı | Tip | Məcburi | Təsvir |
|-----------|-----|---------|--------|
| id | uuid | YES | Unikal identifikator (primary key) |
| name | text | YES | Şablon adı |
| description | text | NO | Şablon təsviri |
| type | text | YES | Şablon növü |
| config | jsonb | YES | Konfiqurasiya (JSON) |
| created_by | uuid | YES | Yaradan istifadəçi ID-si |
| created_at | timestamp with time zone | YES | Yaradılma tarixi |
| updated_at | timestamp with time zone | YES | Yenilənmə tarixi |

**Indekslər:**
- `report_templates_pkey`: Primary key indeksi `id` sütunu üzərində

## 3. Əlaqələr və Diaqram

### 3.1. Əsas Əlaqələr

- **Regions -> Sectors**: Bir-çox əlaqəsi (Bir region çoxlu sektorlara sahib ola bilər)
- **Regions -> Schools**: Bir-çox əlaqəsi (Bir region çoxlu məktəblərə sahib ola bilər)
- **Sectors -> Schools**: Bir-çox əlaqəsi (Bir sektor çoxlu məktəblərə sahib ola bilər)
- **Categories -> Columns**: Bir-çox əlaqəsi (Bir kateqoriya çoxlu sütunlara sahib ola bilər)
- **Schools -> Data Entries**: Bir-çox əlaqəsi (Bir məktəb çoxlu məlumat daxiletmələrinə sahib ola bilər)
- **Categories -> Data Entries**: Bir-çox əlaqəsi (Bir kateqoriya çoxlu məlumat daxiletmələrinə sahib ola bilər)
- **Columns -> Data Entries**: Bir-çox əlaqəsi (Bir sütun çoxlu məlumat daxiletmələrinə sahib ola bilər)
- **Profiles -> User Roles**: Bir-çox əlaqəsi (Bir istifadəçi çoxlu rollara sahib ola bilər)
- **Profiles -> Notifications**: Bir-çox əlaqəsi (Bir istifadəçi çoxlu bildirişlərə sahib ola bilər)

### 3.2. ER Diaqramı

```
regions (1) ──────┐
                  │
                  ▼
             sectors (1) ──────┐
                              │
                              ▼
                        schools (1) ──────┐
                                         │
                                         ▼
categories (1) ───► columns (1) ───► data_entries (n)
                                         ▲
                                         │
                     user_roles (n) ◄─── profiles (1) ───► notifications (n)
                         │
                         │
                         ▼
                audit_logs    reports    report_templates
```

## 4. Triggerlar və Stored Procedures

### 4.1. Əsas Triggerlar

| Trigger Adı | Hadisə | Cədvəl | Funksiya | Təsvir |
|-------------|--------|--------|----------|--------|
| admin_sync_on_user_role_change | INSERT, UPDATE | user_roles | sync_admin_on_user_role_change() | İstifadəçi rolu dəyişdikdə admin məlumatlarını sinxronlaşdırır |
| check_data_entry_approval | UPDATE | data_entries | check_approval_permissions() | Məlumat təsdiqləmə icazələrini yoxlayır |
| check_region_name_before_insert_update | INSERT, UPDATE | regions | check_region_name_uniqueness() | Region adının unikal olmasını təmin edir |
| data_change_notification_trigger | INSERT, UPDATE, DELETE | data_entries | notify_data_change() | Məlumat dəyişdikdə bildiriş göndərir |
| on_data_entry_insert | INSERT | data_entries | notify_on_data_entry_insert() | Yeni məlumat daxil edildikdə bildiriş göndərir |
| sector_data_completion_update | INSERT, UPDATE, DELETE | data_entries | update_sector_completion_rate() | Sektor tamamlanma faizini yeniləyir |
| sector_data_status_change_notification | UPDATE | sector_data_entries | notify_on_sector_data_status_change() | Sektor məlumat statusu dəyişdikdə bildiriş göndərir |

### 4.2. Əsas Stored Procedures və Funksiyalar

| Funksiya Adı | Təsvir |
|--------------|--------|
| assign_region_admin | Bir istifadəçiyə region admini rolu təyin edir |
| assign_school_admin | Bir istifadəçiyə məktəb admini rolu təyin edir |
| assign_sector_admin | Bir istifadəçiyə sektor admini rolu təyin edir |
| calculate_completion_rate | Məktəbin tamamlanma faizini hesablayır |
| check_approval_permissions | Təsdiq icazələrini yoxlayır |
| create_audit_log | Audit qeydi yaradır |
| get_full_user_data | İstifadəçinin bütün məlumatlarını əldə edir |
| get_region_stats | Region statistikasını əldə edir |
| get_sector_stats | Sektor statistikasını əldə edir |
| is_superadmin | İstifadəçinin superadmin olub-olmadığını yoxlayır |
| is_regionadmin | İstifadəçinin region admini olub-olmadığını yoxlayır |
| is_sectoradmin | İstifadəçinin sektor admini olub-olmadığını yoxlayır |
| is_schooladmin | İstifadəçinin məktəb admini olub-olmadığını yoxlayır |
| notify_data_change | Məlumat dəyişikliyi haqqında bildiriş göndərir |
| update_entries_status | Məlumat statusunu yeniləyir |
| validate_column_value | Sütun dəyərinin validasiyasını edir |

## 5. RLS (Row Level Security) Siyasətləri

### 5.1. `categories` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| SuperAdmin categories full access | authenticated | ALL | İstifadəçinin superadmin olması |
| RegionAdmin can access categories | authenticated | ALL | İstifadəçinin regionadmin olması |
| SchoolAdmin can view appropriate categories | authenticated | SELECT | İstifadəçinin schooladmin olması VƏ kateqoriyanın assignment = 'all' olması |
| SectorAdmin can view appropriate categories | authenticated | SELECT | İstifadəçinin sectoradmin olması VƏ kateqoriyanın (assignment = 'all' YAXUD assignment = 'sectors') olması |

### 5.2. `columns` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| SuperAdmin columns full access | authenticated | ALL | İstifadəçinin superadmin olması |
| RegionAdmin columns full access | authenticated | ALL | İstifadəçinin regionadmin olması |
| SchoolAdmin can view columns based on category assignment | authenticated | SELECT | İstifadəçinin schooladmin olması VƏ aid olduğu kateqoriyanın assignment = 'all' olması |
| SectorAdmin can view columns based on category assignment | authenticated | SELECT | İstifadəçinin sectoradmin olması VƏ aid olduğu kateqoriyanın (assignment = 'all' YAXUD assignment = 'sectors') olması |

### 5.3. `data_entries` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| SuperAdmin data_entries full access | authenticated | ALL | İstifadəçinin superadmin olması |
| RegionAdmin can access data entries in their region | authenticated | ALL | İstifadəçinin regionadmin olması VƏ məlumatın aid olduğu məktəbin regionu istifadəçinin regionu ilə eyni olması |
| SectorAdmin can access data entries in their sector | authenticated | ALL | İstifadəçinin sectoradmin olması VƏ məlumatın aid olduğu məktəbin sektoru istifadəçinin sektoru ilə eyni olması |
| SchoolAdmin can access own school data entries | authenticated | ALL | İstifadəçinin schooladmin olması VƏ məlumatın aid olduğu məktəb istifadəçinin məktəbi ilə eyni olması |

### 5.4. `profiles` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| superadmin_manage_profiles | public | ALL | İstifadəçinin superadmin olması |
| regionadmin_view_profiles | public | SELECT | İstifadəçinin regionadmin olması VƏ profilin region daxilində olması |
| view_own_profile | public | SELECT | Profilin ID-si auth.uid() ilə eyni olması |
| update_own_profile | public | UPDATE | Profilin ID-si auth.uid() ilə eyni olması |

### 5.5. `regions` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| SuperAdmin regions full access | authenticated | ALL | İstifadəçinin superadmin olması |
| RegionAdmin can access own region | authenticated | ALL | İstifadəçinin regionadmin olması VƏ regionun ID-si istifadəçinin region_id-si ilə eyni olması |

### 5.6. `schools` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| SuperAdmin schools full access | authenticated | ALL | İstifadəçinin superadmin olması |
| RegionAdmin can access own region schools | authenticated | ALL | İstifadəçinin regionadmin olması VƏ məktəbin region_id-si istifadəçinin region_id-si ilə eyni olması |
| SectorAdmin can access own sector schools | authenticated | ALL | İstifadəçinin sectoradmin olması VƏ məktəbin sector_id-si istifadəçinin sector_id-si ilə eyni olması |
| SchoolAdmin can access own school | authenticated | ALL | İstifadəçinin schooladmin olması VƏ məktəbin ID-si istifadəçinin school_id-si ilə eyni olması |

### 5.7. `sectors` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| SuperAdmin sectors full access | authenticated | ALL | İstifadəçinin superadmin olması |
| RegionAdmin can access own region sectors | authenticated | ALL | İstifadəçinin regionadmin olması VƏ sektorun region_id-si istifadəçinin region_id-si ilə eyni olması |
| SectorAdmin can access own sector | authenticated | ALL | İstifadəçinin sectoradmin olması VƏ sektorun ID-si istifadəçinin sector_id-si ilə eyni olması |

### 5.8. `user_roles` Cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| superadmin_manage_all | public | ALL | İstifadəçinin superadmin olması |
| regionadmin_manage_region | public | ALL | İstifadəçinin regionadmin olması VƏ rolun region daxilində olması |
| view_own_role | public | SELECT | Rolun user_id-si auth.uid() ilə eyni olması |

### 5.9. school_links cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| superadmin_manage_all | public | ALL | İstifadəçinin superadmin olması |
| regionadmin_manage_region | public | ALL | İstifadəçinin regionadmin olması VƏ rolun region daxilində olması |
| view_own_role | public | SELECT | Rolun user_id-si auth.uid() ilə eyni olması |

### 5.10. school_files cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| superadmin_manage_all | public | ALL | İstifadəçinin superadmin olması |
| regionadmin_manage_region | public | ALL | İstifadəçinin regionadmin olması VƏ rolun region daxilində olması |
| view_own_role | public | SELECT | Rolun user_id-si auth.uid() ilə eyni olması |

### 5.11. file_categories cədvəli üçün RLS

| Siyasət Adı | Rol | Əmr | Şərt |
|-------------|-----|-----|------|
| superadmin_manage_all | public | ALL | İstifadəçinin superadmin olması |
| regionadmin_manage_region | public | ALL | İstifadəçinin regionadmin olması VƏ rolun region daxilində olması |
| view_own_role | public | SELECT | Rolun user_id-si auth.uid() ilə eyni olması |


-- school_links cədvəli
-- school_files cədvəli  
-- file_categories cədvəli



## 6. İndekslər və Optimallaşdırma

## 6. İndekslər və Optimallaşdırma (davamı)

### 6.1. Mövcud İndekslər (davamı)

| Cədvəl | İndeks | Sütunlar | Növ | Məqsəd |
|--------|--------|----------|-----|--------|
| profiles | idx_profiles_email | email | B-tree | E-poçtla axtarışı sürətləndirmək |
| regions | unique_region_name | name | Unique B-tree | Region adlarının unikallığını təmin etmək |
| user_roles | idx_user_roles_role | role | B-tree | Rola görə axtarışı sürətləndirmək |
| user_roles | idx_user_roles_user_id | user_id | B-tree | İstifadəçiyə görə axtarışı sürətləndirmək |
| user_roles | user_roles_user_id_role_key | user_id, role | Unique B-tree | İstifadəçi-rol cütlüyünün unikallığını təmin etmək |

### 6.2. Təklif Olunan Əlavə İndekslər

Performansı daha da yaxşılaşdırmaq üçün aşağıdakı əlavə indekslərin tətbiqi tövsiyə olunur:

| Cədvəl | İndeks | Sütunlar | Növ | Məqsəd |
|--------|--------|----------|-----|--------|
| data_entries | idx_data_entries_school_cat_col | school_id, category_id, column_id | B-tree | Məktəb, kateqoriya və sütuna görə axtarışları sürətləndirmək |
| data_entries | idx_data_entries_status | status | B-tree | Status görə axtarışları sürətləndirmək |
| schools | idx_schools_region_sector | region_id, sector_id | B-tree | Region və sektora görə məktəblərin axtarışını sürətləndirmək |
| notifications | idx_notifications_user_read | user_id, is_read | B-tree | İstifadəçi və oxunma statusuna görə axtarışları sürətləndirmək |
| audit_logs | idx_audit_logs_entity | entity_type, entity_id | B-tree | Element növü və ID-sinə görə axtarışları sürətləndirmək |
| audit_logs | idx_audit_logs_action_date | action, created_at | B-tree | Əməliyyat növü və tarixə görə axtarışları sürətləndirmək |

## 7. Verilənlər Bazası Optimallaşdırma Strategiyası

### 7.1. Sorğu Optimallaşdırması

Performansı artırmaq üçün tez-tez istifadə olunan sorğuların optimallaşdırılması:

1. **Materiallaşdırılmış görünüşlər (Materialized Views)** - tez-tez istifadə olunan ağır hesablamalar üçün:
   ```sql
   CREATE MATERIALIZED VIEW mv_school_completion_stats AS
   SELECT 
     s.id as school_id,
     s.name as school_name,
     s.region_id,
     s.sector_id,
     COUNT(DISTINCT c.id) as total_required_columns,
     COUNT(DISTINCT de.column_id) as filled_columns,
     ROUND((COUNT(DISTINCT de.column_id)::numeric / NULLIF(COUNT(DISTINCT c.id), 0)::numeric) * 100) as completion_rate
   FROM 
     schools s
     JOIN categories cat ON cat.status = 'active'
     JOIN columns c ON c.category_id = cat.id AND c.is_required = true AND c.status = 'active'
     LEFT JOIN data_entries de ON de.school_id = s.id AND de.column_id = c.id AND de.status = 'approved'
   GROUP BY 
     s.id, s.name, s.region_id, s.sector_id;
   ```

2. **Kompozit İndekslər** - əlaqəli sütunlar üzərində filterlənmiş sorğular üçün

3. **Partisiya Cədvəlləri** - `data_entries` kimi böyük cədvəllər üçün, məsələn, ay və il əsasında partisiyalama:
   ```sql
   CREATE TABLE data_entries (
     -- columns
   ) PARTITION BY RANGE (created_at);
   
   CREATE TABLE data_entries_2024 PARTITION OF data_entries
     FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
   
   CREATE TABLE data_entries_2025 PARTITION OF data_entries
     FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
   ```

### 7.2. Keşləmə Strategiyası

1. **Sorğu Nəticələrinin Keşlənməsi** - Edge Functions vasitəsilə keşləmə:
   ```typescript
   // cached-query Edge Function
   export async function handler(req: any) {
     const { query, params, ttl = 3600 } = await req.json();
     const cacheKey = `${query}_${JSON.stringify(params)}`;
     
     // Keşdən yoxlama
     const cachedResult = await getCachedResult(cacheKey);
     if (cachedResult) return cachedResult;
     
     // Keşdə yoxdursa sorğu et
     const result = await executeQuery(query, params);
     
     // Keşə əlavə et
     await cacheResult(cacheKey, result, ttl);
     
     return result;
   }
   ```

2. **İstifadəçi Sessiyalarının Keşlənməsi** - Tez-tez istifadə olunan istifadəçi məlumatlarının keşlənməsi

### 7.3. Bakım və Monitorinq

1. **Avtomatik Vakuum** - Verilənlər bazasının performansını qorumaq üçün:
   ```sql
   ALTER TABLE data_entries SET (
     autovacuum_vacuum_scale_factor = 0.1,
     autovacuum_analyze_scale_factor = 0.05
   );
   ```

2. **Dövrü Statistika Analizi** - Sorğu optimizatoru üçün ən son statistikaları təmin etmək üçün

3. **Dövrü İndeks Yenidən Qurulması** - İndekslərin fragmentasiyasını azaltmaq üçün:
   ```sql
   REINDEX TABLE data_entries;
   ```

### 7.4. Verilənlər Saxlama Strategiyası

1. **Soft Delete** - `data_entries` cədvəlində `deleted_at` sütunu vasitəsilə məlumatların silinməsini idarə etmək, məlumatları fiziki olaraq silmədən

2. **Arxivləşdirmə** - Köhnəlmiş məlumatların ayrı arxiv cədvəllərinə köçürülməsi

## 8. Verilənlər Tipi Detalları

### 8.1. Custom Verilənlər Tipləri

```sql
-- Rol tipi
CREATE TYPE app_role AS ENUM ('superadmin', 'regionadmin', 'sectoradmin', 'schooladmin');

-- Status tipi
CREATE TYPE entry_status AS ENUM ('pending', 'approved', 'rejected');

-- Notification prioritet tipi
CREATE TYPE notification_priority AS ENUM ('normal', 'high', 'critical');
```

### 8.2. JSON Sahələri

| Cədvəl | Sütun | Baxış |
|--------|-------|-------|
| columns | validation | ```{ "min": 0, "max": 100, "required": true, "pattern": "^\\d+$" }``` |
| columns | options | ```[{ "label": "Bəli", "value": "yes" }, { "label": "Xeyr", "value": "no" }]``` |
| reports | params | ```{ "categoryId": "uuid", "startDate": "2024-01-01", "endDate": "2024-12-31" }``` |

## 9. Təhlükəsizlik Tədbirləri

### 9.1. RLS Siyasətləri Təsiri

Row Level Security (RLS) siyasətləri istifadəçilərin yalnız icazəsi olan məlumatlara giriş əldə etməsini təmin edir:

- SuperAdmin bütün məlumatlara tam giriş əldə edir
- RegionAdmin yalnız öz regionu daxilindəki məlumatları idarə edə bilər
- SectorAdmin yalnız öz sektoru daxilindəki məlumatları idarə edə bilər
- SchoolAdmin yalnız öz məktəbinə aid məlumatları idarə edə bilər

### 9.2. Audit Loqlama

Audit loqlama sistemi aşağıdakı əməliyyatların izlənməsini təmin edir:

- İstifadəçi dəyişiklikləri
- Məlumat daxiletmələri və təsdiqləri
- Admin əməliyyatları
- Kateqoriya və sütun dəyişiklikləri

### 9.3. Şifrələmə

Həssas məlumatlar üçün şifrələmə tətbiq edilməlidir:

```sql
-- pgcrypto istifadə edərək məlumat şifrələmə
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Həssas məlumatlar üçün şifrələnmiş sütunlar
ALTER TABLE schools 
ADD COLUMN encrypted_api_key text,
ADD COLUMN encryption_iv bytea;

-- Şifrələmə funksiyası
CREATE OR REPLACE FUNCTION encrypt_api_key(p_api_key text, p_secret text)
RETURNS TABLE(encrypted_key text, iv bytea) AS $$
DECLARE
    v_iv bytea;
BEGIN
    v_iv := gen_random_bytes(16);
    RETURN QUERY SELECT 
        encode(encrypt_iv(p_api_key::bytea, p_secret::bytea, v_iv, 'aes-cbc/pad:pkcs'), 'hex'),
        v_iv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 10. Verilənlər Migrasiyası və Backup Strategiyası

### 10.1. Migrasiya Scriptləri

Verilənlər bazası dəyişikliklərini idarə etmək üçün migrasiya scriptləri:

```sql
-- 20250407_add_safe_get_user_by_id.sql
CREATE OR REPLACE FUNCTION safe_get_user_by_id(user_id uuid)
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'email', p.email,
            'role', ur.role
        )
        FROM profiles p
        LEFT JOIN user_roles ur ON p.id = ur.user_id
        WHERE p.id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 20250410_dashboard_statistics_functions.sql
CREATE OR REPLACE FUNCTION get_region_stats(p_region_id uuid)
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'total_schools', COUNT(DISTINCT s.id),
            'total_sectors', COUNT(DISTINCT s.sector_id),
            'avg_completion', AVG(s.completion_rate)
        )
        FROM schools s
        WHERE s.region_id = p_region_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 10.2. Backup Plan

1. **Tam Backup** - Həftəlik tam verilənlər bazası backup-ı
2. **İnkremental Backup** - Gündəlik inkremental backup-lar
3. **Point-in-Time Recovery (PITR)** - Sürekli arxivləmə (WAL) ilə istənilən zamana recovery imkanı
4. **Geo-replication** - Fərqli fiziki yerlərdə replica-lar

## 11. ETL və Verilənlər İnteqrasiyası

### 11.1. Excel İdxal İşləmə

```sql
-- Excel məlumatlarını idxal etmək üçün yardımçı funksiya
CREATE OR REPLACE FUNCTION process_excel_import(
    p_school_id uuid,
    p_category_id uuid,
    p_data json,
    p_user_id uuid
) RETURNS TABLE(processed integer, errors text[]) AS $$
DECLARE
    v_processed integer := 0;
    v_errors text[] := ARRAY[]::text[];
    v_row json;
    v_column_id uuid;
    v_value text;
    v_column_exists boolean;
    v_is_valid boolean;
BEGIN
    FOR v_row IN SELECT * FROM json_array_elements(p_data) LOOP
        v_column_id := (v_row->>'column_id')::uuid;
        v_value := v_row->>'value';
        
        -- Sütunun mövcudluğunu yoxla
        SELECT EXISTS(
            SELECT 1 FROM columns c 
            WHERE c.id = v_column_id AND c.category_id = p_category_id
        ) INTO v_column_exists;
        
        IF NOT v_column_exists THEN
            v_errors := array_append(v_errors, 'Sütun tapılmadı: ' || v_column_id);
            CONTINUE;
        END IF;
        
        -- Dəyəri validasiya et
        SELECT validate_column_value(v_column_id, v_value) INTO v_is_valid;
        
        IF NOT v_is_valid THEN
            v_errors := array_append(v_errors, 'Validasiya xətası, sütun: ' || v_column_id);
            CONTINUE;
        END IF;
        
        -- Məlumatı əlavə et/yenilə
        BEGIN
            INSERT INTO data_entries(
                school_id, category_id, column_id, value, 
                status, created_by, created_at, updated_at
            )
            VALUES(
                p_school_id, p_category_id, v_column_id, v_value,
                'pending', p_user_id, now(), now()
            )
            ON CONFLICT (school_id, category_id, column_id) 
            DO UPDATE SET
                value = v_value,
                status = 'pending',
                updated_at = now()
            WHERE 
                data_entries.status <> 'approved';
                
            v_processed := v_processed + 1;
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Məlumat əlavə edilərkən xəta: ' || SQLERRM);
        END;
    END LOOP;
    
    RETURN QUERY SELECT v_processed, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 11.2. Hesabat İxracı

```sql
-- Hesabat ixracı üçün məlumat hazırlayan funksiya
CREATE OR REPLACE FUNCTION generate_report_data(
    p_report_id uuid
) RETURNS json AS $$
DECLARE
    v_report_type text;
    v_params json;
    v_result json;
BEGIN
    -- Hesabat tipini və parametrlərini əldə et
    SELECT type, params INTO v_report_type, v_params
    FROM reports
    WHERE id = p_report_id;
    
    IF v_report_type = 'school_completion' THEN
        SELECT json_agg(row_to_json(t)) INTO v_result
        FROM (
            SELECT 
                s.id, s.name, s.region_id, r.name as region_name,
                s.sector_id, sec.name as sector_name,
                s.completion_rate,
                (
                    SELECT COUNT(*)
                    FROM data_entries de
                    WHERE de.school_id = s.id AND de.status = 'approved'
                ) as approved_entries_count
            FROM 
                schools s
                JOIN regions r ON s.region_id = r.id
                JOIN sectors sec ON s.sector_id = sec.id
            WHERE
                (v_params->>'region_id' IS NULL OR s.region_id = (v_params->>'region_id')::uuid) AND
                (v_params->>'sector_id' IS NULL OR s.sector_id = (v_params->>'sector_id')::uuid)
            ORDER BY
                s.completion_rate DESC
        ) t;
    ELSIF v_report_type = 'category_stats' THEN
        -- Digər hesabat növü
        -- ...
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 12. Verilənlər Bazası Səhvləri və Troubleshooting

### 12.1. Ümumi Səhvlər

1. **Constraint Violation**
   - Foreign key məhdudiyyətlərinin pozulması
   - Unique məhdudiyyətlərinin pozulması

2. **RLS Siyasəti İcazə İmtinaları**
   - İstifadəçinin lazımi səlahiyyətlərinin olmaması

3. **Query Performance**
   - Böyük sorğuların performans problemləri

### 12.2. Troubleshooting Queries

```sql
-- Ləng sorğuları aşkar etmək
SELECT 
    query, calls, total_time, mean_time,
    rows, 100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- İndeks istifadəsini yoxlamaq
SELECT 
    schemaname, relname, indexrelname, idx_scan,
    idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Table bloat yoxlama
SELECT
    schemaname, relname,
    n_dead_tup, n_live_tup,
    round(n_dead_tup * 100.0 / nullif(n_live_tup + n_dead_tup, 0), 2) as dead_percentage
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY dead_percentage DESC;
```

## 13. Funksiyalar və Triggerlərin Kodu

### 13.1. Əsas Funksiyalar

```sql
-- İstifadəçinin superadmin olub-olmadığını yoxlayan funksiya
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Təsdiq icazələrini yoxlayan funksiya
CREATE OR REPLACE FUNCTION check_approval_permissions()
RETURNS TRIGGER AS $$
BEGIN
    -- Əgər status olaraq təsdiqlənmə varsa
    IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
        -- İstifadəçi superadmin, regionadmin və ya sectoradmin olmalıdır
        IF NOT (
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin') OR
            EXISTS (
                SELECT 1
                FROM user_roles ur
                JOIN schools s ON NEW.school_id = s.id
                WHERE ur.user_id = auth.uid() AND 
                      ((ur.role = 'regionadmin' AND s.region_id = ur.region_id) OR 
                       (ur.role = 'sectoradmin' AND s.sector_id = ur.sector_id))
            )
        ) THEN
            RAISE EXCEPTION 'Məlumatları təsdiq etmək üçün icazəniz yoxdur';
        END IF;
        
        -- Təsdiqləyən və təsdiqlənmə tarixi əlavə etmək
        NEW.approved_by = auth.uid();
        NEW.approved_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 13.2. Trigger Funksiyaları

```sql
-- Məlumat dəyişiklikləri barədə bildiriş göndərən funksiya
CREATE OR REPLACE FUNCTION notify_data_change()
RETURNS TRIGGER AS $$
DECLARE
    v_school_name text;
    v_school_admin_id uuid;
    v_category_name text;
    v_column_name text;
    v_notification_title text;
    v_notification_message text;
BEGIN
    -- Məktəb və kateqoriya məlumatlarını əldə et
    SELECT s.name, s.admin_id, c.name, col.name
    INTO v_school_name, v_school_admin_id, v_category_name, v_column_name
    FROM schools s
    JOIN categories c ON c.id = NEW.category_id
    JOIN columns col ON col.id = NEW.column_id
    WHERE s.id = NEW.school_id;
    
    -- Hadisəyə görə bildiriş yarat
    IF TG_OP = 'INSERT' THEN
        v_notification_title := 'Yeni məlumat daxil edildi';
        v_notification_message := format('%s məktəbi üçün %s kateqoriyasında yeni məlumat daxil edildi', v_school_name, v_category_name);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status <> NEW.status THEN
            IF NEW.status = 'approved' THEN
                v_notification_title := 'Məlumat təsdiqləndi';
                v_notification_message := format('%s məktəbinin %s sütunundakı məlumatı təsdiqləndi', v_school_name, v_column_name);
            ELSIF NEW.status = 'rejected' THEN
                v_notification_title := 'Məlumat rədd edildi';
                v_notification_message := format('%s məktəbinin %s sütunundakı məlumatı rədd edildi: %s', v_school_name, v_column_name, NEW.rejection_reason);
            END IF;
        ELSE
            v_notification_title := 'Məlumat yeniləndi';
            v_notification_message := format('%s məktəbinin %s sütunundakı məlumatı yeniləndi', v_school_name, v_column_name);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_notification_title := 'Məlumat silindi';
        v_notification_message := format('%s məktəbinin %s sütunundakı məlumatı silindi', v_school_name, v_column_name);
    END IF;
    
    -- Bildirişi yarat
    IF v_school_admin_id IS NOT NULL THEN
        INSERT INTO notifications (
            user_id, type, title, message, 
            related_entity_id, related_entity_type,
            is_read, priority, created_at
        ) VALUES (
            v_school_admin_id, 'data_change', v_notification_title, v_notification_message,
            NEW.id, 'data_entry',
            false, 'normal', now()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Bu sənəd, İnfoLine platformasının verilənlər bazası sxemini, cədvəl strukturlarını, əlaqələri, RLS siyasətlərini, triggerləri və funksiyaları əhatəli şəkildə təsvir edir. Bu sənəd verilənlər bazası administratorları, developerlar və platformanın inkişafı ilə məşğul olan komanda üzvləri üçün hazırlanan əsas sənəd rolunu oynayır.