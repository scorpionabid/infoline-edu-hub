# İnfoLine - Məktəb Məlumatları Toplama Sistemi: Supabase DevOps Sənədi

## Məzmun

1. [Ümumi Sistem Arxitekturası](#1-ümumi-sistem-arxitekturası)
2. [Verilənlər Bazası Strukturu](#2-verilənlər-bazası-strukturu)
3. [Edge Functions (Serverless)](#3-edge-functions-serverless)
4. [Təhlükəsizlik və İcazələr](#4-təhlükəsizlik-və-icazələr)
5. [Performans Göstəriciləri](#5-performans-göstəriciləri)
6. [Monitorinq və Loqlaşdırma](#6-monitorinq-və-loqlaşdırma)
7. [Versiya İdarəetməsi və Deployment](#7-versiya-idarəetməsi-və-deployment)
8. [Optimallaşdırma Təklifləri](#8-optimallaşdırma-təklifləri)
9. [İnfrastruktur Xəritəsi](#9-infrastruktur-xəritəsi)
10. [Fövqəladə Hallar Planı](#10-fövqəladə-hallar-planı)

## 1. Ümumi Sistem Arxitekturası

İnfoLine sistemi, Supabase platforması üzərində yaradılmış tam funksional Məktəb Məlumatları Toplama Sistemidir. Sistem aşağıdakı əsas komponentlərdən ibarətdir:

- **Frontend**: React/TypeScript istifadə edərək yaradılmış veb tətbiq, shadcn-ui komponentləri
- **Backend**: Supabase platforması (PostgreSQL, Auth, Storage, Edge Functions)
- **API**: RESTful API (Supabase-in daxili RESTful interfeysi üzərindən)
- **Autentifikasiya**: Supabase Auth servisi

**Layihə ID**: olbfnauhzpdskqnxtwav  
**Layihə URL**: https://olbfnauhzpdskqnxtwav.supabase.co

**İstifadə olunan Supabase xidmətləri**:
- PostgreSQL verilənlər bazası
- Auth servisi (JWT əsaslı)
- Storage servisi (fayllar üçün)
- Edge Functions (serverless)
- Realtime servisi (bildiris və məlumat yeniləmələri üçün)

## 2. Verilənlər Bazası Strukturu

### 2.1. Əsas Cədvəllər

| Cədvəl Adı | Sətr Sayı | Təsvir |
|------------|-----------|--------|
| profiles | 12 | İstifadəçi profil məlumatları |
| user_roles | 10 | İstifadəçi rolları və təyinatları |
| sectors | 6 | Sektor məlumatları (bölgə daxilində alt-bölmələr) |
| schools | 5 | Məktəb məlumatları |
| categories | 3 | Məlumat toplama kateqoriyaları |
| columns | 3 | Kateqoriyalara aid sütunlar |
| regions | 1 | Bölgə məlumatları |
| audit_logs | 1 | Sistem əməliyyatlarının jurnal qeydləri |
| notifications | 0 | Sistem bildirişləri |
| data_entries | 0 | İstifadəçilərin daxil etdiyi məlumatlar |

### 2.2. Əsas Əlaqələr

- **regions** → **sectors** (bölgələr və onların sektorları)
- **regions** → **schools** (bölgələr və məktəblər)
- **sectors** → **schools** (sektorlar və məktəblər)
- **user_roles** → **regions**, **sectors**, **schools** (istifadəçi rolları və onların təyin edildiyi yerlər)
- **categories** → **columns** (kateqoriyalar və onların sütunları)
- **data_entries** → **schools**, **categories**, **columns** (məlumatların aidiyyəti)

### 2.3. Unikal İndekslər

| İndeks Adı | Cədvəl | Sütunlar | Təsvir |
|------------|--------|----------|--------|
| unique_region_name | regions | name | Bölgə adının unikallığını təmin edir |
| idx_profiles_email | profiles | email | İstifadəçi e-poçtuna görə indeks |
| idx_user_roles_role | user_roles | role | Rola görə indeks |
| idx_user_roles_user_id | user_roles | user_id | İstifadəçi ID-sinə görə indeks |
| user_roles_user_id_role_key | user_roles | user_id, role | İstifadəçinin eyni rolu iki dəfə almasının qarşısını alır |

### 2.4. Enum Tiplər

| Tip Adı | Dəyərlər | Təsvir |
|---------|----------|--------|
| app_role | superadmin, regionadmin, sectoradmin, schooladmin | İstifadəçi rolları |
| column_type | text, number, date, select, checkbox, radio, file, image | Sütun tipləri |
| data_status | pending, approved, rejected | Məlumat statusları |

## 3. Edge Functions (Serverless)

### 3.1. Mövcud Edge Functions

| Funksiya Adı | Son Deployment | Təsvir |
|--------------|----------------|--------|
| submit-category | 12 dəq əvvəl | Kateqoriya təsdiq üçün göndərir |
| create-user | 12 dəq əvvəl | Yeni istifadəçi yaradır |
| reset-user-password | 12 dəq əvvəl | İstifadəçi şifrəsini sıfırlayır |
| create-superadmin | 12 dəq əvvəl | Superadmin yaradır |
| direct-login | 12 dəq əvvəl | Birbaşa giriş (JWT) |
| safe-login | 6 gün əvvəl | Təhlükəsiz giriş mexanizmi |
| region-operations | 6 gün əvvəl | Bölgə əməliyyatları |
| school-operations | 5 gün əvvəl | Məktəb əməliyyatları |
| sector-operations | 5 gün əvvəl | Sektor əməliyyatları |
| create-region-admin | 12 dəq əvvəl | Bölgə admini yaradır |
| assign-region-admin | 12 dəq əvvəl | Mövcud istifadəçini bölgə admini təyin edir |
| create-region | 12 dəq əvvəl | Yeni bölgə yaradır |
| assign-sector-admin | 12 dəq əvvəl | Sektor admini təyin edir |
| assign-existing-user-as-admin | 12 dəq əvvəl | Mövcud istifadəçini admin təyin edir |
| get_all_users_with_roles | 12 dəq əvvəl | Rolları ilə birgə bütün istifadəçiləri əldə edir |
| assign-existing-user-as-sector-admin | 12 dəq əvvəl | Mövcud istifadəçini sektor admini təyin edir |
| assign-existing-user-as-school-admin | 12 dəq əvvəl | Mövcud istifadəçini məktəb admini təyin edir |

### 3.2. Edge Functions Konfiqurasiyası

- **Timeout**: 60 saniyə (supabase/config.toml)
- **İcazələr**: Əksər funksiyalar üçün JWT doğrulaması tələb olunur
- **JWT doğrulaması tələb etməyən funksiyalar**: direct-login

## 4. Təhlükəsizlik və İcazələr

### 4.1. Rol Əsaslı İcazələr

| Rol | İcazələr | Səlahiyyətlər |
|-----|----------|--------------|
| superadmin | Tam | Bütün sistem üzərində tam nəzarət |
| regionadmin | Region səviyyəsi | Region daxilində bütün səlahiyyətlər |
| sectoradmin | Sektor səviyyəsi | Sektor daxilində bütün məktəblər üzərində səlahiyyətlər |
| schooladmin | Məktəb səviyyəsi | Məktəb məlumatlarını idarə etmə |

### 4.2. PostgreSQL Funksiyaları (Təhlükəsizlik)

| Funksiya Adı | Təsvir | İcra Rejimi |
|--------------|--------|-------------|
| has_role | İstifadəçinin müəyyən rola sahib olduğunu yoxlayır | Definer |
| has_access_to_region | İstifadəçinin bölgəyə giriş hüququnu yoxlayır | Definer |
| has_access_to_sector | İstifadəçinin sektora giriş hüququnu yoxlayır | Definer |
| get_user_role | İstifadəçinin rolunu qaytarır | Definer |
| is_superadmin | İstifadəçinin superadmin olub-olmadığını yoxlayır | Definer |
| is_regionadmin | İstifadəçinin regionadmin olub-olmadığını yoxlayır | Definer |

### 4.3. RLS (Row Level Security) Siyasətləri

| Cədvəl | Siyasət | Növü | Təsvir |
|--------|---------|------|--------|
| user_roles | admin_sync_on_user_role_change | AFTER UPDATE/INSERT | İstifadəçi rolları dəyişdikdə admini sinxronlaşdırır |
| data_entries | check_data_entry_approval | BEFORE UPDATE | Məlumat təsdiqləmə icazələrini yoxlayır |
| regions | check_region_name_before_insert | BEFORE INSERT/UPDATE | Region adının unikallığını yoxlayır |

## 5. Performans Göstəriciləri

### 5.1. Cədvəl Ölçüləri

| Cədvəl | Sətir sayı | Saxlama həcmi |
|--------|------------|---------------|
| profiles | 12 | ~ 24 KB |
| user_roles | 10 | ~ 8 KB |
| sectors | 6 | ~ 12 KB |
| schools | 5 | ~ 15 KB |
| regions | 1 | ~ 2 KB |
| Total | 37 | ~ 61 KB |

### 5.2. Son Sorğu Performansı

API Gateway, PostgreST və Auth xidmətlərinin son 100 sorğusu 200 OK statusu ilə cavablandırılıb. Ortalama cavab vaxtı 200-300 ms arasındadır.

## 6. Monitorinq və Loqlaşdırma

### 6.1. Loq Konfiqurasiyası

- **API Gateway**: Bütün HTTP istəklərini loqlaşdırır
- **Edge Functions**: Console.log çıxışları Supabase loqlarında saxlanılır
- **Audit Logs**: audit_logs cədvəlində saxlanılır, biznes əməliyyatları üçün

### 6.2. Monitorinq

- **Edge Logs**: Edge Functions-ların icra məlumatları
- **Database Logs**: Verilənlər bazası əməliyyatları, uzun sürən sorğular
- **Error Logs**: Xəta məlumatları

## 7. Versiya İdarəetməsi və Deployment

### 7.1. Edge Functions Deployment

- **Main Branch**: Avtomatik olaraq "supabase/functions" qovluğundakı dəyişikliklərə görə deployment edilir
- **Deployment Tezliyi**: Son 24 saatda 15 deployment edilib

### 7.2. Verilənlər Bazası Miqrasiyaları

- **Miqrasiya formatı**: SQL
- **Miqrasiya qeydləri**: Supabase Panel > Database > Migrations
- **Sxem versiyası**: 1.0.0

## 8. Optimallaşdırma Təklifləri

### 8.1. Verilənlər Bazası Optimallaşdırmaları

1. **İndeksləməni təkmilləşdirmək**:
   - `data_entries` cədvəlində (school_id, category_id, column_id) üçün kompozit indeks əlavə etmək
   - `notifications` cədvəlində user_id və is_read sütunları üçün indeks əlavə etmək

2. **VACUUM və ANALİZ planı**:
   - 100,000+ sətrə çatdıqda `data_entries` cədvəli üçün mütəmadi VACUUM
   - Ayda bir dəfə bütün cədvəllər üçün ANALYZE əməliyyatı

3. **RLS siyasətlərini optimallaşdırmaq**:
   - Məlumat təsdiqləmə prosesində performansı artırmaq üçün `check_data_entry_approval` siyasətinin yenidən yazılması

### 8.2. Edge Functions Optimallaşdırmaları

1. **Cold Start probleminin həlli**:
   - Tez-tez istifadə olunan funksiyaların istiləşdirilməsi üçün ping mexanizmi
   - Böyük kod bloklarının modullaşdırılması, ümumi kitabxanaların ayrılması

2. **Cache strategiyası**:
   - `get_all_users_with_roles` üçün nəticələrin keşlənməsi
   - Admin təyinatı proseslərində paralel sorğuların azaldılması

### 8.3. Təhlükəsizlik Təkmilləşdirmələri

1. **Rate limiting**:
   - `direct-login` üçün IP əsaslı rate limiting (saatda 10 cəhd)
   - `reset-user-password` üçün user_id əsaslı rate limiting (gündə 3 cəhd)

2. **JWT token konfiqurasiyası**:
   - JWT token müddətinin azaldılması (3600 → 1800 saniyə)
   - Refresh token rotasiyasının aktivləşdirilməsi

## 9. İnfrastruktur Xəritəsi

```
supabase (olbfnauhzpdskqnxtwav)
├── Auth Service
│   ├── JWT Configuration
│   ├── Email Templates
│   └── User Management
├── Database
│   ├── Tables (10)
│   ├── Functions (20+)
│   ├── Triggers (3)
│   └── RLS Policies
├── Storage Service
│   └── Buckets
├── Edge Functions (18)
│   ├── Authentication Functions
│   ├── User Management Functions
│   └── Data Operations Functions
└── Realtime Service
```

## 10. Fövqəladə Hallar Planı

### 10.1. Verilənlər Bazası Bərpası

1. **Avtomatik backup**: Supabase tərəfindən gündəlik
2. **Manual backup proseduru**:
   ```sql
   -- Tam schema və məlumat backup-ı
   pg_dump -U postgres -h db.olbfnauhzpdskqnxtwav.supabase.co -p 5432 postgres > infoline_full_backup_YYYY_MM_DD.sql
   ```
3. **Point-in-time bərpa imkanı**: Son 7 günə qədər

### 10.2. Xəta Hallarında Reaksiya

| Xəta | Reaksiya | Məsul şəxs |
|------|----------|------------|
| Verilənlər bazası əlçatmaz | Supabase status yoxlanışı, bərpa cəhdi | DevOps |
| Edge Function xətası | Loqların analizi, funksiya yenidən deployment | Backend Developer |
| Auth xidməti problemləri | JWT sıfırlanması, keş təmizlənməsi | Security Admin |
| API performans problemləri | Sorğuların monitorinqi, keş strategiyasının tətbiqi | Backend Developer |

### 10.3. Escalation və Kommunikasiya

- **Təcili əlaqə**: Supabase support (support@supabase.io)
- **Komanda kommunikasiyası**: DevOps/Backend çatı
- **İstifadəçi bildirişləri**: Planlaşdırılmış texniki xidmət və ya xəta hallarında

---
