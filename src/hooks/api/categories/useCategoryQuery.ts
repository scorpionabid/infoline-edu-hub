import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchCategoryWithColumns } from '@/services/api/categories';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { CategoryWithColumns } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { categoryKeys } from '@/services/api/queryKeys';

/**
 * Kateqoriya və onun sütunlarını əldə etmək üçün hook parametrləri
 */
export interface UseCategoryQueryOptions {
  categoryId: string;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

/**
 * Bir kateqoriyanı və onun sütunlarını əldə etmək üçün React Query əsaslı hook
 * 
 * @param options Kateqoriya əldə etmək üçün parametrlər
 * @returns Kateqoriya və sütunlar
 */
export function useCategoryQuery({
  categoryId,
  enabled = true,
  staleTime = 1000 * 60 * 5, // 5 dəqiqə
  refetchInterval = false
}: UseCategoryQueryOptions) {
  const { t } = useLanguage();
  const { handleError } = useErrorHandler('Category');
  
  // Sorğu açarını standartlaşdırılmış şəkildə hazırlayırıq
  const queryKey = categoryKeys.detail(categoryId);
  
  // Kateqoriya və sütunlarını əldə etmək üçün sorğu
  const query = useQuery({
    queryKey,
    queryFn: () => fetchCategoryWithColumns(categoryId),
    enabled: enabled && !!categoryId,
    staleTime,
    refetchInterval,
    gcTime: 1000 * 60 * 10, // 10 dəqiqə
  });
  
  // Xəta baş verdikdə emal edirik
  if (query.error) {
    handleError(query.error, t('errorFetchingCategoryDetails'));
  }
  
  return {
    // Sorğu nəticələri
    category: query.data as CategoryWithColumns | undefined,
    columns: (query.data as CategoryWithColumns | undefined)?.columns || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useCategoryQuery;
