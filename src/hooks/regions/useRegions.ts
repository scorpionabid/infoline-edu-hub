
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export interface Region {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id: string | null;
  admin_email: string | null;
}

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setRegions(data || []);
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      setError(err.message || t('errorFetchingRegions'));
      toast.error(t('errorFetchingRegions'));
    } finally {
      setLoading(false);
    }
  };

  const createRegion = async (regionData: Partial<Region>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select()
        .single();
      
      if (error) throw error;
      
      setRegions(prev => [...prev, data]);
      toast.success(t('regionCreatedSuccessfully'));
      
      return data;
    } catch (err: any) {
      console.error('Error creating region:', err);
      toast.error(t('errorCreatingRegion'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRegion = async (id: string, regionData: Partial<Region>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setRegions(prev => prev.map(region => (region.id === id ? data : region)));
      toast.success(t('regionUpdatedSuccessfully'));
      
      return data;
    } catch (err: any) {
      console.error('Error updating region:', err);
      toast.error(t('errorUpdatingRegion'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRegion = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setRegions(prev => prev.filter(region => region.id !== id));
      toast.success(t('regionDeletedSuccessfully'));
      
      return true;
    } catch (err: any) {
      console.error('Error deleting region:', err);
      toast.error(t('errorDeletingRegion'));
      throw err;
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
    error,
    fetchRegions,
    createRegion,
    updateRegion,
    deleteRegion
  };
};
