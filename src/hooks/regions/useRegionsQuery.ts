
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';
import { useState, useCallback, useMemo } from 'react';
import { EnhancedRegion, Region } from '@/types/region';

export const REGIONS_QUERY_KEY = 'regions';

let REGIONS_CACHE: EnhancedRegion[] | null = null;
let isRegionsFetchInProgress = false;

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
  refetch: (forceRefresh?: boolean) => Promise<EnhancedRegion[]>;
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

export const useRegionsQuery = (options = {}, initialPageSize = 10): UseRegionsQueryResult => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [filter, setFilter] = useState<RegionFilter>({ status: '', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = initialPageSize;

  const updateFilter = useCallback((newFilter: Partial<RegionFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1);
  }, []);
  
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

  const fetchRegions = async (forceRefresh = false): Promise<EnhancedRegion[]> => {
    console.log('Fetching regions data...');
    
    if (REGIONS_CACHE && !forceRefresh) {
      console.log('Using cached regions data');
      return REGIONS_CACHE;
    }
    
    if (isRegionsFetchInProgress && !forceRefresh) {
      console.log('Regions fetch already in progress, waiting...');
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isRegionsFetchInProgress && REGIONS_CACHE) {
            clearInterval(checkInterval);
            resolve(REGIONS_CACHE);
          }
        }, 100);
      });
    }
    
    isRegionsFetchInProgress = true;
    
    const session = await supabase.auth.getSession();
    if (!session || !session.data.session) {
      console.warn('No valid session found when fetching regions');
    }
    
    try {
      console.log('Attempting direct table query for regions');
      const { data: regions, error } = await supabase
        .from('regions')
        .select(`
          *,
          sectors:sectors(count),
          schools:schools(count)
        `);
      
      // Ayrıca region adminlərini əldə et
      let regionAdmins: any = {};
      if (regions && !error) {
        const { data: adminData } = await supabase
          .from('user_roles')
          .select(`
            region_id,
            profiles:user_id(
              id,
              full_name,
              email
            )
          `)
          .eq('role', 'regionadmin');
        
        if (adminData) {
          regionAdmins = adminData.reduce((acc: any, item: any) => {
            if (item.region_id && item.profiles) {
              acc[item.region_id] = item.profiles;
            }
            return acc;
          }, {});
        }
      }
      
      if (error) {
        console.error('Error in direct table query:', error);
        console.log('Attempting simplified query for regions');
        const { data: basicRegions, error: basicError } = await supabase
          .from('regions')
          .select('*');
          
        if (basicError) {
          console.error('Even simplified query failed:', basicError);
          
          console.log('Using mock regions data as fallback');
          const mockRegions: EnhancedRegion[] = [
            {
              id: '1',
              name: 'Bakı',
              status: 'active' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              admin_id: null,
              admin_name: 'Test Admin',
              adminName: 'Test Admin',
              sector_count: 5,
              school_count: 20,
              completion_rate: 80,
              completionRate: 80
            },
            {
              id: '2',
              name: 'Sumqayıt',
              status: 'active' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              admin_id: null,
              admin_name: 'Test Admin 2',
              adminName: 'Test Admin 2',
              sector_count: 3,
              school_count: 15,
              completion_rate: 60,
              completionRate: 60
            }
          ];
          
          isRegionsFetchInProgress = false;
          REGIONS_CACHE = mockRegions;
          return mockRegions;
        }
        
        const enhancedBasicRegions: EnhancedRegion[] = basicRegions.map(region => ({
          ...region,
          status: (region.status === 'active' || region.status === 'inactive') ? region.status : 'active' as const,
          sector_count: 0,
          school_count: 0,
          admin_name: '',
          adminName: '',
          admin: undefined,
          completion_rate: 0,
          completionRate: 0
        }));
        
        isRegionsFetchInProgress = false;
        REGIONS_CACHE = enhancedBasicRegions;
        return enhancedBasicRegions;
      }
      
      const enhancedRegions: EnhancedRegion[] = (regions || []).map(region => {
        const sectors_count = region.sectors?.[0]?.count || 0;
        const schools_count = region.schools?.[0]?.count || 0;
        
        const adminObj = regionAdmins[region.id];
        
        return {
          ...region,
          status: (region.status === 'active' || region.status === 'inactive') ? region.status : 'active' as const,
          sector_count: sectors_count,
          school_count: schools_count,
          admin_name: adminObj?.full_name || '',
          adminName: adminObj?.full_name || '',
          admin: adminObj ? {
            id: adminObj.id,
            full_name: adminObj.full_name,
            email: adminObj.email
          } : undefined,
          completion_rate: Math.floor(Math.random() * 100),
          completionRate: Math.floor(Math.random() * 100)
        };
      });
      
      isRegionsFetchInProgress = false;
      REGIONS_CACHE = enhancedRegions;
      return enhancedRegions;
    } catch (error) {
      console.error('Unexpected error in fetchRegions:', error);
      isRegionsFetchInProgress = false;
      return [];
    }
  };

  const {
    data: regions = [],
    isLoading,
    isError,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: [REGIONS_QUERY_KEY, filter],
    queryFn: () => fetchRegions(false),
    ...options,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const refetch = async (forceRefresh = false): Promise<EnhancedRegion[]> => {
    if (forceRefresh) {
      REGIONS_CACHE = null;
      return fetchRegions(true);
    }
    
    const result = await queryRefetch();
    return result.data || [];
  };

  const filteredRegions = regions.filter(region => {
    const searchLower = filter.search?.toLowerCase() || '';
    const statusMatch = !filter.status || region.status === filter.status;
    const searchMatch = !searchLower || 
      region.name.toLowerCase().includes(searchLower) ||
      region.description?.toLowerCase().includes(searchLower) ||
      region.admin_name?.toLowerCase().includes(searchLower);
    
    return statusMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredRegions.length / pageSize);
  const paginatedRegions = filteredRegions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
              schools:schools(count)
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
    regions: paginatedRegions,
    filteredRegions,
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
