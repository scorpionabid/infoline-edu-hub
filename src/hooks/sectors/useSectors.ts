
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sector, SectorStatus } from '@/types/sector';
import { ensureSectorStatus } from '@/utils/buildFixes';

export const useSectors = (options: { regionId?: string; status?: string } = {}) => {
  return useQuery({
    queryKey: ['sectors', options.regionId, options.status],
    queryFn: async (): Promise<Sector[]> => {
      let query = supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (options.regionId) {
        query = query.eq('region_id', options.regionId);
      }

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to ensure correct types
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        region_id: item.region_id,
        description: item.description || '',
        status: ensureSectorStatus(item.status || 'active') as SectorStatus,
        completion_rate: item.completion_rate || 0,
        admin_id: item.admin_id || '',
        admin_email: item.admin_email || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });
};
