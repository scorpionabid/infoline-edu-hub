import { useState, useEffect } from 'react';
import { supabase, supabaseFetch } from '@/integrations/supabase/client';
import { Region } from '@/types/supabase';
import { useAuth } from '@/context/auth';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchRegions = async () => {
      if (!session) {
        console.warn('Session does not exist, regions cannot be loaded');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await supabaseFetch(async () => {
          const { data, error } = await supabase
            .from('regions')
            .select('*')
            .order('name');

          if (error) throw error;
          return data;
        });

        console.log(`${result?.length || 0} regions loaded`);
        setRegions(result || []);
      } catch (err: any) {
        console.error('Error loading regions:', err);
        setError(new Error(err.message || 'Failed to load regions'));
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [session]);

  return { regions, loading, error };
};

export default useRegions;
