
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useDataAccessControl } from '@/hooks/auth/useDataAccessControl';

/**
 * Verilmiş kateqoriya üçün sütunları əldə etmək üçün hook
 * @param categoryId Kateqoriya ID-si (optional)
 */
export const useColumnQuery = (categoryId?: string) => {
  const { t } = useLanguage();
  const { 
    isSuperAdmin, isRegionAdmin, 
    regionId, sectorId, schoolId 
  } = useDataAccessControl();

  // Sütunları əldə etmək üçün funksiya
  const fetchColumns = async (): Promise<Column[]> => {
    console.log('Sütunları əldə edirəm:', { categoryId, regionId, sectorId, schoolId });
    
    let query = supabase.from('columns').select('*');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    query = query.order('order_index', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Sütunları əldə edərkən xəta:', error);
      throw new Error(`Sütunları əldə edərkən xəta: ${error.message}`);
    }
    
    console.log(`${data?.length || 0} sütun əldə edildi`);
    
    return (data || []).map(column => ({
      ...column,
      options: column.options ? 
        (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : [],
      validation: column.validation ? 
        (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : {}
    })) as Column[];
  };

  // Sorğu açarı
  const queryKey = ['columns', categoryId, { 
    isSuperAdmin, isRegionAdmin, regionId, sectorId, schoolId 
  }];
  
  // React Query hook istifadəsi
  return useQuery({
    queryKey,
    queryFn: fetchColumns,
    staleTime: 1000 * 60 * 5, // 5 dəqiqə
    gcTime: 1000 * 60 * 10, // 10 dəqiqə
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error('Sütunlar əldə edilərkən xəta:', err);
      toast.error(t('errorLoadingColumns'), {
        description: err instanceof Error ? err.message : t('unexpectedError')
      });
    }
  });
};

export default useColumnQuery;
