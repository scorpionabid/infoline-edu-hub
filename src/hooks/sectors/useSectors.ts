
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export interface SectorFormData {
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive' | 'blocked';
}

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const fetchSectors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase.from('sectors').select('*');
      
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;

      setSectors(data || []);
    } catch (err: any) {
      console.error('Sektorları yükləyərkən xəta:', err);
      setError(err.message || 'Sektorları yükləmək mümkün olmadı');
      toast.error(t('errorLoadingSectors'));
    } finally {
      setLoading(false);
    }
  }, [t, regionId]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors, regionId]);

  const refresh = async () => {
    await fetchSectors();
  };
  
  // Sektor əlavə etmək
  const addSector = async (sectorData: SectorFormData) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sectors')
        .insert([sectorData])
        .select();
      
      if (error) throw error;
      
      await fetchSectors();
      return data;
    } catch (err: any) {
      console.error('Sektor əlavə edərkən xəta:', err);
      toast.error(t('sectorAddError'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sektoru yeniləmək
  const updateSector = async (id: string, sectorData: Partial<SectorFormData>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      await fetchSectors();
      return data;
    } catch (err: any) {
      console.error('Sektor yeniləyərkən xəta:', err);
      toast.error(t('sectorUpdateError'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sektoru silmək
  const deleteSector = async (id: string) => {
    try {
      setLoading(true);
      
      // Əvvəlcə məktəblər var mı yoxlayaq
      const { count } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', id);
      
      if (count && count > 0) {
        toast.error(t('sectorHasSchools'));
        throw new Error(t('sectorHasSchools'));
      }
      
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchSectors();
    } catch (err: any) {
      console.error('Sektor silmək istəyərkən xəta:', err);
      toast.error(t('sectorDeleteError'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Region ID-sinə görə sektorları yüklə
  const fetchSectorsByRegion = async (regionId: string) => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId)
        .order('name', { ascending: true });

      if (error) throw error;

      setSectors(data || []);
    } catch (err: any) {
      console.error('Sektorları yükləyərkən xəta:', err);
      setError(err.message || 'Sektorları yükləmək mümkün olmadı');
      toast.error(t('errorLoadingSectors'));
    } finally {
      setLoading(false);
    }
  };

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    fetchSectorsByRegion,
    addSector,
    updateSector,
    deleteSector,
    refresh
  };
};

export default useSectors;
