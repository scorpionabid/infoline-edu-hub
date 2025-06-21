#!/bin/bash

# DataEntry Hooks Dependency Checker
# Bu script köhnə hook-ların hansı yerlərdə istifadə edildiyini yoxlayır

echo "🔍 DataEntry Hooks Dependency Analysis"
echo "========================================="

# Project root directory
PROJECT_ROOT="/Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub"
cd "$PROJECT_ROOT"

echo ""
echo "📋 Checking obsolete hooks usage..."

# Hooks to be removed
OBSOLETE_HOOKS=("useDataUpdates" "useQuickWins" "useIndexedData")

for hook in "${OBSOLETE_HOOKS[@]}"; do
    echo ""
    echo "🔸 Checking: $hook"
    echo "-------------------"
    
    # Check imports
    echo "📦 Import references:"
    grep -r "import.*$hook" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "   ✅ No imports found"
    
    # Check direct usage
    echo "📝 Direct usage:"
    grep -r "$hook(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "   ✅ No direct usage found"
    
    # Check export references
    echo "📤 Export references:"
    grep -r "export.*$hook" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "   ✅ No exports found"
done

echo ""
echo "========================================="
echo "📊 File size analysis"
echo "========================================="

DATAENTRY_DIR="src/hooks/dataEntry"

echo "📁 Current dataEntry hooks:"
find "$DATAENTRY_DIR" -name "*.ts" -exec wc -l {} + | sort -nr | head -20

echo ""
echo "📈 Total lines in dataEntry hooks:"
find "$DATAENTRY_DIR" -name "*.ts" -exec cat {} \; | wc -l

echo ""
echo "========================================="
echo "🧪 TypeScript check before cleanup"
echo "========================================="

# Run TypeScript check
echo "Running npm run type-check..."
npm run type-check 2>&1 | head -20

echo ""
echo "========================================="
echo "📋 Bundle size before cleanup"
echo "========================================="

# Check current bundle size if build exists
if [ -d "dist" ]; then
    echo "Current bundle sizes:"
    find dist -name "*.js" -exec ls -lh {} \; | awk '{print $5, $9}' | sort -hr | head -10
else
    echo "No dist folder found. Run 'npm run build' first."
fi

echo ""
echo "========================================="
echo "✅ Safe to proceed recommendations:"
echo "========================================="

echo "Based on the analysis above:"
echo ""
echo "1. 🟢 If no imports found for obsolete hooks → SAFE TO DELETE"
echo "2. 🟡 If imports found → CHECK ALTERNATIVE IMPLEMENTATIONS"
echo "3. 🔴 If direct usage found → REFACTOR BEFORE DELETION"
echo ""
echo "🚀 Next steps:"
echo "   1. Review the analysis above"
echo "   2. Create backup branch: git checkout -b feature/dataentry-cleanup"
echo "   3. Run cleanup script if safe"
echo "   4. Test thoroughly"

echo ""
echo "🔧 Quick cleanup commands (if safe):"
echo "   cd $DATAENTRY_DIR"
echo "   rm useDataUpdates.ts useQuickWins.ts useIndexedData.ts"
echo "   # Update index.ts exports"
echo "   npm run type-check"
echo "   npm run test"