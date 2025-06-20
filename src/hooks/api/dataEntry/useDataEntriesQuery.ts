import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDataEntries, saveDataEntries, updateDataEntriesStatus } from '@/services/api/dataEntry';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { DataEntry } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { dataEntryKeys } from '@/services/api/queryKeys';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

/**
 * Məlumat daxil etmələrini əldə etmək üçün hook parametrləri
 */
export interface UseDataEntriesQueryOptions {
  categoryId: string;
  schoolId: string;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

/**
 * Məlumat daxil etmələrini əldə etmək və idarə etmək üçün React Query əsaslı hook
 * 
 * Bu hook aşağıdakı funksionallığı təmin edir:
 * - Məlumat daxil etmələrini əldə etmək
 * - Məlumat daxil etmələrini saxlamaq
 * - Məlumat daxil etmələrinin statusunu yeniləmək
 * 
 * @param options Məlumat daxil etmələrini əldə etmək üçün parametrlər
 * @returns Məlumat daxil etmələri və əlaqədar funksiyalar
 */
export function useDataEntriesQuery({
  categoryId,
  schoolId,
  enabled = true,
  staleTime = 1000 * 60 * 5, // 5 dəqiqə
  refetchInterval = false
}: UseDataEntriesQueryOptions) {
  const { t } = useLanguage();
  const { handleError } = useErrorHandler('DataEntries');
  const queryClient = useQueryClient();
  const user = useAuthStore(selectUser); // İstifadəçi məlumatlarını əldə edirik
  
  // ID-lərin etibarlılığını yoxlayırıq
  const hasValidIds = !!categoryId && !!schoolId;
  
  // Sorğu açarını standartlaşdırılmış şəkildə hazırlayırıq
  const queryKey = dataEntryKeys.byCategoryAndSchool(categoryId, schoolId);
  
  // Məlumat daxil etmələrini əldə etmək üçün sorğu
  const query = useQuery({
    queryKey,
    queryFn: () => fetchDataEntries({ categoryId, schoolId }),
    enabled: enabled && hasValidIds,
    staleTime,
    refetchInterval,
    gcTime: 1000 * 60 * 10, // 10 dəqiqə
  });
  
  // Xəta baş verdikdə emal edirik
  if (query.error) {
    handleError(query.error, t('errorFetchingDataEntries'));
  }
  
  // Məlumat daxil etmələrini saxlamaq üçün mutasiya
  const saveMutation = useMutation({
    mutationFn: (entries: Partial<DataEntry>[]) => {
      console.log('useDataEntriesQuery - Full user object:', JSON.stringify(user, null, 2));
      console.log('useDataEntriesQuery - User ID:', user?.id);
      console.log('useDataEntriesQuery - User ID type:', typeof user?.id);
      
      // Debug auth state
      const authState = useAuthStore.getState();
      console.log('useDataEntriesQuery - Auth state user:', JSON.stringify(authState.user, null, 2));
      console.log('useDataEntriesQuery - Auth state session:', authState.session?.user?.id);
      
      // Use session user id if available, otherwise user.id
      const actualUserId = authState.session?.user?.id || user?.id;
      console.log('useDataEntriesQuery - Actual user ID to be used:', actualUserId);
      
      return saveDataEntries(entries, categoryId, schoolId, actualUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(t('dataEntriesSaved'));
    },
    onError: (error) => {
      handleError(error as Error, t('errorSavingDataEntries'));
    }
  });
  
  // Məlumat daxil etmələrinin statusunu yeniləmək üçün mutasiya
  const updateStatusMutation = useMutation({
    mutationFn: ({ entries, status }: { entries: DataEntry[]; status: string }) => 
      updateDataEntriesStatus(entries, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(t('statusUpdated'));
    },
    onError: (error) => {
      handleError(error as Error, t('errorUpdatingStatus'));
    }
  });
  
  // Hook nəticələrini qaytarırıq
  return {
    // Sorğu nəticələri
    entries: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Mutasiya funksiyaları
    saveEntries: saveMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    
    // Mutasiya vəziyyətləri
    isSaving: saveMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}

export default useDataEntriesQuery;
