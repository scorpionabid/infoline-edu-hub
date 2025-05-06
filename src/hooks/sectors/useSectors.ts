
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/sector';

export function useSectors(regionId?: string) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchSectors = async (regionFilter?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('sectors')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (regionFilter) {
        query = query.eq('region_id', regionFilter);
      } else if (regionId) {
        query = query.eq('region_id', regionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setSectors(data || []);
    } catch (err: any) {
      setError(err);
      console.error("Sektorları yükləyərkən xəta:", err);
      toast({
        title: t('error'),
        description: t('errorFetchingSectors'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createSector = async (sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert(sectorData)
        .select();

      if (error) throw error;

      // Sektorlar listesini yenilə
      await fetchSectors();
      return { success: true, data };
    } catch (err: any) {
      console.error("Sektor əlavə edilərkən xəta:", err);
      return { success: false, error: err.message };
    }
  };

  const updateSector = async (id: string, sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Sektorlar listesini yenilə
      await fetchSectors();
      return { success: true, data };
    } catch (err: any) {
      console.error("Sektor yenilənərkən xəta:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteSector = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Sektorlar listesini yenilə
      await fetchSectors();
      return { success: true };
    } catch (err: any) {
      console.error("Sektor silinərkən xəta:", err);
      return { success: false, error: err.message };
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
    createSector,
    updateSector,
    deleteSector
  };
}

export default useSectors;
