
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/region';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useRegionsData = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('regions').select('*');

      // Rol əsaslı filtrasiya
      switch (user?.role) {
        case 'superadmin':
          // SuperAdmin bütün regionları görə bilər
          break;
        case 'regionadmin':
          query = query.eq('id', user.regionId);
          break;
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      setRegions(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Regionları yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Regionları yükləyərkən xəta baş verdi');
    }
  }, [user]);

  const createRegion = useCallback(async (regionData: Omit<Region, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert(regionData)
        .select()
        .single();

      if (error) throw error;

      setRegions(prev => [...prev, data]);
      toast.success('Region uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Region yaradılarkən xəta:', err);
      toast.error('Region yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateRegion = useCallback(async (regionId: string, regionData: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', regionId)
        .select()
        .single();

      if (error) throw error;

      setRegions(prev => prev.map(region => 
        region.id === regionId ? data : region
      ));
      
      toast.success('Region uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Region yenilənərkən xəta:', err);
      toast.error('Region yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteRegion = useCallback(async (regionId: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', regionId);

      if (error) throw error;

      setRegions(prev => prev.filter(region => region.id !== regionId));
      toast.success('Region uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Region silinərkən xəta:', err);
      toast.error('Region silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return {
    regions,
    loading,
    error,
    fetchRegions,
    createRegion,
    updateRegion,
    deleteRegion
  };
};
