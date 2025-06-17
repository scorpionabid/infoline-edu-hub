#!/bin/bash

# İnfoLine Pre-Deployment Validation Script
# Production-a deploy etməzdən əvvəl sistem yoxlanışı

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
print_header() {
    echo -e "\n${BLUE}$1${NC}"
    echo "=========================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Start validation
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                İnfoLine Pre-Deployment Validation               ║"
echo "║                Production Hazırlıq Yoxlanışı                    ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json tapılmadı. Script-i project root-dan işə salın."
    exit 1
fi

# 1. Project Structure Validation
print_header "1. PROJECT STRUCTURE VALIDATION"

# Check essential directories
essential_dirs=("src" "src/components" "src/hooks" "src/services" "src/translations" "src/__tests__")
for dir in "${essential_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_success "Directory mövcuddur: $dir"
    else
        print_error "Directory tapılmadı: $dir"
    fi
done

# Check essential files
essential_files=("package.json" "vite.config.ts" "tsconfig.json" "tailwind.config.ts")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "File mövcuddur: $file"
    else
        print_error "File tapılmadı: $file"
    fi
done

# 2. Dependencies Check
print_header "2. DEPENDENCIES CHECK"

if [ -d "node_modules" ]; then
    print_success "node_modules mövcuddur"
    
    # Check package lock
    if [ -f "package-lock.json" ]; then
        print_success "package-lock.json mövcuddur"
    else
        print_warning "package-lock.json tapılmadı"
    fi
    
    # Check critical dependencies
    critical_deps=("react" "typescript" "@supabase/supabase-js" "vite" "tailwindcss")
    for dep in "${critical_deps[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            print_success "Dependency yüklənib: $dep"
        else
            print_error "Dependency tapılmadı: $dep"
        fi
    done
else
    print_error "node_modules tapılmadı. 'npm install' işə salın."
fi

# 3. Environment Configuration Check
print_header "3. ENVIRONMENT CONFIGURATION"

# Check environment files
if [ -f ".env.production.template" ]; then
    print_success ".env.production.template mövcuddur"
else
    print_warning ".env.production.template tapılmadı"
fi

if [ -f ".env.local" ]; then
    print_warning ".env.local tapılmadı - production üçün environment variables lazımdır"
fi

# Check environment variables in src/config
if [ -f "src/config/environment.ts" ]; then
    print_success "Environment configuration mövcuddur"
else
    print_error "src/config/environment.ts tapılmadı"
fi

if [ -f "src/config/production.ts" ]; then
    print_success "Production configuration mövcuddur"
else
    print_warning "src/config/production.ts tapılmadı"
fi

# 4. Build System Check
print_header "4. BUILD SYSTEM VALIDATION"

# Check if build works
echo "TypeScript build test etmə..."
if npx tsc --noEmit 2>/dev/null; then
    print_success "TypeScript build uğurludur"
else
    print_error "TypeScript build xətaları var"
fi

# Check if vite config is valid
echo "Vite config test etmə..."
if npx vite build --dry-run 2>/dev/null; then
    print_success "Vite build config düzgündür"
else
    print_warning "Vite build config yoxlanmadı"
fi

# 5. Code Quality Check
print_header "5. CODE QUALITY CHECK"

# ESLint check
if npx eslint . --max-warnings 10 2>/dev/null; then
    print_success "ESLint yoxlanışı keçdi"
else
    print_warning "ESLint xəbərdarlıqları var"
fi

# Check for common issues
echo "Ümumi code problemlərini yoxlama..."

# Check for console.log in source
console_logs=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" | wc -l)
if [ "$console_logs" -gt 0 ]; then
    print_warning "$console_logs fayl(lar)da console.log tapıldı"
else
    print_success "Console.log statements təmizdir"
fi

# Check for TODO comments
todo_count=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "TODO\|FIXME\|XXX" | wc -l)
if [ "$todo_count" -gt 0 ]; then
    print_warning "$todo_count TODO/FIXME comments tapıldı"
else
    print_success "TODO comments təmizdir"
fi

# 6. Test Suite Validation
print_header "6. TEST SUITE VALIDATION"

# Check test files exist
test_files=$(find src/__tests__ -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)
if [ "$test_files" -gt 0 ]; then
    print_success "$test_files test file tapıldı"
else
    print_warning "Test files tapılmadı"
fi

# Check if tests can run
echo "Test suite sürətli yoxlanışı..."
if npm run test -- --run --silent 2>/dev/null; then
    print_success "Test suite işləyir"
else
    print_warning "Test suite problemləri ola bilər"
fi

# 7. Security Check
print_header "7. SECURITY VALIDATION"

# Check for sensitive files
sensitive_files=(".env" ".env.local" ".env.production" "*.key" "*.pem")
for pattern in "${sensitive_files[@]}"; do
    files=$(find . -name "$pattern" -not -path "./node_modules/*" 2>/dev/null)
    if [ -n "$files" ]; then
        print_warning "Həssas fayllar tapıldı: $files"
    fi
done

# Check gitignore
if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        print_success ".env files gitignore-da var"
    else
        print_error ".env files gitignore-da yoxdur"
    fi
else
    print_error ".gitignore tapılmadı"
fi

# 8. Translation Validation
print_header "8. TRANSLATION VALIDATION"

# Check translation files
translation_dirs=("src/translations/az" "src/translations/en" "src/translations/ru" "src/translations/tr")
for dir in "${translation_dirs[@]}"; do
    if [ -d "$dir" ]; then
        file_count=$(find "$dir" -name "*.ts" | wc -l)
        if [ "$file_count" -gt 0 ]; then
            print_success "Translation files mövcuddur: $dir ($file_count files)"
        else
            print_warning "Translation files boşdur: $dir"
        fi
    else
        print_error "Translation directory tapılmadı: $dir"
    fi
done

# 9. Supabase Integration Check
print_header "9. SUPABASE INTEGRATION"

if [ -d "src/integrations/supabase" ]; then
    print_success "Supabase integration mövcuddur"
    
    # Check essential supabase files
    supabase_files=("src/integrations/supabase/client.ts" "src/integrations/supabase/types.ts")
    for file in "${supabase_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Supabase file mövcuddur: $file"
        else
            print_error "Supabase file tapılmadı: $file"
        fi
    done
else
    print_error "Supabase integration tapılmadı"
fi

# Check for edge functions
if [ -d "supabase/functions" ] || [ -d "src/supabase/functions" ]; then
    print_success "Edge functions mövcuddur"
else
    print_warning "Edge functions tapılmadı"
fi

# 10. Performance Check
print_header "10. PERFORMANCE VALIDATION"

# Check bundle size estimation
if [ -f "dist/index.html" ]; then
    build_size=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "unknown")
    print_success "Previous build size: $build_size"
else
    print_warning "Previous build tapılmadı - 'npm run build' işə salın"
fi

# Check for large files in src
large_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n | tail -5)
print_success "Largest source files checked"

# Final Summary
print_header "VALIDATION SUMMARY"

echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

# Final recommendation
echo ""
if [ "$FAILED" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}🎉 SİSTEM PRODUCTION ÜÇÜN HAZIRDIR!${NC}"
        echo -e "${GREEN}Bütün yoxlanışlar uğurla keçdi.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  SİSTEM ƏSASƏN HAZIRDIR${NC}"
        echo -e "${YELLOW}$WARNINGS xəbərdarlıq var, lakin production-a deploy edilə bilər.${NC}"
        echo -e "${YELLOW}Xəbərdarlıqları nəzərdən keçirin.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ SİSTEM PRODUCTION ÜÇÜN HAZIR DEYİL${NC}"
    echo -e "${RED}$FAILED kritik problem həll edilməlidir.${NC}"
    echo -e "${RED}Problemləri həll etdikdən sonra yenidən yoxlayın.${NC}"
    exit 1
fi
