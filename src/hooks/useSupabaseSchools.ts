
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School, adaptSchoolData } from '@/types/school';
import { useRegions } from '@/hooks/useRegions';
import { useSectors } from '@/hooks/useSectors';
import { toast } from 'sonner';

export const useSupabaseSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { regions } = useRegions();
  const { sectors } = useSectors();

  const fetchSchools = useCallback(async (params?: { regionId?: string; sectorId?: string; status?: string }) => {
    setLoading(true);
    try {
      let query = supabase.from('schools').select('*');

      if (params?.regionId) {
        query = query.eq('region_id', params.regionId);
      }
      
      if (params?.sectorId) {
        query = query.eq('sector_id', params.sectorId);
      }
      
      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      const formattedSchools: School[] = data.map(school => {
        const region = regions.find(r => r.id === school.region_id);
        const sector = sectors.find(s => s.id === school.sector_id);
        
        return adaptSchoolData({
          ...school,
          region_name: region?.name || '',
          sector_name: sector?.name || ''
        });
      });

      setSchools(formattedSchools);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err);
      toast.error('Məktəbləri əldə edərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [regions, sectors]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return { schools, loading, error, fetchSchools };
};

export default useSupabaseSchools;
