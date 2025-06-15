
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

      setSectors(data || []);
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
