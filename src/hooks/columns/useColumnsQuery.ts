
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { useQuery } from '@tanstack/react-query';
import { columnAdapter } from '@/utils/columnAdapter';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/auth/usePermissions';

// Sütunları çəkmək üçün sorğu funksiyası
const fetchColumns = async (
  categoryId?: string,
  userRole?: string,
  regionId?: string,
  sectorId?: string,
  schoolId?: string
): Promise<Column[]> => {
  let query = supabase.from('columns').select('*');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  // İstifadəçi hüquqlarına görə nəticələri filtrlə
  // SuperAdmin bütün məlumatları görə bilər, digər adminlər öz bölgələri üçün
  // Bu filtrləmə əlavə olaraq RLS-də də tətbiq olunmalıdır DB səviyyəsində
  
  const { data, error } = await query.order('order_index', { ascending: true });

  if (error) {
    console.error('Sütunları çəkmə xətası:', error);
    throw new Error(`Column fetch error: ${error.message}`);
  }

  // Sütunları adaptasiya et
  return data.map(columnAdapter.adaptSupabaseToColumn);
};

export const useColumnsQuery = (categoryId?: string) => {
  const { user } = useAuth();
  const { userRole, regionId, sectorId } = usePermissions();
  
  return useQuery({
    queryKey: ['columns', categoryId, userRole, regionId, sectorId],
    queryFn: () => fetchColumns(
      categoryId, 
      userRole, 
      regionId, 
      sectorId, 
      user?.schoolId
    ),
    staleTime: 1000 * 60 * 5, // 5 dəqiqə
  });
};
