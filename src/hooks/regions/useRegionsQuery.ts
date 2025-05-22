
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useCallback } from 'react';
import { EnhancedRegion } from '@/types/region';

// Query keys
export const REGIONS_QUERY_KEY = 'regions';

interface RegionFilter {
  status?: string;
  search?: string;
}

export interface UseRegionsQueryResult {
  regions: EnhancedRegion[];
  filteredRegions: EnhancedRegion[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<EnhancedRegion[]>;
  prefetchRegion: (id: string) => Promise<void>;
  filter: RegionFilter;
  setFilter: (filter: Partial<RegionFilter>) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  resetFilters: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  pageSize: number;
}

// Enhanced regions data fetching hook
export const useRegionsQuery = (options = {}, initialPageSize = 10): UseRegionsQueryResult => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  // Local state for filtering and pagination
  const [filter, setFilter] = useState<RegionFilter>({ status: '', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = initialPageSize;

  // Unified filter setter
  const updateFilter = useCallback((newFilter: Partial<RegionFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);
  
  // Convenience filter setters
  const setSearchTerm = useCallback((term: string) => {
    updateFilter({ search: term });
  }, [updateFilter]);
  
  const setSelectedStatus = useCallback((status: string) => {
    updateFilter({ status });
  }, [updateFilter]);
  
  const resetFilters = useCallback(() => {
    setFilter({ status: '', search: '' });
    setCurrentPage(1);
  }, []);

  // Enhanced region fetching function
  const fetchRegions = async (): Promise<EnhancedRegion[]> => {
    try {
      // Fetch regions with all related data in a single query
      const { data: regions, error } = await supabase
        .from('regions')
        .select(`
          *,
          sectors:sectors(count),
          schools:schools(count),
          admin:profiles!regions_admin_id_fkey(id, full_name, email)
        `);
      
      if (error) throw error;
      
      // Process and enhance the data
      const enhancedRegions: EnhancedRegion[] = (regions || []).map(region => {
        const sectors_count = region.sectors?.[0]?.count || 0;
        const schools_count = region.schools?.[0]?.count || 0;
        
        return {
          ...region,
          sectors_count,
          schools_count,
          sector_count: sectors_count,
          school_count: schools_count,
          admin_name: region.admin?.full_name,
          adminName: region.admin?.full_name,
          adminEmail: region.admin?.email,
          admin: region.admin ? {
            id: region.admin.id,
            full_name: region.admin.full_name,
            email: region.admin.email
          } : undefined,
          // Calculate completion rate (example calculation)
          completion_rate: Math.floor(Math.random() * 100), // This should be replaced with actual calculation
          completionRate: Math.floor(Math.random() * 100) // For compatibility
        };
      });
      
      return enhancedRegions;
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
    refetch: queryRefetch
  } = useQuery({
    queryKey: [REGIONS_QUERY_KEY, filter],
    queryFn: fetchRegions,
    ...options,
  });

  // Wrap refetch in a function that returns the regions data
  const refetch = async (): Promise<EnhancedRegion[]> => {
    const result = await queryRefetch();
    return result.data || [];
  };

  // Apply filters to regions
  const filteredRegions = regions.filter(region => {
    const searchLower = filter.search?.toLowerCase() || '';
    const statusMatch = !filter.status || region.status === filter.status;
    const searchMatch = !searchLower || 
      region.name.toLowerCase().includes(searchLower) ||
      region.description?.toLowerCase().includes(searchLower) ||
      region.admin_name?.toLowerCase().includes(searchLower);
    
    return statusMatch && searchMatch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRegions.length / pageSize);
  const paginatedRegions = filteredRegions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Prefetch a single region by ID (useful for details views)
  const prefetchRegion = async (id: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: [REGIONS_QUERY_KEY, id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('regions')
            .select(`
              *,
              sectors:sectors(count),
              schools:schools(count),
              admin:profiles!regions_admin_id_fkey(id, full_name, email)
            `)
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
    regions: paginatedRegions, // Return paginated regions
    filteredRegions,           // All filtered regions (unpaginated)
    isLoading,
    isError,
    error,
    refetch,
    prefetchRegion,
    filter,
    setFilter: updateFilter,
    searchTerm: filter.search || '',
    setSearchTerm,
    selectedStatus: filter.status || '',
    setSelectedStatus,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize
  };
};

export default useRegionsQuery;
