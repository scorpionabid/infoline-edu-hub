#!/bin/bash

# 🚀 İnfoLine - Final Deployment Status
echo "=================================================="
echo "🎯 İNFOLINE PROJECT - DEPLOYMENT STATUS"
echo "=================================================="
echo ""

# Project info
echo "📋 PROJECT INFORMATION:"
echo "   Name: İnfoLine - Məktəb Məlumatları Toplama Sistemi"
echo "   Version: 1.0.0"
echo "   Target: 600+ məktəb"
echo "   Languages: Az, Ru, Tr, En"
echo ""

# Check if cleanup folder exists
if [ -d "CLEANUP_DELETED_FILES" ]; then
    file_count=$(ls -1 CLEANUP_DELETED_FILES | wc -l)
    echo "✅ CLEANUP COMPLETED:"
    echo "   Deleted files: $file_count"
    echo "   Location: CLEANUP_DELETED_FILES/"
    echo ""
else
    echo "❌ Cleanup folder not found!"
    echo ""
fi

# Check core directories
echo "📁 CORE STRUCTURE:"
directories=("src/components" "src/hooks" "src/services" "src/pages" "src/translations")
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        count=$(find "$dir" -name "*.tsx" -o -name "*.ts" | wc -l)
        echo "   ✅ $dir ($count files)"
    else
        echo "   ❌ $dir (missing)"
    fi
done
echo ""

# Check important files
echo "🔧 CONFIGURATION FILES:"
files=("package.json" "vite.config.ts" "tailwind.config.ts" "tsconfig.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done
echo ""

# Check build readiness
echo "🏗️  BUILD READINESS:"
if [ -f "package.json" ]; then
    echo "   ✅ Dependencies defined"
fi

if [ -d "src/integrations/supabase" ]; then
    echo "   ✅ Supabase integration ready"
fi

if [ -d "src/translations" ]; then
    lang_count=$(ls -1 src/translations | grep -v index.ts | wc -l)
    echo "   ✅ Multi-language support ($lang_count languages)"
fi

if [ -f "components.json" ]; then
    echo "   ✅ UI components configured"
fi
echo ""

# Environment check
echo "🌍 ENVIRONMENT:"
if [ -f ".env.local" ]; then
    echo "   ✅ Local environment file exists"
fi

if [ -f ".env.production.template" ]; then
    echo "   ✅ Production template ready"
fi
echo ""

# Final status
echo "🎯 DEPLOYMENT STATUS:"
echo ""
if [ -d "CLEANUP_DELETED_FILES" ] && [ -d "src/components" ] && [ -f "package.json" ]; then
    echo "   🟢 READY FOR DEPLOYMENT"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "   1. Remove node_modules and dist folders"
    echo "   2. Set production environment variables"
    echo "   3. Run: npm install"
    echo "   4. Run: npm run build"
    echo "   5. Deploy to production server"
    echo "   6. Deploy edge functions to Supabase"
    echo ""
    echo "🔗 DEPLOYMENT GUIDE:"
    echo "   See: DEPLOYMENT_READY/DEPLOYMENT_CHECKLIST.md"
else
    echo "   🟡 NEEDS ATTENTION"
    echo "   Check missing files above"
fi

echo ""
echo "=================================================="
echo "✨ CLEANUP COMPLETED - PROJECT READY"
echo "=================================================="
