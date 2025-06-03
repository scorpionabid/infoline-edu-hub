#!/bin/bash

# İnfoLine Test Execution Script
# Testlərin cari statusunu yoxlamaq üçün

echo "🧪 İnfoLine Test Suite Status Check"
echo "=================================="

# Test project directory-ə keç
cd "/Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub"

echo "📂 Current Directory: $(pwd)"
echo ""

# Package.json test scripts-lərini göstər
echo "📋 Available Test Scripts:"
echo "-------------------------"
npm run | grep test
echo ""

# Node_modules və dependencies check
echo "🔍 Dependencies Check:"
echo "--------------------"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing - need to run npm install"
fi

# Check test dependencies
if [ -f "node_modules/.bin/vitest" ]; then
    echo "✅ Vitest installed"
else
    echo "❌ Vitest missing"
fi

if [ -d "node_modules/@testing-library" ]; then
    echo "✅ Testing Library installed"
else
    echo "❌ Testing Library missing"
fi

echo ""

# Test files count
echo "📊 Test Files Count:"
echo "------------------"
find src/__tests__ -name "*.test.tsx" -o -name "*.test.ts" | wc -l | xargs echo "Total test files:"
echo ""

# Test files structure
echo "📁 Test Files Structure:"
echo "----------------------"
find src/__tests__ -name "*.test.tsx" -o -name "*.test.ts" | sort
echo ""

# Try to run a quick test check
echo "🚀 Quick Test Check (dry run):"
echo "-----------------------------"
echo "Attempting to validate test setup..."

# Check if we can import vitest
node -e "
try {
  require('vitest');
  console.log('✅ Vitest can be imported');
} catch (e) {
  console.log('❌ Vitest import failed:', e.message);
}
" 2>/dev/null || echo "❌ Node.js execution failed"

echo ""
echo "💡 Next steps:"
echo "1. Run: npm run test (execute all tests)"
echo "2. Run: npm run test:coverage (check coverage)"
echo "3. Run: npm run test:watch (development mode)"
echo ""
