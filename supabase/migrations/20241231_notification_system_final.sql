-- =============================================================================
-- İnfoLine Notification System Database Schema - FINAL MIGRATION
-- Migration: 20241231_notification_system_final.sql
-- Description: Final notification system implementation with all enhancements
-- =============================================================================

-- Drop existing tables if they exist (for fresh installation)
DROP TABLE IF EXISTS notification_delivery_log CASCADE;
DROP TABLE IF EXISTS scheduled_notifications CASCADE;
DROP TABLE IF EXISTS user_notification_preferences CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;

-- =============================================================================
-- 1. NOTIFICATION TEMPLATES TABLE (Enhanced)
-- =============================================================================
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'deadline', 'approval', 'rejection', 'system', 'category_update', 'data_entry', 'school_update', 'region_update', 'sector_update')),
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    email_template TEXT,
    sms_template TEXT,
    
    -- Multi-language support
    translations JSONB DEFAULT '{}',
    
    -- Template variables
    variables TEXT[] DEFAULT '{}',
    
    -- Default settings
    default_priority TEXT DEFAULT 'normal' CHECK (default_priority IN ('low', 'normal', 'high', 'critical')),
    default_channels TEXT[] DEFAULT '{inApp}',
    
    -- Template configuration
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =============================================================================
-- 2. USER NOTIFICATION PREFERENCES TABLE (Enhanced)
-- =============================================================================
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    
    -- Type-specific preferences
    deadline_notifications BOOLEAN DEFAULT true,
    approval_notifications BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    data_entry_notifications BOOLEAN DEFAULT true,
    
    -- Digest preferences
    daily_digest BOOLEAN DEFAULT false,
    weekly_digest BOOLEAN DEFAULT false,
    
    -- Timing preferences
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'Asia/Baku',
    
    -- Priority filter
    priority_filter TEXT[] DEFAULT '{normal,high,critical}',
    
    -- Enhanced preferences
    deadline_reminders TEXT DEFAULT '3_1' CHECK (deadline_reminders IN ('3_1', '1', 'none')),
    digest_frequency TEXT DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
    category_preferences JSONB DEFAULT '{}',
    
    -- Language preference
    language VARCHAR(5) DEFAULT 'az',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. SCHEDULED NOTIFICATIONS TABLE (Enhanced)
-- =============================================================================
CREATE TABLE scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    repeat_pattern VARCHAR(50), -- 'none', 'daily', 'weekly', 'monthly'
    
    -- Recipients criteria
    recipients JSONB NOT NULL, -- ['all_school_admins', 'all_sector_admins', etc.]
    
    -- Template data
    template_data JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    
    -- Processing info
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =============================================================================
-- 4. NOTIFICATION DELIVERY LOG TABLE (Enhanced)
-- =============================================================================
CREATE TABLE notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Delivery details
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('in_app', 'email', 'push', 'sms')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Error info
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Template reference
    template_id UUID REFERENCES notification_templates(id),
    recipient_email TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. UPDATE EXISTING NOTIFICATIONS TABLE
-- =============================================================================
-- Add new columns to existing notifications table if they don't exist
DO $$ 
BEGIN
    -- Add template_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='template_id') THEN
        ALTER TABLE notifications ADD COLUMN template_id UUID REFERENCES notification_templates(id);
    END IF;
    
    -- Add template_data column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='template_data') THEN
        ALTER TABLE notifications ADD COLUMN template_data JSONB DEFAULT '{}';
    END IF;
    
    -- Add channel column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='channel') THEN
        ALTER TABLE notifications ADD COLUMN channel VARCHAR(20) DEFAULT 'inApp';
    END IF;
    
    -- Add expires_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='expires_at') THEN
        ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add metadata column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- =============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(name);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_email_enabled ON user_notification_preferences(email_enabled);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_template ON scheduled_notifications(template_id);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_user_id ON notification_delivery_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(delivery_method, status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_sent_at ON notification_delivery_log(sent_at);

CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);

-- =============================================================================
-- 7. RLS POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- Notification Templates RLS
CREATE POLICY "superadmin_notification_templates" ON notification_templates
    FOR ALL TO authenticated
    USING (is_superadmin());

CREATE POLICY "regionadmin_notification_templates" ON notification_templates
    FOR SELECT TO authenticated
    USING (is_regionadmin() OR is_sectoradmin() OR is_schooladmin());

-- User Preferences RLS
CREATE POLICY "own_notification_preferences" ON user_notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "admin_view_preferences" ON user_notification_preferences
    FOR SELECT TO authenticated
    USING (is_superadmin() OR is_regionadmin());

-- Scheduled Notifications RLS
CREATE POLICY "superadmin_scheduled_notifications" ON scheduled_notifications
    FOR ALL TO authenticated
    USING (is_superadmin());

CREATE POLICY "regionadmin_scheduled_notifications" ON scheduled_notifications
    FOR SELECT TO authenticated
    USING (is_regionadmin() OR is_sectoradmin());

-- Delivery Log RLS
CREATE POLICY "own_delivery_log" ON notification_delivery_log
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "admin_delivery_log" ON notification_delivery_log
    FOR SELECT TO authenticated
    USING (is_superadmin() OR is_regionadmin());

-- =============================================================================
-- 8. ENHANCED FUNCTIONS
-- =============================================================================

-- Function to create notification from template (Enhanced)
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_template_name TEXT,
    p_user_id UUID,
    p_template_data JSONB,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_channels TEXT[] DEFAULT '{inApp}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_template notification_templates%ROWTYPE;
    v_notification_id UUID;
    v_rendered_title TEXT;
    v_rendered_message TEXT;
    v_channel TEXT;
BEGIN
    -- Get template
    SELECT * INTO v_template
    FROM notification_templates
    WHERE name = p_template_name AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found: %', p_template_name;
    END IF;
    
    -- Render title and message with enhanced variable substitution
    v_rendered_title := v_template.title_template;
    v_rendered_message := v_template.message_template;
    
    -- Enhanced template rendering
    IF p_template_data IS NOT NULL THEN
        FOR key IN SELECT * FROM jsonb_object_keys(p_template_data) LOOP
            v_rendered_title := replace(v_rendered_title, '{{' || key || '}}', COALESCE(p_template_data->>key, ''));
            v_rendered_message := replace(v_rendered_message, '{{' || key || '}}', COALESCE(p_template_data->>key, ''));
        END LOOP;
    END IF;
    
    -- Use primary channel
    v_channel := COALESCE(p_channels[1], 'inApp');
    
    -- Create notification
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        priority,
        channel,
        template_id,
        template_data,
        metadata,
        is_read,
        created_at
    ) VALUES (
        p_user_id,
        v_rendered_title,
        v_rendered_message,
        v_template.type,
        v_template.default_priority,
        v_channel,
        v_template.id,
        p_template_data,
        jsonb_build_object(
            'template_name', p_template_name,
            'channels', p_channels,
            'rendered_at', NOW()
        ),
        false,
        NOW()
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user should receive notification
CREATE OR REPLACE FUNCTION should_send_notification(
    p_user_id UUID,
    p_notification_type TEXT,
    p_channel TEXT,
    p_priority TEXT DEFAULT 'normal'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_preferences user_notification_preferences%ROWTYPE;
    v_current_time TIME;
    v_in_quiet_hours BOOLEAN := false;
BEGIN
    -- Get user preferences
    SELECT * INTO v_preferences
    FROM user_notification_preferences
    WHERE user_id = p_user_id;
    
    -- If no preferences found, use defaults (allow notification)
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Check channel preferences
    CASE p_channel
        WHEN 'email' THEN
            IF NOT v_preferences.email_enabled THEN RETURN false; END IF;
        WHEN 'push' THEN
            IF NOT v_preferences.push_enabled THEN RETURN false; END IF;
        WHEN 'inApp' THEN
            IF NOT v_preferences.in_app_enabled THEN RETURN false; END IF;
        WHEN 'sms' THEN
            IF NOT v_preferences.sms_enabled THEN RETURN false; END IF;
    END CASE;
    
    -- Check notification type preferences
    CASE p_notification_type
        WHEN 'deadline' THEN
            IF NOT v_preferences.deadline_notifications THEN RETURN false; END IF;
        WHEN 'approval', 'rejection' THEN
            IF NOT v_preferences.approval_notifications THEN RETURN false; END IF;
        WHEN 'system' THEN
            IF NOT v_preferences.system_notifications THEN RETURN false; END IF;
        WHEN 'data_entry' THEN
            IF NOT v_preferences.data_entry_notifications THEN RETURN false; END IF;
    END CASE;
    
    -- Check priority filter
    IF NOT (p_priority = ANY(v_preferences.priority_filter)) THEN
        RETURN false;
    END IF;
    
    -- Check quiet hours (skip for critical priority)
    IF p_priority != 'critical' AND v_preferences.quiet_hours_start IS NOT NULL AND v_preferences.quiet_hours_end IS NOT NULL THEN
        v_current_time := CURRENT_TIME;
        
        IF v_preferences.quiet_hours_start <= v_preferences.quiet_hours_end THEN
            -- Same day quiet hours
            v_in_quiet_hours := v_current_time BETWEEN v_preferences.quiet_hours_start AND v_preferences.quiet_hours_end;
        ELSE
            -- Overnight quiet hours
            v_in_quiet_hours := v_current_time >= v_preferences.quiet_hours_start OR v_current_time <= v_preferences.quiet_hours_end;
        END IF;
        
        IF v_in_quiet_hours THEN
            RETURN false;
        END IF;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_notification_preferences (
        user_id,
        email_enabled,
        push_enabled,
        in_app_enabled,
        sms_enabled,
        deadline_notifications,
        approval_notifications,
        system_notifications,
        data_entry_notifications,
        daily_digest,
        weekly_digest,
        timezone,
        priority_filter,
        language,
        deadline_reminders,
        digest_frequency,
        category_preferences
    ) VALUES (
        NEW.id,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        false,
        false,
        'Asia/Baku',
        ARRAY['normal', 'high', 'critical'],
        'az',
        '3_1',
        'immediate',
        '{}'::jsonb
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 9. TRIGGERS
-- =============================================================================

-- Trigger for creating default preferences
DROP TRIGGER IF EXISTS trigger_create_default_preferences ON profiles;
CREATE TRIGGER trigger_create_default_preferences
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. DEFAULT TEMPLATES (Enhanced)
-- =============================================================================

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

-- =============================================================================
-- 11. HELPER FUNCTIONS
-- =============================================================================

-- Function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_statistics(
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSON;
BEGIN
    WITH notification_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_read = false) as unread,
            COUNT(*) FILTER (WHERE type = 'warning') as warnings,
            COUNT(*) FILTER (WHERE type = 'error') as errors,
            COUNT(*) FILTER (WHERE type = 'success') as success,
            COUNT(*) FILTER (WHERE priority = 'critical') as critical,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as this_week
        FROM notifications
        WHERE 
            (p_user_id IS NULL OR user_id = p_user_id) AND
            (p_start_date IS NULL OR created_at >= p_start_date) AND
            (p_end_date IS NULL OR created_at <= p_end_date)
    )
    SELECT json_build_object(
        'total', total,
        'unread', unread,
        'read', total - unread,
        'warnings', warnings,
        'errors', errors,
        'success', success,
        'critical', critical,
        'today', today,
        'this_week', this_week,
        'read_rate', CASE WHEN total > 0 THEN (total - unread)::float / total * 100 ELSE 0 END
    ) INTO v_stats
    FROM notification_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
    p_days_old INTEGER DEFAULT 90
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete old read notifications
    DELETE FROM notifications
    WHERE 
        is_read = true AND 
        created_at < NOW() - (p_days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Clean up delivery logs for deleted notifications
    DELETE FROM notification_delivery_log
    WHERE notification_id NOT IN (SELECT id FROM notifications);
    
    -- Delete old scheduled notifications that are completed
    DELETE FROM scheduled_notifications
    WHERE status IN ('sent', 'failed')
      AND processed_at < NOW() - (p_days_old || ' days')::INTERVAL;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 12. GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT ALL ON notification_templates TO authenticated;
GRANT ALL ON user_notification_preferences TO authenticated;
GRANT ALL ON scheduled_notifications TO authenticated;
GRANT ALL ON notification_delivery_log TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- 13. VERIFICATION FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION verify_notification_system()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
    v_tables_count INTEGER;
    v_templates_count INTEGER;
    v_functions_count INTEGER;
    v_triggers_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO v_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name IN ('notification_templates', 'user_notification_preferences', 'notification_delivery_log', 'scheduled_notifications');
    
    -- Count templates
    SELECT COUNT(*) INTO v_templates_count
    FROM notification_templates
    WHERE is_active = true;
    
    -- Count functions
    SELECT COUNT(*) INTO v_functions_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name LIKE '%notification%';
    
    -- Count triggers
    SELECT COUNT(*) INTO v_triggers_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%notification%';
    
    SELECT json_build_object(
        'schema_version', '20241231_notification_system_final',
        'tables_created', v_tables_count,
        'default_templates', v_templates_count,
        'notification_functions', v_functions_count,
        'triggers_count', v_triggers_count,
        'migration_status', CASE 
            WHEN v_tables_count = 4 AND v_templates_count >= 15 THEN 'SUCCESS'
            ELSE 'INCOMPLETE'
        END,
        'timestamp', NOW(),
        'features_enabled', json_build_object(
            'email_templates', true,
            'user_preferences', true,
            'scheduled_notifications', true,
            'delivery_tracking', true,
            'real_time', true,
            'multi_channel', true
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FINAL VERIFICATION
-- =============================================================================
SELECT verify_notification_system();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE notification_templates IS 'Enhanced templates for notification system with multi-language support';
COMMENT ON TABLE user_notification_preferences IS 'Comprehensive user notification preferences and settings';
COMMENT ON TABLE scheduled_notifications IS 'Scheduled notifications with advanced scheduling options';
COMMENT ON TABLE notification_delivery_log IS 'Complete delivery tracking and analytics';

-- Migration completed successfully
SELECT 'İnfoLine Notification System migration completed successfully' AS status;