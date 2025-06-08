
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchSectorDataEntries, 
  saveSectorDataEntries, 
  updateSectorDataEntriesStatus,
  SectorDataEntry 
} from '@/services/api/sectorDataEntry';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { sectorDataEntryKeys } from '@/services/api/sectorQueryKeys';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export interface UseSectorDataEntriesQueryOptions {
  categoryId: string;
  sectorId: string;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

export function useSectorDataEntriesQuery({
  categoryId,
  sectorId,
  enabled = true,
  staleTime = 1000 * 60 * 5, // 5 minutes
  refetchInterval = false
}: UseSectorDataEntriesQueryOptions) {
  const { t } = useLanguage();
  const { handleError } = useErrorHandler('SectorDataEntries');
  const queryClient = useQueryClient();
  const user = useAuthStore(selectUser);
  
  // Check if IDs are valid
  const hasValidIds = !!categoryId && !!sectorId;
  
  // Prepare query key
  const queryKey = sectorDataEntryKeys.byCategoryAndSector(categoryId, sectorId);
  
  // Query for fetching sector data entries
  const query = useQuery({
    queryKey,
    queryFn: () => fetchSectorDataEntries({ categoryId, sectorId }),
    enabled: enabled && hasValidIds,
    staleTime,
    refetchInterval,
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
  
  // Handle errors
  if (query.error) {
    handleError(query.error, t('errorFetchingSectorDataEntries') || 'Error fetching sector data entries');
  }
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (entries: Partial<SectorDataEntry>[]) => {
      const actualUserId = user?.id;
      console.log('useSectorDataEntriesQuery - Saving with user ID:', actualUserId);
      
      return saveSectorDataEntries(entries, categoryId, sectorId, actualUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(t('sectorDataEntriesSaved') || 'Sector data entries saved');
    },
    onError: (error) => {
      handleError(error as Error, t('errorSavingSectorDataEntries') || 'Error saving sector data entries');
    }
  });
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ entries, status }: { entries: SectorDataEntry[]; status: string }) => 
      updateSectorDataEntriesStatus(entries, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(t('statusUpdated') || 'Status updated');
    },
    onError: (error) => {
      handleError(error as Error, t('errorUpdatingStatus') || 'Error updating status');
    }
  });
  
  return {
    // Query results
    entries: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Mutation functions
    saveEntries: saveMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    
    // Mutation states
    isSaving: saveMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}

export default useSectorDataEntriesQuery;
