
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface EnhancedRegion {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export const useRegionsStore = () => {
  const [regions, setRegions] = useState<EnhancedRegion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return {
    regions,
    loading,
    refetch: fetchRegions
  };
};
