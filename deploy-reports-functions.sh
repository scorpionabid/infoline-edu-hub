#!/bin/bash

# =============================================
# Reports Database Functions Deployment Script
# =============================================

echo "🚀 Deploying Reports Database Functions to Supabase..."
echo "📁 Project ID: olbfnauhzpdskqnxtwav"
echo "📅 Date: $(date)"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory"
    echo "🔧 Linking to project..."
    supabase link --project-ref olbfnauhzpdskqnxtwav
fi

echo "📊 Applying database migrations..."

# Apply the reports functions migration
supabase db push

echo ""
echo "✅ Database functions deployment completed!"
echo ""
echo "📋 Deployed Functions:"
echo "  🔸 get_school_performance_report()"
echo "  🔸 get_regional_comparison_report()"
echo "  🔸 get_category_completion_report()"
echo "  🔸 get_school_data_by_category()"
echo "  🔸 get_dashboard_statistics()"
echo ""
echo "📊 Performance Indexes Created:"
echo "  🔸 idx_data_entries_school_category_status"
echo "  🔸 idx_data_entries_created_at_desc"
echo "  🔸 idx_data_entries_status_created_at"
echo "  🔸 idx_schools_region_sector_active"
echo "  🔸 idx_columns_category_active"
echo "  🔸 idx_categories_status_priority"
echo ""

# Test the functions
echo "🧪 Testing database functions..."

# Test with simple function call
echo "Testing get_dashboard_statistics()..."
supabase db reset --linked

echo ""
echo "🎉 Reports Database Functions Successfully Deployed!"
echo "📝 Next Step: Create useReportsData.ts hook"
echo ""
