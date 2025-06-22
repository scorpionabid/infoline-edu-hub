#!/bin/bash

echo "🔧 İnfoLine Link Funktionallığı Test Script"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}1. Proyekt qurulumunu yoxlamaq...${NC}"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules mövcuddur${NC}"
else
    echo -e "${RED}✗ node_modules tapılmadı - npm install işlədin${NC}"
    npm install
fi

echo ""
echo -e "${YELLOW}2. TypeScript tipləri yoxlamaq...${NC}"

# Check TypeScript
npx tsc --noEmit --skipLibCheck 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript tipləri düzgündür${NC}"
else
    echo -e "${RED}✗ TypeScript xətaları mövcuddur${NC}"
    echo "Ətraflı məlumat üçün: npx tsc --noEmit"
fi

echo ""
echo -e "${YELLOW}3. Lazım olan faylları yoxlamaq...${NC}"

# Check required files
FILES=(
    "src/components/schools/SchoolLinksDialog.tsx"
    "src/services/linkService.ts"
    "src/types/link.ts"
    "supabase/migrations/20250622_school_links_enhancement.sql"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file tapılmadı${NC}"
    fi
done

echo ""
echo -e "${YELLOW}4. Təkrarçılıq yoxlaması...${NC}"

# Check for duplicate components that should be removed
OLD_FILES=(
    "src/components/schools/school-links/"
    "src/components/link-management/LinkCreationDialog.tsx"
    "src/types/school-link.ts"
)

DUPLICATES_FOUND=false

for file in "${OLD_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${RED}✗ Təkrar fayl tapıldı: $file${NC}"
        DUPLICATES_FOUND=true
    fi
done

if [ "$DUPLICATES_FOUND" = false ]; then
    echo -e "${GREEN}✓ Təkrarçılıq tapılmadı${NC}"
fi

echo ""
echo -e "${YELLOW}5. Supabase konfiqurasiya yoxlaması...${NC}"

if [ -f ".env.local" ]; then
    if grep -q "VITE_SUPABASE_URL" .env.local && grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓ Supabase environment variables mövcuddur${NC}"
    else
        echo -e "${RED}✗ Supabase environment variables tapılmadı${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local faylı tapılmadı${NC}"
fi

echo ""
echo -e "${YELLOW}6. Development serverin işləməsini yoxlamaq...${NC}"

# Check if dev server can start (just test, don't actually start)
echo "Dev server test üçün package.json yoxlanır..."

if grep -q '"dev"' package.json; then
    echo -e "${GREEN}✓ Dev script mövcuddur${NC}"
    echo "Serveri işə salmaq üçün: npm run dev"
else
    echo -e "${RED}✗ Dev script tapılmadı${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Test tamamlandı!${NC}"
echo ""
echo -e "${YELLOW}Növbəti addımlar:${NC}"
echo "1. npm run dev - development serveri işə sal"
echo "2. Browser-də localhost:5173-ə keç"
echo "3. Məktəblər səhifəsinə get"
echo "4. Məktəb üçün 'Linklər' düyməsinə bas"
echo "5. Yeni link əlavə etməyi sına"
echo ""
echo -e "${YELLOW}Supabase migration üçün:${NC}"
echo "supabase db push"
echo ""
