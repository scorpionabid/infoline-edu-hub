
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Region } from '@/types/region';
import { toast } from 'sonner';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setRegions(data || []);
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      setError(err.message || 'Regionları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createRegion = async (regionData: Partial<Region>) => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select()
        .single();
      
      if (error) throw error;
      
      setRegions(prev => [...prev, data]);
      toast.success('Region uğurla yaradıldı');
      return { data, success: true };
    } catch (err: any) {
      console.error('Error creating region:', err);
      setError(err.message || 'Region yaradarkən xəta baş verdi');
      toast.error('Region yaradarkən xəta baş verdi', {
        description: err.message
      });
      return { error: err, success: false };
    } finally {
      setLoading(false);
    }
  };
  
  const updateRegion = async (id: string, regionData: Partial<Region>) => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setRegions(prev => prev.map(region => region.id === id ? data : region));
      toast.success('Region uğurla yeniləndi');
      return { data, success: true };
    } catch (err: any) {
      console.error('Error updating region:', err);
      setError(err.message || 'Region yeniləyərkən xəta baş verdi');
      toast.error('Region yeniləyərkən xəta baş verdi', {
        description: err.message
      });
      return { error: err, success: false };
    } finally {
      setLoading(false);
    }
  };
  
  const deleteRegion = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setRegions(prev => prev.filter(region => region.id !== id));
      toast.success('Region uğurla silindi');
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting region:', err);
      setError(err.message || 'Region silmərkən xəta baş verdi');
      toast.error('Region silmərkən xəta baş verdi', {
        description: err.message
      });
      return { error: err, success: false };
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return {
    regions,
    loading,
    error,
    fetchRegions,
    createRegion,
    updateRegion,
    deleteRegion
  };
};
