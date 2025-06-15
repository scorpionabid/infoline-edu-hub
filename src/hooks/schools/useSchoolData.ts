
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import { ensureValidSchoolStatus } from '@/utils/buildFixes';

interface UseSchoolDataOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  regionId?: string;
  sectorId?: string;
  type?: string;
}

export const useSchoolData = (options: UseSchoolDataOptions = {}) => {
  return useQuery({
    queryKey: ['schools', options],
    queryFn: async (): Promise<School[]> => {
      let query = supabase
        .from('schools')
        .select('*')
        .order('name');

      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,principal_name.ilike.%${options.search}%`);
      }

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }

      if (options.regionId) {
        query = query.eq('region_id', options.regionId);
      }

      if (options.sectorId) {
        query = query.eq('sector_id', options.sectorId);
      }

      if (options.type) {
        query = query.eq('type', options.type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(school => ({
        ...school,
        status: ensureValidSchoolStatus(school.status || 'active')
      }));
    }
  });
};
