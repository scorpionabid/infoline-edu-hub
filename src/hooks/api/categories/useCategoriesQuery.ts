import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/services/api/categories';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { categoryKeys } from '@/services/api/queryKeys';

/**
 * Kateqoriyaları əldə etmək üçün hook parametrləri
 */
export interface UseCategoriesOptions {
  status?: string;
  search?: string;
  assignment?: string;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

/**
 * Kateqoriyaları əldə etmək və idarə etmək üçün React Query əsaslı hook
 * 
 * Bu hook aşağıdakı funksionallığı təmin edir:
 * - Kateqoriyaları əldə etmək
 * - Kateqoriya yaratmaq
 * - Kateqoriya yeniləmək
 * - Kateqoriya silmək
 * 
 * @param options Kateqoriyaları əldə etmək üçün parametrlər
 * @returns Kateqoriyalar və əlaqədar funksiyalar
 */
export function useCategoriesQuery(options?: UseCategoriesOptions) {
  const { t } = useLanguage();
  const { handleError } = useErrorHandler('Categories');
  const queryClient = useQueryClient();
  
  // Parametrləri hazırlayırıq
  const { 
    enabled = true, 
    staleTime = 1000 * 60 * 5, // 5 dəqiqə
    refetchInterval = false,
    ...queryOptions
  } = options || {};
  
  // Sorğu açarını standartlaşdırılmış şəkildə hazırlayırıq
  const queryKey = categoryKeys.list(queryOptions);
  
  // Kateqoriyaları əldə etmək üçün sorğu
  const query = useQuery({
    queryKey,
    queryFn: () => fetchCategories(queryOptions),
    enabled,
    staleTime,
    refetchInterval,
    gcTime: 1000 * 60 * 10, // 10 dəqiqə
  });
  
  // Xəta baş verdikdə emal edirik
  if (query.error) {
    handleError(query.error, t('errorFetchingCategories'));
  }
  
  // Kateqoriya yaratmaq üçün mutasiya
  const createMutation = useMutation({
    mutationFn: (newCategory: Partial<Category>) => createCategory(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => handleError(error as Error, t('errorCreatingCategory'))
  });
  
  // Kateqoriya yeniləmək üçün mutasiya
  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: string, category: Partial<Category> }) => 
      updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => handleError(error as Error, t('errorUpdatingCategory'))
  });
  
  // Kateqoriya silmək üçün mutasiya
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => handleError(error as Error, t('errorDeletingCategory'))
  });
  
  // Hook nəticələrini qaytarırıq
  return {
    // Sorğu nəticələri
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Mutasiya funksiyaları
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    
    // Mutasiya vəziyyətləri
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export default useCategoriesQuery;
