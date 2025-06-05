
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Tək kateqoriya məlumatını əldə etmək üçün hook parametrləri
 */
export interface UseCategoryQueryOptions {
  categoryId: string;
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Tək kateqoriya və onun sütunlarını əldə etmək üçün React Query əsaslı hook
 */
export function useCategoryQuery({
  categoryId,
  enabled = true,
  staleTime = 1000 * 60 * 5, // 5 dəqiqə
}: UseCategoryQueryOptions) {
  const { t } = useLanguage();
  const { handleError } = useErrorHandler('Category');
  
  // Sorğu açarını hazırlayırıq
  const queryKey = ['category', categoryId];
  
  // Kateqoriya və sütunlarını əldə etmək üçün sorğu
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<CategoryWithColumns | null> => {
      if (!categoryId) {
        console.warn('Category ID is required');
        return null;
      }

      console.log(`Fetching category with columns for ID: ${categoryId}`);
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns:columns(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            options,
            validation,
            default_value,
            order_index,
            status,
            category_id,
            created_at,
            updated_at
          )
        `)
        .eq('id', categoryId)
        .single();

      if (error) {
        console.error('Error fetching category:', error);
        throw error;
      }

      if (!data) {
        console.log('Category not found');
        return null;
      }

      // Sütunları order_index-ə görə sıralayırıq
      const sortedColumns = (data.columns || []).sort((a, b) => 
        (a.order_index || 0) - (b.order_index || 0)
      );

      const categoryWithColumns: CategoryWithColumns = {
        ...data,
        columns: sortedColumns
      };

      console.log(`Successfully fetched category with ${sortedColumns.length} columns`);
      return categoryWithColumns;
    },
    enabled: enabled && !!categoryId,
    staleTime,
    gcTime: 1000 * 60 * 10, // 10 dəqiqə
  });
  
  // Xəta baş verdikdə emal edirik
  if (query.error) {
    handleError(query.error, t('errorFetchingCategory'));
  }
  
  // Hook nəticələrini qaytarırıq
  return {
    // Sorğu nəticələri
    category: query.data || null,
    columns: query.data?.columns || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Hesablanmış dəyərlər
    hasColumns: (query.data?.columns || []).length > 0,
    columnCount: (query.data?.columns || []).length,
  };
}

export default useCategoryQuery;
