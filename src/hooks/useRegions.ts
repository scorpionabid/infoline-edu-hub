
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region, RegionFormData } from '@/types/regions';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const fetchRegions = useCallback(async (forceRefresh = false) => {
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

  // Regionlar yüklə
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Yenidən yükləmə funksiyası
  const refresh = async () => {
    await fetchRegions(true);
  };

  // Region əlavə etmə
  const addRegion = async (regionData: RegionFormData) => {
    try {
      setLoading(true);
      setError('');

      // Ad unikallığını yoxla
      const { data: existingRegions } = await supabase
        .from('regions')
        .select('name')
        .eq('name', regionData.name);

      if (existingRegions && existingRegions.length > 0) {
        return { success: false, error: t('regionNameExists') };
      }

      // Region əlavə et
      const { data, error } = await supabase
        .from('regions')
        .insert([
          {
            name: regionData.name,
            description: regionData.description,
            status: regionData.status
          }
        ])
        .select();

      if (error) throw error;

      // Uğurlu əlavə
      return { success: true, data: data && data[0] };
    } catch (err: any) {
      console.error('Region əlavə edərkən xəta:', err);
      setError(err.message || 'Region əlavə etmək mümkün olmadı');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Region yeniləmə
  const updateRegion = async (id: string, regionData: Partial<Region>) => {
    try {
      setLoading(true);
      setError('');

      // Ad dəyişibsə, unikallığı yoxla
      if (regionData.name) {
        const { data: existingRegions } = await supabase
          .from('regions')
          .select('name')
          .eq('name', regionData.name)
          .neq('id', id);

        if (existingRegions && existingRegions.length > 0) {
          return { success: false, error: t('regionNameExists') };
        }
      }

      // Regionu yenilə
      const { data, error } = await supabase
        .from('regions')
        .update({
          name: regionData.name,
          description: regionData.description,
          status: regionData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Uğurlu yeniləmə
      return { success: true, data: data && data[0] };
    } catch (err: any) {
      console.error('Regionu yeniləyərkən xəta:', err);
      setError(err.message || 'Regionu yeniləmək mümkün olmadı');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Region silmə
  const deleteRegion = async (id: string) => {
    try {
      setLoading(true);
      setError('');

      // İlk olaraq bu regionla bağlı sektorları yoxlayırıq
      const { data: sectors, error: sectorsError } = await supabase
        .from('sectors')
        .select('id')
        .eq('region_id', id);

      if (sectorsError) throw sectorsError;

      // Əgər regionda sektorlar varsa, silmək olmaz
      if (sectors && sectors.length > 0) {
        return { 
          success: false, 
          error: t('cannotDeleteRegionWithSectors', { count: sectors.length }) 
        };
      }

      // Regionu sil
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Uğurlu silmə
      return { success: true };
    } catch (err: any) {
      console.error('Regionu silməkdə xəta:', err);
      setError(err.message || 'Regionu silmək mümkün olmadı');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Region Admin təyin etmə
  const assignRegionAdmin = async (regionId: string, userId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // İstifadəçiyə region admin rolu təyin et
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'regionadmin', region_id: regionId })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Regionu yenilə
      const { error: updateError } = await supabase
        .from('regions')
        .update({ admin_id: userId })
        .eq('id', regionId);
        
      if (updateError) throw updateError;
      
      return { success: true };
    } catch (err: any) {
      console.error('Region admin təyin edərkən xəta:', err);
      setError(err.message || 'Region admin təyin etmək mümkün olmadı');
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
    updateRegion,
    deleteRegion,
    assignRegionAdmin,
    createRegion: addRegion // Uyğunluq üçün alias əlavə edirik
  };
};
