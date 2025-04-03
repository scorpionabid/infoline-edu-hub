
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { useLanguage } from '@/context/LanguageContext';

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchSectors = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('sectors').select('*');
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      setSectors(data || []);
    } catch (error: any) {
      setError(error);
      toast.error(t('failedToFetchSectors'), {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [regionId, t]);

  const addSectors = async (sectorsData: Omit<Sector, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      // Burada Sector tipinin tələblərinə uyğun obyektlər yaradırıq
      const formattedSectors = sectorsData.map(sector => ({
        name: sector.name,
        region_id: sector.region_id,
        description: sector.description,
        status: sector.status || 'active',
        admin_email: sector.admin_email
      }));

      const { data, error } = await supabase
        .from('sectors')
        .insert(formattedSectors);

      if (error) {
        throw error;
      }

      await fetchSectors();
      return true;
    } catch (error) {
      console.error('Sektorları əlavə edərkən xəta:', error);
      return false;
    }
  };

  const updateSector = async (id: string, updates: Partial<Sector>) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', id);
      if (error) {
        throw error;
      }
      setSectors(prevSectors =>
        prevSectors.map(sector => (sector.id === id ? { ...sector, ...updates } : sector))
      );
      toast.success(t('sectorUpdated'), {
        description: t('sectorUpdatedDesc')
      });
      return true;
    } catch (error: any) {
      setError(error);
      toast.error(t('sectorUpdateFailed'), {
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSector = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      if (error) {
        throw error;
      }
      setSectors(prevSectors => prevSectors.filter(sector => sector.id !== id));
      toast.success(t('sectorDeleted'), {
        description: t('sectorDeletedDesc')
      });
      return true;
    } catch (error: any) {
      setError(error);
      toast.error(t('sectorDeleteFailed'), {
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    addSectors,
    updateSector,
    deleteSector,
  };
};

export default useSectors;
