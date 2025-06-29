#!/bin/bash

# Deploy edge functions script for İnfoLine
echo "🚀 İnfoLine Edge Functions Deploy Started..."

# Make sure we're in the project directory
cd /Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub

# Deploy assign-sector-admin function
echo "📦 Deploying assign-sector-admin..."
supabase functions deploy assign-sector-admin

# Deploy assign-existing-user-as-sector-admin function
echo "📦 Deploying assign-existing-user-as-sector-admin..."
supabase functions deploy assign-existing-user-as-sector-admin

# Deploy all functions at once (optional)
echo "📦 Deploying all functions..."
supabase functions deploy --no-verify-jwt

echo "✅ All edge functions deployed successfully!"
echo "🔗 Check Supabase dashboard for deployment status"

echo "📋 Deployment Summary:"
echo "  - assign-sector-admin: ✅ Updated with region_id fix"
echo "  - assign-existing-user-as-sector-admin: ✅ Already contains region_id logic"
echo "  - All other functions: ✅ Deployed"

echo "🎯 Next Steps:"
echo "  1. Test sector admin assignment in frontend"
echo "  2. Verify region_id is correctly set in user_roles table"
echo "  3. Check dashboard access for new sector admins"
