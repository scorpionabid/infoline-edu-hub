-- ============================================================================
-- İnfoLine Notification System Database Schema Enhancements
-- Phase 3: Enhanced notification tables and functions
-- ============================================================================

-- 1. Enhanced notifications table (add new columns)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS template_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS template_data JSONB;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS engagement_data JSONB;

-- Update existing notifications to have delivery_status
UPDATE notifications SET delivery_status = 'sent' WHERE delivery_status IS NULL;

-- 2. Notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    email_template TEXT,
    type TEXT NOT NULL DEFAULT 'info',
    priority TEXT DEFAULT 'normal',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for notification templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(name);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- 3. User notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    deadline_reminders TEXT DEFAULT '3_1', -- '3_1', '1', 'none'
    category_preferences JSONB DEFAULT '{}',
    digest_frequency TEXT DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for user notification preferences
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- 4. Notification delivery tracking table
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_method TEXT NOT NULL, -- 'in_app', 'email', 'push'
    status TEXT NOT NULL, -- 'sent', 'delivered', 'failed', 'bounced'
    attempt_count INTEGER DEFAULT 1,
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_email TEXT,
    template_id UUID REFERENCES notification_templates(id)
);

-- Create indexes for notification delivery log
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_method ON notification_delivery_log(delivery_method);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_date ON notification_delivery_log(created_at);

-- 5. Scheduled notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES notification_templates(id),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    recipients JSONB NOT NULL, -- Array of user IDs or criteria
    template_data JSONB,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create indexes for scheduled notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_template_id ON scheduled_notifications(template_id);

-- 6. Insert default notification templates
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
('bulk_import_failed', 'Toplu idxal uğursuz oldu', '{{import_type}} toplu idxalı uğursuz oldu. Səbəb: {{error_message}}', 'bulk_import_failed', 'error', 'high')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Enhanced Functions for Notification System
-- ============================================================================

-- 7. Function to create notification from template
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_template_name TEXT,
    p_template_data JSONB,
    p_user_ids UUID[]
) RETURNS TABLE(notification_id UUID, success BOOLEAN, error_message TEXT) AS $$
DECLARE
    v_template RECORD;
    v_user_id UUID;
    v_rendered_title TEXT;
    v_rendered_message TEXT;
    v_notification_id UUID;
BEGIN
    -- Get template
    SELECT * INTO v_template
    FROM notification_templates
    WHERE name = p_template_name AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, false, 'Template not found: ' || p_template_name;
        RETURN;
    END IF;
    
    -- Create notification for each user
    FOREACH v_user_id IN ARRAY p_user_ids LOOP
        BEGIN
            -- Render template (basic implementation, could be enhanced)
            v_rendered_title := v_template.title_template;
            v_rendered_message := v_template.message_template;
            
            -- Replace template variables (simple implementation)
            FOR key, value IN SELECT * FROM jsonb_each_text(p_template_data) LOOP
                v_rendered_title := replace(v_rendered_title, '{{' || key || '}}', value);
                v_rendered_message := replace(v_rendered_message, '{{' || key || '}}', value);
            END LOOP;
            
            -- Insert notification
            INSERT INTO notifications (
                user_id, title, message, type, priority,
                template_id, template_data, is_read, created_at
            ) VALUES (
                v_user_id, v_rendered_title, v_rendered_message, 
                v_template.type, v_template.priority,
                v_template.id, p_template_data, false, NOW()
            ) RETURNING id INTO v_notification_id;
            
            RETURN QUERY SELECT v_notification_id, true, NULL::TEXT;
            
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT NULL::UUID, false, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to schedule deadline notifications
CREATE OR REPLACE FUNCTION schedule_deadline_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if deadline is set and category is active
    IF NEW.deadline IS NOT NULL AND NEW.status = 'active' THEN
        -- Schedule 3-day warning
        INSERT INTO scheduled_notifications (template_id, scheduled_for, recipients, template_data)
        SELECT 
            (SELECT id FROM notification_templates WHERE name = 'deadline_warning_3_days' LIMIT 1),
            NEW.deadline - INTERVAL '3 days',
            jsonb_build_array('school_admins', 'sector_admins', 'region_admins'),
            jsonb_build_object(
                'category_id', NEW.id, 
                'category_name', NEW.name, 
                'deadline_date', to_char(NEW.deadline, 'DD.MM.YYYY')
            )
        WHERE NEW.deadline - INTERVAL '3 days' > NOW();
        
        -- Schedule 1-day warning  
        INSERT INTO scheduled_notifications (template_id, scheduled_for, recipients, template_data)
        SELECT 
            (SELECT id FROM notification_templates WHERE name = 'deadline_warning_1_day' LIMIT 1),
            NEW.deadline - INTERVAL '1 day',
            jsonb_build_array('school_admins', 'sector_admins', 'region_admins'),
            jsonb_build_object(
                'category_id', NEW.id, 
                'category_name', NEW.name, 
                'deadline_date', to_char(NEW.deadline, 'DD.MM.YYYY')
            )
        WHERE NEW.deadline - INTERVAL '1 day' > NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for deadline notification scheduling
DROP TRIGGER IF EXISTS trigger_schedule_deadline_notifications ON categories;
CREATE TRIGGER trigger_schedule_deadline_notifications
    AFTER INSERT OR UPDATE OF deadline ON categories
    FOR EACH ROW
    WHEN (NEW.deadline IS NOT NULL AND NEW.status = 'active')
    EXECUTE FUNCTION schedule_deadline_notifications();

-- 10. Function to process scheduled notifications
CREATE OR REPLACE FUNCTION process_scheduled_notifications()
RETURNS TABLE(processed_count INTEGER, success_count INTEGER, error_count INTEGER) AS $$
DECLARE
    v_scheduled RECORD;
    v_processed INTEGER := 0;
    v_success INTEGER := 0;
    v_error INTEGER := 0;
    v_user_ids UUID[];
BEGIN
    -- Get scheduled notifications that are due
    FOR v_scheduled IN 
        SELECT * FROM scheduled_notifications 
        WHERE scheduled_for <= NOW() AND status = 'pending'
        ORDER BY scheduled_for
    LOOP
        BEGIN
            v_processed := v_processed + 1;
            
            -- Get user IDs based on recipients criteria
            -- This is a simplified implementation
            v_user_ids := ARRAY[]::UUID[];
            
            -- Process recipients array
            FOR recipient IN SELECT jsonb_array_elements_text(v_scheduled.recipients) LOOP
                IF recipient = 'school_admins' THEN
                    v_user_ids := v_user_ids || ARRAY(
                        SELECT ur.user_id 
                        FROM user_roles ur 
                        WHERE ur.role = 'schooladmin'
                    );
                ELSIF recipient = 'sector_admins' THEN
                    v_user_ids := v_user_ids || ARRAY(
                        SELECT ur.user_id 
                        FROM user_roles ur 
                        WHERE ur.role = 'sectoradmin'
                    );
                ELSIF recipient = 'region_admins' THEN
                    v_user_ids := v_user_ids || ARRAY(
                        SELECT ur.user_id 
                        FROM user_roles ur 
                        WHERE ur.role = 'regionadmin'
                    );
                END IF;
            END LOOP;
            
            -- Create notifications using template
            PERFORM create_notification_from_template(
                (SELECT name FROM notification_templates WHERE id = v_scheduled.template_id),
                v_scheduled.template_data,
                v_user_ids
            );
            
            -- Mark as processed
            UPDATE scheduled_notifications 
            SET status = 'sent', processed_at = NOW()
            WHERE id = v_scheduled.id;
            
            v_success := v_success + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Mark as failed
            UPDATE scheduled_notifications 
            SET status = 'failed', processed_at = NOW(), error_message = SQLERRM
            WHERE id = v_scheduled.id;
            
            v_error := v_error + 1;
        END;
    END LOOP;
    
    RETURN QUERY SELECT v_processed, v_success, v_error;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Enhanced notification triggers
CREATE OR REPLACE FUNCTION notify_data_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_school_admin_id UUID;
    v_school_name TEXT;
    v_category_name TEXT;
    v_column_name TEXT;
BEGIN
    -- Only trigger on status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get related information
        SELECT s.admin_id, s.name INTO v_school_admin_id, v_school_name
        FROM schools s WHERE s.id = NEW.school_id;
        
        SELECT c.name INTO v_category_name
        FROM categories c WHERE c.id = NEW.category_id;
        
        SELECT col.name INTO v_column_name
        FROM columns col WHERE col.id = NEW.column_id;
        
        -- Send notification based on new status
        IF NEW.status = 'approved' AND v_school_admin_id IS NOT NULL THEN
            PERFORM create_notification_from_template(
                'data_approved',
                jsonb_build_object(
                    'category_name', v_category_name,
                    'school_name', v_school_name,
                    'approved_by', 'Admin',
                    'approved_date', to_char(NOW(), 'DD.MM.YYYY HH24:MI')
                ),
                ARRAY[v_school_admin_id]
            );
        ELSIF NEW.status = 'rejected' AND v_school_admin_id IS NOT NULL THEN
            PERFORM create_notification_from_template(
                'data_rejected',
                jsonb_build_object(
                    'category_name', v_category_name,
                    'school_name', v_school_name,
                    'rejection_reason', COALESCE(NEW.rejection_reason, 'Səbəb qeyd edilməyib')
                ),
                ARRAY[v_school_admin_id]
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data status changes
DROP TRIGGER IF EXISTS trigger_notify_data_status_change ON data_entries;
CREATE TRIGGER trigger_notify_data_status_change
    AFTER UPDATE ON data_entries
    FOR EACH ROW
    EXECUTE FUNCTION notify_data_status_change();

-- ============================================================================
-- RLS Policies for New Tables
-- ============================================================================

-- Enable RLS for new tables
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Notification templates policies
CREATE POLICY "superadmin_manage_templates" ON notification_templates
    FOR ALL TO authenticated
    USING (is_superadmin());

CREATE POLICY "regionadmin_manage_templates" ON notification_templates
    FOR ALL TO authenticated
    USING (is_regionadmin());

CREATE POLICY "view_active_templates" ON notification_templates
    FOR SELECT TO authenticated
    USING (is_active = true);

-- User notification preferences policies
CREATE POLICY "superadmin_manage_preferences" ON user_notification_preferences
    FOR ALL TO authenticated
    USING (is_superadmin());

CREATE POLICY "manage_own_preferences" ON user_notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Notification delivery log policies
CREATE POLICY "superadmin_view_delivery_log" ON notification_delivery_log
    FOR SELECT TO authenticated
    USING (is_superadmin());

CREATE POLICY "regionadmin_view_delivery_log" ON notification_delivery_log
    FOR SELECT TO authenticated
    USING (is_regionadmin());

-- Scheduled notifications policies
CREATE POLICY "superadmin_manage_scheduled" ON scheduled_notifications
    FOR ALL TO authenticated
    USING (is_superadmin());

CREATE POLICY "regionadmin_manage_scheduled" ON scheduled_notifications
    FOR ALL TO authenticated
    USING (is_regionadmin());

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- 12. Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old read notifications
    DELETE FROM notifications 
    WHERE is_read = true 
    AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up delivery logs older than 180 days
    DELETE FROM notification_delivery_log 
    WHERE created_at < NOW() - INTERVAL '180 days';
    
    -- Clean up processed scheduled notifications older than 30 days
    DELETE FROM scheduled_notifications 
    WHERE status IN ('sent', 'failed') 
    AND processed_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_statistics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    total_notifications BIGINT,
    notifications_by_type JSONB,
    notifications_by_priority JSONB,
    read_rate NUMERIC,
    email_delivery_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH notification_stats AS (
        SELECT 
            COUNT(*) as total,
            jsonb_object_agg(type, count) as by_type,
            jsonb_object_agg(priority, count) as by_priority,
            ROUND(
                (COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
                2
            ) as read_percentage
        FROM (
            SELECT 
                type, 
                priority, 
                is_read,
                COUNT(*) OVER (PARTITION BY type) as count
            FROM notifications 
            WHERE created_at::date BETWEEN start_date AND end_date
        ) n
    ),
    email_stats AS (
        SELECT 
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'delivered')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
                2
            ) as email_rate
        FROM notification_delivery_log 
        WHERE delivery_method = 'email' 
        AND created_at::date BETWEEN start_date AND end_date
    )
    SELECT 
        ns.total,
        ns.by_type,
        ns.by_priority,
        ns.read_percentage,
        es.email_rate
    FROM notification_stats ns
    CROSS JOIN email_stats es;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Create indexes for better performance
-- ============================================================================

-- Additional indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status ON notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type_priority ON notifications(type, priority, created_at);

-- ============================================================================
-- Grant necessary permissions
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION create_notification_from_template TO authenticated;
GRANT EXECUTE ON FUNCTION process_scheduled_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_statistics TO authenticated;

-- Grant execute permission for cleanup function to service role only
GRANT EXECUTE ON FUNCTION cleanup_old_notifications TO service_role;

-- ============================================================================
-- Final verification and comments
-- ============================================================================

-- Add comments to tables for documentation
COMMENT ON TABLE notification_templates IS 'Template definitions for automated notifications';
COMMENT ON TABLE user_notification_preferences IS 'User-specific notification settings and preferences';
COMMENT ON TABLE notification_delivery_log IS 'Tracking log for notification delivery attempts and results';
COMMENT ON TABLE scheduled_notifications IS 'Queue for future notification delivery';

-- Verify all tables exist
DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'notification_templates',
        'user_notification_preferences', 
        'notification_delivery_log',
        'scheduled_notifications'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
            RAISE EXCEPTION 'Table % was not created successfully', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All notification system tables created successfully';
END $$;
