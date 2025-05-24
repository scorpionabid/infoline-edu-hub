
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface EnhancedSector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
  region_name?: string;
}

export const useSectorsStore = () => {
  const [sectors, setSectors] = useState<EnhancedSector[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSectors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select(`
          *,
          regions!inner(name)
        `)
        .order('name');
      
      if (error) throw error;
      
      const enhancedSectors = data?.map(sector => ({
        ...sector,
        region_name: sector.regions?.name
      })) || [];
      
      setSectors(enhancedSectors);
    } catch (error) {
      console.error('Error fetching sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  return {
    sectors,
    loading,
    refetch: fetchSectors
  };
};
