
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setRegions(data as Region[]);
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadRegions')
      });
    } finally {
      setLoading(false);
    }
  };

  const addRegion = async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert([region])
        .select()
        .single();

      if (error) throw error;
      
      setRegions(prev => [...prev, data as Region]);
      toast.success(t('regionAdded'), {
        description: t('regionAddedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error adding region:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddRegion')
      });
      throw err;
    }
  };

  const updateRegion = async (id: string, updates: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRegions(prev => prev.map(region => 
        region.id === id ? { ...region, ...data } as Region : region
      ));
      
      toast.success(t('regionUpdated'), {
        description: t('regionUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error updating region:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateRegion')
      });
      throw err;
    }
  };

  const deleteRegion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRegions(prev => prev.filter(region => region.id !== id));
      
      toast.success(t('regionDeleted'), {
        description: t('regionDeletedDesc')
      });
    } catch (err: any) {
      console.error('Error deleting region:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteRegion')
      });
      throw err;
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
    addRegion,
    updateRegion,
    deleteRegion
  };
};
