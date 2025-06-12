#!/bin/bash
# Test refactoring results

echo "🧪 Testing Column Refactoring Results..."

cd "/Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub"

# Check if TypeScript compiles
echo "📝 Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck 2>&1 | head -20

echo ""
echo "📁 New file structure:"
echo "src/hooks/columns/"
ls -la src/hooks/columns/ | grep -E "\.(ts|tsx)$"

echo ""
echo "src/hooks/columns/core/"
ls -la src/hooks/columns/core/ 2>/dev/null || echo "Directory not found"

echo ""
echo "src/hooks/columns/mutations/"
ls -la src/hooks/columns/mutations/ 2>/dev/null || echo "Directory not found"

echo ""
echo "src/services/columns/"
ls -la src/services/columns/ 2>/dev/null || echo "Directory not found"

echo ""
echo "📦 Legacy files moved to:"
echo "src/hooks/columns/legacy/"
ls -la src/hooks/columns/legacy/ 2>/dev/null || echo "Directory not found"

echo ""
echo "🔍 Checking for remaining old imports..."
grep -r "useColumnsQuery" src/ --include="*.ts" --include="*.tsx" | head -10

echo ""
echo "✅ Test completed!"
