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
1. notifications Cədvəli üçün RLS Siyasətləri:
| policyname | permissive | roles | cmd | qual | |------------|------------|-------|-----|------| | Access to own notifications | PERMISSIVE | {public} | ALL | (user_id = auth.uid()) | | SuperAdmin can manage all notifications | PERMISSIVE | {public} | ALL | is_superadmin() | | Users can view their own notifications | PERMISSIVE | {public} | SELECT | (auth.uid() = user_id) | | Users can update their own notifications | PERMISSIVE | {public} | UPDATE | (auth.uid() = user_id) |

2. data_entries Cədvəli üçün RLS Siyasətləri:
| policyname | permissive | roles | cmd | qual | |------------|------------|-------|-----|------| | Public access to data_entries | PERMISSIVE | {public} | ALL | true | | Məktəb admini öz məlumatlarını görə bilər | PERMISSIVE | {authenticated} | SELECT | ((schools.admin_email = auth.email()) OR (auth.email() IN ( SELECT schools.admin_email FROM schools))) | | Məktəb admini öz məlumatlarını əlavə edə bilər | PERMISSIVE | {authenticated} | INSERT | ((schools.admin_email = auth.email()) OR (auth.email() IN ( SELECT schools.admin_email FROM schools))) | | Məktəb admini təsdiqlənməmiş məlumatlarını yeniləyə bilər | PERMISSIVE | {authenticated} | UPDATE | ((schools.admin_email = auth.email()) OR (auth.email() IN ( SELECT schools.admin_email FROM schools))) | | SuperAdmin full access to data_entries | PERMISSIVE | {authenticated} | ALL | is_superadmin() | | RegionAdmin access to entries for schools in their region | PERMISSIVE | {authenticated} | ALL | (EXISTS ( SELECT 1 FROM schools s JOIN user_roles ur ON ((s.region_id = ur.region_id)) WHERE ((s.id = data_entries.school_id) AND (ur.user_id = auth.uid()) AND (ur.role = 'regionadmin'::text)))) | | SectorAdmin access to entries for schools in their sector | PERMISSIVE | {authenticated} | ALL | (EXISTS ( SELECT 1 FROM schools s JOIN user_roles ur ON ((s.sector_id = ur.sector_id)) WHERE ((s.id = data_entries.school_id) AND (ur.user_id = auth.uid()) AND (ur.role = 'sectoradmin'::text)))) | | SchoolAdmin access to entries for their school | PERMISSIVE | {authenticated} | ALL | (EXISTS ( SELECT 1 FROM schools WHERE ((schools.id = data_entries.school_id) AND (schools.admin_email = auth.email())))) | | Access to data entries based on role | PERMISSIVE | {public} | ALL | (EXISTS ( SELECT 1 FROM schools WHERE ((schools.id = data_entries.school_id) AND (schools.region_id IN ( SELECT ur.region_id FROM user_roles ur WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'regionadmin'::text))))))) |

Trigger-lər
| trigger_name | event_manipulation | action_statement | |--------------|-------------------|------------------| | on_data_entry_insert | INSERT | EXECUTE FUNCTION notify_on_data_entry_insert() | | data_change_notification_trigger | INSERT | EXECUTE FUNCTION notify_data_change() | | data_change_notification_trigger | DELETE | EXECUTE FUNCTION notify_data_change() | | data_change_notification_trigger | UPDATE | EXECUTE FUNCTION notify_data_change() | | check_data_entry_approval | UPDATE | EXECUTE FUNCTION check_approval_permissions() |

Edge Functions
İnfoLine proyektində aşağıdakı Edge Functions istifadə olunur:

| ID | Name | Slug | Status | Version | |----|------|------|--------|---------| | 7dd0efc2-0ee8-41f3-ad54-57672f7d7155 | submit-category | submit-category | ACTIVE | 163 | | 00a394e5-71f8-4ee3-938e-3f334d8fa864 | create-user | create-user | ACTIVE | 158 | | 48aa27a4-dba2-4363-8476-90c251c4c765 | reset-user-password | reset-user-password | ACTIVE | 158 | | d9c66f09-e477-4b9f-b9ee-9466519cd798 | create-superadmin | create-superadmin | ACTIVE | 159 | | b425b068-2806-467e-99b6-81e36b8612a4 | direct-login | direct-login | ACTIVE | 157 | | 57800626-a35a-42ea-89b5-62b55bf60344 | create-region-admin | create-region-admin | ACTIVE | 112 | | 691c67bf-0577-44c3-ba86-def6e79ccf1e | assign-region-admin | assign-region-admin | ACTIVE | 105 | | fa3d12cb-3b1d-4b3b-8e3f-7ad548c5ec2d | create-region | create-region | ACTIVE | 101 | | 359ac4cf-630a-4923-9e7c-395f4aae547d | submit-category-for-approval | submit-category-for-approval | ACTIVE | 15 |

Problemlərin Analizi
1. SelectInput Komponentində Options Problemi
SelectInput.tsx komponentində options sahəsinin işlənməsində problem var. columns cədvəlində options sahəsi jsonb tipindədir və müxtəlif formatlarda ola bilər:

Bəzi sətirlərdə NULL dəyəri var
Bəzi sətirlərdə JSON formatında məlumatlar var
JSON formatı müxtəlif strukturlarda ola bilər
2. RLS Siyasəti Xətası
"new row violates row-level security policy for table 'notifications'" xətası notifications cədvəlinə yeni sətir əlavə edilərkən RLS siyasətlərinin pozulmasını göstərir. Mövcud RLS siyasətləri:

İstifadəçilər yalnız öz bildirişlərinə giriş əldə edə bilərlər
SuperAdmin bütün bildirişləri idarə edə bilər
İstifadəçilər öz bildirişlərini görə bilərlər
İstifadəçilər öz bildirişlərini yeniləyə bilərlər
3. Edge Function Çağırışı Problemi
Edge Function çağırışı zamanı "No API key found in request" xətası JWT tokenin düzgün göndərilmədiyini göstərir. submit-category Edge Function-u çağırılarkən JWT token Authorization başlığında düzgün göndərilməlidir.

Həll Yolları
SelectInput Komponentinin Təkmilləşdirilməsi:
options sahəsinin müxtəlif formatlarını düzgün işləmək
NULL dəyərləri üçün fallback mexanizmi təmin etmək
JSON formatında olan məlumatları düzgün parse etmək
RLS Siyasəti Problemi:
Bildiriş yaradarkən user_id sahəsinin düzgün təyin edilməsini təmin etmək
Mövcud bildirişləri silmək və ya yeniləmək üçün düzgün RLS siyasətlərini tətbiq etmək
Edge Function Çağırışı:
JWT tokenin düzgün əldə edilməsi və göndərilməsi
Edge Function çağırışı üçün ümumi bir utiliti yaratmaq