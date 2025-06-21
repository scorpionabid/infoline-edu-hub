#!/bin/bash

# İnfoLine Test Execution & Verification Script
# Run this to check current test status and execute tests

echo "🧪 İnfoLine Test Suite - Execution & Verification"
echo "================================================"
echo ""

# Change to project directory
PROJECT_DIR="/Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub"
echo "📂 Changing to project directory..."
cd "$PROJECT_DIR"

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Check project path."
    exit 1
fi

echo "✅ Project directory confirmed: $(pwd)"
echo ""

# Check Node.js and npm versions
echo "🔍 Environment Check:"
echo "-------------------"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# List available test scripts
echo "📋 Available Test Scripts:"
echo "------------------------"
npm run | grep test | sed 's/^/  /'
echo ""

# Count test files
echo "📊 Test Files Summary:"
echo "--------------------"
if [ -d "src/__tests__" ]; then
    TOTAL_TESTS=$(find src/__tests__ -name "*.test.tsx" -o -name "*.test.ts" | wc -l | xargs)
    echo "Total test files: $TOTAL_TESTS"
    echo ""
    
    echo "Test files by category:"
    echo "• Dashboard tests: $(find src/__tests__/dashboards -name "*.test.tsx" 2>/dev/null | wc -l | xargs)"
    echo "• Navigation tests: $(find src/__tests__/navigation -name "*.test.tsx" 2>/dev/null | wc -l | xargs)"
    echo "• Integration tests: $(find src/__tests__/integration -name "*.test.tsx" 2>/dev/null | wc -l | xargs)"
    echo "• Component tests: $(find src/__tests__ -maxdepth 1 -name "*.test.tsx" | wc -l | xargs)"
    echo ""
else
    echo "❌ src/__tests__ directory not found"
fi

# Try to run a quick test to verify setup
echo "🚀 Running Quick Test Verification:"
echo "----------------------------------"

# Test 1: Check if Vitest can start
echo "1. Testing Vitest setup..."
timeout 10 npm run test -- --run --reporter=verbose --bail 1 2>/dev/null >/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Vitest can execute tests"
else
    echo "⚠️  Vitest execution needs attention"
fi

# Test 2: Check specific test files
echo ""
echo "2. Testing specific files..."

# Test Sidebar (should pass)
echo "Testing Sidebar.test.tsx..."
if [ -f "src/__tests__/navigation/Sidebar.test.tsx" ]; then
    timeout 30 npm run test -- navigation/Sidebar.test.tsx --run --reporter=summary 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Sidebar tests: PASSING"
    else
        echo "⚠️  Sidebar tests: Need attention"
    fi
else
    echo "❌ Sidebar.test.tsx not found"
fi

# Test enhanced utilities
echo ""
echo "Testing enhanced test utilities..."
if [ -f "src/__tests__/enhanced-test-utils.tsx" ]; then
    echo "✅ Enhanced test utils found"
else
    echo "❌ Enhanced test utils missing"
fi

echo ""
echo "🎯 EXECUTION RECOMMENDATIONS:"
echo "=============================="
echo ""
echo "IMMEDIATE ACTIONS (run these commands):"
echo "--------------------------------------"
echo "1. Run all tests:"
echo "   npm run test"
echo ""
echo "2. Run with coverage:"
echo "   npm run test:coverage"
echo ""
echo "3. Run in watch mode for development:"
echo "   npm run test:watch"
echo ""
echo "4. Run specific test categories:"
echo "   npm run test -- src/__tests__/dashboards/"
echo "   npm run test -- src/__tests__/navigation/"
echo ""
echo "5. Debug failing tests:"
echo "   npm run test:debug -- enhanced-LoginForm.test.tsx"
echo ""

echo "📈 EXPECTED RESULTS:"
echo "------------------"
echo "• Sidebar tests: Should pass 95%+"
echo "• Dashboard tests: Should pass 80%+"  
echo "• Auth tests: May need minor fixes"
echo "• Coverage target: 70%+ immediately, 85%+ end of week"
echo ""

echo "🚨 ESCALATION CRITERIA:"
echo "----------------------"
echo "Call for help if:"
echo "• Less than 50% of tests passing"
echo "• Cannot run npm run test at all"
echo "• Major infrastructure failures"
echo "• Spending >2 hours on setup issues"
echo ""

echo "📋 NEXT STEPS PRIORITY:"
echo "----------------------"
echo "1. Execute: npm run test"
echo "2. Analyze results and identify failures"  
echo "3. Fix critical path tests (Sidebar → Dashboard → Auth)"
echo "4. Improve coverage to 70%+"
echo "5. Setup integration tests"
echo ""

echo "✅ Script completed. Ready to begin testing!"
echo "Run the commands above to start test execution."
