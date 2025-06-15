
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sectors')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (regionId) {
        query = query.eq('region_id', regionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSectors(data || []);
    } catch (err: any) {
      console.error('Error fetching sectors:', err);
      setError(err.message);
      toast.error('Sektorlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [regionId]);

  return {
    sectors,
    loading,
    error,
    refetch: fetchSectors
  };
};

export default useSectors;
