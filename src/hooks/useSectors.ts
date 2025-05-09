
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

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
    refresh
  };
};
