
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/category';
import { useQuery } from '@tanstack/react-query';
import { useDataAccessControl } from '@/hooks/auth/useDataAccessControl';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

const fetchColumns = async (
  categoryId?: string,
  userRole?: string,
  regionId?: string,
  sectorId?: string,
  schoolId?: string
): Promise<Column[]> => {
  console.log('Sütunları yükləyirəm:', {
    categoryId,
    userRole,
    regionId,
    sectorId,
    schoolId
  });

  let query = supabase.from('columns').select('*');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  // RLS will handle the filtering based on user role and permissions
  const { data, error } = await query.order('order_index', { ascending: true });

  if (error) {
    console.error('Sütunları yükləyərkən xəta baş verdi:', error);
    throw new Error(`Sütunları yükləyərkən xəta baş verdi: ${error.message}`);
  }

  console.log('Sütunlar uğurla yükləndi:', data?.length || 0, 'sütun tapıldı');
  
  // Sütun məlumatlarını düzgün formatda qaytaraq
  return (data || []).map(column => ({
    ...column,
    options: column.options ? 
      (typeof column.options === 'string' ? 
        JSON.parse(column.options) : column.options) : [],
    validation: column.validation ? 
      (typeof column.validation === 'string' ? 
        JSON.parse(column.validation) : column.validation) : {}
  }));
};

export const useColumnsQuery = (categoryId?: string) => {
  const { t } = useLanguage();
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
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Sütunları yükləyərkən xəta baş verdi:', error);
      toast.error(t('errorLoadingColumns'), { 
        description: error instanceof Error ? error.message : t('unexpectedError') 
      });
    }
  });
};

export default useColumnsQuery;
