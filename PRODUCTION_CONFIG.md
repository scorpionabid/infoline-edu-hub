# İnfoLine Enhanced Notification System - Production Configuration

Bu sənəd production mühitində enhanced notification system-in quraşdırma və idarəetmə təlimatlarını əhatə edir.

## 📋 Production Checklist

### 1. Environment Setup ✅

```bash
# Production .env faylında lazımi dəyişənlər
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Email Service (Resend.com example)
EMAIL_SERVICE_URL=https://api.resend.com/emails
EMAIL_SERVICE_API_KEY=re_live_production_key
EMAIL_SERVICE_FROM_EMAIL=noreply@infoline.edu.az

# Frontend URL
FRONTEND_URL=https://infoline.edu.az

# Performance tuning
NOTIFICATION_BATCH_SIZE=50
MAX_NOTIFICATIONS_PER_USER=1000
EMAIL_RETRY_ATTEMPTS=3
```

### 2. Database Configuration ✅

```sql
-- Production database tuning
-- PostgreSQL settings üçün

-- Connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Notification specific settings
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- Auto-vacuum settings for notifications table
ALTER TABLE notifications SET (
    autovacuum_vacuum_threshold = 1000,
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_threshold = 500,
    autovacuum_analyze_scale_factor = 0.05
);

-- Partitioning for large notification tables (optional)
-- Bu script böyük data volume üçün:
/*
CREATE TABLE notifications_2024 PARTITION OF notifications
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE notifications_2025 PARTITION OF notifications
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
*/
```

### 3. Monitoring & Alerting 📊

```bash
# Monitoring script - production-monitor.sh yaradın
#!/bin/bash

# Notification system health check
check_notification_health() {
    echo "🔍 Checking notification system health..."
    
    # Check database connectivity
    DB_STATUS=$(supabase db query "SELECT 1" --output json 2>/dev/null && echo "OK" || echo "FAILED")
    echo "Database: $DB_STATUS"
    
    # Check Edge Functions
    FUNCTION_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://your-project.supabase.co/functions/v1/deadline-checker)
    if [ "$FUNCTION_STATUS" = "200" ]; then
        echo "Edge Functions: OK"
    else
        echo "Edge Functions: FAILED ($FUNCTION_STATUS)"
    fi
    
    # Check notification volume
    NOTIFICATION_COUNT=$(supabase db query "SELECT COUNT(*) FROM notifications WHERE created_at > NOW() - INTERVAL '24 hours'" --csv | tail -1)
    echo "24h Notifications: $NOTIFICATION_COUNT"
    
    # Check unread notifications
    UNREAD_COUNT=$(supabase db query "SELECT COUNT(*) FROM notifications WHERE is_read = false" --csv | tail -1)
    echo "Unread Notifications: $UNREAD_COUNT"
    
    # Check email delivery rate
    EMAIL_SUCCESS_RATE=$(supabase db query "
        SELECT ROUND(
            COUNT(*) FILTER (WHERE status = 'delivered')::numeric / 
            NULLIF(COUNT(*), 0) * 100, 2
        ) as success_rate
        FROM notification_delivery_log 
        WHERE delivery_method = 'email' 
        AND created_at > NOW() - INTERVAL '24 hours'
    " --csv | tail -1)
    echo "Email Success Rate: $EMAIL_SUCCESS_RATE%"
}

# Alert function
send_alert() {
    local message="$1"
    echo "🚨 ALERT: $message"
    
    # Send to Slack/Discord webhook (example)
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"İnfoLine Alert: $message\"}" \
    #   YOUR_SLACK_WEBHOOK_URL
}

# Main monitoring
check_notification_health

# Alert conditions
if [ "$DB_STATUS" = "FAILED" ]; then
    send_alert "Database connection failed"
fi

if [ "$FUNCTION_STATUS" != "200" ]; then
    send_alert "Edge Functions are down"
fi

if [ "$UNREAD_COUNT" -gt 10000 ]; then
    send_alert "Too many unread notifications: $UNREAD_COUNT"
fi
```

### 4. Backup Strategy 💾

```bash
# Daily backup script - notification-backup.sh
#!/bin/bash

BACKUP_DIR="/backup/infoline-notifications/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup notification data
echo "📦 Creating notification backup..."

# Export notifications (last 30 days)
supabase db dump --data-only \
    --table notifications \
    --where "created_at > NOW() - INTERVAL '30 days'" \
    > "$BACKUP_DIR/notifications.sql"

# Export templates
supabase db dump --data-only \
    --table notification_templates \
    > "$BACKUP_DIR/templates.sql"

# Export user preferences
supabase db dump --data-only \
    --table user_notification_preferences \
    > "$BACKUP_DIR/preferences.sql"

# Export delivery logs (last 7 days)
supabase db dump --data-only \
    --table notification_delivery_log \
    --where "created_at > NOW() - INTERVAL '7 days'" \
    > "$BACKUP_DIR/delivery_logs.sql"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .
rm -rf "$BACKUP_DIR"

echo "✅ Backup completed: $BACKUP_DIR.tar.gz"

# Cleanup old backups (keep 30 days)
find /backup/infoline-notifications -name "*.tar.gz" -mtime +30 -delete
```

### 5. Performance Optimization 🚀

```sql
-- Performance optimization queries

-- 1. Notification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_performance 
ON notifications(user_id, is_read, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- 2. Template lookup optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_lookup 
ON notification_templates(name, is_active) 
WHERE is_active = true;

-- 3. Delivery log optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_delivery_log_performance 
ON notification_delivery_log(delivery_method, status, created_at);

-- 4. Partitioned index for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_date 
ON notifications(user_id, created_at) 
WHERE created_at > NOW() - INTERVAL '90 days';

-- 5. Cleanup old notifications function
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete read notifications older than 90 days
    DELETE FROM notifications 
    WHERE is_read = true 
    AND created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete delivery logs older than 30 days
    DELETE FROM notification_delivery_log 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (add to cron)
-- 0 2 * * 0 SELECT cleanup_old_notifications(); -- Weekly at 2 AM
```

### 6. Cron Jobs Setup ⏰

```bash
# Production cron jobs - add to server crontab

# Every hour - deadline checker
0 * * * * curl -X POST https://your-project.supabase.co/functions/v1/deadline-checker

# Every 15 minutes - system health check
*/15 * * * * /opt/infoline/scripts/production-monitor.sh >> /var/log/infoline-monitor.log 2>&1

# Daily at 1 AM - backup
0 1 * * * /opt/infoline/scripts/notification-backup.sh >> /var/log/infoline-backup.log 2>&1

# Weekly at 2 AM Sunday - cleanup
0 2 * * 0 echo "SELECT cleanup_old_notifications();" | psql $DATABASE_URL

# Daily at 3 AM - vacuum and analyze
0 3 * * * echo "VACUUM ANALYZE notifications; VACUUM ANALYZE notification_delivery_log;" | psql $DATABASE_URL
```

### 7. Security Configuration 🔒

```sql
-- Security enhancements

-- 1. Create read-only user for monitoring
CREATE USER notification_monitor WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE postgres TO notification_monitor;
GRANT USAGE ON SCHEMA public TO notification_monitor;
GRANT SELECT ON notifications, notification_templates, notification_delivery_log TO notification_monitor;

-- 2. Rate limiting function
CREATE OR REPLACE FUNCTION check_notification_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    -- Check notifications in last hour
    SELECT COUNT(*) INTO recent_count
    FROM notifications
    WHERE notifications.user_id = check_notification_rate_limit.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Allow max 100 notifications per hour per user
    RETURN recent_count < 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION audit_notification_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.is_read != NEW.is_read) THEN
        INSERT INTO audit_logs (
            action, entity_type, entity_id, old_value, new_value, user_id, created_at
        ) VALUES (
            TG_OP, 'notification', 
            COALESCE(NEW.id, OLD.id),
            to_jsonb(OLD), to_jsonb(NEW),
            auth.uid(), NOW()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_notifications
    AFTER UPDATE OR DELETE ON notifications
    FOR EACH ROW EXECUTE FUNCTION audit_notification_changes();
```

### 8. Load Testing 🧪

```javascript
// Load test script - load-test.js
// npm install artillery -g
// artillery run load-test.yml

// load-test.yml
/*
config:
  target: 'https://your-project.supabase.co'
  phases:
    - duration: 300  # 5 minutes
      arrivalRate: 10  # 10 requests per second
  headers:
    Authorization: 'Bearer YOUR_TEST_JWT_TOKEN'

scenarios:
  - name: "Notification CRUD Operations"
    weight: 70
    flow:
      - post:
          url: "/rest/v1/notifications"
          headers:
            Content-Type: "application/json"
          json:
            user_id: "{{ $randomUUID }}"
            title: "Load test notification"
            message: "Testing system performance"
            type: "info"
            is_read: false
      
      - get:
          url: "/rest/v1/notifications?select=*&limit=20"
          
      - patch:
          url: "/rest/v1/notifications?id=eq.{{ notification_id }}"
          headers:
            Content-Type: "application/json"
          json:
            is_read: true

  - name: "Edge Function Load Test"
    weight: 30
    flow:
      - post:
          url: "/functions/v1/deadline-checker"
          headers:
            Content-Type: "application/json"
*/
```

### 9. Disaster Recovery 🚨

```bash
# Disaster recovery plan - disaster-recovery.sh

#!/bin/bash

# Full system recovery script
recover_notification_system() {
    echo "🚨 Starting disaster recovery for notification system..."
    
    # 1. Restore database from backup
    echo "📦 Restoring database..."
    latest_backup=$(ls -t /backup/infoline-notifications/*.tar.gz | head -1)
    
    if [ -n "$latest_backup" ]; then
        tar -xzf "$latest_backup" -C /tmp/recovery/
        
        # Restore tables
        psql $DATABASE_URL < /tmp/recovery/notifications.sql
        psql $DATABASE_URL < /tmp/recovery/templates.sql
        psql $DATABASE_URL < /tmp/recovery/preferences.sql
        
        echo "✅ Database restored from: $latest_backup"
    else
        echo "❌ No backup found!"
        exit 1
    fi
    
    # 2. Re-deploy Edge Functions
    echo "🚀 Re-deploying Edge Functions..."
    supabase functions deploy send-notification-email --no-verify-jwt
    supabase functions deploy send-template-email --no-verify-jwt
    supabase functions deploy deadline-checker --no-verify-jwt
    
    # 3. Verify system health
    echo "🔍 Verifying system health..."
    ./production-monitor.sh
    
    # 4. Re-enable cron jobs
    echo "⏰ Re-enabling cron jobs..."
    # Add cron jobs back
    
    echo "✅ Disaster recovery completed!"
}

# Usage: ./disaster-recovery.sh
recover_notification_system
```

### 10. Deployment Pipeline 🔄

```yaml
# .github/workflows/deploy-notifications.yml
name: Deploy Enhanced Notifications

on:
  push:
    branches: [main]
    paths: 
      - 'src/services/notifications/**'
      - 'supabase/functions/**'
      - 'database-enhancements.sql'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Run Database Migrations
        run: |
          supabase db push --include-all
          
      - name: Deploy Edge Functions
        run: |
          supabase functions deploy send-notification-email
          supabase functions deploy send-template-email
          supabase functions deploy deadline-checker
          
      - name: Run Health Check
        run: |
          chmod +x ./production-monitor.sh
          ./production-monitor.sh
          
      - name: Notify Deployment
        if: success()
        run: |
          echo "✅ Notification system deployed successfully"
          # Send notification to team
```

## 📊 Production Metrics

### Key Performance Indicators (KPIs)

```sql
-- Daily KPI report
WITH notification_stats AS (
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_notifications,
        COUNT(*) FILTER (WHERE is_read = true) as read_notifications,
        COUNT(*) FILTER (WHERE type = 'deadline') as deadline_notifications,
        COUNT(*) FILTER (WHERE priority = 'critical') as critical_notifications
    FROM notifications
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
),
email_stats AS (
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as emails_sent,
        COUNT(*) FILTER (WHERE status = 'delivered') as emails_delivered
    FROM notification_delivery_log
    WHERE delivery_method = 'email'
    AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
)
SELECT 
    n.date,
    n.total_notifications,
    n.read_notifications,
    ROUND((n.read_notifications::numeric / n.total_notifications) * 100, 2) as read_rate,
    n.deadline_notifications,
    n.critical_notifications,
    e.emails_sent,
    e.emails_delivered,
    ROUND((e.emails_delivered::numeric / NULLIF(e.emails_sent, 0)) * 100, 2) as email_delivery_rate
FROM notification_stats n
LEFT JOIN email_stats e ON n.date = e.date
ORDER BY n.date DESC;
```

### Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Notification delivery | < 2s | > 5s |
| Email delivery rate | > 95% | < 90% |
| Real-time latency | < 500ms | > 2s |
| Database query time | < 100ms | > 500ms |
| Unread notifications | < 1000 | > 5000 |
| System uptime | > 99.9% | < 99% |

Bu production configuration hərtərəfli və hazır istifadəyə yararlıdır. Monitoring, backup, security və performance optimization bütün aspektlərini əhatə edir.
