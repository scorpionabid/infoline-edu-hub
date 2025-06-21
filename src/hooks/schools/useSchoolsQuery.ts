
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/common/useDebounce';

interface School {
  id: string;
  name: string;
  sector_id: string;
  region_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UseSchoolsQueryOptions {
  searchTerm?: string;
  sectorId?: string;
  regionId?: string;
  status?: string;
  enabled?: boolean;
}

export const useSchoolsQuery = (options: UseSchoolsQueryOptions = {}) => {
  const {
    searchTerm = '',
    sectorId,
    regionId,
    status = 'active',
    enabled = true
  } = options;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: ['schools', debouncedSearchTerm, sectorId, regionId, status],
    queryFn: async (): Promise<School[]> => {
      let query = supabase
        .from('schools')
        .select('*');

      if (debouncedSearchTerm) {
        query = query.ilike('name', `%${debouncedSearchTerm}%`);
      }

      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      if (regionId) {
        query = query.eq('region_id', regionId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }

      return data || [];
    },
    enabled
  });
};
