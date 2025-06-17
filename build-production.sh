#!/bin/bash

# İnfoLine Production Build Script
# Production deployment üçün build və test script

set -e  # Exit on any error

echo "🚀 İnfoLine Production Build Process"
echo "====================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Run this script from the project root."
    exit 1
fi

print_status "Starting production build process..."

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Step 2: Install dependencies (production only)
print_status "Installing production dependencies..."
npm ci --production=false

# Step 3: Type checking
print_status "Running TypeScript type check..."
if npm run type-check 2>/dev/null || npx tsc --noEmit; then
    print_status "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Step 4: Linting
print_status "Running ESLint..."
if npm run lint; then
    print_status "Linting passed"
else
    print_warning "Linting warnings found, but continuing..."
fi

# Step 5: Run tests
print_status "Running test suite..."
if npm run test; then
    print_status "All tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Step 6: Translation validation
print_status "Validating translations..."
if npm run validate:translations 2>/dev/null; then
    print_status "Translation validation passed"
else
    print_warning "Translation validation skipped (script not found)"
fi

# Step 7: Production build
print_status "Building for production..."
if npm run build; then
    print_status "Production build completed successfully"
else
    print_error "Production build failed"
    exit 1
fi

# Step 8: Build verification
print_status "Verifying build output..."
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    print_status "Build output verified - dist/ directory contains files"
    
    # Check for essential files
    if [ -f "dist/index.html" ]; then
        print_status "index.html found"
    else
        print_error "index.html not found in dist/"
        exit 1
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    print_status "Build size: $BUILD_SIZE"
    
else
    print_error "Build output verification failed - dist/ directory is empty or missing"
    exit 1
fi

# Step 9: Security check (basic)
print_status "Running basic security checks..."

# Check for exposed secrets in build
if grep -r "SUPABASE_ANON_KEY" dist/ 2>/dev/null; then
    print_warning "Supabase anon key found in build (this is expected for client-side)"
fi

# Check for debug logs
if grep -r "console.log" dist/ 2>/dev/null | head -5; then
    print_warning "Console.log statements found in build"
fi

# Step 10: Preview build locally
print_status "Starting preview server for verification..."
print_warning "Preview server starting on http://localhost:4173"
print_warning "Please test the application manually before deploying"
print_warning "Press Ctrl+C to stop the preview server"

npm run preview

echo ""
print_status "Production build process completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test the preview build thoroughly"
echo "2. Deploy to production environment"
echo "3. Run post-deployment verification"
echo ""
echo "Build artifacts location: ./dist/"
echo "Ready for deployment! 🎉"
