upabase-də aşağıdakı əsas cədvəllər mövcuddur:

categories: Kateqoriyalar üçün (id, name, description, assignment, deadline, status, priority və s.)
columns: Sütunlar üçün (id, category_id, name, type, is_required, order_index, validation, options və s.)
data_entries: Məlumat daxiletmələri üçün (id, school_id, category_id, column_id, value, status və s.)
schools: Məktəblər üçün (id, name, region_id, sector_id, email, phone və s.)
sectors: Sektorlar üçün (id, name, region_id və s.)
regions: Regionlar üçün (id, name, description və s.)
notifications: Bildirişlər üçün (id, user_id, type, title, message, is_read və s.)
reports: Hesabatlar üçün (id, title, description, type, content, status və s.)
report_templates: Hesabat şablonları üçün (id, name, description, type, config və s.)
user_roles: İstifadəçi rolları üçün (user_id, role, region_id, sector_id, school_id və s.)
profiles: İstifadəçi profilləri üçün (id, full_name, email, phone, position və s.)
audit_logs: Audit logları üçün (id, user_id, action, entity_type, entity_id və s.)
2. İcazələr və Təhlükəsizlik
Supabase-də RLS (Row Level Security) siyasətləri düzgün konfiqurasiya edilib:

Hər rol üçün müvafiq icazələr təyin edilib (SuperAdmin, RegionAdmin, SectorAdmin, SchoolAdmin)
Məlumat daxiletmələri üçün təsdiq prosesi icazələri düzgün qurulub
İstifadəçilər yalnız öz səviyyələrinə uyğun məlumatlara çıxış əldə edə bilirlər
3. Yenilənmiş Tətbiq Planı
3.1. Sütunlar və Sütun Tipləri (1 həftə)
Mövcud sütun tipləri: text, number, select, date, checkbox, textarea, radio, file