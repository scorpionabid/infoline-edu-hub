
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

// Query keys
export const REGIONS_QUERY_KEY = 'regions';

// Optimized regions data fetching hook
export const useRegionsQuery = (options = {}) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  // Fetch regions with support for status filter
  const fetchRegions = async (status?: string) => {
    try {
      let query = supabase.from('regions').select('*');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error(t('errorFetchingRegions'), {
        description: t('pleaseTryAgainLater')
      });
      throw error;
    }
  };

  // Use React Query for caching and automatic refetching
  const {
    data: regions = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: [REGIONS_QUERY_KEY],
    queryFn: () => fetchRegions(),
    ...options,
  });

  // Prefetch a single region by ID (useful for details views)
  const prefetchRegion = async (id: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: [REGIONS_QUERY_KEY, id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('regions')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          return data;
        },
      });
    } catch (error) {
      console.error('Error prefetching region:', error);
    }
  };

  return {
    regions,
    isLoading,
    isError,
    error,
    refetch,
    prefetchRegion
  };
};

export default useRegionsQuery;
