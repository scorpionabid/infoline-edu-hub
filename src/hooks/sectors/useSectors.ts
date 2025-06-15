
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';
import { ensureSectorStatus } from '@/utils/buildFixes';

export interface SectorsStore {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  fetchSectors: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useSectors = (): SectorsStore => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSectors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('sectors')
        .select('*')
        .order('name');
        
      if (fetchError) throw fetchError;
      
      const typedSectors: Sector[] = (data || []).map(sector => ({
        ...sector,
        status: ensureSectorStatus(sector.status)
      }));
      
      setSectors(typedSectors);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching sectors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchSectors();
  }, [fetchSectors]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    refetch
  };
};

export const useSectorsStore = useSectors;
