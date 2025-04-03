
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
}

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;

        setRegions(data || []);
      } catch (err: any) {
        console.error('Error fetching regions:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return { regions, loading, error };
};
