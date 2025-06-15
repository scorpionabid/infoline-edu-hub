
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ensureSectorStatus } from '@/utils/buildFixes';

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status: 'active' | 'inactive';
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export const useSectors = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSectors = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (error) throw error;

      // Ensure proper type casting
      const typedSectors: Sector[] = (data || []).map(sector => ({
        ...sector,
        status: ensureSectorStatus(sector.status)
      }));

      setSectors(typedSectors);
    } catch (err: any) {
      console.error('Error fetching sectors:', err);
      setError(err.message);
      toast.error('Sektorlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return {
    sectors,
    loading,
    error,
    refetch: fetchSectors
  };
};
