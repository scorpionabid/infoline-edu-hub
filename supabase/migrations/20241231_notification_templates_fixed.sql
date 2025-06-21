-- =============================================================================
-- İnfoLine Notification System - Template INSERT Fix
-- 10-cu addım üçün düzəldilmiş template INSERT-lər
-- =============================================================================

-- İlk öncə type constraint-i yeniləmək lazımdır
ALTER TABLE notification_templates DROP CONSTRAINT IF EXISTS notification_templates_type_check;

-- Yeni constraint 'reminder' tipi ilə
ALTER TABLE notification_templates 
ADD CONSTRAINT notification_templates_type_check 
CHECK (type IN ('info', 'success', 'warning', 'error', 'deadline', 'approval', 'rejection', 'reminder', 'system', 'category_update', 'data_entry', 'school_update', 'region_update', 'sector_update'));

-- İndi template-ləri düzgün INSERT edək
INSERT INTO notification_templates (name, type, title_template, message_template, default_priority, default_channels, is_system, variables) VALUES

('deadline_warning_3_days', 'deadline', 'Son tarix xatırlatması: {{category_name}}', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti 3 gün sonra bitəcək. Son tarix: {{deadline_date}}. Məktəb: {{school_name}}', 'high', '{inApp,email}', true, '{category_name,deadline_date,school_name,data_entry_url,days_remaining}'),

('deadline_warning_1_day', 'deadline', 'TƏCİLİ: {{category_name}} - 1 gün qalıb', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti sabah bitəcək! Son tarix: {{deadline_date}}. Zəhmət olmasa dərhal məlumatları daxil edin.', 'critical', '{inApp,email}', true, '{category_name,deadline_date,school_name,data_entry_url,days_remaining}'),

('deadline_expired', 'error', 'Son tarix keçdi: {{category_name}}', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti bitib. Gözləyən məlumatlar avtomatik təsdiqlənəcək.', 'critical', '{inApp,email}', true, '{category_name,deadline_date,school_name}'),

('data_approved', 'approval', 'Məlumatlarınız təsdiqləndi: {{category_name}}', '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar {{approved_by}} tərəfindən təsdiqləndi. Təşəkkürlər!', 'high', '{inApp,email}', true, '{category_name,school_name,approved_by,approved_date}'),

('data_rejected', 'rejection', 'Məlumatlarınız rədd edildi: {{category_name}}', '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. Səbəb: {{rejection_reason}}. Zəhmət olmasa yenidən nəzərdən keçirin.', 'high', '{inApp,email}', true, '{category_name,school_name,reviewer_name,rejection_reason,data_entry_url}'),

('new_category_created', 'info', 'Yeni kateqoriya: {{category_name}}', '"{{category_name}}" adlı yeni kateqoriya sisteminizə əlavə edildi. Son tarix: {{deadline_date}}. Assignment: {{assignment}}', 'normal', '{inApp}', true, '{category_name,deadline_date,assignment,description}'),

('new_column_added', 'info', 'Yeni sahə əlavə edildi: {{column_name}}', '"{{category_name}}" kateqoriyasına "{{column_name}}" sahəsi əlavə edildi. Zəhmət olmasa məlumatlarınızı yeniləyin.', 'normal', '{inApp}', true, '{category_name,column_name,data_entry_url}'),

('missing_data_reminder', 'warning', 'Məlumat daxil etmə xatırlatması', '"{{category_name}}" kateqoriyası üçün hələ məlumat daxil etməmisiniz. Son tarix: {{deadline_date}}. Completion: {{completion_percentage}}%', 'normal', '{inApp}', true, '{category_name,deadline_date,completion_percentage,school_name,data_entry_url}'),

('system_maintenance', 'system', 'Sistem təmiri bildirişi', 'İnfoLine sistemi {{maintenance_date}} tarixində {{duration}} müddətinə təmir işləri səbəbiylə əlçatmaz olacaq. Başlama: {{start_time}}, Bitirmə: {{end_time}}', 'high', '{inApp,email}', true, '{maintenance_date,duration,start_time,end_time,reason}'),

('user_role_assigned', 'info', 'Yeni rol təyin edildi', 'Sizə {{role_name}} rolu təyin edildi. {{assigned_entity}} üçün məsuliyyət daşıyırsınız. Təyinat: {{assigned_by}}', 'high', '{inApp,email}', true, '{role_name,assigned_entity,assigned_by,assignment_date}'),

('region_created', 'info', 'Yeni region yaradıldı', '"{{region_name}}" regionu sisteminizə əlavə edildi. Admin: {{admin_name}} ({{admin_email}})', 'normal', '{inApp}', true, '{region_name,admin_name,admin_email,creation_date}'),

('sector_created', 'info', 'Yeni sektor yaradıldı', '"{{sector_name}}" sektoru "{{region_name}}" regionunda yaradıldı. Admin: {{admin_name}}', 'normal', '{inApp}', true, '{sector_name,region_name,admin_name,creation_date}'),

('school_created', 'info', 'Yeni məktəb əlavə edildi', '"{{school_name}}" məktəbi "{{sector_name}}" sektoruna əlavə edildi. Director: {{principal_name}}', 'normal', '{inApp}', true, '{school_name,sector_name,principal_name,creation_date}'),

('bulk_import_completed', 'success', 'Toplu idxal tamamlandı', '{{import_type}} toplu idxal əməliyyatı uğurla tamamlandı. {{success_count}} məlumat əlavə edildi, {{error_count}} xəta.', 'normal', '{inApp}', true, '{import_type,success_count,error_count,completion_time}'),

('bulk_import_failed', 'error', 'Toplu idxal uğursuz oldu', '{{import_type}} toplu idxal əməliyyatı uğursuz oldu. Səbəb: {{error_message}}. Zəhmət olmasa yenidən cəhd edin.', 'high', '{inApp,email}', true, '{import_type,error_message,failure_time,support_contact}'),

('completion_reminder', 'reminder', 'Tamamlama xatırlatması', '"{{category_name}}" kateqoriyası {{completion_percentage}}% tamamlanıb. Qalan sahələr: {{remaining_fields}}. Deadline: {{deadline_date}}', 'normal', '{inApp}', true, '{category_name,completion_percentage,remaining_fields,deadline_date,data_entry_url}');

-- Verification
SELECT COUNT(*) as template_count FROM notification_templates WHERE is_active = true;

-- Success message
SELECT 'İnfoLine Notification Templates inserted successfully' AS status;