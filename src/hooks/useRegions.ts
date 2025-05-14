import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/region';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setRegions(data || []);
    } catch (err: any) {
      console.error('Regionları yükləyərkən xəta:', err);
      setError(err.message || 'Regionları yükləmək mümkün olmadı');
      toast.error(t('errorLoadingRegions'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Bu funksiyanı regionu yeniləmək üçün əlavə edirik
  const refresh = async () => {
    await fetchRegions();
  };

  // Region əlavə etmək funksiyası
  const addRegion = async (regionData: Partial<Region>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select();

      if (error) throw error;
      
      setRegions(prev => [...prev, ...(data || [])]);
      return { success: true, data };
    } catch (err: any) {
      console.error('Region əlavə edərkən xəta:', err);
      toast.error(t('errorAddingRegion'));
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Region adminini təyin etmə funksiyası
  const assignRegionAdmin = async (regionId: string, userId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('assign_region_admin', {
        p_region_id: regionId,
        p_user_id: userId
      });

      if (error) throw error;
      
      await fetchRegions(); // Yeni məlumatları yüklə
      return { success: true };
    } catch (err: any) {
      console.error('Region admini təyin edərkən xəta:', err);
      toast.error(t('errorAssigningRegionAdmin'));
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    regions,
    loading,
    error,
    fetchRegions,
    refresh,
    addRegion,
    assignRegionAdmin,
  };
};
