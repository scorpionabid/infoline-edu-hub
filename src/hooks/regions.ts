
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/school';
import { useToast } from '@/components/ui/use-toast';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;
      setRegions(data || []);
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: `Failed to fetch regions: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return { regions, loading, error, refetch: fetchRegions };
};
