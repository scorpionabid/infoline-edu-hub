
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchSectors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sectors')
        .select('*')
        .order('name');
      
      if (regionId) {
        query = query.eq('region_id', regionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setSectors(data as Sector[]);
    } catch (err: any) {
      console.error('Error fetching sectors:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSectors')
      });
    } finally {
      setLoading(false);
    }
  };

  const addSector = async (sector: Omit<Sector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sector])
        .select()
        .single();

      if (error) throw error;
      
      setSectors(prev => [...prev, data as Sector]);
      toast.success(t('sectorAdded'), {
        description: t('sectorAddedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error adding sector:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddSector')
      });
      throw err;
    }
  };

  const updateSector = async (id: string, updates: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSectors(prev => prev.map(sector => 
        sector.id === id ? { ...sector, ...data } as Sector : sector
      ));
      
      toast.success(t('sectorUpdated'), {
        description: t('sectorUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error updating sector:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateSector')
      });
      throw err;
    }
  };

  const deleteSector = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSectors(prev => prev.filter(sector => sector.id !== id));
      
      toast.success(t('sectorDeleted'), {
        description: t('sectorDeletedDesc')
      });
    } catch (err: any) {
      console.error('Error deleting sector:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteSector')
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [regionId]);

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    addSector,
    updateSector,
    deleteSector
  };
};
