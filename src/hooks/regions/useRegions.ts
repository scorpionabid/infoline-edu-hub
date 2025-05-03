
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/region';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setRegions(data || []);
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      setError(err.message || 'Error loading regions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const addRegion = async (regionData: Omit<Region, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert([{ 
          ...regionData, 
          created_at: new Date().toISOString() 
        }])
        .single();
      
      if (error) throw error;
      
      // Refresh regions list
      await fetchRegions();
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding region:', err);
      return { success: false, error: err.message || 'Error adding region' };
    }
  };

  const updateRegion = async (id: string, regionData: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update({
          ...regionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh regions list
      await fetchRegions();
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating region:', err);
      return { success: false, error: err.message || 'Error updating region' };
    }
  };

  const deleteRegion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh regions list
      await fetchRegions();
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting region:', err);
      return { success: false, error: err.message || 'Error deleting region' };
    }
  };

  return {
    regions,
    loading,
    error,
    fetchRegions,
    addRegion,
    updateRegion,
    deleteRegion
  };
};
