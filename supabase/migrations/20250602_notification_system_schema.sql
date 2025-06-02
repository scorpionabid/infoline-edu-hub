-- =============================================================================
-- İnfoLine Notification System Database Schema
-- Migration: 20250602_notification_system_schema.sql
-- Description: Creates all necessary tables, functions, and triggers for the enhanced notification system
-- =============================================================================

-- Drop existing tables if they exist (for fresh installation)
DROP TABLE IF EXISTS notification_delivery_log CASCADE;
DROP TABLE IF EXISTS scheduled_notifications CASCADE;
DROP TABLE IF EXISTS user_notification_preferences CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;

-- =============================================================================
-- 1. NOTIFICATION TEMPLATES TABLE
-- =============================================================================
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    email_template TEXT,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'deadline', 'approval')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'critical')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO notification_templates (name, title_template, message_template, email_template, type, priority) VALUES
('deadline_warning_3_days', '{{category_name}} - 3 gün qalıb', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti 3 gün sonra bitəcək. Son tarix: {{deadline_date}}', 'deadline_warning_3_days', 'warning', 'high'),
('deadline_warning_1_day', '{{category_name}} - 1 gün qalıb', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti sabah bitəcək. Son tarix: {{deadline_date}}', 'deadline_warning_1_day', 'warning', 'critical'),
('deadline_expired', '{{category_name}} - müddət bitib', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti bitib. Məlumatlar avtomatik təsdiqlənəcək.', 'deadline_expired', 'error', 'critical'),
('data_approved', '{{category_name}} məlumatları təsdiqləndi', '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi. Təsdiqləyən: {{approved_by}}', 'data_approved', 'success', 'normal'),
('data_rejected', '{{category_name}} məlumatları rədd edildi', '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. Səbəb: {{rejection_reason}}', 'data_rejected', 'error', 'high'),
('new_category', 'Yeni kateqoriya əlavə edildi', '"{{category_name}}" adlı yeni kateqoriya əlavə edildi. Son tarix: {{deadline_date}}', 'new_category', 'info', 'normal'),
('new_column', '{{category_name}} kateqoriyasına yeni sütun əlavə edildi', '"{{category_name}}" kateqoriyasına "{{column_name}}" sütunu əlavə edildi.', 'new_column', 'info', 'normal'),
('missing_data_reminder', 'Məlumat daxil etmə xatırlatması', '"{{category_name}}" kateqoriyası üçün hələ məlumat daxil etməmisiniz. Son tarix: {{deadline_date}}', 'missing_data_reminder', 'warning', 'normal'),
('system_update', 'Sistem yeniliyi', 'İnfoLine sistemində yeniliklər edildi: {{update_description}}', 'system_update', 'info', 'normal'),
('user_assigned', 'Yeni rol təyin edildi', 'Sizə {{role_name}} rolu təyin edildi. {{assigned_entity}} üçün məsuliyyət daşıyırsınız.', 'user_assigned', 'info', 'high'),
('region_created', 'Yeni region yaradıldı', '"{{region_name}}" regionu yaradıldı. Admin: {{admin_name}}', 'region_created', 'info', 'normal'),
('sector_created', 'Yeni sektor yaradıldı', '"{{sector_name}}" sektoru "{{region_name}}" regionunda yaradıldı.', 'sector_created', 'info', 'normal'),
('school_created', 'Yeni məktəb əlavə edildi', '"{{school_name}}" məktəbi "{{sector_name}}" sektoruna əlavə edildi.', 'school_created', 'info', 'normal'),
('bulk_import_completed', 'Toplu idxal tamamlandı', '{{import_type}} toplu idxalı uğurla tamamlandı. {{success_count}} məlumat əlavə edildi.', 'bulk_import_completed', 'success', 'normal'),
('bulk_import_failed', 'Toplu idxal uğursuz oldu', '{{import_type}} toplu idxalı uğursuz oldu. Səbəb: {{error_message}}', 'bulk_import_failed', 'error', 'high');

-- =============================================================================
-- 2. USER NOTIFICATION PREFERENCES TABLE
-- =============================================================================
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    deadline_reminders TEXT DEFAULT '3_1' CHECK (deadline_reminders IN ('3_1', '1', 'none')),
    category_preferences JSONB DEFAULT '{}',
    digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================================================
-- 3. NOTIFICATION DELIVERY LOG TABLE
-- =============================================================================
CREATE TABLE notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('in_app', 'email', 'push')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
    attempt_count INTEGER DEFAULT 1,
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_email TEXT,
    template_id UUID REFERENCES notification_templates(id)
);

-- =============================================================================
-- 4. SCHEDULED NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES notification_templates(id),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    recipients JSONB NOT NULL,
    template_data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
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
        ALTER TABLE notifications ADD COLUMN template_data JSONB;
    END IF;
    
    -- Add scheduled_for column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='scheduled_for') THEN
        ALTER TABLE notifications ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add sent_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='sent_at') THEN
        ALTER TABLE notifications ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add delivery_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='delivery_status') THEN
        ALTER TABLE notifications ADD COLUMN delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed'));
    END IF;
    
    -- Add engagement_data column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='engagement_data') THEN
        ALTER TABLE notifications ADD COLUMN engagement_data JSONB;
    END IF;
    
    -- Update priority column constraint if needed
    BEGIN
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_priority_check;
        ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check 
            CHECK (priority IN ('normal', 'high', 'critical'));
    EXCEPTION WHEN others THEN
        -- Constraint might already exist with different name, ignore
        NULL;
    END;
END $$;

-- =============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(name);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status ON notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- =============================================================================
-- 7. FUNCTIONS FOR NOTIFICATION MANAGEMENT
-- =============================================================================

-- Function to create notification from template
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_template_name TEXT,
    p_user_id UUID,
    p_template_data JSONB,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_template notification_templates%ROWTYPE;
    v_notification_id UUID;
    v_rendered_title TEXT;
    v_rendered_message TEXT;
BEGIN
    -- Get template
    SELECT * INTO v_template
    FROM notification_templates
    WHERE name = p_template_name AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found: %', p_template_name;
    END IF;
    
    -- Render title and message (basic template substitution)
    v_rendered_title := v_template.title_template;
    v_rendered_message := v_template.message_template;
    
    -- Simple template rendering (replace {{key}} with values)
    -- Note: For production, use a more sophisticated template engine
    IF p_template_data IS NOT NULL THEN
        -- This is a simplified version - in practice, you'd want more robust template rendering
        SELECT 
            regexp_replace(v_rendered_title, '\{\{(\w+)\}\}', COALESCE(p_template_data->>'category_name', ''), 'g'),
            regexp_replace(v_rendered_message, '\{\{(\w+)\}\}', COALESCE(p_template_data->>'category_name', ''), 'g')
        INTO v_rendered_title, v_rendered_message;
    END IF;
    
    -- Create notification
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        priority,
        template_id,
        template_data,
        scheduled_for,
        is_read,
        created_at
    ) VALUES (
        p_user_id,
        v_rendered_title,
        v_rendered_message,
        v_template.type,
        v_template.priority,
        v_template.id,
        p_template_data,
        p_scheduled_for,
        false,
        NOW()
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Function to schedule deadline notifications when category is created/updated
CREATE OR REPLACE FUNCTION schedule_category_deadline_notifications()
RETURNS TRIGGER AS $$
DECLARE
    v_warning_3_days TIMESTAMP WITH TIME ZONE;
    v_warning_1_day TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Only process if deadline is set and category is active
    IF NEW.deadline IS NULL OR NEW.status != 'active' THEN
        RETURN NEW;
    END IF;
    
    -- Calculate warning dates
    v_warning_3_days := NEW.deadline - INTERVAL '3 days';
    v_warning_1_day := NEW.deadline - INTERVAL '1 day';
    
    -- Schedule 3-day warning if in the future
    IF v_warning_3_days > NOW() THEN
        INSERT INTO scheduled_notifications (
            template_id,
            scheduled_for,
            recipients,
            template_data,
            status
        ) SELECT 
            t.id,
            v_warning_3_days,
            '["all_school_admins"]'::jsonb,
            jsonb_build_object(
                'category_id', NEW.id,
                'category_name', NEW.name,
                'deadline_date', NEW.deadline::date,
                'days_left', 3
            ),
            'pending'
        FROM notification_templates t
        WHERE t.name = 'deadline_warning_3_days' AND t.is_active = true;
    END IF;
    
    -- Schedule 1-day warning if in the future
    IF v_warning_1_day > NOW() THEN
        INSERT INTO scheduled_notifications (
            template_id,
            scheduled_for,
            recipients,
            template_data,
            status
        ) SELECT 
            t.id,
            v_warning_1_day,
            '["all_school_admins"]'::jsonb,
            jsonb_build_object(
                'category_id', NEW.id,
                'category_name', NEW.name,
                'deadline_date', NEW.deadline::date,
                'days_left', 1
            ),
            'pending'
        FROM notification_templates t
        WHERE t.name = 'deadline_warning_1_day' AND t.is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create approval notifications
CREATE OR REPLACE FUNCTION create_approval_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_template_name TEXT;
    v_school_admin_id UUID;
    v_school_name TEXT;
    v_category_name TEXT;
BEGIN
    -- Only process status changes
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Get school admin and related info
    SELECT s.admin_id, s.name INTO v_school_admin_id, v_school_name
    FROM schools s
    WHERE s.id = NEW.school_id;
    
    -- Get category name
    SELECT c.name INTO v_category_name
    FROM categories c
    WHERE c.id = NEW.category_id;
    
    -- Only create notification if school admin exists
    IF v_school_admin_id IS NOT NULL THEN
        -- Determine template based on new status
        IF NEW.status = 'approved' THEN
            v_template_name := 'data_approved';
        ELSIF NEW.status = 'rejected' THEN
            v_template_name := 'data_rejected';
        ELSE
            RETURN NEW;
        END IF;
        
        -- Create notification
        PERFORM create_notification_from_template(
            v_template_name,
            v_school_admin_id,
            jsonb_build_object(
                'category_name', v_category_name,
                'school_name', v_school_name,
                'approved_by', COALESCE(
                    (SELECT full_name FROM profiles WHERE id = NEW.approved_by),
                    'Sistem'
                ),
                'rejection_reason', NEW.rejection_reason
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. TRIGGERS
-- =============================================================================

-- Trigger for category deadline scheduling
DROP TRIGGER IF EXISTS trigger_schedule_deadline_notifications ON categories;
CREATE TRIGGER trigger_schedule_deadline_notifications
    AFTER INSERT OR UPDATE OF deadline ON categories
    FOR EACH ROW
    WHEN (NEW.deadline IS NOT NULL AND NEW.status = 'active')
    EXECUTE FUNCTION schedule_category_deadline_notifications();

-- Trigger for approval notifications
DROP TRIGGER IF EXISTS trigger_approval_notifications ON data_entries;
CREATE TRIGGER trigger_approval_notifications
    AFTER UPDATE ON data_entries
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected'))
    EXECUTE FUNCTION create_approval_notification();

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
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_templates
CREATE POLICY "notification_templates_read_all" ON notification_templates
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "notification_templates_admin_manage" ON notification_templates
    FOR ALL TO authenticated
    USING (is_superadmin() OR is_regionadmin());

-- RLS Policies for user_notification_preferences
CREATE POLICY "user_notification_preferences_own" ON user_notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "user_notification_preferences_admin_view" ON user_notification_preferences
    FOR SELECT TO authenticated
    USING (is_superadmin() OR is_regionadmin());

-- RLS Policies for notification_delivery_log
CREATE POLICY "notification_delivery_log_admin_view" ON notification_delivery_log
    FOR SELECT TO authenticated
    USING (is_superadmin() OR is_regionadmin());

-- RLS Policies for scheduled_notifications
CREATE POLICY "scheduled_notifications_admin_manage" ON scheduled_notifications
    FOR ALL TO authenticated
    USING (is_superadmin() OR is_regionadmin());

-- =============================================================================
-- 10. HELPER FUNCTIONS
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
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today
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
        'read_rate', CASE WHEN total > 0 THEN (total - unread)::float / total * 100 ELSE 0 END
    ) INTO v_stats
    FROM notification_stats;
    
    RETURN v_stats;
END;
$$;

-- Function to clean old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
    p_days_old INTEGER DEFAULT 90
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete notifications older than specified days that are read
    DELETE FROM notifications
    WHERE 
        is_read = true AND 
        created_at < NOW() - (p_days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Clean up delivery logs for deleted notifications
    DELETE FROM notification_delivery_log
    WHERE notification_id NOT IN (SELECT id FROM notifications);
    
    RETURN v_deleted_count;
END;
$$;

-- =============================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- =============================================================================

COMMENT ON TABLE notification_templates IS 'Template definitions for various notification types';
COMMENT ON TABLE user_notification_preferences IS 'User-specific notification preferences and settings';
COMMENT ON TABLE notification_delivery_log IS 'Log of notification delivery attempts and results';
COMMENT ON TABLE scheduled_notifications IS 'Queue for future notification delivery';

-- Create an admin function to verify the schema
CREATE OR REPLACE FUNCTION verify_notification_schema()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
    v_tables_count INTEGER;
    v_templates_count INTEGER;
    v_functions_count INTEGER;
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
    
    SELECT json_build_object(
        'schema_version', '20250602_notification_system_schema',
        'tables_created', v_tables_count,
        'default_templates', v_templates_count,
        'notification_functions', v_functions_count,
        'migration_status', CASE 
            WHEN v_tables_count = 4 AND v_templates_count >= 15 THEN 'SUCCESS'
            ELSE 'INCOMPLETE'
        END,
        'timestamp', NOW()
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON notification_templates TO authenticated;
GRANT ALL ON user_notification_preferences TO authenticated;
GRANT SELECT ON notification_delivery_log TO authenticated;
GRANT SELECT ON scheduled_notifications TO authenticated;

-- Final verification
SELECT verify_notification_schema();
