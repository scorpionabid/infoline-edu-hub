
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';

// Query keys
export const SECTORS_QUERY_KEY = 'sectors';

interface SectorsQueryOptions {
  regionId?: string;
  status?: string;
  enabled?: boolean;
}

// Optimized sectors data fetching hook
export const useSectorsQuery = (options: SectorsQueryOptions = {}) => {
  const { regionId, status, enabled = true } = options;
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Generate a stable query key based on filters
  const queryKey = [
    SECTORS_QUERY_KEY,
    regionId || 'all',
    status || 'all',
    debouncedSearchTerm || 'all',
  ];
  
  // Fetch sectors with support for filters
  const fetchSectors = async () => {
    try {
      let query = supabase.from('sectors').select('*');
      
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (debouncedSearchTerm) {
        query = query.ilike('name', `%${debouncedSearchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching sectors:', error);
      toast.error(t('errorFetchingSectors'), {
        description: t('pleaseTryAgainLater')
      });
      throw error;
    }
  };

  // Use React Query for caching and automatic refetching
  const {
    data: sectors = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchSectors,
    enabled: enabled && (regionId !== undefined || !regionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prefetch a single sector by ID (useful for details views)
  const prefetchSector = async (id: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: [SECTORS_QUERY_KEY, id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('sectors')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          return data;
        },
      });
    } catch (error) {
      console.error('Error prefetching sector:', error);
    }
  };

  return {
    sectors,
    isLoading,
    isError,
    error,
    refetch,
    prefetchSector,
    searchTerm,
    setSearchTerm
  };
};

export default useSectorsQuery;
