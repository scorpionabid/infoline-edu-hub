import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { transformRawColumnData } from '@/utils/columnOptionsParser';

/**
 * Assignment-specific categories hook
 * 
 * Bu hook kategorilaları assignment əsasında filtirləyir:
 * - 'all': Bütün məktəblərə aid ümumi kateqoriyalar
 * - 'sectors': Yalnız sektorlara aid xüsusi kateqoriyalar  
 * - 'both': Hər iki növ kateqoriya
 * 
 * SectorAdmin məlumat daxil etməsi üçün yalnız 'all' kateqoriyalar göstərilir.
 * Səktor məlumatları ayrı bölmədə 'sectors' kateqoriyalar ilə idarə olunur.
 */

type CategoryAssignment = 'all' | 'sectors' | 'both';

interface UseCategoriesWithAssignmentOptions {
  assignment?: CategoryAssignment;
  enabled?: boolean;
}

export const useCategoriesWithAssignment = (options: UseCategoriesWithAssignmentOptions = {}) => {
  const { assignment = 'all', enabled = true } = options;
  const user = useAuthStore(selectUser);

  return useQuery({
    queryKey: ['categories', 'assignment', assignment, user?.role],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select(`
          *,
          columns(*)
        `)
        .eq('status', 'active');

      // Assignment əsasında filtir tətbiq et
      if (assignment === 'all') {
        // Yalnız ümumi kateqoriyalar (məktəb məlumatları üçün)
        query = query.eq('assignment', 'all');
      } else if (assignment === 'sectors') {
        // Yalnız sektor kateqoriyaları
        query = query.eq('assignment', 'sectors');
      } else if (assignment === 'both') {
        // Həm 'all' həm də 'sectors' (admin səviyyəsi üçün)
        query = query.in('assignment', ['all', 'sectors']);
      }

      // Sıralama
      query = query.order('priority', { ascending: true, nullsFirst: false })
                  .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Categories fetch error:', error);
        throw error;
      }

      // Process and transform column data
      const processedData = (data || []).map((category: any) => ({
        ...category,
        // Filter only active columns for data entry (exclude deleted/inactive)
        columns: category.columns
          ?.filter((column: any) => column.status === 'active')
          ?.map((column: any) => transformRawColumnData(column)) || []
      }));

      console.log(`Categories fetched for assignment '${assignment}':`, processedData?.length || 0);
      return processedData;
    },
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000, // 5 dəqiqə
    cacheTime: 10 * 60 * 1000, // 10 dəqiqə
  });
};

/**
 * Məktəb məlumat daxil etməsi üçün kateqoriyalar
 * Yalnız assignment='all' kateqoriyalar
 */
export const useSchoolCategories = () => {
  return useCategoriesWithAssignment({ assignment: 'all' });
};

/**
 * Sektor məlumat daxil etməsi üçün kateqoriyalar  
 * Yalnız assignment='sectors' kateqoriyalar
 */
export const useSectorCategories = () => {
  return useCategoriesWithAssignment({ assignment: 'sectors' });
};

/**
 * Admin səviyyəsi üçün bütün kateqoriyalar
 * Həm 'all' həm də 'sectors' kateqoriyalar  
 */
export const useAllCategoriesForAdmin = () => {
  return useCategoriesWithAssignment({ assignment: 'both' });
};

export default useCategoriesWithAssignment;
