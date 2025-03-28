
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import { fetchRegions, addRegion, updateRegion, deleteRegion } from '@/services/regionService';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchRegionsData = async () => {
    setLoading(true);
    try {
      const data = await fetchRegions();
      setRegions(data);
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

  const addNewRegion = async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await addRegion(region);
      
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

  const updateExistingRegion = async (id: string, updates: Partial<Region>) => {
    try {
      const data = await updateRegion(id, updates);
      
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

  const deleteExistingRegion = async (id: string) => {
    try {
      await deleteRegion(id);
      
      setRegions(prev => prev.filter(region => region.id !== id));
      
      toast.success(t('regionDeleted'), {
        description: t('regionDeletedDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting region:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteRegion')
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchRegionsData();
  }, []);

  return {
    regions,
    loading,
    error,
    fetchRegions: fetchRegionsData,
    addRegion: addNewRegion,
    updateRegion: updateExistingRegion,
    deleteRegion: deleteExistingRegion
  };
};
