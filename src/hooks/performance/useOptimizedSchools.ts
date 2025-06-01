
import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebouncedValue } from './useDebouncedValue';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';

interface SchoolFilters {
  search: string;
  regionId?: string;
  sectorId?: string;
  status?: string;
}

export const useOptimizedSchools = (filters: SchoolFilters) => {
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  
  const {
    data: schools,
    isLoading,
    error,
    prefetchRelated,
  } = useOptimizedQuery({
    queryKey: ['schools', 'filtered'],
    queryFn: async () => {
      let query = supabase
        .from('schools')
        .select('*')
        .order('name');

      if (debouncedSearch) {
        query = query.ilike('name', `%${debouncedSearch}%`);
      }

      if (filters.regionId) {
        query = query.eq('region_id', filters.regionId);
      }

      if (filters.sectorId) {
        query = query.eq('sector_id', filters.sectorId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as School[];
    },
    dependencies: [debouncedSearch, filters.regionId, filters.sectorId, filters.status],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Prefetch related data
  useMemo(() => {
    if (schools && schools.length > 0) {
      // Prefetch regions and sectors
      prefetchRelated(['regions'], async () => {
        const { data } = await supabase.from('regions').select('*');
        return data;
      });

      prefetchRelated(['sectors'], async () => {
        const { data } = await supabase.from('sectors').select('*');
        return data;
      });
    }
  }, [schools, prefetchRelated]);

  const memoizedSchools = useMemo(() => {
    return schools || [];
  }, [schools]);

  return {
    schools: memoizedSchools,
    isLoading,
    error,
  };
};
