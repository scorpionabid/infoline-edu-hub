#!/bin/bash

# =============================================================================
# İNFOLINE - STATUS HISTORY SYSTEM TEST
# Bu script security fix və yeni functionality-ni test edir
# =============================================================================

echo "🔍 İnfoLine Status History System Test"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

echo -e "${BLUE}1. Migration faylının mövcudluğunu yoxlayırıq...${NC}"
if [ -f "supabase/migrations/20250617_fix_security_definer_view.sql" ]; then
    echo -e "${GREEN}✅ Migration faylı mövcuddur${NC}"
else
    echo -e "${RED}❌ Migration faylı tapılmadı${NC}"
    exit 1
fi

echo -e "${BLUE}2. Service fayllarını yoxlayırıq...${NC}"

# Check StatusHistoryService
if [ -f "src/services/statusHistoryService.ts" ]; then
    echo -e "${GREEN}✅ StatusHistoryService mövcuddur${NC}"
else
    echo -e "${RED}❌ StatusHistoryService tapılmadı${NC}"
fi

# Check updated StatusTransitionService
if grep -q "StatusHistoryService" "src/services/statusTransitionService.ts"; then
    echo -e "${GREEN}✅ StatusTransitionService yenilənib${NC}"
else
    echo -e "${YELLOW}⚠️  StatusTransitionService yenilənməyib${NC}"
fi

echo -e "${BLUE}3. Hook fayllarını yoxlayırıq...${NC}"

if [ -f "src/hooks/useStatusHistory.ts" ]; then
    echo -e "${GREEN}✅ useStatusHistory hook mövcuddur${NC}"
else
    echo -e "${RED}❌ useStatusHistory hook tapılmadı${NC}"
fi

echo -e "${BLUE}4. Component fayllarını yoxlayırıq...${NC}"

if [ -f "src/components/status-history/StatusHistoryTable.tsx" ]; then
    echo -e "${GREEN}✅ StatusHistoryTable component mövcuddur${NC}"
else
    echo -e "${RED}❌ StatusHistoryTable component tapılmadı${NC}"
fi

if [ -f "src/components/status-history/StatusHistoryDashboard.tsx" ]; then
    echo -e "${GREEN}✅ StatusHistoryDashboard component mövcuddur${NC}"
else
    echo -e "${RED}❌ StatusHistoryDashboard component tapılmadı${NC}"
fi

if [ -f "src/components/status-history/index.ts" ]; then
    echo -e "${GREEN}✅ Component index faylı mövcuddur${NC}"
else
    echo -e "${RED}❌ Component index faylı tapılmadı${NC}"
fi

echo -e "${BLUE}5. TypeScript sintaks yoxlaması...${NC}"

# Check if TypeScript files compile without errors
echo "TypeScript faylları yoxlanır..."

# Check service files
npx tsc --noEmit src/services/statusHistoryService.ts 2>/dev/null
print_status "StatusHistoryService TypeScript"

npx tsc --noEmit src/services/statusTransitionService.ts 2>/dev/null
print_status "StatusTransitionService TypeScript"

# Check hook files
npx tsc --noEmit src/hooks/useStatusHistory.ts 2>/dev/null
print_status "useStatusHistory Hook TypeScript"

# Check component files
npx tsc --noEmit src/components/status-history/StatusHistoryTable.tsx 2>/dev/null
print_status "StatusHistoryTable Component TypeScript"

npx tsc --noEmit src/components/status-history/StatusHistoryDashboard.tsx 2>/dev/null
print_status "StatusHistoryDashboard Component TypeScript"

echo ""
echo -e "${BLUE}6. Import dependencies yoxlaması...${NC}"

# Check if all required dependencies exist
REQUIRED_DEPS=(
    "@/integrations/supabase/client"
    "@/components/ui/card"
    "@/components/ui/badge"
    "@/components/ui/button"
    "@/components/ui/alert"
    "@/components/ui/skeleton"
    "@/components/ui/input"
    "@/components/ui/select"
    "lucide-react"
    "date-fns"
    "react"
)

for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -r "$dep" src/components/status-history/ >/dev/null 2>&1 || 
       grep -r "$dep" src/services/statusHistoryService.ts >/dev/null 2>&1 || 
       grep -r "$dep" src/hooks/useStatusHistory.ts >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $dep import mövcuddur${NC}"
    else
        echo -e "${YELLOW}⚠️  $dep import tapılmadı${NC}"
    fi
done

echo ""
echo -e "${BLUE}7. Deployment hazırlığı yoxlaması...${NC}"

# Check if all files are ready for deployment
FILES_TO_CHECK=(
    "supabase/migrations/20250617_fix_security_definer_view.sql"
    "src/services/statusHistoryService.ts"
    "src/hooks/useStatusHistory.ts"
    "src/components/status-history/StatusHistoryTable.tsx"
    "src/components/status-history/StatusHistoryDashboard.tsx"
    "src/components/status-history/index.ts"
)

all_files_exist=true
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
        all_files_exist=false
    fi
done

echo ""
echo -e "${BLUE}8. Migration script hazırlığı...${NC}"

# Check migration script content
if grep -q "DROP VIEW IF EXISTS public.status_history_view" "supabase/migrations/20250617_fix_security_definer_view.sql"; then
    echo -e "${GREEN}✅ View drop command mövcuddur${NC}"
else
    echo -e "${RED}❌ View drop command tapılmadı${NC}"
fi

if grep -q "CREATE OR REPLACE FUNCTION public.get_status_history_secure" "supabase/migrations/20250617_fix_security_definer_view.sql"; then
    echo -e "${GREEN}✅ Secure function yaradılması mövcuddur${NC}"
else
    echo -e "${RED}❌ Secure function yaradılması tapılmadı${NC}"
fi

if grep -q "SECURITY DEFINER" "supabase/migrations/20250617_fix_security_definer_view.sql"; then
    echo -e "${GREEN}✅ SECURITY DEFINER mövcuddur${NC}"
else
    echo -e "${RED}❌ SECURITY DEFINER tapılmadı${NC}"
fi

echo ""
echo -e "${BLUE}9. Final hazırlıq statusu...${NC}"

if [ "$all_files_exist" = true ]; then
    echo -e "${GREEN}🎉 Bütün fayllar hazırdır!${NC}"
    echo ""
    echo -e "${BLUE}Növbəti addımlar:${NC}"
    echo "1. Migration script-ini Supabase-də işə salın:"
    echo "   supabase/migrations/20250617_fix_security_definer_view.sql"
    echo ""
    echo "2. Security Advisor-ı yoxlayın:"
    echo "   - Supabase Dashboard → Advisors → Security Advisor"
    echo "   - 'Refresh' düyməsini basın"
    echo "   - Xəbərdarlığın aradan qalxdığını yoxlayın"
    echo ""
    echo "3. Yeni komponentləri test edin:"
    echo "   - StatusHistoryTable component-ini test edin"
    echo "   - StatusHistoryDashboard component-ini test edin"
    echo "   - useStatusHistory hook-unu test edin"
    echo ""
    echo "4. Production-a deploy edin:"
    echo "   - npm run build"
    echo "   - Test all functionality"
    echo "   - Deploy to production"
else
    echo -e "${RED}❌ Bəzi fayllar əksikdir, deployment-ə hazır deyil${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Status History System test tamamlandı!${NC}"
echo -e "${BLUE}Security Advisor problemi həll olunmalıdır.${NC}"
