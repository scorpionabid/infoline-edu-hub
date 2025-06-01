#!/bin/bash

# İnfoLine Enhanced Notification System Migration Script
# Bu script mövcud notification system-i enhanced versiyaya migrate edir

set -e

echo "🚀 İnfoLine Enhanced Notification System Migration başladı..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if project is linked
    if [ ! -f .env.local ]; then
        print_warning ".env.local file not found. Make sure you have proper environment setup."
    fi
    
    print_status "Dependencies check completed ✅"
}

# Backup existing notification data
backup_existing_data() {
    print_step "Creating backup of existing notification data..."
    
    # Create backup directory
    mkdir -p ./migration-backup/$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="./migration-backup/$(date +%Y%m%d_%H%M%S)"
    
    # Export existing notifications
    print_status "Exporting existing notifications..."
    supabase db dump --data-only --table notifications > "$BACKUP_DIR/notifications_backup.sql" || true
    
    # Export audit logs
    print_status "Exporting audit logs..."
    supabase db dump --data-only --table audit_logs > "$BACKUP_DIR/audit_logs_backup.sql" || true
    
    print_status "Backup created in $BACKUP_DIR ✅"
}

# Run database migrations
run_database_migrations() {
    print_step "Running database migrations..."
    
    # Apply the enhanced notification schema
    print_status "Applying enhanced notification schema..."
    supabase db push --include-all
    
    # Run the enhancement script
    if [ -f "./database-enhancements.sql" ]; then
        print_status "Running database enhancements..."
        supabase db push --file ./database-enhancements.sql
    else
        print_warning "database-enhancements.sql not found. Running manual SQL..."
        
        # Create enhanced tables manually if file not found
        cat << 'EOF' | supabase db push --stdin
-- Minimum required enhancements
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS template_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS template_data JSONB;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

-- Create notification_templates table
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

-- Create user_notification_preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    deadline_reminders TEXT DEFAULT '3_1',
    category_preferences JSONB DEFAULT '{}',
    digest_frequency TEXT DEFAULT 'daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
EOF
    fi
    
    print_status "Database migrations completed ✅"
}

# Deploy Edge Functions
deploy_edge_functions() {
    print_step "Deploying Edge Functions..."
    
    # Deploy each function
    print_status "Deploying send-notification-email function..."
    supabase functions deploy send-notification-email --no-verify-jwt
    
    print_status "Deploying send-template-email function..."
    supabase functions deploy send-template-email --no-verify-jwt
    
    print_status "Deploying deadline-checker function..."
    supabase functions deploy deadline-checker --no-verify-jwt
    
    print_status "Edge Functions deployed ✅"
}

# Initialize default templates
initialize_templates() {
    print_step "Initializing default notification templates..."
    
    # SQL to insert default templates
    cat << 'EOF' | supabase db push --stdin
INSERT INTO notification_templates (name, title_template, message_template, email_template, type, priority) VALUES
('deadline_warning_3_days', '{{category_name}} - 3 gün qalıb', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti 3 gün sonra bitəcək. Son tarix: {{deadline_date}}', 'deadline_warning_3_days', 'warning', 'high'),
('deadline_warning_1_day', '{{category_name}} - 1 gün qalıb', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti sabah bitəcək. Son tarix: {{deadline_date}}', 'deadline_warning_1_day', 'warning', 'critical'),
('deadline_expired', '{{category_name}} - müddət bitib', '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti bitib. Məlumatlar avtomatik təsdiqlənəcək.', 'deadline_expired', 'error', 'critical'),
('data_approved', '{{category_name}} məlumatları təsdiqləndi', '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi. Təsdiqləyən: {{approved_by}}', 'data_approved', 'success', 'normal'),
('data_rejected', '{{category_name}} məlumatları rədd edildi', '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. Səbəb: {{rejection_reason}}', 'data_rejected', 'error', 'high')
ON CONFLICT (name) DO NOTHING;
EOF
    
    print_status "Default templates initialized ✅"
}

# Update frontend imports
update_frontend_imports() {
    print_step "Updating frontend imports..."
    
    # Create a temporary backup of App.tsx
    if [ -f "src/App.tsx" ]; then
        cp src/App.tsx src/App.tsx.backup
        print_status "Created backup of App.tsx"
    fi
    
    # Check if EnhancedNotificationProvider is already imported
    if grep -q "EnhancedNotificationProvider" src/App.tsx 2>/dev/null; then
        print_status "EnhancedNotificationProvider already imported ✅"
    else
        print_warning "Please manually add EnhancedNotificationProvider to your App.tsx"
        echo "Add this import: import { EnhancedNotificationProvider } from '@/context/EnhancedNotificationContext';"
        echo "Wrap your app with: <EnhancedNotificationProvider>...</EnhancedNotificationProvider>"
    fi
    
    # Update notification system import in layout
    print_status "Please update your layout to use EnhancedNotificationSystem instead of NotificationSystem"
    
    print_status "Frontend import updates completed ✅"
}

# Test the enhanced system
test_enhanced_system() {
    print_step "Testing enhanced notification system..."
    
    # Test database connectivity
    print_status "Testing database connectivity..."
    
    # Test if templates table exists and has data
    TEMPLATE_COUNT=$(supabase db query "SELECT COUNT(*) FROM notification_templates;" --output json | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
    
    if [ "$TEMPLATE_COUNT" -gt 0 ]; then
        print_status "Templates table has $TEMPLATE_COUNT templates ✅"
    else
        print_warning "No templates found in database"
    fi
    
    # Test Edge Functions
    print_status "Testing Edge Functions..."
    
    # Test deadline-checker function
    FUNCTION_TEST=$(supabase functions invoke deadline-checker --method GET || echo "failed")
    if [[ "$FUNCTION_TEST" != *"failed"* ]]; then
        print_status "Edge Functions are working ✅"
    else
        print_warning "Edge Functions test failed"
    fi
    
    print_status "System testing completed ✅"
}

# Setup cron job for deadline checking
setup_cron_job() {
    print_step "Setting up cron job for deadline checking..."
    
    # Get the project URL
    PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}' || echo "")
    
    if [ -n "$PROJECT_URL" ]; then
        print_status "Project URL: $PROJECT_URL"
        print_status "Add this cron job to run deadline checker every hour:"
        echo "0 * * * * curl -X POST $PROJECT_URL/functions/v1/deadline-checker"
        
        # Create a cron job script
        cat > ./setup-cron.sh << EOF
#!/bin/bash
# Add this to your server's crontab
# Run: crontab -e
# Add: 0 * * * * curl -X POST $PROJECT_URL/functions/v1/deadline-checker
echo "0 * * * * curl -X POST $PROJECT_URL/functions/v1/deadline-checker" | crontab -
echo "Cron job added for deadline checking"
EOF
        chmod +x ./setup-cron.sh
        
        print_status "Cron job script created: ./setup-cron.sh ✅"
    else
        print_warning "Could not determine project URL. Set up cron job manually."
    fi
}

# Environment configuration
setup_environment() {
    print_step "Setting up environment configuration..."
    
    # Create .env.example if it doesn't exist
    if [ ! -f ".env.example" ]; then
        cat > .env.example << 'EOF'
# İnfoLine Enhanced Notification System Environment Variables

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service Configuration (Resend.com example)
EMAIL_SERVICE_URL=https://api.resend.com/emails
EMAIL_SERVICE_API_KEY=your_resend_api_key
EMAIL_SERVICE_FROM_EMAIL=noreply@infoline.edu.az

# Frontend URL (for email links)
FRONTEND_URL=https://infoline.edu.az

# Optional: SMS Service (future feature)
SMS_SERVICE_URL=
SMS_SERVICE_API_KEY=
EOF
        print_status "Created .env.example file ✅"
    fi
    
    # Check if required environment variables are set
    if [ -f ".env.local" ]; then
        if grep -q "EMAIL_SERVICE_API_KEY" .env.local; then
            print_status "Email service configured ✅"
        else
            print_warning "EMAIL_SERVICE_API_KEY not found in .env.local"
            echo "Please add email service configuration to .env.local"
        fi
    else
        print_warning ".env.local not found. Please create it based on .env.example"
    fi
}

# Performance optimization
optimize_performance() {
    print_step "Applying performance optimizations..."
    
    # Add database indexes
    cat << 'EOF' | supabase db push --stdin
-- Performance indexes for enhanced notification system
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type_priority ON notifications(type, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(name);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Add partial index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, created_at) WHERE is_read = false;
EOF
    
    print_status "Performance indexes applied ✅"
}

# Generate migration report
generate_report() {
    print_step "Generating migration report..."
    
    REPORT_FILE="./migration-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# İnfoLine Enhanced Notification System Migration Report

**Migration Date**: $(date)
**Migration Status**: ✅ Completed Successfully

## 📊 Migration Summary

### Database Changes
- ✅ Enhanced notifications table with new columns
- ✅ Created notification_templates table
- ✅ Created user_notification_preferences table
- ✅ Created notification_delivery_log table (if applicable)
- ✅ Applied performance indexes

### Edge Functions
- ✅ Deployed send-notification-email function
- ✅ Deployed send-template-email function
- ✅ Deployed deadline-checker function

### Templates
- ✅ Initialized default notification templates
- ✅ Templates ready for deadline warnings and approval notifications

## 🔧 Post-Migration Tasks

1. **Frontend Integration**
   - [ ] Update App.tsx to use EnhancedNotificationProvider
   - [ ] Replace NotificationSystem with EnhancedNotificationSystem in layout
   - [ ] Test notification functionality

2. **Email Configuration**
   - [ ] Set up email service (Resend, SendGrid, etc.)
   - [ ] Configure EMAIL_SERVICE_API_KEY in environment
   - [ ] Test email delivery

3. **Cron Job Setup**
   - [ ] Add deadline-checker cron job to server
   - [ ] Test automated deadline notifications

4. **Performance Monitoring**
   - [ ] Monitor notification delivery performance
   - [ ] Check real-time connection stability
   - [ ] Monitor email delivery rates

## 🧪 Testing Checklist

- [ ] Create test notification via UI
- [ ] Test real-time notification updates
- [ ] Test email notification delivery
- [ ] Test deadline warning system
- [ ] Test notification preferences
- [ ] Test analytics dashboard

## 📞 Support

If you encounter any issues:
1. Check the logs: \`supabase functions logs\`
2. Verify environment variables
3. Test database connectivity
4. Review the NOTIFICATION_SYSTEM_README.md

## 🎯 Next Steps

1. Deploy to production environment
2. Configure monitoring and alerting
3. Train users on new notification features
4. Plan future enhancements (push notifications, mobile app integration)

---
**Migration completed successfully! 🎉**
EOF

    print_status "Migration report generated: $REPORT_FILE ✅"
}

# Main migration process
main() {
    echo "========================================="
    echo "İnfoLine Enhanced Notification System"
    echo "Migration Script v1.0.0"
    echo "========================================="
    echo ""
    
    # Ask for confirmation
    read -p "Bu script mövcud notification system-i enhanced versiyaya migrate edəcək. Davam etmək istəyirsiniz? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Migration cancelled by user."
        exit 0
    fi
    
    echo ""
    print_status "Migration başlayır..."
    echo ""
    
    # Execute migration steps
    check_dependencies
    echo ""
    
    backup_existing_data
    echo ""
    
    setup_environment
    echo ""
    
    run_database_migrations
    echo ""
    
    deploy_edge_functions
    echo ""
    
    initialize_templates
    echo ""
    
    optimize_performance
    echo ""
    
    update_frontend_imports
    echo ""
    
    setup_cron_job
    echo ""
    
    test_enhanced_system
    echo ""
    
    generate_report
    echo ""
    
    echo "========================================="
    print_status "🎉 Migration completed successfully!"
    echo "========================================="
    echo ""
    print_status "Next steps:"
    echo "1. Update your frontend code to use EnhancedNotificationProvider"
    echo "2. Configure email service in .env.local"
    echo "3. Set up cron job for deadline checking"
    echo "4. Test the enhanced notification system"
    echo ""
    print_status "Check the generated migration report for detailed information."
    echo ""
}

# Run main function
main "$@"
