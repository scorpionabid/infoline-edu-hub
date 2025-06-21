#!/bin/bash

# İnfoLine Database Migration Script
# Bu script notification system database migration-unu icra edir

echo "🚀 İnfoLine Notification System Migration başlayır..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI quraşdırılmayıb. Zəhmət olmasa quraşdırın:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Bu qovluq Supabase proyekti deyil. Düzgün qovluğa keçin."
    exit 1
fi

echo "📊 Migration faylını yoxlayırıq..."
MIGRATION_FILE="supabase/migrations/20241231_notification_system_final.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration faylı tapılmadı: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration faylı tapıldı"

# Run the migration
echo "🔄 Database migration icra edilir..."

# Option 1: Reset database with new migration
echo "Seçim 1: Database reset (bütün məlumatlar silinəcək və yenidən yaradılacaq)"
echo "Seçim 2: Manual SQL icra et (mövcud məlumatlar qorunacaq)"
echo "Seçiminizi edin (1 və ya 2): "
read choice

if [ "$choice" = "1" ]; then
    echo "⚠️  XƏBƏRDARLIQ: Bütün lokal məlumatlar silinəcək!"
    echo "Davam etmək istəyirsiniz? (y/N): "
    read confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo "🔄 Database reset edilir..."
        supabase db reset --linked
        
        if [ $? -eq 0 ]; then
            echo "✅ Database reset uğurla tamamlandı"
        else
            echo "❌ Database reset uğursuz oldu"
            exit 1
        fi
    else
        echo "❌ İmtina edildi"
        exit 1
    fi
elif [ "$choice" = "2" ]; then
    echo "🔄 SQL faylı manual icra edilir..."
    
    # Get database connection details
    echo "Supabase database URL-ni daxil edin (məsələn: db.xxxxx.supabase.co):"
    read db_host
    
    if [ -z "$db_host" ]; then
        echo "❌ Database URL daxil edilmədi"
        exit 1
    fi
    
    echo "📡 SQL faylı icra edilir..."
    psql -h "$db_host" -U postgres -d postgres -f "$MIGRATION_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ SQL icra uğurla tamamlandı"
    else
        echo "❌ SQL icra uğursuz oldu"
        exit 1
    fi
else
    echo "❌ Yanlış seçim"
    exit 1
fi

# Verify migration
echo "🔍 Migration nəticəsini yoxlayırıq..."

# Run verification query
VERIFY_QUERY="SELECT verify_notification_system();"

if [ "$choice" = "1" ]; then
    # Use supabase CLI for local verification
    echo "$VERIFY_QUERY" | supabase db query
else
    # Use psql for manual verification
    echo "$VERIFY_QUERY" | psql -h "$db_host" -U postgres -d postgres -t
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration uğurla tamamlandı!"
    echo ""
    echo "📋 Növbəti addımlar:"
    echo "1. Frontend notification komponenti testi"
    echo "2. Email template sistem konfigurası" 
    echo "3. User preferences UI yaratma"
    echo "4. Real-time notification test"
    echo ""
    echo "📚 Ətraflı məlumat üçün baxın:"
    echo "- RUN_MIGRATION.md"
    echo "- docs/notification-implementation/"
    echo ""
else
    echo "❌ Migration verification uğursuz oldu"
    exit 1
fi

echo "🏁 Script tamamlandı!"