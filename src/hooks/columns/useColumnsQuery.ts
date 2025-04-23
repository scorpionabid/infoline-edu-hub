
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/category';
import { useQuery } from '@tanstack/react-query';
import { useDataAccessControl } from '@/hooks/auth/useDataAccessControl';

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

  // RLS will handle the filtering based on user role and permissions
  const { data, error } = await query.order('order_index', { ascending: true });

  if (error) {
    console.error('Sütunları çəkmə xətası:', error);
    throw new Error(`Column fetch error: ${error.message}`);
  }

  return data;
};

export const useColumnsQuery = (categoryId?: string) => {
  const { 
    isSuperAdmin, 
    isRegionAdmin, 
    isSectorAdmin, 
    isSchoolAdmin,
    regionId,
    sectorId,
    schoolId
  } = useDataAccessControl();
  
  return useQuery({
    queryKey: ['columns', categoryId, { isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin, regionId, sectorId, schoolId }],
    queryFn: () => fetchColumns(
      categoryId,
      isSuperAdmin ? 'superadmin' : isRegionAdmin ? 'regionadmin' : isSectorAdmin ? 'sectoradmin' : 'schooladmin',
      regionId || undefined,
      sectorId || undefined,
      schoolId || undefined
    ),
    staleTime: 1000 * 60 * 5, // 5 dəqiqə
  });
};
