-- =============================================================================
-- İnfoLine Notification System - FIXED Functions Only
-- Yalnız xəta verən funksiyalar düzəldilir
-- =============================================================================

-- Function to create notification from template (FIXED)
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_template_name TEXT,
    p_user_id UUID,
    p_template_data JSONB DEFAULT NULL,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_channels TEXT[] DEFAULT '{inApp}'
) RETURNS UUID
AS $function$
DECLARE
    v_template notification_templates%ROWTYPE;
    v_notification_id UUID;
    v_rendered_title TEXT;
    v_rendered_message TEXT;
    v_channel TEXT;
    key TEXT;
BEGIN
    -- Get template
    SELECT * INTO v_template
    FROM notification_templates
    WHERE name = p_template_name AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found: %', p_template_name;
    END IF;
    
    -- Render title and message
    v_rendered_title := v_template.title_template;
    v_rendered_message := v_template.message_template;
    
    -- Template rendering with variables
    IF p_template_data IS NOT NULL THEN
        FOR key IN SELECT jsonb_object_keys(p_template_data) LOOP
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
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive notification (FIXED)
CREATE OR REPLACE FUNCTION should_send_notification(
    p_user_id UUID,
    p_notification_type TEXT,
    p_channel TEXT,
    p_priority TEXT DEFAULT 'normal'
) RETURNS BOOLEAN
AS $function$
DECLARE
    v_preferences user_notification_preferences%ROWTYPE;
    v_current_time TIME;
    v_in_quiet_hours BOOLEAN := false;
BEGIN
    -- Get user preferences
    SELECT * INTO v_preferences
    FROM user_notification_preferences
    WHERE user_id = p_user_id;
    
    -- If no preferences found, use defaults
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
    
    -- Check quiet hours
    IF p_priority != 'critical' AND v_preferences.quiet_hours_start IS NOT NULL AND v_preferences.quiet_hours_end IS NOT NULL THEN
        v_current_time := CURRENT_TIME;
        
        IF v_preferences.quiet_hours_start <= v_preferences.quiet_hours_end THEN
            v_in_quiet_hours := v_current_time BETWEEN v_preferences.quiet_hours_start AND v_preferences.quiet_hours_end;
        ELSE
            v_in_quiet_hours := v_current_time >= v_preferences.quiet_hours_start OR v_current_time <= v_preferences.quiet_hours_end;
        END IF;
        
        IF v_in_quiet_hours THEN
            RETURN false;
        END IF;
    END IF;
    
    RETURN true;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default notification preferences (FIXED)
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER 
AS $function$
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
$function$ LANGUAGE plpgsql;

-- Update timestamp function (FIXED)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Function to get notification statistics (FIXED)
CREATE OR REPLACE FUNCTION get_notification_statistics(
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS JSON
AS $function$
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
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old notifications (FIXED)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
    p_days_old INTEGER DEFAULT 90
) RETURNS INTEGER
AS $function$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete old read notifications
    DELETE FROM notifications
    WHERE 
        is_read = true AND 
        created_at < NOW() - (p_days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Clean up delivery logs
    DELETE FROM notification_delivery_log
    WHERE notification_id NOT IN (SELECT id FROM notifications);
    
    -- Delete old scheduled notifications
    DELETE FROM scheduled_notifications
    WHERE status IN ('sent', 'failed')
      AND processed_at < NOW() - (p_days_old || ' days')::INTERVAL;
    
    RETURN v_deleted_count;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification function (FIXED)
CREATE OR REPLACE FUNCTION verify_notification_system()
RETURNS JSON
AS $function$
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
        'schema_version', '20241231_notification_system_fixed',
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
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Final verification
SELECT verify_notification_system();

-- Success message
SELECT 'İnfoLine Notification System functions fixed successfully' AS status;