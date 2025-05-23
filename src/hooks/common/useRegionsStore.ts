
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedRegion {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_email?: string;
  admin_id?: string;
  sectorCount?: number;
  schoolCount?: number;
  created_at: string;
  updated_at: string;
}

export const useRegionsStore = () => {
  const [regions, setRegions] = useState<EnhancedRegion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('name');

        if (error) throw error;
        setRegions(data as EnhancedRegion[] || []);
      } catch (err) {
        console.error('Error fetching regions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return {
    regions,
    loading
  };
};
