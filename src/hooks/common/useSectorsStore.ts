
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedSector {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_email?: string;
  admin_id?: string;
  region_id: string;
  schoolCount?: number;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export const useSectorsStore = () => {
  const [sectors, setSectors] = useState<EnhancedSector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('*')
          .order('name');

        if (error) throw error;
        setSectors(data as EnhancedSector[] || []);
      } catch (err) {
        console.error('Error fetching sectors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  return {
    sectors,
    loading
  };
};
