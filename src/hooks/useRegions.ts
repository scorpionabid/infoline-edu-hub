
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('regions').select('*');
      
      // Əgər istifadəçi regionadmin-dirsə, yalnız öz regionunu görsün
      if (user?.role === 'regionadmin' && user?.regionId) {
        query = query.eq('id', user.regionId);
      }
      
      // Sıralama əlavə et
      query = query.order('name');
      
      const { data, error } = await query;

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
  }, [t, user]);

  const addRegion = useCallback(async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
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
  }, [t]);

  const updateRegion = useCallback(async (id: string, updates: Partial<Region>) => {
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
  }, [t]);

  const deleteRegion = useCallback(async (id: string) => {
    try {
      // Əvvəlcə regionun əlaqəli olduğu sektorlar və məktəblər yoxlanılır
      const { data: relatedSectors } = await supabase
        .from('sectors')
        .select('id')
        .eq('region_id', id);
        
      if (relatedSectors && relatedSectors.length > 0) {
        throw new Error(t('cannotDeleteRegionWithSectors'));
      }
      
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
        description: err.message || t('couldNotDeleteRegion')
      });
      throw err;
    }
  }, [t]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

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
