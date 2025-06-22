#!/bin/bash

echo "🚨 İnfoLine School Links Emergency Fix"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}1. Supabase connection yoxlama...${NC}"

# Check if supabase CLI is available
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI mövcuddur${NC}"
    
    # Check supabase status
    echo -e "${BLUE}Supabase status yoxlanır...${NC}"
    supabase status 2>/dev/null || echo -e "${YELLOW}⚠ Local Supabase işləmir, remote-a bağlanır${NC}"
    
    echo ""
    echo -e "${YELLOW}2. Migration tətbiq etmə...${NC}"
    
    # Apply the emergency fix
    if supabase db push; then
        echo -e "${GREEN}✓ Migration uğurla tətbiq edildi${NC}"
    else
        echo -e "${RED}✗ Migration xətası${NC}"
        echo -e "${YELLOW}Manual tətbiq üçün:${NC}"
        echo "1. https://supabase.com/dashboard açın"
        echo "2. SQL Editor-ə keçin"
        echo "3. Bu fayl məzmununu icra edin: supabase/migrations/20250622_emergency_school_links_fix.sql"
    fi
    
else
    echo -e "${RED}✗ Supabase CLI tapılmadı${NC}"
    echo -e "${YELLOW}Manual həll:${NC}"
    echo "1. https://supabase.com/dashboard açın"
    echo "2. SQL Editor-ə keçin"
    echo "3. Bu fayl məzmununu icra edin:"
    echo "   supabase/migrations/20250622_emergency_school_links_fix.sql"
fi

echo ""
echo -e "${YELLOW}3. Test edilməsi lazım olan funksionallıq:${NC}"
echo "• Browser-də F5 (refresh) basın"
echo "• Məktəblər səhifəsinə keçin"
echo "• Məktəb üçün 'Linklər' düyməsinə basın"
echo "• Yeni link əlavə etməyi sınayın"

echo ""
echo -e "${YELLOW}4. Əgər hələ də xəta varsa:${NC}"
echo "• Chrome DevTools Console-u yoxlayın"
echo "• Network tab-da 'school_links' API çağırışına baxın"
echo "• Response-da dəqiq xəta mesajını tapın"

echo ""
echo -e "${GREEN}✅ Emergency fix tamamlandı!${NC}"
echo -e "${BLUE}📞 Dəstək lazımdırsa: Console-dakı xətaların screenshot-unu göndərin${NC}"
