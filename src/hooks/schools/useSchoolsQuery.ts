
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';

// Query keys
export const SCHOOLS_QUERY_KEY = 'schools';

interface SchoolsQueryOptions {
  regionId?: string;
  sectorId?: string;
  status?: string;
  limit?: number;
  page?: number;
  enabled?: boolean;
}

// Optimized schools data fetching hook
export const useSchoolsQuery = (options: SchoolsQueryOptions = {}) => {
  const { regionId, sectorId, status, limit = 10, page = 1, enabled = true } = options;
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { userRole, regionId: userRegionId, sectorId: userSectorId } = usePermissions();
  
  // Apply role-based filtering
  const effectiveRegionId = userRole === 'regionadmin' ? userRegionId : regionId;
  const effectiveSectorId = userRole === 'sectoradmin' ? userSectorId : sectorId;
  
  // Generate a stable query key based on filters
  const queryKey = [
    SCHOOLS_QUERY_KEY,
    effectiveRegionId || 'all',
    effectiveSectorId || 'all',
    status || 'all',
    debouncedSearchTerm || 'all',
    page,
    limit
  ];
  
  // Calculate pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Fetch schools with support for filters and pagination
  const fetchSchools = async () => {
    try {
      let query = supabase
        .from('schools')
        .select('*', { count: 'exact' });
      
      // Apply filters based on role and selected filters
      if (effectiveRegionId) {
        query = query.eq('region_id', effectiveRegionId);
      }
      
      if (effectiveSectorId) {
        query = query.eq('sector_id', effectiveSectorId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (debouncedSearchTerm) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,principal_name.ilike.%${debouncedSearchTerm}%,address.ilike.%${debouncedSearchTerm}%`);
      }
      
      // Apply pagination
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        schools: data || [],
        totalCount: count || 0,
        pageCount: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error(t('errorFetchingSchools'), {
        description: t('pleaseTryAgainLater')
      });
      throw error;
    }
  };

  // Use React Query for caching and automatic refetching
  const {
    data = { schools: [], totalCount: 0, pageCount: 0 },
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchSchools,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Keep previous data while loading next page
  });

  const { schools, totalCount, pageCount } = data;

  // Prefetch next page for smoother pagination
  const prefetchNextPage = () => {
    if (page < pageCount) {
      queryClient.prefetchQuery({
        queryKey: [
          ...queryKey.slice(0, -2),
          page + 1,
          limit
        ],
        queryFn: fetchSchools,
      });
    }
  };

  return {
    schools,
    totalCount,
    pageCount,
    currentPage: page,
    isLoading,
    isError,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    prefetchNextPage
  };
};

export default useSchoolsQuery;
