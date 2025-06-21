# Step 1: Database Enhancements

## 🎯 Məqsəd
Notification sistemini PRD-yə uyğun etmək üçün verilənlər bazasına əlavə cədvəl və funksiyalar əlavə etmək.

## 📋 Tələb olunan cədvəllər

### 1. notification_templates
Email və in-app bildirişlər üçün template sistemi.

### 2. user_notification_preferences
İstifadəçilərin notification ayarları.

### 3. scheduled_notifications
Planlaşdırılmış bildirişlər.

### 4. notification_delivery_log
Bildiriş çatdırılma tarixçəsi.

## 📝 Implementation

### Fayl: `supabase/migrations/20241230_notification_enhancements.sql`

```sql
-- =============================================
-- İnfoLine Notification System Enhancements
-- =============================================

-- 1. Notification Templates cədvəli
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'deadline', 'approval', 'rejection', 'reminder', 'system', 'category_update', 'data_entry', 'school_update', 'region_update', 'sector_update')),
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

-- 2. User Notification Preferences cədvəli
CREATE TABLE IF NOT EXISTS user_notification_preferences (
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
    
    -- Language preference
    language VARCHAR(5) DEFAULT 'az',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Scheduled Notifications cədvəli
CREATE TABLE IF NOT EXISTS scheduled_notifications (
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

-- 4. Notification Delivery Log cədvəli
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Delivery details
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
    
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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- İndekslər
-- =============================================

-- Notification templates
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);
CREATE INDEX idx_notification_templates_name ON notification_templates(name);

-- User preferences
CREATE INDEX idx_user_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_user_preferences_email_enabled ON user_notification_preferences(email_enabled);

-- Scheduled notifications
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX idx_scheduled_notifications_template ON scheduled_notifications(template_id);

-- Delivery log
CREATE INDEX idx_delivery_log_notification ON notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_user ON notification_delivery_log(user_id);
CREATE INDEX idx_delivery_log_channel_status ON notification_delivery_log(channel, status);
CREATE INDEX idx_delivery_log_sent_at ON notification_delivery_log(sent_at);

-- =============================================
-- RLS Siyasətləri
-- =============================================

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

-- =============================================
-- Funksiyalar
-- =============================================

-- Create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating default preferences
DROP TRIGGER IF EXISTS trigger_create_default_preferences ON profiles;
CREATE TRIGGER trigger_create_default_preferences
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- Function to get user notification settings
CREATE OR REPLACE FUNCTION get_user_notification_settings(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    email_enabled BOOLEAN,
    push_enabled BOOLEAN,
    in_app_enabled BOOLEAN,
    sms_enabled BOOLEAN,
    deadline_notifications BOOLEAN,
    approval_notifications BOOLEAN,
    system_notifications BOOLEAN,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    language VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unp.user_id,
        unp.email_enabled,
        unp.push_enabled,
        unp.in_app_enabled,
        unp.sms_enabled,
        unp.deadline_notifications,
        unp.approval_notifications,
        unp.system_notifications,
        unp.quiet_hours_start,
        unp.quiet_hours_end,
        unp.language
    FROM user_notification_preferences unp
    WHERE unp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive notification
CREATE OR REPLACE FUNCTION should_send_notification(
    p_user_id UUID,
    p_notification_type TEXT,
    p_channel TEXT,
    p_current_time TIME DEFAULT CURRENT_TIME
)
RETURNS BOOLEAN AS $$
DECLARE
    preferences RECORD;
    in_quiet_hours BOOLEAN := false;
BEGIN
    -- Get user preferences
    SELECT * INTO preferences
    FROM user_notification_preferences
    WHERE user_id = p_user_id;
    
    -- If no preferences found, use defaults
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Check channel preferences
    IF p_channel = 'email' AND NOT preferences.email_enabled THEN
        RETURN false;
    END IF;
    
    IF p_channel = 'push' AND NOT preferences.push_enabled THEN
        RETURN false;
    END IF;
    
    IF p_channel = 'inApp' AND NOT preferences.in_app_enabled THEN
        RETURN false;
    END IF;
    
    IF p_channel = 'sms' AND NOT preferences.sms_enabled THEN
        RETURN false;
    END IF;
    
    -- Check notification type preferences
    IF p_notification_type = 'deadline' AND NOT preferences.deadline_notifications THEN
        RETURN false;
    END IF;
    
    IF p_notification_type IN ('approval', 'rejection') AND NOT preferences.approval_notifications THEN
        RETURN false;
    END IF;
    
    IF p_notification_type = 'system' AND NOT preferences.system_notifications THEN
        RETURN false;
    END IF;
    
    -- Check quiet hours
    IF preferences.quiet_hours_start IS NOT NULL AND preferences.quiet_hours_end IS NOT NULL THEN
        IF preferences.quiet_hours_start <= preferences.quiet_hours_end THEN
            -- Same day quiet hours
            in_quiet_hours := p_current_time BETWEEN preferences.quiet_hours_start AND preferences.quiet_hours_end;
        ELSE
            -- Overnight quiet hours
            in_quiet_hours := p_current_time >= preferences.quiet_hours_start OR p_current_time <= preferences.quiet_hours_end;
        END IF;
        
        -- Skip non-critical notifications during quiet hours
        IF in_quiet_hours AND p_notification_type NOT IN ('critical', 'system') THEN
            RETURN false;
        END IF;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old read notifications
    DELETE FROM notifications
    WHERE is_read = true
      AND created_at < NOW() - INTERVAL '1 day' * p_days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old delivery logs
    DELETE FROM notification_delivery_log
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_old;
    
    -- Delete old scheduled notifications that are completed
    DELETE FROM scheduled_notifications
    WHERE status IN ('sent', 'failed')
      AND processed_at < NOW() - INTERVAL '1 day' * p_days_old;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Default Templates
-- =============================================

-- Insert default notification templates
INSERT INTO notification_templates (name, type, title_template, message_template, default_priority, default_channels, is_system, variables) VALUES
('deadline_warning_3_days', 'deadline', 'Son tarix xatırlatması: {{category_name}}', '{{category_name}} kateqoriyası üçün son tarix 3 gün qalıb. Son tarix: {{deadline_date}}', 'high', '{inApp,email}', true, '{category_name,deadline_date,data_entry_url}'),
('deadline_warning_1_day', 'deadline', 'TƏCİLİ: Son tarix xatırlatması: {{category_name}}', '{{category_name}} kateqoriyası üçün son tarix SABAH bitir! Son tarix: {{deadline_date}}. Zəhmət olmasa dərhal məlumatları daxil edin.', 'critical', '{inApp,email}', true, '{category_name,deadline_date,data_entry_url}'),
('deadline_expired', 'error', 'Son tarix keçdi: {{category_name}}', '{{category_name}} kateqoriyası üçün son tarix keçdi. Bütün gözləyən məlumatlar avtomatik təsdiqləndi.', 'critical', '{inApp,email}', true, '{category_name,deadline_date}'),
('data_approved', 'approval', 'Məlumatlarınız təsdiqləndi', '{{category_name}} kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi.', 'high', '{inApp,email}', true, '{category_name,school_name,reviewer_name}'),
('data_rejected', 'rejection', 'Məlumatlarınız rədd edildi', '{{category_name}} kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. Səbəb: {{rejection_reason}}', 'high', '{inApp,email}', true, '{category_name,school_name,reviewer_name,rejection_reason}'),
('new_category_created', 'category_update', 'Yeni kateqoriya əlavə edildi', '{{category_name}} adlı yeni kateqoriya yaradıldı. Son tarix: {{deadline_date}}', 'normal', '{inApp}', true, '{category_name,deadline_date,assignment}'),
('system_maintenance', 'system', 'Sistem təmiri bildirişi', 'Sistem təmiri: {{maintenance_date}} tarixində {{duration}} müddətinə sistem əlçatmaz olacaq.', 'high', '{inApp,email}', true, '{maintenance_date,duration,start_time,end_time}'),
('completion_reminder', 'reminder', 'Məlumat daxil etmə xatırlatması', '{{category_name}} kateqoriyası üçün məlumat daxil etmə {{completion_percentage}}% tamamlanıb. Zəhmət olmasa qalan məlumatları da tamamlayın.', 'normal', '{inApp}', true, '{category_name,completion_percentage,remaining_fields}');

-- =============================================
-- Update existing notifications table
-- =============================================

-- Add new columns to existing notifications table if they don't exist
DO $$ 
BEGIN
    -- Add template_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'template_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN template_id UUID REFERENCES notification_templates(id);
        CREATE INDEX idx_notifications_template_id ON notifications(template_id);
    END IF;
    
    -- Add template_data column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'template_data'
    ) THEN
        ALTER TABLE notifications ADD COLUMN template_data JSONB DEFAULT '{}';
    END IF;
    
    -- Add channel column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'channel'
    ) THEN
        ALTER TABLE notifications ADD COLUMN channel VARCHAR(20) DEFAULT 'inApp';
    END IF;
    
    -- Add expires_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
    END IF;
END $$;

-- =============================================
-- Permissions and final setup
-- =============================================

-- Grant necessary permissions
GRANT ALL ON notification_templates TO authenticated;
GRANT ALL ON user_notification_preferences TO authenticated;
GRANT ALL ON scheduled_notifications TO authenticated;
GRANT ALL ON notification_delivery_log TO authenticated;

-- Grant sequence permissions if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE notification_templates IS 'Templates for different types of notifications with multi-language support';
COMMENT ON TABLE user_notification_preferences IS 'User-specific notification preferences and settings';
COMMENT ON TABLE scheduled_notifications IS 'Scheduled notifications to be sent at specific times';
COMMENT ON TABLE notification_delivery_log IS 'Log of notification delivery attempts and their results';
```

## ✅ Yoxlama Addımları

1. **SQL faylını icra edin:**
   ```bash
   # Supabase CLI ilə
   supabase db reset
   ```

2. **Cədvəllərin yarandığını yoxlayın:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%notification%';
   ```

3. **Default template-lərin əlavə olunduğunu yoxlayın:**
   ```sql
   SELECT name, type, is_active FROM notification_templates;
   ```

4. **RLS siyasətlərinin işlədiyini test edin:**
   ```sql
   SELECT * FROM notification_templates; -- Yalnız icazəsi olan istifadəçilər görə bilər
   ```

## 🔄 Növbəti Addım

Bu step tamamlandıqdan sonra [Step 2: Email Template System](./02-email-template-system.md) addımına keçin.

## 📚 Əlaqəli Fayllar

- `database-schema-document.md` - əsas database sxemasi
- `supabase RLS` - RLS siyasətləri sənədi
- `src/notifications/core/types.ts` - notification tipləri

---

**Status:** 📋 Ready for implementation
**Estimated time:** 1 gün
**Dependencies:** Supabase database access