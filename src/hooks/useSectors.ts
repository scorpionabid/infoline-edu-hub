
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useSectorsData = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchSectors = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('sectors').select('*');

      // Rol əsaslı filtrasiya
      switch (user?.role) {
        case 'superadmin':
          // SuperAdmin bütün sektorları görə bilər
          break;
        case 'regionadmin':
          query = query.eq('region_id', user.regionId);
          break;
        case 'sectoradmin':
          query = query.eq('id', user.sectorId);
          break;
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      setSectors(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Sektorları yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Sektorları yükləyərkən xəta baş verdi');
    }
  }, [user]);

  const createSector = useCallback(async (sectorData: Omit<Sector, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert(sectorData)
        .select()
        .single();

      if (error) throw error;

      setSectors(prev => [...prev, data]);
      toast.success('Sektor uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Sektor yaradılarkən xəta:', err);
      toast.error('Sektor yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateSector = useCallback(async (sectorId: string, sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', sectorId)
        .select()
        .single();

      if (error) throw error;

      setSectors(prev => prev.map(sector => 
        sector.id === sectorId ? data : sector
      ));
      
      toast.success('Sektor uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Sektor yenilənərkən xəta:', err);
      toast.error('Sektor yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteSector = useCallback(async (sectorId: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sectorId);

      if (error) throw error;

      setSectors(prev => prev.filter(sector => sector.id !== sectorId));
      toast.success('Sektor uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Sektor silinərkən xəta:', err);
      toast.error('Sektor silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    createSector,
    updateSector,
    deleteSector
  };
};
