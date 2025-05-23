import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { useToast } from '@/components/ui/use-toast';

export const useSchools = (sectorId?: string, regionId?: string) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('schools')
        .select('*')
        .order('name');

      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      if (regionId) {
        query = query.eq('region_id', regionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchools(data || []);
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: `Failed to fetch schools: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [sectorId, regionId]);

  return { schools, loading, error, refetch: fetchSchools };
};

export default useSchools;
