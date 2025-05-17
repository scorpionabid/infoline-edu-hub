
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/school';
import { useToast } from '@/components/ui/use-toast';

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchSectors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (regionId) {
        query = query.eq('region_id', regionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSectors(data || []);
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: `Failed to fetch sectors: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [regionId]);

  return { sectors, loading, error, refetch: fetchSectors };
};
